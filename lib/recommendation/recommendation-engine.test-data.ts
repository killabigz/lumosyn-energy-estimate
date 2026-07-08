import {
  getRecommendation,
  mapTimelineToJourneyStage,
  normalizeApplianceQuantities,
} from "./recommendation-engine";
import type { Recommendation, RecommendationAnswers } from "./types";

type RecommendationVerificationCase = {
  name: string;
  answers: RecommendationAnswers;
  expectedRecommendationId: string;
  expectedTitle: string;
  expectedBatteryText?: string;
  expectedInverterText?: string;
  expectedSolarPanelText?: string;
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
    name: "small starter loads with no quantity payload return a 12V starter range",
    answers: {
      goal: "Keep my home running during blackouts",
      budget: "JMD $250,000-500,000",
      appliances: ["Lights", "TV", "Wi-Fi", "Fan"],
      runtime: "2-4 hours",
      timeline: "Within 6 months",
    },
    expectedRecommendationId: "module10-12v-starter-backup-range",
    expectedTitle: "12V Starter Backup",
  },
  {
    name: "normal refrigerator essentials with fan quantity return a 24V range",
    answers: {
      goal: "Keep my home running during blackouts",
      budget: "JMD $500,000-1,000,000",
      appliances: ["Refrigerator", "Fan", "Wi-Fi"],
      applianceQuantities: {
        Fan: 2,
        Refrigerator: 1,
        "Wi-Fi": 1,
      },
      runtime: "5-8 hours",
      timeline: "Within 3 months",
    },
    expectedRecommendationId: "module10-24v-home-essentials-backup-range",
    expectedTitle: "24V Home Essentials",
    expectedBatteryText: "24V battery bank",
  },
  {
    name: "high quantity low-basic loads move out of the 12V starter range",
    answers: {
      goal: "Keep my home running during blackouts",
      budget: "JMD $250,000-500,000",
      appliances: ["Fan", "TV", "Wi-Fi"],
      applianceQuantities: {
        Fan: 6,
        TV: 1,
        "Wi-Fi": 1,
      },
      runtime: "2-4 hours",
      timeline: "Within 6 months",
    },
    expectedRecommendationId: "module10-24v-home-essentials-backup-range",
    expectedTitle: "24V Home Essentials",
  },
  {
    name: "fridge and freezer quantity moves to 48V planning with caution",
    answers: {
      goal: "Both",
      budget: "JMD $500,000-1,000,000",
      appliances: ["Refrigerator", "Freezer", "Fan"],
      appliance_quantities: {
        Fan: 1,
        Freezer: 1,
        Refrigerator: 1,
      },
      runtime: "5-8 hours",
      timeline: "Within 3 months",
    },
    expectedRecommendationId: "module10-48v-larger-backup-planning-range",
    expectedTitle: "48V Larger Backup Planning",
    expectedWhyText: "multiple cold-storage",
    expectedCautionText: "Multiple cold-storage appliances",
  },
  {
    name: "single AC with refrigerator returns ordinary 48V planning",
    answers: {
      goal: "Keep my home running during blackouts",
      budget: "Over JMD $1,000,000",
      appliances: ["Air Conditioner", "Refrigerator", "Wi-Fi"],
      applianceQuantities: {
        "Air Conditioner": 1,
        Refrigerator: 1,
        "Wi-Fi": 1,
      },
      runtime: "Overnight",
      timeline: "Within 3 months",
    },
    expectedRecommendationId: "module10-48v-larger-backup-planning-range",
    expectedTitle: "48V Larger Backup Planning",
    expectedInverterText: "5kW class",
    expectedCautionText: "Air conditioner included",
  },
  {
    name: "multiple AC units return stronger 48V planning range",
    answers: {
      goal: "Keep my home running during blackouts",
      budget: "Over JMD $1,000,000",
      appliances: ["Air Conditioner", "Refrigerator", "Fan"],
      applianceQuantities: {
        "Air Conditioner": 2,
        Fan: 2,
        Refrigerator: 1,
      },
      runtime: "5-8 hours",
      timeline: "Within 3 months",
    },
    expectedRecommendationId: "module10-48v-larger-backup-planning-range",
    expectedTitle: "48V Larger Backup Planning",
    expectedInverterText: "5kW-8kW planning range",
    expectedSolarPanelText: "8-12+ panels planning range",
    expectedWhyText: "stronger 48V planning",
    expectedCautionText: "Multiple AC units or pumps",
  },
  {
    name: "pump plus cold storage returns 48V planning with motor caution",
    answers: {
      goal: "Both",
      budget: "Over JMD $1,000,000",
      appliances: ["Water Pump", "Refrigerator", "Freezer"],
      applianceQuantities: {
        Freezer: 1,
        Refrigerator: 1,
        "Water Pump": 1,
      },
      runtime: "5-8 hours",
      timeline: "Within 3 months",
    },
    expectedRecommendationId: "module10-48v-larger-backup-planning-range",
    expectedTitle: "48V Larger Backup Planning",
    expectedCautionText: "Multiple cold-storage or motor-based appliances",
  },
  {
    name: "very heavy quantity case returns the 8kW+ planning range",
    answers: {
      goal: "Both",
      budget: "Over JMD $1,000,000",
      appliances: ["Air Conditioner", "Water Pump", "Freezer"],
      applianceQuantities: {
        "Air Conditioner": 2,
        Freezer: 2,
        "Water Pump": 2,
      },
      runtime: "Overnight",
      timeline: "As soon as possible",
    },
    expectedRecommendationId: "module10-48v-larger-backup-planning-range",
    expectedTitle: "48V Larger Backup Planning",
    expectedBatteryText: "Larger 48V battery bank recommended",
    expectedInverterText: "8kW+ planning range",
    expectedSolarPanelText: "10-14+ panels planning range",
    expectedWhyText: "larger 48V planning range",
    expectedCautionText: "larger 48V planning case",
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

function quantityNormalizationPassed() {
  const normalizedQuantities = normalizeApplianceQuantities(
    ["Fan", "TV", "Other", "Lights"],
    {
      "Air Conditioner": 2,
      Fan: 3,
      Lights: 1,
      Other: 12,
      TV: 0,
    },
  );

  return (
    normalizedQuantities.fan === 3 &&
    normalizedQuantities.tv === 1 &&
    normalizedQuantities.other === 10 &&
    normalizedQuantities.lights === 1 &&
    normalizedQuantities.air_conditioner === undefined
  );
}

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
  const inverterMatches =
    !verificationCase.expectedInverterText ||
    recommendation.inverterLabel.includes(
      verificationCase.expectedInverterText,
    );
  const solarPanelMatches =
    !verificationCase.expectedSolarPanelText ||
    recommendation.solarPanelLabel.includes(
      verificationCase.expectedSolarPanelText,
    );
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
    recommendationMatches &&
    batteryMatches &&
    inverterMatches &&
    solarPanelMatches &&
    whyMatches &&
    cautionMatches
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
  const quantityNormalizationIsSafe = quantityNormalizationPassed();
  const failedResults = results.filter((result) => !result.passed);

  if (
    failedResults.length > 0 ||
    !timelineIsTechnicalNoOp ||
    !contactFieldsAreTechnicalNoOp ||
    !quantityNormalizationIsSafe
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
        quantityNormalizationIsSafe
          ? undefined
          : "quantity normalization check failed",
      ]
        .filter(Boolean)
        .join("\n"),
    );
  }

  return {
    cases: results,
    timelineIsTechnicalNoOp,
    contactFieldsAreTechnicalNoOp,
    quantityNormalizationIsSafe,
    journeyStageExamples: {
      asap: mapTimelineToJourneyStage("As soon as possible"),
      within3Months: mapTimelineToJourneyStage("Within 3 months"),
      within6Months: mapTimelineToJourneyStage("Within 6 months"),
      justExploring: mapTimelineToJourneyStage("Just exploring"),
    },
  };
}
