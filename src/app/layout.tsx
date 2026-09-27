import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Chakra_Petch, Geist, Geist_Mono } from "next/font/google";
import { AxiosProvider } from "components/AxiosProvider";
import "./globals.css";
import { UserContextProvider } from "contexts/UserContext";
import { Header } from "components/Header";
import { Footer } from "components/Footer";
import { PromoBannerModal } from "components/PromoBannerModal";
import { SponsorsSection } from "components/pages/Home/SponsorsSection";
import { PanesBottomBanner } from "components/ui/PanesBottomBanner";
import {
  ColorSchemeScript,
  mantineHtmlProps,
  MantineProvider,
} from "@mantine/core";
import theme from "./theme";
import NextTopLoader from "nextjs-toploader";
import { DEFAULT_OPENGRAPH_IMAGE } from "constants/assets";
import { ENABLE_ADS } from "constants/ads";

const chakraPetch = Chakra_Petch({
  variable: "--font-chakra-petch",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://elgrancoliseo.hebertdev.com"),
  title: "El Gran Coliseo de Benjaz II | Campeonato de Dota 2",
  description:
    "Donde los mejores streamers y pro players de Dota 2 forjan sus equipos mediante un intenso draft en vivo. S/ 100,000 PEN en premios.",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
  openGraph: {
    title: "El Gran Coliseo de Benjaz II | Campeonato de Dota 2",
    description:
      "Donde los mejores streamers y pro players de Dota 2 forjan sus equipos mediante un intenso draft en vivo. S/ 100,000 PEN en premios.",
    url: "https://elgrancoliseo.hebertdev.com",
    siteName: "El Gran Coliseo de Benjaz",
    images: [
      {
        url: DEFAULT_OPENGRAPH_IMAGE,
        width: 1200,
        height: 630,
        alt: "El Gran Coliseo de Benjaz II - Sitio Web Oficial",
      },
    ],
    locale: "es_PE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "El Gran Coliseo de Benjaz II | Campeonato de Dota 2",
    description:
      "Donde los mejores streamers y pro players de Dota 2 forjan sus equipos mediante un intenso draft en vivo. S/ 100,000 PEN en premios.",
    images: [DEFAULT_OPENGRAPH_IMAGE],
    creator: "@benjazdota",
  },
};

const jsonLdData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://elgrancoliseo.hebertdev.com/#website",
      "url": "https://elgrancoliseo.hebertdev.com",
      "name": "El Gran Coliseo de Benjaz II",
      "alternateName": [
        "El Coliseo de Benjaz",
        "El Gran Coliseo",
        "Coliseo Benjaz II",
        "Coliseo Dota 2"
      ],
      "description":
        "Campeonato oficial de Dota 2 donde streamers y pro players compiten en formato Suizo y Playoffs por S/ 100,000 PEN.",
      "inLanguage": "es-PE"
    },
    {
      "@type": "SportsEvent",
      "@id": "https://elgrancoliseo.hebertdev.com/#tournament",
      "name": "El Gran Coliseo de Benjaz II",
      "sport": "Dota 2 Esports",
      "url": "https://elgrancoliseo.hebertdev.com",
      "description":
        "Torneo de Dota 2 con 16 equipos liderados por streamers y pro players en fase Suiza y Playoffs de eliminación directa.",
      "location": {
        "@type": "VirtualLocation",
        "url": "https://elgrancoliseo.hebertdev.com"
      }
    },
    {
      "@type": "ItemList",
      "@id": "https://elgrancoliseo.hebertdev.com/#sitelinks",
      "name": "Navegación Oficial de El Gran Coliseo de Benjaz",
      "itemListElement": [
        {
          "@type": "SiteNavigationElement",
          "position": 1,
          "name": "Equipos Oficiales",
          "description": "Lista de los 16 equipos, capitanes y rosters clasificados.",
          "url": "https://elgrancoliseo.hebertdev.com/teams"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 2,
          "name": "Fases y Brackets",
          "description": "Tabla de posiciones de la Fase Suiza y Brackets de Playoffs en vivo.",
          "url": "https://elgrancoliseo.hebertdev.com/swiss-stage"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 3,
          "name": "Estadísticas y Analíticas",
          "description": "Métricas de partidas, Dream Team, récords individuales y meta de héroes.",
          "url": "https://elgrancoliseo.hebertdev.com/analytics"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 4,
          "name": "Reglas y Formato",
          "description": "Formato del torneo, fases clasificatorias y protocolo de draft de capitanes.",
          "url": "https://elgrancoliseo.hebertdev.com/#formato"
        }
      ]
    }
  ]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript defaultColorScheme="dark" />
        {/* Structured Data (JSON-LD) for Search Engines & Sitelinks */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
        />
        {/* Plausible Analytics */}
        <Script
          defer
          data-domain="elgrancoliseo.hebertdev.com"
          src="/js/script.js"
        />
      </head>
      <body className={`${chakraPetch.variable} ${geistSans.variable} ${geistMono.variable} bg-[#120f0a] text-[#f3f3f5] font-sans`}>
        <NextTopLoader
          color="#00c8f8"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={true}
          easing="ease"
          speed={200}
          shadow="0 0 14px #00c8f8, 0 0 6px #00c8f8"
        />
        <AxiosProvider />
        <MantineProvider theme={theme} defaultColorScheme="dark">
        <UserContextProvider>
          <Header />
          {ENABLE_ADS && <PromoBannerModal />}
          <div className={`pt-20 ${ENABLE_ADS ? "pb-12 sm:pb-14 md:pb-16" : "pb-0"} min-h-screen flex flex-col justify-between`}>
            <div className="flex-1 w-full">
              {children}
            </div>
            <SponsorsSection />
            <Footer />
          </div>
          {ENABLE_ADS && <PanesBottomBanner />}
        </UserContextProvider>
        </MantineProvider>
      </body>
    </html>
  );
}
