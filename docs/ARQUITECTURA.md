# Arquitectura — Pixel-Craft Salón

Aplicación para **un solo salón** en Costa Rica. No hay multi-tenancy, suscripciones ni SaaS.

## 1. Separación de capas

| Capa | Ubicación | Responsabilidad |
| --- | --- | --- |
| Frontend público | `app/(public)`, `components/public` | Vitrina, contacto, reserva |
| Panel administrativo | `app/(admin)`, `app/(auth)`, `components/admin` | Gestión interna |
| Componentes UI | `components/ui` | Piezas reutilizables sin dominio |
| Lógica de negocio | `lib/*`, `actions/*` | Disponibilidad, dinero, validación, mutaciones |
| Acceso a datos | `lib/data`, `lib/db.ts` | Prisma y lecturas de dominio |
| Base de datos | `prisma/schema.prisma` | Modelos y relaciones |

Las páginas no deben consultar Prisma. Usan `lib/data` o server actions.

## 2. Estructura de carpetas

```text
app/
  (public)/                 Sitio de clientes
  (auth)/admin/iniciar-sesion
  (admin)/admin/            Panel protegido
  api/auth/[...nextauth]    NextAuth
  sitemap.ts, robots.ts
actions/                    Server Actions (aún sin mutaciones)
components/
  ui/                       Placeholders y piezas genéricas
  public/                   Header, footer, WhatsApp
  admin/                    Sidebar, sesión, logout
lib/
  data/                     Capa de acceso a datos
  salon/                    Placeholders DEMO de identidad
  validations/              Esquemas Zod
  whatsapp/                 Enlace manual + contrato futuro
  auth.ts, db.ts, env.ts
  timezone.ts, money.ts
  errors.ts, result.ts
prisma/schema.prisma
docs/                       Arquitectura y reglas
```

## 3. Rutas públicas

| Ruta | Página |
| --- | --- |
| `/` | Inicio + CTA Reservar / WhatsApp |
| `/servicios` | Catálogo (pendiente) |
| `/profesionales` | Equipo (pendiente) |
| `/galeria` | Galería (pendiente) |
| `/sobre-el-salon` | Historia (pendiente) |
| `/contacto` | Datos DEMO + WhatsApp |
| `/reservar` | Flujo de reserva (pendiente) |

Sin autenticación. Contenido del salón desde `getSalonContent()`.

## 4. Rutas administrativas

| Ruta | Página |
| --- | --- |
| `/admin/iniciar-sesion` | Login del personal |
| `/admin` | Dashboard |
| `/admin/citas` | Lista de citas |
| `/admin/calendario` | Agenda |
| `/admin/clientes` | Clientes |
| `/admin/servicios` | Servicios |
| `/admin/profesionales` | Profesionales |
| `/admin/horarios` | Horarios y bloqueos |
| `/admin/configuracion` | Datos del salón |

Todas menos el login exigen sesión de `AdminUser`.

## 5. Componentes compartidos

- `components/ui`: bloques sin reglas de negocio.
- `components/public`: chrome del sitio.
- `components/admin`: chrome del panel.
- Constantes de navegación en `lib/constants.ts`.

## 6. Capa de acceso a datos

- `lib/db.ts`: cliente Prisma único (server-only).
- `lib/data/salon.ts`: lectura de identidad del salón.
- `lib/data/index.ts`: fachada para páginas y actions.

Más adelante: `lib/data/services.ts`, `professionals.ts`, `appointments.ts`, `availability.ts`.

## 7. Modelos Prisma

Definidos en `prisma/schema.prisma`. Migración inicial: `prisma/migrations/20260914200000_init`. Seed DEMO: `prisma/seed.ts`.

| Modelo | Rol |
| --- | --- |
| `AdminUser` | Personal que entra al panel |
| `Customer` | Cliente de una cita |
| `Service` | Servicio con precio CRC entero y duración |
| `Professional` | Profesional activo/inactivo |
| `ProfessionalService` | Qué servicios realiza cada profesional |
| `BusinessHours` | Horario semanal del salón (`HH:mm` local) |
| `ProfessionalAvailability` | Horario semanal del profesional |
| `Appointment` | Reserva: cliente + servicio + profesional + UTC + estado |
| `BlockedTime` | Bloqueo o feriado (salón o profesional) |
| `SalonSettings` | Configuración del único salón |

Estados de cita: `PENDING`, `CONFIRMED`, `CANCELLED`, `COMPLETED`, `NO_SHOW`.

Anti-solape: constraint PostgreSQL `Appointment_no_professional_overlap` (GiST + `tsrange` semiabierto `[startsAt, endsAt)`). Solo aplica a `PENDING` y `CONFIRMED`. `CANCELLED`, `COMPLETED` y `NO_SHOW` no bloquean el horario. La aplicación debe volver a validar al confirmar.

## 8. Autenticación

- Solo administradores. Los clientes no tienen cuenta.
- NextAuth con credenciales + JWT (8 horas).
- Contraseñas con bcrypt. El hash nunca sale al cliente.
- `proxy.ts`: si no hay cookie de sesión en `/admin`, redirige al login.
- `requireAdminSession` / `assertAdminSession`: autorización real en layout y actions.
- Secretos: `NEXTAUTH_SECRET`. No se expone al frontend.

## 9. Errores

- `AppError`, `ValidationError`, `UnauthorizedError`, `ConflictError` en `lib/errors.ts`.
- `toPublicErrorMessage` oculta SQL, stacks y secretos.
- `Result<T, E>` en `lib/result.ts` para casos de negocio sin lanzar.

## 10. Validación

Zod en `lib/validations`:

- `auth` — login
- `appointment` — reserva pública
- `service`, `professional`, `salon` — formularios admin
- `common` — teléfono, email opcional, CRC, duración

Todo input de cliente se valida en servidor. React Hook Form se usará en formularios largos.

## 11. Variables de entorno

Ver `.env.example`.

| Variable | Uso | ¿Pública? |
| --- | --- | --- |
| `DATABASE_URL` | PostgreSQL | No |
| `NEXTAUTH_SECRET` | Firma de sesión | No |
| `NEXTAUTH_URL` | URL canónica de Auth | No |
| `NEXT_PUBLIC_APP_URL` | SEO, sitemap, enlaces | Sí |

`lib/env.ts` valida el entorno cuando se exige configuración completa.

## 12. Fechas y zona horaria

- Zona de negocio: `America/Costa_Rica` (UTC-6, sin DST).
- Horarios recurrentes: `HH:mm` locales.
- Citas y bloqueos: `DateTime` UTC.
- Presentación: `lib/timezone.ts` (`formatDateCR`, `formatTimeCR`, `formatDateTimeCR`).
- Precios: enteros CRC vía `lib/money.ts`.

## 13. WhatsApp

Esta versión solo genera `wa.me`. `lib/whatsapp/provider.ts` es el contrato para automatizar después. No hay API de Meta ni webhooks.

## 14. Fuera de alcance

Pagos en línea, WhatsApp Business API, multi-salón y SaaS.
