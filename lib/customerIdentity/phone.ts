const NON_DIGIT_PATTERN = /\D/g;
const MIN_PHONE_DIGITS = 7;
const MAX_PHONE_DIGITS = 15;

export type PhoneNormalizationExample = {
  expected: string | null;
  input: unknown;
};

export const PHONE_NORMALIZATION_EXAMPLES = [
  {
    expected: "18761234567",
    input: "+1 (876) 123-4567",
  },
  {
    expected: "8761234567",
    input: "8761234567",
  },
  {
    expected: null,
    input: "",
  },
  {
    expected: null,
    input: "not a phone number",
  },
] as const satisfies readonly PhoneNormalizationExample[];

export function normalizePhoneDigits(value: unknown) {
  if (typeof value !== "number" && typeof value !== "string") {
    return null;
  }

  const digits = String(value).replace(NON_DIGIT_PATTERN, "");

  if (
    digits.length < MIN_PHONE_DIGITS ||
    digits.length > MAX_PHONE_DIGITS
  ) {
    return null;
  }

  return digits;
}

export function runPhoneNormalizationVerification() {
  const results = PHONE_NORMALIZATION_EXAMPLES.map((example) => ({
    ...example,
    actual: normalizePhoneDigits(example.input),
  }));
  const failures = results.filter(
    (result) => result.actual !== result.expected,
  );

  if (failures.length > 0) {
    throw new Error(
      failures
        .map(
          (failure) =>
            `Expected ${String(failure.input)} to normalize to ${failure.expected}, received ${failure.actual}`,
        )
        .join("\n"),
    );
  }

  return results;
}
