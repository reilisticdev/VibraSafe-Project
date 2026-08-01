"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Palette } from "lucide-react";
import { COLORWAYS } from "@/lib/colorways";

const EASE = [0.32, 0.72, 0, 1] as const;

export default function ColorStudio() {
  const [activeId, setActiveId] = useState(COLORWAYS[0].id);
  const active = COLORWAYS.find((c) => c.id === activeId) ?? COLORWAYS[0];

  return (
    <section id="colors" className="gc-section">
      <div className="max-w-2xl">
        <motion.span
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: EASE }}
          className="gc-eyebrow"
        >
          <Palette size={13} strokeWidth={1.5} />
          Color Studio
        </motion.span>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.08 }}
          className="mt-5 font-semibold tracking-tight text-ink"
          style={{ fontSize: "var(--text-h1)" }}
        >
          Five finishes. One safety signal.
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.14 }}
          className="mt-4 text-base leading-relaxed text-muted"
        >
          A finish changes the wire and the jewelry you see on the outer
          ear — never the amber tactile glow or red SOS pulse. Pick a
          palette without ever hiding your own alert.
        </motion.p>
      </div>

      <div className="relative mt-14 overflow-hidden rounded-[2.5rem]">
        <motion.div
          key={`${activeId}-glow`}
          className="pointer-events-none absolute inset-0 -z-10"
          animate={{
            background: `radial-gradient(70% 60% at 50% 0%, ${active.accent}26, transparent 70%)`,
          }}
          transition={{ duration: 0.8, ease: EASE }}
        />

        <div className="gc-shell">
          <div className="gc-core relative">
            <div className="relative aspect-[2752/1536] w-full">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeId}
                  initial={{ opacity: 0, scale: 1.03, filter: "blur(8px)" }}
                  animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, scale: 0.98, filter: "blur(8px)" }}
                  transition={{ duration: 0.55, ease: EASE }}
                  className="absolute inset-0"
                >
                  <Image
                    src={active.image}
                    alt={`VibraSafe in the ${active.name} finish — ${active.blurb.toLowerCase()}`}
                    fill
                    sizes="(min-width: 1024px) 900px, 100vw"
                    className="object-contain"
                    priority={activeId === COLORWAYS[0].id}
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="flex flex-col gap-6 border-t border-line-soft px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-2">
                {COLORWAYS.map((c) => {
                  const isActive = c.id === activeId;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setActiveId(c.id)}
                      aria-pressed={isActive}
                      className="relative rounded-full px-4 py-2.5 text-sm font-medium transition-colors duration-300"
                      style={{ color: isActive ? "var(--color-void)" : "var(--color-muted)" }}
                    >
                      {isActive && (
                        <motion.span
                          layoutId="colorway-pill"
                          className="absolute inset-0 rounded-full"
                          style={{ background: c.jewel }}
                          transition={{ duration: 0.5, ease: EASE }}
                        />
                      )}
                      <span className="relative flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 rounded-full ring-1 ring-white/20"
                          style={{ background: c.jewel }}
                          aria-hidden
                        />
                        {c.name}
                      </span>
                    </button>
                  );
                })}
              </div>
              <p className="text-sm text-faint sm:text-right">{active.blurb}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
