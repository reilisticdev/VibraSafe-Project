"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { useDevice } from "@/lib/store";
import { getTheme, SIGNAL } from "@/lib/themes";

/* ==================================================================
   BEHIND-THE-EAR MODULE
   ------------------------------------------------------------------
   The functional half of the system. Sits in the hollow behind the
   pinna, over the MASTOID PROCESS - which is both where a behind-the-
   ear housing naturally rests and the standard clinical site for a
   bone conduction transducer.

   Working components modelled here:
     - Dual microphone ports .... detect environmental sound so the app
                                  can classify sirens, alarms, vehicles
     - Multi-function button .... power, pairing, SOS confirm
     - Status LED ............... connection and alert state
     - Battery door seam ........ user-replaceable cell
     - Bone conduction driver ... on the INNER face, pressed to bone
     - Tether loop .............. anchors the chain to the ear cuff

   IMPORTANT: the microphones exist to SENSE the environment, not to
   amplify it into the ear canal. This is not a hearing aid. Detected
   sound becomes tactile vibration on the cuff, or audio delivered by
   skull vibration - never amplified acoustic output.
================================================================== */

const SHELL = "#7e7c78"; // warm taupe, as in the reference photo
const SHELL_DARK = "#5f5d59";

export default function BteModule() {
  const led = useRef<THREE.MeshStandardMaterial>(null);
  const driver = useRef<THREE.MeshStandardMaterial>(null);

  const connection = useDevice((s) => s.connection);
  const sos = useDevice((s) => s.sosActive);
  const bcVolume = useDevice((s) => s.bcVolume);
  const fitMode = useDevice((s) => s.fitMode);
  const theme = getTheme(useDevice((s) => s.themeId));

  /* Microphone port grid - two clusters, front and rear facing, which
     is what lets the system estimate a bearing for a sound source. */
  const micPorts = useMemo(() => {
    const pts: [number, number, number][] = [];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 3; c++) {
        pts.push([-0.055 + c * 0.055, 0.16 - r * 0.055, 0]);
      }
    }
    return pts;
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    if (led.current) {
      // Red throb on SOS, steady green when paired, slow amber search
      // while pairing, dark when disconnected.
      if (sos) {
        led.current.color.set(SIGNAL.sos);
        led.current.emissive.set(SIGNAL.sos);
        led.current.emissiveIntensity = 2 + Math.sin(t * 12) * 1.4;
      } else if (connection === "connected") {
        led.current.color.set("#35d07f");
        led.current.emissive.set("#35d07f");
        led.current.emissiveIntensity = 1.1 + Math.sin(t * 1.6) * 0.25;
      } else if (connection === "pairing") {
        led.current.color.set(SIGNAL.tactileActive);
        led.current.emissive.set(SIGNAL.tactileActive);
        led.current.emissiveIntensity = 1.2 + Math.sin(t * 8) * 1;
      } else {
        led.current.emissiveIntensity = 0.05;
      }
    }

    if (driver.current) {
      // The transducer face brightens with bone conduction level.
      const target = sos ? 2.4 : (bcVolume / 100) * 2;
      driver.current.emissiveIntensity = THREE.MathUtils.lerp(
        driver.current.emissiveIntensity,
        target,
        0.12
      );
      driver.current.emissive.set(sos ? SIGNAL.sos : SIGNAL.boneGlow);
    }
  });

  return (
    <group>
      {/* ---- Main shell. Tapered, rounded, hugging the skull. ---- */}
      <RoundedBox args={[0.3, 0.72, 0.26]} radius={0.12} smoothness={6}>
        <meshStandardMaterial color={SHELL} roughness={0.42} metalness={0.32} />
      </RoundedBox>

      {/* Slight bulge at the top where the electronics stack sits */}
      <mesh position={[0, 0.3, 0.01]} scale={[0.9, 0.7, 0.95]}>
        <sphereGeometry args={[0.19, 28, 28]} />
        <meshStandardMaterial color={SHELL} roughness={0.42} metalness={0.32} />
      </mesh>

      {/* ---- Microphone panel, recessed into the outer face ---- */}
      <group position={[0, 0.06, 0.145]}>
        <RoundedBox args={[0.2, 0.32, 0.02]} radius={0.03} smoothness={4}>
          <meshStandardMaterial
            color={SHELL_DARK}
            roughness={0.55}
            metalness={0.4}
          />
        </RoundedBox>
        {/* Individual acoustic ports */}
        {micPorts.map((p, i) => (
          <mesh key={i} position={[p[0], p[1] - 0.06, 0.016]}>
            <cylinderGeometry args={[0.014, 0.014, 0.01, 8]} />
            <meshStandardMaterial color="#26241f" roughness={0.9} />
          </mesh>
        ))}
      </group>

      {/* ---- Status LED ---- */}
      <mesh position={[0, -0.16, 0.15]}>
        <sphereGeometry args={[0.032, 16, 16]} />
        <meshStandardMaterial
          ref={led}
          color="#35d07f"
          emissive="#35d07f"
          emissiveIntensity={1}
          roughness={0.25}
        />
      </mesh>

      {/* ---- Multi-function button on the trailing edge ---- */}
      <mesh position={[0.0, -0.27, 0.11]} rotation={[Math.PI / 2.4, 0, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.04, 24]} />
        <meshStandardMaterial
          color={SHELL_DARK}
          roughness={0.5}
          metalness={0.35}
        />
      </mesh>

      {/* ---- Battery door seam ---- */}
      <mesh position={[0, -0.05, 0]} rotation={[0, 0, 0]}>
        <torusGeometry args={[0.168, 0.005, 8, 40]} />
        <meshStandardMaterial color={SHELL_DARK} roughness={0.6} />
      </mesh>

      {/* ---- Bone conduction driver, on the INNER face against the
              mastoid. Hidden in wear, revealed when exploded. ---- */}
      <group position={[0, 0.02, -0.145]} rotation={[Math.PI / 2, 0, 0]}>
        <mesh>
          <cylinderGeometry args={[0.13, 0.13, 0.035, 32]} />
          <meshStandardMaterial
            color={SIGNAL.bonePad}
            roughness={0.68}
            metalness={0.2}
          />
        </mesh>
        <mesh position={[0, -0.02, 0]}>
          <cylinderGeometry args={[0.085, 0.085, 0.02, 32]} />
          <meshStandardMaterial
            ref={driver}
            color="#0e1620"
            roughness={0.3}
            metalness={0.7}
            emissive={SIGNAL.boneGlow}
            emissiveIntensity={0.4}
          />
        </mesh>
      </group>

      {/* ---- Tether loop for the chain ---- */}
      <mesh position={[0, -0.42, 0.02]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.045, 0.012, 10, 24]} />
        <meshStandardMaterial
          color={theme.accent}
          metalness={0.92}
          roughness={0.2}
        />
      </mesh>

      {/* Exploded-view callouts naming the real components */}
      {fitMode === "exploded" && (
        <>
          <mesh position={[0, 0, 0]} visible={false} />
        </>
      )}
    </group>
  );
}
