"use client";

import { motion } from "framer-motion";
import { Vibrate, AudioLines, ShieldAlert, Ruler, Cpu } from "lucide-react";

const EASE = [0.32, 0.72, 0, 1] as const;

const reveal = {
  hidden: { opacity: 0, y: 32, filter: "blur(6px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)" },
};

export default function FeaturesBento() {
  return (
    <section id="device" className="gc-section">
      <div className="max-w-2xl">
        <motion.span
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: EASE }}
          className="gc-eyebrow"
        >
          <Cpu size={13} strokeWidth={1.5} />
          Hardware
        </motion.span>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.08 }}
          className="mt-5 font-semibold tracking-tight text-ink"
          style={{ fontSize: "var(--text-h1)" }}
        >
          Two channels. Zero confusion.
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.14 }}
          className="mt-4 text-base leading-relaxed text-muted"
        >
          Real, purchasable hardware — built so an audiologist can ask
          &ldquo;could this actually be manufactured&rdquo; and get a
          straight answer.
        </motion.p>
      </div>

      <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-6 md:auto-rows-[minmax(0,1fr)]">
        {/* Tile 1 — Tactile Nodes (hero tile) */}
        <div className="gc-float md:col-span-4 md:row-span-2" style={{ animationDelay: "0s" }}>
          <motion.div
            variants={reveal}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.8, ease: EASE }}
            className="gc-shell gc-shell-hover h-full"
          >
            <div className="gc-core flex h-full flex-col justify-between p-8">
              <div>
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-tactile/10 text-tactile">
                  <Vibrate size={22} strokeWidth={1.5} />
                </span>
                <h3 className="mt-6 text-xl font-semibold text-ink sm:text-2xl">
                  4× 3mm Piezo Directional Tactile Nodes
                </h3>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
                  Four piezo actuators, bezel-set front, crown, rear, and lobe
                  on each cuff. Every ear fires independently with no
                  cross-talk — which is exactly why direction lives on this
                  channel and nowhere else.
                </p>
              </div>
              <span className="mt-8 inline-flex w-fit items-center gap-2 rounded-full border border-tactile/25 bg-tactile/[0.06] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-tactile">
                360° spatial hazard detection
              </span>
            </div>
          </motion.div>
        </div>

        {/* Tile 2 — Bone Conduction */}
        <div className="gc-float md:col-span-2" style={{ animationDelay: "1.3s" }}>
          <motion.div
            variants={reveal}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.1 }}
            className="gc-shell gc-shell-hover h-full"
          >
            <div className="gc-core flex h-full flex-col p-7">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-bone/10 text-bone">
                <AudioLines size={20} strokeWidth={1.5} />
              </span>
              <h3 className="mt-5 text-lg font-semibold text-ink">
                Mastoid Bone-Conduction Acoustic Clarity
              </h3>
              <p className="mt-2.5 text-sm leading-relaxed text-muted">
                A 12mm transducer drives the mastoid bone directly. Content,
                never direction — transcranial attenuation is near 0dB below
                1kHz, so this channel is built for clarity, not localization.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Tile 3 — Fail-Safe SOS */}
        <div className="gc-float md:col-span-2" style={{ animationDelay: "2.6s" }}>
          <motion.div
            variants={reveal}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.18 }}
            className="gc-shell gc-shell-hover h-full"
          >
            <div className="gc-core flex h-full flex-col p-7">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-sos/10 text-sos">
                <ShieldAlert size={20} strokeWidth={1.5} />
              </span>
              <h3 className="mt-5 text-lg font-semibold text-ink">
                Fail-Safe Hardware &amp; Emergency SOS
              </h3>
              <p className="mt-2.5 text-sm leading-relaxed text-muted">
                One press pulses both cuffs red and alerts the companion app.
                A physical notepad and visual manual back it up — so it
                still works when the battery doesn&apos;t.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Tile 4 — Titanium Contour (wide footer strip) */}
        <div className="gc-float md:col-span-6" style={{ animationDelay: "3.9s" }}>
          <motion.div
            variants={reveal}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.26 }}
            className="gc-shell gc-shell-hover"
          >
            <div className="gc-core flex flex-col gap-8 p-8 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-5">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand/10 text-brand">
                  <Ruler size={22} strokeWidth={1.5} />
                </span>
                <div>
                  <h3 className="text-xl font-semibold text-ink">
                    65.8mm Titanium Ear-Cuff Contour
                  </h3>
                  <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted">
                    A 3.0 × 1.2mm titanium band shaped to a real adult
                    auricle, housing the flex PCB and concealing the
                    behind-ear wire beneath the jewelry you choose.
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 gap-6 border-t border-line-soft pt-6 sm:border-t-0 sm:border-l sm:pl-8 sm:pt-0">
                <div>
                  <p className="text-lg font-semibold text-ink">3.0×1.2mm</p>
                  <p className="text-xs text-faint">Band section</p>
                </div>
                <div>
                  <p className="text-lg font-semibold text-ink">2× MEMS</p>
                  <p className="text-xs text-faint">Bearing mics</p>
                </div>
                <div>
                  <p className="text-lg font-semibold text-ink">~20h</p>
                  <p className="text-xs text-faint">Mixed-use runtime</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
