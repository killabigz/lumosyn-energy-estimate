"use client";

import { Menu, X } from "lucide-react";
import type { KeyboardEvent } from "react";
import { useRef, useState } from "react";
import { ButtonLink } from "@/components/ui/PrimaryButton";
import { LumosynLogo } from "@/components/ui/LumosynLogo";

const navItems = [{ href: "#about", label: "About" }];

export function SiteHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const lastKeyboardToggle = useRef(0);

  function closeMenu() {
    setIsOpen(false);
  }

  function toggleMenu() {
    setIsOpen((current) => !current);
  }

  function handleMenuClick() {
    if (Date.now() - lastKeyboardToggle.current < 350) {
      return;
    }

    toggleMenu();
  }

  function handleMenuKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.repeat) {
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      lastKeyboardToggle.current = Date.now();
      toggleMenu();
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-6 lg:px-8">
        <a
          aria-label="Lumosyn home"
          className="rounded-card outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          href="#top"
          onClick={closeMenu}
        >
          <LumosynLogo priority />
        </a>

        <nav aria-label="Primary navigation" className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <a
              className="text-sm font-semibold text-secondary transition hover:text-foreground focus-visible:rounded-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              href={item.href}
              key={item.href}
            >
              {item.label}
            </a>
          ))}
          <ButtonLink className="min-h-11 px-5 py-2 text-sm" href="/estimate">
            Start Estimate
          </ButtonLink>
        </nav>

        <button
          aria-controls="mobile-navigation"
          aria-expanded={isOpen}
          aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
          className="inline-flex size-11 items-center justify-center rounded-card border border-border bg-surface text-foreground outline-none transition hover:border-accent/60 hover:bg-surface-soft focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background md:hidden"
          onClick={handleMenuClick}
          onKeyDown={handleMenuKeyDown}
          type="button"
        >
          {isOpen ? <X aria-hidden="true" size={20} /> : <Menu aria-hidden="true" size={20} />}
        </button>
      </div>

      {isOpen && (
        <nav
          aria-label="Mobile navigation"
          className="border-t border-border bg-background px-5 py-4 md:hidden"
          id="mobile-navigation"
        >
          <div className="mx-auto flex max-w-6xl flex-col gap-3">
            <a
              className="rounded-card px-3 py-3 text-base font-semibold text-foreground outline-none transition hover:bg-surface focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              href="#about"
              onClick={closeMenu}
            >
              About
            </a>
            <a
              className="rounded-card px-3 py-3 text-base font-semibold text-foreground outline-none transition hover:bg-surface focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              href="/estimate"
              onClick={closeMenu}
            >
              Start Estimate
            </a>
          </div>
        </nav>
      )}
    </header>
  );
}
