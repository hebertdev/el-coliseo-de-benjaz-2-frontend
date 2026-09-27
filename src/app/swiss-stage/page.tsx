export const revalidate = 30;


import type { Metadata } from "next";
import { getStageBySlugAPI, getPlayoffsStageAPI } from "services/stages";
import { SwissStageSection, PlayoffsSection } from "components/pages/Home";
import type { SwissStageData, PlayoffStageData } from "interfaces/stages";
import { DEFAULT_OPENGRAPH_IMAGE } from "constants/assets";

export const metadata: Metadata = {
  title: "Fases y Brackets Oficiales | El Coliseo de Benjaz II",
  description:
    "Sigue en tiempo real la Fase Suiza de 16 equipos y los Playoffs de eliminación directa por el trono de Dota 2 en El Coliseo de Benjaz II.",
  keywords: [
    "Dota 2",
    "Swiss Stage",
    "Fase Suiza",
    "Playoffs",
    "El Coliseo de Benjaz",
    "Brackets Dota 2",
    "Partidos en vivo",
    "Esports Perú",
  ],
  openGraph: {
    title: "Fases y Brackets Oficiales | El Coliseo de Benjaz II",
    description:
      "Tabla de posiciones de la Fase Suiza y Bracket de Playoffs de El Coliseo de Benjaz II.",
    type: "website",
    images: [
      {
        url: DEFAULT_OPENGRAPH_IMAGE,
        width: 1200,
        height: 630,
        alt: "Fases y Brackets Oficiales | El Coliseo de Benjaz II",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Fases y Brackets Oficiales | El Coliseo de Benjaz II",
    description:
      "Tabla de posiciones de la Fase Suiza y Bracket de Playoffs de El Coliseo de Benjaz II.",
    images: [DEFAULT_OPENGRAPH_IMAGE],
  },
};

export default async function SwissStagePage() {
  let swissData: SwissStageData | null = null;
  let playoffsData: PlayoffStageData | null = null;

  try {
    const [swissRes, playoffsRes] = await Promise.allSettled([
      getStageBySlugAPI("fase-suiza"),
      getPlayoffsStageAPI("playoffs"),
    ]);

    if (swissRes.status === "fulfilled" && swissRes.value) {
      swissData = swissRes.value;
    }
    if (playoffsRes.status === "fulfilled" && playoffsRes.value) {
      playoffsData = playoffsRes.value;
    }
  } catch (error) {
    console.error("Error prefetching stages data:", error);
  }

  const broadcastJsonLd = {
    "@context": "https://schema.org",
    "@type": "BroadcastEvent",
    name: "El Gran Coliseo II - Fase Suiza (En Vivo)",
    isLiveBroadcast: true,
    startDate: "2026-09-03T12:00:00Z",
    url: "https://elgrancoliseo.hebertdev.com/swiss-stage",
    video: {
      "@type": "VideoObject",
      name: "Transmisión en Vivo - El Gran Coliseo II",
      description: "Cobertura oficial de la Fase Suiza y Playoffs de Dota 2 transmitido por Benjaz",
      embedUrl: "https://player.kick.com/benjaz",
      thumbnailUrl: DEFAULT_OPENGRAPH_IMAGE,
      uploadDate: "2026-09-03T12:00:00Z",
      publication: {
        "@type": "BroadcastEvent",
        isLiveBroadcast: true,
        startDate: "2026-09-03T12:00:00Z",
      },
    },
  };

  return (
    <div className="w-full min-h-screen bg-[#120f0a] text-white selection:bg-[#00c8f8]/30 selection:text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(broadcastJsonLd) }}
      />
      <main className="flex flex-col w-full">
        <SwissStageSection initialData={swissData} />
        <PlayoffsSection initialData={playoffsData} />
      </main>
    </div>
  );
}
