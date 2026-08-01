"use client";

import { Siren, Flame, Car, ShieldAlert, Square } from "lucide-react";
import { useDevice } from "@/lib/store";
import { useSimulator } from "@/lib/simulatorStore";
import * as audioEngine from "@/lib/audio/audioEngine";
import type { PatternId } from "@/lib/audio/types";
import BearingAimPicker from "./BearingAimPicker";

/* ==================================================================
   ALERT PATTERN BOARD
   ------------------------------------------------------------------
   The headphone test board: pick a direction, trigger one of the 4
   alert patterns, watch it play through audioEngine.play() and light
   up the matching tactile node on the 3D model in real time (see the
   simulatorActive/liveTactileBurst wiring in VibraSafeModel.tsx).
================================================================== */

const PATTERNS: { id: PatternId; label: string; Icon: typeof Siren; needsAim: boolean }[] = [
  { id: "siren", label: "Emergency Siren", Icon: Siren, needsAim: true },
  { id: "smokeAlarm", label: "Smoke Alarm", Icon: Flame, needsAim: true },
  { id: "vehicleApproach", label: "Vehicle Approach", Icon: Car, needsAim: false },
  { id: "sosConfirm", label: "SOS Confirmation", Icon: ShieldAlert, needsAim: false },
];

export default function AlertPatternBoard() {
  const bearing = useDevice((s) => s.bearing);
  const simulatorActive = useDevice((s) => s.simulatorActive);
  const activePattern = useSimulator((s) => s.activePattern);

  return (
    <section
      className={`gc-card relative p-6 transition-colors ${
        simulatorActive ? "border-sos/60" : ""
      }`}
      aria-labelledby="patterns-h"
    >
      {/* Canvas-independent visual fallback: this pulses from the same
          simulatorActive flag VibraSafeModel.tsx reads, so an alert
          is unmissable even if the 3D canvas drops a frame or WebGL
          misbehaves on unfamiliar expo-floor hardware. */}
      {simulatorActive && (
        <span className="pointer-events-none absolute right-5 top-5 grid h-3 w-3" aria-hidden>
          <span className="absolute inset-0 rounded-full bg-sos" />
          <span className="gc-pulse-ring absolute inset-0 rounded-full bg-sos" />
        </span>
      )}

      <h3 id="patterns-h" className="text-lg font-bold">
        Trigger an alert
      </h3>
      <p className="mt-1 text-sm text-muted">
        Each pattern plays through your calibrated volume and lights the
        matching tactile node on the model in real time.
      </p>

      <div className="mt-5">
        <BearingAimPicker />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        {PATTERNS.map(({ id, label, Icon }) => {
          const on = activePattern === id;
          return (
            <button
              key={id}
              onClick={() => audioEngine.play(id, { bearing })}
              aria-pressed={on}
              className={`gc-tap flex-col gap-1.5 rounded-xl border-2 px-3 py-4 text-center transition ${
                on
                  ? "gc-breathe border-tactile bg-tactile/20 text-tactile"
                  : "border-line bg-surface-2 text-muted hover:border-muted"
              }`}
            >
              <Icon size={22} aria-hidden />
              <span className="text-xs font-bold leading-tight">{label}</span>
            </button>
          );
        })}
      </div>

      <button
        onClick={() => audioEngine.stop()}
        disabled={!activePattern}
        className="gc-btn gc-btn-ghost mt-4 w-full disabled:opacity-40"
      >
        <Square size={16} aria-hidden />
        Stop
      </button>

      <p role="status" aria-live="assertive" className="sr-only">
        {activePattern ? `${activePattern} playing.` : "No alert playing."}
      </p>
    </section>
  );
}
