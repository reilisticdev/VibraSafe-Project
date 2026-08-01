"use client";

import { motion } from "framer-motion";
import { PersonStanding, Box, Layers } from "lucide-react";
import { useDevice, type FitMode } from "@/lib/store";

/* Segmented control switching how the 3D scene is presented. */

const MODES: { id: FitMode; label: string; Icon: typeof Box; hint: string }[] = [
  { id: "worn", label: "Worn", Icon: PersonStanding, hint: "Placement on the ear (anatomy in progress)" },
  { id: "device", label: "Device", Icon: Box, hint: "True-to-scale hardware" },
  { id: "exploded", label: "Parts", Icon: Layers, hint: "Components and dimensions" },
];

export default function FitModeToggle() {
  const fitMode = useDevice((s) => s.fitMode);
  const setFitMode = useDevice((s) => s.setFitMode);
  const active = MODES.find((m) => m.id === fitMode);

  return (
    <div>
      <div
        role="tablist"
        aria-label="3D view mode"
        className="grid grid-cols-3 gap-1 rounded-2xl border border-line-soft bg-surface/80 p-1 backdrop-blur"
      >
        {MODES.map(({ id, label, Icon }) => {
          const on = fitMode === id;
          return (
            <button
              key={id}
              role="tab"
              aria-selected={on}
              onClick={() => setFitMode(id)}
              className={`gc-tap relative rounded-xl px-2 text-sm font-bold transition ${
                on ? "text-void" : "text-muted hover:text-ink"
              }`}
            >
              {on && (
                <motion.span
                  layoutId="fit-pill"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  className="absolute inset-0 rounded-xl bg-brand"
                />
              )}
              <span className="relative flex items-center gap-1.5">
                <Icon size={16} aria-hidden />
                {label}
              </span>
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-center text-xs text-faint">{active?.hint}</p>
    </div>
  );
}
