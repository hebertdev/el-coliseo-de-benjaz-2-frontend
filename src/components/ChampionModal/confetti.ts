import confetti from "canvas-confetti";

/**
 * Dispara una secuencia cinematográfica de fuegos artificiales y confeti
 * con los colores emblemáticos de El Gran Coliseo (Dorado Imperial, Azul Celeste y Blanco).
 */
export function fireChampionConfetti() {
  if (typeof window === "undefined") return;

  const colors = ["#ffd700", "#f0d38f", "#d8b467", "#00c8f8", "#6cc4ff", "#ffffff"];

  // 1. Cañón Doble desde las esquinas inferiores (t=0)
  confetti({
    particleCount: 85,
    angle: 55,
    spread: 60,
    origin: { x: 0.02, y: 0.75 },
    colors,
    zIndex: 99999999,
    startVelocity: 58,
    decay: 0.92,
  });

  confetti({
    particleCount: 85,
    angle: 125,
    spread: 60,
    origin: { x: 0.98, y: 0.75 },
    colors,
    zIndex: 99999999,
    startVelocity: 58,
    decay: 0.92,
  });

  // 2. Estallido estelar central con estrellas doradas (t=250ms)
  setTimeout(() => {
    confetti({
      particleCount: 90,
      spread: 90,
      origin: { x: 0.5, y: 0.35 },
      colors: ["#ffd700", "#ffea75", "#f0d38f", "#ffffff"],
      shapes: ["star", "circle"],
      scalar: 1.25,
      zIndex: 99999999,
      startVelocity: 42,
    });
  }, 250);

  // 3. Cascada dorada y celeste desde el cenit (t=600ms)
  setTimeout(() => {
    confetti({
      particleCount: 110,
      angle: 90,
      spread: 110,
      origin: { x: 0.5, y: 0.2 },
      colors: ["#ffd700", "#00c8f8", "#ffffff", "#f0d38f"],
      zIndex: 99999999,
      startVelocity: 35,
      gravity: 0.85,
      scalar: 1.05,
    });
  }, 600);

  // 4. Salvas finales laterales (t=1100ms)
  setTimeout(() => {
    confetti({
      particleCount: 45,
      angle: 65,
      spread: 50,
      origin: { x: 0.1, y: 0.7 },
      colors: ["#ffd700", "#f0d38f", "#ffffff"],
      zIndex: 99999999,
      startVelocity: 45,
    });
    confetti({
      particleCount: 45,
      angle: 115,
      spread: 50,
      origin: { x: 0.9, y: 0.7 },
      colors: ["#00c8f8", "#6cc4ff", "#ffffff"],
      zIndex: 99999999,
      startVelocity: 45,
    });
  }, 1100);
}
