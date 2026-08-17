"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";

export interface FanDeckCategory {
  id: string;
  num: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  tags: string[];
  clientOrProject: string;
  deliverables: string;
  link: string;
}

export const CATEGORIES_DATA: FanDeckCategory[] = [
  {
    id: "branding",
    num: "01",
    title: "BRANDING",
    subtitle: "Brand Identity Systems",
    description:
      "Holistic visual architecture, custom stationery, guidelines, and tactile luxury packaging systems designed for cultural and commercial brands.",
    image: "/specialization/1.jpg",
    tags: ["Visual Architecture", "Guidelines", "Packaging", "Art Direction"],
    clientOrProject: "Aura Studio & Maison Noir",
    deliverables: "Comprehensive Brand Kit & Print Collateral",
    link: "#work",
  },
  {
    id: "posters",
    num: "02",
    title: "POSTERS",
    subtitle: "Exhibition & Screenprint",
    description:
      "Large-format screenprints, typographic compositions, and experimental Swiss grid systems exploring optical rhythm and ink density.",
    image: "/specialization/2.jpg",
    tags: ["Screenprint", "Swiss Grid", "Exhibition", "Limited Edition"],
    clientOrProject: "Basel Kunsthalle & Independent Series",
    deliverables: "B1 Screenprint Editions & Digital Posters",
    link: "#work",
  },
  {
    id: "uiux",
    num: "03",
    title: "UI / UX",
    subtitle: "Digital Platforms & Apps",
    description:
      "Bespoke digital experiences, high-fidelity interfaces, and editorial web systems engineered for seamless interaction and refined aesthetics.",
    image: "/specialization/3.jpg",
    tags: [
      "Design Systems",
      "Web Architecture",
      "Micro-Interactions",
      "Prototyping",
    ],
    clientOrProject: "Chronos Atelier & Synapse Platform",
    deliverables: "Full Design System & Interactive Prototypes",
    link: "#work",
  },
  {
    id: "typography",
    num: "04",
    title: "TYPOGRAPHY",
    subtitle: "Custom Typefaces & Glyphs",
    description:
      "Bespoke display typefaces, variable font engineering, logotypes, and editorial typesetting crafted with extreme geometric rigor.",
    image: "/specialization/4.jpg",
    tags: ["Variable Fonts", "Display Type", "Logotypes", "OpenType"],
    clientOrProject: "Vanguard Mono & Editorial Foundry",
    deliverables: "Complete Font Families (OTF/WOFF2)",
    link: "#work",
  },
  {
    id: "motion",
    num: "05",
    title: "MOTION",
    subtitle: "Kinetic Identity & 3D",
    description:
      "Kinetic typography, 3D brand animations, title sequences, and dynamic idents bringing stationary graphic design to life through time.",
    image: "/specialization/5.jpg",
    tags: ["Kinetic Type", "3D Raytracing", "Title Sequences", "Dynamic Idents"],
    clientOrProject: "Orbit Film & Kroma Dynamic Idents",
    deliverables: "4K Motion Graphics & WebGL Shaders",
    link: "#work",
  },
];

interface FanDeckProps {
  categories?: FanDeckCategory[];
}

export default function DesignCategories({
  categories = CATEGORIES_DATA,
}: FanDeckProps) {
  const [activeIndex, setActiveIndex] = useState<number>(2); // Default to middle card (UI/UX)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check, { passive: true });
    return () => window.removeEventListener("resize", check);
  }, []);

  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-60px" });

  const total = categories.length;

  return (
    <section
      id="categories"
      ref={containerRef}
      className="relative px-8 md:px-16 py-28 md:py-40 bg-[#0A0A0A] text-white overflow-hidden border-t border-neutral-900"
    >
      {/* Background subtle radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-neutral-800/20 blur-[140px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between pb-12 border-b border-neutral-800/80 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <p className="text-[10px] tracking-[0.4em] text-neutral-400 uppercase font-light">
                02 — Specializations
              </p>
            </div>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-extralight tracking-tight text-white leading-none">
              FAN DECK // DISCIPLINES
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex items-center gap-4 text-xs font-mono text-neutral-400"
          >
            <span>INTERACTIVE FAN DECK</span>
            <span className="text-neutral-600">/</span>
            <span>HOVER &amp; SELECT CARDS</span>
          </motion.div>
        </div>

        {/* Category Selector Pills */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="flex flex-wrap items-center justify-center gap-2 md:gap-3 my-12"
        >
          {categories.map((cat, idx) => {
            const isSelected = (hoveredIndex !== null ? hoveredIndex : activeIndex) === idx;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveIndex(idx)}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={`px-4 py-2 text-[10px] tracking-[0.25em] uppercase font-mono transition-all duration-300 rounded-full border cursor-pointer ${isSelected
                    ? "bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.25)] scale-105"
                    : "bg-neutral-900/60 text-neutral-400 border-neutral-800 hover:border-neutral-600 hover:text-white"
                  }`}
              >
                {cat.title}
              </button>
            );
          })}
        </motion.div>

        {/* ── FAN DECK INTERACTIVE STAGE ── */}
        <div className="relative py-8 sm:py-16 md:py-24 flex items-center justify-center min-h-[340px] sm:min-h-[440px] md:min-h-[520px]">
          <div className="relative w-full max-w-2xl h-[280px] sm:h-[360px] md:h-[420px] flex items-center justify-center">
            {categories.map((cat, index) => {
              const currentActive = hoveredIndex !== null ? hoveredIndex : activeIndex;
              const isCardActive = currentActive === index;

              // Fan geometry calculation
              const mid = (total - 1) / 2; // 2 for 5 items
              const offsetFromMid = index - mid; // -2, -1, 0, 1, 2
              const offsetFromActive = index - currentActive;

              // Base fanned arc parameters (calibrated for mobile screens vs desktop)
              const angleStep = isMobile ? 5.5 : 9; // degrees per card
              const xStep = isMobile ? 36 : 100; // px horizontal separation
              const yArc = isMobile ? 6 : 14; // px vertical arc curvature

              let rotate = offsetFromMid * angleStep;
              let x = offsetFromMid * xStep;
              let y = Math.abs(offsetFromMid) * yArc;
              let scale = 1;
              let zIndex = 10 + (total - Math.abs(offsetFromMid));

              // Active/Hovered Card state
              if (isCardActive) {
                rotate = 0;
                y = isMobile ? -18 : -36;
                scale = isMobile ? 1.05 : 1.08;
                zIndex = 50;
              } else {
                // Fan out sibling cards slightly wider to clear space for the active card
                const pushX = isMobile ? 10 : 30;
                const pushRot = isMobile ? 2 : 4;
                if (offsetFromActive < 0) {
                  x -= pushX;
                  rotate -= pushRot;
                } else if (offsetFromActive > 0) {
                  x += pushX;
                  rotate += pushRot;
                }
              }

              return (
                <motion.div
                  key={cat.id}
                  layout
                  onClick={() => setActiveIndex(index)}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  initial={{ opacity: 0, y: 60, rotate: 0 }}
                  animate={
                    isInView
                      ? {
                        opacity: isCardActive ? 1 : 0.72,
                        x,
                        y,
                        rotate,
                        scale,
                        zIndex,
                      }
                      : {}
                  }
                  transition={{
                    type: "spring",
                    stiffness: 240,
                    damping: 22,
                    mass: 0.35,
                  }}
                  className={`absolute w-[180px] xs:w-[200px] sm:w-[260px] md:w-[320px] aspect-[3/4] rounded-2xl overflow-hidden bg-neutral-900 border cursor-pointer select-none shadow-2xl transition-colors duration-300 ${isCardActive
                    ? "border-white/80 shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_30px_rgba(255,255,255,0.15)]"
                    : "border-neutral-800/90 shadow-lg hover:border-neutral-600"
                    }`}
                  style={{
                    transformOrigin: "bottom center",
                  }}
                >
                  {/* Card Image */}
                  <div className="relative w-full h-full overflow-hidden">
                    <img
                      src={cat.image}
                      alt={cat.title}
                      onError={(e) => {
                        const target = e.currentTarget;
                        const currentSrc = target.src;
                        if (currentSrc.endsWith(".png")) {
                          target.src = currentSrc.replace(/\.png$/, ".jpeg");
                        } else if (currentSrc.endsWith(".jpeg")) {
                          target.src = currentSrc.replace(/\.jpeg$/, ".jpg");
                        } else if (currentSrc.endsWith(".jpg")) {
                          target.src = currentSrc.replace(/\.jpg$/, ".webp");
                        }
                      }}
                      loading="lazy"
                      className={`w-full h-full object-cover transition-all duration-700 ${isCardActive
                        ? "scale-105 grayscale-0 contrast-105"
                        : "grayscale contrast-125 brightness-90 group-hover:grayscale-0"
                        }`}
                    />

                    {/* Gradient Shadow Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/20" />

                    {/* Top Tag */}
                    <div className="absolute top-3 sm:top-4 inset-x-3 sm:inset-x-4 flex items-center justify-end z-10">
                      <span className="text-[8px] sm:text-[9px] font-mono tracking-widest text-white/70 uppercase">
                        {cat.title}
                      </span>
                    </div>

                    {/* Bottom Card Content */}
                    <div className="absolute bottom-0 inset-x-0 p-3.5 sm:p-5 z-10">
                      <p className="text-[8px] sm:text-[10px] tracking-[0.25em] uppercase font-mono text-neutral-400 mb-0.5 sm:mb-1">
                        {cat.subtitle}
                      </p>
                      <h3 className="text-base sm:text-xl md:text-2xl font-light tracking-tight text-white mb-1.5 sm:mb-3">
                        {cat.title}
                      </h3>

                      {/* Tag list visible on active card */}
                      {isCardActive && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                          className="flex flex-wrap gap-1 pt-1.5 sm:pt-2 border-t border-white/15"
                        >
                          {cat.tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="text-[7px] sm:text-[8px] tracking-wider uppercase font-mono px-1.5 py-0.5 bg-white/10 backdrop-blur-sm rounded text-neutral-300"
                            >
                              {tag}
                            </span>
                          ))}
                        </motion.div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
