import * as THREE from "three";

/* ==================================================================
   EAR CONTOUR - SHARED GEOMETRY SOURCE
   ------------------------------------------------------------------
   One definition of the ear outline, used by the anatomy mesh, the
   concealed cuff wire and the jewelry placement. Keeping a single
   source means the hardware always sits exactly on the cartilage
   instead of drifting when either side is tweaked.

   Proportions follow a real outer ear: roughly 60 mm tall by 35 mm
   wide, a ratio near 1.7:1. Coordinates are in scene units where the
   ear spans about 2.2 units vertically.

   Orientation (right ear, viewed from the side, camera on +Z):
     +X = toward the back of the head
     -X = toward the face (tragus side)
     +Y = up
================================================================== */

/** Outer rim of the ear, ordered clockwise from the top. */
export const EAR_RIM: [number, number][] = [
  [0.0, 1.15],
  [0.4, 1.03],
  [0.61, 0.72],
  [0.7, 0.32],
  [0.68, -0.08],
  [0.58, -0.44],
  [0.43, -0.74],
  [0.21, -0.97],
  [-0.05, -1.05],
  [-0.28, -0.93],
  [-0.43, -0.63],
  [-0.52, -0.26],
  [-0.58, 0.14],
  [-0.52, 0.57],
  [-0.35, 0.92],
  [-0.18, 1.1],
];

/** Closed 2D shape of the ear, for extrusion into the base plate. */
export function buildEarShape(): THREE.Shape {
  const shape = new THREE.Shape();
  const pts = EAR_RIM.map(([x, y]) => new THREE.Vector2(x, y));
  shape.moveTo(pts[0].x, pts[0].y);
  // splineThru rounds the polyline into a smooth organic outline.
  shape.splineThru(pts.slice(1));
  shape.closePath();
  return shape;
}

/**
 * The rolled helix rim. Runs from just above the tragus, up over the
 * top of the ear, around the back and down into the lobe - it does
 * NOT continue across the front, where the tragus sits instead.
 */
export function buildHelixCurve(z = 0.22): THREE.CatmullRomCurve3 {
  // Starts at the front-top (index 15), climbs over the crown, runs
  // down the back edge and dies away into the lobe. It deliberately
  // does NOT continue across the front, where the tragus sits.
  const order = [15, 0, 1, 2, 3, 4, 5, 6, 7, 8];
  return new THREE.CatmullRomCurve3(
    order.map((idx) => {
      const [x, y] = EAR_RIM[idx];
      return new THREE.Vector3(x, y, z);
    }),
    false,
    "catmullrom",
    0.5
  );
}

/**
 * The crus of the helix: the ridge that peels off the front rim and
 * runs back INTO the bowl of the ear, splitting the concha in two.
 * Small, but its absence is a large part of why an ear can read as a
 * featureless oval.
 */
export function buildCrusCurve(): THREE.CatmullRomCurve3 {
  return new THREE.CatmullRomCurve3(
    [
      new THREE.Vector3(-0.4, 0.62, 0.16),
      new THREE.Vector3(-0.22, 0.42, 0.13),
      new THREE.Vector3(0.02, 0.26, 0.1),
      new THREE.Vector3(0.16, 0.2, 0.06),
    ],
    false,
    "catmullrom",
    0.5
  );
}

/** The Y-shaped antihelix ridge inside the rim. */
export function buildAntihelixCurves(): THREE.CatmullRomCurve3[] {
  const stem = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.3, 0.42, 0.2),
    new THREE.Vector3(0.28, 0.1, 0.24),
    new THREE.Vector3(0.18, -0.24, 0.24),
    new THREE.Vector3(0.02, -0.52, 0.2),
  ]);
  const upperBranch = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.3, 0.42, 0.2),
    new THREE.Vector3(0.16, 0.66, 0.2),
    new THREE.Vector3(-0.04, 0.8, 0.18),
  ]);
  const lowerBranch = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.3, 0.42, 0.2),
    new THREE.Vector3(0.36, 0.66, 0.2),
    new THREE.Vector3(0.4, 0.85, 0.18),
  ]);
  return [stem, upperBranch, lowerBranch];
}

/**
 * The concealed cuff wire. A slim oval that hooks BEHIND the ear, so
 * from the front almost nothing shows - which is the entire point of
 * the design. Scaled just inside the rim and pushed back in Z.
 */
export function buildCuffWireCurve(): THREE.CatmullRomCurve3 {
  const scale = 0.82;
  const pts = EAR_RIM.map(
    ([x, y]) => new THREE.Vector3(x * scale, y * scale + 0.02, -0.3)
  );
  return new THREE.CatmullRomCurve3(pts, true, "catmullrom", 0.5);
}

/**
 * Placement of the six visible jewelry pieces along the helix rim.
 * These sit on the OUTER face of the ear and are the parts a person
 * actually sees. Each one pairs with a tactile actuator on the
 * concealed wire directly behind it, sandwiching the cartilage.
 *
 * Returned in bearing order: index 0 is toward the front, then
 * clockwise around the ear.
 */
export function buildJewelryPositions(): THREE.Vector3[] {
  const helix = buildHelixCurve(0.3);
  // Sample the front half of the rim, where jewelry is visible.
  const ts = [0.06, 0.2, 0.36, 0.54, 0.72, 0.9];
  return ts.map((t) => helix.getPoint(t));
}
