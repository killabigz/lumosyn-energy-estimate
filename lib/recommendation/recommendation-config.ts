import type { RecommendationDataset } from "./types";

const defaultDisclaimer =
  "Remember: This is a starting point designed to help you understand your options. Every home is different, and your equipment may change after discussing your goals.";

export const recommendationConfig = {
  version: "module-5-v1",
  fallbackRecommendationId: "safe-beginner-starting-point",
  fallbackApplianceProfileId: "unsure",
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
    unknownTimelineId: "just_exploring",
  },
  applianceProfiles: [
    {
      id: "water_pump_included",
      requiredAppliances: ["water_pump"],
      priority: 80,
    },
    {
      id: "other_selected",
      requiredAppliances: ["other"],
      priority: 70,
    },
    {
      id: "air_conditioner_included",
      requiredAppliances: ["air_conditioner"],
      priority: 60,
    },
    {
      id: "lights_tv_wifi_refrigerator",
      requiredAppliances: ["lights", "tv", "wifi", "refrigerator"],
      excludedAppliances: ["air_conditioner"],
      priority: 50,
    },
    {
      id: "lights_tv_wifi_refrigerator",
      requiredAppliances: ["lights", "tv", "wifi", "freezer"],
      excludedAppliances: ["air_conditioner"],
      priority: 50,
    },
    {
      id: "refrigeration_load",
      requiredAppliances: ["refrigerator", "freezer"],
      excludedAppliances: ["air_conditioner"],
      priority: 45,
    },
    {
      id: "refrigerator_fan",
      requiredAppliances: ["refrigerator", "fan"],
      excludedAppliances: ["air_conditioner"],
      priority: 40,
    },
    {
      id: "refrigerator_fan",
      requiredAppliances: ["freezer", "fan"],
      excludedAppliances: ["air_conditioner"],
      priority: 40,
    },
    {
      id: "refrigeration_load",
      requiredAppliances: ["refrigerator"],
      excludedAppliances: ["air_conditioner"],
      priority: 35,
    },
    {
      id: "refrigeration_load",
      requiredAppliances: ["freezer"],
      excludedAppliances: ["air_conditioner"],
      priority: 35,
    },
    {
      id: "lights_tv_wifi",
      requiredAppliances: ["lights", "tv", "wifi"],
      allowedAppliances: ["lights", "tv", "wifi"],
      priority: 30,
    },
    {
      id: "lights_only",
      requiredAppliances: ["lights"],
      allowedAppliances: ["lights"],
      priority: 20,
    },
    {
      id: "basic_essentials",
      requiredAppliances: [],
      allowedAppliances: ["lights", "fan"],
      excludedAppliances: ["air_conditioner", "refrigerator", "tv", "wifi"],
      priority: 10,
    },
    {
      id: "unsure",
      requiredAppliances: [],
      priority: 0,
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
  recommendations: [
    {
      recommendationId: "safe-beginner-starting-point",
      title: "Safe beginner starting point",
      systemSizeLabel: "Small essentials-first starter system",
      batteryLabel: "Small battery reserve for lights and phone charging",
      inverterLabel: "Entry-level pure sine wave inverter starting range",
      solarPanelLabel: "Optional starter solar panel allowance",
      shortExplanation:
        "This keeps the recommendation conservative when the answers are unsure or do not match a more specific configuration.",
      practicalStartingPoint:
        "Start by confirming the must-have appliances before discussing larger loads.",
      disclaimer: defaultDisclaimer,
      match: {
        goal: "any",
        applianceProfile: "any",
        budget: "any",
      },
      conservativeRank: 1,
    },
    {
      recommendationId: "safe-beginner-unsure",
      title: "Beginner planning recommendation",
      systemSizeLabel: "Entry-level planning range",
      batteryLabel: "Small battery reserve for basic essentials",
      inverterLabel: "Entry-level inverter starting range",
      solarPanelLabel: "Starter panel allowance after load review",
      shortExplanation:
        "Because the goal or budget is unsure, this starts with a modest essentials package instead of assuming a larger design.",
      practicalStartingPoint:
        "Use this as a conversation starter and narrow the goal before confirming system details.",
      disclaimer: defaultDisclaimer,
      match: {
        goal: "unsure",
        applianceProfile: "any",
        budget: "any",
      },
      conservativeRank: 2,
    },
    {
      recommendationId: "water-pump-under-250k",
      title: "Water pump load review starter",
      systemSizeLabel: "Budget-limited pump-capable starting range",
      batteryLabel: "Battery reserve to be confirmed after pump load review",
      inverterLabel: "Inverter capacity to be confirmed after load review",
      solarPanelLabel: "Panel allowance to be confirmed after pump load review",
      shortExplanation:
        "Water pumps can have startup surge, so final sizing must be confirmed after load review while staying within the selected budget.",
      practicalStartingPoint:
        "Confirm pump horsepower, startup load, and runtime before final sizing.",
      disclaimer: defaultDisclaimer,
      match: {
        goal: "any",
        applianceProfile: "water_pump_included",
        budget: "under_250k",
      },
      conservativeRank: 1,
    },
    {
      recommendationId: "water-pump-250k-500k",
      title: "Water pump load review starter",
      systemSizeLabel: "Pump-capable starting range",
      batteryLabel: "Battery reserve to be confirmed after pump load review",
      inverterLabel: "Inverter capacity to be confirmed after load review",
      solarPanelLabel: "Panel allowance to be confirmed after pump load review",
      shortExplanation:
        "Water pumps can have startup surge, so final sizing must be confirmed after load review before equipment is selected.",
      practicalStartingPoint:
        "Confirm pump horsepower, startup load, and runtime before final sizing.",
      disclaimer: defaultDisclaimer,
      match: {
        goal: "any",
        applianceProfile: "water_pump_included",
        budget: "250k_500k",
      },
      conservativeRank: 1,
    },
    {
      recommendationId: "water-pump-500k-1m",
      title: "Water pump load review starter",
      systemSizeLabel: "Pump-capable starting range",
      batteryLabel: "Battery reserve to be confirmed after pump load review",
      inverterLabel: "Inverter capacity to be confirmed after load review",
      solarPanelLabel: "Panel allowance to be confirmed after pump load review",
      shortExplanation:
        "Water pumps can have startup surge, so final sizing must be confirmed after load review before equipment is selected.",
      practicalStartingPoint:
        "Confirm pump horsepower, startup load, and runtime before final sizing.",
      disclaimer: defaultDisclaimer,
      match: {
        goal: "any",
        applianceProfile: "water_pump_included",
        budget: "500k_1m",
      },
      conservativeRank: 1,
    },
    {
      recommendationId: "water-pump-over-1m",
      title: "Water pump load review starter",
      systemSizeLabel: "Pump-capable planning range",
      batteryLabel: "Battery reserve to be confirmed after pump load review",
      inverterLabel: "Inverter capacity to be confirmed after load review",
      solarPanelLabel: "Panel allowance to be confirmed after pump load review",
      shortExplanation:
        "A higher budget can support a broader review, but the pump load still must be confirmed before final sizing.",
      practicalStartingPoint:
        "Confirm pump horsepower, startup load, and runtime before final sizing.",
      disclaimer: defaultDisclaimer,
      match: {
        goal: "any",
        applianceProfile: "water_pump_included",
        budget: "over_1m",
      },
      conservativeRank: 1,
    },
    {
      recommendationId: "water-pump-unsure-budget",
      title: "Water pump load review starter",
      systemSizeLabel: "Pump-capable planning range",
      batteryLabel: "Battery reserve to be confirmed after pump load review",
      inverterLabel: "Inverter capacity to be confirmed after load review",
      solarPanelLabel: "Panel allowance to be confirmed after pump load review",
      shortExplanation:
        "With a water pump and an unsure budget, the safest starting point is a load review before choosing a system range.",
      practicalStartingPoint:
        "Confirm pump horsepower, startup load, runtime, and budget before final sizing.",
      disclaimer: defaultDisclaimer,
      match: {
        goal: "any",
        applianceProfile: "water_pump_included",
        budget: "unsure",
      },
      conservativeRank: 1,
    },
    {
      recommendationId: "other-load-under-250k",
      title: "Unlisted appliance load review starter",
      systemSizeLabel: "Budget-limited conservative starting point",
      batteryLabel: "Battery reserve to be confirmed after load review",
      inverterLabel: "Inverter capacity to be confirmed after load review",
      solarPanelLabel: "Panel allowance to be confirmed after load review",
      shortExplanation:
        "Because an unlisted appliance was selected, final sizing must be confirmed after load review instead of assuming a larger setup.",
      practicalStartingPoint:
        "Identify the appliance wattage and runtime before final sizing.",
      disclaimer: defaultDisclaimer,
      match: {
        goal: "any",
        applianceProfile: "other_selected",
        budget: "under_250k",
      },
      conservativeRank: 1,
    },
    {
      recommendationId: "other-load-250k-500k",
      title: "Unlisted appliance load review starter",
      systemSizeLabel: "Conservative starting point",
      batteryLabel: "Battery reserve to be confirmed after load review",
      inverterLabel: "Inverter capacity to be confirmed after load review",
      solarPanelLabel: "Panel allowance to be confirmed after load review",
      shortExplanation:
        "Because an unlisted appliance was selected, final sizing must be confirmed after load review instead of assuming a larger setup.",
      practicalStartingPoint:
        "Identify the appliance wattage and runtime before final sizing.",
      disclaimer: defaultDisclaimer,
      match: {
        goal: "any",
        applianceProfile: "other_selected",
        budget: "250k_500k",
      },
      conservativeRank: 1,
    },
    {
      recommendationId: "other-load-500k-1m",
      title: "Unlisted appliance load review starter",
      systemSizeLabel: "Conservative starting point",
      batteryLabel: "Battery reserve to be confirmed after load review",
      inverterLabel: "Inverter capacity to be confirmed after load review",
      solarPanelLabel: "Panel allowance to be confirmed after load review",
      shortExplanation:
        "Because an unlisted appliance was selected, final sizing must be confirmed after load review instead of assuming a larger setup.",
      practicalStartingPoint:
        "Identify the appliance wattage and runtime before final sizing.",
      disclaimer: defaultDisclaimer,
      match: {
        goal: "any",
        applianceProfile: "other_selected",
        budget: "500k_1m",
      },
      conservativeRank: 1,
    },
    {
      recommendationId: "other-load-over-1m",
      title: "Unlisted appliance load review starter",
      systemSizeLabel: "Conservative planning starting range",
      batteryLabel: "Battery reserve to be confirmed after load review",
      inverterLabel: "Inverter capacity to be confirmed after load review",
      solarPanelLabel: "Panel allowance to be confirmed after load review",
      shortExplanation:
        "A higher budget can support a broader review, but the unlisted appliance still must be confirmed before final sizing.",
      practicalStartingPoint:
        "Identify the appliance wattage and runtime before final sizing.",
      disclaimer: defaultDisclaimer,
      match: {
        goal: "any",
        applianceProfile: "other_selected",
        budget: "over_1m",
      },
      conservativeRank: 1,
    },
    {
      recommendationId: "other-load-unsure-budget",
      title: "Unlisted appliance load review starter",
      systemSizeLabel: "Conservative planning starting range",
      batteryLabel: "Battery reserve to be confirmed after load review",
      inverterLabel: "Inverter capacity to be confirmed after load review",
      solarPanelLabel: "Panel allowance to be confirmed after load review",
      shortExplanation:
        "With an unlisted appliance and an unsure budget, the safest starting point is a load review before choosing a system range.",
      practicalStartingPoint:
        "Identify the appliance wattage, runtime, and budget before final sizing.",
      disclaimer: defaultDisclaimer,
      match: {
        goal: "any",
        applianceProfile: "other_selected",
        budget: "unsure",
      },
      conservativeRank: 1,
    },
    {
      recommendationId: "refrigeration-load-under-250k",
      title: "Conservative refrigeration backup starting point",
      systemSizeLabel: "Budget-limited refrigeration backup starting range",
      batteryLabel:
        "Small battery reserve to be confirmed after refrigeration load review",
      inverterLabel: "Inverter capacity to be confirmed after load review",
      solarPanelLabel: "Starter panel allowance after load review",
      shortExplanation:
        "A freezer or refrigerator is a refrigeration load, so this starts conservatively and requires load review before final sizing.",
      practicalStartingPoint:
        "Confirm appliance type, wattage, startup load, and target runtime.",
      disclaimer: defaultDisclaimer,
      match: {
        goal: "any",
        applianceProfile: "refrigeration_load",
        budget: "under_250k",
      },
      conservativeRank: 3,
    },
    {
      recommendationId: "refrigeration-load-review",
      title: "Refrigeration load review starting range",
      systemSizeLabel: "Refrigeration backup starting range",
      batteryLabel:
        "Battery reserve to be confirmed after refrigeration load review",
      inverterLabel: "Inverter capacity to be confirmed after load review",
      solarPanelLabel: "Panel allowance to be confirmed after load review",
      shortExplanation:
        "A freezer or refrigerator is a refrigeration load, so the starting range stays conservative until the actual appliance load is reviewed.",
      practicalStartingPoint:
        "Confirm appliance type, wattage, startup load, and target runtime.",
      disclaimer: defaultDisclaimer,
      match: {
        goal: "any",
        applianceProfile: "refrigeration_load",
        budget: "any",
      },
      conservativeRank: 4,
    },
    {
      recommendationId: "blackout-basic-under-250k",
      title: "Basic blackout backup starter",
      systemSizeLabel: "Essential backup starter",
      batteryLabel: "Small battery reserve for short outages",
      inverterLabel: "Small inverter for light essential loads",
      solarPanelLabel: "Solar panel add-on to be confirmed",
      shortExplanation:
        "The answers point to backup during outages with a limited budget, so the starting point stays focused on essentials.",
      practicalStartingPoint:
        "Prioritize lights and small device charging before adding larger appliances.",
      disclaimer: defaultDisclaimer,
      match: {
        goal: "blackout_backup",
        applianceProfile: "basic_essentials",
        budget: "under_250k",
      },
      conservativeRank: 3,
    },
    {
      recommendationId: "blackout-lights-backup-under-250k",
      title: "Lights-only blackout backup starter",
      systemSizeLabel: "Lights-first backup starter",
      batteryLabel: "Small battery reserve for evening lighting",
      inverterLabel: "Small inverter for lighting circuits",
      solarPanelLabel: "Minimal panel allowance if budget permits",
      shortExplanation:
        "This is a conservative backup recommendation for lights only and a low budget.",
      practicalStartingPoint:
        "Begin with lighting backup and confirm runtime expectations before expanding.",
      disclaimer: defaultDisclaimer,
      match: {
        goal: "blackout_backup",
        applianceProfile: "lights_only",
        budget: "under_250k",
      },
      conservativeRank: 4,
    },
    {
      recommendationId: "blackout-lights-tv-wifi-250k-500k",
      title: "Essentials blackout backup starter",
      systemSizeLabel: "Lights, TV, and Wi-Fi backup starter",
      batteryLabel: "Modest battery reserve for short outages",
      inverterLabel: "Small-to-mid inverter starting range",
      solarPanelLabel: "Small panel allowance for daytime recovery",
      shortExplanation:
        "The requested loads are still essential loads, so this stays smaller than a whole-home recommendation.",
      practicalStartingPoint:
        "Plan around lights, TV, and internet first, then review any additional loads separately.",
      disclaimer: defaultDisclaimer,
      match: {
        goal: "blackout_backup",
        applianceProfile: "lights_tv_wifi",
        budget: "250k_500k",
      },
      conservativeRank: 5,
    },
    {
      recommendationId: "blackout-fridge-500k-1m",
      title: "Refrigeration-capable blackout starter",
      systemSizeLabel: "Essentials plus refrigeration backup range",
      batteryLabel: "Moderate battery reserve for essentials and refrigeration",
      inverterLabel: "Mid-size inverter starting range",
      solarPanelLabel: "Moderate panel allowance for daily recharge",
      shortExplanation:
        "Adding refrigeration raises the starting point, but this remains an essentials backup recommendation.",
      practicalStartingPoint:
        "Confirm refrigerator size and target backup hours before final equipment selection.",
      disclaimer: defaultDisclaimer,
      match: {
        goal: "blackout_backup",
        applianceProfile: "lights_tv_wifi_refrigerator",
        budget: "500k_1m",
      },
      conservativeRank: 6,
    },
    {
      recommendationId: "blackout-refrigerator-fan-500k-1m",
      title: "Refrigeration and fan backup starter",
      systemSizeLabel: "Refrigeration plus fan backup range",
      batteryLabel: "Moderate battery reserve for cooling essentials",
      inverterLabel: "Mid-size inverter starting range",
      solarPanelLabel: "Moderate panel allowance after load review",
      shortExplanation:
        "The selected appliances suggest preserving refrigeration and airflow during outages without moving to a whole-home design.",
      practicalStartingPoint:
        "Review refrigerator startup load and fan runtime before choosing final equipment.",
      disclaimer: defaultDisclaimer,
      match: {
        goal: "blackout_backup",
        applianceProfile: "refrigerator_fan",
        budget: "500k_1m",
      },
      conservativeRank: 7,
    },
    {
      recommendationId: "blackout-ac-budget-limited",
      title: "AC noted, essentials backup first",
      systemSizeLabel: "Budget-limited essentials backup",
      batteryLabel: "Small-to-modest battery reserve for non-AC essentials",
      inverterLabel: "Essentials inverter capacity to be confirmed after load review",
      solarPanelLabel: "Starter panel allowance after load review",
      shortExplanation:
        "Air conditioning is a large load, so the budget-limited starting point keeps the recommendation focused on essentials.",
      practicalStartingPoint:
        "Treat AC as a later sizing discussion and protect the most important smaller loads first.",
      disclaimer: defaultDisclaimer,
      match: {
        goal: "blackout_backup",
        applianceProfile: "air_conditioner_included",
        budget: "under_250k",
      },
      conservativeRank: 8,
    },
    {
      recommendationId: "blackout-ac-over-1m",
      title: "AC-aware blackout planning range",
      systemSizeLabel: "Larger backup planning range",
      batteryLabel: "Larger battery reserve to be engineered",
      inverterLabel: "Inverter capacity to be confirmed after load review",
      solarPanelLabel: "Expanded panel allowance after roof review",
      shortExplanation:
        "Because air conditioning is included and the budget is higher, this flags a larger engineered review while staying non-final.",
      practicalStartingPoint:
        "Confirm AC type, wattage, and runtime expectations before treating AC as a backed-up load.",
      disclaimer: defaultDisclaimer,
      match: {
        goal: "blackout_backup",
        applianceProfile: "air_conditioner_included",
        budget: "over_1m",
      },
      conservativeRank: 15,
    },
    {
      recommendationId: "bill-lights-tv-wifi-250k-500k",
      title: "Small bill-reduction starter",
      systemSizeLabel: "Small solar-first starter range",
      batteryLabel: "Battery optional after usage review",
      inverterLabel: "Entry-level inverter starting range",
      solarPanelLabel: "Small panel allowance for daytime offset",
      shortExplanation:
        "The goal is lowering the bill, so this starts with a modest solar offset instead of backup-heavy sizing.",
      practicalStartingPoint:
        "Compare daytime usage against roof space before adding batteries.",
      disclaimer: defaultDisclaimer,
      match: {
        goal: "lower_bill",
        applianceProfile: "lights_tv_wifi",
        budget: "250k_500k",
      },
      conservativeRank: 5,
    },
    {
      recommendationId: "bill-basic-under-250k",
      title: "Budget bill-reduction planning starter",
      systemSizeLabel: "Very small solar offset starter",
      batteryLabel: "No battery assumed at this starting point",
      inverterLabel: "Entry-level inverter starting range",
      solarPanelLabel: "Minimal panel allowance after bill review",
      shortExplanation:
        "With a bill-reduction goal and a low budget, the conservative starting point is a small solar offset conversation.",
      practicalStartingPoint:
        "Review the electricity bill first, then decide whether a starter panel package makes sense.",
      disclaimer: defaultDisclaimer,
      match: {
        goal: "lower_bill",
        applianceProfile: "any",
        budget: "under_250k",
      },
      conservativeRank: 4,
    },
    {
      recommendationId: "bill-fridge-500k-1m",
      title: "Practical refrigeration bill-reduction starter",
      systemSizeLabel: "Moderate solar offset range",
      batteryLabel: "Battery optional depending on outage needs",
      inverterLabel: "Mid-size inverter starting range",
      solarPanelLabel: "Moderate panel allowance for daily offset",
      shortExplanation:
        "This is a solar-offset starting point for a home that includes refrigeration among its important loads.",
      practicalStartingPoint:
        "Use recent bills and daytime usage to decide the final panel count.",
      disclaimer: defaultDisclaimer,
      match: {
        goal: "lower_bill",
        applianceProfile: "lights_tv_wifi_refrigerator",
        budget: "500k_1m",
      },
      conservativeRank: 7,
    },
    {
      recommendationId: "bill-ac-budget-limited",
      title: "AC noted, bill review first",
      systemSizeLabel: "Budget-limited solar offset starter",
      batteryLabel: "No AC battery backup assumed",
      inverterLabel: "Small-to-mid inverter starting range",
      solarPanelLabel: "Starter panel allowance after bill review",
      shortExplanation:
        "Air conditioning affects energy use, but the budget-limited recommendation starts with bill analysis instead of assuming a large system.",
      practicalStartingPoint:
        "Separate AC energy use from essential loads before choosing a final design.",
      disclaimer: defaultDisclaimer,
      match: {
        goal: "lower_bill",
        applianceProfile: "air_conditioner_included",
        budget: "under_250k",
      },
      conservativeRank: 8,
    },
    {
      recommendationId: "bill-ac-over-1m",
      title: "AC-aware solar offset planning range",
      systemSizeLabel: "Larger solar offset planning range",
      batteryLabel: "Battery optional after bill and outage review",
      inverterLabel: "Inverter capacity to be confirmed after load review",
      solarPanelLabel: "Expanded panel allowance after roof review",
      shortExplanation:
        "With air conditioning and a higher budget, the next step is a careful bill and load review before final sizing.",
      practicalStartingPoint:
        "Confirm AC runtime, electricity bill patterns, and available roof area.",
      disclaimer: defaultDisclaimer,
      match: {
        goal: "lower_bill",
        applianceProfile: "air_conditioner_included",
        budget: "over_1m",
      },
      conservativeRank: 15,
    },
    {
      recommendationId: "hybrid-basic-250k-500k",
      title: "Basic hybrid-style starter",
      systemSizeLabel: "Small hybrid-ready essentials range",
      batteryLabel: "Small battery reserve for essentials",
      inverterLabel: "Entry-level hybrid inverter starting range",
      solarPanelLabel: "Small panel allowance for recharge and offset",
      shortExplanation:
        "The goal is both backup and bill reduction, so this starts with a hybrid-style essentials package.",
      practicalStartingPoint:
        "Keep the first design focused on essentials, then compare battery runtime against budget.",
      disclaimer: defaultDisclaimer,
      match: {
        goal: "both",
        applianceProfile: "lights_tv_wifi",
        budget: "250k_500k",
      },
      conservativeRank: 6,
    },
    {
      recommendationId: "hybrid-fridge-500k-1m",
      title: "Practical refrigeration hybrid starting point",
      systemSizeLabel: "Essentials plus refrigeration hybrid range",
      batteryLabel: "Moderate battery reserve for essentials and refrigeration",
      inverterLabel: "Mid-size hybrid inverter starting range",
      solarPanelLabel: "Moderate panel allowance for recharge and bill offset",
      shortExplanation:
        "The answers point to both outage backup and bill reduction with refrigeration included, so this is a practical hybrid-style starting point.",
      practicalStartingPoint:
        "Confirm refrigerator load, backup hours, and recent electricity usage before final sizing.",
      disclaimer: defaultDisclaimer,
      match: {
        goal: "both",
        applianceProfile: "lights_tv_wifi_refrigerator",
        budget: "500k_1m",
      },
      conservativeRank: 8,
    },
    {
      recommendationId: "hybrid-refrigerator-fan-500k-1m",
      title: "Cooling essentials hybrid starter",
      systemSizeLabel: "Refrigeration plus fan hybrid range",
      batteryLabel: "Moderate battery reserve for cooling essentials",
      inverterLabel: "Mid-size hybrid inverter starting range",
      solarPanelLabel: "Moderate panel allowance for recharge and offset",
      shortExplanation:
        "This balances backup and bill reduction for refrigeration and fan loads without assuming whole-home coverage.",
      practicalStartingPoint:
        "Confirm startup loads and target backup hours before final equipment selection.",
      disclaimer: defaultDisclaimer,
      match: {
        goal: "both",
        applianceProfile: "refrigerator_fan",
        budget: "500k_1m",
      },
      conservativeRank: 8,
    },
    {
      recommendationId: "hybrid-ac-budget-limited",
      title: "AC noted, hybrid essentials first",
      systemSizeLabel: "Budget-limited hybrid essentials range",
      batteryLabel: "Small-to-modest battery reserve for non-AC essentials",
      inverterLabel: "Essentials hybrid inverter capacity to be confirmed after load review",
      solarPanelLabel: "Starter panel allowance for recharge and offset",
      shortExplanation:
        "Air conditioning is not automatically included in the starting design because the budget calls for a conservative essentials-first recommendation.",
      practicalStartingPoint:
        "Keep AC out of the initial backup assumption until its load and runtime are reviewed.",
      disclaimer: defaultDisclaimer,
      match: {
        goal: "both",
        applianceProfile: "air_conditioner_included",
        budget: "under_250k",
      },
      conservativeRank: 8,
    },
    {
      recommendationId: "hybrid-ac-over-1m",
      title: "AC-aware hybrid planning range",
      systemSizeLabel: "Larger hybrid planning range",
      batteryLabel: "Larger battery reserve to be engineered",
      inverterLabel: "Hybrid inverter capacity to be confirmed after load review",
      solarPanelLabel: "Expanded panel allowance after roof review",
      shortExplanation:
        "The higher budget and AC load justify an engineered review, but this remains a non-final planning recommendation.",
      practicalStartingPoint:
        "Confirm AC model, runtime, roof space, and backup priorities before final sizing.",
      disclaimer: defaultDisclaimer,
      match: {
        goal: "both",
        applianceProfile: "air_conditioner_included",
        budget: "over_1m",
      },
      conservativeRank: 16,
    },
    {
      recommendationId: "hybrid-unknown-budget",
      title: "Hybrid planning conversation starter",
      systemSizeLabel: "Essentials hybrid planning range",
      batteryLabel: "Battery reserve to be narrowed after budget review",
      inverterLabel: "Hybrid inverter starting range to be confirmed after load review",
      solarPanelLabel: "Panel allowance to be confirmed",
      shortExplanation:
        "The goal is both backup and bill reduction, but the budget is unsure, so the recommendation stays broad and conservative.",
      practicalStartingPoint:
        "Clarify budget and must-have loads before moving to a larger recommendation.",
      disclaimer: defaultDisclaimer,
      match: {
        goal: "both",
        applianceProfile: "any",
        budget: "unsure",
      },
      conservativeRank: 5,
    },
  ],
} as const satisfies RecommendationDataset;
