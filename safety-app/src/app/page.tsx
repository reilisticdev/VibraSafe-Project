import Link from "next/link";
import DeviceControls from "@/components/device/DeviceControls";
import DeviceViewerClient from "@/components/device/DeviceViewerClient";
import FitModeToggle from "@/components/device/FitModeToggle";
import ThemePicker from "@/components/customiser/ThemePicker";
import SpecTable from "@/components/device/SpecTable";
import DemoModeButton from "@/components/onboarding/DemoModeButton";
import { Section, SectionHeader } from "@/components/ui/Section";
import { Waves, Volume2, Radar, ShieldCheck, Radio } from "lucide-react";

/* ==================================================================
   HOME
   ------------------------------------------------------------------
   Server Component. All interactivity lives in the child client
   components, so this file stays static and streams fast.
================================================================== */

const CHANNELS = [
  {
    Icon: Waves,
    tone: "text-tactile",
    ring: "border-tactile/30",
    title: "Tactile vibration",
    body: "Actuators on a wire concealed behind the ear press against the cartilage, paired with the jewelry you see on the outer helix. Each cuff acts independently, so left and right stay distinct - which is why this channel carries direction.",
    tag: "Directional",
  },
  {
    Icon: Volume2,
    tone: "text-bone",
    ring: "border-bone/30",
    title: "Bone conduction",
    body: "Audio delivered by driving the mastoid bone behind the ear, from the same module that houses the microphones and processor. Because the signal reaches both cochleae, it carries content - never direction.",
    tag: "Auditory",
  },
];

export default function HomePage() {
  return (
    <>
      <main id="main" className="pb-24 md:pb-0">
        {/* ========================= HERO ========================= */}
        <Section id="top" className="!pb-0 pt-28 sm:pt-36">
          <div className="max-w-3xl">
            <span className="gc-chip">
              <span className="h-2 w-2 rounded-full bg-brand" aria-hidden />
              Vibration-based assistive technology
            </span>

            <h1
              className="mt-6 font-black tracking-tight"
              style={{ fontSize: "var(--text-display)", lineHeight: 1.02 }}
            >
              Safety you can{" "}
              <span className="text-brand">feel</span>,
              <br className="hidden sm:block" /> not just hear.
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
              A fashionable ear cuff that turns the world around you into
              360-degree touch. Paired with an emergency app and a physical
              safety kit that still works when the battery does not.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <DemoModeButton className="gc-btn-primary-glow" />
              <Link href="/onboarding" className="gc-btn gc-btn-ghost">
                Set up my VibraSafe
              </Link>
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <a href="#device" className="gc-btn gc-btn-ghost">
                Explore the device
              </a>
              <a href="#channels" className="gc-btn gc-btn-ghost">
                How it works
              </a>
            </div>
          </div>
        </Section>

        {/* ==================== DEVICE + 3D ==================== */}
        <Section id="device">
          <SectionHeader
            eyebrow="Live dashboard"
            title="See exactly how it fits, and how it responds"
            lead="Every control writes to the live model. Switch to Worn to see the cuff seated on the ear, or Parts to separate the two channels."
          />

          <div className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_1fr]">
            <div className="flex flex-col gap-4">
              <div className="gc-card relative h-[440px] overflow-hidden sm:h-[600px]">
                <DeviceViewerClient />
                <div className="pointer-events-none absolute bottom-4 left-4 rounded-lg border border-line-soft bg-void/70 px-3 py-2 backdrop-blur">
                  <p className="text-[11px] font-semibold text-muted">
                    Drag to rotate &middot; scroll to zoom
                  </p>
                </div>
              </div>
              <FitModeToggle />
            </div>

            <DeviceControls />
          </div>
        </Section>

        {/* ==================== BUILD SPEC ==================== */}
        <Section id="build">
          <SectionHeader
            eyebrow="Feasibility"
            title="Every measurement is a real component"
            lead="The model is not an illustration. It is built to millimetre dimensions taken from parts you can actually buy, and the internal volume was checked against them."
          />
          <div className="mt-8">
            <SpecTable />
          </div>
          <div className="gc-card mt-5 flex items-start gap-4 border-bone/25 p-6">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-surface-2 text-bone">
              <Radio size={20} aria-hidden />
            </span>
            <p className="leading-relaxed text-muted">
              <span className="font-bold text-ink">Why two microphones, 37mm apart.</span>{" "}
              A single microphone cannot tell you where a sound came from. Two,
              separated along the band, give a time-of-arrival difference the
              phone can resolve into a bearing - which is then mapped to
              whichever actuator sits closest to that direction.
            </p>
          </div>
        </Section>

        {/* ==================== CUSTOMISER ==================== */}
        <Section id="customise">
          <SectionHeader
            eyebrow="Make it yours"
            title="Choose a finish. Watch it change."
            lead="The concealed wire and the jewelry take your chosen colours. Pick a finish and the model above updates instantly - every theme is available to everyone."
          />
          <div className="mt-8">
            <ThemePicker />
          </div>
        </Section>

        {/* ==================== TWO CHANNELS ==================== */}
        <Section id="channels">
          <SectionHeader
            eyebrow="The Science"
            title="Two channels that must never be confused"
            lead="This is not a hearing aid, and it does not amplify sound. It runs two physically separate outputs, each doing what it is actually good at."
          />

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {CHANNELS.map(({ Icon, tone, ring, title, body, tag }) => (
              <article key={title} className={`gc-card gc-card-hover border ${ring} p-6`}>
                <div className="flex items-center justify-between">
                  <span className={`grid h-12 w-12 place-items-center rounded-2xl bg-surface-2 ${tone}`}>
                    <Icon size={22} aria-hidden />
                  </span>
                  <span className={`gc-chip ${tone}`}>{tag}</span>
                </div>
                <h3 className="mt-5 text-xl font-bold">{title}</h3>
                <p className="mt-2 leading-relaxed text-muted">{body}</p>
              </article>
            ))}
          </div>

          <div className="gc-card mt-5 flex items-start gap-4 border-safe/25 p-6">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-surface-2 text-safe">
              <ShieldCheck size={20} aria-hidden />
            </span>
            <p className="leading-relaxed text-muted">
              <span className="font-bold text-ink">Why the split matters.</span>{" "}
              Bone conduction crosses the skull with almost no attenuation below
              1&nbsp;kHz, so a single pad stimulates both cochleae and cannot
              encode direction. Assigning direction to the tactile channel
              sidesteps that limit rather than fighting it.
            </p>
          </div>
        </Section>

        {/* ==================== THREE PARTS ==================== */}
        <Section id="system">
          <SectionHeader
            eyebrow="The System"
            title="Three parts, one safety net"
            lead="Hardware to feel it, software to interpret it, and a physical kit for when technology is not an option."
          />

          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {[
              {
                n: "01",
                t: "The ear cuffs",
                d: "A module tucks behind the ear over the mastoid; what shows is sculptural jewelry on the outer helix, in a finish you choose.",
                Icon: Radar,
              },
              {
                n: "02",
                t: "The safety app",
                d: "Classifies environmental sound, maps it to vibration patterns, and handles emergency SOS with GPS and trusted contacts.",
                Icon: Waves,
              },
              {
                n: "03",
                t: "The safety kit",
                d: "Zero software. Charging cable, a highly visual manual, and a notepad and pen for face-to-face contact with first responders.",
                Icon: ShieldCheck,
              },
            ].map(({ n, t, d, Icon }) => (
              <article key={n} className="gc-card gc-card-hover gc-card-glow p-6">
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-extrabold text-line">{n}</span>
                  <Icon size={22} className="text-brand" aria-hidden />
                </div>
                <h3 className="mt-4 text-lg font-bold">{t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{d}</p>
              </article>
            ))}
          </div>
        </Section>

        <footer className="border-t border-line-soft">
          <div className="gc-section !py-8">
            <p className="text-sm text-faint">
              VibraSafe &middot; ESKOM Science Expo &middot; Biomedical and
              Medical Sciences (Audiology)
            </p>
          </div>
        </footer>
      </main>
    </>
  );
}
