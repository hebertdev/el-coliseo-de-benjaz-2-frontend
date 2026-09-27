import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTeamBySlugAPI, getTeamRosterAPI, getTeamMatchesAPI } from "services/teams";
import { TeamDetails } from "components/pages/Teams/TeamDeatils";
import { DEFAULT_OPENGRAPH_IMAGE } from "constants/assets";
import manifest from "data/static/manifest.json";

export async function generateStaticParams() {
  return manifest.teams.map((team) => ({
    teamslug: team.slug,
  }));
}

interface PageProps {
  params: Promise<{ teamslug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { teamslug } = await params;
  const team = await getTeamBySlugAPI(teamslug);

  if (!team) {
    return {
      title: "Equipo No Encontrado | El Coliseo de Benjaz II",
      description: "El equipo solicitado no existe o no está registrado en el torneo.",
      openGraph: {
        images: [{ url: DEFAULT_OPENGRAPH_IMAGE }],
      },
      twitter: {
        images: [DEFAULT_OPENGRAPH_IMAGE],
      },
    };
  }

  const region = team.region_display || team.region || "Global";
  const title = `${team.name} [${team.tag}] | El Coliseo de Benjaz II`;
  const description = `Conoce la alineación oficial, estadísticas y gladiadores de ${team.name} (${region}) en El Coliseo de Benjaz II.`;
  const ogImage = team.logo || DEFAULT_OPENGRAPH_IMAGE;

  return {
    title,
    description,
    keywords: [
      team.name,
      team.tag,
      "Dota 2",
      "El Coliseo de Benjaz",
      "Roster",
      region,
      "Esports",
    ],
    openGraph: {
      title,
      description,
      type: "website",
      images: [{ url: ogImage, alt: team.name }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function TeamDetailsPage({ params }: PageProps) {
  const { teamslug } = await params;
  const [team, roster, seriesHistory] = await Promise.all([
    getTeamBySlugAPI(teamslug),
    getTeamRosterAPI(teamslug).catch(() => []),
    getTeamMatchesAPI(teamslug).catch(() => null),
  ]);

  if (!team) {
    notFound();
  }

  return <TeamDetails team={team} roster={roster} seriesHistory={seriesHistory} />;
}