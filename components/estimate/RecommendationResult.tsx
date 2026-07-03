"use client";

import { useState, type Ref } from "react";
import { ButtonLink } from "@/components/ui/PrimaryButton";
import type { Recommendation } from "@/lib/recommendation";

export type EstimateSaveStatus = "idle" | "saving" | "saved" | "failed";

type RecommendationResultProps = {
  appliances: string[];
  goal: string;
  headingRef?: Ref<HTMLHeadingElement>;
  name: string;
  otherAppliance: string;
  recommendation: Recommendation;
  runtime: string;
  saveStatus: EstimateSaveStatus;
};

function formatAppliances(appliances: string[], otherAppliance: string) {
  return appliances
    .map((appliance) =>
      appliance === "Other" && otherAppliance.trim()
        ? `Other: ${otherAppliance.trim()}`
        : appliance,
    )
    .join(", ");
}

export function RecommendationResult({
  appliances,
  goal,
  headingRef,
  name,
  otherAppliance,
  recommendation,
  runtime,
  saveStatus,
}: RecommendationResultProps) {
  const [isDone, setIsDone] = useState(false);
  const firstName = name.trim();
  const answerDetails = [
    {
      label: "Goal",
      value: goal,
    },
    {
      label: "Appliances",
      value: formatAppliances(appliances, otherAppliance),
    },
    {
      label: "Runtime",
      value: runtime,
    },
  ];
  const startingPointDetails = [
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
    <div className="grid gap-6">
      <div className="grid gap-3">
        <p className="text-sm font-semibold text-accent">
          Recommendation result
        </p>
        <h1
          className="text-3xl font-semibold leading-tight tracking-normal text-foreground outline-none sm:text-4xl"
          id="estimate-heading"
          ref={headingRef}
          tabIndex={-1}
        >
          Hi {firstName}, here&apos;s a practical starting point.
        </h1>
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

      <div className="grid gap-4">
        <section className="grid gap-3">
          <h2 className="text-xl font-semibold text-foreground">
            What you told us
          </h2>
          <dl className="overflow-hidden rounded-card border border-border bg-background/70">
            {answerDetails.map((detail) => (
              <div
                className="grid gap-1 border-b border-border px-4 py-3 last:border-b-0 sm:grid-cols-[8rem_1fr] sm:gap-4"
                key={detail.label}
              >
                <dt className="text-sm font-semibold text-secondary">
                  {detail.label}
                </dt>
                <dd className="text-sm font-semibold leading-6 text-foreground sm:text-base">
                  {detail.value}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="grid gap-3">
          <div>
            <p className="text-sm font-semibold text-secondary">
              Recommended starting point
            </p>
            <h2 className="mt-1 text-2xl font-semibold leading-tight tracking-normal text-foreground">
              {recommendation.title}
            </h2>
          </div>
          <dl className="overflow-hidden rounded-card border border-border bg-background/70">
            {startingPointDetails.map((detail) => (
              <div
                className="grid gap-1 border-b border-border px-4 py-3 last:border-b-0 sm:grid-cols-[8rem_1fr] sm:gap-4"
                key={detail.label}
              >
                <dt className="text-sm font-semibold text-secondary">
                  {detail.label}
                </dt>
                <dd className="text-sm font-semibold leading-6 text-foreground sm:text-base">
                  {detail.value}
                </dd>
              </div>
            ))}
          </dl>
          <p className="text-base leading-7 text-muted">
            {recommendation.shortExplanation}
          </p>
        </section>
      </div>

      <div className="grid gap-4 border-t border-border pt-5">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            📸 Save Your Recommendation
          </h3>
          <p className="mt-1 text-base leading-7 text-muted">
            Take a screenshot so you can refer back to it later.
          </p>
        </div>

        {isDone ? (
          <div
            aria-live="polite"
            className="grid gap-2 rounded-card border border-growth/40 bg-surface-soft p-4"
          >
            <h3 className="text-lg font-semibold text-foreground">
              You&rsquo;re all set. 💚
            </h3>
            <p className="text-base leading-7 text-muted">
              Your recommendation is still here.
            </p>
            <p className="text-base leading-7 text-muted">
              Take a screenshot if you want to keep it for later.
            </p>
            <p className="text-base leading-7 text-muted">
              You can close this page whenever you&rsquo;re ready.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 rounded-card border border-growth/40 bg-surface-soft p-4">
            <div className="grid gap-2">
              <h3 className="text-lg font-semibold text-foreground">
                💚 Thanks for trusting Lumosyn with your first energy plan.
              </h3>
              <p className="text-base leading-7 text-muted">
                We hope this helped you feel a little more confident about your
                next energy step.
              </p>
              <p className="text-base leading-7 text-muted">
                If you&rsquo;re curious why we&rsquo;re building Lumosyn,
                we&rsquo;d love to share our story.
              </p>
            </div>
            <div className="grid gap-3 sm:flex sm:items-center">
              <ButtonLink className="sm:w-fit" href="/why-lumosyn-exists">
                Continue →
              </ButtonLink>
              <button
                className="inline-flex min-h-10 w-fit items-center justify-center rounded-card px-1 text-sm font-semibold text-secondary outline-none transition hover:text-foreground focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                onClick={() => setIsDone(true)}
                type="button"
              >
                No thanks, I&rsquo;m done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
