import type { RecommendationDataset } from "./types";

export const recommendationConfig = {
  version: "module-10-v1",
  fallbackRecommendationBandId: "24v_home_essentials",
  answerOptions: {
    goals: [
      {
        id: "blackout_backup",
        labels: ["blackout_backup", "Keep my home running during blackouts"],
      },
      {
        id: "lower_bill",
        labels: ["lower_bill", "Lower my electricity bill"],
      },
      {
        id: "both",
        labels: ["both", "Both"],
      },
      {
        id: "unsure",
        labels: ["unsure", "I'm not sure yet"],
      },
    ],
    budgets: [
      {
        id: "under_250k",
        labels: ["under_250k", "Under JMD $250,000"],
      },
      {
        id: "250k_500k",
        labels: ["250k_500k", "JMD $250,000-500,000"],
      },
      {
        id: "500k_1m",
        labels: ["500k_1m", "JMD $500,000-1,000,000"],
      },
      {
        id: "over_1m",
        labels: ["over_1m", "Over JMD $1,000,000"],
      },
      {
        id: "unsure",
        labels: ["unsure", "I'm not sure yet"],
      },
    ],
    appliances: [
      {
        id: "lights",
        labels: ["lights", "Lights"],
      },
      {
        id: "tv",
        labels: ["tv", "TV"],
      },
      {
        id: "wifi",
        labels: ["wifi", "Wi-Fi", "WiFi"],
      },
      {
        id: "refrigerator",
        labels: ["refrigerator", "Refrigerator"],
      },
      {
        id: "fan",
        labels: ["fan", "Fan"],
      },
      {
        id: "air_conditioner",
        labels: ["air_conditioner", "Air Conditioner", "AC"],
      },
      {
        id: "water_pump",
        labels: ["water_pump", "Water Pump"],
      },
      {
        id: "freezer",
        labels: ["freezer", "Freezer"],
      },
      {
        id: "other",
        labels: ["other", "Other"],
      },
    ],
    runtimes: [
      {
        id: "short_backup",
        labels: ["short_backup", "2-4 hours"],
      },
      {
        id: "medium_backup",
        labels: ["medium_backup", "5-8 hours"],
      },
      {
        id: "longer_backup",
        labels: ["longer_backup", "Overnight"],
      },
      {
        id: "unsure",
        labels: ["unsure"],
      },
    ],
    timelines: [
      {
        id: "asap",
        labels: ["asap", "As soon as possible"],
      },
      {
        id: "within_3_months",
        labels: ["within_3_months", "Within 3 months"],
      },
      {
        id: "within_6_months",
        labels: ["within_6_months", "Within 6 months"],
      },
      {
        id: "just_exploring",
        labels: ["just_exploring", "Just exploring"],
      },
    ],
    unknownGoalId: "unsure",
    unknownBudgetId: "unsure",
    unknownRuntimeId: "unsure",
    unknownTimelineId: "just_exploring",
  },
  applianceLoadGroups: [
    {
      id: "low_basic",
      label: "Low/basic loads",
      appliances: ["lights", "tv", "wifi", "fan"],
    },
    {
      id: "cold_storage",
      label: "Cold storage loads",
      appliances: ["refrigerator", "freezer"],
    },
    {
      id: "heavy_surge",
      label: "Heavy/surge loads",
      appliances: ["air_conditioner", "water_pump"],
    },
    {
      id: "custom_unknown",
      label: "Custom/unknown loads",
      appliances: ["other"],
    },
  ],
  runtimeBands: [
    {
      id: "short_backup",
      label: "short backup",
      labels: ["2-4 hours"],
    },
    {
      id: "medium_backup",
      label: "medium backup",
      labels: ["5-8 hours"],
    },
    {
      id: "longer_backup",
      label: "longer backup",
      labels: ["Overnight"],
    },
    {
      id: "unsure",
      label: "backup runtime to discuss",
      labels: ["Runtime not selected"],
    },
  ],
  budgetBands: [
    {
      id: "under_250k",
      label: "limited starter range",
      planningSignal:
        "The budget points to a limited starter range, so the first plan should stay focused on essentials.",
    },
    {
      id: "250k_500k",
      label: "starter/home essentials range",
      planningSignal:
        "The budget supports a starter or home essentials conversation, depending on the verified appliance loads.",
    },
    {
      id: "500k_1m",
      label: "stronger home essentials range",
      planningSignal:
        "The budget can support stronger home essentials planning, depending on appliance wattage and usage.",
    },
    {
      id: "over_1m",
      label: "larger backup planning range",
      planningSignal:
        "The budget can support larger backup planning, but equipment still depends on verified loads and site conditions.",
    },
    {
      id: "unsure",
      label: "budget to discuss",
      planningSignal:
        "The budget is still open, so this keeps the recommendation practical and easy to adjust.",
    },
  ],
  recommendationBands: [
    {
      id: "12v_starter",
      recommendationId: "module10-12v-starter-backup-range",
      title: "12V starter backup range",
      systemSizeLabel: "12V starter range - good for small essentials",
      inverterLabel: "Approx. 600W-1.5kW pure sine inverter range",
      batteryLabel: "Approx. 1-2 kWh battery reserve",
      solarPanelLabel: "Approx. 400W-800W starter recharge range",
      practicalStartingPoint:
        "Begin with lights, internet, TV, and fan before adding larger appliances.",
      expectedBackupDirection:
        "Designed around your selected runtime, but actual backup time depends on appliance wattage and usage.",
      whyTemplate:
        "This points toward a small essentials setup instead of a refrigerator or pump-ready range.",
    },
    {
      id: "24v_home_essentials",
      recommendationId: "module10-24v-home-essentials-backup-range",
      title: "24V home essentials backup range",
      systemSizeLabel:
        "24V home essentials range - good for refrigerator and small essentials",
      inverterLabel: "Approx. 2kW-3kW pure sine inverter range",
      batteryLabel: "Approx. 3-5 kWh battery reserve",
      solarPanelLabel: "Approx. 800W-1.5kW recharge range",
      practicalStartingPoint:
        "Plan around the refrigerator and smaller daily essentials first.",
      expectedBackupDirection:
        "Designed around your selected runtime, but actual backup time depends on appliance wattage and usage.",
      whyTemplate:
        "This points toward a home essentials backup setup instead of a tiny starter system.",
    },
    {
      id: "48v_larger_backup",
      recommendationId: "module10-48v-larger-backup-planning-range",
      title: "48V larger backup planning range",
      systemSizeLabel:
        "48V larger backup range - good for heavier appliances and longer backup planning",
      inverterLabel: "Approx. 3kW-5kW+ pure sine inverter range",
      batteryLabel: "Approx. 5-10 kWh+ battery reserve",
      solarPanelLabel: "Approx. 1.5kW-3kW+ recharge range",
      practicalStartingPoint:
        "Use this as a cautious planning range for heavier loads before purchase decisions.",
      expectedBackupDirection:
        "Designed around your selected runtime, but actual backup time depends on appliance wattage and startup load.",
      whyTemplate:
        "This points toward a larger backup planning range because heavier appliances need more cautious sizing.",
    },
    {
      id: "custom_appliance",
      recommendationId: "module10-custom-appliance-planning-range",
      title: "Custom appliance planning range",
      systemSizeLabel:
        "Starting direction: 24V or 48V depending on selected appliances, runtime, and budget",
      inverterLabel: "Range depends on the appliance wattage and startup load",
      batteryLabel: "Reserve depends on how long the appliance runs",
      solarPanelLabel: "Recharge range depends on verified load size",
      practicalStartingPoint:
        "Appliance wattage check recommended before purchase.",
      expectedBackupDirection:
        "Designed around your selected runtime, but actual backup time depends on appliance wattage and usage.",
      whyTemplate:
        "Because you added another appliance, Lumosyn would need the wattage or model before sizing the setup. For now, this gives you a cautious planning direction.",
    },
  ],
  timelineStages: [
    {
      timeline: "asap",
      journeyStage: "Ready",
    },
    {
      timeline: "within_3_months",
      journeyStage: "Planning",
    },
    {
      timeline: "within_6_months",
      journeyStage: "Planning",
    },
    {
      timeline: "just_exploring",
      journeyStage: "Exploring",
    },
  ],
} as const satisfies RecommendationDataset;
