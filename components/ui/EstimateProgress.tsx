type EstimateProgressProps = {
  current: number;
  total: number;
};

export function EstimateProgress({ current, total }: EstimateProgressProps) {
  const steps = Array.from({ length: total }, (_, index) => index + 1);
  const percentComplete = Math.round((current / total) * 100);

  return (
    <div className="grid gap-3" aria-label="Estimate progress">
      <div className="flex items-center justify-between gap-4 text-sm font-semibold text-secondary">
        <span>
          Question {current} of {total}
        </span>
        <span>{percentComplete}%</span>
      </div>
      <div
        aria-valuemax={total}
        aria-valuemin={1}
        aria-valuenow={current}
        className="flex h-3 gap-1 rounded-full bg-border p-1"
        role="progressbar"
      >
        {steps.map((step) => (
          <span
            aria-hidden="true"
            className={`h-full flex-1 rounded-full ${
              step <= current ? "bg-accent" : "bg-surface-soft"
            }`}
            key={step}
          />
        ))}
      </div>
    </div>
  );
}
