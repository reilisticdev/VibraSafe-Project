import type { Metadata, Viewport } from "next";
import Navigation from "@/components/shell/Navigation";
import StoreHydration from "@/components/shell/StoreHydration";
import "./globals.css";

export const metadata: Metadata = {
  title: "VibraSafe - Safety & Awareness for the Deaf Community",
  description:
    "A vibration-based assistive system: fashionable ear cuffs delivering 360-degree tactile awareness and bone conduction audio, paired with an emergency safety app and a physical safety kit.",
  keywords: [
    "deaf safety",
    "vibration assistive technology",
    "bone conduction",
    "South African Sign Language",
    "emergency alerts",
  ],
};

/* themeColor belongs in viewport, not metadata, in the App Router. */
export const viewport: Viewport = {
  themeColor: "#07090d",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-ZA" data-scroll-behavior="smooth">
      <body className="bg-void text-ink font-sans antialiased">
        {/* Keyboard users land here first - lets them jump the nav. */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-xl focus:bg-brand focus:px-5 focus:py-3 focus:font-bold focus:text-void"
        >
          Skip to main content
        </a>
        <StoreHydration />
        <Navigation />
        {children}
      </body>
    </html>
  );
}
