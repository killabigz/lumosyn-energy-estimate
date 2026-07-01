import { SiteHeader } from "@/components/layout/SiteHeader";
import { EstimateFlow } from "@/components/estimate/EstimateFlow";

export default function EstimatePage() {
  return (
    <>
      <SiteHeader />
      <main>
        <EstimateFlow />
      </main>
    </>
  );
}
