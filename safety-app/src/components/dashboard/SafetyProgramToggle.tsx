"use client";

import { motion } from "framer-motion";
import { Sun, Footprints, Target, Moon } from "lucide-react";
import { useDevice, type SafetyProgram } from "@/lib/store";
import { SAFETY_PROGRAMS } from "@/lib/safetyPrograms";

/* ==================================================================
   SAFETY PROGRAM TOGGLE
   ------------------------------------------------------------------
   Structurally identical to FitModeToggle.tsx's segmented control -
   same sliding-pill affordance, same gc-tap sizing - just four
   options instead of three, and it writes safetyProgram instead of
   fitMode. Picking a program also re-applies its tactileIntensity/
   bcVolume/spatialAwareness bundle (see setSafetyProgram in store.ts).
================================================================== */

const ICONS: Record<SafetyProgram, typeof Sun> = {
  everyday: Sun,
  street: Footprints,
  focus: Target,
  sleep: Moon,
};

export default function SafetyProgramToggle() {
  const safetyProgram = useDevice((s) => s.safetyProgram);
  const setSafetyProgram = useDevice((s) => s.setSafetyProgram);
  const active = SAFETY_PROGRAMS.find((p) => p.id === safetyProgram);

  return (
    <div>
      <div
        role="tablist"
        aria-label="Safety program"
        className="grid grid-cols-4 gap-1 rounded-2xl border border-line-soft bg-surface/80 p-1 backdrop-blur"
      >
        {SAFETY_PROGRAMS.map(({ id, name }) => {
          const Icon = ICONS[id];
          const on = safetyProgram === id;
          return (
            <button
              key={id}
              role="tab"
              aria-selected={on}
              onClick={() => setSafetyProgram(id)}
              className={`gc-tap relative flex-col gap-0.5 rounded-xl px-1 text-xs font-bold transition ${
                on ? "text-void" : "text-muted hover:text-ink"
              }`}
            >
              {on && (
                <motion.span
                  layoutId="program-pill"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  className="absolute inset-0 rounded-xl bg-brand"
                />
              )}
              <span className="relative flex flex-col items-center gap-0.5">
                <Icon size={16} aria-hidden />
                {name}
              </span>
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-center text-xs text-faint">{active?.blurb}</p>
    </div>
  );
}
