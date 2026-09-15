import type { Metadata } from "next";

import { DesignShowcase } from "@/app/(public)/diseno/design-showcase";

export const metadata: Metadata = {
  title: "Sistema visual",
  description: "Tokens y componentes de la identidad visual DEMO de Pixel-Craft.",
};

export default function DesignPage() {
  return <DesignShowcase />;
}
