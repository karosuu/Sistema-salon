import type { SalonContent } from "@/lib/salon";

type SocialLinksProps = {
  salon: SalonContent;
};

export function SocialLinks({ salon }: SocialLinksProps) {
  const links = [
    { href: salon.instagramUrl, label: "Instagram" },
    { href: salon.facebookUrl, label: "Facebook" },
    { href: salon.tiktokUrl, label: "TikTok" },
  ].filter((item): item is { href: string; label: string } => Boolean(item.href));

  if (links.length === 0) {
    return <p className="text-sm text-muted">Redes sociales por configurar.</p>;
  }

  return (
    <ul className="flex flex-col gap-2 text-sm">
      {links.map((item) => (
        <li key={item.label}>
          <a
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted hover:text-navy"
          >
            {item.label}
          </a>
        </li>
      ))}
    </ul>
  );
}
