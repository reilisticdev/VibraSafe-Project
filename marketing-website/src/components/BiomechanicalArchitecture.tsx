"use client";

import { motion } from "framer-motion";
import { Ear, Brain, Zap } from "lucide-react";

const EASE = [0.32, 0.72, 0, 1] as const;

/* ==================================================================
   PATHWAY DIAGRAM
   ------------------------------------------------------------------
   A schematic, not an anatomical illustration — deliberately abstract
   line art (cranium outline, ear canal, cochlea spiral) rather than a
   realistic head, so it reads as a technical diagram and never
   overstates precision it doesn't have.

   Draws itself once, on scroll into view, via framer-motion's
   pathLength animation on <motion.path>. Two routes are shown:
     - the acoustic route (soundwave → ear canal → eardrum → ossicles),
       drawn muted/dashed and explicitly labelled "bypassed"
     - the bone-conduction route (cuff → mastoid → cochlea direct),
       drawn bold in the bone-conduction cyan — the one that's live.
   Colour matches the rest of the site: cyan is reserved for the bone
   conduction (auditory) channel, never the amber tactile channel,
   because this diagram is specifically about cochlear stimulation.
================================================================== */
function PathwayDiagram() {
  return (
    <svg
      viewBox="0 0 600 380"
      className="h-auto w-full"
      role="img"
      aria-label="Diagram showing the acoustic ear-canal pathway bypassed in favor of a direct bone-conduction route from the VibraSafe's mastoid transducer to the cochlea"
    >
      <defs>
        <style>{`.pw-label { font-family: var(--font-sans); }`}</style>
      </defs>

      {/* Cranium outline */}
      <motion.path
        d="M260,50 C340,50 400,110 400,190 C400,270 340,330 260,330 C180,330 120,270 120,190 C120,110 180,50 260,50 Z"
        fill="none"
        stroke="var(--color-line)"
        strokeWidth={2}
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 1.1, ease: EASE }}
      />

      {/* Ear notch */}
      <motion.path
        d="M392,150 C415,155 415,225 392,230"
        fill="none"
        stroke="var(--color-line)"
        strokeWidth={2}
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5, ease: EASE, delay: 0.2 }}
      />

      {/* Soundwave arcs — ambient sound, acoustic pathway */}
      {[
        "M440,150 Q412,190 440,230",
        "M470,135 Q430,190 470,245",
        "M500,120 Q448,190 500,260",
      ].map((d, i) => (
        <motion.path
          key={d}
          d={d}
          fill="none"
          stroke="var(--color-faint)"
          strokeWidth={1.5}
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.35 + i * 0.1 }}
        />
      ))}

      {/* Ear canal → tympanic membrane → ossicles (muted, dashed = bypassed) */}
      <motion.path
        d="M392,190 C375,190 365,190 352,190"
        fill="none"
        stroke="var(--color-faint)"
        strokeWidth={2}
        strokeDasharray="4 4"
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5, ease: EASE, delay: 0.7 }}
      />
      <motion.line
        x1={352}
        y1={175}
        x2={352}
        y2={205}
        stroke="var(--color-faint)"
        strokeWidth={2}
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.3, ease: EASE, delay: 0.95 }}
      />
      <motion.g
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.4, delay: 1.05 }}
      >
        <circle cx={336} cy={183} r={3} fill="var(--color-faint)" />
        <circle cx={324} cy={192} r={3} fill="var(--color-faint)" />
        <circle cx={314} cy={183} r={3} fill="var(--color-faint)" />
      </motion.g>

      {/* Cochlea spiral */}
      <motion.path
        d="M276,220 L267.2,237.2 L250,242.6 L235.2,234.8 L230.8,220 L237.6,207.6 L250,204.2 L260,210 L262.4,220 L257.6,227.6 L250,229 L244.8,225.2 L244.4,220 L247.2,217.2 L250,217.8"
        fill="none"
        stroke="var(--color-muted)"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 1, ease: EASE, delay: 0.5 }}
      />

      {/* VibraSafe transducer, at the mastoid */}
      <motion.rect
        x={398}
        y={240}
        width={26}
        height={14}
        rx={7}
        fill="var(--color-bone)"
        initial={{ opacity: 0, scale: 0.6 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5, ease: EASE, delay: 1.15 }}
        style={{ transformOrigin: "411px 247px" }}
      />

      {/* Bone-conduction pathway — the live route, drawn last */}
      <motion.path
        d="M405,245 C370,255 320,250 290,235 C270,225 265,225 255,222"
        fill="none"
        stroke="var(--color-bone)"
        strokeWidth={3}
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 1.3, ease: EASE, delay: 1.35 }}
      />

      {/* Labels */}
      <motion.g
        className="pw-label"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, delay: 1 }}
      >
        <text x={445} y={100} fontSize={11} fill="var(--color-faint)" fontWeight={600}>
          Acoustic pathway
        </text>
        <text x={445} y={116} fontSize={10} fill="var(--color-faint)">
          bypassed by design
        </text>

        <text x={286} y={162} fontSize={10} fill="var(--color-faint)">
          Eardrum + ossicles
        </text>

        <text x={165} y={205} fontSize={10} fill="var(--color-muted)">
          Cochlea
        </text>
      </motion.g>

      <motion.g
        className="pw-label"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, delay: 1.9 }}
      >
        <text x={392} y={280} fontSize={11} fill="var(--color-bone)" fontWeight={700}>
          Mastoid transducer
        </text>
        <text x={280} y={300} fontSize={11} fill="var(--color-bone)" fontWeight={700}>
          Bone conduction — direct to cochlea
        </text>
      </motion.g>
    </svg>
  );
}

const CLINICAL_CARDS = [
  {
    Icon: Ear,
    tone: "text-bone",
    ring: "bg-bone/10",
    title: "Cranial Resonance Metrics",
    body: "The 12mm bone-conduction transducer vibrates the mastoid process directly. That vibration travels through the temporal bone to the cochlea, bypassing the tympanic membrane and the ossicular chain — malleus, incus, stapes — entirely. It's the same route skull-anchored hearing aids have used for decades: audio delivered as bone resonance, not air pressure.",
  },
  {
    Icon: Brain,
    tone: "text-brand",
    ring: "bg-brand/10",
    title: "Haptic Cognitive Load",
    body: "Visual alerting competes for the same channel Deaf and hard-of-hearing users already lean on hardest — reading lips, scanning a room, watching hands sign. Under Wickens' Multiple Resource Theory, vision and touch draw on largely separate attentional pools, so routing an alert through touch avoids fighting everything already demanding your eyes.",
  },
  {
    Icon: Zap,
    tone: "text-tactile",
    ring: "bg-tactile/10",
    title: "Real-Time Latency",
    body: "The Nordic nRF52810 radio supports Bluetooth 5's short connection intervals — as low as 7.5ms between packets. End to end, from the companion app classifying a sound to a piezo node firing, the design target is sub-20ms: fast enough that the alert and the event it's flagging still feel simultaneous.",
  },
];

export default function BiomechanicalArchitecture() {
  return (
    <section id="biomechanics" className="gc-section">
      <div className="max-w-2xl">
        <motion.span
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: EASE }}
          className="gc-eyebrow"
        >
          <Ear size={13} strokeWidth={1.5} />
          Biomechanical Architecture
        </motion.span>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.08 }}
          className="mt-5 font-semibold tracking-tight text-ink"
          style={{ fontSize: "var(--text-h1)" }}
        >
          How the signal actually reaches you.
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.14 }}
          className="mt-4 text-base leading-relaxed text-muted"
        >
          Two routes, deliberately separated. One is acoustic and
          bypassed on purpose. The other is mechanical, direct, and
          exactly where the audio actually goes.
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 28, filter: "blur(6px)" }}
        whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.8, ease: EASE, delay: 0.2 }}
        className="gc-shell mt-12"
      >
        <div className="gc-core p-6 sm:p-10">
          <PathwayDiagram />
        </div>
      </motion.div>

      <div className="mt-6 grid gap-5 md:grid-cols-3">
        {CLINICAL_CARDS.map(({ Icon, tone, ring, title, body }, i) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 28, filter: "blur(6px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.8, ease: EASE, delay: i * 0.12 }}
            className="gc-shell gc-shell-hover"
          >
            <div className="gc-core h-full p-7">
              <span className={`grid h-11 w-11 place-items-center rounded-2xl ${ring} ${tone}`}>
                <Icon size={20} strokeWidth={1.5} />
              </span>
              <h3 className="mt-5 text-lg font-semibold text-ink">{title}</h3>
              <p className="mt-2.5 text-sm leading-relaxed text-muted">{body}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
