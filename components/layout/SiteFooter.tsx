import { LumosynLogo } from "@/components/ui/LumosynLogo";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-8 text-sm text-secondary sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <a
          aria-label="Lumosyn home"
          className="w-fit rounded-card outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          href="#top"
        >
          <LumosynLogo />
        </a>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-5">
          <p>Copyright 2026 Lumosyn</p>
          <p>Version 1</p>
          <a
            className="font-semibold transition hover:text-foreground focus-visible:rounded-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            href="#privacy"
          >
            Privacy
          </a>
          <a
            className="font-semibold transition hover:text-foreground focus-visible:rounded-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            href="#contact"
          >
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
}
