"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, RoundedBox, Sparkles } from "@react-three/drei";
import * as THREE from "three";

/**
 * Floating open-book stacks in the brand palette. Geometry only (no textures,
 * no model files), so it adds a single lazy JS chunk and nothing else.
 */

const COLORS = ["#2563eb", "#3b82f6", "#22d3ee", "#1d4ed8", "#60a5fa", "#0ea5e9"];

function Book({ color, position, rotation, scale = 1 }: {
  color: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale?: number;
}) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* cover */}
      <RoundedBox args={[1.4, 2, 0.26]} radius={0.06} smoothness={3}>
        <meshStandardMaterial color={color} roughness={0.35} metalness={0.15} />
      </RoundedBox>
      {/* pages */}
      <mesh position={[0.05, 0, 0]}>
        <boxGeometry args={[1.3, 1.9, 0.2]} />
        <meshStandardMaterial color="#f1f5f9" roughness={0.9} />
      </mesh>
      {/* spine stripe */}
      <mesh position={[-0.66, 0, 0.135]}>
        <boxGeometry args={[0.08, 2, 0.01]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.25} />
      </mesh>
    </group>
  );
}

function OpenBook({ position }: { position: [number, number, number] }) {
  const pageMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#f8fafc", roughness: 0.8, side: THREE.DoubleSide }), []);
  const left = useMemo(() => {
    const g = new THREE.PlaneGeometry(1.5, 2, 12, 1);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i);
      p.setZ(i, Math.sin(((x + 0.75) / 1.5) * Math.PI) * 0.18);
    }
    g.computeVertexNormals();
    return g;
  }, []);
  return (
    <group position={position} rotation={[-0.5, 0.35, 0]}>
      <mesh geometry={left} material={pageMat} position={[-0.76, 0, 0]} rotation={[0, 0.28, 0]} />
      <mesh geometry={left} material={pageMat} position={[0.76, 0, 0]} rotation={[0, -0.28, 0]} />
      <RoundedBox args={[3.3, 2.15, 0.08]} radius={0.03} position={[0, 0, -0.08]}>
        <meshStandardMaterial color="#1d4ed8" roughness={0.4} />
      </RoundedBox>
    </group>
  );
}

function Rig({ children }: { children: React.ReactNode }) {
  const group = useRef<THREE.Group>(null);
  useFrame((state, dt) => {
    const g = group.current;
    if (!g) return;
    // Ease the whole scene toward the pointer for a parallax feel.
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, state.pointer.x * 0.35, 3, dt);
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, -state.pointer.y * 0.2, 3, dt);
  });
  return <group ref={group}>{children}</group>;
}

export default function HeroScene() {
  const books = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => {
        const a = (i / 7) * Math.PI * 2;
        return {
          color: COLORS[i % COLORS.length],
          position: [Math.cos(a) * 2.9, Math.sin(a) * 1.9, -0.5 - (i % 3) * 0.7] as [number, number, number],
          rotation: [0.3 * Math.sin(i), a + 0.6, 0.2 * Math.cos(i * 2)] as [number, number, number],
          scale: 0.55 + (i % 3) * 0.12,
        };
      }),
    [],
  );

  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [0, 0, 7.5], fov: 45 }}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      frameloop="always"
    >
      <ambientLight intensity={0.8} />
      <directionalLight position={[4, 5, 6]} intensity={1.6} />
      <pointLight position={[-4, -2, 3]} intensity={30} color="#22d3ee" />
      <Rig>
        <Float speed={1.4} rotationIntensity={0.3} floatIntensity={0.6}>
          <OpenBook position={[0, 0, 0.5]} />
        </Float>
        {books.map((b, i) => (
          <Float key={i} speed={1 + (i % 3) * 0.4} rotationIntensity={0.8} floatIntensity={1.2}>
            <Book {...b} />
          </Float>
        ))}
        <Sparkles count={50} scale={[9, 6, 3]} size={2.5} speed={0.3} color="#93c5fd" />
      </Rig>
    </Canvas>
  );
}
