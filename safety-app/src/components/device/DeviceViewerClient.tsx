"use client";

import dynamic from "next/dynamic";

/* ==================================================================
   Client boundary for the 3D canvas.
   Next 16 forbids `ssr: false` inside a Server Component, so the
   dynamic import has to live in a "use client" module. Keeping it in
   its own file means page.tsx stays a Server Component.
================================================================== */

const DeviceViewer = dynamic(() => import("./DeviceViewer"), {
  ssr: false,
  loading: () => (
    <div className="grid h-full w-full place-items-center text-muted">
      <span className="text-sm font-semibold">Loading device model...</span>
    </div>
  ),
});

export default function DeviceViewerClient() {
  return <DeviceViewer />;
}
