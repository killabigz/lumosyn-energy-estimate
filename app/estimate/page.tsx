import { SiteHeader } from "@/components/layout/SiteHeader";
import { EstimateFlow } from "@/components/estimate/EstimateFlow";
import {
  buildLandingPagePath,
  getLandingPageFromSearchParams,
  parseTrackingSearchParams,
  type SearchParamsRecord,
} from "@/lib/analytics/utm";

type EstimatePageProps = {
  searchParams?: Promise<SearchParamsRecord>;
};

export default async function EstimatePage({ searchParams }: EstimatePageProps) {
  const safeSearchParams = searchParams ? await searchParams : {};
  const trackingContext = parseTrackingSearchParams(safeSearchParams);
  const landingPage =
    getLandingPageFromSearchParams(safeSearchParams) ??
    buildLandingPagePath("/estimate", safeSearchParams);

  return (
    <>
      <SiteHeader />
      <main>
        <EstimateFlow
          initialTrackingContext={{
            ...trackingContext,
            landing_page: landingPage,
          }}
        />
      </main>
    </>
  );
}
