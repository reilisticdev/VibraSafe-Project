"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight, Radar } from "lucide-react";

const EASE = [0.32, 0.72, 0, 1] as const;

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  // Slow Ken Burns drift on the background as the viewer scrolls through it.
  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.14]);
  const bgOpacity = useTransform(scrollYProgress, [0, 0.9], [1, 0.2]);
  const copyY = useTransform(scrollYProgress, [0, 1], [0, 50]);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section
      ref={sectionRef}
      id="top"
      className="relative h-screen supports-[height:100dvh]:h-[100dvh] overflow-hidden"
    >
      {/* Full-bleed video-style background — native asset is 256x208, so it
          will read softer at this scale; the wash below keeps it moody
          rather than pixel-crisp. */}
      <motion.img
        src="/hero-animation.webp"
        alt="VibraSafe device animating through its tactile and bone-conduction signal states"
        style={{ scale: bgScale, opacity: bgOpacity }}
        className="absolute inset-0 -z-20 h-full w-full object-cover"
        fetchPriority="high"
      />

      {/* Legibility wash: darkest at the bottom-left where copy sits. */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(180deg, rgba(5,5,5,0.6) 0%, rgba(5,5,5,0.22) 30%, rgba(5,5,5,0.5) 62%, rgba(5,5,5,0.94) 100%), linear-gradient(90deg, rgba(5,5,5,0.65) 0%, rgba(5,5,5,0.05) 45%)",
        }}
        aria-hidden
      />
      {/* Signal-coloured ambient glow, echoing the tactile/bone channels. */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(55rem 38rem at 5% 100%, rgb(245 165 36 / 0.16), transparent 60%), radial-gradient(48rem 34rem at 100% 0%, rgb(56 217 232 / 0.14), transparent 62%)",
        }}
        aria-hidden
      />

      {/* Copy anchored bottom-left on a strict flex grid — frames the video
          instead of covering its center. */}
      <motion.div
        style={{ y: copyY, opacity: copyOpacity }}
        className="relative z-10 flex h-full flex-col justify-end px-6 pb-40 pt-28 sm:px-10 sm:pb-48 lg:px-16 lg:pb-56"
      >
        <div className="max-w-xl">
          <motion.span
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE }}
            className="gc-eyebrow"
          >
            <Radar size={13} strokeWidth={1.5} />
            Vibration-based assistive technology
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.1 }}
            className="mt-7 font-semibold tracking-tight text-ink"
            style={{
              fontSize: "var(--text-display)",
              lineHeight: 1.03,
              textShadow: "0 4px 32px rgba(0,0,0,0.5)",
            }}
          >
            Safety You Can{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "linear-gradient(120deg, #f5a524, #ffcf7a)" }}
            >
              Feel
            </span>
            , Not Just Hear.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.2 }}
            className="mt-6 max-w-lg text-lg leading-relaxed text-muted"
          >
            A fashionable ear cuff that turns the world around you into
            360-degree touch — directional vibration on one channel, clear
            bone-conducted audio on the other. Paired with an emergency app
            and a physical safety kit that still works when the battery
            doesn&apos;t.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.3 }}
            className="mt-10 flex flex-wrap items-center gap-3"
          >
            <a href="#device" className="gc-btn gc-btn-primary gc-btn-primary-glow">
              Explore the device
              <span className="gc-btn-icon">
                <ArrowUpRight size={16} strokeWidth={1.5} />
              </span>
            </a>
            <a href="#science" className="gc-btn gc-btn-ghost">
              See the science
              <span className="gc-btn-icon">
                <ArrowUpRight size={16} strokeWidth={1.5} />
              </span>
            </a>
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll cue, bottom-right — balances the bottom-left copy block so
          the frame reads intentional rather than lopsided. */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.8 }}
        className="pointer-events-none absolute bottom-8 right-6 z-10 sm:right-10 lg:right-16"
      >
        <span className="flex h-9 w-6 items-start justify-center rounded-full border border-white/25 p-1.5">
          <motion.span
            animate={{ y: [0, 10, 0], opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: EASE }}
            className="h-1.5 w-1.5 rounded-full bg-white/70"
          />
        </span>
      </motion.div>
    </section>
  );
}
