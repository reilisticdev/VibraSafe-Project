"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { staggerContainer, fadeUpItem, viewportOnce } from "@/lib/motion";

/* Consistent section rhythm and heading hierarchy across the page. */

export function Section({
  id,
  children,
  className = "",
}: {
  id?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={`gc-section ${className}`}>
      {children}
    </section>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  lead,
  children,
}: {
  eyebrow: string;
  title: string;
  lead?: string;
  /** Optional CTA/actions slot - joins the same scroll-reveal stagger
   *  group as the eyebrow/heading/lead, mirroring the reference
   *  template's eyebrow -> heading -> paragraph -> CTA rhythm. */
  children?: ReactNode;
}) {
  return (
    <motion.header
      className="max-w-2xl"
      variants={staggerContainer}
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
    >
      <motion.p variants={fadeUpItem} className="gc-label">
        {eyebrow}
      </motion.p>
      <motion.h2
        variants={fadeUpItem}
        className="mt-3 font-extrabold tracking-tight"
        style={{ fontSize: "var(--text-h2)", lineHeight: 1.12 }}
      >
        {title}
      </motion.h2>
      {lead && (
        <motion.p
          variants={fadeUpItem}
          className="mt-3 text-base leading-relaxed text-muted sm:text-lg"
        >
          {lead}
        </motion.p>
      )}
      {children && <motion.div variants={fadeUpItem}>{children}</motion.div>}
    </motion.header>
  );
}
