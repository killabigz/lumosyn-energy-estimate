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
  NormalizedApplianceQuantities,
  NormalizedRecommendationAnswers,
  Recommendation,
  RecommendationAnswers,
  RecommendationBandConfig,
  RecommendationBandId,
  RecommendationDataset,
  RuntimeBandConfig,
} from "./types";

const applianceQuantityMinimum = 1;
const applianceQuantityMaximum = 10;
const lowBasicAppliances: readonly EstimateApplianceId[] = [
  "lights",
  "tv",
  "wifi",
  "fan",
];
const coldStorageAppliances: readonly EstimateApplianceId[] = [
  "refrigerator",
  "freezer",
];
const heavySurgeAppliances: readonly EstimateApplianceId[] = [
  "air_conditioner",
  "water_pump",
];
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

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
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

function clampApplianceQuantity(quantity: number) {
  return Math.min(
    applianceQuantityMaximum,
    Math.max(applianceQuantityMinimum, quantity),
  );
}

function normalizeApplianceQuantity(value: unknown) {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    !Number.isInteger(value) ||
    value < applianceQuantityMinimum
  ) {
    return applianceQuantityMinimum;
  }

  return clampApplianceQuantity(value);
}

function normalizeSelectedApplianceQuantities(
  appliances: readonly EstimateApplianceId[],
  applianceQuantities: Readonly<Record<string, unknown>> | null | undefined,
  dataset: RecommendationDataset,
): NormalizedApplianceQuantities {
  const selectedAppliances = new Set(appliances);
  const rawQuantitiesByAppliance = new Map<EstimateApplianceId, unknown>();

  if (isRecord(applianceQuantities)) {
    for (const [applianceLabel, quantity] of Object.entries(
      applianceQuantities,
    )) {
      const appliance = findAnswerId(
        applianceLabel,
        dataset.answerOptions.appliances,
      );

      if (appliance && selectedAppliances.has(appliance)) {
        rawQuantitiesByAppliance.set(appliance, quantity);
      }
    }
  }

  return appliances.reduce<Partial<Record<EstimateApplianceId, number>>>(
    (quantities, appliance) => {
      quantities[appliance] = normalizeApplianceQuantity(
        rawQuantitiesByAppliance.get(appliance),
      );

      return quantities;
    },
    {},
  );
}

export function normalizeApplianceQuantities(
  appliances: readonly string[],
  applianceQuantities:
    | Readonly<Record<string, unknown>>
    | null
    | undefined,
  dataset: RecommendationDataset = recommendationConfig,
): NormalizedApplianceQuantities {
  return normalizeSelectedApplianceQuantities(
    normalizeAppliances(appliances, dataset),
    applianceQuantities,
    dataset,
  );
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
  const applianceQuantities = normalizeSelectedApplianceQuantities(
    appliances,
    answers.applianceQuantities ?? answers.appliance_quantities,
    dataset,
  );

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
    applianceQuantities,
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

type FortyEightVoltPlanningRange =
  | "ordinary"
  | "higher_quantity"
  | "very_heavy";

type QuantityLoadProfile = {
  airConditionerQuantity: number;
  coldStorageQuantity: number;
  freezerQuantity: number;
  hasHighMixedHouseholdLoad: boolean;
  hasMultipleColdStorage: boolean;
  hasOnlyLowBasicQuantityPressure: boolean;
  hasQuantityPressure: boolean;
  heavySurgeQuantity: number;
  knownQuantity: number;
  lowBasicQuantity: number;
  otherQuantity: number;
  planningRange: FortyEightVoltPlanningRange;
  refrigeratorQuantity: number;
  totalQuantity: number;
  waterPumpQuantity: number;
};

function getApplianceQuantity(
  quantities: NormalizedApplianceQuantities,
  appliance: EstimateApplianceId,
) {
  return quantities[appliance] ?? 0;
}

function sumApplianceQuantities(
  quantities: NormalizedApplianceQuantities,
  matches: readonly EstimateApplianceId[],
) {
  return matches.reduce(
    (total, appliance) => total + getApplianceQuantity(quantities, appliance),
    0,
  );
}

function buildQuantityLoadProfile(
  answers: NormalizedRecommendationAnswers,
): QuantityLoadProfile {
  const lowBasicQuantity = sumApplianceQuantities(
    answers.applianceQuantities,
    lowBasicAppliances,
  );
  const coldStorageQuantity = sumApplianceQuantities(
    answers.applianceQuantities,
    coldStorageAppliances,
  );
  const heavySurgeQuantity = sumApplianceQuantities(
    answers.applianceQuantities,
    heavySurgeAppliances,
  );
  const airConditionerQuantity = getApplianceQuantity(
    answers.applianceQuantities,
    "air_conditioner",
  );
  const waterPumpQuantity = getApplianceQuantity(
    answers.applianceQuantities,
    "water_pump",
  );
  const refrigeratorQuantity = getApplianceQuantity(
    answers.applianceQuantities,
    "refrigerator",
  );
  const freezerQuantity = getApplianceQuantity(
    answers.applianceQuantities,
    "freezer",
  );
  const otherQuantity = getApplianceQuantity(
    answers.applianceQuantities,
    "other",
  );
  const totalQuantity = answers.appliances.reduce(
    (total, appliance) =>
      total + getApplianceQuantity(answers.applianceQuantities, appliance),
    0,
  );
  const knownQuantity = totalQuantity - otherQuantity;
  const coldStorageTypeCount = countAppliances(
    answers.appliances,
    coldStorageAppliances,
  );
  const hasMultipleColdStorage =
    coldStorageTypeCount > 0 && coldStorageQuantity >= 2;
  const hasOnlyLowBasicQuantityPressure =
    answers.applianceGroups.length === 1 &&
    includesGroup(answers.applianceGroups, "low_basic") &&
    lowBasicQuantity >= 6;
  const hasHighMixedHouseholdLoad =
    knownQuantity >= 7 && (coldStorageQuantity > 0 || heavySurgeQuantity > 0);
  const hasHeavyQuantityPressure =
    airConditionerQuantity >= 2 ||
    waterPumpQuantity >= 2 ||
    heavySurgeQuantity >= 2;
  const hasQuantityPressure =
    hasOnlyLowBasicQuantityPressure ||
    hasMultipleColdStorage ||
    hasHighMixedHouseholdLoad ||
    hasHeavyQuantityPressure;
  const isVeryHeavy =
    (airConditionerQuantity >= 2 &&
      waterPumpQuantity >= 2 &&
      freezerQuantity >= 1) ||
    (heavySurgeQuantity >= 4 && coldStorageQuantity >= 2) ||
    (heavySurgeQuantity >= 3 && freezerQuantity >= 2);
  const isHigherQuantity =
    !isVeryHeavy &&
    (airConditionerQuantity >= 2 ||
      waterPumpQuantity >= 2 ||
      (heavySurgeQuantity >= 2 && coldStorageQuantity >= 1) ||
      (heavySurgeQuantity >= 1 && knownQuantity >= 5) ||
      coldStorageQuantity >= 3);

  return {
    airConditionerQuantity,
    coldStorageQuantity,
    freezerQuantity,
    hasHighMixedHouseholdLoad,
    hasMultipleColdStorage,
    hasOnlyLowBasicQuantityPressure,
    hasQuantityPressure,
    heavySurgeQuantity,
    knownQuantity,
    lowBasicQuantity,
    otherQuantity,
    planningRange: isVeryHeavy
      ? "very_heavy"
      : isHigherQuantity
        ? "higher_quantity"
        : "ordinary",
    refrigeratorQuantity,
    totalQuantity,
    waterPumpQuantity,
  };
}

function chooseRecommendationBand(
  answers: NormalizedRecommendationAnswers,
  quantityProfile: QuantityLoadProfile = buildQuantityLoadProfile(answers),
): RecommendationBandId {
  const applianceCount = answers.appliances.length;
  const hasCustomLoad = includesGroup(answers.applianceGroups, "custom_unknown");
  const hasHeavyLoad = includesGroup(answers.applianceGroups, "heavy_surge");
  const hasColdStorage = includesGroup(answers.applianceGroups, "cold_storage");
  const onlyLowBasicLoads =
    applianceCount > 0 &&
    answers.applianceGroups.length === 1 &&
    includesGroup(answers.applianceGroups, "low_basic");
  const hasFreezer = hasAppliance(answers.appliances, "freezer");
  const longerRuntime = answers.runtime === "longer_backup";

  if (hasHeavyLoad) {
    return "48v_larger_backup";
  }

  if (
    quantityProfile.hasMultipleColdStorage ||
    quantityProfile.hasHighMixedHouseholdLoad
  ) {
    return "48v_larger_backup";
  }

  if (hasFreezer && longerRuntime) {
    return "48v_larger_backup";
  }

  if (quantityProfile.coldStorageQuantity > 1 && longerRuntime) {
    return "48v_larger_backup";
  }

  if (
    onlyLowBasicLoads &&
    answers.runtime === "short_backup" &&
    isLimitedStarterBudget(answers.budget) &&
    !quantityProfile.hasOnlyLowBasicQuantityPressure
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
    return answers.budget === "over_1m" ||
      quantityProfile.hasOnlyLowBasicQuantityPressure
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

function buildSizingLabels(
  band: RecommendationBandConfig,
  quantityProfile: QuantityLoadProfile,
) {
  if (band.id !== "48v_larger_backup") {
    return {
      batteryLabel: band.batteryLabel,
      inverterLabel: band.inverterLabel,
      solarPanelLabel: band.solarPanelLabel,
    };
  }

  if (quantityProfile.planningRange === "very_heavy") {
    return {
      batteryLabel: "Larger 48V battery bank recommended",
      inverterLabel: "8kW+ planning range",
      solarPanelLabel: "10-14+ panels planning range",
    };
  }

  if (quantityProfile.planningRange === "higher_quantity") {
    return {
      batteryLabel: "48V battery bank, larger reserve recommended",
      inverterLabel: "5kW-8kW planning range",
      solarPanelLabel: "8-12+ panels planning range",
    };
  }

  return {
    batteryLabel: band.batteryLabel,
    inverterLabel: band.inverterLabel,
    solarPanelLabel: band.solarPanelLabel,
  };
}

function buildCautionNote(
  answers: NormalizedRecommendationAnswers,
  quantityProfile: QuantityLoadProfile,
) {
  const cautionNotes: string[] = [];
  const coldStorageQuantityCaution =
    quantityProfile.heavySurgeQuantity > 0
      ? "Multiple cold-storage or motor-based appliances need stronger planning than a small essentials setup."
      : "Multiple cold-storage appliances need stronger planning than a small essentials setup.";

  if (quantityProfile.planningRange === "very_heavy") {
    cautionNotes.push(
      "Multiple AC units, pumps, or freezer loads can create higher startup demand, so this should be treated as a larger 48V planning case.",
    );
  } else if (quantityProfile.planningRange === "higher_quantity") {
    if (quantityProfile.heavySurgeQuantity >= 2) {
      cautionNotes.push(
        "Multiple AC units or pumps can create higher startup demand, so this should be treated as a larger 48V planning case.",
      );
    } else {
      cautionNotes.push(coldStorageQuantityCaution);
    }
  } else if (quantityProfile.hasMultipleColdStorage) {
    cautionNotes.push(coldStorageQuantityCaution);
  } else if (quantityProfile.hasHighMixedHouseholdLoad) {
    cautionNotes.push(
      "Higher-quantity mixed household loads should be checked carefully before equipment is selected.",
    );
  }

  const cautionLoads = [
    hasAppliance(answers.appliances, "air_conditioner")
      ? "air conditioner"
      : undefined,
    hasAppliance(answers.appliances, "water_pump") ? "water pump" : undefined,
    hasAppliance(answers.appliances, "freezer") ? "freezer" : undefined,
  ].filter(isDefined);

  if (cautionNotes.length === 0 && cautionLoads.length > 0) {
    cautionNotes.push(
      `${capitalizeFirst(
        formatList(cautionLoads),
      )} included, so this should be checked carefully.`,
    );
  }

  if (hasAppliance(answers.appliances, "other")) {
    cautionNotes.push(
      "Custom appliance included; final sizing may change once its wattage is confirmed.",
    );
  }

  if (cautionNotes.length === 0) {
    return undefined;
  }

  return `${cautionNotes.join(
    " ",
  )} This is still a starting estimate. Final equipment should be confirmed before installation.`;
}

function buildWhyThisFits(
  band: RecommendationBandConfig,
  answers: NormalizedRecommendationAnswers,
  quantityProfile: QuantityLoadProfile,
) {
  if (band.id === "48v_larger_backup") {
    if (quantityProfile.planningRange === "very_heavy") {
      return "Because you selected multiple AC, pump, and freezer or cold-storage loads, this needs a larger 48V planning range than a small essentials setup.";
    }

    if (quantityProfile.planningRange === "higher_quantity") {
      return "Because you selected multiple motor-based or cold-storage appliances, this needs stronger 48V planning than a small essentials setup.";
    }

    if (
      quantityProfile.hasMultipleColdStorage ||
      quantityProfile.hasHighMixedHouseholdLoad
    ) {
      return "Because you selected multiple cold-storage or higher-quantity household loads, this should be treated as larger backup planning.";
    }
  }

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
  const quantityProfile = buildQuantityLoadProfile(normalizedAnswers);
  const bandId = chooseRecommendationBand(normalizedAnswers, quantityProfile);
  const band = getRecommendationBand(bandId, dataset);
  const sizingLabels = buildSizingLabels(band, quantityProfile);
  const runtimeBand = getRuntimeBand(normalizedAnswers.runtime, dataset);
  const budgetBand = getBudgetBand(normalizedAnswers.budget, dataset);

  return {
    recommendationId: band.recommendationId,
    recommendationTitle: band.recommendationTitle,
    title: band.recommendationTitle,
    systemSizeLabel: band.systemSizeLabel,
    batteryLabel: sizingLabels.batteryLabel,
    inverterLabel: sizingLabels.inverterLabel,
    solarPanelLabel: sizingLabels.solarPanelLabel,
    backupLabel: buildBackupLabel(runtimeBand),
    whyThisFits: buildWhyThisFits(
      band,
      normalizedAnswers,
      quantityProfile,
    ),
    goodFor: buildGoodFor(band, normalizedAnswers, dataset),
    cautionNote: buildCautionNote(normalizedAnswers, quantityProfile),
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
