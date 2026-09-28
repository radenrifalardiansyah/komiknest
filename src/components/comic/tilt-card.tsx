"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * Pointer-driven 3D tilt with a moving highlight. Pure CSS transforms,
 * no WebGL, so it's cheap enough for every card in a grid.
 */
export function TiltCard({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    el.style.setProperty("--rx", `${(0.5 - y) * 14}deg`);
    el.style.setProperty("--ry", `${(x - 0.5) * 14}deg`);
    el.style.setProperty("--mx", `${x * 100}%`);
    el.style.setProperty("--my", `${y * 100}%`);
  };

  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  };

  return (
    <div className="[perspective:900px]">
      <div
        ref={ref}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        className={cn(
          "preserve-3d group/tilt relative transition-transform duration-300 ease-out will-change-transform",
          "[transform:rotateX(var(--rx,0deg))_rotateY(var(--ry,0deg))]",
          className,
        )}
      >
        {children}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover/tilt:opacity-100"
          style={{
            background:
              "radial-gradient(circle at var(--mx,50%) var(--my,50%), rgb(255 255 255 / .28), transparent 55%)",
          }}
        />
      </div>
    </div>
  );
}
