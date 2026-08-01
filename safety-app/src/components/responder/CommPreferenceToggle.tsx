"use client";

import { motion } from "framer-motion";
import { useProfile, type CommPreference } from "@/lib/profileStore";

const OPTIONS: CommPreference[] = ["SASL", "Written"];

/* Same sliding-pill segmented-control pattern as FitModeToggle.tsx. */
export default function CommPreferenceToggle() {
  const commPreference = useProfile((s) => s.commPreference);
  const setCommPreference = useProfile((s) => s.setCommPreference);
  const hasHydrated = useProfile((s) => s._hasHydrated);

  return (
    <div
      role="tablist"
      aria-label="Preferred communication method"
      className="grid grid-cols-2 gap-1 rounded-2xl border border-line-soft bg-surface/80 p-1 backdrop-blur"
    >
      {OPTIONS.map((option) => {
        const on = hasHydrated && commPreference === option;
        return (
          <button
            key={option}
            role="tab"
            aria-selected={on}
            onClick={() => setCommPreference(option)}
            className={`gc-tap relative rounded-xl px-2 text-sm font-bold transition ${
              on ? "text-void" : "text-muted hover:text-ink"
            }`}
          >
            {on && (
              <motion.span
                layoutId="comm-pill"
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
                className="absolute inset-0 rounded-xl bg-brand"
              />
            )}
            <span className="relative">
              {option === "SASL" ? "South African Sign Language" : "Written"}
            </span>
          </button>
        );
      })}
    </div>
  );
}
