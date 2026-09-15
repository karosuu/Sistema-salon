export const BUSINESS_TIMEZONE = "America/Costa_Rica";
export const BUSINESS_CURRENCY = "CRC";
export const BUSINESS_LOCALE = "es-CR";

export const PUBLIC_ROUTES = {
  home: "/",
  services: "/servicios",
  professionals: "/profesionales",
  gallery: "/galeria",
  about: "/sobre-el-salon",
  contact: "/contacto",
  book: "/reservar",
  bookingConfirmation: "/reservar/confirmacion",
} as const;

export const ADMIN_ROUTES = {
  login: "/admin/iniciar-sesion",
  dashboard: "/admin",
  appointments: "/admin/citas",
  calendar: "/admin/calendario",
  customers: "/admin/clientes",
  customerNew: "/admin/clientes/nuevo",
  services: "/admin/servicios",
  serviceNew: "/admin/servicios/nuevo",
  professionals: "/admin/profesionales",
  professionalNew: "/admin/profesionales/nuevo",
  hours: "/admin/horarios",
  settings: "/admin/configuracion",
} as const;

export const PUBLIC_NAV = [
  { href: PUBLIC_ROUTES.home, label: "Inicio" },
  { href: PUBLIC_ROUTES.services, label: "Servicios" },
  { href: PUBLIC_ROUTES.professionals, label: "Profesionales" },
  { href: PUBLIC_ROUTES.gallery, label: "Galería" },
  { href: PUBLIC_ROUTES.about, label: "Sobre el salón" },
  { href: PUBLIC_ROUTES.contact, label: "Contacto" },
] as const;

export const ADMIN_NAV = [
  { href: ADMIN_ROUTES.dashboard, label: "Dashboard" },
  { href: ADMIN_ROUTES.appointments, label: "Citas" },
  { href: ADMIN_ROUTES.calendar, label: "Calendario" },
  { href: ADMIN_ROUTES.customers, label: "Clientes" },
  { href: ADMIN_ROUTES.services, label: "Servicios" },
  { href: ADMIN_ROUTES.professionals, label: "Profesionales" },
  { href: ADMIN_ROUTES.hours, label: "Horarios" },
  { href: ADMIN_ROUTES.settings, label: "Configuración" },
] as const;
