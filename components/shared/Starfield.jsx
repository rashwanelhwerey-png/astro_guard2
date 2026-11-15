"use client";

import { useMemo } from "react";

/**
 * Deterministic starfield.
 * Positions come from a seeded PRNG so the sky is identical on server and client
 * (no hydration mismatch) yet still reads as a rich parallax field.
 */
function seededRandom(seed) {
  let state = seed >>> 0 || 1;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return ((state >>> 0) % 10000) / 10000;
  };
}

export default function Starfield({ count = 90, seed = 20261114, className = "" }) {
  const stars = useMemo(() => {
    const next = seededRandom(seed);
    return Array.from({ length: count }, (_, index) => ({
      id: index,
      x: next() * 100,
      y: next() * 100,
      size: 0.6 + next() * 1.7,
      opacity: 0.25 + next() * 0.6,
      delay: next() * 6,
      duration: 3 + next() * 5,
    }));
  }, [count, seed]);

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      {stars.map((star) => (
        <span
          key={star.id}
          className="absolute rounded-full bg-white animate-flicker"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            opacity: star.opacity,
            animationDelay: `${star.delay}s`,
            animationDuration: `${star.duration}s`,
            boxShadow: star.size > 1.8 ? "0 0 6px rgba(0,240,255,0.8)" : undefined,
          }}
        />
      ))}
    </div>
  );
}
