# Quantity-Aware Recommendation Scenarios

Module 17 makes recommendation logic quantity-aware while keeping the result a
beginner-friendly starting estimate. Quantities influence the recommendation
range and caution wording, but they do not replace final engineering sizing.

## Scenario Checks

| Scenario | Selected appliances | Expected outcome |
| --- | --- | --- |
| A. Small essentials | Lights x1, TV x1, Wi-Fi x1, Fan x1 | `12V Starter Backup` or `24V Home Essentials` depending on runtime and budget. Should not become 48V from these small quantities alone. |
| B. Normal home essentials | Refrigerator x1, Fan x2, Wi-Fi x1 | `24V Home Essentials`. Refrigerator plus small essentials should stay in a practical home essentials range. |
| C. Fridge plus freezer | Refrigerator x1, Freezer x1, Fan x1 | `48V Larger Backup Planning` with cold-storage caution wording. |
| D. AC case | Air Conditioner x1, Refrigerator x1 | `48V Larger Backup Planning` with ordinary 48V labels such as `5kW class`, `48V battery bank`, and `6-10+ panels`. |
| E. Multiple AC | Air Conditioner x2, Refrigerator x1, Fan x2 | `48V Larger Backup Planning` with stronger labels such as `5kW-8kW planning range`, larger reserve battery wording, and `8-12+ panels planning range`. |
| F. Pump plus cold storage | Water Pump x1, Refrigerator x1, Freezer x1 | `48V Larger Backup Planning` with caution for cold-storage or motor-based appliances. |
| G. Heavy quantity case | Air Conditioner x2, Water Pump x2, Freezer x2 | `48V Larger Backup Planning` with `8kW+ planning range`, larger 48V battery bank wording, `10-14+ panels planning range`, and strong startup-demand caution. |

## Normalization Rules

- Only selected appliances count toward recommendation pressure.
- Missing quantities default to `1` for backward compatibility.
- Invalid quantities default to `1`.
- Quantities must be positive integers.
- Quantities above `10` are clamped to `10`.
- `Other` is preserved when selected, but it adds caution rather than
  automatically inflating the system category by itself.

Every output remains a planning range and starting estimate. Final inverter,
battery, solar, wiring, and surge sizing must be confirmed before installation.
