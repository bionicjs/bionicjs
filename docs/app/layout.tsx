import type { Metadata } from "next";
import { Geist, Geist_Mono, Press_Start_2P, VT323 } from "next/font/google";
import "./globals.css";
import { ThemeFavicon } from "@/components/theme-favicon";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const vt323 = VT323({
  weight: "400",
  variable: "--font-vt323",
  subsets: ["latin"],
});

const pressStart2P = Press_Start_2P({
  weight: "400",
  variable: "--font-press-start-2p",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "bionicjs · a fullstack framework for intelligence and web",
    template: "%s · bionicjs docs",
  },
  description:
    "One project, both worlds. Python owns the intelligence layer, TypeScript owns the web surface, and the framework runs them together: typed contracts, generators, and one CLI.",
};

const themeInit = `(function(){document.documentElement.classList.add('dark')})();`;

export default function RootLayout(props: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${vt323.variable} ${pressStart2P.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full bg-background text-foreground">
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
        <ThemeFavicon />
        {props.children}
      </body>
    </html>
  );
}