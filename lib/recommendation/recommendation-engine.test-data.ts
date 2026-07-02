import { recommendationConfig } from "./recommendation-config";
import {
  getRecommendation,
  mapTimelineToJourneyStage,
} from "./recommendation-engine";
import type {
  Recommendation,
  RecommendationAnswers,
  RecommendationConfigEntry,
  RecommendationDataset,
} from "./types";

type RecommendationVerificationCase = {
  name: string;
  answers: RecommendationAnswers;
  expectedRecommendationId: string;
};

type RecommendationVerificationResult = RecommendationVerificationCase & {
  actualRecommendationId: string;
  passed: boolean;
  recommendation: Recommendation;
};

const tieDisclaimer =
  "Remember: This is a starting point designed to help you understand your options. Every home is different, and your equipment may change after discussing your goals.";

const verificationCases: readonly RecommendationVerificationCase[] = [
  {
    name: "blackout plus lights and low budget returns conservative backup",
    answers: {
      goal: "Keep my home running during blackouts",
      budget: "Under JMD $250,000",
      appliances: ["Lights"],
      timeline: "Within 6 months",
    },
    expectedRecommendationId: "blackout-lights-backup-under-250k",
  },
  {
    name: "both plus refrigerator and mid budget returns hybrid-style starter",
    answers: {
      goal: "Both",
      budget: "JMD $500,000-1,000,000",
      appliances: ["Lights", "TV", "Wi-Fi", "Refrigerator"],
      timeline: "Within 3 months",
    },
    expectedRecommendationId: "hybrid-fridge-500k-1m",
  },
  {
    name: "air conditioner does not automatically oversize beyond budget",
    answers: {
      goal: "Both",
      budget: "Under JMD $250,000",
      appliances: ["Lights", "Air Conditioner"],
      timeline: "As soon as possible",
    },
    expectedRecommendationId: "hybrid-ac-budget-limited",
  },
  {
    name: "unsure answers return safe beginner recommendation",
    answers: {
      goal: "I'm not sure yet",
      budget: "I'm not sure yet",
      appliances: ["Fan"],
      timeline: "Just exploring",
    },
    expectedRecommendationId: "safe-beginner-unsure",
  },
  {
    name: "freezer selected returns refrigeration load review",
    answers: {
      goal: "Both",
      budget: "JMD $500,000-1,000,000",
      appliances: ["Freezer"],
      timeline: "Within 3 months",
    },
    expectedRecommendationId: "refrigeration-load-review",
  },
  {
    name: "water pump selected returns pump load review",
    answers: {
      goal: "Both",
      budget: "JMD $500,000-1,000,000",
      appliances: ["Water Pump"],
      timeline: "Within 6 months",
    },
    expectedRecommendationId: "water-pump-500k-1m",
  },
  {
    name: "other selected returns conservative load review",
    answers: {
      goal: "Lower my electricity bill",
      budget: "JMD $250,000-500,000",
      appliances: ["Other"],
      timeline: "Just exploring",
    },
    expectedRecommendationId: "other-load-250k-500k",
  },
  {
    name: "water pump plus low budget stays budget-limited",
    answers: {
      goal: "Keep my home running during blackouts",
      budget: "Under JMD $250,000",
      appliances: ["Water Pump"],
      timeline: "As soon as possible",
    },
    expectedRecommendationId: "water-pump-under-250k",
  },
  {
    name: "freezer plus refrigerator returns refrigeration load review",
    answers: {
      goal: "Keep my home running during blackouts",
      budget: "JMD $500,000-1,000,000",
      appliances: ["Freezer", "Refrigerator"],
      timeline: "Within 6 months",
    },
    expectedRecommendationId: "refrigeration-load-review",
  },
  {
    name: "unknown answers with other still return config recommendation",
    answers: {
      goal: "Unexpected goal",
      budget: "Unexpected budget",
      appliances: ["Other", "Unexpected appliance"],
      timeline: "Unexpected timeline",
    },
    expectedRecommendationId: "other-load-unsure-budget",
  },
];

const tieLowerRecommendation: RecommendationConfigEntry = {
  recommendationId: "tie-lower-conservative",
  title: "Tie lower conservative option",
  systemSizeLabel: "Lower tied starter",
  batteryLabel: "Lower tied battery starting range",
  inverterLabel: "Lower tied inverter starting range",
  solarPanelLabel: "Lower tied panel allowance",
  shortExplanation: "Used only to verify conservative tie-breaking.",
  practicalStartingPoint: "Choose this when match scores are otherwise equal.",
  disclaimer: tieDisclaimer,
  match: {
    goal: "any",
    applianceProfile: "lights_only",
    budget: "under_250k",
  },
  conservativeRank: 1,
};

const tieHigherRecommendation: RecommendationConfigEntry = {
  recommendationId: "tie-higher-less-conservative",
  title: "Tie higher less conservative option",
  systemSizeLabel: "Higher tied starter",
  batteryLabel: "Higher tied battery starting range",
  inverterLabel: "Higher tied inverter starting range",
  solarPanelLabel: "Higher tied panel allowance",
  shortExplanation: "Used only to verify conservative tie-breaking.",
  practicalStartingPoint: "This should lose when match scores are equal.",
  disclaimer: tieDisclaimer,
  match: {
    goal: "blackout_backup",
    applianceProfile: "lights_only",
    budget: "any",
  },
  conservativeRank: 2,
};

const tieBreakerDataset: RecommendationDataset = {
  ...recommendationConfig,
  fallbackRecommendationId: tieLowerRecommendation.recommendationId,
  recommendations: [tieHigherRecommendation, tieLowerRecommendation],
};

export function getRecommendationEngineVerificationExamples() {
  return verificationCases.map((verificationCase) => ({
    ...verificationCase,
    recommendation: getRecommendation(verificationCase.answers),
    journeyStage: mapTimelineToJourneyStage(verificationCase.answers.timeline),
  }));
}

export function runRecommendationEngineVerification() {
  const results: RecommendationVerificationResult[] = verificationCases.map(
    (verificationCase) => {
      const recommendation = getRecommendation(verificationCase.answers);

      return {
        ...verificationCase,
        actualRecommendationId: recommendation.recommendationId,
        passed:
          recommendation.recommendationId ===
          verificationCase.expectedRecommendationId,
        recommendation,
      };
    },
  );
  const timelineSoonRecommendation = getRecommendation({
    goal: "Both",
    budget: "JMD $500,000-1,000,000",
    appliances: ["Lights", "TV", "Wi-Fi", "Refrigerator"],
    timeline: "As soon as possible",
  });
  const timelineExploringRecommendation = getRecommendation({
    goal: "Both",
    budget: "JMD $500,000-1,000,000",
    appliances: ["Lights", "TV", "Wi-Fi", "Refrigerator"],
    timeline: "Just exploring",
  });
  const contactFieldRecommendation = getRecommendation({
    goal: "Both",
    budget: "JMD $500,000-1,000,000",
    appliances: ["Lights", "TV", "Wi-Fi", "Refrigerator"],
    timeline: "As soon as possible",
    name: "Sample Customer",
    phone: "+1 (876) 555-0100",
    email: "sample@example.com",
  } as RecommendationAnswers & {
    name: string;
    phone: string;
    email: string;
  });
  const tieRecommendation = getRecommendation(
    {
      goal: "Keep my home running during blackouts",
      budget: "Under JMD $250,000",
      appliances: ["Lights"],
      timeline: "Within 3 months",
    },
    tieBreakerDataset,
  );
  const timelineIsTechnicalNoOp =
    timelineSoonRecommendation.recommendationId ===
    timelineExploringRecommendation.recommendationId;
  const contactFieldsAreTechnicalNoOp =
    timelineSoonRecommendation.recommendationId ===
    contactFieldRecommendation.recommendationId;
  const tieBreakerChoosesLower =
    tieRecommendation.recommendationId ===
    tieLowerRecommendation.recommendationId;
  const failedResults = results.filter((result) => !result.passed);

  if (
    failedResults.length > 0 ||
    !timelineIsTechnicalNoOp ||
    !contactFieldsAreTechnicalNoOp ||
    !tieBreakerChoosesLower
  ) {
    throw new Error(
      [
        ...failedResults.map(
          (result) =>
            `${result.name}: expected ${result.expectedRecommendationId}, received ${result.actualRecommendationId}`,
        ),
        timelineIsTechnicalNoOp
          ? undefined
          : "timeline no-op check failed: technical recommendation changed",
        contactFieldsAreTechnicalNoOp
          ? undefined
          : "contact no-op check failed: technical recommendation changed",
        tieBreakerChoosesLower
          ? undefined
          : "tie-breaker check failed: lower conservative recommendation did not win",
      ]
        .filter(Boolean)
        .join("\n"),
    );
  }

  return {
    cases: results,
    timelineIsTechnicalNoOp,
    contactFieldsAreTechnicalNoOp,
    tieBreakerChoosesLower,
    journeyStageExamples: {
      asap: mapTimelineToJourneyStage("As soon as possible"),
      within3Months: mapTimelineToJourneyStage("Within 3 months"),
      within6Months: mapTimelineToJourneyStage("Within 6 months"),
      justExploring: mapTimelineToJourneyStage("Just exploring"),
    },
  };
}
