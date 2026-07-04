import { LandingHero } from "@/components/layout/LandingHero";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import {
  buildEstimateHrefFromSearchParams,
  type SearchParamsRecord,
} from "@/lib/analytics/utm";

type HomeProps = {
  searchParams?: Promise<SearchParamsRecord>;
};

export default async function Home({ searchParams }: HomeProps) {
  const safeSearchParams = searchParams ? await searchParams : {};
  const estimateHref = buildEstimateHrefFromSearchParams(
    safeSearchParams,
    "/",
  );

  return (
    <div className="flex min-h-dvh flex-col">
      <a
        className="skip-link rounded-card bg-accent px-4 py-3 text-sm font-semibold text-background outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        href="#content"
      >
        Skip to content
      </a>
      <div id="top" />
      <SiteHeader />
      <main className="estimate-stage flex-1" id="content">
        <LandingHero estimateHref={estimateHref} />
      </main>
      <SiteFooter />
    </div>
  );
}
