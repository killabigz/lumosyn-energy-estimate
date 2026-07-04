"use client";

import { useState, type Ref } from "react";
import {
  ArrowRight,
  Battery,
  Camera,
  CheckCircle2,
  Clock3,
  Heart,
  Sun,
  Zap,
} from "lucide-react";
import { ButtonLink } from "@/components/ui/PrimaryButton";
import type { Recommendation } from "@/lib/recommendation";

export type EstimateSaveStatus = "idle" | "saving" | "saved" | "failed";

type RecommendationResultProps = {
  appliances: string[];
  headingRef?: Ref<HTMLHeadingElement>;
  name: string;
  otherAppliance: string;
  recommendation: Recommendation;
  runtime: string;
  saveStatus: EstimateSaveStatus;
};

type RecommendationCard = {
  icon: typeof Zap;
  label: string;
  value: string;
};

function formatGoodForLabel(appliance: string, otherAppliance: string) {
  return appliance === "Other" && otherAppliance.trim()
    ? otherAppliance.trim()
    : appliance;
}

function buildGoodForList(
  appliances: string[],
  otherAppliance: string,
  fallbackGoodFor: readonly string[],
) {
  const selectedAppliances = appliances.map((appliance) =>
    formatGoodForLabel(appliance, otherAppliance),
  );

  return selectedAppliances.length > 0 ? selectedAppliances : fallbackGoodFor;
}

export function RecommendationResult({
  appliances,
  headingRef,
  name,
  otherAppliance,
  recommendation,
  runtime,
  saveStatus,
}: RecommendationResultProps) {
  const [isDone, setIsDone] = useState(false);
  const firstName = name.trim();
  const goodForList = buildGoodForList(
    appliances,
    otherAppliance,
    recommendation.goodFor,
  );
  const starterCards: RecommendationCard[] = [
    {
      icon: Zap,
      label: "Inverter",
      value: recommendation.inverterLabel,
    },
    {
      icon: Battery,
      label: "Battery",
      value: recommendation.batteryLabel,
    },
    {
      icon: Sun,
      label: "Solar",
      value: recommendation.solarPanelLabel,
    },
    {
      icon: Clock3,
      label: "Backup",
      value: runtime || recommendation.backupLabel,
    },
  ];

  return (
    <div className="grid gap-5">
      <div className="grid gap-2">
        <p className="text-sm font-semibold text-accent">
          Recommendation result
        </p>
        <h1
          className="text-2xl font-semibold leading-tight tracking-normal text-foreground outline-none sm:text-4xl"
          id="estimate-heading"
          ref={headingRef}
          tabIndex={-1}
        >
          Hi {firstName} <span aria-hidden="true">{"\u{1F44B}"}</span>
        </h1>
        <p className="text-lg font-semibold leading-7 text-foreground">
          Here&apos;s your practical starting point.
        </p>
        <h2 className="text-4xl font-semibold leading-tight tracking-normal text-accent sm:text-5xl">
          {recommendation.recommendationTitle}
        </h2>
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

      <div className="grid grid-cols-2 gap-3">
        {starterCards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              className="grid min-h-28 content-between gap-3 rounded-card border border-border bg-background/70 p-4"
              key={card.label}
            >
              <div className="flex items-center gap-2 text-sm font-semibold text-secondary">
                <Icon aria-hidden="true" className="size-4 text-accent" />
                <span>{card.label}</span>
              </div>
              <p className="text-lg font-semibold leading-snug text-foreground">
                {card.value}
              </p>
            </div>
          );
        })}
      </div>

      <section className="grid gap-2">
        <div className="flex items-center gap-2">
          <CheckCircle2 aria-hidden="true" className="size-5 text-accent" />
          <h3 className="text-lg font-semibold text-foreground">
            Why this fits
          </h3>
        </div>
        <p className="text-base leading-7 text-muted">
          {recommendation.whyThisFits}
        </p>
      </section>

      {goodForList.length > 0 && (
        <section className="grid gap-3">
          <h3 className="text-base font-semibold text-foreground">Good for:</h3>
          <ul className="grid grid-cols-2 gap-2">
            {goodForList.map((appliance) => (
              <li
                className="rounded-card border border-border bg-surface-soft px-3 py-2 text-sm font-semibold text-foreground"
                key={appliance}
              >
                {appliance}
              </li>
            ))}
          </ul>
        </section>
      )}

      {recommendation.cautionNote && (
        <p className="rounded-card border border-border bg-background/70 p-3 text-sm leading-6 text-secondary">
          {recommendation.cautionNote}
        </p>
      )}

      <div className="grid gap-2 border-t border-border pt-4">
        <div className="flex items-center gap-2">
          <Camera aria-hidden="true" className="size-5 text-accent" />
          <h3 className="text-lg font-semibold text-foreground">
            Save this recommendation
          </h3>
        </div>
        <p className="text-base leading-7 text-muted">
          Take a screenshot so you can refer back to it later.
        </p>
      </div>

      {isDone ? (
        <div
          aria-live="polite"
          className="grid gap-2 rounded-card border border-growth/40 bg-surface-soft p-4"
        >
          <div className="flex items-center gap-2">
            <Heart aria-hidden="true" className="size-5 text-accent" />
            <h3 className="text-lg font-semibold text-foreground">
              You&apos;re all set.
            </h3>
          </div>
          <p className="text-base leading-7 text-muted">
            Your recommendation is still here.
          </p>
          <p className="text-base leading-7 text-muted">
            Take a screenshot if you want to keep it for later.
          </p>
          <p className="text-base leading-7 text-muted">
            You can close this page whenever you&apos;re ready.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 rounded-card border border-growth/40 bg-surface-soft p-4">
          <div className="grid gap-2">
            <div className="flex items-center gap-2">
              <Heart aria-hidden="true" className="size-5 text-accent" />
              <h3 className="text-lg font-semibold text-foreground">
                Thanks for trusting Lumosyn.
              </h3>
            </div>
            <p className="text-base leading-7 text-muted">
              We hope this helped you better understand your next energy step.
            </p>
          </div>
          <p className="text-sm leading-6 text-secondary">
            {recommendation.disclaimer}
          </p>
          <div className="grid gap-3 sm:flex sm:items-center sm:justify-end">
            <button
              className="inline-flex min-h-12 w-full items-center justify-center rounded-large border border-border bg-surface px-6 py-3 text-base font-semibold text-foreground outline-none transition hover:border-accent/60 hover:bg-background focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:w-auto"
              onClick={() => setIsDone(true)}
              type="button"
            >
              No thanks, I&apos;m done
            </button>
            <ButtonLink
              className="gap-2 sm:w-fit"
              href="/why-lumosyn-exists"
            >
              Read Our Story
              <ArrowRight aria-hidden="true" className="size-4" />
            </ButtonLink>
          </div>
        </div>
      )}
    </div>
  );
}
