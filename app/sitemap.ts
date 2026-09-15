import type { MetadataRoute } from "next";

import { PUBLIC_ROUTES } from "@/lib/constants";
import { getAppUrl } from "@/lib/env";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getAppUrl();

  return Object.values(PUBLIC_ROUTES).map((path) => ({
    url: `${baseUrl}${path}`,
    changeFrequency: path === PUBLIC_ROUTES.home ? "weekly" : "monthly",
    priority: path === PUBLIC_ROUTES.home ? 1 : 0.7,
  }));
}
