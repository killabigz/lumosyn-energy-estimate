import { SiteHeader } from "@/components/layout/SiteHeader";

export default function EstimateConfirmationPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="estimate-stage grid min-h-[calc(100dvh-73px)] w-full content-center px-5 py-8 sm:px-6 sm:py-12 lg:px-8">
          <div className="estimate-panel motion-fade-up mx-auto w-full max-w-3xl rounded-card border border-border bg-surface p-6 shadow-card sm:p-10">
            <p className="text-sm font-semibold uppercase tracking-normal text-accent">
              THANKS!
            </p>
            <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-normal text-foreground sm:text-4xl">
              Your information is ready.
            </h1>
            <p className="mt-5 text-base leading-7 text-muted sm:text-lg">
              The recommendation engine will be connected in Module 5.
            </p>
            <p className="mt-4 text-sm leading-6 text-secondary">
              No data is saved. No recommendation is generated yet.
            </p>
            <p className="mt-4 text-sm font-semibold leading-6 text-muted">
              Next step: your starting energy estimate will be connected in the
              next module.
            </p>
          </div>
        </section>
      </main>
    </>
  );
}
