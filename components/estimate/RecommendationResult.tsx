import { Home, RefreshCcw } from "lucide-react";
import type { Ref } from "react";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import type { Recommendation } from "@/lib/recommendation";

export type EstimateSaveStatus = "idle" | "saving" | "saved" | "failed";

type RecommendationResultProps = {
  headingRef?: Ref<HTMLHeadingElement>;
  name: string;
  onBackHome: () => void;
  onStartOver: () => void;
  recommendation: Recommendation;
  saveStatus: EstimateSaveStatus;
};

export function RecommendationResult({
  headingRef,
  name,
  onBackHome,
  onStartOver,
  recommendation,
  saveStatus,
}: RecommendationResultProps) {
  const firstName = name.trim();
  const resultDetails = [
    {
      label: "System size",
      value: recommendation.systemSizeLabel,
    },
    {
      label: "Battery",
      value: recommendation.batteryLabel,
    },
    {
      label: "Inverter",
      value: recommendation.inverterLabel,
    },
    {
      label: "Solar panel",
      value: recommendation.solarPanelLabel,
    },
  ];

  return (
    <div className="grid gap-8">
      <div className="grid gap-4">
        <p className="text-sm font-semibold text-accent">
          Recommendation result
        </p>
        <h1
          className="text-3xl font-semibold leading-tight tracking-normal text-foreground outline-none sm:text-4xl"
          id="estimate-heading"
          ref={headingRef}
          tabIndex={-1}
        >
          Hi {firstName}, here&apos;s a practical starting point for you.
        </h1>
        <p className="max-w-2xl text-base leading-7 text-muted sm:text-lg">
          This recommendation is meant to help you understand your options
          before a deeper conversation about your home.
        </p>
        {saveStatus === "saved" && (
          <p
            aria-live="polite"
            className="text-sm font-semibold text-secondary"
          >
            Estimate saved.
          </p>
        )}
        {saveStatus === "failed" && (
          <p
            aria-live="polite"
            className="text-sm font-semibold text-secondary"
          >
            Your estimate is showing, but we could not save it right now.
          </p>
        )}
      </div>

      <div className="grid gap-5">
        <div>
          <p className="text-sm font-semibold text-secondary">
            Recommendation
          </p>
          <h2 className="mt-2 text-2xl font-semibold leading-tight tracking-normal text-foreground">
            {recommendation.title}
          </h2>
        </div>

        <dl className="overflow-hidden rounded-card border border-border bg-background/70">
          {resultDetails.map((detail) => (
            <div
              className="grid gap-1 border-b border-border p-4 last:border-b-0 sm:grid-cols-[11rem_1fr] sm:gap-4"
              key={detail.label}
            >
              <dt className="text-sm font-semibold text-secondary">
                {detail.label}
              </dt>
              <dd className="text-base font-semibold leading-7 text-foreground">
                {detail.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="grid gap-5 border-t border-border pt-6">
        <div className="grid gap-2">
          <h3 className="text-lg font-semibold text-foreground">
            Why this starting point fits
          </h3>
          <p className="text-base leading-7 text-muted">
            {recommendation.shortExplanation}
          </p>
        </div>

        <div className="grid gap-2">
          <h3 className="text-lg font-semibold text-foreground">
            Practical starting point
          </h3>
          <p className="text-base leading-7 text-muted">
            {recommendation.practicalStartingPoint}
          </p>
        </div>

        <p className="rounded-card border border-accent/30 bg-accent-soft px-4 py-4 text-sm leading-6 text-muted">
          {recommendation.disclaimer}
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <PrimaryButton className="gap-2 sm:min-w-40" onClick={onStartOver}>
          <RefreshCcw aria-hidden="true" size={18} strokeWidth={2.3} />
          Start Over
        </PrimaryButton>
        <PrimaryButton
          className="gap-2 sm:min-w-40"
          onClick={onBackHome}
          variant="secondary"
        >
          <Home aria-hidden="true" size={18} strokeWidth={2.3} />
          Back to Home
        </PrimaryButton>
      </div>
    </div>
  );
}
