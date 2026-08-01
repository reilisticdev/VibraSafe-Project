"use client";

import { create } from "zustand";
import type { PatternId } from "@/lib/audio/types";

/* ==================================================================
   SIMULATOR UI-FLOW STATE
   ------------------------------------------------------------------
   Deliberately holds only the Simulator page's own flow state, not
   the live audio-burst numbers - those live on useDevice, because
   that's the store VibraSafeModel.tsx already reads per frame.
   Nothing outside /simulator needs calibrated/activePattern.
================================================================== */

interface SimulatorStore {
  /** Has the user completed the "Enable Audio & Calibrate" gate yet?
   *  No alert tone may play before this is true. */
  calibrated: boolean;
  activePattern: PatternId | null;
  setCalibrated: (v: boolean) => void;
  setActivePattern: (p: PatternId | null) => void;
}

export const useSimulator = create<SimulatorStore>((set) => ({
  calibrated: false,
  activePattern: null,
  setCalibrated: (v) => set({ calibrated: v }),
  setActivePattern: (p) => set({ activePattern: p }),
}));
