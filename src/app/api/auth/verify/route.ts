import { getApiUrl } from "lib/config";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  
  let apiUrl: string;
  try {
    apiUrl = getApiUrl();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
  
  const res = await fetch(`${apiUrl}/token/verify/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const data = await res.json();

  if (!res.ok) {
    return NextResponse.json(
      data, 
      { status: res.status }
    );
  }

  return NextResponse.json(data, { status: 200 });
}
