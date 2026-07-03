import { BatteryCharging } from "lucide-react";
import { ButtonLink } from "@/components/ui/PrimaryButton";

export function LandingHero() {
  return (
    <section className="mx-auto grid min-h-[calc(100svh-121px)] w-full max-w-3xl content-center px-5 py-10 sm:px-6 sm:py-14 lg:px-8">
      <div className="motion-fade-up">
        <p className="text-sm font-semibold text-accent">Lumosyn</p>
        <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight tracking-normal text-foreground sm:text-5xl">
          Simple energy estimates for Jamaica.
        </h1>
        <p className="mt-5 max-w-xl text-base leading-7 text-muted sm:text-lg">
          Answer a few questions and get a practical starting point for your
          solar or backup power plan.
        </p>
        <div className="mt-8">
          <ButtonLink className="gap-2" href="/estimate">
            <BatteryCharging aria-hidden="true" size={18} strokeWidth={2.4} />
            Start My Free Estimate
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
