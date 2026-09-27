import { createTheme } from "@mantine/core";

const theme = createTheme({
  primaryColor: "brand",
  defaultRadius: "sm",
  headings: {
    fontFamily: "var(--font-chakra-petch), sans-serif",
  },
  breakpoints: {
    xs: "36em",
    sm: "48em",
    md: "62em",
    lg: "75em",
    xl: "88em",
  },
  colors: {
    // Azul 1XBET (#2e9df0 / #6cc4ff) - Acento general
    brand: [
      "#eef8ff",
      "#d8eeff",
      "#b3ddff",
      "#85c8ff",
      "#6cc4ff",
      "#2e9df0",
      "#137ed1",
      "#0c64a8",
      "#0c548c",
      "#0f4773",
    ],
    // Dorado (#d8b467 / #f0d38f) - Solo premios, campeón, trono, corona, podio
    gold: [
      "#fdf9ed",
      "#f9f0d4",
      "#f4e0a7",
      "#f0d38f",
      "#e5be6b",
      "#d8b467",
      "#b89246",
      "#937133",
      "#785b2b",
      "#644a26",
    ],
    // Rojo Sangre (#e51b24 / #b91c1c) - Eliminados, advertencias, acciones destructivas
    blood: [
      "#ffeaeb",
      "#ffd5d7",
      "#fbaab0",
      "#f5747f",
      "#ee4656",
      "#e51b24",
      "#c71328",
      "#a41024",
      "#871223",
      "#711322",
    ],
    // Fondo Piedra / Templo Oscuro (#120f0a / #1c1712)
    temple: [
      "#f6f4f2",
      "#e5e0db",
      "#cbc0b5",
      "#ad9c8c",
      "#7e6d5e",
      "#4a3f36",
      "#332b23",
      "#241e17",
      "#1c1712",
      "#120f0a",
    ],
  },
});

export default theme;
