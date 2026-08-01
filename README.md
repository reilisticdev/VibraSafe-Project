# VibraSafe

**Safety you can feel, not just hear.**

VibraSafe (formerly *Guardian Cuff*) is a bilateral, fashion-forward ear cuff engineered for Deaf and Hard-of-Hearing individuals. It converts ambient environmental sound — sirens, smoke alarms, an approaching vehicle, a raised voice — into intuitive, 360-degree directional touch, paired with clear bone-conducted audio and a phone-free physical safety kit for when technology isn't an option.

Built for the **ESKOM Science Expo — Biomedical & Medical Sciences (Audiology)** category.

🔗 **Live demo:** [vibra-safe-project.vercel.app](https://vibra-safe-project.vercel.app)

---

## Table of contents

- [The problem](#the-problem)
- [How it works](#how-it-works)
- [Repository structure](#repository-structure)
- [The two applications](#the-two-applications)
  - [1. Marketing & science platform](#1-marketing--science-platform-marketing-website)
  - [2. Companion safety app](#2-companion-safety-app-safety-app)
- [Hardware specification](#hardware-specification)
- [Tech stack](#tech-stack)
- [Getting started](#getting-started)
- [Design principles](#design-principles)
- [Scientific validation](#scientific-validation)
- [Project status](#project-status)
- [License](#license)

---

## The problem

- **~600,000** Deaf South Africans, with an estimated **4–5 million** more relying on non-signed communication.
- **~20%** of South Africans live with some degree of hearing loss (mild to total).
- Below 1kHz, transcranial attenuation is close to **0dB** — sound crosses the skull almost losslessly, which is exactly why direction can't live in a bone-conduction channel and has to live in a separate tactile one.

Sources: WHO *World Report on Hearing* (2021); South African National Council for Persons with Disabilities; Africa Check literature review. Every figure is stated the way it holds up under scrutiny — not the way it sounds most dramatic (always "any degree of hearing loss," never framed as severe or permanent).

## How it works

VibraSafe runs **two physically separate channels**, each doing only what it's actually good at — this separation is the core design constraint of the whole project, enforced in both the hardware and the software state model:

| Channel | Carries | Mechanism |
|---|---|---|
| **Tactile** | Direction | 4× piezo actuators per cuff (front, crown, rear, lobe), each ear firing independently with no cross-talk |
| **Bone conduction** | Content (audio) | A 12mm transducer drives the mastoid process directly, bypassing the eardrum and ossicular chain (malleus, incus, stapes) entirely — the same route skull-anchored hearing aids have used for decades |

Two MEMS microphones, 37mm apart, give a time-of-arrival difference the companion app resolves into a bearing, which is then mapped to whichever tactile actuator sits closest to that direction. A **fail-safe emergency SOS**: one press pulses both cuffs red and alerts the companion app with GPS and trusted contacts — backed by a physical, zero-software safety kit (charging cable, a visual manual, and a notepad and pen for face-to-face contact with first responders) for when the battery doesn't cooperate.

## Repository structure

```
VibraSafe-Project/
├── marketing-website/               # Public science-expo landing page (Next.js)
├── safety-app/                      # Wearable control center — the companion PWA (Next.js)
├── blender/
│   └── guardian_cuff_generator.py   # Procedural Blender script that generates the cuff geometry
├── assets/BustBaseMesh_Fbx/         # Head/bust reference meshes used for fit-checking in Blender
├── renders/                         # Rendered design-variant gallery (turntables, fit checks, finals)
├── Images/                          # Physical prototype / reference photography
└── Phase1_Scientific_Validation_Report.docx   # Formal scientific validation writeup
```

The two Next.js apps are independent projects (their own `package.json`, `node_modules`, and deploy target) — this is a loose monorepo, not a single build.

## The two applications

### 1. Marketing & science platform (`/marketing-website`)

A single-page, Apple-style luxury landing site presenting the science and hardware behind VibraSafe.

| Section | Component | What it shows |
|---|---|---|
| Header | `Nav.tsx` | Transparent fixed header, animated mobile menu |
| Hero | `Hero.tsx` | Full-screen scroll-parallax hero, video/webp background |
| Credibility | `ScienceStats.tsx` | The three headline stats above, cited to WHO 2021 |
| Architecture | `BiomechanicalArchitecture.tsx` | Animated SVG diagram contrasting the bypassed acoustic pathway with the bone-conduction route, plus explainer cards on bone conduction, Wickens' Multiple Resource Theory (why direction belongs on the tactile channel), and BLE latency (Nordic nRF52810, sub-20ms design target) |
| Color Studio | `ColorStudio.tsx` | Interactive 5-finish colorway switcher (`lib/colorways.ts`) |
| Hardware | `FeaturesBento.tsx` | Bento-grid spec cards: piezo tactile nodes, bone-conduction transducer, SOS fail-safe, titanium cuff dimensions |
| Closing CTA | `CtaBand.tsx` | ESKOM Science Expo callout |
| Footer | `Footer.tsx` | Sourcing disclaimer + copyright |

### 2. Companion safety app (`/safety-app`)

🔗 **Live demo:** [vibra-safe-project.vercel.app](https://vibra-safe-project-ci9t.vercel.app)

A progressive web app that acts as the live control center and simulator for the wearable hardware. Routes (App Router):

| Route | Page | What it does |
|---|---|---|
| `/` | Home | Product overview + live 3D model |
| `/dashboard` | Dashboard | Live 3D model (device / worn / parts views), vibration-intensity and bone-conduction-volume sliders, spatial-direction dial, safety-program presets (**Everyday, Street, Focus, Sleep**), Emergency SOS trigger |
| `/simulator` | Simulator | Calibration-gated real Web Audio engine; triggers siren, smoke-alarm, vehicle-approach, and SOS-confirm patterns from a chosen bearing, reflected live on the 3D model and tactile channel |
| `/onboarding` | Onboarding | Profile quick-form + pairing-code input, or a one-click Demo Mode |
| `/safety-network` | Safety Network | Mock street map + shared trusted-contacts list; broadcasts your location during SOS |
| `/responder` | Responder Card | A compact, stranger/first-responder-facing card showing hearing status, preferred communication method, and emergency contacts |

**State architecture:** a single Zustand store (`lib/store.ts`) is the source of truth for connection/battery, fit mode, theme, `tactileIntensity` vs. `bcVolume` (kept deliberately separate, mirroring the hardware constraint above), spatial bearing, SOS, alert log, and safety-program presets. The 3D model, the dashboard sliders, and the simulator all read and write the same store, so nothing drifts out of sync. `lib/simulatorStore.ts` holds only simulator-page UI flow state (calibration gate, active pattern).

**3D & audio:** the device viewer (`react-three-fiber` + `drei`) loads a single merged `.glb` scene (`public/models/vibra-safe.glb` / `vibra-safe-worn.glb`, authored in Blender) and drives node colors/vibration visuals directly from the store. The simulator's `lib/audio/audioEngine.ts` is a singleton Web Audio engine with one fixed safety gain chain, so simulated alerts can never exceed a safe volume regardless of pattern.

## Hardware specification

| Component | Spec |
|---|---|
| Tactile actuators | 4× piezo, 3mm, bezel-set (front, crown, rear, lobe) |
| Bone-conduction transducer | 12mm dia. × 4mm, drives the mastoid |
| Bone-conduction housing | 15 × 22 × 6mm, skin-tone silicone over ABS |
| Microphones | 2× MEMS, 37mm apart (enables bearing estimation) |
| Ear-cuff band | 65.8mm vertical span, fits a ~65mm adult auricle |
| Band section | 3.0 × 1.2mm titanium, houses the flex PCB |
| Actuator pods | 4.8 × 3.8 × 3.2mm |
| Radio | Nordic nRF52810 — BLE 5, 3 × 3mm |
| Battery | 90mAh Li-po, 12 × 20 × 3.6mm |
| Charging | 2-pin magnetic pogo (no exposed port) |
| Linkage | 0.42mm titanium wire (structural + conductive) |
| Internal volume | 1555mm³ (11% headroom over the parts above) |
| Estimated runtime | ~20h mixed use |
| Finishes | Pearl, Blossom, Meadow, Lilac, Powder — cosmetic only; the amber tactile-alert glow and red SOS pulse are fixed on every finish |

## Tech stack

| | marketing-website | safety-app |
|---|---|---|
| Framework | Next.js 14.2 (App Router) | Next.js 16.2 (App Router) |
| UI runtime | React 18.3 | React 19.2 |
| Language | TypeScript 5.9 | TypeScript 6.0.3 *(pinned — TS7 lacks a compiler API Next 16 needs)* |
| Styling | Tailwind CSS v4 (`@tailwindcss/postcss`) | Tailwind CSS v4 (`@tailwindcss/postcss`) |
| Animation | Framer Motion | Framer Motion |
| 3D | — | react-three-fiber, drei, three.js |
| State | — | Zustand |
| Icons | lucide-react | lucide-react |

> The two apps intentionally run on different Next/React majors — install and run them independently (see below) rather than expecting a single shared toolchain.

## Getting started

Each app is a standalone Next.js project. From the repo root:

```bash
# Marketing website — http://localhost:3000
cd marketing-website
npm install
npm run dev

# Safety app — run on a different port if both are up at once
cd safety-app
npm install
npm run dev -- -p 3001
```

Other scripts (identical in both apps): `npm run build`, `npm run start`, `npm run lint` (runs `tsc --noEmit` — there is no ESLint configuration in either project). Neither app requires environment variables to run locally, and neither currently has an automated test suite (no Jest/Vitest/Playwright) — verification today is manual, in-browser.

## Design principles

- **Two channels, never confused.** Direction is tactile-only; content (audio) is bone-conduction-only. This is enforced in the hardware layout and mirrored explicitly in the safety-app's state model.
- **Safety signals are never themeable.** All 5 cosmetic finishes restyle the wire and outer-ear jewelry only — the amber tactile-alert glow and red SOS pulse are fixed on every theme, so no color choice can accidentally hide an emergency signal.
- **Fails soft.** The physical safety kit (manual + notepad + charging cable) works with zero software, for when the battery or the phone doesn't cooperate.
- **Every claim is sourceable.** Hardware specs reference real, purchasable components; population/prevalence figures are cited to WHO and South African census data rather than framed for dramatic effect.

## Scientific validation

See [`Phase1_Scientific_Validation_Report.docx`](./Phase1_Scientific_Validation_Report.docx) for the formal write-up backing the biomechanical and acoustic claims made throughout the marketing site (bone-conduction pathway, transcranial attenuation, Wickens' Multiple Resource Theory rationale for tactile-channel direction).

## Project status

Built as a working expo prototype: both apps are functional and deployed, the 3D hardware model is dimensionally accurate to real, sourceable components (see `blender/guardian_cuff_generator.py`), and the safety-app simulator produces real (calibration-gated) audio rather than mockups. There is no CI pipeline and no automated test coverage yet — treat this as an active prototype, not a hardened production system.

## License

No license has been published for this repository yet. All rights reserved by default — contact the author before reuse or redistribution.

---

*Developed for the ESKOM Science Expo — Biomedical & Medical Sciences.*
