type ServiceMediaProps = {
  name: string;
  imageUrl: string | null;
  className?: string;
};

export function ServiceMedia({ name, imageUrl, className }: ServiceMediaProps) {
  const frame =
    className ??
    "aspect-[16/10] w-full overflow-hidden";

  if (!imageUrl) {
    return (
      <div
        className={`${frame} bg-gradient-to-br from-cyan/40 via-violet/30 to-magenta/40`}
        aria-hidden
      />
    );
  }

  return (
    <div className={`${frame} bg-cream-deep`}>
      {/* URLs las carga el salón (http(s) o ruta local). next/image exigiría dominios fijos. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageUrl}
        alt={name}
        className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
      />
    </div>
  );
}
