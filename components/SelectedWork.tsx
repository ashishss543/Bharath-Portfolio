"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";

interface ProjectConfig {
  id: string;
  number: string;
  title: string;
  category: string;
  year: string;
  description: string;
  image: string;
  layout: "wide" | "half";
  aspectRatio: string; // e.g. "aspect-[16/9]", "aspect-[4/3]", "aspect-square", "aspect-[4/5]", "aspect-[21/9]", "aspect-[3/2]"
  objectFit: "cover" | "contain";
  objectPositionX: number; // 0 to 100%
  objectPositionY: number; // 0 to 100%
  zoom: number; // 50% to 250%
}

const DEFAULT_PROJECTS: ProjectConfig[] = [
  {
    id: "work-01",
    number: "01",
    title: "NIKE AIR // CAMPAIGN",
    category: "Footwear & Visual Direction",
    year: "2026",
    description:
      "Visual identity system and spatial promotional campaign exploring kinetic aerodynamics and futuristic silhouettes.",
    image: "/work/1.png",
    layout: "wide",
    aspectRatio: "aspect-[21/9]",
    objectFit: "contain",
    objectPositionX: 53,
    objectPositionY: 45,
    zoom: 103,
  },
  {
    id: "work-02",
    number: "02",
    title: "NIKE // SPECULATIVE EDITION",
    category: "Product Architecture & Art Direction",
    year: "2026",
    description:
      "High-contrast visual system and generative gradient packaging for limited edition performance footwear.",
    image: "/work/2.jpeg",
    layout: "half",
    aspectRatio: "aspect-square",
    objectFit: "cover",
    objectPositionX: 50,
    objectPositionY: 55,
    zoom: 103,
  },
  {
    id: "work-03",
    number: "03",
    title: "ADIDAS FORUM",
    category: "Heritage Brand Identity & Editorial",
    year: "2025",
    description:
      "Retro-futuristic archival campaign celebrating classic court silhouettes with minimalist Swiss typography.",
    image: "/work/3.jpeg",
    layout: "half",
    aspectRatio: "aspect-[3/4]",
    objectFit: "cover",
    objectPositionX: 50,
    objectPositionY: 50,
    zoom: 101,
  },
  {
    id: "work-04",
    number: "04",
    title: "ADIDAS YEEZY // MONOCHROME",
    category: "Sculptural Form & Material Study",
    year: "2025",
    description:
      "Brutalist organic geometry and monochromatic foam architecture exploration.",
    image: "/work/4.jpeg",
    layout: "half",
    aspectRatio: "aspect-[3/4]",
    objectFit: "cover",
    objectPositionX: 50,
    objectPositionY: 50,
    zoom: 100,
  },
  {
    id: "work-05",
    number: "05",
    title: "BIG HERO 6 // KINETIC ART",
    category: "Character Concept & Visual Systems",
    year: "2024",
    description:
      "Experimental character art direction and dynamic graphic composition.",
    image: "/work/6.jpeg",
    layout: "half",
    aspectRatio: "aspect-square",
    objectFit: "cover",
    objectPositionX: 50,
    objectPositionY: 50,
    zoom: 100,
  },
];

const ASPECT_RATIO_PRESETS = [
  { label: "21:9 Ultra-wide", value: "aspect-[21/9]" },
  { label: "16:9 Cinema", value: "aspect-[16/9]" },
  { label: "16:10 Widescreen", value: "aspect-[16/10]" },
  { label: "4:3 Standard", value: "aspect-[4/3]" },
  { label: "5:4 Medium", value: "aspect-[5/4]" },
  { label: "1:1 Square", value: "aspect-square" },
  { label: "4:5 Portrait", value: "aspect-[4/5]" },
  { label: "3:4 Tall", value: "aspect-[3/4]" },
  { label: "9:16 Story", value: "aspect-[9/16]" },
];

function ProjectCard({ project, index }: { project: ProjectConfig; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  const [src, setSrc] = useState<string>(project.image);

  // Sync state if project image changes
  useEffect(() => {
    setSrc(project.image);
  }, [project.image]);

  // Universal format fallback handler (PNG <-> JPEG <-> JPG <-> WEBP)
  const handleImageError = () => {
    if (src.endsWith(".png")) {
      setSrc(src.replace(/\.png$/, ".jpeg"));
    } else if (src.endsWith(".jpeg")) {
      setSrc(src.replace(/\.jpeg$/, ".jpg"));
    } else if (src.endsWith(".jpg")) {
      setSrc(src.replace(/\.jpg$/, ".png"));
    }
  };

  const isWide = project.layout === "wide";

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay: (index % 2) * 0.15, ease: [0.22, 1, 0.36, 1] }}
      className={`group relative flex flex-col ${isWide ? "col-span-1 md:col-span-12" : "col-span-1 md:col-span-6"}`}
    >
      {/* Image container with live dynamic styling */}
      <div className={`relative overflow-hidden bg-neutral-900 border border-neutral-200/80 ${project.aspectRatio}`}>
        <img
          src={src}
          alt={project.title}
          onError={handleImageError}
          loading="lazy"
          className="w-full h-full grayscale contrast-105 group-hover:scale-105 group-hover:grayscale-0 transition-all duration-700 ease-out"
          style={{
            objectFit: project.objectFit,
            objectPosition: `${project.objectPositionX}% ${project.objectPositionY}%`,
            transform: project.zoom !== 100 ? `scale(${project.zoom / 100})` : undefined,
            transformOrigin: `${project.objectPositionX}% ${project.objectPositionY}%`,
          }}
        />
      </div>

      {/* Metadata */}
      <div className="pt-5 pb-2 flex flex-col gap-2">
        <div className="flex items-baseline justify-between border-b border-neutral-200 pb-3">
          <h3 className="text-2xl md:text-3xl font-extralight tracking-tight text-neutral-900 group-hover:translate-x-1 transition-transform duration-300">
            {project.title}
          </h3>
          <span className="text-[11px] tracking-[0.2em] text-neutral-400 uppercase font-light">
            {project.category} · {project.year}
          </span>
        </div>
        <p className="text-xs text-neutral-500 font-light leading-relaxed max-w-xl">
          {project.description}
        </p>
      </div>
    </motion.div>
  );
}

// Set to true whenever you want to reopen the interactive Position Tablet
const ENABLE_POSITION_TABLET = false;

export default function SelectedWork() {
  const headerRef = useRef<HTMLDivElement>(null);
  const isHeaderInView = useInView(headerRef, { once: true, margin: "-40px" });

  const [projects, setProjects] = useState<ProjectConfig[]>(DEFAULT_PROJECTS);
  const [selectedIdx, setSelectedIdx] = useState<number>(0);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Load saved tuner settings from localStorage safely
  useEffect(() => {
    try {
      const saved = localStorage.getItem("selected_work_tuner_config");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === DEFAULT_PROJECTS.length) {
          const merged = DEFAULT_PROJECTS.map((def, i) => ({
            ...def,
            ...parsed[i],
            image: def.image, // ensure actual valid image path is used
          }));
          setProjects(merged);
        }
      }
    } catch {
      // Ignore
    }
  }, []);

  // Save to localStorage whenever modified
  const updateProject = (idx: number, patch: Partial<ProjectConfig>) => {
    setProjects((prev) => {
      const next = [...prev];
      if (next[idx]) {
        next[idx] = { ...next[idx], ...patch };
        try {
          localStorage.setItem("selected_work_tuner_config", JSON.stringify(next));
        } catch {
          // Ignore
        }
      }
      return next;
    });
  };

  const current = projects[selectedIdx] || projects[0] || DEFAULT_PROJECTS[0];

  const handleCopy = () => {
    const json = JSON.stringify(projects, null, 2);
    navigator.clipboard.writeText(json);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setProjects(DEFAULT_PROJECTS);
    try {
      localStorage.removeItem("selected_work_tuner_config");
    } catch {
      // Ignore
    }
  };

  return (
    <section id="work" className="relative px-8 md:px-16 py-28 md:py-36 bg-[#ffffff] border-t border-neutral-200">
      {/* Section Header */}
      <div ref={headerRef} className="mb-16 md:mb-24 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          <p className="text-[10px] tracking-[0.4em] text-neutral-400 uppercase font-light mb-3">
            01 — Selected Work
          </p>
          <h2 className="text-4xl md:text-6xl font-extralight tracking-tight text-neutral-900 leading-none">
            CURATED
            <br />
            PROJECTS.
          </h2>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={isHeaderInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-xs md:text-sm text-neutral-500 font-light max-w-sm leading-relaxed"
        >
          A selection of brand identities, typographic systems, and editorial art direction crafted with conceptual rigor and visual restraint.
        </motion.p>
      </div>

      {/* Asymmetric Project Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-x-10 gap-y-16 md:gap-y-24">
        {projects.map((project, index) => (
          <ProjectCard key={project.id} project={project} index={index} />
        ))}
      </div>

      {/* ─── FLOATING POSITION TUNER TABLET (FOR LIVE LOCALHOST ADJUSTMENTS) ─── */}
      {ENABLE_POSITION_TABLET && (
        <div className="fixed bottom-5 right-5 z-50 font-sans">
          {/* Toggle Pill Button */}
          {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-neutral-950/90 hover:bg-neutral-900 text-white text-xs font-mono uppercase tracking-widest rounded-full shadow-2xl backdrop-blur-md border border-white/10 hover:scale-105 transition-all"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            🎛️ Position Tablet ({projects[selectedIdx]?.number})
          </button>
        )}

        {/* Expanded Tablet Panel */}
        {isOpen && (
          <div className="w-[360px] sm:w-[410px] max-h-[85vh] overflow-y-auto bg-neutral-950/95 text-white rounded-2xl p-5 shadow-2xl border border-white/10 backdrop-blur-xl flex flex-col gap-4 text-xs select-none">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-mono text-[11px] tracking-widest uppercase font-semibold text-white">
                  IMAGE POSITION TABLET
                </span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-6 h-6 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white flex items-center justify-center transition-colors font-mono"
              >
                ✕
              </button>
            </div>

            {/* Select Image Selector */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-mono tracking-widest text-neutral-400 uppercase">
                Select Project to Adjust:
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {projects.map((p, idx) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedIdx(idx)}
                    className={`py-1.5 rounded text-[10px] font-mono transition-all ${
                      selectedIdx === idx
                        ? "bg-white text-black font-bold shadow"
                        : "bg-white/5 hover:bg-white/10 text-neutral-300 border border-white/5"
                    }`}
                  >
                    #{p.number}
                  </button>
                ))}
              </div>
              <span className="text-[11px] font-medium text-emerald-400 truncate mt-0.5">
                {current.number} — {current.title}
              </span>
            </div>

            {/* Layout Toggle (Wide vs Half) */}
            <div className="flex items-center justify-between border-t border-white/5 pt-3">
              <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest">
                Card Layout:
              </span>
              <div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg border border-white/5">
                <button
                  onClick={() => updateProject(selectedIdx, { layout: "wide" })}
                  className={`px-3 py-1 rounded text-[10px] font-mono uppercase transition-all ${
                    current.layout === "wide"
                      ? "bg-white text-black font-semibold"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  Wide (Full)
                </button>
                <button
                  onClick={() => updateProject(selectedIdx, { layout: "half" })}
                  className={`px-3 py-1 rounded text-[10px] font-mono uppercase transition-all ${
                    current.layout === "half"
                      ? "bg-white text-black font-semibold"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  Half (2-Col)
                </button>
              </div>
            </div>

            {/* Aspect Ratio Presets */}
            <div className="flex flex-col gap-1.5 border-t border-white/5 pt-3">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-mono tracking-widest text-neutral-400 uppercase">
                  Aspect Ratio:
                </label>
                <span className="font-mono text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/20">
                  {current.aspectRatio}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {ASPECT_RATIO_PRESETS.map((preset) => (
                  <button
                    key={preset.value}
                    onClick={() => updateProject(selectedIdx, { aspectRatio: preset.value })}
                    className={`py-1 px-1.5 rounded text-[9px] font-mono truncate transition-all ${
                      current.aspectRatio === preset.value
                        ? "bg-white text-black font-bold"
                        : "bg-white/5 hover:bg-white/10 text-neutral-300 border border-white/5"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Object Fit Mode (Cover vs Contain) */}
            <div className="flex items-center justify-between border-t border-white/5 pt-3">
              <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest">
                Object Fit:
              </span>
              <div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg border border-white/5">
                <button
                  onClick={() => updateProject(selectedIdx, { objectFit: "cover" })}
                  className={`px-3 py-1 rounded text-[10px] font-mono uppercase transition-all ${
                    current.objectFit === "cover"
                      ? "bg-white text-black font-semibold"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  Cover (Fill)
                </button>
                <button
                  onClick={() => updateProject(selectedIdx, { objectFit: "contain" })}
                  className={`px-3 py-1 rounded text-[10px] font-mono uppercase transition-all ${
                    current.objectFit === "contain"
                      ? "bg-white text-black font-semibold"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  Contain (No Crop)
                </button>
              </div>
            </div>

            {/* Object Position X Slider */}
            <div className="flex flex-col gap-1 border-t border-white/5 pt-3">
              <div className="flex justify-between items-center text-[10px] font-mono">
                <span className="text-neutral-400 uppercase">Position X (Horizontal Pan):</span>
                <span className="text-emerald-400 font-bold">{current.objectPositionX}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={current.objectPositionX}
                onChange={(e) =>
                  updateProject(selectedIdx, { objectPositionX: Number(e.target.value) })
                }
                className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
              />
            </div>

            {/* Object Position Y Slider */}
            <div className="flex flex-col gap-1 border-t border-white/5 pt-3">
              <div className="flex justify-between items-center text-[10px] font-mono">
                <span className="text-neutral-400 uppercase">Position Y (Vertical Pan):</span>
                <span className="text-emerald-400 font-bold">{current.objectPositionY}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={current.objectPositionY}
                onChange={(e) =>
                  updateProject(selectedIdx, { objectPositionY: Number(e.target.value) })
                }
                className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
              />
            </div>

            {/* Zoom / Scale Slider */}
            <div className="flex flex-col gap-1 border-t border-white/5 pt-3">
              <div className="flex justify-between items-center text-[10px] font-mono">
                <span className="text-neutral-400 uppercase">Zoom / Scale:</span>
                <span className="text-emerald-400 font-bold">{current.zoom}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="250"
                step="1"
                value={current.zoom}
                onChange={(e) => updateProject(selectedIdx, { zoom: Number(e.target.value) })}
                className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
              />
            </div>

            {/* Action Bar (Copy Config & Reset) */}
            <div className="flex items-center gap-2 border-t border-white/10 pt-3">
              <button
                onClick={handleCopy}
                className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-bold text-[10px] uppercase tracking-wider rounded-xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-1.5"
              >
                {copied ? "✓ Copied Config!" : "📋 Copy All Values"}
              </button>
              <button
                onClick={handleReset}
                className="px-3 py-2.5 bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white font-mono text-[10px] uppercase rounded-xl transition-all border border-white/5"
              >
                ↺ Reset
              </button>
            </div>
          </div>
        )}
        </div>
      )}
    </section>
  );
}
