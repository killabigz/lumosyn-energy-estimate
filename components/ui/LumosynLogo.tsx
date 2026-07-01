import Image from "next/image";
import { siteConfig } from "@/lib/site";

type LumosynLogoProps = {
  size?: "compact" | "default" | "hero";
  priority?: boolean;
};

const sizeClasses = {
  compact: "h-10 w-36",
  default: "h-11 w-40 sm:w-44",
  hero: "h-16 w-56 sm:h-20 sm:w-72",
};

export function LumosynLogo({
  priority = false,
  size = "default",
}: LumosynLogoProps) {
  return (
    <span
      className={`relative block overflow-hidden rounded-card ${sizeClasses[size]}`}
    >
      <Image
        alt={siteConfig.name}
        className="object-cover"
        fill
        priority={priority}
        sizes="(max-width: 640px) 144px, 288px"
        src="/logos/lumosyn-horizontal.png"
      />
    </span>
  );
}
