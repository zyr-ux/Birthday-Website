"use client";

import { useState, useEffect, useRef } from "react";

/* ── Types ─────────────────────────────────────────────── */
interface LeafParticle {
  id: number;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  driftX: number;
  driftY: number;
  variant: number;
}

/* ── Constants ─────────────────────────────────────────── */
const LEAF_LIFETIME = 850;   // ms before a leaf disappears
const SPAWN_DISTANCE = 48;   // px of mouse travel between leaf spawns
const MAX_LEAVES = 30;       // cap to keep DOM light
const CURSOR_SIZE = 24;      // px – rendered size of the sunflower

const LEAF_COLORS = [
  { fill: "#4E9F3D", stroke: "#2BA52E" },
  { fill: "#3A7D2C", stroke: "#1E5128" },
  { fill: "#6DBF5A", stroke: "#4E9F3D" },
];

/* ── Component ─────────────────────────────────────────── */
export default function SunflowerCursor() {
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });
  const [leaves, setLeaves] = useState<LeafParticle[]>([]);
  const [visible, setVisible] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(true); // default hidden

  const lastSpawn = useRef({ x: 0, y: 0 });
  const leafId = useRef(0);
  const visRef = useRef(false); // avoid stale closure reads

  useEffect(() => {
    // Only show on pointer (non-touch) devices
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    setIsTouchDevice(isTouch);
    if (isTouch) return;

    const onMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });

      if (!visRef.current) {
        visRef.current = true;
        setVisible(true);
      }

      // Spawn a leaf every SPAWN_DISTANCE px of travel
      const dx = e.clientX - lastSpawn.current.x;
      const dy = e.clientY - lastSpawn.current.y;
      if (Math.sqrt(dx * dx + dy * dy) < SPAWN_DISTANCE) return;

      lastSpawn.current = { x: e.clientX, y: e.clientY };
      const id = leafId.current++;

      const leaf: LeafParticle = {
        id,
        x: e.clientX,
        y: e.clientY,
        rotation: Math.random() * 360,
        scale: 0.55 + Math.random() * 0.5,
        driftX: (Math.random() - 0.5) * 44,
        driftY: 18 + Math.random() * 28,
        variant: Math.floor(Math.random() * LEAF_COLORS.length),
      };

      setLeaves((prev) => [...prev.slice(-(MAX_LEAVES - 1)), leaf]);
      setTimeout(() => setLeaves((p) => p.filter((l) => l.id !== id)), LEAF_LIFETIME);
    };

    const onLeave = () => { visRef.current = false; setVisible(false); };
    const onEnter = () => { visRef.current = true; setVisible(true); };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseenter", onEnter);
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseenter", onEnter);
    };
  }, []);

  if (isTouchDevice) return null;

  return (
    <>
      {/* Keyframes injected once */}
      <style>{`
        @keyframes sf-leaf-fall {
          0% {
            opacity: 0.85;
            transform: translate(0, 0) rotate(var(--lf-rot)) scale(var(--lf-s));
          }
          100% {
            opacity: 0;
            transform:
              translate(var(--lf-dx), var(--lf-dy))
              rotate(calc(var(--lf-rot) + 120deg))
              scale(calc(var(--lf-s) * 0.25));
          }
        }
      `}</style>

      {/* ── Leaf trail ─────────────────────────────────── */}
      {leaves.map((leaf) => {
        const c = LEAF_COLORS[leaf.variant];
        return (
          <div
            key={leaf.id}
            style={{
              position: "fixed",
              left: leaf.x - 9,
              top: leaf.y - 9,
              width: 18,
              height: 18,
              pointerEvents: "none",
              zIndex: 99998,
              animation: `sf-leaf-fall ${LEAF_LIFETIME}ms ease-out forwards`,
              "--lf-rot": `${leaf.rotation}deg`,
              "--lf-s": leaf.scale,
              "--lf-dx": `${leaf.driftX}px`,
              "--lf-dy": `${leaf.driftY}px`,
            } as React.CSSProperties}
          >
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path
                d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49
                   4.49 0 0 0 8 20c4 0 8.5-3 10-8.5 1.5-5.5 0-8.5
                   0-8.5s-2 2-5 5"
                fill={c.fill}
                stroke={c.stroke}
                strokeWidth="0.5"
              />
            </svg>
          </div>
        );
      })}

      {/* ── Sunflower cursor ───────────────────────────── */}
      <div
        style={{
          position: "fixed",
          left: mousePos.x - CURSOR_SIZE / 2,
          top: mousePos.y - CURSOR_SIZE / 2,
          width: CURSOR_SIZE,
          height: CURSOR_SIZE,
          pointerEvents: "none",
          zIndex: 99999,
          opacity: visible ? 1 : 0,
          transition: "opacity 0.15s ease",
          transform: "rotate(0deg)",
          filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.25))",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/sunflower.svg"
          alt=""
          width={CURSOR_SIZE}
          height={CURSOR_SIZE}
          draggable={false}
          style={{ display: "block" }}
        />
      </div>
    </>
  );
}
