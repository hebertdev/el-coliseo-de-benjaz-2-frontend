export const revalidate = 30;

import type { Metadata } from "next";
import { getTeamsAPI } from "services/teams";
import { getStageBySlugAPI } from "services/stages";
import { Teams } from "components/pages/Teams";
import type { TeamRosterMemberData } from "interfaces/teams";
import { DEFAULT_OPENGRAPH_IMAGE } from "constants/assets";

export const metadata: Metadata = {
  title: "Equipos Oficiales | El Coliseo de Benjaz II",
  description:
    "Descubre los 16 equipos de Dota 2 y gladiadores clasificados que lucharán por el campeonato y el pozo de El Coliseo de Benjaz II.",
  keywords: [
    "Dota 2",
    "El Coliseo de Benjaz",
    "Torneo Dota 2",
    "Equipos Dota 2",
    "Rosters",
    "Esports Perú",
    "Gladiadores",
  ],
  openGraph: {
    title: "Equipos Oficiales | El Coliseo de Benjaz II",
    description:
      "Los 16 equipos de Dota 2 compitiendo en El Coliseo de Benjaz II.",
    type: "website",
    images: [
      {
        url: DEFAULT_OPENGRAPH_IMAGE,
        width: 1200,
        height: 630,
        alt: "Equipos Oficiales | El Coliseo de Benjaz II",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Equipos Oficiales | El Coliseo de Benjaz II",
    description:
      "Los 16 equipos de Dota 2 compitiendo en El Coliseo de Benjaz II.",
    images: [DEFAULT_OPENGRAPH_IMAGE],
  },
};

export default async function TeamsPage() {
  const [teamsData, swissData] = await Promise.allSettled([
    getTeamsAPI("el-gran-coliseo-ii", true),
    getStageBySlugAPI("fase-suiza"),
  ]);

  const teams =
    teamsData.status === "fulfilled" && teamsData.value?.results
      ? teamsData.value.results
      : [];
  const standings =
    swissData.status === "fulfilled" && swissData.value?.standings
      ? swissData.value.standings
      : [];

  const rosters: Record<string, TeamRosterMemberData[]> = {};
  teams.forEach((t) => {
    if (t.roster) {
      rosters[t.slug] = t.roster;
    }
  });

  return (
    <Teams
      initialTeams={teams}
      initialRosters={rosters}
      initialStandings={standings}
    />
  );
}