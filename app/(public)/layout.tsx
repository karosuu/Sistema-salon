import { SiteFooter } from "@/components/public/site-footer";
import { SiteHeader } from "@/components/public/site-header";
import { WhatsAppButton } from "@/components/public/whatsapp-button";
import { getDisplayHours, getSalonContent } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [salon, hours] = await Promise.all([
    getSalonContent(),
    getDisplayHours(),
  ]);

  return (
    <>
      <SiteHeader salonName={salon.name} />
      <main className="flex-1">{children}</main>
      <SiteFooter salon={salon} hours={hours} />
      <WhatsAppButton salon={salon} />
    </>
  );
}
