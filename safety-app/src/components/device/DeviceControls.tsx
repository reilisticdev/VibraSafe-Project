"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  Bluetooth,
  BluetoothConnected,
  BluetoothSearching,
  BatteryMedium,
  Radar,
  Waves,
  Volume2,
  TriangleAlert,
  ShieldCheck,
} from "lucide-react";
import {
  useDevice,
  ZONE_LABELS,
  TACTILE_ZONE_COUNT,
  bearingToZone,
} from "@/lib/store";

/* ==================================================================
   DEVICE CONTROLS
   ------------------------------------------------------------------
   Every control here writes to the shared store, which the 3D model
   subscribes to. Adjusting a slider or firing SOS updates the canvas
   on the same frame.
================================================================== */

/* ------------------------- Connection ------------------------- */
export function ConnectionPanel() {
  const connection = useDevice((s) => s.connection);
  const signal = useDevice((s) => s.signalStrength);
  const left = useDevice((s) => s.leftBattery);
  const right = useDevice((s) => s.rightBattery);
  const beginPairing = useDevice((s) => s.beginPairing);

  const meta = {
    connected: { Icon: BluetoothConnected, text: "Paired", tone: "text-safe" },
    pairing: { Icon: BluetoothSearching, text: "Pairing...", tone: "text-brand" },
    disconnected: { Icon: Bluetooth, text: "Not connected", tone: "text-muted" },
  }[connection];

  const { Icon } = meta;

  return (
    <section className="gc-card p-5" aria-labelledby="conn-h">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span
            className={`grid h-12 w-12 place-items-center rounded-2xl bg-surface-2 ${meta.tone}`}
          >
            <Icon size={22} aria-hidden />
          </span>
          <div>
            <h3 id="conn-h" className="gc-label">
              Bluetooth LE
            </h3>
            <p className={`text-lg font-bold ${meta.tone}`}>{meta.text}</p>
          </div>
        </div>

        {/* Signal strength bars, with a text equivalent for screen readers */}
        <div
          className="flex items-end gap-1"
          role="meter"
          aria-valuenow={signal}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Signal strength ${signal} percent`}
        >
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              style={{ height: 8 + i * 6 }}
              className={`w-2 rounded-sm ${
                signal > i * 25 ? "bg-safe" : "bg-line"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        {[
          { side: "Left cuff", pct: left },
          { side: "Right cuff", pct: right },
        ].map(({ side, pct }) => (
          <div key={side} className="rounded-xl bg-surface-2 p-3">
            <div className="flex items-center gap-2 text-muted">
              <BatteryMedium size={16} aria-hidden />
              <span className="text-xs font-semibold">{side}</span>
            </div>
            <p className="mt-1 text-xl font-bold tabular-nums">{pct}%</p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-line">
              <div
                className={`h-full rounded-full ${pct > 20 ? "bg-safe" : "bg-sos"}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {connection !== "connected" && (
        <button
          onClick={beginPairing}
          className="gc-btn gc-btn-primary mt-4 w-full"
        >
          {connection === "pairing" ? "Searching for cuffs..." : "Pair device"}
        </button>
      )}
    </section>
  );
}

/* --------------------------- Sliders --------------------------- */
export function ChannelSlider({
  id,
  label,
  hint,
  value,
  onChange,
  accent,
  Icon,
}: {
  id: string;
  label: string;
  hint: string;
  value: number;
  onChange: (v: number) => void;
  accent: string;
  Icon: LucideIcon;
}) {
  return (
    <div className="gc-card p-5">
      <label htmlFor={id} className="flex items-start gap-3">
        <span
          className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-surface-2"
          style={{ color: accent }}
        >
          <Icon size={20} aria-hidden />
        </span>
        <span className="flex-1">
          <span className="block text-base font-bold">{label}</span>
          <span className="mt-0.5 block text-sm leading-snug text-muted">
            {hint}
          </span>
        </span>
        <span
          className="text-2xl font-extrabold tabular-nums"
          style={{ color: accent }}
        >
          {value}
        </span>
      </label>

      <input
        id={id}
        type="range"
        min={0}
        max={100}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="gc-range mt-3"
        style={
          {
            "--gc-accent": accent,
            "--gc-fill": `${value}%`,
          } as React.CSSProperties
        }
        aria-describedby={`${id}-hint`}
      />
      <span id={`${id}-hint`} className="sr-only">
        {hint}
      </span>
    </div>
  );
}

/* ----------------------- Spatial direction ----------------------- */
function SpatialDial() {
  const bearing = useDevice((s) => s.bearing);
  const setBearing = useDevice((s) => s.setBearing);
  const spatial = useDevice((s) => s.spatialAwareness);
  const toggle = useDevice((s) => s.toggleSpatialAwareness);
  const activeZone = bearingToZone(bearing);

  return (
    <section className="gc-card p-5" aria-labelledby="spatial-h">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-surface-2 text-tactile">
            <Radar size={20} aria-hidden />
          </span>
          <div>
            <h3 id="spatial-h" className="text-base font-bold">
              Spatial direction
            </h3>
            <p className="text-sm text-muted">
              Tactile channel - carries direction
            </p>
          </div>
        </div>

        <button
          onClick={toggle}
          role="switch"
          aria-checked={spatial}
          aria-label="360 degree spatial awareness"
          className={`relative h-9 w-16 shrink-0 rounded-full border-2 transition ${
            spatial ? "border-tactile bg-tactile/25" : "border-line bg-surface-2"
          }`}
        >
          <motion.span
            layout
            transition={{ type: "spring", stiffness: 500, damping: 34 }}
            className={`absolute top-1/2 h-6 w-6 -translate-y-1/2 rounded-full ${
              spatial ? "right-1 bg-tactile" : "left-1 bg-muted"
            }`}
          />
        </button>
      </div>

      {/* Radial zone picker - tapping a zone simulates an event from
          that bearing and fires the matching node on the 3D cuff. */}
      <div className="mt-5 grid grid-cols-2 gap-2">
        {Array.from({ length: TACTILE_ZONE_COUNT }, (_, i) => {
          const deg = (360 / TACTILE_ZONE_COUNT) * i;
          const on = spatial && activeZone === i;
          return (
            <button
              key={i}
              onClick={() => setBearing(deg)}
              disabled={!spatial}
              aria-pressed={on}
              className={`gc-tap flex-col gap-0.5 rounded-xl border-2 px-2 text-center transition disabled:opacity-40 ${
                on
                  ? "border-tactile bg-tactile/20 text-tactile"
                  : "border-line bg-surface-2 text-muted hover:border-muted"
              }`}
            >
              <span className="text-xs font-bold leading-tight">
                {ZONE_LABELS[i]}
              </span>
              <span className="text-[10px] tabular-nums opacity-70">{deg}°</span>
            </button>
          );
        })}
      </div>

      <p className="mt-3 text-xs leading-relaxed text-muted">
        Each cuff vibrates independently on its own ear cartilage, so left
        and right stay distinguishable. Direction is never sent through the
        bone conduction channel.
      </p>
    </section>
  );
}

/* ----------------------------- SOS ----------------------------- */
function SosControl() {
  const sos = useDevice((s) => s.sosActive);
  const trigger = useDevice((s) => s.triggerSos);
  const clear = useDevice((s) => s.clearSos);

  return (
    <section
      className={`gc-card relative overflow-hidden p-5 transition ${
        sos ? "border-sos" : ""
      }`}
      aria-labelledby="sos-h"
    >
      {sos && (
        <span className="pointer-events-none absolute inset-0 bg-sos/10" aria-hidden />
      )}
      <div className="relative flex items-center gap-3">
        <span
          className={`grid h-11 w-11 place-items-center rounded-xl ${
            sos ? "bg-sos text-void" : "bg-surface-2 text-sos"
          }`}
        >
          {sos ? <TriangleAlert size={20} /> : <ShieldCheck size={20} />}
        </span>
        <div>
          <h3 id="sos-h" className="text-base font-bold">
            Emergency SOS
          </h3>
          <p className="text-sm text-muted">
            {sos
              ? "Broadcasting to your safety network"
              : "Alerts trusted contacts with your location"}
          </p>
        </div>
      </div>

      <button
        onClick={sos ? clear : trigger}
        className={`gc-btn mt-4 w-full text-lg tracking-wide ${
          sos
            ? "gc-btn-ghost"
            : "bg-sos text-void hover:brightness-110"
        }`}
      >
        {sos ? "Cancel SOS" : "Trigger SOS"}
      </button>

      {/* aria-live so the state change is announced, not just shown. */}
      <p role="status" aria-live="assertive" className="sr-only">
        {sos ? "SOS active. Contacts notified." : "SOS inactive."}
      </p>
    </section>
  );
}

/* --------------------------- Export --------------------------- */
export default function DeviceControls() {
  const tactile = useDevice((s) => s.tactileIntensity);
  const setTactile = useDevice((s) => s.setTactileIntensity);
  const bc = useDevice((s) => s.bcVolume);
  const setBc = useDevice((s) => s.setBcVolume);

  return (
    <div className="grid gap-4">
      <ConnectionPanel />

      <ChannelSlider
        id="tactile-intensity"
        label="Vibration intensity"
        hint="Tactile, non-auditory feedback felt on the ear cartilage."
        value={tactile}
        onChange={setTactile}
        accent="var(--color-tactile)"
        Icon={Waves}
      />

      <ChannelSlider
        id="bc-volume"
        label="Bone conduction volume"
        hint="Audio delivered by driving the mastoid bone behind the ear."
        value={bc}
        onChange={setBc}
        accent="var(--color-bone)"
        Icon={Volume2}
      />

      <SpatialDial />
      <SosControl />
    </div>
  );
}
