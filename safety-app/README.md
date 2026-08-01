# VibraSafe - Safety App MVP

ESCOM Science Expo project. Next.js 16 (App Router) + Tailwind v4 +
React Three Fiber + Framer Motion + Lucide.

## Run locally

```bash
cd safety-app
npm install
npm run dev
```

Open http://localhost:3000

## Build

```bash
npm run build && npm start
```

## Deploy to Vercel

```bash
npm i -g vercel
vercel
```

Vercel auto-detects Next.js. No environment variables are required yet.

## Architecture

```
src/
  app/
    layout.tsx     Root layout, metadata, skip-link
    globals.css    Tailwind v4 @theme design tokens
    page.tsx       Server Component - composes the page
  lib/
    store.ts       Zustand store - single source of truth for device state
  components/
    shell/
      Navigation.tsx        Desktop bar + mobile tab bar
    device/
      DeviceViewerClient.tsx  "use client" boundary for the canvas
      DeviceViewer.tsx        R3F <Canvas>, lights, OrbitControls
      EarCuffModel.tsx        Procedural cuff geometry, subscribes to store
      DeviceControls.tsx      Sliders / SOS / spatial dial - write to store
```

### How the UI drives the 3D model

`src/lib/store.ts` is a Zustand store. `DeviceControls` writes to it;
`EarCuffModel` reads from it inside `useFrame`, so changes appear on the
next rendered frame with no prop drilling.

| Control | Store field | Effect on the model |
|---|---|---|
| Vibration intensity | `tactileIntensity` | Node scale + emissive strength |
| Bone conduction volume | `bcVolume` | Skin-tone puck glow |
| Spatial direction | `bearing` / `activeZone` | Cuff yaws; one node lights amber |
| SOS | `sosActive` | Whole assembly pulses red, shakes, red key light |

### Scientific constraint encoded in the code

The two output channels are deliberately kept separate and must not be
conflated:

- **Tactile (amber)** - non-auditory vibration on ear cartilage. Carries
  **direction**, because each cuff stimulates its own ear with no cross-talk.
- **Bone conduction (cyan)** - auditory, via skull vibration. Carries
  **audio content only**. Transcranial attenuation is near 0 dB below 1 kHz,
  so the signal reaches both cochleae and cannot encode direction.

## Notes

- TypeScript is pinned to `^6.0.3`. TypeScript 7 does not yet expose the
  compiler API that Next 16 uses for type checking.
- `next.config.ts` sets `transpilePackages: ["three"]`, required because
  three.js ships untranspiled ESM add-ons used by drei.
- Fonts use a system stack rather than `next/font/google`, so the build has
  no external network dependency.
