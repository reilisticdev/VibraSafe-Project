/* ==================================================================
   SAFETY PROGRAMS
   ------------------------------------------------------------------
   Named presets a wearer picks on the Dashboard. Each one is just a
   bundled setting of the same three channels DeviceControls already
   exposes individually (tactileIntensity, bcVolume, spatialAwareness)
   - a program is a shortcut, not a separate code path, so anything
   that already trusts those three fields keeps working unmodified.

     Everyday - balanced default, matches the store's own initial state.
     Street   - max directional awareness for outdoor/traffic contexts.
     Focus    - quiet by default; only urgent/SOS events should break
                through, so spatial awareness for routine events is off.
     Sleep    - tactile only. No bone-conduction audio while sleeping,
                but vibration stays at full strength since that's the
                only channel that can wake someone.
================================================================== */

export type SafetyProgram = "everyday" | "street" | "focus" | "sleep";

export interface SafetyProgramDef {
  id: SafetyProgram;
  name: string;
  blurb: string;
  tactileIntensity: number;
  bcVolume: number;
  spatialAwareness: boolean;
}

export const SAFETY_PROGRAMS: SafetyProgramDef[] = [
  {
    id: "everyday",
    name: "Everyday",
    blurb: "Balanced awareness",
    tactileIntensity: 65,
    bcVolume: 40,
    spatialAwareness: true,
  },
  {
    id: "street",
    name: "Street",
    blurb: "Max directional awareness outdoors",
    tactileIntensity: 90,
    bcVolume: 55,
    spatialAwareness: true,
  },
  {
    id: "focus",
    name: "Focus",
    blurb: "Only urgent alerts break through",
    tactileIntensity: 40,
    bcVolume: 20,
    spatialAwareness: false,
  },
  {
    id: "sleep",
    name: "Sleep",
    blurb: "Tactile only, no bone-conduction audio",
    tactileIntensity: 100,
    bcVolume: 0,
    spatialAwareness: true,
  },
];

export function getSafetyProgramPreset(id: SafetyProgram): SafetyProgramDef {
  return SAFETY_PROGRAMS.find((p) => p.id === id) ?? SAFETY_PROGRAMS[0];
}
