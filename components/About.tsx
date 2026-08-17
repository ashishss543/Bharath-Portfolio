"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

export default function About() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-60px" });

  return (
    <section
      id="about"
      ref={containerRef}
      className="relative px-8 md:px-16 py-28 md:py-40 bg-[#F7F7F5] border-t border-neutral-200"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Tag */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-16 border-b border-neutral-300 pb-4"
        >
          <span className="text-[10px] tracking-[0.4em] text-neutral-400 uppercase font-light">
            04 — Biography &amp; Practice
          </span>
        </motion.div>

        {/* 2-Column Asymmetric Editorial Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center">
          {/* Left Column: Big Statement & Intro */}
          <div className="lg:col-span-7 space-y-10">
            <motion.h2
              initial={{ opacity: 0, y: 24 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7 }}
              className="text-4xl md:text-7xl font-extralight tracking-tight text-neutral-900 leading-[1.05]"
            >
              ABOUT ME
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="text-xl md:text-2xl font-light text-neutral-800 leading-snug tracking-tight"
            >
              I am BHARATH an independent graphic designer and creative director dedicated to creating timeless brand identities, typographic systems, and high-impact digital experiences.
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.7, delay: 0.25 }}
              className="space-y-6 text-sm text-neutral-600 font-light leading-relaxed max-w-xl"
            >
              <p>
                My practice bridges rigorous Swiss typographic principles with contemporary digital culture. By stripping away superficial noise, I craft visual systems that command attention through precision, contrast, and unmistakable presence.
              </p>
              <p>
                Available for selective client commissions, brand transformations, creative direction, and cultural collaborations worldwide.
              </p>
            </motion.div>
          </div>

          {/* Right Column: Hero Portrait Image */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-5 relative group overflow-hidden bg-neutral-900 shadow-2xl border border-neutral-200/80 rounded-2xl"
          >
            <div className="relative aspect-[3/4] w-full overflow-hidden">
              <img
                src="/about/bharath-portrait.webp"
                alt="Bharath Portrait"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (target.src.endsWith(".webp")) {
                    target.src = "/about/bharath-portrait.png";
                  } else if (target.src.endsWith(".png")) {
                    target.src = "/about/bharath-portrait.jpg";
                  }
                }}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
