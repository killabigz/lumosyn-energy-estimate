import {
  getRecommendation,
  mapTimelineToJourneyStage,
} from "./recommendation-engine";
import type { Recommendation, RecommendationAnswers } from "./types";

type RecommendationVerificationCase = {
  name: string;
  answers: RecommendationAnswers;
  expectedRecommendationId: string;
  expectedTitle: string;
  expectedBatteryText?: string;
  expectedWhyText?: string;
  expectedCautionText?: string;
};

type RecommendationVerificationResult = RecommendationVerificationCase & {
  actualRecommendationId: string;
  actualTitle: string;
  passed: boolean;
  recommendation: Recommendation;
};

const verificationCases: readonly RecommendationVerificationCase[] = [
  {
    name: "small starter loads return a 12V starter range",
    answers: {
      goal: "Keep my home running during blackouts",
      budget: "JMD $250,000-500,000",
      appliances: ["Lights", "TV", "Wi-Fi"],
      runtime: "2-4 hours",
      timeline: "Within 6 months",
    },
    expectedRecommendationId: "module10-12v-starter-backup-range",
    expectedTitle: "12V Starter Backup",
  },
  {
    name: "refrigerator essentials return a 24V home essentials range",
    answers: {
      goal: "Keep my home running during blackouts",
      budget: "JMD $500,000-1,000,000",
      appliances: ["Refrigerator", "TV", "Wi-Fi", "Fan"],
      runtime: "5-8 hours",
      timeline: "Within 3 months",
    },
    expectedRecommendationId: "module10-24v-home-essentials-backup-range",
    expectedTitle: "24V Home Essentials",
  },
  {
    name: "overnight refrigerator essentials keep 24V with longer battery language",
    answers: {
      goal: "Keep my home running during blackouts",
      budget: "JMD $500,000-1,000,000",
      appliances: ["Refrigerator", "Wi-Fi", "Fan"],
      runtime: "Overnight",
      timeline: "As soon as possible",
    },
    expectedRecommendationId: "module10-24v-home-essentials-backup-range",
    expectedTitle: "24V Home Essentials",
    expectedBatteryText: "24V battery bank",
  },
  {
    name: "water pump and freezer return a 48V larger backup range",
    answers: {
      goal: "Both",
      budget: "Over JMD $1,000,000",
      appliances: ["Water Pump", "Freezer"],
      runtime: "5-8 hours",
      timeline: "Within 3 months",
    },
    expectedRecommendationId: "module10-48v-larger-backup-planning-range",
    expectedTitle: "48V Larger Backup Planning",
    expectedCautionText: "Water pump and freezer included",
  },
  {
    name: "AC load returns a 48V larger backup range with AC check language",
    answers: {
      goal: "Keep my home running during blackouts",
      budget: "Over JMD $1,000,000",
      appliances: ["Air Conditioner", "Refrigerator", "Wi-Fi"],
      runtime: "Overnight",
      timeline: "Within 3 months",
    },
    expectedRecommendationId: "module10-48v-larger-backup-planning-range",
    expectedTitle: "48V Larger Backup Planning",
    expectedCautionText: "Air conditioner included",
  },
  {
    name: "other appliance returns custom planning language",
    answers: {
      goal: "Lower my electricity bill",
      budget: "JMD $250,000-500,000",
      appliances: ["Other", "Lights"],
      runtime: "2-4 hours",
      timeline: "Just exploring",
    },
    expectedRecommendationId: "module10-24v-home-essentials-backup-range",
    expectedTitle: "24V Home Essentials",
    expectedCautionText: "Custom appliance included",
  },
];

function casePassed(
  verificationCase: RecommendationVerificationCase,
  recommendation: Recommendation,
) {
  const recommendationMatches =
    recommendation.recommendationId ===
      verificationCase.expectedRecommendationId &&
    recommendation.title === verificationCase.expectedTitle;
  const batteryMatches =
    !verificationCase.expectedBatteryText ||
    recommendation.batteryLabel.includes(verificationCase.expectedBatteryText);
  const whyMatches =
    !verificationCase.expectedWhyText ||
    recommendation.whyThisFits.includes(verificationCase.expectedWhyText);
  const cautionMatches =
    !verificationCase.expectedCautionText ||
    Boolean(
      recommendation.cautionNote?.includes(
        verificationCase.expectedCautionText,
      ),
    );

  return (
    recommendationMatches && batteryMatches && whyMatches && cautionMatches
  );
}

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
        actualTitle: recommendation.title,
        passed: casePassed(verificationCase, recommendation),
        recommendation,
      };
    },
  );
  const timelineSoonRecommendation = getRecommendation({
    goal: "Keep my home running during blackouts",
    budget: "JMD $500,000-1,000,000",
    appliances: ["Refrigerator", "TV", "Wi-Fi", "Fan"],
    runtime: "5-8 hours",
    timeline: "As soon as possible",
  });
  const timelineExploringRecommendation = getRecommendation({
    goal: "Keep my home running during blackouts",
    budget: "JMD $500,000-1,000,000",
    appliances: ["Refrigerator", "TV", "Wi-Fi", "Fan"],
    runtime: "5-8 hours",
    timeline: "Just exploring",
  });
  const contactFieldRecommendation = getRecommendation({
    goal: "Keep my home running during blackouts",
    budget: "JMD $500,000-1,000,000",
    appliances: ["Refrigerator", "TV", "Wi-Fi", "Fan"],
    runtime: "5-8 hours",
    timeline: "As soon as possible",
    name: "Sample Customer",
    phone: "+1 (876) 555-0100",
    email: "sample@example.com",
  } as RecommendationAnswers & {
    name: string;
    phone: string;
    email: string;
  });
  const timelineIsTechnicalNoOp =
    timelineSoonRecommendation.recommendationId ===
    timelineExploringRecommendation.recommendationId;
  const contactFieldsAreTechnicalNoOp =
    timelineSoonRecommendation.recommendationId ===
    contactFieldRecommendation.recommendationId;
  const failedResults = results.filter((result) => !result.passed);

  if (
    failedResults.length > 0 ||
    !timelineIsTechnicalNoOp ||
    !contactFieldsAreTechnicalNoOp
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
      ]
        .filter(Boolean)
        .join("\n"),
    );
  }

  return {
    cases: results,
    timelineIsTechnicalNoOp,
    contactFieldsAreTechnicalNoOp,
    journeyStageExamples: {
      asap: mapTimelineToJourneyStage("As soon as possible"),
      within3Months: mapTimelineToJourneyStage("Within 3 months"),
      within6Months: mapTimelineToJourneyStage("Within 6 months"),
      justExploring: mapTimelineToJourneyStage("Just exploring"),
    },
  };
}
