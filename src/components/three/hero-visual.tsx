"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const HeroScene = dynamic(() => import("./hero-scene"), { ssr: false });

/**
 * Loads the WebGL scene only on larger screens with WebGL and without
 * reduced-motion, after the page is idle. Everyone else gets the CSS fallback.
 */
export function HeroVisual() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const wide = window.matchMedia("(min-width: 768px)").matches;
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const gl = (() => {
      try {
        return !!document.createElement("canvas").getContext("webgl2");
      } catch {
        return false;
      }
    })();
    if (!wide || calm || !gl) return;
    const start = () => setEnabled(true);
    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(start, { timeout: 1500 });
      return () => window.cancelIdleCallback(id);
    }
    const t = setTimeout(start, 600);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="relative size-full">
      <Fallback dim={enabled} />
      {enabled && (
        <div className="absolute inset-0 animate-[fadeIn_1s_ease-out]">
          <HeroScene />
        </div>
      )}
    </div>
  );
}

function Fallback({ dim }: { dim: boolean }) {
  return (
    <div
      aria-hidden
      className={`absolute inset-0 grid place-items-center transition-opacity duration-700 ${dim ? "opacity-0" : "opacity-100"}`}
    >
      <div className="preserve-3d relative h-64 w-48 scale-[.7] [perspective:900px] sm:scale-90 md:scale-100">
        {[0, 1, 2].map((i) => (
          // Outer div holds the pose; inner div floats (the float keyframes own `transform`).
          <div
            key={i}
            className="absolute inset-0"
            style={{
              transform: `translateX(${(i - 1) * 70}px) rotateY(${-28 + i * 20}deg) rotateZ(${-10 + i * 10}deg)`,
              zIndex: 3 - Math.abs(i - 1),
            }}
          >
            <div
              className="size-full animate-float rounded-xl bg-gradient-to-br from-primary to-accent shadow-2xl shadow-primary/40 ring-1 ring-white/20"
              style={{ animationDelay: `${i * 0.6}s`, opacity: i === 1 ? 1 : 0.75 }}
            >
              <div className="m-4 h-2 w-1/2 rounded-full bg-white/50" />
              <div className="mx-4 h-2 w-1/3 rounded-full bg-white/30" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
