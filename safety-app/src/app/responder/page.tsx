import ResponderCard from "@/components/responder/ResponderCard";
import { Section, SectionHeader } from "@/components/ui/Section";

export default function ResponderPage() {
  return (
    <main id="main" className="pb-24 md:pb-16">
      <Section id="responder" className="pt-28 sm:pt-36">
        <SectionHeader
          eyebrow="Responder card"
          title="Show this in an emergency"
          lead="A quick, compact statement of your hearing status and how you'd like to be communicated with."
        />
        <div className="mt-8">
          <ResponderCard />
        </div>
      </Section>
    </main>
  );
}
