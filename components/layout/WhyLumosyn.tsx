import { ChartNoAxesCombined, Compass, Sprout } from "lucide-react";

const reasons = [
  {
    description: "Clear guidance for beginners.",
    delayClass: "motion-delay-1",
    icon: Compass,
    title: "Understand",
  },
  {
    description: "Personalized recommendations.",
    delayClass: "motion-delay-2",
    icon: ChartNoAxesCombined,
    title: "Plan",
  },
  {
    description: "Helping customers make confident energy decisions.",
    delayClass: "motion-delay-3",
    icon: Sprout,
    title: "Grow",
  },
];

export function WhyLumosyn() {
  return (
    <section
      aria-labelledby="why-heading"
      className="mx-auto max-w-6xl px-5 py-16 sm:px-6 sm:py-20 lg:px-8"
    >
      <div className="motion-fade-up max-w-2xl">
        <h2
          className="text-3xl font-semibold leading-tight tracking-normal text-foreground sm:text-4xl"
          id="why-heading"
        >
          Why Lumosyn
        </h2>
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {reasons.map((reason) => {
          const Icon = reason.icon;

          return (
            <article
              className={`motion-fade-up ${reason.delayClass} rounded-card border border-border bg-surface p-6 shadow-card transition duration-200 hover:-translate-y-1 hover:border-accent/50 hover:bg-surface-soft`}
              key={reason.title}
            >
              <div className="inline-flex size-11 items-center justify-center rounded-card bg-accent-soft text-accent">
                <Icon aria-hidden="true" size={22} strokeWidth={2} />
              </div>
              <h3 className="mt-6 text-xl font-semibold text-foreground">
                {reason.title}
              </h3>
              <p className="mt-3 text-base leading-7 text-muted">
                {reason.description}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
