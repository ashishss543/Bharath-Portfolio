"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";

/* ─── Beyond Design Studies Dataset ─────────────────────────── */
export interface BeyondDesignStudy {
  id: string;
  num: string;
  title: string;
  category: string;
  year: string;
  medium: string;
  description: string;
  image: string;
}

const BEYOND_DESIGN_STUDIES: BeyondDesignStudy[] = [
  {
    id: "bd-01",
    num: "01",
    title: "Spatial Composition 01",
    category: "Visual Exploration",
    year: "2026",
    medium: "Digital Photography & Form Study",
    description:
      "Exploration of texture, depth, and spatial geometry captured through architectural framing.",
    image: "/beyond design/IMG_3309.webp",
  },
  {
    id: "bd-02",
    num: "02",
    title: "Material & Light 02",
    category: "Experimental Photography",
    year: "2026",
    medium: "Visual Synthesis & Contrast",
    description:
      "A study of environmental light, tactile contrast, and minimal organic form.",
    image: "/beyond design/IMG_8329.webp",
  },
  {
    id: "bd-03",
    num: "03",
    title: "Graphic Monolith 03",
    category: "Visual Architecture",
    year: "2026",
    medium: "Digital Graphic Art & Composition",
    description:
      "Graphic structure and silhouette exploration balancing tension and negative space.",
    image: "/beyond design/IMG_8899.webp",
  },
  {
    id: "bd-04",
    num: "04",
    title: "Kinetic Presence 04",
    category: "Perspective Study",
    year: "2026",
    medium: "Atmospheric Capture & Editorial",
    description:
      "Monochromatic presence and dynamic perspective shifting the boundary of graphic art.",
    image: "/beyond design/IMG_8929.webp",
  },
  {
    id: "bd-05",
    num: "05",
    title: "Organic Rhythm 05",
    category: "Visual Exploration",
    year: "2026",
    medium: "Architectural Texture & Geometry",
    description:
      "Framed spatial rhythm and architectural perspective exploring tactile materiality.",
    image: "/beyond design/IMG_3308.webp",
  },
];

/* ─── 3D Depth Interpolation Calculation ─────────────────────── */
function getCardStyle(diff: number, isMobile: boolean) {
  const absDiff = Math.abs(diff);

  // Horizontal spacing
  const baseSpacing = isMobile ? 180 : 340;
  const x = diff * baseSpacing;

  // 3D Depth: push backward into Z space
  const z = -Math.pow(absDiff, 1.1) * (isMobile ? 120 : 180);

  // Inward perspective rotation Y
  const rotateY = Math.max(-28, Math.min(28, -diff * (isMobile ? 12 : 16)));

  // Scale: 1.0 at center, smoothly tapering off
  const scale = Math.max(0.6, 1.0 - absDiff * (isMobile ? 0.14 : 0.11));

  // Gentle, refined Cinematic Blur: strictly 0px at/near center, max 4.5px on far cards
  let blur = 0;
  if (absDiff > 0.4) {
    blur = Math.min(4.5, (absDiff - 0.4) * 2.0);
  }

  // Opacity: crystal clear 1.0 at center, gentle falloff in background
  const opacity = Math.max(0.35, Math.min(1.0, 1.02 - absDiff * 0.18));

  // Stacking z-index: center is highest
  const zIndex = Math.round(50 - absDiff * 10);

  return {
    x,
    z,
    rotateY,
    scale,
    blur,
    opacity,
    zIndex,
  };
}

export default function Experiments() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [currentProgress, setCurrentProgress] = useState<number>(0);

  // Responsive check
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile, { passive: true });
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Track vertical page scroll through the pinned container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Map scroll progress (0..1) to study index range (0 .. count-1)
  const rawProgress = useTransform(
    scrollYProgress,
    [0, 1],
    [0, BEYOND_DESIGN_STUDIES.length - 1]
  );

  // Sync scroll progress directly to reactive state (zero lag with Lenis)
  useEffect(() => {
    const unsub = rawProgress.on("change", (v) => {
      const clamped = Math.max(0, Math.min(BEYOND_DESIGN_STUDIES.length - 1, v));
      setCurrentProgress(clamped);
      setCurrentIndex(Math.round(clamped));
    });
    return () => unsub();
  }, [rawProgress]);

  // Smooth scroll to a specific study index in the pinned container
  const scrollToStudy = useCallback((index: number) => {
    const container = containerRef.current;
    if (!container) return;

    const clamped = Math.max(0, Math.min(BEYOND_DESIGN_STUDIES.length - 1, index));
    const rect = container.getBoundingClientRect();
    const scrollTop = window.scrollY + rect.top;
    const scrollDistance = container.offsetHeight - window.innerHeight;
    const targetScrollY =
      scrollTop + (clamped / (BEYOND_DESIGN_STUDIES.length - 1)) * scrollDistance;

    const win = window as unknown as { lenis?: { scrollTo: (target: number, opts: { duration: number }) => void } };
    if (win.lenis) {
      win.lenis.scrollTo(targetScrollY, { duration: 1.2 });
    } else {
      window.scrollTo({ top: targetScrollY, behavior: "smooth" });
    }
  }, []);

  const prev = useCallback(() => {
    scrollToStudy(currentIndex - 1);
  }, [currentIndex, scrollToStudy]);

  const next = useCallback(() => {
    scrollToStudy(currentIndex + 1);
  }, [currentIndex, scrollToStudy]);

  const activeStudy = BEYOND_DESIGN_STUDIES[currentIndex] || BEYOND_DESIGN_STUDIES[0];

  return (
    <section
      id="experiments"
      ref={containerRef}
      style={{ height: `${BEYOND_DESIGN_STUDIES.length * 65 + 40}vh` }}
      className="relative bg-white border-t border-neutral-200"
    >
      {/* ── Sticky Viewport (Pinned on screen while scrubbing through the 3D gallery) ── */}
      <div className="sticky top-0 w-full h-screen overflow-hidden bg-white flex flex-col justify-between py-10 md:py-14 px-6 md:px-16 select-none">
        
        {/* ── Top Bar: Header & Controls ── */}
        <div className="flex-shrink-0 flex items-end justify-between border-b border-neutral-200/80 pb-5">
          <div>
            <p className="text-[10px] tracking-[0.4em] text-neutral-400 uppercase font-light mb-2">
              03 — Beyond Design
            </p>
            <h2 className="text-3xl md:text-5xl font-extralight tracking-tight text-neutral-900 leading-none">
              BEYOND DESIGN
            </h2>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden lg:flex items-center gap-2 text-[10px] tracking-[0.25em] text-neutral-400 font-mono uppercase">
              <span>Scroll to scrub</span>
              <span className="animate-bounce">↓</span>
            </div>

            {/* Stepper buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={prev}
                disabled={currentIndex === 0}
                aria-label="Previous study"
                className={`w-9 h-9 rounded-full border border-neutral-200 flex items-center justify-center text-xs text-neutral-700 transition-all duration-300 ${
                  currentIndex === 0
                    ? "opacity-30 cursor-not-allowed"
                    : "hover:bg-neutral-900 hover:text-white hover:border-neutral-900 active:scale-95"
                }`}
              >
                ←
              </button>
              <button
                onClick={next}
                disabled={currentIndex === BEYOND_DESIGN_STUDIES.length - 1}
                aria-label="Next study"
                className={`w-9 h-9 rounded-full border border-neutral-200 flex items-center justify-center text-xs text-neutral-700 transition-all duration-300 ${
                  currentIndex === BEYOND_DESIGN_STUDIES.length - 1
                    ? "opacity-30 cursor-not-allowed"
                    : "hover:bg-neutral-900 hover:text-white hover:border-neutral-900 active:scale-95"
                }`}
              >
                →
              </button>
            </div>
          </div>
        </div>

        {/* ── Center Stage: 3D Spatial Depth Gallery Stack ── */}
        <div
          className="relative flex-1 min-h-0 w-full flex items-center justify-center"
          style={{
            perspective: isMobile ? "900px" : "1300px",
            perspectiveOrigin: "50% 50%",
          }}
        >
          {/* Floating 3D Depth Cards */}
          <div
            className="relative w-full h-full flex items-center justify-center pointer-events-none"
            style={{ transformStyle: "preserve-3d" }}
          >
            {BEYOND_DESIGN_STUDIES.map((study, i) => {
              const diff = i - currentProgress;
              const { x, z, rotateY, scale, blur, opacity, zIndex } =
                getCardStyle(diff, isMobile);

              // Don't render cards that are far offscreen for maximum GPU efficiency
              if (Math.abs(diff) > (isMobile ? 2.5 : 3.8)) return null;

              const isCenter = Math.abs(diff) < 0.35;

              return (
                <div
                  key={study.id}
                  onClick={() => scrollToStudy(i)}
                  className={`absolute origin-center transition-shadow duration-500 pointer-events-auto ${
                    isCenter
                      ? "cursor-default"
                      : "cursor-pointer hover:brightness-105"
                  }`}
                  style={{
                    width: isMobile ? "260px" : "360px",
                    maxWidth: "82vw",
                    aspectRatio: "3 / 4",
                    borderRadius: "35px",
                    transformStyle: "preserve-3d",
                    transform: `translate3d(${x}px, 0px, ${z}px) rotateY(${rotateY}deg) scale(${scale})`,
                    filter: `blur(${blur}px)`,
                    opacity,
                    zIndex,
                    willChange: "transform, filter, opacity",
                    transition: "box-shadow 0.4s ease, filter 0.15s linear",
                  }}
                >
                  <div
                    className={`relative w-full h-full overflow-hidden bg-neutral-900 border border-neutral-200/60 ${
                      isCenter
                        ? "shadow-[0_25px_50px_-12px_rgba(0,0,0,0.35)] ring-1 ring-neutral-900/10"
                        : "shadow-lg"
                    }`}
                    style={{
                      borderRadius: "35px",
                    }}
                  >
                    {/* Photograph Asset - Crisp and Vibrant */}
                    <img
                      src={study.image}
                      alt={study.title}
                      draggable={false}
                      onError={(e) => {
                        const target = e.currentTarget;
                        const currentSrc = target.src;
                        if (currentSrc.endsWith(".webp")) {
                          target.src = currentSrc.replace(/\.webp$/, ".jpg");
                        } else if (currentSrc.endsWith(".jpg")) {
                          target.src = currentSrc.replace(/\.jpg$/, ".PNG");
                        }
                      }}
                      className={`w-full h-full object-cover transition-all duration-300 ${
                        isCenter
                          ? "grayscale-0 contrast-105 brightness-100"
                          : "grayscale contrast-105 brightness-95"
                      }`}
                      style={{
                        pointerEvents: "none",
                        borderRadius: "35px",
                      }}
                    />

                    {/* Subtle bottom gradient only for typography legibility */}
                    <div
                      className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none transition-opacity duration-300"
                      style={{
                        opacity: isCenter ? 0.7 : 0.85,
                        borderBottomLeftRadius: "35px",
                        borderBottomRightRadius: "35px",
                      }}
                    />

                    {/* Compact bottom label on card */}
                    <div className="absolute inset-x-0 bottom-0 p-5 md:p-6 text-white pointer-events-none">
                      <p className="text-[9px] font-mono tracking-widest uppercase text-neutral-300">
                        {study.category}
                      </p>
                      <h4 className="text-sm md:text-base font-light tracking-tight truncate">
                        {study.title}
                      </h4>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Bottom Bar: Active Study Metadata HUD & Stepper ── */}
        <div className="flex-shrink-0 flex flex-col md:flex-row items-start md:items-end justify-between gap-5 pt-4 border-t border-neutral-200/80">
          {/* Active study caption */}
          <div className="max-w-xl min-h-[75px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStudy.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="space-y-1"
              >
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-mono tracking-widest text-neutral-400 uppercase">
                    STUDY {activeStudy.num} {"//"} {String(BEYOND_DESIGN_STUDIES.length).padStart(2, "0")}
                  </span>
                  <span className="w-1 h-1 bg-neutral-300 rounded-full" />
                  <span className="text-[10px] font-mono tracking-widest text-neutral-500 uppercase">
                    {activeStudy.year}
                  </span>
                  <span className="w-1 h-1 bg-neutral-300 rounded-full" />
                  <span className="text-[10px] font-mono tracking-widest text-neutral-500 uppercase">
                    {activeStudy.category}
                  </span>
                </div>

                <h3 className="text-lg md:text-xl font-light tracking-tight text-neutral-900">
                  {activeStudy.title}
                </h3>

                <p className="text-xs text-neutral-500 font-light leading-relaxed line-clamp-2">
                  {activeStudy.description}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Stepper Progress Bar */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <div className="flex items-center gap-1.5">
              {BEYOND_DESIGN_STUDIES.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => scrollToStudy(idx)}
                  aria-label={`Jump to study ${idx + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === currentIndex
                      ? "w-8 bg-neutral-900"
                      : "w-2 bg-neutral-200 hover:bg-neutral-400"
                  }`}
                />
              ))}
            </div>

            <span className="text-[11px] font-mono tracking-widest text-neutral-400">
              {String(currentIndex + 1).padStart(2, "0")} /{" "}
              {String(BEYOND_DESIGN_STUDIES.length).padStart(2, "0")}
            </span>
          </div>
        </div>

      </div>
    </section>
  );
}
