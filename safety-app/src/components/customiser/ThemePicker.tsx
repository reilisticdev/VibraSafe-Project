"use client";

import { motion } from "framer-motion";
import { Check, Lock } from "lucide-react";
import { useDevice } from "@/lib/store";
import { THEMES, SIGNAL } from "@/lib/themes";

/* ==================================================================
   THEME PICKER
   ------------------------------------------------------------------
   Writes straight to the shared store, so the 3D cuff restyles on the
   next frame. Themes are named by style rather than by gender - any
   person can wear any finish.
================================================================== */

export default function ThemePicker() {
  const themeId = useDevice((s) => s.themeId);
  const setThemeId = useDevice((s) => s.setThemeId);
  const setFitMode = useDevice((s) => s.setFitMode);

  return (
    <div>
      <ul
        className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5"
        role="radiogroup"
        aria-label="Cuff finish"
      >
        {THEMES.map((t) => {
          const on = themeId === t.id;
          return (
            <li key={t.id}>
              <button
                role="radio"
                aria-checked={on}
                onClick={() => {
                  setThemeId(t.id);
                  // Jump to the worn view so the change is visible on
                  // the ear, which is where the choice actually matters.
                  setFitMode("worn");
                }}
                className={`gc-card gc-card-hover w-full p-3 text-left transition ${
                  on ? "!border-brand" : ""
                }`}
              >
                <span className="relative flex items-center gap-2">
                  {/* Two-tone swatch: jewelry over wire finish. */}
                  <span
                    className="h-9 w-9 shrink-0 rounded-full border border-white/25"
                    style={{
                      background: `linear-gradient(135deg, ${t.jewel} 0%, ${t.jewel} 52%, ${t.wire} 52%, ${t.wire} 100%)`,
                    }}
                    aria-hidden
                  />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-bold">
                      {t.name}
                    </span>
                    <span className="block truncate text-[11px] text-faint">
                      {t.blurb}
                    </span>
                  </span>
                  {on && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                      className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-brand text-void"
                    >
                      <Check size={12} strokeWidth={3} aria-hidden />
                    </motion.span>
                  )}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {/* What a theme deliberately cannot change. Stating this up front
          is part of the safety argument, not a footnote. */}
      <div className="gc-card mt-5 p-5">
        <div className="flex items-center gap-2">
          <Lock size={15} className="text-faint" aria-hidden />
          <h3 className="gc-label !text-muted">Fixed on every finish</h3>
        </div>
        <ul className="mt-4 grid gap-3 sm:grid-cols-3">
          {[
            {
              c: SIGNAL.tactileActive,
              t: "Alert amber",
              d: "An active tactile zone always fires amber.",
            },
            {
              c: SIGNAL.sos,
              t: "Emergency red",
              d: "SOS always fires red, on every theme.",
            },
            {
              c: SIGNAL.bonePad,
              t: "Skin-tone pad",
              d: "The bone conduction pad stays neutral and discreet.",
            },
          ].map(({ c, t, d }) => (
            <li key={t} className="flex items-start gap-2.5">
              <span
                className="mt-0.5 h-4 w-4 shrink-0 rounded-full border border-white/25"
                style={{ background: c }}
                aria-hidden
              />
              <span>
                <span className="block text-sm font-bold">{t}</span>
                <span className="block text-xs leading-snug text-muted">{d}</span>
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs leading-relaxed text-faint">
          Safety signals are never themeable. If a finish could recolour an
          alert, someone could unknowingly choose a palette that made their own
          emergency indicator hard to see.
        </p>
      </div>
    </div>
  );
}
