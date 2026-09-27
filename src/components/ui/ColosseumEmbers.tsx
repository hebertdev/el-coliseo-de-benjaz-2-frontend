"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  opacity: number;
  maxOpacity: number;
  color: string;
  fadeSpeed: number;
  isFadingOut: boolean;
}

export function ColosseumEmbers({ count = 35 }: { count?: number }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener("resize", handleResize);

    const colors = [
      "rgba(0, 200, 248,",   // Cyan Coliseo
      "rgba(46, 157, 240,",  // Blue Imperial
      "rgba(240, 211, 143,", // Gold Imperial
      "rgba(250, 204, 21,",  // Yellow Flame
      "rgba(255, 115, 115,", // Red Ember
    ];

    const createParticle = (): Particle => {
      const maxOpacity = Math.random() * 0.5 + 0.35;
      return {
        x: Math.random() * width,
        y: height + Math.random() * 20,
        size: Math.random() * 2.5 + 1.0,
        speedY: Math.random() * 0.75 + 0.3,
        speedX: (Math.random() - 0.5) * 0.45,
        opacity: 0,
        maxOpacity,
        color: colors[Math.floor(Math.random() * colors.length)],
        fadeSpeed: Math.random() * 0.01 + 0.005,
        isFadingOut: false,
      };
    };

    const particles: Particle[] = Array.from({ length: count }, () => {
      const p = createParticle();
      p.y = Math.random() * height;
      p.opacity = Math.random() * p.maxOpacity;
      return p;
    });

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Opacity oscillation
        if (!p.isFadingOut) {
          p.opacity += p.fadeSpeed;
          if (p.opacity >= p.maxOpacity) {
            p.isFadingOut = true;
          }
        } else {
          p.opacity -= p.fadeSpeed;
          if (p.opacity <= 0) {
            particles[i] = createParticle();
            continue;
          }
        }

        p.y -= p.speedY;
        p.x += p.speedX;

        // Reset if went off screen
        if (p.y < -10 || p.x < -10 || p.x > width + 10) {
          particles[i] = createParticle();
          continue;
        }

        // Draw glowing ember
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color} ${p.opacity})`;
        ctx.shadowBlur = 10;
        ctx.shadowColor = `${p.color} 0.85)`;
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [count]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-1 h-full w-full opacity-90"
    />
  );
}
