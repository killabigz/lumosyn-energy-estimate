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
  | "air_conditioner";

export type EstimateTimelineId =
  | "asap"
  | "within_3_months"
  | "within_6_months"
  | "just_exploring";

export type JourneyStage = "Ready" | "Planning" | "Exploring";

export type ApplianceProfileId =
  | "basic_essentials"
  | "lights_only"
  | "lights_tv_wifi"
  | "lights_tv_wifi_refrigerator"
  | "refrigerator_fan"
  | "air_conditioner_included"
  | "unsure";

export type MatchValue<T extends string> = T | "any";

export type AnswerOption<T extends string> = {
  id: T;
  labels: readonly string[];
};

export type ApplianceProfileConfig = {
  id: ApplianceProfileId;
  requiredAppliances: readonly EstimateApplianceId[];
  allowedAppliances?: readonly EstimateApplianceId[];
  excludedAppliances?: readonly EstimateApplianceId[];
  priority: number;
};

export type RecommendationAnswers = {
  goal: string;
  budget: string;
  appliances: readonly string[];
  timeline?: string;
};

export type NormalizedRecommendationAnswers = {
  goal: EstimateGoalId;
  budget: EstimateBudgetId;
  appliances: readonly EstimateApplianceId[];
  applianceProfile: ApplianceProfileId;
  timeline?: EstimateTimelineId;
};

export type Recommendation = {
  recommendationId: string;
  title: string;
  systemSizeLabel: string;
  batteryLabel: string;
  inverterLabel: string;
  solarPanelLabel: string;
  shortExplanation: string;
  practicalStartingPoint: string;
  disclaimer: string;
};

export type RecommendationMatch = {
  goal: MatchValue<EstimateGoalId>;
  applianceProfile: MatchValue<ApplianceProfileId>;
  budget: MatchValue<EstimateBudgetId>;
};

export type RecommendationConfigEntry = Recommendation & {
  match: RecommendationMatch;
  conservativeRank: number;
};

export type TimelineStageConfig = {
  timeline: EstimateTimelineId;
  journeyStage: JourneyStage;
};

export type RecommendationDataset = {
  version: string;
  fallbackRecommendationId: string;
  fallbackApplianceProfileId: ApplianceProfileId;
  answerOptions: {
    goals: readonly AnswerOption<EstimateGoalId>[];
    budgets: readonly AnswerOption<EstimateBudgetId>[];
    appliances: readonly AnswerOption<EstimateApplianceId>[];
    timelines: readonly AnswerOption<EstimateTimelineId>[];
    unknownGoalId: EstimateGoalId;
    unknownBudgetId: EstimateBudgetId;
    unknownTimelineId: EstimateTimelineId;
  };
  applianceProfiles: readonly ApplianceProfileConfig[];
  timelineStages: readonly TimelineStageConfig[];
  recommendations: readonly RecommendationConfigEntry[];
};
