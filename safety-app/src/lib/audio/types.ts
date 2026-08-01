/* ==================================================================
   AUDIO ENGINE TYPES
   ------------------------------------------------------------------
   Shared contract between audioEngine.ts and each pattern file under
   patterns/. A PatternFactory builds a fully wired, already-started
   Web Audio graph and hands back a handle to stop it.
================================================================== */

export type PatternId = "siren" | "smokeAlarm" | "vehicleApproach" | "sosConfirm";

export interface PatternHandle {
  /** Ramp to silence and disconnect every node this pattern created. */
  stop: () => void;
  /** Optional per-rAF-tick hook for patterns that animate store state
   *  directly (e.g. Vehicle Approach sweeping the bearing live). */
  onFrame?: (currentTime: number) => void;
}

export interface PatternOptions {
  /** Compass bearing (degrees) the simulated event originates from. */
  bearing?: number;
}

export type PatternFactory = (
  ctx: AudioContext,
  input: GainNode,
  opts: PatternOptions
) => PatternHandle;
