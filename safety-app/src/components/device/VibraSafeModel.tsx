"use client";

import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { useDevice } from "@/lib/store";
import { getTheme, SIGNAL } from "@/lib/themes";

/* ==================================================================
   VIBRASAFE - R3F CONTROL LAYER
   ------------------------------------------------------------------
   Loads the Blender-authored .glb (now a merged scene: a realistic
   head plus BOTH ear cuffs, hand-positioned in Blender) and drives it
   from app state.

   WHY useFrame AND NOT framer-motion-3d
   -------------------------------------
   framer-motion-3d is discontinued and does not support React 19,
   which this project runs. It was also the wrong tool: it animates
   declarative transform props, whereas what a device demo needs is
   per-frame MATERIAL mutation - emissiveIntensity and emissive colour
   on individual meshes at 60fps. Doing that through React state would
   trigger a re-render every frame. useFrame mutates the material
   object directly, outside React's render cycle, at zero cost.

   BILATERAL WEARING (both ears)
   ------------------------------
   The merged scene contains two complete, independently-named cuff
   assemblies - unsuffixed names for the left ear (GC_TactileNode_0..3,
   GC_BoneConduction_Face, GC_StatusLED, ...) and "_R"-suffixed names
   for the right ear (GC_TactileNode_0_R.._3_R, etc). Both ears show
   the SAME state in sync for each role: the same zone index i lights
   the matching tactile node on both sides, both bone-conduction
   drivers mirror the same bcVolume (it's non-directional by design -
   it reaches both cochleae), and both status LEDs mirror the same
   connection/SOS state. This isn't "left shows one thing, right shows
   another" - it's the existing single-cuff formulas applied to two
   mesh instances per role.

   MESH CONTRACT (names come from the Blender generator)
   -----------------------------------------------------
     GC_TactileNode_0..3[_R]    piezo faces  - directional, app-recoloured
     GC_BoneConduction_Face[_R] transducer   - audio level, cyan
     GC_StatusLED[_R]           status light - pairing / SOS
     GC_Cuff_Body[_R]           welded body  - takes the cosmetic theme
     GC_Link_Chain[_R]          linkage      - takes the cosmetic theme
     GC_BoneConduction_Pad[_R]  capsule      - ALWAYS skin-tone, never themed
     HeadBust                   realistic head - never themed, never flashes;
                                 only fades/hides per fitMode
================================================================== */

const MODEL_URL = "/models/vibra-safe-worn.glb";

/** The merged scene is authored in real metres (head ~0.3m tall).
 *  Rather than a guessed magic multiplier, normalise the model's own
 *  bounding sphere to a fixed target radius so display size is robust
 *  to whatever real-world scale the export turns out to have. */
const TARGET_RADIUS = 2.2;

/** Piezo ceramic at rest. Dark, so an active zone is unmistakable. */
const PIEZO_IDLE = "#1c1e23";

export default function VibraSafeModel() {
  const { scene } = useGLTF(MODEL_URL);
  const root = useRef<THREE.Group>(null);

  // ---- App state ----
  const sosActive = useDevice((s) => s.sosActive);
  const activeZone = useDevice((s) => s.activeZone);
  const tactileIntensity = useDevice((s) => s.tactileIntensity);
  const bcVolume = useDevice((s) => s.bcVolume);
  const spatial = useDevice((s) => s.spatialAwareness);
  const connection = useDevice((s) => s.connection);
  const bearing = useDevice((s) => s.bearing);
  const fitMode = useDevice((s) => s.fitMode);
  const theme = getTheme(useDevice((s) => s.themeId));
  const simulatorActive = useDevice((s) => s.simulatorActive);
  const liveTactileBurst = useDevice((s) => s.liveTactileBurst);
  const liveBoneBurst = useDevice((s) => s.liveBoneBurst);

  /* Clone the loaded scene so two mounts never share one material
     graph - otherwise the second viewer fights the first. Also
     measure the bounding box BEFORE the traverse below mutates
     materials, so the model's own real-world size (unknown until the
     export exists) drives display scale instead of a guessed constant. */
  const { model, displayScale, displayOffset } = useMemo(() => {
    const cloned = scene.clone(true);
    const box = new THREE.Box3().setFromObject(cloned);
    const sphere = box.getBoundingSphere(new THREE.Sphere());
    const scale = sphere.radius > 0 ? TARGET_RADIUS / sphere.radius : 1;
    const offset = box.getCenter(new THREE.Vector3()).multiplyScalar(-scale);
    return { model: cloned, displayScale: scale, displayOffset: offset };
  }, [scene]);

  /* Index meshes by name ONCE, and give each its own material instance
     so they can be animated independently. */
  const parts = useMemo(() => {
    const tactileL: THREE.Mesh[] = [];
    const tactileR: THREE.Mesh[] = [];
    const themed: THREE.Mesh[] = [];
    let driverL: THREE.Mesh | null = null;
    let driverR: THREE.Mesh | null = null;
    let ledL: THREE.Mesh | null = null;
    let ledR: THREE.Mesh | null = null;
    let head: THREE.Mesh | null = null;

    model.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (!mesh.isMesh) return;

      mesh.castShadow = true;
      mesh.receiveShadow = true;
      if (Array.isArray(mesh.material)) mesh.material = mesh.material[0];
      mesh.material = (mesh.material as THREE.Material).clone();

      // Cache the rest pose so the SOS vibration (and the head's
      // fitMode z-offset) can offset from it.
      mesh.userData.restPosition = mesh.position.clone();

      const n = mesh.name;
      if (n === "HeadBust") {
        head = mesh;
        // Set once here, not per-frame, so the fitMode fade below can
        // just lerp opacity without touching this flag every tick.
        (mesh.material as THREE.MeshStandardMaterial).transparent = true;
      } else if (n.startsWith("GC_TactileNode")) {
        (n.endsWith("_R") ? tactileR : tactileL).push(mesh);
      } else if (n === "GC_BoneConduction_Face") driverL = mesh;
      else if (n === "GC_BoneConduction_Face_R") driverR = mesh;
      else if (n === "GC_StatusLED") ledL = mesh;
      else if (n === "GC_StatusLED_R") ledR = mesh;
      else if (
        n === "GC_Cuff_Body" ||
        n === "GC_Cuff_Body_R" ||
        n === "GC_Link_Chain" ||
        n === "GC_Link_Chain_R" ||
        n.startsWith("GC_ChargeContact")
      ) {
        themed.push(mesh);
      }
      // GC_BoneConduction_Pad/_R deliberately absent: always skin-tone.
      // The two orphaned duplicate objects left over from the Blender
      // merge (GC_StatusLED.001, GC_ChargeContact_1_R.001) match none
      // of these branches by exact name and fall through inertly -
      // harmless, though deleting them in Blender before a future
      // re-export is still recommended cleanup.
    });

    // Blender exports in creation order. Sort so index N is bearing
    // zone N, not whatever order traverse happened to hit.
    tactileL.sort((a, b) => a.name.localeCompare(b.name));
    tactileR.sort((a, b) => a.name.localeCompare(b.name));
    return { tactileL, tactileR, themed, driverL, driverR, ledL, ledR, head };
  }, [model]);

  /* ---- Cosmetic theme. Runs on change, not per frame. ----
     A theme may recolour metal and nothing else. Alert colours and the
     skin-tone capsule are fixed, so no finish can ever make an
     emergency indicator harder to see. */
  useEffect(() => {
    parts.themed.forEach((mesh) => {
      const mat = mesh.material as THREE.MeshStandardMaterial;
      mat.color.set(theme.wire);
      mat.metalness = 0.95;
      mat.roughness = 0.15;
    });
  }, [parts, theme]);

  /* ================= PER-FRAME ANIMATION ================= */

  /** Formula unchanged from the single-cuff version - only the call
   *  site now applies it to two meshes (left/right) per zone index. */
  function updateTactileNode(
    mesh: THREE.Mesh,
    t: number,
    isFiring: boolean
  ) {
    const mat = mesh.material as THREE.MeshStandardMaterial;
    const strength = tactileIntensity / 100;

    const envelope = simulatorActive ? liveTactileBurst : isFiring ? 1 : 0;

    const target = sosActive
      ? 2.6 + Math.sin(t * 9) * 1.5
      : isFiring
        ? 0.4 + envelope * strength * 3.0
        : 0.0;

    mat.emissiveIntensity = THREE.MathUtils.lerp(
      mat.emissiveIntensity ?? 0,
      Math.max(target, 0),
      0.18
    );

    const colour = sosActive
      ? SIGNAL.sos
      : isFiring
        ? SIGNAL.tactileActive
        : PIEZO_IDLE;
    mat.emissive.set(colour);
    mat.color.set(sosActive || isFiring ? colour : PIEZO_IDLE);

    const rest = mesh.userData.restPosition as THREE.Vector3;
    const amp = sosActive ? 0.0016 : isFiring ? 0.0011 * strength : 0;
    const freq = sosActive ? 38 : 46;
    mesh.position.set(
      rest.x + Math.sin(t * freq) * amp,
      rest.y + Math.cos(t * freq * 1.3) * amp * 0.6,
      rest.z
    );
  }

  function updateBoneDriver(mesh: THREE.Mesh) {
    const mat = mesh.material as THREE.MeshStandardMaterial;
    const boneEnvelope = simulatorActive ? liveBoneBurst : 1;
    const target = sosActive ? 2.2 : boneEnvelope * (bcVolume / 100) * 2.0;
    mat.emissiveIntensity = THREE.MathUtils.lerp(
      mat.emissiveIntensity ?? 0,
      target,
      0.12
    );
    mat.emissive.set(sosActive ? SIGNAL.sos : SIGNAL.boneGlow);
  }

  function updateStatusLed(mesh: THREE.Mesh, t: number) {
    const mat = mesh.material as THREE.MeshStandardMaterial;
    if (sosActive) {
      mat.emissive.set(SIGNAL.sos);
      mat.emissiveIntensity = 2.4 + Math.sin(t * 12) * 1.6;
    } else if (connection === "connected") {
      mat.emissive.set("#35d07f");
      mat.emissiveIntensity = 1.5 + Math.sin(t * 1.6) * 0.3;
    } else if (connection === "pairing") {
      mat.emissive.set(SIGNAL.tactileActive);
      mat.emissiveIntensity = 1.4 + Math.sin(t * 9) * 1.2;
    } else {
      mat.emissiveIntensity = 0.04;
    }
  }

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;

    /* ---------- 1. TACTILE NODES (both ears, same zone in sync) ---------- */
    for (let i = 0; i < 4; i++) {
      const isFiring = spatial && activeZone === i;
      if (parts.tactileL[i]) updateTactileNode(parts.tactileL[i], t, isFiring);
      if (parts.tactileR[i]) updateTactileNode(parts.tactileR[i], t, isFiring);
    }

    /* ---------- 2. BONE CONDUCTION (both drivers mirror bcVolume) ----------
       Brightness tracks volume ONLY. It must never encode direction:
       transcranial attenuation is near 0 dB below 1 kHz, so this
       signal reaches both cochleae and cannot localise.              */
    if (parts.driverL) updateBoneDriver(parts.driverL);
    if (parts.driverR) updateBoneDriver(parts.driverR);

    /* ---------- 3. STATUS LED (both LEDs mirror connection/SOS) ---------- */
    if (parts.ledL) updateStatusLed(parts.ledL, t);
    if (parts.ledR) updateStatusLed(parts.ledR, t);

    /* ---------- 4. ASSEMBLY ----------
       The whole piece only yaws in the hardware-only view. A cuff worn
       on an ear does not rotate: direction is shown by WHICH node
       lights, not by the device turning.                             */
    if (root.current) {
      const targetYaw =
        fitMode === "device" && spatial ? -(bearing * Math.PI) / 180 : 0;
      root.current.rotation.y = THREE.MathUtils.lerp(
        root.current.rotation.y,
        targetYaw,
        delta * 2.2
      );
      root.current.position.x = sosActive ? Math.sin(t * 30) * 0.03 : 0;
    }

    /* ---------- 5. HEAD (fade/hide per fitMode) ----------
       Replaces HeadAnatomy.tsx's old component-level early-return and
       group-level opacity fade - a mesh can't bail out of rendering
       the way a whole component can, so opacity->0 + visible=false is
       the equivalent for "device" mode (hardware only, no anatomy). */
    if (parts.head) {
      const head = parts.head as THREE.Mesh;
      const targetOpacity = fitMode === "device" ? 0 : fitMode === "exploded" ? 0.25 : 1;
      const targetZ = fitMode === "exploded" ? -1.8 : 0;
      const mat = head.material as THREE.MeshStandardMaterial;
      mat.opacity = THREE.MathUtils.lerp(mat.opacity, targetOpacity, delta * 3);
      head.visible = mat.opacity > 0.01;
      const rest = head.userData.restPosition as THREE.Vector3;
      head.position.z = THREE.MathUtils.lerp(head.position.z, rest.z + targetZ, delta * 3);
    }
  });

  return (
    <group
      ref={root}
      scale={displayScale}
      position={[displayOffset.x, displayOffset.y + 0.15, displayOffset.z]}
    >
      <primitive object={model} />
    </group>
  );
}

useGLTF.preload(MODEL_URL);
