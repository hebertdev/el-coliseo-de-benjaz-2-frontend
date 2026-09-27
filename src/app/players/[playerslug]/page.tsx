import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPlayerByNicknameAPI, getPlayerMatchesAPI } from "services/players";
import { PlayerDetails } from "components/pages/Players";
import { DEFAULT_OPENGRAPH_IMAGE } from "constants/assets";
import manifest from "data/static/manifest.json";

export async function generateStaticParams() {
  return manifest.players.map((slug) => ({
    playerslug: slug,
  }));
}

interface PageProps {
  params: Promise<{ playerslug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { playerslug } = await params;
  const player = await getPlayerByNicknameAPI(playerslug).catch(() => null);

  if (!player) {
    return {
      title: "Gladiador No Encontrado | El Coliseo de Benjaz II",
      description: "El jugador solicitado no está registrado en el torneo.",
      openGraph: {
        images: [{ url: DEFAULT_OPENGRAPH_IMAGE }],
      },
      twitter: {
        images: [DEFAULT_OPENGRAPH_IMAGE],
      },
    };
  }

  const activeMembership = player.memberships.find((m) => m.is_active) || player.memberships[0];
  const teamText = activeMembership?.team ? `de ${activeMembership.team.name}` : "";
  const roleText = activeMembership?.position_display || activeMembership?.role_display || "Gladiador";
  const title = `${player.nickname} (${roleText}) ${teamText} | El Coliseo de Benjaz II`;
  const description = player.bio || `Perfil oficial, rol competitivo y estadísticas de ${player.nickname} en El Coliseo de Benjaz II.`;
  const ogImage = player.avatar || DEFAULT_OPENGRAPH_IMAGE;

  return {
    title,
    description,
    keywords: [
      player.nickname,
      player.country,
      player.region,
      "Dota 2",
      "Gladiador",
      "El Coliseo de Benjaz",
      roleText,
    ],
    openGraph: {
      title,
      description,
      type: "profile",
      images: [{ url: ogImage, alt: player.nickname }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function PlayerDetailsPage({ params }: PageProps) {
  const { playerslug } = await params;
  const [player, matchHistory] = await Promise.all([
    getPlayerByNicknameAPI(playerslug).catch(() => null),
    getPlayerMatchesAPI(playerslug).catch(() => null),
  ]);

  if (!player) {
    notFound();
  }

  return <PlayerDetails player={player} matchHistory={matchHistory} />;
}