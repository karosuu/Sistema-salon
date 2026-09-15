import type { Metadata } from "next";

import { getAppUrl } from "@/lib/env";
import { getSalonContent } from "@/lib/data/salon";
import { DEMO_COPY } from "@/lib/salon/content";

export async function pageMetadata(
  title: string,
  description: string = DEMO_COPY.seoDescription,
): Promise<Metadata> {
  const salon = await getSalonContent();
  const url = getAppUrl();

  return {
    title,
    description,
    openGraph: {
      title: `${title} · ${salon.name}`,
      description,
      locale: "es_CR",
      type: "website",
      url,
      siteName: salon.name,
      images: [{ url: "/logo-mark.svg", alt: salon.name }],
    },
    twitter: {
      card: "summary",
      title: `${title} · ${salon.name}`,
      description,
    },
  };
}
