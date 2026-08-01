import OnboardingFlow from "@/components/onboarding/OnboardingFlow";

export default function OnboardingPage() {
  return (
    <main id="main" className="gc-section pb-24 pt-28 sm:pt-36 md:pb-16">
      <div className="mx-auto max-w-md text-center">
        <span className="gc-chip">Set up</span>
        <h1 className="mt-4 text-2xl font-extrabold tracking-tight sm:text-3xl">
          Set up your VibraSafe
        </h1>
        <p className="mt-2 text-muted">
          A quick profile, then bind your device with its pairing code.
        </p>
      </div>

      <div className="mt-8">
        <OnboardingFlow />
      </div>
    </main>
  );
}
