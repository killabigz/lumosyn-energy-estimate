import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from "react";

type PrimaryButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "primary" | "secondary";
};

type ButtonLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  children: ReactNode;
  variant?: "primary" | "secondary";
};

const baseClasses =
  "inline-flex min-h-12 w-full items-center justify-center rounded-large px-6 py-3 text-base font-semibold outline-none transition duration-200 ease-out focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:w-auto";

const variantClasses = {
  primary:
    "bg-accent text-background shadow-glow hover:-translate-y-0.5 hover:bg-accent/90 focus-visible:ring-accent",
  secondary:
    "border border-border bg-surface text-foreground hover:-translate-y-0.5 hover:border-accent/60 hover:bg-surface-soft focus-visible:ring-accent",
};

export function PrimaryButton({
  children,
  className,
  type = "button",
  variant = "primary",
  ...props
}: PrimaryButtonProps) {
  const classes = [
    baseClasses,
    variantClasses[variant],
    "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button className={classes} type={type} {...props}>
      {children}
    </button>
  );
}

export function ButtonLink({
  children,
  className,
  variant = "primary",
  ...props
}: ButtonLinkProps) {
  const classes = [baseClasses, variantClasses[variant], className]
    .filter(Boolean)
    .join(" ");

  return (
    <a className={classes} {...props}>
      {children}
    </a>
  );
}
