"use client";

import DeviceViewerClient from "@/components/device/DeviceViewerClient";
import DeviceControls from "@/components/device/DeviceControls";
import SafetyProgramToggle from "./SafetyProgramToggle";

/* ==================================================================
   DASHBOARD
   ------------------------------------------------------------------
   The everyday home screen: battery status, the active safety
   program, and the live 3D model, all reading from the same
   useDevice store the rest of the app already shares.
================================================================== */

export default function DashboardView() {
  return (
    <div className="grid gap-6 lg:grid-cols-[1.05fr_1fr]">
      <div className="flex flex-col gap-4">
        <div className="gc-card relative h-[440px] overflow-hidden sm:h-[560px]">
          <DeviceViewerClient />
          <div className="pointer-events-none absolute bottom-4 left-4 rounded-lg border border-line-soft bg-void/70 px-3 py-2 backdrop-blur">
            <p className="text-[11px] font-semibold text-muted">
              Drag to rotate &middot; scroll to zoom
            </p>
          </div>
        </div>
        <SafetyProgramToggle />
      </div>

      <DeviceControls />
    </div>
  );
}
