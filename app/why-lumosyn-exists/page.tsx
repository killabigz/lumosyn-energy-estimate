import Link from "next/link";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";

const storyParagraphs = [
  "Every blackout reminds us how important reliable energy is.",
  "But the biggest problem isn’t choosing a battery.",
  "It’s knowing where to start.",
  "Too many people feel overwhelmed by technical terms, conflicting advice, and expensive systems.",
  "We believe understanding your energy options should be simple.",
  "That’s why Lumosyn exists.",
  "We’re documenting the journey, building practical tools, and sharing what we learn to help more Jamaicans make confident energy decisions.",
  "We’re not just building batteries.",
  "We’re building understanding.",
  "We’re not just building products.",
  "We’re building confidence.",
  "This is only the beginning. 💚",
];

export default function WhyLumosynExistsPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="estimate-stage min-h-[calc(100dvh-73px)] w-full px-5 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="motion-fade-up relative z-10 mx-auto max-w-4xl">
            <p className="text-sm font-semibold text-accent">
              Lumosyn story
            </p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-normal text-foreground sm:text-5xl">
              Why Lumosyn Exists
            </h1>

            <div className="mt-8 grid gap-5 text-base leading-7 text-muted sm:text-lg">
              {storyParagraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>

            <Link
              className="mt-8 inline-flex text-sm font-semibold text-secondary transition hover:text-foreground focus-visible:rounded-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              href="/"
            >
              Back to Home
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
