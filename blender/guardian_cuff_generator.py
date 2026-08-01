# ==================================================================
#  GUARDIAN CUFF - PROCEDURAL GENERATOR  (Phase 5)
#  ------------------------------------------------------------------
#  Run in Blender: Scripting -> New -> paste -> Run Script
#  Or headless:    blender --background --python this_file.py
#
#  UNITS: 1 Blender Unit = 1 metre.
#
#  ORIENTATION (right ear, subject facing -X)
#     +X  toward the BACK of the head
#     -X  toward the face
#     +Y  OUTWARD, away from the skull   <- the side an onlooker sees
#     -Y  INWARD, toward the skull       <- the side touching the head
#     +Z  up
#
#  THREE FIXES IN THIS REVISION
#  ----------------------------
#  1. OUTWARD NODES. Previously the actuator normals came straight
#     from closest_point_on_mesh, which returns whichever way the
#     nearest face happens to point - so roughly half the nodes aimed
#     at the skull. Every normal is now forced into the +Y hemisphere
#     (see outward_normal), guaranteeing each node's local Z points
#     away from the head and is visible to an onlooker.
#
#  2. FLUSH SEATING. Components are no longer positioned by guesswork
#     offsets. A ray is cast onto the actual pod surface and the bezel
#     and piezo are placed at the returned hit point, so they sit ON
#     the surface instead of being jammed through it.
#
#  3. TRUE EAR HOOK + MASTOID. The band now hooks OVER the helix and
#     tucks behind it (the crossing into -Y is what physically retains
#     an ear cuff), and the capsule sits on the mastoid process -
#     behind and just below the lobe - rather than dangling on the
#     neck. Both ends of the linkage terminate in real lugs.
# ==================================================================

import bpy
import math
import os
from mathutils import Vector, Matrix

# ------------------------------------------------------------------
# CONFIG
# ------------------------------------------------------------------
EXPORT_GLB = True
EXPORT_DIR = r"C:\Users\reily\OneDrive\Desktop\Projects\HearingAids\safety-app\public\models"
GLB_NAME = "guardian-cuff.glb"
USE_DRACO = True
SEAM_BEVEL = True

# ------------------------------------------------------------------
# BOLDNESS
# ------------------------------------------------------------------
# One multiplier drives every cross-section so the piece reads as
# tech-jewelry rather than wire. Design, path and layout are untouched
# - only the material thickness scales.
#
# NOTE: thickness and standoff are coupled. A thicker band needs to be
# pushed further out to stay clear of the skin, which is why the fit
# routine SOLVES the standoff rather than using a fixed number.
# BOLD scales the band and linkage; NODE scales the actuator hardware.
# They are separate because a single multiplier that made the band read
# as jewelry also blew the nodes up into domes that dominated the piece.
# The ear FIT is independent of both - it comes from the solved
# standoff - so these can be tuned purely on looks.
BOLD = 0.88          # slim band - a fine cuff, not a thick appliance
NODE = 0.95          # discreet actuators, not bulbs

BAND_W, BAND_T = 0.0018 * BOLD, 0.00078 * BOLD     # 4.1 x 1.8 mm section
POD_SEMI = tuple(v * NODE for v in (0.0028, 0.0023, 0.0019))   # 5.9 x 4.8 x 4.0 mm

BEZEL_MAJOR, BEZEL_MINOR = 0.00172 * NODE, 0.00028 * NODE
PIEZO_R, PIEZO_D = 0.00142 * NODE, 0.00052 * NODE
CHAIN_R = 0.00046 * BOLD
CHAIN_BEAD_R = 0.00104 * BOLD
TERM_BEAD = (0.00120 * BOLD, 0.00112 * BOLD)
LUG_MAJOR, LUG_MINOR = 0.00082 * BOLD, 0.00026 * BOLD
MIC_R = 0.00036 * BOLD

# Mastoid process: behind the ear canal and below it, over dense bone
# with little soft tissue. Set further back and lower than a simple
# behind-the-lobe position so the linkage drapes down the skull the
# way a bone conduction aid actually hangs, rather than sitting
# tight against the ear.
MASTOID = Vector((0.0322, -0.0062, -0.0328))

# Decorative drop earring hanging from the cuff terminal.
EARRING = True
GEM_FACETS = 12          # low count reads as a cut stone, not a ball

# ------------------------------------------------------------------
# FITTED MODE
# ------------------------------------------------------------------
# When fitting to a specific head, the spine is derived from that ear's
# MEASURED helix rim rather than from hand-authored points. A cuff
# generated this way wraps the ear by construction, which is the only
# way to guarantee contact on a curved organic surface - matching
# bounding boxes does not (two shapes can share a box and never touch).
#
# Set FIT_SPINE to a list of (x, y, z, radius, tilt) in CUFF-LOCAL
# space, and FIT_MASTOID to the capsule site, then run with
# WIPE_SCENE = False to build into an existing scene.
FIT_SPINE = None
FIT_MASTOID = None
WIPE_SCENE = True


# ------------------------------------------------------------------
# HOUSEKEEPING
# ------------------------------------------------------------------
def wipe():
    for ob in list(bpy.data.objects):
        if ob.type in {"MESH", "CURVE", "EMPTY"}:
            bpy.data.objects.remove(ob, do_unlink=True)
    for mat in list(bpy.data.materials):
        bpy.data.materials.remove(mat)


def activate(ob):
    bpy.ops.object.select_all(action="DESELECT")
    ob.select_set(True)
    bpy.context.view_layer.objects.active = ob


# ------------------------------------------------------------------
# MATERIALS - plain Principled BSDF, no textures
# ------------------------------------------------------------------
# Deliberately kept as flat scalar PBR. Nothing is baked to an image,
# so React can override baseColor at runtime and recolour the device
# (silver / rose gold / matte black) without touching the mesh.
def pbr(name, colour, metallic, roughness, emissive=None):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = (*colour, 1.0)
    bsdf.inputs["Metallic"].default_value = metallic
    bsdf.inputs["Roughness"].default_value = roughness
    if emissive and "Emission Color" in bsdf.inputs:
        bsdf.inputs["Emission Color"].default_value = (*emissive, 1.0)
        bsdf.inputs["Emission Strength"].default_value = 0.0
    return mat


def build_materials():
    return {
        # MAT_Shell is the ONLY material React recolours. Everything
        # else is functional and must stay fixed.
        "shell": pbr("MAT_Shell", (0.87, 0.89, 0.92), 1.0, 0.13),
        "silicone": pbr("MAT_SkinSilicone", (0.46, 0.34, 0.25), 0.0, 0.95),
        "piezo": pbr("MAT_PiezoFace", (0.11, 0.12, 0.14), 0.55, 0.42,
                     (1.0, 0.65, 0.14)),
        "driver": pbr("MAT_Driver", (0.05, 0.06, 0.07), 0.85, 0.35,
                      (0.22, 0.85, 0.91)),
        "led": pbr("MAT_LED", (0.05, 0.90, 0.40), 0.0, 0.30,
                   (0.10, 1.00, 0.45)),
        # MAT_Gem is the second React-themeable material, so the wearer
        # can choose a stone independently of the metal finish.
        "gem": gem_material(),
    }


def gem_material():
    """Faceted stone. Transmission is exported by Blender as
    KHR_materials_transmission; viewers that ignore the extension
    still get a bright low-roughness surface, so it never renders
    as a black blob."""
    mat = bpy.data.materials.new("MAT_Gem")
    mat.use_nodes = True
    b = mat.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = (0.72, 0.86, 0.98, 1.0)
    b.inputs["Metallic"].default_value = 0.0
    b.inputs["Roughness"].default_value = 0.04
    if "IOR" in b.inputs:
        b.inputs["IOR"].default_value = 2.2          # near diamond
    for key in ("Transmission Weight", "Transmission"):
        if key in b.inputs:
            b.inputs[key].default_value = 0.85
            break
    return mat


# ------------------------------------------------------------------
# GEOMETRY HELPERS
# ------------------------------------------------------------------
def make_profile(name, w, t):
    bpy.ops.curve.primitive_bezier_circle_add(radius=1.0)
    p = bpy.context.active_object
    p.name = name
    p.scale = (w, t, 1.0)
    return p


def ribbon(name, points, profile, material, resolution=32):
    """points: (x, y, z, radius, tilt_deg). Per-point radius gives the
    band organic thickness variation instead of uniform wire."""
    cu = bpy.data.curves.new(name + "_CU", "CURVE")
    cu.dimensions = "3D"
    cu.resolution_u = resolution
    cu.bevel_mode = "OBJECT"
    cu.bevel_object = profile
    cu.use_fill_caps = True

    sp = cu.splines.new("BEZIER")
    sp.bezier_points.add(len(points) - 1)
    for i, (x, y, z, r, tilt) in enumerate(points):
        bp = sp.bezier_points[i]
        bp.co = Vector((x, y, z))
        bp.radius = r
        bp.tilt = math.radians(tilt)
        bp.handle_left_type = bp.handle_right_type = "AUTO"

    ob = bpy.data.objects.new(name, cu)
    bpy.context.collection.objects.link(ob)
    activate(ob)
    bpy.ops.object.convert(target="MESH")
    mesh = bpy.context.view_layer.objects.active
    mesh.data.materials.append(material)
    bpy.ops.object.shade_smooth()
    return mesh


def sample_curve_points(ctrl_pts, count):
    """Return `count` positions lying EXACTLY on the rendered bezier.

    Evaluating the control polygon directly (De Casteljau over the
    control points) is not the same curve Blender draws with AUTO
    handles - measured drift on this linkage was 2.55 mm against a
    0.46 mm wire, so beads ended up floating beside it. Building the
    curve, converting to a polyline and reading its vertices gives the
    true centreline."""
    cu = bpy.data.curves.new("_sample_CU", "CURVE")
    cu.dimensions = "3D"
    cu.resolution_u = 48                 # no bevel: a bare polyline
    sp = cu.splines.new("BEZIER")
    sp.bezier_points.add(len(ctrl_pts) - 1)
    for i, p in enumerate(ctrl_pts):
        bp = sp.bezier_points[i]
        bp.co = Vector(p)
        bp.handle_left_type = bp.handle_right_type = "AUTO"
    ob = bpy.data.objects.new("_sample", cu)
    bpy.context.collection.objects.link(ob)
    activate(ob)
    bpy.ops.object.convert(target="MESH")
    mesh = bpy.context.view_layer.objects.active
    verts = [mesh.matrix_world @ v.co for v in mesh.data.vertices]
    bpy.data.objects.remove(mesh, do_unlink=True)
    if len(verts) < 2:
        return []
    out = []
    for i in range(count):
        t = (i + 0.5) / count
        out.append(verts[min(int(t * (len(verts) - 1)), len(verts) - 1)])
    return out


def bead(name, location, radius, material):
    bpy.ops.mesh.primitive_uv_sphere_add(
        radius=radius, segments=24, ring_count=14, location=location)
    ob = bpy.context.active_object
    ob.name = name
    ob.data.materials.append(material)
    bpy.ops.object.shade_smooth()
    return ob


# ---------- FIX 1: guaranteed outward normals ----------
def outward_normal(mesh_ob, point, tangent):
    """Surface normal at `point`, forced into the OUTWARD (+Y)
    hemisphere and orthogonalised against the path tangent.

    Without the flip, closest_point_on_mesh returns the normal of
    whichever face happens to be nearest, which for a tube is
    arbitrary - and any node built on it would face the skull."""
    local = mesh_ob.matrix_world.inverted() @ point
    _, _, nor, _ = mesh_ob.closest_point_on_mesh(local)
    N = (mesh_ob.matrix_world.to_3x3() @ nor).normalized()

    # Force outward. +Y is away from the head.
    if N.y < 0.0:
        N = -N

    # Remove any component along the path so the node sits square.
    N = (N - N.dot(tangent) * tangent).normalized()

    # Degenerate guard. Two ways this collapses:
    #  - the band runs parallel to Y, so the projection vanishes
    #  - the sample lands on an END CAP, whose normal follows the path
    #    rather than the surface, leaving N only weakly outward
    # In either case, rebuild from world outward instead of trusting
    # the sampled normal. 0.25 is deliberately conservative: anything
    # shallower would still read as facing the skull.
    if N.length < 0.5 or N.y < 0.25:
        N = Vector((0.0, 1.0, 0.0))
        N = (N - N.dot(tangent) * tangent).normalized()
    return N


# ---------- FIX 2: flush seating by raycast ----------
def seat_on_surface(target, point, normal, standoff=0.02):
    """Cast a ray from outside the object back along the normal and
    return the exact surface hit, so parts sit ON the surface rather
    than being pushed through it by a guessed offset."""
    origin_w = point + normal * standoff
    inv = target.matrix_world.inverted()
    origin_l = inv @ origin_w
    dir_l = (inv.to_3x3() @ (-normal)).normalized()
    hit, loc, _, _ = target.ray_cast(origin_l, dir_l)
    if hit:
        return target.matrix_world @ loc
    return point + normal * 0.0015      # fallback


def basis(T, B, N, origin):
    """Local axes: X=tangent, Y=binormal, Z=outward normal.
    Because Z maps to the outward normal, any cylinder or torus built
    with this basis has its face pointing away from the head."""
    return Matrix((
        (T.x, B.x, N.x, origin.x),
        (T.y, B.y, N.y, origin.y),
        (T.z, B.z, N.z, origin.z),
        (0.0, 0.0, 0.0, 1.0),
    ))


# ------------------------------------------------------------------
# FIX 3: THE EAR HOOK
# ------------------------------------------------------------------
# Points 0-2 sit BEHIND the helix (-Y). The band then crosses the rim
# near the apex and runs down the OUTWARD face (+Y), where the nodes
# live. That crossing is what physically retains the cuff on the ear -
# a band lying flat on one face would simply fall off.
SPINE = [
    (-0.0138, -0.0034,  0.0246, 0.86, 0),   # behind the helix, front
    (-0.0112, -0.0028,  0.0312, 0.92, 0),   # rising behind the rim
    (-0.0034, -0.0006,  0.0356, 0.98, 0),   # crossing the rim at apex
    ( 0.0052,  0.0046,  0.0338, 1.00, 0),   # now on the outward face
    ( 0.0140,  0.0058,  0.0250, 1.00, 0),
    ( 0.0184,  0.0052,  0.0140, 1.00, 0),
    ( 0.0192,  0.0044,  0.0020, 1.00, 0),
    ( 0.0168,  0.0040, -0.0100, 0.98, 0),
    ( 0.0118,  0.0042, -0.0200, 0.94, 0),
    ( 0.0062,  0.0044, -0.0292, 0.88, 0),   # terminal above the lobe
]

# Actuator sites as FRACTIONS along the spine, not fixed indices.
# Fixed indices were written for a 10-point authored spine; when a
# fitted spine has 17 points the same indices all land in the upper
# third and the nodes bunch together. Fractions space them evenly
# whatever the spine resolution, which is what keeps 360-degree
# coverage meaningful.
# Range avoids both terminals, where the sampled normal comes off an
# end cap rather than the side wall.
NODE_FRACTIONS = [0.20, 0.42, 0.64, 0.86]


def node_indices(spine):
    """Pick actuator stations by ARC LENGTH along the spine.

    Spacing by index fraction is only even if the control points are
    evenly spaced, and a rim-fitted spine is not - stations bunch where
    the trace sampled densely. Measuring cumulative distance makes the
    gaps between actuators equal in millimetres, which is what
    360-degree coverage actually requires."""
    pts = [Vector(p[:3]) for p in spine]
    cum = [0.0]
    for i in range(1, len(pts)):
        cum.append(cum[-1] + (pts[i] - pts[i - 1]).length)
    total = cum[-1]
    if total <= 0:
        return list(range(min(4, len(pts))))

    idx, seen = [], set()
    for f in NODE_FRACTIONS:
        target = f * total
        i = min(range(len(cum)), key=lambda j: abs(cum[j] - target))
        i = max(1, min(len(pts) - 2, i))
        while i in seen and i < len(pts) - 2:
            i += 1
        seen.add(i)
        idx.append(i)
    return idx


# ------------------------------------------------------------------
# BUILD
# ------------------------------------------------------------------
def build():
    global SPINE, MASTOID
    if FIT_SPINE:
        SPINE = FIT_SPINE
    if FIT_MASTOID:
        MASTOID = Vector(FIT_MASTOID)
    if WIPE_SCENE:
        wipe()
    M = build_materials()
    prof = make_profile("_ProfBand", BAND_W, BAND_T)

    body = ribbon("GC_Cuff_Body", SPINE, prof, M["shell"])
    weld = [
        bead("_t0", SPINE[0][:3], TERM_BEAD[0], M["shell"]),
        bead("_t1", SPINE[-1][:3], TERM_BEAD[1], M["shell"]),
    ]

    pts = [Vector(p[:3]) for p in SPINE]

    def tangent_at(i):
        a = pts[max(i - 1, 0)]
        b = pts[min(i + 1, len(pts) - 1)]
        return (b - a).normalized()

    # ---------- Actuator assemblies ----------
    piezos = []
    for k, idx in enumerate(node_indices(SPINE)):
        P = pts[idx]
        T = tangent_at(idx)
        # Actuators are aligned to a CONSTANT outward axis rather than
        # the local surface normal. Following the surface makes each one
        # present a different face as the rim curves - measured spread
        # was -0.90 to -0.39, so some read face-on and others edge-on.
        # A shared axis makes all four identical to an onlooker, which
        # is what a directional indicator has to be.
        N = Vector((0.0, 1.0, 0.0))
        N = (N - N.dot(T) * T).normalized()
        if N.length < 0.5 or N.y < 0.0:
            N = outward_normal(body, P, T)
        B = N.cross(T).normalized()

        # Pod: swells out of the band so the two read as one casting
        bpy.ops.mesh.primitive_uv_sphere_add(radius=1.0, segments=44,
                                             ring_count=26)
        pod = bpy.context.active_object
        pod.name = f"_pod{k}"
        # Seat the pod OUTWARD rather than centred on the spine. Centred,
        # half its depth buries into the cartilage and forces the whole
        # band to stand off further to compensate. Pushed out, the pod
        # reads proud on the visible face and the band can sit close.
        pod.matrix_world = basis(T, B, N, P + N * (POD_SEMI[2] * 0.55)) \
            @ Matrix.Diagonal(Vector(POD_SEMI).to_4d())
        pod.data.materials.append(M["shell"])
        bpy.ops.object.shade_smooth()
        bpy.context.view_layer.update()

        # Seat the bezel and piezo on the pod's ACTUAL outer surface
        surface = seat_on_surface(pod, P, N)

        bpy.ops.mesh.primitive_torus_add(
            major_radius=BEZEL_MAJOR, minor_radius=BEZEL_MINOR,
            major_segments=44, minor_segments=12)
        bez = bpy.context.active_object
        bez.name = f"_bezel{k}"
        bez.matrix_world = basis(T, B, N, surface - N * 0.00012)
        bez.data.materials.append(M["shell"])
        bpy.ops.object.shade_smooth()

        # PIEZO FACE - separate object, local Z along the outward
        # normal, so it faces the onlooker and React can recolour it.
        bpy.ops.mesh.primitive_cylinder_add(radius=PIEZO_R, depth=PIEZO_D,
                                            vertices=44)
        pz = bpy.context.active_object
        pz.name = f"GC_TactileNode_{k}"
        pz.matrix_world = basis(T, B, N, surface + N * 0.00010)
        pz.data.materials.append(M["piezo"])
        bpy.ops.object.shade_smooth()

        pz["outward"] = list(N)     # stored for the audit
        piezos.append(pz)
        weld += [pod, bez]

    # ---------- Microphone ports, also outward ----------
    for k, idx in enumerate((4, 8)):
        P = pts[idx]
        T = tangent_at(idx)
        N = outward_normal(body, P, T)
        B = N.cross(T).normalized()
        surface = seat_on_surface(body, P, N, standoff=0.01)
        bpy.ops.mesh.primitive_cylinder_add(radius=MIC_R, depth=0.00040*BOLD,
                                            vertices=20)
        mic = bpy.context.active_object
        mic.name = f"GC_MicPort_{k}"
        mic.matrix_world = basis(T, B, N, surface - N * 0.00006)
        mic.data.materials.append(M["driver"])
        bpy.ops.object.shade_smooth()

    # ---------- Attachment lug ----------
    # Placed on the REAR of the cuff, level with the mastoid - not on
    # the bottom terminal. The capsule sits behind the ear, so a link
    # from the lowest point would have to climb back up to reach it.
    term = pts[7]
    T_end = (pts[8] - pts[6]).normalized()
    N_end = outward_normal(body, term, T_end)
    B_end = N_end.cross(T_end).normalized()
    bpy.ops.mesh.primitive_torus_add(major_radius=LUG_MAJOR, minor_radius=LUG_MINOR,
                                     major_segments=28, minor_segments=10)
    lug = bpy.context.active_object
    lug.name = "_lugTop"
    lug.matrix_world = basis(N_end, T_end, B_end, term + T_end * 0.0009)
    lug.data.materials.append(M["shell"])
    bpy.ops.object.shade_smooth()
    weld.append(lug)

    # ---------- Weld the shell into one solid ----------
    activate(body)
    for t in weld:
        mod = body.modifiers.new(f"U_{t.name}", "BOOLEAN")
        mod.operation = "UNION"
        mod.solver = "EXACT"
        mod.object = t
        activate(body)
        bpy.ops.object.modifier_apply(modifier=mod.name)
    for t in weld:
        bpy.data.objects.remove(t, do_unlink=True)

    if SEAM_BEVEL:
        activate(body)
        bev = body.modifiers.new("SeamFillet", "BEVEL")
        bev.width = 0.00022
        bev.segments = 3
        bev.limit_method = "ANGLE"
        bev.angle_limit = math.radians(30)
        bpy.ops.object.modifier_apply(modifier="SeamFillet")
    activate(body)
    bpy.ops.object.shade_smooth()
    bpy.data.objects.remove(prof, do_unlink=True)

    # ---------- Bone conduction capsule on the MASTOID ----------
    bpy.ops.mesh.primitive_cylinder_add(radius=0.0075, depth=0.0060,
                                        vertices=72, location=MASTOID)
    pad = bpy.context.active_object
    pad.name = "GC_BoneConduction_Pad"
    pad.rotation_euler = (math.radians(90), 0, math.radians(-8))
    pad.scale = (1.0, 1.42, 1.0)
    activate(pad)
    bpy.ops.object.transform_apply(scale=True)
    mb = pad.modifiers.new("Bevel", "BEVEL")
    mb.width = 0.0023
    mb.segments = 12
    mb.limit_method = "ANGLE"
    bpy.ops.object.modifier_apply(modifier="Bevel")
    pad.data.materials.append(M["silicone"])
    bpy.ops.object.shade_smooth()

    # ---- Transducer, INWARD side, pressed to the mastoid ----
    # A real bone conduction transducer is not a wide flat plate. It is
    # a small, slightly DOMED contact pad, because the vibration has to
    # couple through a concentrated area to drive the bone. A convex
    # face also keeps contact if the head curves away from the housing.
    # Previous version was 12 mm across on a 15 mm capsule and read as
    # a giant flat ring.
    bpy.ops.mesh.primitive_uv_sphere_add(
        radius=0.0046, segments=48, ring_count=24,
        location=(MASTOID.x, MASTOID.y - 0.0036, MASTOID.z))
    face = bpy.context.active_object
    face.name = "GC_BoneConduction_Face"
    # Squash into a shallow dome protruding ~1 mm from the housing
    face.scale = (1.0, 0.26, 1.0)
    activate(face)
    bpy.ops.object.transform_apply(scale=True)
    face.data.materials.append(M["driver"])
    bpy.ops.object.shade_smooth()

    # Compliant silicone collar around the transducer - the part that
    # actually seats against skin and spreads the clamping load.
    bpy.ops.mesh.primitive_torus_add(
        major_radius=0.0052, minor_radius=0.0011,
        major_segments=48, minor_segments=14,
        location=(MASTOID.x, MASTOID.y - 0.0031, MASTOID.z))
    collar = bpy.context.active_object
    collar.name = "GC_BoneConduction_Collar"
    collar.rotation_euler = (math.radians(90), 0, 0)
    collar.data.materials.append(M["silicone"])
    bpy.ops.object.shade_smooth()

    # Charge contacts + LED on the OUTWARD side, visible to an onlooker
    for i, dz in enumerate((-0.0028, 0.0028)):
        bpy.ops.mesh.primitive_cylinder_add(
            radius=0.0011, depth=0.0006, vertices=26,
            location=(MASTOID.x - 0.0038, MASTOID.y + 0.0032, MASTOID.z + dz))
        c = bpy.context.active_object
        c.name = f"GC_ChargeContact_{i}"
        c.rotation_euler = (math.radians(90), 0, 0)
        c.data.materials.append(M["shell"])
        bpy.ops.object.shade_smooth()

    led = bead("GC_StatusLED",
               (MASTOID.x + 0.0034, MASTOID.y + 0.0031, MASTOID.z + 0.0072),
               0.00095, M["led"])
    led.scale = (1.0, 0.5, 1.0)

    # ---------- Linkage: lug to lug, short and logical ----------
    # Longer draping run from the cuff lug, curving back and down the
    # skull to the capsule. Extra control points let it sag under its
    # own weight the way a worn chain does, instead of cutting a
    # straight line through the air.
    # Both ends deliberately OVERSHOOT into the parts they join. The
    # capsule is 22 mm tall, so its top face is 11 mm above centre; a
    # link ending at +10.8 mm sat just proud of it and left a visible
    # 0.46 mm gap. Ending at +4 mm buries the wire inside the housing,
    # which is how a real anchored cable terminates.
    pad_lug = MASTOID + Vector((-0.0018, 0.0006, 0.0108))
    LINK = [
        term + Vector((0.0002, -0.0001, -0.0002)),          # inside the terminal
        term + Vector((0.0052, -0.0026, -0.0068)),
        term + Vector((0.0092, -0.0044, -0.0128)),
        pad_lug + Vector((-0.0052, -0.0016, -0.0034)),
        pad_lug + Vector((-0.0014, -0.0002, -0.0020)),
        MASTOID + Vector((-0.0018, 0.0006, 0.0040)),        # inside the capsule
    ]
    cu = bpy.data.curves.new("GC_Link_CU", "CURVE")
    cu.dimensions = "3D"
    cu.resolution_u = 28
    cu.bevel_depth = CHAIN_R
    cu.bevel_resolution = 8
    sp = cu.splines.new("BEZIER")
    sp.bezier_points.add(len(LINK) - 1)
    for i, p in enumerate(LINK):
        bp = sp.bezier_points[i]
        bp.co = p
        bp.handle_left_type = bp.handle_right_type = "AUTO"
    wire = bpy.data.objects.new("GC_Link_Chain", cu)
    bpy.context.collection.objects.link(wire)
    activate(wire)
    bpy.ops.object.convert(target="MESH")
    wire = bpy.context.view_layer.objects.active
    wire.data.materials.append(M["shell"])
    bpy.ops.object.shade_smooth()

    # Beads sampled from the TRUE centreline, so every one is threaded
    # onto the wire rather than sitting beside it.
    bead_pts = sample_curve_points(LINK, 9)
    link_beads = [bead(f"_lb{i}", p, CHAIN_BEAD_R, M["shell"])
                  for i, p in enumerate(bead_pts)]
    activate(wire)
    for b in link_beads:
        mod = wire.modifiers.new(f"U{b.name}", "BOOLEAN")
        mod.operation = "UNION"
        mod.solver = "EXACT"
        mod.object = b
        activate(wire)
        bpy.ops.object.modifier_apply(modifier=mod.name)
    for b in link_beads:
        bpy.data.objects.remove(b, do_unlink=True)

    # ---------- Drop earring ----------
    if EARRING:
        build_earring(pts[-1], M)

    return body, piezos


def build_earring(anchor, M):
    """A bail, a short drop chain and a faceted stone hanging from the
    cuff terminal above the lobe. Purely decorative - it carries no
    electronics - but it is the element that lets the device read as
    jewelry rather than as a medical appliance."""
    bail_c = anchor + Vector((0.0000, 0.0002, -0.0020))

    # Bail: the ring the drop hangs from, welded to the terminal
    bpy.ops.mesh.primitive_torus_add(
        major_radius=0.00090, minor_radius=0.00026,
        major_segments=28, minor_segments=10, location=bail_c)
    bail = bpy.context.active_object
    bail.name = "GC_Earring_Bail"
    bail.rotation_euler = (0.0, math.radians(90), 0.0)
    bail.data.materials.append(M["shell"])
    bpy.ops.object.shade_smooth()

    # Drop chain. Spacing is derived from the ring geometry, not picked
    # by eye: a torus of major R and minor r reaches R + r from centre,
    # so consecutive links must sit closer than 2*(R + r) or they hang
    # in mid-air. Previous spacing left a 0.22 mm gap at every joint.
    RING_R, RING_r = 0.00070, 0.00021
    reach = RING_R + RING_r                  # 0.91 mm
    pitch = reach * 1.42                     # comfortably interlocking
    drop_parts = []
    link_z = [-(0.00116 + reach * 0.55) - i * pitch for i in range(3)]
    for i, dz in enumerate(link_z):
        bpy.ops.mesh.primitive_torus_add(
            major_radius=RING_R, minor_radius=RING_r,
            major_segments=24, minor_segments=9,
            location=bail_c + Vector((0.0, 0.0, dz)))
        lk = bpy.context.active_object
        lk.name = f"_droplink{i}"
        # Alternate the plane of each link, as a real chain does
        lk.rotation_euler = ((math.radians(90) if i % 2 else 0.0),
                             math.radians(90), 0.0)
        lk.data.materials.append(M["shell"])
        bpy.ops.object.shade_smooth()
        drop_parts.append(lk)

    activate(bail)
    for p in drop_parts:
        mod = bail.modifiers.new(f"U{p.name}", "BOOLEAN")
        mod.operation = "UNION"
        mod.solver = "EXACT"
        mod.object = p
        activate(bail)
        bpy.ops.object.modifier_apply(modifier=mod.name)
    for p in drop_parts:
        bpy.data.objects.remove(p, do_unlink=True)

    # ---- Faceted stone: pavilion + girdle + crown ----
    # Seated so the crown overlaps the lowest drop link. The stone must
    # hang FROM the chain, not float below it.
    gem_top = bail_c + Vector((0.0, 0.0, link_z[-1] - reach * 0.45))
    n = GEM_FACETS

    # Crown: truncated cone, table facet uppermost
    bpy.ops.mesh.primitive_cone_add(
        radius1=0.0030, radius2=0.0017, depth=0.0014, vertices=n,
        location=gem_top + Vector((0.0, 0.0, -0.0007)))
    crown = bpy.context.active_object
    crown.name = "GC_Earring_Gem"

    # Girdle: the band around the widest point
    bpy.ops.mesh.primitive_cylinder_add(
        radius=0.0030, depth=0.0005, vertices=n,
        location=gem_top + Vector((0.0, 0.0, -0.0016)))
    girdle = bpy.context.active_object

    # Pavilion: inverted cone tapering to the culet
    bpy.ops.mesh.primitive_cone_add(
        radius1=0.0030, radius2=0.0, depth=0.0042, vertices=n,
        location=gem_top + Vector((0.0, 0.0, -0.0039)))
    pav = bpy.context.active_object
    pav.rotation_euler = (math.radians(180), 0.0, 0.0)

    activate(crown)
    for part in (girdle, pav):
        mod = crown.modifiers.new(f"U{part.name}", "BOOLEAN")
        mod.operation = "UNION"
        mod.solver = "EXACT"
        mod.object = part
        activate(crown)
        bpy.ops.object.modifier_apply(modifier=mod.name)
    for part in (girdle, pav):
        bpy.data.objects.remove(part, do_unlink=True)

    crown.data.materials.clear()
    crown.data.materials.append(M["gem"])
    # FLAT shading - facets must catch light as distinct planes.
    # Smoothing here would turn a cut stone back into a bead.
    activate(crown)
    bpy.ops.object.shade_flat()


# ------------------------------------------------------------------
# AUDIT
# ------------------------------------------------------------------
def audit(piezos):
    def bb(o):
        return [o.matrix_world @ Vector(c) for c in o.bound_box]

    def overlaps(a, b, tol=2e-4):
        A, B = bb(a), bb(b)
        for ax in range(3):
            if max(v[ax] for v in A) < min(v[ax] for v in B) - tol:
                return False
            if max(v[ax] for v in B) < min(v[ax] for v in A) - tol:
                return False
        return True

    O = bpy.data.objects
    checks = {
        "chain<->body": overlaps(O["GC_Link_Chain"], O["GC_Cuff_Body"]),
        "chain<->pad": overlaps(O["GC_Link_Chain"], O["GC_BoneConduction_Pad"]),
        "driver<->pad": overlaps(O["GC_BoneConduction_Face"],
                                 O["GC_BoneConduction_Pad"]),
        "led<->pad": overlaps(O["GC_StatusLED"], O["GC_BoneConduction_Pad"]),
    }
    if "GC_Earring_Bail" in O:
        checks["bail<->body"] = overlaps(O["GC_Earring_Bail"], O["GC_Cuff_Body"])
        checks["gem<->bail"] = overlaps(O["GC_Earring_Gem"], O["GC_Earring_Bail"])
    for i, pz in enumerate(piezos):
        checks[f"piezo{i}<->body"] = overlaps(pz, O["GC_Cuff_Body"])
        # Local Z of each node must point outward (+Y)
        z_axis = (pz.matrix_world.to_3x3() @ Vector((0, 0, 1))).normalized()
        checks[f"piezo{i}_faces_outward"] = z_axis.y > 0.15
    return checks


# ------------------------------------------------------------------
# GROUP + EXPORT
# ------------------------------------------------------------------
def group_and_export():
    meshes = [o for o in bpy.data.objects if o.type == "MESH"]
    bpy.ops.object.empty_add(type="PLAIN_AXES", location=(0, 0, 0))
    root = bpy.context.active_object
    root.name = "GuardianCuff"

    corners = []
    for o in meshes:
        o.parent = root
        o.matrix_parent_inverse = root.matrix_world.inverted()
        corners += [o.matrix_world @ Vector(c) for c in o.bound_box]
    root.location = (
        -(min(v.x for v in corners) + max(v.x for v in corners)) / 2,
        -(min(v.y for v in corners) + max(v.y for v in corners)) / 2,
        -(min(v.z for v in corners) + max(v.z for v in corners)) / 2,
    )

    if not EXPORT_GLB:
        return None
    os.makedirs(EXPORT_DIR, exist_ok=True)
    bpy.ops.object.select_all(action="DESELECT")
    root.select_set(True)
    for o in meshes:
        o.select_set(True)
    bpy.context.view_layer.objects.active = root
    path = os.path.join(EXPORT_DIR, GLB_NAME)
    bpy.ops.export_scene.gltf(
        filepath=path, export_format="GLB", use_selection=True,
        export_apply=True, export_yup=True, export_materials="EXPORT",
        export_cameras=False, export_lights=False,
        export_draco_mesh_compression_enable=USE_DRACO,
        export_draco_mesh_compression_level=6)
    return path


if __name__ == "__main__":
    body, piezos = build()
    checks = audit(piezos)
    print("\n" + "=" * 58)
    print("GUARDIAN CUFF - BUILD REPORT")
    print("=" * 58)
    d = [round(x * 1000, 1) for x in body.dimensions]
    print(f"Cuff body      : {d[0]} x {d[1]} x {d[2]} mm")
    print(f"Body triangles : {len(body.data.polygons)}")
    print("-" * 58)
    for k, v in checks.items():
        print(f"  {'OK  ' if v else 'FAIL'}  {k}")
    print("-" * 58)
    print(f"ALL PASS       : {all(checks.values())}")
    out = group_and_export()
    if out:
        print(f"Exported       : {out} "
              f"({round(os.path.getsize(out) / 1024, 1)} KB)")
    print("=" * 58 + "\n")
