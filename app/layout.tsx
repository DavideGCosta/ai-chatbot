import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SupabaseSessionListener } from "@/components/supabase-listener";
import { SupabaseProvider } from "@/components/supabase-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { AppToaster } from "@/components/ui/app-toaster";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://sciqnt.com"), // Update if there's a domain
  title: "SciQnt - Financial Markets AI Assistant",
  description:
    "AI-powered chatbot for financial analysis, portfolio management, and market insights.",
};

export const viewport = {
  maximumScale: 1, // Disable auto-zoom on mobile Safari
};

const geist = Geist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist-mono",
});

const LIGHT_THEME_COLOR = "hsl(0 0% 100%)";
const DARK_THEME_COLOR = "hsl(240deg 10% 3.92%)";
const THEME_COLOR_SCRIPT = `\
(function() {
  var html = document.documentElement;
  var meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('name', 'theme-color');
    document.head.appendChild(meta);
  }
  function updateThemeColor() {
    var isDark = html.classList.contains('dark');
    meta.setAttribute('content', isDark ? '${DARK_THEME_COLOR}' : '${LIGHT_THEME_COLOR}');
  }
  var observer = new MutationObserver(updateThemeColor);
  observer.observe(html, { attributes: true, attributeFilter: ['class'] });
  updateThemeColor();
})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      className={`${geist.variable} ${geistMono.variable}`}
      // `next-themes` injects an extra classname to the body element to avoid
      // visual flicker before hydration. Hence the `suppressHydrationWarning`
      // prop is necessary to avoid the React hydration mismatch warning.
      // https://github.com/pacocoursey/next-themes?tab=readme-ov-file#with-app
      lang="en"
      suppressHydrationWarning
    >
      <head>
        <script
          // biome-ignore lint/security/noDangerouslySetInnerHtml: "Required"
          dangerouslySetInnerHTML={{
            __html: THEME_COLOR_SCRIPT,
          }}
        />
      </head>
      <body className="antialiased">
        <svg
          aria-hidden="true"
          height="0"
          style={{ position: "absolute" }}
          width="0"
        >
          <defs>
            <filter
              height="100%"
              id="container-glass"
              width="100%"
              x="0%"
              y="0%"
            >
              <feTurbulence
                baseFrequency="0.008 0.008"
                numOctaves="2"
                result="noise"
                seed="92"
                type="fractalNoise"
              />
              <feGaussianBlur in="noise" result="blur" stdDeviation="0.02" />
              <feDisplacementMap
                in="SourceGraphic"
                in2="blur"
                scale="77"
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>
            <filter height="100%" id="btn-glass" width="100%" x="0%" y="0%">
              <feTurbulence
                baseFrequency="0.008 0.008"
                numOctaves="2"
                result="noise"
                seed="92"
                type="fractalNoise"
              />
              <feGaussianBlur in="noise" result="blur" stdDeviation="0.02" />
              <feDisplacementMap
                in="SourceGraphic"
                in2="blur"
                scale="40"
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>
          </defs>
        </svg>
        <SupabaseProvider>
          <SupabaseSessionListener />
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            disableTransitionOnChange
            enableSystem
          >
            <AppToaster />
            {children}
          </ThemeProvider>
        </SupabaseProvider>
      </body>
    </html>
  );
}
