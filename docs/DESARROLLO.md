# Reglas de desarrollo

## Idioma, zona y moneda

- Textos visibles en **español**.
- Zona horaria de negocio: `America/Costa_Rica`.
- Precios visibles en **CRC / ₡**.
- No inventar datos reales del salón. Usar placeholders DEMO.
- Logo DEMO en `/public/logo.svg` y `/public/logo-mark.svg`. Reemplazar esos archivos para usar el logo del cliente; no envolverlo en cajas negras.

## Código

- TypeScript estricto. No usar `any` salvo justificación puntual.
- No hardcodear nombre, teléfono, horarios o precios en componentes sueltos.
- No duplicar lógica de disponibilidad, autenticación ni formato de dinero.
- Validar con Zod todo dato que venga del cliente.
- La autorización se comprueba en server actions y consultas, no solo en el proxy.

## Rutas

- Públicas: sin autenticación.
- `/admin/*` excepto `/admin/iniciar-sesion`: solo administradores.
- No exponer endpoints admin sin sesión.

## Base de datos

- Un solo salón. No añadir `tenantId`.
- Preferir desactivar un servicio o profesional antes de borrarlo si tiene citas.
- Las migraciones se crean con Prisma, no a mano, salvo SQL extra documentado (por ejemplo exclusión de solapes).
- PostgreSQL local: `docker compose up -d` (puerto **5433** para no chocar con otras instancias en 5432).
- Luego: `npm run db:migrate:deploy` y `npm run db:seed`.

## Comandos

```bash
npm run dev
npm run lint
npm run typecheck
npm run db:generate
```

Tras cada etapa: lint, typecheck y corrección de errores antes de seguir.

## Seguridad básica

- Nunca commitear `.env`.
- Nunca enviar `NEXTAUTH_SECRET` ni `DATABASE_URL` al cliente.
- Rate limiting del formulario de reservas se añadirá en la etapa de seguridad.
