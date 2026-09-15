import type { Metadata } from "next";
import { Fraunces, Outfit } from "next/font/google";

import { getSalonContent } from "@/lib/data";
import { getAppUrl } from "@/lib/env";
import { DEMO_COPY } from "@/lib/salon/content";

import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const salon = await getSalonContent();
  const description = salon.tagline
    ? `${salon.tagline}. ${DEMO_COPY.seoDescription}`
    : DEMO_COPY.seoDescription;
  const url = getAppUrl();

  return {
    title: {
      default: salon.name,
      template: `%s · ${salon.name}`,
    },
    description,
    metadataBase: new URL(url),
    icons: {
      icon: "/logo-mark.svg",
      apple: "/logo-mark.svg",
    },
    openGraph: {
      title: salon.name,
      description,
      locale: "es_CR",
      type: "website",
      url,
      siteName: salon.name,
      images: [{ url: "/logo-mark.svg", alt: salon.name }],
    },
    twitter: {
      card: "summary",
      title: salon.name,
      description,
    },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es-CR"
      className={`${outfit.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background font-sans text-foreground">
        {children}
      </body>
    </html>
  );
}
