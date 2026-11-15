import Starfield from "@/components/shared/Starfield";

/**
 * Fixed mission backdrop.
 * Layer 1: astronaut image (cover / center, very slow Ken Burns drift).
 * Layer 2: deep-space gradient veil at rgba(6,11,25,0.75) for glass contrast.
 * Layer 3: starfield + faint instrument grid.
 */
export default function SpaceBackdrop({ dim = 0.75 }) {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 -z-10 overflow-hidden bg-void-deep"
    >
      <div
        className="absolute inset-0 animate-drift bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/assets/astroguard-bg.png')",
          transformOrigin: "60% 40%",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(180deg, rgba(6,11,25,${dim}) 0%, rgba(3,6,15,${
            dim + 0.1
          }) 52%, rgba(6,11,25,0.96) 100%)`,
        }}
      />
      <div className="absolute inset-0 fx-grid opacity-40" />
      <div className="absolute inset-0 fx-noise" />
      <Starfield />
      {/* Vignette pulls focus to the centred glass card. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 45%, transparent 35%, rgba(3,6,15,0.72) 100%)",
        }}
      />
    </div>
  );
}
