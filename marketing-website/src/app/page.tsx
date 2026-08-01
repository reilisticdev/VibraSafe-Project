import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import ScienceStats from "@/components/ScienceStats";
import BiomechanicalArchitecture from "@/components/BiomechanicalArchitecture";
import ColorStudio from "@/components/ColorStudio";
import FeaturesBento from "@/components/FeaturesBento";
import CtaBand from "@/components/CtaBand";
import Footer from "@/components/Footer";

export default function HomePage() {
  return (
    <>
      <Nav />
      <main id="main">
        <Hero />
        <ScienceStats />
        <BiomechanicalArchitecture />
        <ColorStudio />
        <FeaturesBento />
        <CtaBand />
      </main>
      <Footer />
    </>
  );
}
