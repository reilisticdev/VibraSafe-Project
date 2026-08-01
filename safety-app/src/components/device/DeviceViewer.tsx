"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls, ContactShadows } from "@react-three/drei";
import VibraSafeModel from "./VibraSafeModel";
import { useDevice } from "@/lib/store";

/* ==================================================================
   DEVICE VIEWER
   ------------------------------------------------------------------
   Client-only wrapper around the R3F canvas. Kept separate from the
   model so the page can lazy-load it with ssr:false - WebGL has no
   server equivalent and would otherwise break the build.
================================================================== */

const DESCRIPTIONS: Record<string, string> = {
  worn: "3D model of the VibraSafe worn on an ear. Silver ribbons set with crystals wrap the outer ear, each stone clamping a tactile actuator that delivers directional vibration. A behind-the-ear module sits over the mastoid, linked by a fine chain, and delivers audio through bone conduction.",
  device:
    "3D model of the VibraSafe hardware on its own, rotating to show the tactile nodes and the bone conduction pad.",
  exploded:
    "Exploded 3D view separating the ear jewelry, which carries the tactile actuators, from the behind-the-ear module containing the microphones, processor and bone conduction driver.",
};

export default function DeviceViewer() {
  const sos = useDevice((s) => s.sosActive);
  const fitMode = useDevice((s) => s.fitMode);

  return (
    <div className="relative h-full w-full" role="img" aria-label={DESCRIPTIONS[fitMode]}>
      <Canvas
        camera={{ position: [0.6, 0.15, 4.5], fov: 38 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[4, 6, 5]} intensity={2.1} />
          <directionalLight
            position={[-5, -2, -4]}
            intensity={0.7}
            color="#7dd3fc"
          />
          {/* Rim light separates the silver hardware from the skin tone. */}
          <directionalLight position={[2, 1, -6]} intensity={1.2} color="#ffd9a0" />

          {/* Red key light only during SOS, so the alarm state reads
              instantly even for users with low colour discrimination. */}
          {sos && (
            <pointLight
              position={[0, 0, 3]}
              intensity={9}
              color="#ff4438"
              distance={12}
            />
          )}

          <VibraSafeModel />

          <ContactShadows
            position={[0, -2.6, 0]}
            opacity={0.35}
            scale={13}
            blur={2.8}
            far={5}
          />
          <Environment preset="city" />
          <OrbitControls
            enablePan={false}
            enableZoom
            target={[0, -0.1, 0]}
            minDistance={3.0}
            maxDistance={13}
            minPolarAngle={Math.PI / 5}
            maxPolarAngle={Math.PI / 1.7}
            /* No auto-rotate in worn view: a head spinning on its axis
               looks wrong, and the fit is clearest held still. */
            autoRotate={fitMode === "device" && !sos}
            autoRotateSpeed={0.7}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
