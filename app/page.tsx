"use client";

import { useState } from "react";
import CinematicPortraitSequence from "@/components/CinematicPortraitSequence";
import SelectedWork from "@/components/SelectedWork";
import DesignCategories from "@/components/DesignCategories";
import Experiments from "@/components/Experiments";
import About from "@/components/About";
import Contact from "@/components/Contact";

/* ─── Minimal Fixed Navigation ──────────────────────────────── */
function Nav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const links = [
    { label: "Work", href: "#work" },
    { label: "Categories", href: "#categories" },
    { label: "Beyond Design", href: "#experiments" },
    { label: "About", href: "#about" },
    { label: "Contact", href: "#contact" },
  ];

  return (
    <>
      <nav className="fixed top-0 inset-x-0 z-40 flex items-center justify-between px-6 sm:px-8 md:px-16 py-5 md:py-6 mix-blend-difference text-white pointer-events-none">
        <a
          href="#"
          className="text-[11px] tracking-[0.35em] uppercase font-light pointer-events-auto hover:opacity-70 transition-opacity"
        >
          BHARATH
        </a>
        
        {/* Desktop Menu */}
        <div className="hidden sm:flex items-center gap-8 pointer-events-auto">
          {links.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-[9px] tracking-[0.3em] uppercase font-light hover:opacity-60 transition-opacity duration-300"
            >
              {item.label}
            </a>
          ))}
        </div>

        {/* Mobile Menu Toggle Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
          className="sm:hidden text-[10px] tracking-[0.25em] uppercase font-mono pointer-events-auto cursor-pointer p-1"
        >
          {mobileMenuOpen ? "[CLOSE]" : "[MENU]"}
        </button>
      </nav>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden fixed inset-0 z-30 bg-neutral-950/95 backdrop-blur-xl text-white flex flex-col justify-center items-center gap-8 px-8 py-20 select-none">
          {links.map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className="text-xl tracking-[0.3em] uppercase font-light hover:text-neutral-400 transition-colors"
            >
              {item.label}
            </a>
          ))}
        </div>
      )}
    </>
  );
}

/* ─── Main Portfolio Page ─────────────────────────────────────── */
export default function Home() {
  return (
    <main className="bg-white min-h-screen">
      <Nav />

      {/* SECTION 00 — HERO / CINEMATIC LANDING PAGE */}
      <CinematicPortraitSequence />

      {/* SECTION 01 — SELECTED WORK */}
      <SelectedWork />

      {/* SECTION 02 — DESIGN CATEGORIES (HORIZONTAL DARK SECTION) */}
      <DesignCategories />

      {/* SECTION 03 — EXPERIMENTS */}
      <Experiments />

      {/* SECTION 04 — ABOUT */}
      <About />

      {/* SECTION 05 — CONTACT */}
      <Contact />
    </main>
  );
}
