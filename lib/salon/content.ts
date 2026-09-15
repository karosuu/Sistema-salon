/**
 * Textos y piezas de vitrina DEMO. No describen un salón real.
 * Contacto, horarios y catálogo salen de la base (SalonSettings, BusinessHours, Service, Professional).
 */
export const DEMO_COPY = {
  seoDescription:
    "Salón de belleza de demostración en Costa Rica. Reservá citas, conocé servicios y escribí por WhatsApp. Contenido placeholder.",
  heroEyebrow: "Salón de belleza · Costa Rica",
  heroTitle: "Belleza con calma, detalle y un trato premium.",
  heroBody:
    "Esta es una vitrina de demostración. El nombre, la dirección y los horarios se editan desde la configuración del salón.",
  aboutEyebrow: "Sobre el salón",
  aboutTitle: "Un espacio DEMO para cuidar tu rutina de belleza.",
  aboutParagraphs: [
    "Pixel-Craft Salón (DEMO) es un contenido de ejemplo. No representa un negocio real ni una ubicación verificada.",
    "La historia, el equipo y los valores se reemplazarán cuando el salón cargue su información definitiva desde configuración.",
    "Mientras tanto, podés recorrer servicios, profesionales y el flujo de reserva con datos claramente marcados como DEMO.",
  ],
  aboutValues: [
    { title: "Cuidado", text: "Atención pausada y clara, pensada para que la visita se sienta sencilla." },
    { title: "Detalle", text: "Servicios descritos con duración y precio en colones, sin sorpresas." },
    { title: "Cercanía", text: "WhatsApp siempre a un toque para resolver dudas o confirmar una cita." },
  ],
  galleryEyebrow: "Galería",
  galleryTitle: "Ambiente y trabajos (DEMO)",
  galleryBody:
    "No usamos fotografías reales del cliente. Estas piezas son fotos de demostración para la futura galería.",
  galleryItems: [
    { id: "corte", title: "Corte", caption: "Foto DEMO · corte y peinado", image: "/demo/galeria/corte.png" },
    { id: "color", title: "Color", caption: "Foto DEMO · coloración", image: "/demo/galeria/color.png" },
    { id: "manos", title: "Manos", caption: "Foto DEMO · manicure", image: "/demo/galeria/manos.png" },
    { id: "pies", title: "Pies", caption: "Foto DEMO · pedicure", image: "/demo/galeria/pies.png" },
    { id: "salon", title: "Salón", caption: "Foto DEMO · espacio", image: "/demo/galeria/salon.png" },
    { id: "detalle", title: "Detalle", caption: "Foto DEMO · acabados", image: "/demo/galeria/detalle.png" },
  ],
  bookingNote:
    "La disponibilidad se calcula en el servidor. Si el horario se ocupa mientras reservás, te pedimos elegir otro.",
  heroImage: "/demo/galeria/salon.png",
  heroImageCaption: "Foto DEMO · espacio",
  trustItems: [
    {
      title: "Sin crear cuenta",
      text: "Reservás con tu nombre y teléfono. No hay registro ni contraseña.",
    },
    {
      title: "Confirmación al momento",
      text: "Si el horario está libre, la cita entra al calendario del salón de inmediato.",
    },
    {
      title: "WhatsApp a un toque",
      text: "El botón abre wa.me. No enviamos mensajes automáticos.",
    },
  ],
  ctaBandTitle: "Reservá con calma, en el horario que te quede bien.",
  ctaBandBody:
    "Elegí servicio, profesional y un espacio libre. Esta vitrina es DEMO: los datos se editan desde el panel.",
} as const;
