import DashboardView from "@/components/dashboard/DashboardView";
import { Section, SectionHeader } from "@/components/ui/Section";

export default function DashboardPage() {
  return (
    <main id="main" className="pb-24 md:pb-16">
      <Section id="dashboard" className="pt-28 sm:pt-36">
        <SectionHeader
          eyebrow="Dashboard"
          title="Your VibraSafe, right now"
          lead="Battery, active safety program, and the live model - everything here updates in real time as you adjust it."
        />
        <div className="mt-8">
          <DashboardView />
        </div>
      </Section>
    </main>
  );
}
