import type { Metadata, Viewport } from "next";
import { siteConfig, theme } from "@/lib/site";
import "../styles/globals.css";

const keyboardNavigationScript = `
(() => {
  if (window.__lumosynKeyboardNavigationMode) {
    return;
  }

  window.__lumosynKeyboardNavigationMode = true;
  const className = "keyboard-navigation";
  const enable = (event) => {
    if (event.key === "Tab") {
      document.body.classList.add(className);
    }
  };
  const disable = () => document.body.classList.remove(className);

  window.addEventListener("keydown", enable, true);
  window.addEventListener("pointerdown", disable, true);
  window.addEventListener("mousedown", disable, true);
  window.addEventListener("touchstart", disable, true);
  window.addEventListener("click", disable, true);
})();
`;

export const metadata: Metadata = {
  title: siteConfig.title,
  description: siteConfig.description,
  applicationName: siteConfig.name,
  manifest: "/manifest.json",
  icons: {
    icon: [
      {
        url: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    apple: "/icons/icon-192.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: theme.background,
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" data-scroll-behavior="smooth">
      <body
        className="lumosyn-background min-h-dvh bg-background text-foreground antialiased"
        suppressHydrationWarning
      >
        <script
          dangerouslySetInnerHTML={{ __html: keyboardNavigationScript }}
          id="keyboard-navigation-mode"
        />
        {children}
      </body>
    </html>
  );
}
