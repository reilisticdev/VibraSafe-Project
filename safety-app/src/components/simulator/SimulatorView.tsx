"use client";

import { useSimulator } from "@/lib/simulatorStore";
import DeviceViewerClient from "@/components/device/DeviceViewerClient";
import CalibrationGate from "./CalibrationGate";
import AlertPatternBoard from "./AlertPatternBoard";

export default function SimulatorView() {
  const calibrated = useSimulator((s) => s.calibrated);

  if (!calibrated) {
    return <CalibrationGate />;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.05fr_1fr]">
      <div className="gc-card relative h-[440px] overflow-hidden sm:h-[560px]">
        <DeviceViewerClient />
        <div className="pointer-events-none absolute bottom-4 left-4 rounded-lg border border-line-soft bg-void/70 px-3 py-2 backdrop-blur">
          <p className="text-[11px] font-semibold text-muted">
            Watch the tactile node light up as the alert plays
          </p>
        </div>
      </div>

      <AlertPatternBoard />
    </div>
  );
}
