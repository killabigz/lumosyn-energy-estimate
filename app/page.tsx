import { AboutSection } from "@/components/layout/AboutSection";
import { LandingHero } from "@/components/layout/LandingHero";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { WhyLumosyn } from "@/components/layout/WhyLumosyn";

export default function Home() {
  return (
    <>
      <a
        className="skip-link rounded-card bg-accent px-4 py-3 text-sm font-semibold text-background outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        href="#content"
      >
        Skip to content
      </a>
      <div id="top" />
      <SiteHeader />
      <main id="content">
        <LandingHero />
        <AboutSection />
        <WhyLumosyn />
      </main>
      <SiteFooter />
    </>
  );
}
