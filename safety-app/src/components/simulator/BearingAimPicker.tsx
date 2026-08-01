"use client";

import { useDevice, ZONE_LABELS, TACTILE_ZONE_COUNT, bearingToZone } from "@/lib/store";

/* ==================================================================
   BEARING AIM PICKER
   ------------------------------------------------------------------
   Same 4-quadrant layout as DeviceControls.tsx's SpatialDial - lets
   the wearer pick which direction a simulated Siren or Smoke Alarm
   should appear to come from before triggering it. Vehicle Approach
   ignores this (it sweeps its own bearing across the pass) and SOS
   Confirmation ignores it too (it lights all four nodes).
================================================================== */

export default function BearingAimPicker() {
  const bearing = useDevice((s) => s.bearing);
  const setBearing = useDevice((s) => s.setBearing);
  const activeZone = bearingToZone(bearing);

  return (
    <div>
      <p className="gc-label">Aim the alert</p>
      <div className="mt-2 grid grid-cols-2 gap-2">
        {Array.from({ length: TACTILE_ZONE_COUNT }, (_, i) => {
          const deg = (360 / TACTILE_ZONE_COUNT) * i;
          const on = activeZone === i;
          return (
            <button
              key={i}
              onClick={() => setBearing(deg)}
              aria-pressed={on}
              className={`gc-tap flex-col gap-0.5 rounded-xl border-2 px-2 text-center transition ${
                on
                  ? "border-tactile bg-tactile/20 text-tactile"
                  : "border-line bg-surface-2 text-muted hover:border-muted"
              }`}
            >
              <span className="text-xs font-bold leading-tight">{ZONE_LABELS[i]}</span>
              <span className="text-[10px] tabular-nums opacity-70">{deg}&deg;</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
