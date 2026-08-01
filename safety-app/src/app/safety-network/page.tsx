import SafetyNetworkView from "@/components/safety-network/SafetyNetworkView";
import { Section, SectionHeader } from "@/components/ui/Section";

export default function SafetyNetworkPage() {
  return (
    <main id="main" className="pb-24 md:pb-16">
      <Section id="safety-network" className="pt-28 sm:pt-36">
        <SectionHeader
          eyebrow="Safety network"
          title="Your people, always in reach"
          lead="Trusted contacts see your location during an SOS - not the other way around."
        />
        <div className="mt-8">
          <SafetyNetworkView />
        </div>
      </Section>
    </main>
  );
}
