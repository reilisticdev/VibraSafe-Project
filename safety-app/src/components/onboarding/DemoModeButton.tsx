"use client";

import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { useProfile } from "@/lib/profileStore";

/* ==================================================================
   DEMO MODE
   ------------------------------------------------------------------
   Bypasses onboarding and pairing entirely: pre-fills a believable
   profile, marks the device as already bound/connected, and jumps
   straight to the Dashboard. For expo judges and quick walkthroughs
   who don't need to see the setup flow to understand the product.
================================================================== */

export default function DemoModeButton({ className = "" }: { className?: string }) {
  const router = useRouter();
  const enableDemoMode = useProfile((s) => s.enableDemoMode);

  return (
    <button
      onClick={() => {
        enableDemoMode();
        router.push("/dashboard");
      }}
      className={`gc-btn gc-btn-primary ${className}`}
    >
      <Sparkles size={18} aria-hidden />
      Try Demo Mode
    </button>
  );
}
