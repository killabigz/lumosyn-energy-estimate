import { recommendationConfig } from "./recommendation-config";
import type {
  AnswerOption,
  ApplianceLoadGroupId,
  BudgetBandConfig,
  EstimateApplianceId,
  EstimateBudgetId,
  EstimateGoalId,
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
  "This is a practical starting estimate. The setup may change after checking appliance wattage, startup load, roof space, and installation conditions.";

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

  if (hasCustomLoad) {
    return "custom_appliance";
  }

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

function buildApplianceSummary(
  appliances: readonly EstimateApplianceId[],
  dataset: RecommendationDataset,
) {
  return formatList(
    appliances.map((appliance) => getApplianceLabel(appliance, dataset)),
  );
}

function buildBatteryLabel(
  band: RecommendationBandConfig,
  answers: NormalizedRecommendationAnswers,
) {
  if (band.id === "24v_home_essentials") {
    if (answers.runtime === "longer_backup") {
      return "Approx. 3-5 kWh battery reserve, planning toward the upper end for overnight essentials";
    }

    if (answers.runtime === "medium_backup") {
      return "Approx. 3-5 kWh battery reserve for medium essentials backup";
    }
  }

  if (band.id === "48v_larger_backup" && answers.runtime === "longer_backup") {
    return "Approx. 5-10 kWh+ battery reserve for longer backup planning";
  }

  return band.batteryLabel;
}

function buildExpectedBackupDirection(
  band: RecommendationBandConfig,
  runtimeBand: RuntimeBandConfig,
) {
  if (runtimeBand.id === "unsure") {
    return band.expectedBackupDirection;
  }

  const dependencyText =
    band.id === "48v_larger_backup"
      ? "appliance wattage, startup load, and usage"
      : "appliance wattage and usage";

  return `Designed around a ${runtimeBand.label}, but actual backup time depends on ${dependencyText}.`;
}

function buildGoalPhrase(goal: EstimateGoalId) {
  switch (goal) {
    case "blackout_backup":
      return "keep your home running during blackouts";
    case "lower_bill":
      return "lower your electricity bill";
    case "both":
      return "balance backup and bill reduction";
    case "unsure":
      return "compare practical starter options";
  }
}

function buildHeavyLoadNote(appliances: readonly EstimateApplianceId[]) {
  if (hasAppliance(appliances, "air_conditioner")) {
    return " AC size and startup load should be checked before purchase.";
  }

  if (hasAppliance(appliances, "water_pump")) {
    return " Pump horsepower and startup load should be checked before purchase.";
  }

  if (hasAppliance(appliances, "freezer")) {
    return " Freezer wattage and startup load should be checked before purchase.";
  }

  return "";
}

function buildWhyThisFits(
  band: RecommendationBandConfig,
  answers: NormalizedRecommendationAnswers,
  runtimeBand: RuntimeBandConfig,
  budgetBand: BudgetBandConfig,
  dataset: RecommendationDataset,
) {
  if (band.id === "custom_appliance") {
    return band.whyTemplate;
  }

  const applianceSummary = buildApplianceSummary(answers.appliances, dataset);
  const heavyLoadNote =
    band.id === "48v_larger_backup"
      ? buildHeavyLoadNote(answers.appliances)
      : "";

  return `Because you selected ${applianceSummary} for ${runtimeBand.label} and want to ${buildGoalPhrase(
    answers.goal,
  )}, this uses the ${budgetBand.label} as a planning signal. ${band.whyTemplate}${heavyLoadNote}`;
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
    title: band.title,
    systemSizeLabel: band.systemSizeLabel,
    batteryLabel: buildBatteryLabel(band, normalizedAnswers),
    inverterLabel: band.inverterLabel,
    solarPanelLabel: band.solarPanelLabel,
    expectedBackupDirection: buildExpectedBackupDirection(band, runtimeBand),
    whyThisFits: buildWhyThisFits(
      band,
      normalizedAnswers,
      runtimeBand,
      budgetBand,
      dataset,
    ),
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
