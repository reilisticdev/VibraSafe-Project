import SimulatorView from "@/components/simulator/SimulatorView";
import { Section, SectionHeader } from "@/components/ui/Section";

export default function SimulatorPage() {
  return (
    <main id="main" className="pb-24 md:pb-16">
      <Section id="simulator" className="pt-28 sm:pt-36">
        <SectionHeader
          eyebrow="Simulator"
          title="Feel what an alert feels like"
          lead="Put on headphones, calibrate your volume, then trigger any of the four alert patterns and watch the 3D model respond in real time."
        />
        <div className="mt-8">
          <SimulatorView />
        </div>
      </Section>
    </main>
  );
}
