import { recommendationConfig } from "./recommendation-config";
import type {
  AnswerOption,
  ApplianceProfileConfig,
  ApplianceProfileId,
  EstimateApplianceId,
  EstimateBudgetId,
  EstimateGoalId,
  EstimateTimelineId,
  JourneyStage,
  MatchValue,
  NormalizedRecommendationAnswers,
  Recommendation,
  RecommendationAnswers,
  RecommendationConfigEntry,
  RecommendationDataset,
  RecommendationMatch,
} from "./types";

type MatchScore = {
  recommendation: RecommendationConfigEntry;
  exactMatchCount: number;
  wildcardCount: number;
  configIndex: number;
};

function normalizeLabel(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function findAnswerId<T extends string>(
  value: string | undefined,
  options: readonly AnswerOption<T>[],
) {
  if (!value) {
    return undefined;
  }

  const normalizedValue = normalizeLabel(value);

  return options.find((option) => {
    if (normalizeLabel(option.id) === normalizedValue) {
      return true;
    }

    return option.labels.some(
      (label) => normalizeLabel(label) === normalizedValue,
    );
  })?.id;
}

function normalizeAnswer<T extends string>(
  value: string | undefined,
  options: readonly AnswerOption<T>[],
  fallbackId: T,
) {
  return findAnswerId(value, options) ?? fallbackId;
}

function isDefined<T>(value: T | undefined): value is T {
  return value !== undefined;
}

function normalizeAppliances(
  appliances: readonly string[],
  dataset: RecommendationDataset,
) {
  const normalizedAppliances = appliances
    .map((appliance) =>
      findAnswerId(appliance, dataset.answerOptions.appliances),
    )
    .filter(isDefined);

  return Array.from(new Set(normalizedAppliances));
}

function profileMatches(
  profile: ApplianceProfileConfig,
  appliances: readonly EstimateApplianceId[],
) {
  const applianceSet = new Set(appliances);
  const allowedAppliances = profile.allowedAppliances;
  const hasRequiredAppliances = profile.requiredAppliances.every((appliance) =>
    applianceSet.has(appliance),
  );
  const hasExcludedAppliances = profile.excludedAppliances?.some((appliance) =>
    applianceSet.has(appliance),
  );
  const usesAllowedAppliancesOnly = allowedAppliances
    ? appliances.every((appliance) => allowedAppliances.includes(appliance))
    : true;

  return (
    hasRequiredAppliances &&
    !hasExcludedAppliances &&
    usesAllowedAppliancesOnly
  );
}

function resolveApplianceProfile(
  appliances: readonly EstimateApplianceId[],
  dataset: RecommendationDataset,
) {
  const matchingProfiles = dataset.applianceProfiles.filter((profile) =>
    profileMatches(profile, appliances),
  );

  const bestProfile = [...matchingProfiles].sort((left, right) => {
    const priorityDifference = right.priority - left.priority;

    if (priorityDifference !== 0) {
      return priorityDifference;
    }

    return (
      right.requiredAppliances.length - left.requiredAppliances.length ||
      left.id.localeCompare(right.id)
    );
  })[0];

  return bestProfile?.id ?? dataset.fallbackApplianceProfileId;
}

export function normalizeRecommendationAnswers(
  answers: RecommendationAnswers,
  dataset: RecommendationDataset = recommendationConfig,
): NormalizedRecommendationAnswers {
  const appliances = normalizeAppliances(answers.appliances, dataset);

  return {
    goal: normalizeAnswer(
      answers.goal,
      dataset.answerOptions.goals,
      dataset.answerOptions.unknownGoalId,
    ),
    budget: normalizeAnswer(
      answers.budget,
      dataset.answerOptions.budgets,
      dataset.answerOptions.unknownBudgetId,
    ),
    appliances,
    applianceProfile: resolveApplianceProfile(appliances, dataset),
    timeline: answers.timeline
      ? normalizeAnswer(
          answers.timeline,
          dataset.answerOptions.timelines,
          dataset.answerOptions.unknownTimelineId,
        )
      : undefined,
  };
}

function conditionMatches<T extends string>(condition: MatchValue<T>, value: T) {
  return condition === "any" || condition === value;
}

function recommendationMatches(
  match: RecommendationMatch,
  answers: NormalizedRecommendationAnswers,
) {
  return (
    conditionMatches<EstimateGoalId>(match.goal, answers.goal) &&
    conditionMatches<ApplianceProfileId>(
      match.applianceProfile,
      answers.applianceProfile,
    ) &&
    conditionMatches<EstimateBudgetId>(match.budget, answers.budget)
  );
}

function isExactMatch<T extends string>(condition: MatchValue<T>, value: T) {
  return condition !== "any" && condition === value;
}

function scoreRecommendation(
  recommendation: RecommendationConfigEntry,
  answers: NormalizedRecommendationAnswers,
  configIndex: number,
): MatchScore {
  const exactMatches = [
    isExactMatch<EstimateGoalId>(recommendation.match.goal, answers.goal),
    isExactMatch<ApplianceProfileId>(
      recommendation.match.applianceProfile,
      answers.applianceProfile,
    ),
    isExactMatch<EstimateBudgetId>(recommendation.match.budget, answers.budget),
  ];
  const exactMatchCount = exactMatches.filter(Boolean).length;
  const wildcardCount = [
    recommendation.match.goal,
    recommendation.match.applianceProfile,
    recommendation.match.budget,
  ].filter((condition) => condition === "any").length;

  return {
    recommendation,
    exactMatchCount,
    wildcardCount,
    configIndex,
  };
}

function compareRecommendationScores(left: MatchScore, right: MatchScore) {
  return (
    right.exactMatchCount - left.exactMatchCount ||
    left.wildcardCount - right.wildcardCount ||
    left.recommendation.conservativeRank - right.recommendation.conservativeRank ||
    left.configIndex - right.configIndex
  );
}

function toRecommendation(configEntry: RecommendationConfigEntry): Recommendation {
  return {
    recommendationId: configEntry.recommendationId,
    title: configEntry.title,
    systemSizeLabel: configEntry.systemSizeLabel,
    batteryLabel: configEntry.batteryLabel,
    inverterLabel: configEntry.inverterLabel,
    solarPanelLabel: configEntry.solarPanelLabel,
    shortExplanation: configEntry.shortExplanation,
    practicalStartingPoint: configEntry.practicalStartingPoint,
    disclaimer: configEntry.disclaimer,
  };
}

function getFallbackRecommendation(dataset: RecommendationDataset) {
  const fallbackRecommendation = dataset.recommendations.find(
    (recommendation) =>
      recommendation.recommendationId === dataset.fallbackRecommendationId,
  );

  if (!fallbackRecommendation) {
    throw new Error(
      `Recommendation config is missing fallback "${dataset.fallbackRecommendationId}".`,
    );
  }

  return fallbackRecommendation;
}

export function getRecommendation(
  answers: RecommendationAnswers,
  dataset: RecommendationDataset = recommendationConfig,
): Recommendation {
  const normalizedAnswers = normalizeRecommendationAnswers(answers, dataset);
  const matchingRecommendations = dataset.recommendations
    .map((recommendation, configIndex) => ({
      recommendation,
      configIndex,
    }))
    .filter(({ recommendation }) =>
      recommendationMatches(recommendation.match, normalizedAnswers),
    )
    .map(({ recommendation, configIndex }) =>
      scoreRecommendation(recommendation, normalizedAnswers, configIndex),
    );

  const bestRecommendation =
    [...matchingRecommendations].sort(compareRecommendationScores)[0] ??
    scoreRecommendation(
      getFallbackRecommendation(dataset),
      normalizedAnswers,
      Number.MAX_SAFE_INTEGER,
    );

  return toRecommendation(bestRecommendation.recommendation);
}

export function mapTimelineToJourneyStage(
  timeline: string | undefined,
  dataset: RecommendationDataset = recommendationConfig,
): JourneyStage {
  const normalizedTimeline: EstimateTimelineId = normalizeAnswer(
    timeline,
    dataset.answerOptions.timelines,
    dataset.answerOptions.unknownTimelineId,
  );
  const stage = dataset.timelineStages.find(
    (stageConfig) => stageConfig.timeline === normalizedTimeline,
  );

  if (!stage) {
    throw new Error(
      `Recommendation config is missing journey stage for "${normalizedTimeline}".`,
    );
  }

  return stage.journeyStage;
}
