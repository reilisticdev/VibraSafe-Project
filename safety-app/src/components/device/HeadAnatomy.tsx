"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useDevice } from "@/lib/store";
import {
  buildEarShape,
  buildHelixCurve,
  buildCrusCurve,
  buildAntihelixCurves,
} from "@/lib/earContour";

/* ==================================================================
   HEAD ANATOMY
   ------------------------------------------------------------------
   An ear is not a flat plate with lumps on it. It is a RAISED RIM
   around a RECESSED BOWL, and every feature here is built from that
   principle:

     - the inner web sits far back in Z (z = 0)
     - the helix rim is a thick tube pushed forward (z = 0.3)
     - the antihelix is a second, lower ridge between the two

   The depth difference is what creates the concha bowl without any
   boolean subtraction, and it is why the previous revision read as a
   smooth egg: everything sat at the same depth.

   Sub-features are deliberately positioned to OVERLAP the web so they
   merge into one silhouette rather than floating as separate blobs.
================================================================== */

const SKIN = "#c9a382";
const SKIN_SHADE = "#a8815f";
const SKIN_DEEP = "#7d5a43";
const SKIN_BACK = "#8f6a4f";

export default function HeadAnatomy() {
  const fitMode = useDevice((s) => s.fitMode);
  const sos = useDevice((s) => s.sosActive);
  const group = useRef<THREE.Group>(null);

  /* Inner web: thin and FLAT, sitting at the back. This is the floor
     of the bowl, not the body of the ear. */
  const webGeo = useMemo(() => {
    const g = new THREE.ExtrudeGeometry(buildEarShape(), {
      depth: 0.05,
      bevelEnabled: true,
      bevelThickness: 0.04,
      bevelSize: 0.035,
      bevelSegments: 4,
      curveSegments: 64,
    });
    g.computeVertexNormals();
    return g;
  }, []);

  /* Helix rim: thick, pushed forward. This single element does most of
     the work of making the shape legible as an ear. */
  const helixGeo = useMemo(
    () => new THREE.TubeGeometry(buildHelixCurve(0.3), 120, 0.105, 16, false),
    []
  );

  /* Crus of the helix - the ridge running into the bowl. */
  const crusGeo = useMemo(
    () => new THREE.TubeGeometry(buildCrusCurve(), 40, 0.062, 12, false),
    []
  );

  /* Antihelix: a middle-depth ridge, between rim and web. */
  const antihelixGeos = useMemo(
    () =>
      buildAntihelixCurves().map(
        (c, i) => new THREE.TubeGeometry(c, 48, i === 0 ? 0.075 : 0.058, 12, false)
      ),
    []
  );

  useFrame((_, delta) => {
    if (!group.current) return;
    const targetZ = fitMode === "exploded" ? -1.8 : 0;
    const targetOpacity = fitMode === "exploded" ? 0.25 : 1;
    group.current.position.z = THREE.MathUtils.lerp(
      group.current.position.z,
      targetZ,
      delta * 3
    );
    group.current.traverse((o) => {
      const m = (o as THREE.Mesh).material as
        | THREE.MeshStandardMaterial
        | undefined;
      if (m && "opacity" in m) {
        m.transparent = true;
        m.opacity = THREE.MathUtils.lerp(m.opacity, targetOpacity, delta * 3);
      }
    });
  });

  if (fitMode === "device") return null;

  return (
    <group ref={group}>
      {/* ---- Cranium. Kept modest and pushed back so it reads as a
              head behind the ear rather than a wall filling frame. ---- */}
      <mesh position={[-0.55, 0.6, -2.75]} scale={[1, 1.16, 0.92]}>
        <sphereGeometry args={[2.55, 48, 48]} />
        <meshStandardMaterial
          color={SKIN_BACK}
          roughness={0.97}
          metalness={0}
          emissive={sos ? "#ff4438" : "#000000"}
          emissiveIntensity={sos ? 0.08 : 0}
        />
      </mesh>

      {/* ---- Jaw, sweeping down and forward from beneath the ear ---- */}
      <mesh
        position={[-1.15, -1.35, -0.85]}
        rotation={[0, 0.15, 0.34]}
        scale={[1, 1, 0.75]}
      >
        <capsuleGeometry args={[0.56, 1.9, 8, 24]} />
        <meshStandardMaterial color={SKIN_BACK} roughness={0.96} metalness={0} />
      </mesh>

      {/* ---- Upper neck / sternocleidomastoid ---- */}
      <mesh position={[-0.15, -3.0, -1.35]} rotation={[0.12, 0, -0.08]}>
        <cylinderGeometry args={[1.0, 1.25, 3.0, 40, 1, true]} />
        <meshStandardMaterial
          color={SKIN_SHADE}
          roughness={0.95}
          metalness={0}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* ---- Mastoid prominence: the bony ridge just behind the ear
              that the module presses against. ---- */}
      <mesh position={[0.95, -0.35, -0.5]} scale={[0.62, 0.9, 0.55]}>
        <sphereGeometry args={[0.72, 28, 28]} />
        <meshStandardMaterial color={SKIN_SHADE} roughness={0.95} metalness={0} />
      </mesh>

      {/* ======================= OUTER EAR ======================= */}
      <group position={[0, 0.45, -0.05]}>
        {/* Floor of the bowl - flat, set back */}
        <mesh geometry={webGeo}>
          <meshStandardMaterial color={SKIN_SHADE} roughness={0.93} metalness={0} />
        </mesh>

        {/* Darker shading inside the concha, to read as depth */}
        <mesh position={[0.02, -0.1, 0.07]} rotation={[0, 0, 0.15]}>
          <circleGeometry args={[0.42, 32]} />
          <meshStandardMaterial color={SKIN_DEEP} roughness={0.98} metalness={0} />
        </mesh>

        {/* Ear canal */}
        <mesh position={[-0.08, -0.16, 0.09]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.095, 0.06, 0.12, 20]} />
          <meshStandardMaterial color="#3d2a1e" roughness={1} metalness={0} />
        </mesh>

        {/* Raised helix rim */}
        <mesh geometry={helixGeo}>
          <meshStandardMaterial color={SKIN} roughness={0.86} metalness={0} />
        </mesh>

        {/* Crus of the helix */}
        <mesh geometry={crusGeo}>
          <meshStandardMaterial color={SKIN} roughness={0.88} metalness={0} />
        </mesh>

        {/* Antihelix ridge and its two branches */}
        {antihelixGeos.map((g, i) => (
          <mesh key={i} geometry={g}>
            <meshStandardMaterial color={SKIN} roughness={0.89} metalness={0} />
          </mesh>
        ))}

        {/* Tragus - overlaps the web so it merges instead of floating */}
        <mesh
          position={[-0.33, -0.14, 0.14]}
          rotation={[0, 0.3, -0.35]}
          scale={[0.4, 0.85, 0.55]}
        >
          <sphereGeometry args={[0.27, 20, 20]} />
          <meshStandardMaterial color={SKIN} roughness={0.88} metalness={0} />
        </mesh>

        {/* Antitragus */}
        <mesh position={[0.05, -0.55, 0.13]} scale={[0.55, 0.42, 0.5]}>
          <sphereGeometry args={[0.25, 18, 18]} />
          <meshStandardMaterial color={SKIN} roughness={0.89} metalness={0} />
        </mesh>

        {/* Lobe - broad and shallow, blended into the web below */}
        <mesh position={[-0.04, -0.86, 0.08]} scale={[0.72, 0.6, 0.45]}>
          <sphereGeometry args={[0.4, 24, 24]} />
          <meshStandardMaterial color={SKIN} roughness={0.91} metalness={0} />
        </mesh>
      </group>
    </group>
  );
}
