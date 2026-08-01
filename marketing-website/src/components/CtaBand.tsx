"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Sparkles } from "lucide-react";

const EASE = [0.32, 0.72, 0, 1] as const;

export default function CtaBand() {
  return (
    <section id="get-started" className="gc-section !pt-0">
      <motion.div
        initial={{ opacity: 0, y: 32, filter: "blur(6px)" }}
        whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.9, ease: EASE }}
        className="gc-shell"
      >
        <div className="gc-core relative overflow-hidden px-8 py-16 text-center sm:px-16">
          <div
            className="pointer-events-none absolute inset-0 -z-10"
            style={{
              background:
                "radial-gradient(50% 60% at 50% 0%, rgb(139 108 247 / 0.14), transparent 70%)",
            }}
            aria-hidden
          />
          <span className="gc-eyebrow mx-auto">
            <Sparkles size={13} strokeWidth={1.5} />
            ESKOM Science Expo — Biomedical &amp; Medical Sciences
          </span>
          <h2
            className="mx-auto mt-6 max-w-2xl font-semibold tracking-tight text-ink"
            style={{ fontSize: "var(--text-h1)" }}
          >
            Built to be worn. Built to be believed.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted">
            Every claim on this page traces back to a spec sheet or a
            citation. Revisit the hardware, or step back through every
            finish before you decide which one feels like yours.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <a href="#device" className="gc-btn gc-btn-primary gc-btn-primary-glow">
              Revisit the device
              <span className="gc-btn-icon">
                <ArrowUpRight size={16} strokeWidth={1.5} />
              </span>
            </a>
            <a href="#colors" className="gc-btn gc-btn-ghost">
              See every finish
              <span className="gc-btn-icon">
                <ArrowUpRight size={16} strokeWidth={1.5} />
              </span>
            </a>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
