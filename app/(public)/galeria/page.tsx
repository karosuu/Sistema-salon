import { PageHeader } from "@/components/ui/page-header";
import { DEMO_COPY } from "@/lib/salon/content";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return pageMetadata("Galería", DEMO_COPY.galleryBody);
}

export default function GalleryPage() {
  const featured =
    DEMO_COPY.galleryItems.find((item) => item.id === "salon") ?? DEMO_COPY.galleryItems[0];
  const rest = DEMO_COPY.galleryItems.filter((item) => item.id !== featured?.id);

  return (
    <div className="pb-16">
      <PageHeader
        eyebrow={DEMO_COPY.galleryEyebrow}
        title={DEMO_COPY.galleryTitle}
        description={DEMO_COPY.galleryBody}
      />
      <div className="mx-auto grid w-full max-w-6xl gap-4 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-3">
        {featured ? (
          <figure className="group flex h-full flex-col overflow-hidden rounded-[var(--radius-lg)] border border-border bg-surface shadow-[var(--shadow-card)] sm:col-span-2 lg:row-span-2">
            <div className="min-h-64 flex-1 overflow-hidden bg-cream-deep">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={featured.image}
                alt={`${featured.title} (DEMO)`}
                className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <figcaption className="px-4 py-4">
              <p className="font-display text-xl text-navy">{featured.title}</p>
              <p className="mt-1 text-sm text-muted">{featured.caption}</p>
            </figcaption>
          </figure>
        ) : null}
        {rest.map((item) => (
          <figure
            key={item.id}
            className="group overflow-hidden rounded-[var(--radius-lg)] border border-border bg-surface shadow-[var(--shadow-card)]"
          >
            <div className="aspect-[4/3] overflow-hidden bg-cream-deep">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.image}
                alt={`${item.title} (DEMO)`}
                className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <figcaption className="px-4 py-4">
              <p className="font-display text-xl text-navy">{item.title}</p>
              <p className="mt-1 text-sm text-muted">{item.caption}</p>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
