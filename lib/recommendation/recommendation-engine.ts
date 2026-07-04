import { recommendationConfig } from "./recommendation-config";
import type {
  AnswerOption,
  ApplianceLoadGroupId,
  BudgetBandConfig,
  EstimateApplianceId,
  EstimateBudgetId,
  EstimateRuntimeId,
  EstimateTimelineId,
  JourneyStage,
  NormalizedRecommendationAnswers,
  Recommendation,
  RecommendationAnswers,
  RecommendationBandConfig,
  RecommendationBandId,
  RecommendationDataset,
  RuntimeBandConfig,
} from "./types";

const practicalEstimateDisclaimer =
  "This is a starting estimate, not a final system design. Final sizing may change after reviewing appliance wattage, usage time, and site conditions.";

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

function classifyApplianceLoadGroups(
  appliances: readonly EstimateApplianceId[],
  dataset: RecommendationDataset,
) {
  const applianceSet = new Set(appliances);

  return dataset.applianceLoadGroups
    .filter((group) =>
      group.appliances.some((appliance) => applianceSet.has(appliance)),
    )
    .map((group) => group.id);
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
    applianceGroups: classifyApplianceLoadGroups(appliances, dataset),
    runtime: normalizeAnswer(
      answers.runtime,
      dataset.answerOptions.runtimes,
      dataset.answerOptions.unknownRuntimeId,
    ),
    timeline: answers.timeline
      ? normalizeAnswer(
          answers.timeline,
          dataset.answerOptions.timelines,
          dataset.answerOptions.unknownTimelineId,
        )
      : undefined,
  };
}

function includesGroup(
  groups: readonly ApplianceLoadGroupId[],
  group: ApplianceLoadGroupId,
) {
  return groups.includes(group);
}

function countAppliances(
  appliances: readonly EstimateApplianceId[],
  matches: readonly EstimateApplianceId[],
) {
  const matchSet = new Set(matches);

  return appliances.filter((appliance) => matchSet.has(appliance)).length;
}

function hasAppliance(
  appliances: readonly EstimateApplianceId[],
  appliance: EstimateApplianceId,
) {
  return appliances.includes(appliance);
}

function isLimitedStarterBudget(budget: EstimateBudgetId) {
  return budget === "under_250k" || budget === "250k_500k";
}

function chooseRecommendationBand(
  answers: NormalizedRecommendationAnswers,
): RecommendationBandId {
  const applianceCount = answers.appliances.length;
  const hasCustomLoad = includesGroup(answers.applianceGroups, "custom_unknown");
  const hasHeavyLoad = includesGroup(answers.applianceGroups, "heavy_surge");
  const hasColdStorage = includesGroup(answers.applianceGroups, "cold_storage");
  const coldStorageCount = countAppliances(answers.appliances, [
    "refrigerator",
    "freezer",
  ]);
  const onlyLowBasicLoads =
    applianceCount > 0 &&
    answers.applianceGroups.length === 1 &&
    includesGroup(answers.applianceGroups, "low_basic");
  const hasFreezer = hasAppliance(answers.appliances, "freezer");
  const longerRuntime = answers.runtime === "longer_backup";

  if (hasHeavyLoad) {
    return "48v_larger_backup";
  }

  if (hasFreezer && longerRuntime) {
    return "48v_larger_backup";
  }

  if (
    coldStorageCount > 1 &&
    longerRuntime &&
    answers.budget === "over_1m"
  ) {
    return "48v_larger_backup";
  }

  if (
    onlyLowBasicLoads &&
    answers.runtime === "short_backup" &&
    isLimitedStarterBudget(answers.budget)
  ) {
    return "12v_starter";
  }

  if (hasColdStorage) {
    return "24v_home_essentials";
  }

  if (hasCustomLoad) {
    return "24v_home_essentials";
  }

  if (onlyLowBasicLoads && answers.runtime === "short_backup") {
    return answers.budget === "over_1m"
      ? "24v_home_essentials"
      : "12v_starter";
  }

  return "24v_home_essentials";
}

function getRecommendationBand(
  bandId: RecommendationBandId,
  dataset: RecommendationDataset,
) {
  const band = dataset.recommendationBands.find(
    (recommendationBand) => recommendationBand.id === bandId,
  );

  if (band) {
    return band;
  }

  const fallbackBand = dataset.recommendationBands.find(
    (recommendationBand) =>
      recommendationBand.id === dataset.fallbackRecommendationBandId,
  );

  if (!fallbackBand) {
    throw new Error(
      `Recommendation config is missing fallback "${dataset.fallbackRecommendationBandId}".`,
    );
  }

  return fallbackBand;
}

function getRuntimeBand(
  runtime: EstimateRuntimeId,
  dataset: RecommendationDataset,
): RuntimeBandConfig {
  const runtimeBand = dataset.runtimeBands.find((band) => band.id === runtime);

  if (!runtimeBand) {
    throw new Error(`Recommendation config is missing runtime "${runtime}".`);
  }

  return runtimeBand;
}

function getBudgetBand(
  budget: EstimateBudgetId,
  dataset: RecommendationDataset,
): BudgetBandConfig {
  const budgetBand = dataset.budgetBands.find((band) => band.id === budget);

  if (!budgetBand) {
    throw new Error(`Recommendation config is missing budget "${budget}".`);
  }

  return budgetBand;
}

function getApplianceLabel(
  appliance: EstimateApplianceId,
  dataset: RecommendationDataset,
) {
  return (
    dataset.answerOptions.appliances.find((option) => option.id === appliance)
      ?.labels[1] ?? appliance
  );
}

function formatList(items: readonly string[]) {
  if (items.length === 0) {
    return "your selected appliances";
  }

  if (items.length === 1) {
    return items[0];
  }

  if (items.length === 2) {
    return `${items[0]} and ${items[1]}`;
  }

  return `${items.slice(0, -1).join(", ")}, and ${items.at(-1)}`;
}

function capitalizeFirst(value: string) {
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}

function buildBackupLabel(runtimeBand: RuntimeBandConfig) {
  return runtimeBand.labels[0] ?? "Based on selected runtime";
}

function buildGoodFor(
  band: RecommendationBandConfig,
  answers: NormalizedRecommendationAnswers,
  dataset: RecommendationDataset,
) {
  const selectedLabels = answers.appliances.map((appliance) =>
    appliance === "other"
      ? "Custom appliance"
      : getApplianceLabel(appliance, dataset),
  );

  return selectedLabels.length > 0 ? selectedLabels : band.defaultGoodFor;
}

function buildCautionNote(appliances: readonly EstimateApplianceId[]) {
  if (hasAppliance(appliances, "other")) {
    return "Custom appliance included. We included your custom appliance in this starting point. Final sizing may change once its wattage is confirmed.";
  }

  const cautionLoads = [
    hasAppliance(appliances, "air_conditioner") ? "air conditioner" : undefined,
    hasAppliance(appliances, "water_pump") ? "water pump" : undefined,
    hasAppliance(appliances, "freezer") ? "freezer" : undefined,
  ].filter(isDefined);

  if (cautionLoads.length > 0) {
    return `${capitalizeFirst(
      formatList(cautionLoads),
    )} included. These loads can need extra starting power, so a final check is still needed before choosing equipment.`;
  }

  return undefined;
}

function buildWhyThisFits(
  band: RecommendationBandConfig,
  answers: NormalizedRecommendationAnswers,
) {
  if (hasAppliance(answers.appliances, "other")) {
    return "This includes your custom appliance, but final sizing may change once its wattage is confirmed.";
  }

  return band.whyTemplate;
}

function buildShortExplanation(
  band: RecommendationBandConfig,
  budgetBand: BudgetBandConfig,
) {
  return `${budgetBand.planningSignal} ${band.practicalStartingPoint}`;
}

export function getRecommendation(
  answers: RecommendationAnswers,
  dataset: RecommendationDataset = recommendationConfig,
): Recommendation {
  const normalizedAnswers = normalizeRecommendationAnswers(answers, dataset);
  const bandId = chooseRecommendationBand(normalizedAnswers);
  const band = getRecommendationBand(bandId, dataset);
  const runtimeBand = getRuntimeBand(normalizedAnswers.runtime, dataset);
  const budgetBand = getBudgetBand(normalizedAnswers.budget, dataset);

  return {
    recommendationId: band.recommendationId,
    recommendationTitle: band.recommendationTitle,
    title: band.recommendationTitle,
    systemSizeLabel: band.systemSizeLabel,
    batteryLabel: band.batteryLabel,
    inverterLabel: band.inverterLabel,
    solarPanelLabel: band.solarPanelLabel,
    backupLabel: buildBackupLabel(runtimeBand),
    whyThisFits: buildWhyThisFits(
      band,
      normalizedAnswers,
    ),
    goodFor: buildGoodFor(band, normalizedAnswers, dataset),
    cautionNote: buildCautionNote(normalizedAnswers.appliances),
    shortExplanation: buildShortExplanation(band, budgetBand),
    practicalStartingPoint: band.practicalStartingPoint,
    disclaimer: practicalEstimateDisclaimer,
  };
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
