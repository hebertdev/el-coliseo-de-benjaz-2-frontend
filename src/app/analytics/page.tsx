export const revalidate = 60;


import type { Metadata } from "next";
import { getTournamentAnalyticsAPI } from "services/analytics";
import { Analytics } from "components/pages/Analytics";
import { DEFAULT_OPENGRAPH_IMAGE } from "constants/assets";
import { FALLBACK_TOURNAMENT_ANALYTICS } from "constants/analyticsMock";
import { deepNormalizeMediaUrls } from "lib/config";

export const metadata: Metadata = {
  title: "Estadísticas & Analíticas Oficiales | El Coliseo de Benjaz II",
  description:
    "Métricas y analíticas oficiales de El Gran Coliseo II: Dream Team, récords del torneo, líderes individuales, ranking por posición y meta de héroes de Dota 2.",
  keywords: [
    "Dota 2",
    "Estadísticas Dota 2",
    "Analytics Dota 2",
    "Dream Team Dota 2",
    "El Coliseo de Benjaz",
    "El Gran Coliseo II",
    "Récords Dota 2",
    "Esports Perú",
    "KDA Dota 2",
    "GPM Dota 2",
  ],
  openGraph: {
    title: "Estadísticas & Analíticas Oficiales | El Coliseo de Benjaz II",
    description:
      "Explora el Dream Team, líderes individuales, récords de partidas y estadísticas por posición en El Coliseo de Benjaz II.",
    type: "website",
    images: [
      {
        url: DEFAULT_OPENGRAPH_IMAGE,
        width: 1200,
        height: 630,
        alt: "Estadísticas & Analíticas | El Coliseo de Benjaz II",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Estadísticas & Analíticas Oficiales | El Coliseo de Benjaz II",
    description:
      "Explora el Dream Team, líderes individuales, récords de partidas y estadísticas por posición en El Coliseo de Benjaz II.",
    images: [DEFAULT_OPENGRAPH_IMAGE],
  },
};

export default async function AnalyticsPage() {
  let analyticsData = deepNormalizeMediaUrls(FALLBACK_TOURNAMENT_ANALYTICS);

  try {
    const res = await getTournamentAnalyticsAPI("el-gran-coliseo-ii");
    if (res && res.tournament && res.summary) {
      analyticsData = res;
    }
  } catch (error) {
    console.error("Error loading analytics data:", error);
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    name: "El Gran Coliseo II - Estadísticas y Analíticas",
    description:
      "Métricas, quinteto ideal y récords oficiales de Dota 2 en El Coliseo de Benjaz II",
    url: "https://elgrancoliseo.hebertdev.com/analytics",
    image: DEFAULT_OPENGRAPH_IMAGE,
    organizer: {
      "@type": "Organization",
      name: "El Coliseo de Benjaz",
      url: "https://elgrancoliseo.hebertdev.com",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Analytics initialData={analyticsData} />
    </>
  );
}
