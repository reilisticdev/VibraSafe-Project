"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { useDevice, ZONE_LABELS } from "@/lib/store";
import { getTheme, SIGNAL } from "@/lib/themes";
import {
  BANDS,
  GEM_POSITIONS,
  ribbonProfile,
  teardropProfile,
  chainCurve,
} from "@/lib/cuffGeometry";
import BteModule from "./BteModule";

/* ==================================================================
   EAR CUFF ASSEMBLY
   ------------------------------------------------------------------
   Modelled from the reference jewelry: flowing silver ribbons that
   pour over the helix and curl into the ear, set with crystals, with
   a teardrop drop below - tethered by a fine chain to the behind-the-
   ear module.

   Division of labour, which is the whole scientific argument:
     - The GEM SETTINGS on the outer ear each clamp a tactile actuator
       against the cartilage. Independent per ear, no cross-talk, so
       this is the channel that carries DIRECTION.
     - The MODULE behind the ear drives the skull over the mastoid.
       That signal reaches both cochleae, so it carries AUDIO CONTENT
       only and never direction.

   A theme recolours the metal and the crystals. It never recolours an
   active alert or the skin-tone bone conduction housing.
================================================================== */

/* --------------------------- Ribbons --------------------------- */
function SilverRibbons() {
  const theme = getTheme(useDevice((s) => s.themeId));
  const sos = useDevice((s) => s.sosActive);

  const geometries = useMemo(() => {
    const profile = ribbonProfile();
    return BANDS.map((band, i) =>
      new THREE.ExtrudeGeometry(profile, {
        extrudePath: band(),
        steps: 120,
        bevelEnabled: false,
        // Thinner ribbons for the decorative inner flourishes.
        ...(i > 1 ? {} : {}),
      })
    );
  }, []);

  return (
    <>
      {geometries.map((g, i) => (
        <mesh key={i} geometry={g} scale={i > 1 ? 0.82 : 1}>
          <meshStandardMaterial
            color={theme.wire}
            metalness={0.98}
            roughness={0.12}
            envMapIntensity={1.6}
            emissive={sos ? SIGNAL.sos : "#000000"}
            emissiveIntensity={sos ? 0.45 : 0}
          />
        </mesh>
      ))}
    </>
  );
}

/* ------------------------- Crystal setting ------------------------- */
function GemSetting({
  position,
  index,
}: {
  position: [number, number, number];
  index: number;
}) {
  const group = useRef<THREE.Group>(null);
  const gem = useRef<THREE.MeshStandardMaterial>(null);

  const activeZone = useDevice((s) => s.activeZone);
  const intensity = useDevice((s) => s.tactileIntensity);
  const sos = useDevice((s) => s.sosActive);
  const theme = getTheme(useDevice((s) => s.themeId));

  useFrame((state) => {
    if (!group.current || !gem.current) return;
    const t = state.clock.elapsedTime;
    const isActive = activeZone === index;
    const strength = intensity / 100;

    // The firing setting buzzes at actuator frequency; SOS throbs all.
    const buzz = sos
      ? 1 + Math.sin(t * 12) * 0.22
      : isActive
        ? 1 + Math.sin(t * 24) * 0.18 * strength
        : 1;
    group.current.scale.setScalar((isActive || sos ? 1.22 : 1) * buzz);
    group.current.rotation.z = t * 0.3 + index;

    const target = sos ? 3 : isActive ? 0.5 + strength * 3.2 : 0.12;
    gem.current.emissiveIntensity = THREE.MathUtils.lerp(
      gem.current.emissiveIntensity,
      target,
      0.15
    );
    const c = sos
      ? SIGNAL.sos
      : isActive
        ? SIGNAL.tactileActive
        : theme.jewel;
    gem.current.color.set(c);
    gem.current.emissive.set(c);
  });

  return (
    <group ref={group} position={position}>
      {/* Claw setting holding the stone */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.055, 0.038, 0.03, 12]} />
        <meshStandardMaterial
          color={theme.wire}
          metalness={0.95}
          roughness={0.18}
        />
      </mesh>
      {/* Brilliant-cut stone, approximated by a bipyramid */}
      <mesh position={[0, 0, 0.035]} scale={[1, 1, 0.75]}>
        <octahedronGeometry args={[0.07, 0]} />
        <meshStandardMaterial
          ref={gem}
          color={theme.jewel}
          metalness={0.35}
          roughness={0.05}
          emissive={theme.jewel}
          emissiveIntensity={0.12}
        />
      </mesh>
    </group>
  );
}

/* --------------------------- Drop pendant --------------------------- */
function DropPendant() {
  const theme = getTheme(useDevice((s) => s.themeId));
  const pendant = useRef<THREE.Group>(null);

  const dropGeo = useMemo(
    () => new THREE.LatheGeometry(teardropProfile(), 28),
    []
  );
  const links = useMemo(() => [0, -0.09, -0.18], []);

  useFrame((state) => {
    if (pendant.current) {
      // Slight sway so it reads as worn jewelry, not fixed hardware.
      pendant.current.rotation.z =
        Math.sin(state.clock.elapsedTime * 1.3) * 0.13;
    }
  });

  return (
    <group ref={pendant} position={[0.16, -0.82, 0.3]}>
      {links.map((y, i) => (
        <mesh key={i} position={[0, y - 0.06, 0]} rotation={[0, 0, i % 2 ? 0.5 : -0.5]}>
          <torusGeometry args={[0.028, 0.009, 8, 18]} />
          <meshStandardMaterial
            color={theme.accent}
            metalness={0.95}
            roughness={0.18}
          />
        </mesh>
      ))}
      <mesh geometry={dropGeo} position={[0, -0.5, 0]} scale={[0.26, 0.24, 0.26]}>
        <meshStandardMaterial
          color={theme.jewel}
          metalness={0.3}
          roughness={0.04}
          emissive={theme.jewel}
          emissiveIntensity={0.2}
        />
      </mesh>
    </group>
  );
}

/* ---------------------------- Tether chain ---------------------------- */
function TetherChain() {
  const theme = getTheme(useDevice((s) => s.themeId));
  /* Drawn as one slim tube rather than a ring of oriented links. At
     this scale it reads as a fine chain, and it cannot corkscrew the
     way per-link quaternion alignment did. */
  const geo = useMemo(
    () => new THREE.TubeGeometry(chainCurve(), 90, 0.016, 8, false),
    []
  );
  const beads = useMemo(() => {
    const c = chainCurve();
    return Array.from({ length: 14 }, (_, i) => c.getPoint(i / 13));
  }, []);

  return (
    <group>
      <mesh geometry={geo}>
        <meshStandardMaterial
          color={theme.accent}
          metalness={0.96}
          roughness={0.16}
        />
      </mesh>
      {beads.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.027, 10, 10]} />
          <meshStandardMaterial
            color={theme.accent}
            metalness={0.96}
            roughness={0.16}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ============================= Assembly ============================= */
export default function EarCuffModel() {
  const group = useRef<THREE.Group>(null);
  const moduleGroup = useRef<THREE.Group>(null);
  const jewelryGroup = useRef<THREE.Group>(null);

  const sos = useDevice((s) => s.sosActive);
  const bearing = useDevice((s) => s.bearing);
  const spatial = useDevice((s) => s.spatialAwareness);
  const fitMode = useDevice((s) => s.fitMode);

  useFrame((state, delta) => {
    if (!group.current) return;

    const target = {
      worn: new THREE.Vector3(0, 0.45, -0.1),
      device: new THREE.Vector3(0, 0.45, -0.1),
      exploded: new THREE.Vector3(-0.35, 0.55, 0.35),
    }[fitMode];
    group.current.position.lerp(target, delta * 3);

    /* Only the hardware-only view turns the assembly. A cuff worn on an
       ear does not rotate - direction is shown by which gem lights. */
    const targetY =
      fitMode === "device" && spatial ? -(bearing * Math.PI) / 180 : 0;
    group.current.rotation.y = THREE.MathUtils.lerp(
      group.current.rotation.y,
      targetY,
      delta * 2.2
    );

    if (sos) {
      group.current.position.x += Math.sin(state.clock.elapsedTime * 30) * 0.015;
    }

    /* Exploded view separates the behind-ear module from the jewelry
       so both halves of the system can be labelled. */
    if (moduleGroup.current) {
      const p = fitMode === "exploded" ? 2.6 : 0.95;
      moduleGroup.current.position.x = THREE.MathUtils.lerp(
        moduleGroup.current.position.x,
        p,
        delta * 3
      );
    }
    if (jewelryGroup.current) {
      const p = fitMode === "exploded" ? -0.75 : 0;
      jewelryGroup.current.position.x = THREE.MathUtils.lerp(
        jewelryGroup.current.position.x,
        p,
        delta * 3
      );
    }
  });

  return (
    <group ref={group}>
      {/* ---------------- Jewelry on the outer ear ---------------- */}
      <group ref={jewelryGroup}>
        <SilverRibbons />
        {GEM_POSITIONS.map((p, i) => (
          <GemSetting key={ZONE_LABELS[i]} position={p} index={i} />
        ))}
        <DropPendant />

        {fitMode === "exploded" && (
          <Html position={[-1.15, 0.55, 0.3]} center distanceFactor={9}>
            <div className="pointer-events-none whitespace-nowrap rounded-lg border border-tactile/50 bg-void/90 px-2.5 py-1.5 text-center">
              <p className="text-[11px] font-bold text-tactile">
                Tactile actuators
              </p>
              <p className="text-[9px] text-muted">
                Behind each stone &middot; directional
              </p>
            </div>
          </Html>
        )}
      </group>

      {/* ------------- Behind-the-ear module + tether ------------- */}
      <group
        ref={moduleGroup}
        position={[0.95, 0.12, -0.42]}
        rotation={[0.06, -0.42, 0.14]}
      >
        <BteModule />
        {fitMode === "exploded" && (
          <Html position={[0, 0.75, 0]} center distanceFactor={9}>
            <div className="pointer-events-none whitespace-nowrap rounded-lg border border-bone/50 bg-void/90 px-2.5 py-1.5 text-center">
              <p className="text-[11px] font-bold text-bone">
                Processor &middot; mics &middot; bone driver
              </p>
              <p className="text-[9px] text-muted">
                On the mastoid &middot; audio only
              </p>
            </div>
          </Html>
        )}
      </group>

      {fitMode !== "exploded" && <TetherChain />}
    </group>
  );
}
