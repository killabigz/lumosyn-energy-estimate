export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-2 gap-y-1 px-5 py-3 text-xs text-secondary sm:px-6 lg:px-8">
        <span>© 2026 Lumosyn LLC</span>
        <span aria-hidden="true">·</span>
        <a
          className="font-semibold transition hover:text-foreground focus-visible:rounded-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          href="#privacy"
        >
          Privacy
        </a>
        <span aria-hidden="true">·</span>
        <span>Version 1</span>
      </div>
    </footer>
  );
}
