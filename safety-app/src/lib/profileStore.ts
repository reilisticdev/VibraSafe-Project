"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { useDevice } from "@/lib/store";

/* ==================================================================
   WEARER PROFILE
   ------------------------------------------------------------------
   Identity and onboarding state - distinct from useDevice, which is
   hardware/session telemetry. Dashboard and Simulator never read this;
   only onboarding and the Responder Card do.

   Persisted (unlike useDevice/useSimulator): an accidental refresh at
   an expo booth must not bounce a wearer back to onboarding or blank
   their name/hearing status mid-demo.

   skipHydration + the _hasHydrated flag exist so the server render
   and the client's first paint both show these coded defaults - the
   actual localStorage read is deferred to a manual rehydrate() call
   (see src/components/shell/StoreHydration.tsx), which is what avoids
   a hydration mismatch. Consumers that render profile fields as
   visible text/selected-state on first mount (ResponderCard.tsx,
   CommPreferenceToggle.tsx) must gate on _hasHydrated.
================================================================== */

export type HearingStatus = "Deaf" | "Hard of Hearing";
export type CommPreference = "SASL" | "Written";

interface ProfileStore {
  demoMode: boolean;
  onboardingComplete: boolean;
  deviceBound: boolean;

  userName: string;
  hearingStatus: HearingStatus;
  commPreference: CommPreference;

  _hasHydrated: boolean;
  _setHasHydrated: (v: boolean) => void;

  /** Demo Mode: bypasses onboarding entirely, pre-fills a believable
   *  profile, and marks the device as already bound/connected. */
  enableDemoMode: () => void;
  completeOnboarding: (p: { userName: string; hearingStatus: HearingStatus }) => void;
  bindDevice: () => void;
  setCommPreference: (p: CommPreference) => void;
}

export const useProfile = create<ProfileStore>()(
  persist(
    (set) => ({
      demoMode: false,
      onboardingComplete: false,
      deviceBound: false,

      userName: "",
      hearingStatus: "Deaf",
      commPreference: "Written",

      _hasHydrated: false,
      _setHasHydrated: (v) => set({ _hasHydrated: v }),

      enableDemoMode: () => {
        set({
          demoMode: true,
          onboardingComplete: true,
          deviceBound: true,
          userName: "Alex Morgan",
          hearingStatus: "Deaf",
          commPreference: "Written",
        });
        // Reuse the existing connection action rather than inventing a
        // second "fake BLE" path just for the demo shortcut.
        useDevice.getState().setConnection("connected");
      },

      completeOnboarding: ({ userName, hearingStatus }) =>
        set({ userName, hearingStatus, onboardingComplete: true }),

      bindDevice: () => set({ deviceBound: true }),

      setCommPreference: (commPreference) => set({ commPreference }),
    }),
    {
      name: "gc-profile",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (s) => ({
        demoMode: s.demoMode,
        onboardingComplete: s.onboardingComplete,
        deviceBound: s.deviceBound,
        userName: s.userName,
        hearingStatus: s.hearingStatus,
        commPreference: s.commPreference,
      }),
      onRehydrateStorage: () => (state) => {
        state?._setHasHydrated(true);
      },
    }
  )
);
