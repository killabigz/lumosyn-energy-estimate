export type EstimateGoalId =
  | "blackout_backup"
  | "lower_bill"
  | "both"
  | "unsure";

export type EstimateBudgetId =
  | "under_250k"
  | "250k_500k"
  | "500k_1m"
  | "over_1m"
  | "unsure";

export type EstimateApplianceId =
  | "lights"
  | "tv"
  | "wifi"
  | "refrigerator"
  | "fan"
  | "air_conditioner"
  | "water_pump"
  | "freezer"
  | "other";

export type EstimateRuntimeId =
  | "short_backup"
  | "medium_backup"
  | "longer_backup"
  | "unsure";

export type EstimateTimelineId =
  | "asap"
  | "within_3_months"
  | "within_6_months"
  | "just_exploring";

export type JourneyStage = "Ready" | "Planning" | "Exploring";

export type ApplianceLoadGroupId =
  | "low_basic"
  | "cold_storage"
  | "heavy_surge"
  | "custom_unknown";

export type RecommendationBandId =
  | "12v_starter"
  | "24v_home_essentials"
  | "48v_larger_backup";

export type MatchValue<T extends string> = T | "any";

export type AnswerOption<T extends string> = {
  id: T;
  labels: readonly string[];
};

export type ApplianceQuantities = Readonly<Record<string, number>>;

export type NormalizedApplianceQuantities = Readonly<
  Partial<Record<EstimateApplianceId, number>>
>;

export type RecommendationAnswers = {
  goal: string;
  budget: string;
  appliances: readonly string[];
  applianceQuantities?: ApplianceQuantities | null;
  appliance_quantities?: ApplianceQuantities | null;
  runtime?: string;
  timeline?: string;
};

export type NormalizedRecommendationAnswers = {
  goal: EstimateGoalId;
  budget: EstimateBudgetId;
  appliances: readonly EstimateApplianceId[];
  applianceQuantities: NormalizedApplianceQuantities;
  applianceGroups: readonly ApplianceLoadGroupId[];
  runtime: EstimateRuntimeId;
  timeline?: EstimateTimelineId;
};

export type Recommendation = {
  recommendationId: string;
  recommendationTitle: string;
  title: string;
  systemSizeLabel: string;
  batteryLabel: string;
  inverterLabel: string;
  solarPanelLabel: string;
  backupLabel: string;
  whyThisFits: string;
  goodFor: readonly string[];
  cautionNote?: string;
  shortExplanation: string;
  practicalStartingPoint: string;
  disclaimer: string;
};

export type ApplianceLoadGroupConfig = {
  id: ApplianceLoadGroupId;
  label: string;
  appliances: readonly EstimateApplianceId[];
};

export type RuntimeBandConfig = {
  id: EstimateRuntimeId;
  label: string;
  labels: readonly string[];
};

export type BudgetBandConfig = {
  id: EstimateBudgetId;
  label: string;
  planningSignal: string;
};

export type RecommendationBandConfig = {
  id: RecommendationBandId;
  recommendationId: string;
  recommendationTitle: string;
  systemSizeLabel: string;
  inverterLabel: string;
  batteryLabel: string;
  solarPanelLabel: string;
  practicalStartingPoint: string;
  defaultGoodFor: readonly string[];
  whyTemplate: string;
};

export type TimelineStageConfig = {
  timeline: EstimateTimelineId;
  journeyStage: JourneyStage;
};

export type RecommendationDataset = {
  version: string;
  fallbackRecommendationBandId: RecommendationBandId;
  answerOptions: {
    goals: readonly AnswerOption<EstimateGoalId>[];
    budgets: readonly AnswerOption<EstimateBudgetId>[];
    appliances: readonly AnswerOption<EstimateApplianceId>[];
    runtimes: readonly AnswerOption<EstimateRuntimeId>[];
    timelines: readonly AnswerOption<EstimateTimelineId>[];
    unknownGoalId: EstimateGoalId;
    unknownBudgetId: EstimateBudgetId;
    unknownRuntimeId: EstimateRuntimeId;
    unknownTimelineId: EstimateTimelineId;
  };
  applianceLoadGroups: readonly ApplianceLoadGroupConfig[];
  runtimeBands: readonly RuntimeBandConfig[];
  budgetBands: readonly BudgetBandConfig[];
  recommendationBands: readonly RecommendationBandConfig[];
  timelineStages: readonly TimelineStageConfig[];
};
