import { BatteryCharging } from "lucide-react";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { ButtonLink } from "@/components/ui/PrimaryButton";

const sections = [
  {
    title: "What Lumosyn does",
    body: "Lumosyn helps Jamaicans understand practical energy options before choosing a solar or backup solution.",
  },
  {
    title: "Our mission",
    body: "Our mission is to make energy planning simple, respectful, and easier to start.",
  },
  {
    title: "What we're building",
    body: "We're building beginner-friendly tools, recommendations, and learning resources for affordable energy decisions.",
  },
  {
    title: "What people can expect",
    body: "People can expect clear guidance, honest next steps, and no pressure to move faster than they are ready for.",
  },
];

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="mx-auto min-h-[calc(100dvh-73px)] w-full max-w-6xl px-5 py-14 sm:px-6 sm:py-20 lg:px-8">
          <div className="motion-fade-up max-w-3xl">
            <p className="text-sm font-semibold text-accent">
              About Lumosyn
            </p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-normal text-foreground sm:text-5xl">
              Simple energy guidance for Jamaica.
            </h1>
            <p className="mt-5 text-base leading-7 text-muted sm:text-lg">
              Lumosyn helps people take a clear first step toward understanding
              solar, backup power, and practical energy planning.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {sections.map((section) => (
              <article
                className="motion-fade-up rounded-card border border-border bg-surface p-6"
                key={section.title}
              >
                <h2 className="text-xl font-semibold text-foreground">
                  {section.title}
                </h2>
                <p className="mt-3 text-base leading-7 text-muted">
                  {section.body}
                </p>
              </article>
            ))}
          </div>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
            <ButtonLink className="gap-2" href="/estimate">
              <BatteryCharging
                aria-hidden="true"
                size={18}
                strokeWidth={2.4}
              />
              Start My Free Estimate
            </ButtonLink>
            <ButtonLink href="/why-lumosyn-exists" variant="secondary">
              Why Lumosyn Exists
            </ButtonLink>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
