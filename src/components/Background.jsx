import React, { useEffect, useRef } from "react";
import { eventConfig } from "../eventConfig";

export default function Background() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId;
    let particles = [];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    // Create particles
    const particleCount = Math.min(100, Math.floor((canvas.width * canvas.height) / 15000));
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 1.5 + 0.5,
        speedX: (Math.random() - 0.5) * 0.2,
        speedY: -Math.random() * 0.6 - 0.2, // always drift upwards
        alpha: Math.random() * 0.7 + 0.1,
        fadeSpeed: Math.random() * 0.005 + 0.002,
        growing: Math.random() > 0.5,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        // Draw particle (gold star dust)
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(212, 175, 55, ${p.alpha})`;
        ctx.shadowBlur = 10;
        ctx.shadowColor = "#d4af37";
        ctx.fill();

        // Update position
        p.x += p.speedX;
        p.y += p.speedY;

        // Twinkle effect (alpha pulsing)
        if (p.growing) {
          p.alpha += p.fadeSpeed;
          if (p.alpha >= 0.8) p.growing = false;
        } else {
          p.alpha -= p.fadeSpeed;
          if (p.alpha <= 0.1) p.growing = true;
        }

        // Reset particle if it drifts off the top or sides
        if (p.y < 0) {
          p.y = canvas.height;
          p.x = Math.random() * canvas.width;
          p.alpha = Math.random() * 0.5 + 0.1;
        }
        if (p.x < 0 || p.x > canvas.width) {
          p.x = Math.random() * canvas.width;
        }
      });

      // Clear shadow properties for performance
      ctx.shadowBlur = 0;

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full -z-50 overflow-hidden bg-black">
      {/* College Background Image with Blur */}
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-center transition-all duration-1000 scale-[1.03]"
        style={{ 
          backgroundImage: `url(${eventConfig.photo})`,
          filter: "blur(10px) brightness(0.22) contrast(1.1)",
        }}
      />

      {/* Cinematic Dark Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-[#050508]/85 to-[#030303]/90" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.85)_100%)]" />

      {/* Interactive Light Beams / Glowing Orbs */}
      <div className="absolute top-[10%] left-[15%] w-[45vw] h-[45vw] rounded-full radial-beam opacity-80 mix-blend-screen animate-pulse" style={{ animationDuration: "12s" }} />
      <div className="absolute bottom-[15%] right-[10%] w-[50vw] h-[50vw] rounded-full radial-beam opacity-60 mix-blend-screen animate-pulse" style={{ animationDuration: "18s" }} />
      <div className="absolute top-[40%] right-[25%] w-[35vw] h-[35vw] rounded-full bg-gradient-to-tr from-purple-900/10 via-amber-500/5 to-transparent filter blur-3xl opacity-50 mix-blend-screen" />

      {/* Floating Canvas Particles */}
      <canvas ref={canvasRef} className="particles-canvas" />
    </div>
  );
}
