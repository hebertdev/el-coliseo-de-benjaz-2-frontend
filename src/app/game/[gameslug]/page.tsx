import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getGameBySlugAPI } from "services/games";
import { GameDetails } from "components/pages/Game/GameSlug";
import { DEFAULT_OPENGRAPH_IMAGE } from "constants/assets";
import manifest from "data/static/manifest.json";

export async function generateStaticParams() {
  return manifest.games.map((slug) => ({
    gameslug: slug,
  }));
}

interface PageProps {
  params: Promise<{ gameslug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { gameslug } = await params;
  const game = await getGameBySlugAPI(gameslug);

  if (!game) {
    return {
      title: "Juego No Encontrado | El Coliseo de Benjaz II",
      description: "El juego solicitado no existe o no está disponible.",
    };
  }

  const radName = game.radiant_team?.name || "Radiant";
  const direName = game.dire_team?.name || "Dire";
  const title = `Juego ${game.game_number}: ${radName} vs ${direName} | El Coliseo de Benjaz II`;
  const description = `Detalles del juego ${game.game_number} de la serie entre ${radName} y ${direName} en ${game.stage_name}.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: [{ url: DEFAULT_OPENGRAPH_IMAGE }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [DEFAULT_OPENGRAPH_IMAGE],
    },
  };
}

export default async function GameSlugPage({ params }: PageProps) {
  const { gameslug } = await params;
  const game = await getGameBySlugAPI(gameslug);

  if (!game) {
    notFound();
  }

  return <GameDetails game={game} />;
}