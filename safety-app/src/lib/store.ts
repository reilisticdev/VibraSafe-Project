"use client";

import { create } from "zustand";
import { getSafetyProgramPreset, type SafetyProgram } from "@/lib/safetyPrograms";
import { generateId } from "@/lib/generateId";

export type { SafetyProgram };

/* ==================================================================
   VIBRASAFE — SHARED DEVICE STATE
   ------------------------------------------------------------------
   Single source of truth for the simulated ear cuffs. Both the 2D UI
   controls and the react-three-fiber model subscribe to this store,
   which is what makes the 3D viewer react in real time.

   SCIENTIFIC CONSTRAINT (validated Phase 1 — do not blur these):
     - tactileIntensity drives NON-AUDITORY vibration on the cuff.
       This is the channel that carries DIRECTION, because each cuff
       stimulates its own ear cartilage with no cross-talk.
     - bcVolume drives BONE CONDUCTION (auditory, via skull vibration).
       Transcranial attenuation is ~0 dB below 1 kHz, so a bone
       conduction signal reaches BOTH cochleae. It therefore carries
       AUDIO CONTENT ONLY and must never be used for localisation.
================================================================== */

export type ConnectionState = "disconnected" | "pairing" | "connected";

/**
 * How the 3D scene is presented.
 *  worn     - device seated on the ear, with jaw and upper neck shown
 *  device   - hardware only, no anatomy
 *  exploded - components separated and labelled
 */
export type FitMode = "worn" | "device" | "exploded";

/** Environmental events the app classifies and maps to vibration patterns. */
export type AlertKind = "siren" | "alarm" | "vehicle" | "voice" | "doorbell";

export interface AlertEvent {
  id: string;
  kind: AlertKind;
  label: string;
  /** Compass bearing of the source. 0 = directly ahead, increasing clockwise. */
  bearing: number;
  at: number;
}

/** Four tactile nodes spaced evenly around the cuff, matching the real
 *  GC_TactileNode_0..3 meshes baked into vibra-safe.glb. */
export const TACTILE_ZONE_COUNT = 4;

/** Human-readable name for each zone, used for screen readers. */
export const ZONE_LABELS = ["Front", "Right", "Rear", "Left"] as const;

/** Maps a compass bearing to the nearest physical tactile node. */
export function bearingToZone(bearing: number): number {
  const step = 360 / TACTILE_ZONE_COUNT;
  const normalised = ((bearing % 360) + 360) % 360;
  return Math.round(normalised / step) % TACTILE_ZONE_COUNT;
}

interface DeviceStore {
  /* ---- Connectivity (simulated Bluetooth LE link) ---- */
  connection: ConnectionState;
  signalStrength: number; // 0-100, drives the RSSI bars
  leftBattery: number;
  rightBattery: number;

  /* ---- Presentation ---- */
  fitMode: FitMode;
  /** Cosmetic theme id. Affects the wire and jewelry only - never the
      safety signal colours or the bone conduction pad. */
  themeId: string;

  /* ---- Output channels ---- */
  tactileIntensity: number; // 0-100 - non-auditory, directional
  bcVolume: number; // 0-100 - auditory, non-directional
  spatialAwareness: boolean; // master toggle for 360-degree mapping

  /* ---- Live state ---- */
  bearing: number; // current detected event bearing, degrees
  activeZone: number | null; // which tactile node is firing
  sosActive: boolean;
  alerts: AlertEvent[];

  /* ---- Safety program preset (Dashboard) ---- */
  safetyProgram: SafetyProgram;

  /* ---- Simulator live-sync overlay ----
     Written by the audio engine's own rAF loop while a demo alert is
     playing (src/lib/audio/audioEngine.ts). These are ADDITIVE inputs
     to the existing per-frame math in VibraSafeModel.tsx, never a
     replacement for tactileIntensity/bcVolume - the user's channel
     gain sliders still scale whatever the live audio is doing, exactly
     as they would scale a real detected event. */
  simulatorActive: boolean;
  liveTactileBurst: number; // 0-1, decays to 0 when the engine stops writing
  liveBoneBurst: number; // 0-1, same, bone-conduction side

  /* ---- Actions ---- */
  setFitMode: (m: FitMode) => void;
  setThemeId: (id: string) => void;
  setConnection: (c: ConnectionState) => void;
  beginPairing: () => void;
  setTactileIntensity: (v: number) => void;
  setBcVolume: (v: number) => void;
  toggleSpatialAwareness: () => void;
  setBearing: (deg: number) => void;
  triggerSos: () => void;
  clearSos: () => void;
  pushAlert: (kind: AlertKind, label: string, bearing: number) => void;
  dismissAlert: (id: string) => void;
  setSafetyProgram: (p: SafetyProgram) => void;
  setSimulatorActive: (v: boolean) => void;
  setLiveTactileBurst: (v: number) => void;
  setLiveBoneBurst: (v: number) => void;
}

export const useDevice = create<DeviceStore>((set, get) => ({
  connection: "connected",
  signalStrength: 86,
  leftBattery: 78,
  rightBattery: 74,

  fitMode: "device",
  themeId: "pearl",

  tactileIntensity: 65,
  bcVolume: 40,
  spatialAwareness: true,

  bearing: 45,
  activeZone: bearingToZone(45),
  sosActive: false,
  alerts: [],

  safetyProgram: "everyday",
  simulatorActive: false,
  liveTactileBurst: 0,
  liveBoneBurst: 0,

  setFitMode: (fitMode) => set({ fitMode }),

  setThemeId: (themeId) => set({ themeId }),

  setConnection: (connection) => set({ connection }),

  beginPairing: () => {
    set({ connection: "pairing", signalStrength: 0 });
    // Simulated BLE handshake so the demo has believable latency.
    window.setTimeout(() => {
      set({ connection: "connected", signalStrength: 86 });
    }, 2200);
  },

  setTactileIntensity: (v) =>
    set({ tactileIntensity: Math.max(0, Math.min(100, v)) }),

  setBcVolume: (v) => set({ bcVolume: Math.max(0, Math.min(100, v)) }),

  toggleSpatialAwareness: () => {
    const next = !get().spatialAwareness;
    set({
      spatialAwareness: next,
      activeZone: next ? bearingToZone(get().bearing) : null,
    });
  },

  setBearing: (deg) => {
    const bearing = ((deg % 360) + 360) % 360;
    set({
      bearing,
      activeZone: get().spatialAwareness ? bearingToZone(bearing) : null,
    });
  },

  triggerSos: () => set({ sosActive: true }),
  clearSos: () => set({ sosActive: false }),

  pushAlert: (kind, label, bearing) =>
    set((s) => ({
      bearing,
      activeZone: s.spatialAwareness ? bearingToZone(bearing) : null,
      alerts: [
        { id: generateId(), kind, label, bearing, at: Date.now() },
        ...s.alerts,
      ].slice(0, 8),
    })),

  dismissAlert: (id) =>
    set((s) => ({ alerts: s.alerts.filter((a) => a.id !== id) })),

  setSafetyProgram: (safetyProgram) => {
    const preset = getSafetyProgramPreset(safetyProgram);
    set((s) => ({
      safetyProgram,
      tactileIntensity: preset.tactileIntensity,
      bcVolume: preset.bcVolume,
      spatialAwareness: preset.spatialAwareness,
      activeZone: preset.spatialAwareness ? bearingToZone(s.bearing) : null,
    }));
  },

  setSimulatorActive: (v) => set({ simulatorActive: v }),
  setLiveTactileBurst: (v) =>
    set({ liveTactileBurst: Math.max(0, Math.min(1, v)) }),
  setLiveBoneBurst: (v) => set({ liveBoneBurst: Math.max(0, Math.min(1, v)) }),
}));
