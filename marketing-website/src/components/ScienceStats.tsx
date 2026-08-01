"use client";

import { motion } from "framer-motion";
import { BookOpenCheck } from "lucide-react";

const EASE = [0.32, 0.72, 0, 1] as const;

const STATS = [
  {
    value: "~600,000",
    label: "Deaf South Africans",
    detail: "with an estimated 4–5 million more relying on non-signed communication.",
  },
  {
    value: "~20%",
    label: "of South Africans live with hearing loss",
    detail: "any degree, mild to total — WHO World Report on Hearing, 2021.",
  },
  {
    value: "0 dB",
    label: "transcranial attenuation below 1kHz",
    detail: "why direction lives in the tactile channel, not bone conduction.",
  },
];

export default function ScienceStats() {
  return (
    <section
      id="science"
      className="relative z-10 -mt-20 rounded-t-[2.5rem] border-t border-white/10 bg-void/70 backdrop-blur-2xl sm:-mt-28 sm:rounded-t-[3rem] gc-section"
    >
      <div className="max-w-2xl">
        <motion.span
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: EASE }}
          className="gc-eyebrow"
        >
          <BookOpenCheck size={13} strokeWidth={1.5} />
          Grounded in peer-reviewed science
        </motion.span>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.08 }}
          className="mt-5 font-semibold tracking-tight text-ink"
          style={{ fontSize: "var(--text-h1)" }}
        >
          The need is real — and precisely stated.
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.14 }}
          className="mt-4 text-base leading-relaxed text-muted"
        >
          Every figure on this page is checked against the WHO World Report
          on Hearing and South African census data, and stated the way it
          holds up under scrutiny — not the way it sounds most dramatic.
        </motion.p>
      </div>

      <div className="mt-14 grid gap-5 sm:grid-cols-3">
        {STATS.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 28, filter: "blur(6px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.8, ease: EASE, delay: i * 0.12 }}
            className="gc-shell gc-shell-hover"
          >
            <div className="gc-core px-7 py-8">
              <p
                className="font-semibold tracking-tight text-ink"
                style={{ fontSize: "var(--text-h1)" }}
              >
                {s.value}
              </p>
              <p className="mt-3 text-sm font-semibold text-ink">{s.label}</p>
              <p className="mt-2 text-sm leading-relaxed text-faint">{s.detail}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="mt-8 text-xs text-faint"
      >
        Sources: WHO World Report on Hearing (2021); South Africa National
        Council for Persons with Disabilities; Africa Check literature
        review. Figures reflect any degree of hearing loss, mild to total —
        never framed as severe or permanent.
      </motion.p>
    </section>
  );
}
