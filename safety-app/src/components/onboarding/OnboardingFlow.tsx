"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useProfile, type HearingStatus } from "@/lib/profileStore";
import ProfileQuickForm from "./ProfileQuickForm";
import PairingCodeInput from "./PairingCodeInput";

/* ==================================================================
   ONBOARDING FLOW
   ------------------------------------------------------------------
   Two steps: a quick profile form, then device binding via the
   pairing-code input. Demo Mode (see DemoModeButton.tsx) skips this
   entirely - this path is for a judge or attendee who wants to see
   the actual setup experience.
================================================================== */

type Step = "profile" | "pairing";

export default function OnboardingFlow() {
  const [step, setStep] = useState<Step>("profile");
  const router = useRouter();
  const completeOnboarding = useProfile((s) => s.completeOnboarding);
  const bindDevice = useProfile((s) => s.bindDevice);

  function handleProfileComplete(p: { userName: string; hearingStatus: HearingStatus }) {
    completeOnboarding(p);
    setStep("pairing");
  }

  function handlePaired() {
    bindDevice();
    router.push("/dashboard");
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="mb-6 flex items-center justify-center gap-2" aria-hidden>
        {(["profile", "pairing"] as Step[]).map((s) => (
          <span
            key={s}
            className={`h-1.5 flex-1 rounded-full ${step === s ? "bg-brand" : "bg-line"}`}
          />
        ))}
      </div>

      {step === "profile" ? (
        <ProfileQuickForm onComplete={handleProfileComplete} />
      ) : (
        <PairingCodeInput onPaired={handlePaired} />
      )}
    </div>
  );
}
