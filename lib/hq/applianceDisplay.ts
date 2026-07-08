const EMPTY_APPLIANCE_LIST = "None listed";

type FormatAppliancesOptions = {
  includeSingleQuantities?: boolean;
};

function getSelectedAppliances(appliances: readonly string[] | null) {
  if (!Array.isArray(appliances)) {
    return [];
  }

  return appliances.filter(
    (appliance): appliance is string =>
      typeof appliance === "string" && appliance.trim().length > 0,
  );
}

function getApplianceQuantity(
  applianceQuantities: unknown,
  appliance: string,
) {
  if (
    typeof applianceQuantities !== "object" ||
    applianceQuantities === null ||
    Array.isArray(applianceQuantities)
  ) {
    return null;
  }

  const quantity = (applianceQuantities as Record<string, unknown>)[appliance];

  if (
    typeof quantity !== "number" ||
    !Number.isInteger(quantity) ||
    quantity < 1
  ) {
    return null;
  }

  return quantity;
}

export function formatApplianceItemsWithQuantities(
  appliances: readonly string[] | null,
  applianceQuantities: unknown,
  options: FormatAppliancesOptions = {},
) {
  return getSelectedAppliances(appliances).map((appliance) => {
    const quantity = getApplianceQuantity(applianceQuantities, appliance);

    if (
      quantity !== null &&
      (quantity > 1 || options.includeSingleQuantities)
    ) {
      return `${appliance} x${quantity}`;
    }

    return appliance;
  });
}

export function formatAppliancesWithQuantities(
  appliances: readonly string[] | null,
  applianceQuantities: unknown,
  options: FormatAppliancesOptions = {},
) {
  const applianceItems = formatApplianceItemsWithQuantities(
    appliances,
    applianceQuantities,
    options,
  );

  return applianceItems.length > 0
    ? applianceItems.join(", ")
    : EMPTY_APPLIANCE_LIST;
}
