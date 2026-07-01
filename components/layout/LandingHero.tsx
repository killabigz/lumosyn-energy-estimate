import { BatteryCharging } from "lucide-react";
import { ButtonLink } from "@/components/ui/PrimaryButton";
import { LumosynLogo } from "@/components/ui/LumosynLogo";

export function LandingHero() {
  return (
    <section
      className="mx-auto grid min-h-[calc(86dvh-73px)] w-full max-w-6xl items-center gap-8 px-5 py-10 sm:px-6 sm:py-14 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12 lg:px-8 lg:py-16"
      id="start-estimate"
    >
      <div className="motion-fade-up max-w-3xl">
        <div className="mb-8 hidden sm:block">
          <LumosynLogo size="hero" />
        </div>
        <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-normal text-foreground sm:text-5xl md:text-6xl">
          Understand Your Next Energy Step
        </h1>
        <p className="mt-5 max-w-xl text-base leading-7 text-muted sm:text-lg">
          Helping Jamaicans understand and plan affordable energy solutions with
          confidence.
        </p>
        <div className="mt-8 flex flex-col gap-5 sm:flex-row sm:items-center">
          <ButtonLink className="gap-2" href="/estimate">
            <BatteryCharging aria-hidden="true" size={18} strokeWidth={2.4} />
            Start My Free Estimate
          </ButtonLink>
          <ButtonLink href="#about" variant="secondary">
            Learn About Lumosyn
          </ButtonLink>
        </div>
      </div>

      <div className="motion-fade-up motion-delay-1 hidden lg:block" aria-hidden="true">
        <div className="relative overflow-hidden rounded-card border border-border bg-surface p-4 shadow-card sm:p-6 lg:p-8">
          <div className="absolute right-5 top-5 h-20 w-20 rounded-full bg-accent/10 sm:h-24 sm:w-24" />
          <div className="relative">
            <div className="inline-flex rounded-card border border-accent/30 bg-background p-3">
              <LumosynLogo size="compact" />
            </div>
            <div className="mt-8 space-y-3 sm:mt-10 sm:space-y-4">
              <div className="h-3 w-28 rounded-full bg-accent" />
              <div className="h-3 w-full rounded-full bg-border" />
              <div className="h-3 w-4/5 rounded-full bg-border" />
            </div>
            <div className="mt-7 grid grid-cols-3 gap-3 sm:mt-9">
              <div className="h-20 rounded-card border border-border bg-background sm:h-24" />
              <div className="h-20 rounded-card border border-accent/40 bg-accent/10 sm:h-24" />
              <div className="h-20 rounded-card border border-border bg-background sm:h-24" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
