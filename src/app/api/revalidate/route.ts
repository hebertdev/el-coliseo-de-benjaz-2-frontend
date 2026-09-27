import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const secret =
      request.headers.get("x-revalidate-secret") ||
      request.nextUrl.searchParams.get("secret");

    const expectedSecret =
      process.env.REVALIDATION_SECRET || "coliseo_revalidation_secret_key_2026";

    if (!secret || secret !== expectedSecret) {
      return NextResponse.json(
        {
          success: false,
          message: "Token de revalidación inválido o no proporcionado.",
        },
        { status: 401 }
      );
    }

    let body: { paths?: string[]; tags?: string[] } = {};
    try {
      body = await request.json();
    } catch {
      // Body is optional
    }

    const defaultPaths = [
      "/",
      "/swiss-stage",
      "/teams",
      "/analytics",
      "/players",
    ];

    const pathsToRevalidate =
      Array.isArray(body.paths) && body.paths.length > 0
        ? body.paths
        : defaultPaths;

    for (const path of pathsToRevalidate) {
      try {
        revalidatePath(path, "page");
      } catch (pathErr) {
        console.warn(`[Revalidate] Error revalidating path ${path}:`, pathErr);
      }
    }

    // Also revalidate root, players, and teams layouts to refresh any dynamic subroutes
    for (const layoutPath of ["/", "/players", "/teams"]) {
      try {
        revalidatePath(layoutPath, "layout");
      } catch (layoutErr) {
        console.warn(`[Revalidate] Error revalidating layout ${layoutPath}:`, layoutErr);
      }
    }

    if (Array.isArray(body.tags) && body.tags.length > 0) {
      for (const tag of body.tags) {
        try {
          revalidateTag(tag, { expire: 0 });
        } catch (tagErr) {
          console.warn(`[Revalidate] Error revalidating tag ${tag}:`, tagErr);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Caché de Next.js revalidada exitosamente.",
      revalidatedPaths: pathsToRevalidate,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Revalidate] Unexpected error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Error inesperado durante la revalidación.",
      },
      { status: 500 }
    );
  }
}
