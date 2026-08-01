"use client";

import { useDevice } from "@/lib/store";

/* ==================================================================
   MOCK MAP
   ------------------------------------------------------------------
   A stylised street grid with a few pins, drawn entirely in inline
   SVG - no mapping library. This is an expo demo with static/mock
   geo data; a real tile provider would add an API-key/tile-server
   dependency this app doesn't need yet. If real pan/zoom becomes a
   requirement later, react-leaflet + OSM tiles is the lightest real
   option.
================================================================== */

const STREETS = [
  "M20,60 H380",
  "M20,140 H380",
  "M20,220 H380",
  "M90,10 V270",
  "M190,10 V270",
  "M290,10 V270",
];

export default function MockMap() {
  const sos = useDevice((s) => s.sosActive);

  return (
    <div className="gc-card relative h-72 overflow-hidden p-0 sm:h-96">
      <svg viewBox="0 0 400 280" className="h-full w-full" role="img" aria-label="Map showing your location and nearby emergency contacts">
        <rect width="400" height="280" fill="var(--color-surface-2)" />
        {STREETS.map((d) => (
          <path key={d} d={d} stroke="var(--color-line)" strokeWidth="6" fill="none" />
        ))}

        {/* Trusted contact pins */}
        <g>
          <circle cx="90" cy="140" r="9" fill="var(--color-safe)" />
          <circle cx="290" cy="60" r="9" fill="var(--color-safe)" />
        </g>

        {/* You are here */}
        <g>
          <circle
            cx="190"
            cy="220"
            r="14"
            fill={sos ? "var(--color-sos)" : "var(--color-brand)"}
            opacity="0.25"
          />
          <circle cx="190" cy="220" r="7" fill={sos ? "var(--color-sos)" : "var(--color-brand)"} />
        </g>
      </svg>

      <div className="pointer-events-none absolute bottom-3 left-3 rounded-lg border border-line-soft bg-void/70 px-3 py-1.5 backdrop-blur">
        <p className="text-[11px] font-semibold text-muted">
          {sos ? "Broadcasting your location" : "Your location · trusted contacts nearby"}
        </p>
      </div>
    </div>
  );
}
