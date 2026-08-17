"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const CONTACT_LINKS = [
  {
    name: "EMAIL",
    value: "bharatbijukumar7@gmail.com",
    href: "mailto:bharatbijukumar7@gmail.com",
    label: "Direct Inquiries",
  },
  {
    name: "INSTAGRAM",
    value: "@bharatheeeeeee",
    href: "https://www.instagram.com/bharatheeeeeee?igsh=NGR2d2poanlhaG1r",
    label: "Visual Feed",
  },
  {
    name: "BEHANCE",
    value: "behance.net/bharatbijukumar",
    href: "https://www.behance.net/bharatbijukumar",
    label: "Full Portfolios",
  },
  {
    name: "LINKEDIN",
    value: "linkedin.com/in/bharat-biju-kumar",
    href: "https://www.linkedin.com/in/bharat-biju-kumar-935101315?utm_source=share_via&utm_content=profile&utm_medium=member_ios",
    label: "Professional Network",
  },
];

export default function Contact() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-60px" });

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <section
      id="contact"
      ref={containerRef}
      className="relative px-8 md:px-16 pt-28 md:pt-40 pb-16 bg-[#ffffff] border-t border-neutral-200"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Tag */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-16 border-b border-neutral-200 pb-4 flex justify-between items-center"
        >
          <span className="text-[10px] tracking-[0.4em] text-neutral-400 uppercase font-light">
            05 — Contact &amp; Collaboration
          </span>
          <span className="text-[10px] tracking-[0.3em] text-neutral-400 uppercase font-mono">
            [AVAILABLE FOR COMMISSIONS]
          </span>
        </motion.div>

        {/* Large Typography-Driven CTA */}
        <div className="mb-24 md:mb-36">
          <motion.h2
            initial={{ opacity: 0, y: 32 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-extralight tracking-tighter text-neutral-900 leading-[0.95] uppercase"
          >
            LET&apos;S
            <br />
            CREATE
            <br />
            <span className="text-neutral-300 hover:text-neutral-900 transition-colors duration-500">
              SOMETHING.
            </span>
          </motion.h2>
        </div>

        {/* Contact Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-24 border-b border-neutral-200">
          {CONTACT_LINKS.map((link, index) => (
            <motion.a
              key={link.name}
              href={link.href}
              target={link.href.startsWith("mailto") ? "_self" : "_blank"}
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group flex flex-col p-6 bg-neutral-50 hover:bg-neutral-900 transition-colors duration-300 border border-neutral-200/80 rounded-sm"
            >
              <span className="text-[9px] tracking-[0.3em] uppercase text-neutral-400 group-hover:text-neutral-400 transition-colors mb-4 font-mono">
                {link.label}
              </span>
              <span className="text-lg font-light text-neutral-900 group-hover:text-white transition-colors mb-2">
                {link.name}
              </span>
              <span className="text-xs text-neutral-500 group-hover:text-neutral-300 transition-colors flex items-center justify-between">
                <span>{link.value}</span>
                <span className="transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300">
                  ↗
                </span>
              </span>
            </motion.a>
          ))}
        </div>

        {/* Editorial Footer */}
        <div className="pt-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 text-[10px] tracking-widest text-neutral-400 uppercase font-light">
          <p>© 2026 BHARATH. ALL RIGHTS RESERVED.</p>
          <p>EDITORIAL GRAPHIC DESIGN &amp; ART DIRECTION</p>
          <button
            onClick={scrollToTop}
            className="hover:text-neutral-900 transition-colors duration-300 inline-flex items-center gap-2 cursor-pointer"
          >
            <span>BACK TO TOP</span>
            <span>↑</span>
          </button>
        </div>
      </div>
    </section>
  );
}
