import * as THREE from "three";

/* ==================================================================
   CUFF GEOMETRY
   ------------------------------------------------------------------
   Curves for the sculptural silver work that wraps the outer ear,
   plus the tether chain that runs back to the behind-the-ear module.

   Coordinates are in EAR-LOCAL space (the ear group is offset by the
   anatomy component). Orientation:
     +X toward the back of the head, -X toward the face
     +Y up, +Z out of the head toward the viewer

   The bands are extruded along these paths with a flat cross-section,
   which is what gives the poured / molten-ribbon look rather than the
   plain round wire of the previous revision.
================================================================== */

/** Flat ribbon cross-section: wide and thin, with rounded ends. */
export function ribbonProfile(width = 0.16, thickness = 0.045): THREE.Shape {
  const s = new THREE.Shape();
  const w = width / 2;
  const t = thickness / 2;
  s.moveTo(-w, -t);
  s.lineTo(w, -t);
  s.quadraticCurveTo(w + t, 0, w, t);
  s.lineTo(-w, t);
  s.quadraticCurveTo(-w - t, 0, -w, -t);
  return s;
}

function curve(pts: [number, number, number][], tension = 0.5) {
  return new THREE.CatmullRomCurve3(
    pts.map(([x, y, z]) => new THREE.Vector3(x, y, z)),
    false,
    "catmullrom",
    tension
  );
}

/**
 * Band 1 - the main helix wrap. Rises at the front, crosses the crown
 * of the ear and sweeps down the back edge, rolling from the outer
 * face to behind the rim as it goes.
 */
export const helixBand = () =>
  curve([
    [-0.46, 0.66, 0.24],
    [-0.36, 1.0, 0.34],
    [-0.06, 1.24, 0.36],
    [0.28, 1.18, 0.34],
    [0.58, 0.95, 0.3],
    [0.75, 0.6, 0.26],
    [0.81, 0.24, 0.22],
    [0.78, -0.14, 0.2],
  ]);

/** Band 2 - the front hook, which curls behind the helix to grip. */
export const frontHook = () =>
  curve([
    [-0.44, 0.72, 0.3],
    [-0.58, 0.56, 0.12],
    [-0.64, 0.34, -0.1],
    [-0.56, 0.16, -0.3],
  ]);

/** Band 3 - inner swirl tracing the antihelix, the organic centre. */
export const innerSwirl = () =>
  curve([
    [0.5, 0.4, 0.3],
    [0.34, 0.16, 0.3],
    [0.24, -0.12, 0.28],
    [0.3, -0.36, 0.28],
    [0.5, -0.44, 0.28],
  ]);

/** Band 4 - lower flourish near the antitragus, where the drop hangs. */
export const lowerFlourish = () =>
  curve([
    [0.66, -0.3, 0.24],
    [0.5, -0.6, 0.26],
    [0.24, -0.76, 0.28],
    [0.02, -0.72, 0.26],
  ]);

export const BANDS = [helixBand, frontHook, innerSwirl, lowerFlourish];

/**
 * The six gem settings. Each is a visible crystal on the outer ear,
 * and each pairs with a tactile actuator clamped behind the same point
 * of cartilage - so what a person sees is jewelry, and what they feel
 * is the actuator. Ordered by bearing, index 0 toward the front.
 */
export const GEM_POSITIONS: [number, number, number][] = [
  [-0.47, 0.64, 0.3],
  [-0.06, 1.27, 0.4],
  [0.6, 0.94, 0.34],
  [0.83, 0.22, 0.26],
  [0.31, -0.36, 0.33],
  [0.16, -0.78, 0.32],
];

/** Teardrop profile, revolved into the hanging crystal. */
export function teardropProfile(): THREE.Vector2[] {
  const pts: THREE.Vector2[] = [];
  const steps = 18;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    // Radius swells low and tapers to a point at the top.
    const r = Math.sin(t * Math.PI) * 0.5 * (1 - t * 0.35);
    pts.push(new THREE.Vector2(Math.max(r, 0.001), t * 1.5 - 0.75));
  }
  return pts;
}

/**
 * Tether chain: hangs from the module's lower loop, sags below the
 * lobe and rises to meet the cuff, exactly as in the reference photo.
 * Given in ear-local space.
 */
export function chainCurve(): THREE.CatmullRomCurve3 {
  return curve(
    [
      [0.98, -0.62, -0.3],
      [0.94, -0.9, -0.16],
      [0.8, -1.06, 0.02],
      [0.58, -1.02, 0.16],
      [0.4, -0.9, 0.24],
      [0.24, -0.8, 0.28],
    ],
    0.5
  );
}
