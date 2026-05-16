"use client";

import { useEffect, useRef, useCallback } from "react";

/* ============================================================
   DESIGN TOKENS — export for use across the app
   ============================================================ */
export const KOGANE_TOKENS = {
  void:     "#050505",
  charcoal: "#0B0B0F",
  blood:    "#8B0000",
  crimson:  "#DC2626",
  deepRed:  "#450A0A",
  text:     "#E5E7EB",
  muted:    "#6B7280",
};

/* ============================================================
   CONSTANTS
   ============================================================ */
const MOBILE_BREAKPOINT = 768;

function checkMobile() {
  return typeof window !== "undefined" && window.innerWidth < MOBILE_BREAKPOINT;
}

/* ============================================================
   KOGANE PANEL — named export
   ============================================================ */
export function KoganePanel({ children, className = "", style = {}, ...props }) {
  return (
    <div className={`kogane-panel ${className}`} style={style} {...props}>
      {children}
    </div>
  );
}

/* ============================================================
   PARTICLE FACTORY HELPERS
   ============================================================ */

function makeAsh(canvas) {
  return {
    type:  "ash",
    x:     Math.random() * canvas.width,
    y:     Math.random() * canvas.height,
    r:     1 + Math.random(),                         // 1–2 px
    vx:    (Math.random() - 0.5) * 0.2,              // ±0.1
    vy:    -(0.1 + Math.random() * 0.2),              // -0.1 → -0.3
    color: Math.random() > 0.5
      ? "rgba(139,0,0,0.4)"
      : "rgba(107,114,128,0.35)",
  };
}

function makeEmber(canvas, speedMult = 1) {
  return {
    type:    "ember",
    x:       Math.random() * canvas.width,
    y:       canvas.height + Math.random() * 40,
    r:       1.5 + Math.random() * 1.5,               // 1.5–3 px
    vy:      -(0.2 + Math.random() * 0.3) * speedMult,
    freq:    0.5 + Math.random() * 1.5,
    flicker: 0.5 + Math.random() * 1.5,
  };
}

function makeSpark(canvas, activateChance = 0.002) {
  return {
    type:           "spark",
    x:              Math.random() * canvas.width,
    y:              Math.random() * canvas.height,
    vx:             0,
    vy:             0,
    life:           0,
    maxLife:        40 + Math.floor(Math.random() * 40), // 40–80 frames
    active:         false,
    activateChance,
  };
}

/* ============================================================
   ATMOSPHERE ENGINE — default export
   ============================================================ */
export default function AtmosphereEngine({
  children,
  dangerMode  = false,
  centuryMode = false,
}) {
  const canvasRef  = useRef(null);
  const rafRef     = useRef(null);
  const stateRef   = useRef(null);

  /* ----------------------------------------------------------
     Build / rebuild particle pool
  ---------------------------------------------------------- */
  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    const mobile       = checkMobile();
    const ashCount     = mobile ? 40 : 70;
    const baseEmbers   = mobile ? 15 : 25;
    const emberCount   = dangerMode ? baseEmbers * 2 : baseEmbers;
    const sparkCount   = mobile ? 3 : 6;
    const emberSpeed   = centuryMode ? 1.5 : 1;
    const sparkChance  = centuryMode ? 0.006 : 0.002;

    const ctx = canvas.getContext("2d");

    stateRef.current = {
      ctx,
      canvas,
      time: 0,
      particles: [
        ...Array.from({ length: ashCount },   () => makeAsh(canvas)),
        ...Array.from({ length: emberCount }, () => makeEmber(canvas, emberSpeed)),
        ...Array.from({ length: sparkCount }, () => makeSpark(canvas, sparkChance)),
      ],
    };
  }, [dangerMode, centuryMode]);

  /* ----------------------------------------------------------
     rAF draw loop
  ---------------------------------------------------------- */
  const drawFrame = useCallback(() => {
    const s = stateRef.current;
    if (!s) return;

    const { ctx, canvas, particles } = s;
    s.time += 1;
    const t = s.time;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const p of particles) {
      /* ----- ASH ----- */
      if (p.type === "ash") {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0)            p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y + p.r < 0) {
          p.y = canvas.height + p.r;
          p.x = Math.random() * canvas.width;
        }
        ctx.save();
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        continue;
      }

      /* ----- EMBER ----- */
      if (p.type === "ember") {
        p.x += Math.sin(t * 0.01 * p.freq) * 0.3;   // horizontal sway
        p.y += p.vy;
        if (p.x < 0)            p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y + p.r < 0) {
          p.y = canvas.height + p.r;
          p.x = Math.random() * canvas.width;
        }
        // Flicker: sin → [0.3, 0.8]
        const alpha = 0.3 + ((Math.sin(t * 0.05 * p.flicker) + 1) / 2) * 0.5;
        ctx.save();
        ctx.shadowColor = "#DC2626";
        ctx.shadowBlur  = 6;
        ctx.fillStyle   = `rgba(220,38,38,${alpha.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        continue;
      }

      /* ----- SPARK ----- */
      if (p.type === "spark") {
        if (!p.active) {
          if (Math.random() < p.activateChance) {
            p.active  = true;
            p.life    = 0;
            p.x       = Math.random() * canvas.width;
            p.y       = Math.random() * canvas.height;
            const ang = Math.random() * Math.PI * 2;
            const spd = 3 + Math.random() * 3;
            p.vx = Math.cos(ang) * spd;
            p.vy = Math.sin(ang) * spd;
          }
          continue; // invisible when idle
        }

        p.x    += p.vx;
        p.y    += p.vy;
        p.life += 1;

        const lifeAlpha = (1 - p.life / p.maxLife) * 0.9;
        ctx.save();
        ctx.shadowColor = "#DC2626";
        ctx.shadowBlur  = 12;
        ctx.fillStyle   = `rgba(220,38,38,${lifeAlpha.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        if (p.life >= p.maxLife) {
          p.active = false;
          p.x = Math.random() * canvas.width;
          p.y = Math.random() * canvas.height;
        }
      }
    }

    rafRef.current = requestAnimationFrame(drawFrame);
  }, []);

  /* ----------------------------------------------------------
     Visibility-change: pause when tab is hidden
  ---------------------------------------------------------- */
  useEffect(() => {
    const onVis = () => {
      if (document.hidden) {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
      } else {
        rafRef.current = requestAnimationFrame(drawFrame);
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [drawFrame]);

  /* ----------------------------------------------------------
     Init + resize (debounced 150ms)
  ---------------------------------------------------------- */
  useEffect(() => {
    initCanvas();
    rafRef.current = requestAnimationFrame(drawFrame);

    let timer = null;
    const onResize = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        initCanvas();
        rafRef.current = requestAnimationFrame(drawFrame);
      }, 150);
    };

    window.addEventListener("resize", onResize);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      clearTimeout(timer);
      window.removeEventListener("resize", onResize);
    };
  }, [initCanvas, drawFrame]);

  /* ----------------------------------------------------------
     Derived CSS animation values from props
  ---------------------------------------------------------- */

  // Layer-2: opacity animation
  let gridAnimation;
  if (dangerMode) {
    gridAnimation = `gridPulseDanger ${centuryMode ? "2s" : "4s"} ease-in-out infinite`;
  } else {
    gridAnimation = `gridPulse ${centuryMode ? "4s" : "8s"} ease-in-out infinite`;
  }

  // Layer-2 base opacity (what it starts at)
  const gridBaseOpacity = dangerMode ? 0.18 : 0.07;

  // Scan wave: different keyframe names for different intervals
  const scanKeyframe = centuryMode ? "scanWave3s" : "scanWave10s";
  const scanTotalDur = centuryMode ? "3s" : "10s";

  // Layer-1: void gradient — darker bleeds in dangerMode
  const voidGradient = dangerMode
    ? `radial-gradient(ellipse at 50% 60%, #050505 0%, #0B0B0F 45%, #450A0A 75%, #2a0000 100%)`
    : `radial-gradient(ellipse at 50% 50%, #050505 0%, #0B0B0F 55%, rgba(69,10,10,0.5) 80%, rgba(69,10,10,0.25) 100%)`;

  // Layer-4: fog opacity
  const fogMult  = centuryMode ? 2 : dangerMode ? 1.4 : 1;
  const fog1Base = Math.min(1, 0.4 * fogMult);
  const fog2Base = Math.min(1, 0.4 * fogMult);

  return (
    <div
      className="fixed inset-0 overflow-hidden"
      style={{ width: "100vw", height: "100vh" }}
    >
      {/* ================================================
          LAYER 1 — Void Gradient                   z-0
      ================================================ */}
      <div
        aria-hidden="true"
        style={{
          position:    "absolute",
          inset:       0,
          zIndex:      0,
          background:  voidGradient,
          pointerEvents: "none",
        }}
      />

      {/* ================================================
          LAYER 2 — Hex Barrier Grid                z-1
      ================================================ */}
      <div
        aria-hidden="true"
        style={{
          position:      "absolute",
          inset:         0,
          zIndex:        1,
          overflow:      "hidden",
          opacity:       gridBaseOpacity,
          animation:     gridAnimation,
          willChange:    "opacity",
          pointerEvents: "none",
        }}
      >
        {/* SVG hex grid — drifts slowly */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          style={{
            position:  "absolute",
            top:       "-20px",
            left:      "-20px",
            width:     "calc(100% + 60px)",
            height:    "calc(100% + 60px)",
            animation: "hexDrift 60s linear infinite",
            willChange: "transform",
          }}
        >
          <defs>
            {/*
              Pointy-top hexagon tiling:
              hex radius r = 40px
              width  between cols = r * sqrt(3)  ≈ 69.28
              height between rows = r * 1.5      = 60
              tile size: 2 * 69.28 × 120
            */}
            <pattern
              id="koganeHex"
              x="0"
              y="0"
              width="138.56"
              height="120"
              patternUnits="userSpaceOnUse"
            >
              {/* Hex 1 — center */}
              <polygon
                points="69.28,0 104.28,20 104.28,60 69.28,80 34.28,60 34.28,20"
                fill="none"
                stroke="rgba(139,0,0,0.12)"
                strokeWidth="0.5"
              />
              {/* Hex 2 — offset right-bottom (tile bridging) */}
              <polygon
                points="138.56,60 173.56,80 173.56,120 138.56,140 103.56,120 103.56,80"
                fill="none"
                stroke="rgba(139,0,0,0.12)"
                strokeWidth="0.5"
              />
              {/* Hex 3 — offset left-bottom (tile bridging) */}
              <polygon
                points="0,60 35,80 35,120 0,140 -35,120 -35,80"
                fill="none"
                stroke="rgba(139,0,0,0.12)"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#koganeHex)" />
        </svg>

        {/* Scan line — sweeps top→bottom on fixed interval */}
        <div
          style={{
            position:      "absolute",
            left:          0,
            top:           0,
            width:         "100%",
            height:        "2px",
            background:    "rgba(220,38,38,0.06)",
            animation:     `${scanKeyframe} ${scanTotalDur} linear infinite`,
            willChange:    "transform, opacity",
            pointerEvents: "none",
          }}
        />
      </div>

      {/* ================================================
          LAYER 3 — Particle Canvas                 z-2
      ================================================ */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{
          position:      "absolute",
          inset:         0,
          zIndex:        2,
          pointerEvents: "none",
          willChange:    "transform",
          display:       "block",
        }}
      />

      {/* ================================================
          LAYER 4 — Fog Overlay                     z-3
      ================================================ */}
      <div
        aria-hidden="true"
        style={{
          position:      "absolute",
          inset:         0,
          zIndex:        3,
          pointerEvents: "none",
        }}
      >
        {/* Bottom-left fog blob */}
        <div
          style={{
            position:  "absolute",
            bottom:    0,
            left:      0,
            width:     "60vw",
            height:    "40vh",
            background:
              "radial-gradient(ellipse at bottom left, rgba(139,0,0,0.06) 0%, transparent 70%)",
            animation:  "fogPulse12 12s ease-in-out infinite",
            opacity:    fog1Base,
            willChange: "opacity",
          }}
        />
        {/* Bottom-right fog blob */}
        <div
          style={{
            position:       "absolute",
            bottom:         0,
            right:          0,
            width:          "60vw",
            height:         "40vh",
            background:
              "radial-gradient(ellipse at bottom right, rgba(69,10,10,0.05) 0%, transparent 70%)",
            animation:      "fogPulse15 15s ease-in-out infinite",
            animationDelay: "-6s",
            opacity:        fog2Base,
            willChange:     "opacity",
          }}
        />
      </div>

      {/* ================================================
          CONTENT SLOT                             z-10
      ================================================ */}
      <div
        className="absolute inset-0 overflow-y-auto"
        style={{ zIndex: 10 }}
      >
        {children}
      </div>
    </div>
  );
}
