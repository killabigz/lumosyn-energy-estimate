"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  RecommendationResult,
  type EstimateSaveStatus,
} from "@/components/estimate/RecommendationResult";
import { EstimateProgress } from "@/components/ui/EstimateProgress";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { getRecommendation, type Recommendation } from "@/lib/recommendation";

const goals = [
  "Keep my home running during blackouts",
  "Lower my electricity bill",
  "Both",
  "I'm not sure yet",
];

const budgets = [
  "Under JMD $250,000",
  "JMD $250,000-500,000",
  "JMD $500,000-1,000,000",
  "Over JMD $1,000,000",
  "I'm not sure yet",
];

const appliances = [
  "Lights",
  "TV",
  "Refrigerator",
  "Wi-Fi",
  "Fan",
  "Air Conditioner",
  "Water Pump",
  "Freezer",
  "Other",
];

const timelines = [
  "As soon as possible",
  "Within 3 months",
  "Within 6 months",
  "Just exploring",
];

const totalQuestions = 5;

type FieldName = "name" | "whatsapp" | "email";

type EstimateState = {
  goal: string;
  budget: string;
  appliances: string[];
  timeline: string;
  name: string;
  whatsapp: string;
  email: string;
};

type EstimateSubmissionRequest = {
  name: string;
  whatsapp: string;
  email: string;
  goal: string;
  budget: string;
  appliances: string[];
  otherAppliance: string;
  timeline: string;
  recommendationId: string;
  recommendationTitle: string;
  systemSizeLabel: string;
  batteryLabel: string;
  inverterLabel: string;
  solarPanelLabel: string;
};

const initialEstimate: EstimateState = {
  goal: "",
  budget: "",
  appliances: [],
  timeline: "",
  name: "",
  whatsapp: "",
  email: "",
};

function normalizeJamaicanDigits(value: string) {
  const digits = value.replace(/\D/g, "");
  const withoutCountryCode = digits.startsWith("1") ? digits.slice(1) : digits;

  return withoutCountryCode.slice(0, 10);
}

function formatJamaicanNumber(digits: string) {
  if (!digits) {
    return "";
  }

  const areaCode = digits.slice(0, 3);
  const prefix = digits.slice(3, 6);
  const lineNumber = digits.slice(6, 10);

  if (digits.length <= 3) {
    return `+1 (${areaCode}`;
  }

  if (digits.length <= 6) {
    return `+1 (${areaCode}) ${prefix}`;
  }

  return `+1 (${areaCode}) ${prefix}-${lineNumber}`;
}

function isValidJamaicanNumber(digits: string) {
  return digits.length === 10 && digits.startsWith("876");
}

function isSuccessfulSaveResponse(value: unknown) {
  return (
    typeof value === "object" &&
    value !== null &&
    "ok" in value &&
    value.ok === true
  );
}

function ChoiceButton({
  isSelected,
  label,
  onClick,
}: {
  isSelected: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      aria-pressed={isSelected}
      className={`min-h-14 rounded-card border px-4 py-4 text-left text-base font-semibold outline-none transition focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
        isSelected
          ? "border-accent bg-accent-soft text-foreground"
          : "border-border bg-surface text-muted hover:border-accent/60 hover:bg-surface-soft hover:text-foreground"
      }`}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}

function FieldLabel({
  children,
  htmlFor,
  isRequired,
}: {
  children: string;
  htmlFor: string;
  isRequired?: boolean;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-secondary" htmlFor={htmlFor}>
      <span>
        {children}
        {isRequired && <span className="text-accent"> *</span>}
      </span>
    </label>
  );
}

export function EstimateFlow() {
  const router = useRouter();
  const panelRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const isMountedRef = useRef(true);
  const saveAttemptKeyRef = useRef<string | null>(null);
  const saveAttemptTokenRef = useRef(0);
  const [activeQuestion, setActiveQuestion] = useState(1);
  const [estimate, setEstimate] = useState<EstimateState>(initialEstimate);
  const [otherAppliance, setOtherAppliance] = useState("");
  const [recommendation, setRecommendation] = useState<Recommendation | null>(
    null,
  );
  const [saveStatus, setSaveStatus] = useState<EstimateSaveStatus>("idle");
  const formattedWhatsApp = formatJamaicanNumber(estimate.whatsapp);
  const isOtherApplianceSelected = estimate.appliances.includes("Other");
  const isShowingResult = recommendation !== null;

  const canContinue = useMemo(() => {
    if (activeQuestion === 1) {
      return Boolean(estimate.goal);
    }

    if (activeQuestion === 2) {
      return Boolean(estimate.budget);
    }

    if (activeQuestion === 3) {
      return estimate.appliances.length > 0;
    }

    if (activeQuestion === 4) {
      return Boolean(estimate.timeline);
    }

    return Boolean(
      estimate.name.trim() && isValidJamaicanNumber(estimate.whatsapp),
    );
  }, [activeQuestion, estimate]);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      saveAttemptTokenRef.current += 1;
    };
  }, []);

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      const panelTop = panelRef.current
        ? panelRef.current.getBoundingClientRect().top + window.scrollY
        : 0;
      const headerHeight =
        document.querySelector("header")?.getBoundingClientRect().height ?? 0;
      const top = Math.max(0, panelTop - headerHeight - 16);

      window.scrollTo({
        behavior: "smooth",
        top,
      });
      headingRef.current?.focus({ preventScroll: true });
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [activeQuestion, isShowingResult]);

  function updateField(field: FieldName, value: string) {
    setEstimate((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function updateWhatsApp(value: string) {
    setEstimate((current) => ({
      ...current,
      whatsapp: normalizeJamaicanDigits(value),
    }));
  }

  function buildSubmissionPayload(
    nextRecommendation: Recommendation,
  ): EstimateSubmissionRequest {
    return {
      name: estimate.name.trim(),
      whatsapp: estimate.whatsapp,
      email: estimate.email.trim(),
      goal: estimate.goal,
      budget: estimate.budget,
      appliances: estimate.appliances,
      otherAppliance: isOtherApplianceSelected ? otherAppliance.trim() : "",
      timeline: estimate.timeline,
      recommendationId: nextRecommendation.recommendationId,
      recommendationTitle: nextRecommendation.title,
      systemSizeLabel: nextRecommendation.systemSizeLabel,
      batteryLabel: nextRecommendation.batteryLabel,
      inverterLabel: nextRecommendation.inverterLabel,
      solarPanelLabel: nextRecommendation.solarPanelLabel,
    };
  }

  function saveEstimateSubmission(nextRecommendation: Recommendation) {
    const payload = buildSubmissionPayload(nextRecommendation);
    const payloadKey = JSON.stringify(payload);

    if (saveAttemptKeyRef.current === payloadKey) {
      return;
    }

    const attemptToken = saveAttemptTokenRef.current + 1;
    saveAttemptKeyRef.current = payloadKey;
    saveAttemptTokenRef.current = attemptToken;
    setSaveStatus("saving");

    window.requestAnimationFrame(() => {
      if (
        !isMountedRef.current ||
        saveAttemptTokenRef.current !== attemptToken
      ) {
        return;
      }

      fetch("/api/estimate-submissions", {
        body: JSON.stringify(payload),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      })
        .then(async (response) => {
          const responseBody: unknown = await response
            .json()
            .catch(() => null);

          if (!response.ok || !isSuccessfulSaveResponse(responseBody)) {
            throw new Error("Estimate save failed.");
          }

          if (
            isMountedRef.current &&
            saveAttemptTokenRef.current === attemptToken
          ) {
            setSaveStatus("saved");
          }
        })
        .catch(() => {
          if (
            isMountedRef.current &&
            saveAttemptTokenRef.current === attemptToken
          ) {
            setSaveStatus("failed");
          }
        });
    });
  }

  function toggleAppliance(appliance: string) {
    setEstimate((current) => {
      const isSelected = current.appliances.includes(appliance);

      return {
        ...current,
        appliances: isSelected
          ? current.appliances.filter((item) => item !== appliance)
          : [...current.appliances, appliance],
      };
    });
  }

  function chooseSingle(field: "goal" | "budget" | "timeline", value: string) {
    setEstimate((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function goBack() {
    setActiveQuestion((current) => Math.max(1, current - 1));
  }

  function startOver() {
    setEstimate(initialEstimate);
    setOtherAppliance("");
    setRecommendation(null);
    setSaveStatus("idle");
    saveAttemptKeyRef.current = null;
    saveAttemptTokenRef.current += 1;
    setActiveQuestion(1);
  }

  function backHome() {
    router.push("/");
  }

  function continueFlow() {
    if (!canContinue) {
      return;
    }

    if (activeQuestion === totalQuestions) {
      const nextRecommendation = getRecommendation({
        goal: estimate.goal,
        budget: estimate.budget,
        appliances: estimate.appliances,
        timeline: estimate.timeline,
      });

      setRecommendation(nextRecommendation);
      setSaveStatus("idle");
      saveEstimateSubmission(nextRecommendation);
      return;
    }

    setActiveQuestion((current) => Math.min(totalQuestions, current + 1));
  }

  return (
    <section
      aria-labelledby="estimate-heading"
      className="estimate-stage grid min-h-[calc(100dvh-73px)] w-full content-center px-5 py-8 sm:px-6 sm:py-12 lg:px-8"
    >
      <div
        className={`estimate-panel motion-fade-up mx-auto grid w-full gap-8 rounded-card border border-border bg-surface p-5 shadow-card sm:p-8 ${
          isShowingResult ? "max-w-4xl" : "max-w-3xl"
        }`}
        ref={panelRef}
      >
        {recommendation ? (
          <RecommendationResult
            headingRef={headingRef}
            name={estimate.name}
            onBackHome={backHome}
            onStartOver={startOver}
            recommendation={recommendation}
            saveStatus={saveStatus}
          />
        ) : (
          <>
            <EstimateProgress current={activeQuestion} total={totalQuestions} />

            <div className="grid gap-6">
              {activeQuestion === 1 && (
                <div className="grid gap-5">
                  <h1
                    className="text-3xl font-semibold leading-tight tracking-normal text-foreground outline-none sm:text-4xl"
                    id="estimate-heading"
                    ref={headingRef}
                    tabIndex={-1}
                  >
                    What would you like solar to help you with?
                  </h1>
                  <div className="grid gap-3">
                    {goals.map((goal) => (
                      <ChoiceButton
                        isSelected={estimate.goal === goal}
                        key={goal}
                        label={goal}
                        onClick={() => chooseSingle("goal", goal)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {activeQuestion === 2 && (
                <div className="grid gap-5">
                  <h1
                    className="text-3xl font-semibold leading-tight tracking-normal text-foreground outline-none sm:text-4xl"
                    id="estimate-heading"
                    ref={headingRef}
                    tabIndex={-1}
                  >
                    What&apos;s your estimated budget?
                  </h1>
                  <div className="grid gap-3">
                    {budgets.map((budget) => (
                      <ChoiceButton
                        isSelected={estimate.budget === budget}
                        key={budget}
                        label={budget}
                        onClick={() => chooseSingle("budget", budget)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {activeQuestion === 3 && (
                <div className="grid gap-5">
                  <h1
                    className="text-3xl font-semibold leading-tight tracking-normal text-foreground outline-none sm:text-4xl"
                    id="estimate-heading"
                    ref={headingRef}
                    tabIndex={-1}
                  >
                    Which appliances would you like to keep running?
                  </h1>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {appliances.map((appliance) => (
                      <ChoiceButton
                        isSelected={estimate.appliances.includes(appliance)}
                        key={appliance}
                        label={appliance}
                        onClick={() => toggleAppliance(appliance)}
                      />
                    ))}
                  </div>
                  {isOtherApplianceSelected && (
                    <div className="grid gap-2">
                      <FieldLabel htmlFor="other-appliance">
                        Tell us what else you want to run
                      </FieldLabel>
                      <input
                        className="min-h-12 rounded-card border border-border bg-background px-4 py-3 text-base text-foreground outline-none transition placeholder:text-secondary focus:border-accent focus:ring-2 focus:ring-accent/40"
                        id="other-appliance"
                        onChange={(event) =>
                          setOtherAppliance(event.target.value)
                        }
                        type="text"
                        value={otherAppliance}
                      />
                    </div>
                  )}
                </div>
              )}

              {activeQuestion === 4 && (
                <div className="grid gap-5">
                  <h1
                    className="text-3xl font-semibold leading-tight tracking-normal text-foreground outline-none sm:text-4xl"
                    id="estimate-heading"
                    ref={headingRef}
                    tabIndex={-1}
                  >
                    When are you planning to install?
                  </h1>
                  <div className="grid gap-3">
                    {timelines.map((timeline) => (
                      <ChoiceButton
                        isSelected={estimate.timeline === timeline}
                        key={timeline}
                        label={timeline}
                        onClick={() => chooseSingle("timeline", timeline)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {activeQuestion === 5 && (
                <div className="grid gap-5">
                  <h1
                    className="text-3xl font-semibold leading-tight tracking-normal text-foreground outline-none sm:text-4xl"
                    id="estimate-heading"
                    ref={headingRef}
                    tabIndex={-1}
                  >
                    How can we contact you?
                  </h1>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <FieldLabel htmlFor="name" isRequired>
                        What should we call you?
                      </FieldLabel>
                      <input
                        className="min-h-12 rounded-card border border-border bg-background px-4 py-3 text-base text-foreground outline-none transition placeholder:text-secondary focus:border-accent focus:ring-2 focus:ring-accent/40"
                        id="name"
                        onChange={(event) =>
                          updateField("name", event.target.value)
                        }
                        placeholder="Enter your first name"
                        type="text"
                        value={estimate.name}
                      />
                    </div>

                    <div className="grid gap-2">
                      <FieldLabel htmlFor="whatsapp" isRequired>
                        What&apos;s your WhatsApp number?
                      </FieldLabel>
                      <input
                        className="min-h-12 rounded-card border border-border bg-background px-4 py-3 text-base text-foreground outline-none transition placeholder:text-secondary focus:border-accent focus:ring-2 focus:ring-accent/40"
                        id="whatsapp"
                        inputMode="tel"
                        onChange={(event) => updateWhatsApp(event.target.value)}
                        placeholder="Enter your WhatsApp number"
                        type="tel"
                        value={formattedWhatsApp}
                      />
                    </div>

                    <div className="grid gap-2">
                      <FieldLabel htmlFor="email">Email (Optional)</FieldLabel>
                      <input
                        className="min-h-12 rounded-card border border-border bg-background px-4 py-3 text-base text-foreground outline-none transition placeholder:text-secondary focus:border-accent focus:ring-2 focus:ring-accent/40"
                        id="email"
                        inputMode="email"
                        onChange={(event) =>
                          updateField("email", event.target.value)
                        }
                        placeholder="name@example.com"
                        type="text"
                        value={estimate.email}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
              {activeQuestion > 1 && (
                <PrimaryButton
                  className="sm:min-w-32"
                  onClick={goBack}
                  variant="secondary"
                >
                  Back
                </PrimaryButton>
              )}
              <PrimaryButton
                className={
                  activeQuestion === 1
                    ? "sm:ml-auto sm:min-w-40"
                    : "sm:min-w-40"
                }
                disabled={!canContinue}
                onClick={continueFlow}
              >
                Continue
              </PrimaryButton>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
