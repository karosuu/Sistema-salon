# Pixel-Craft — Web y citas de salón

Sistema para **un solo salón** de belleza en Costa Rica: sitio público + panel de gestión de citas.

- Idioma: español
- Zona horaria: `America/Costa_Rica`
- Moneda: CRC (₡)
- Sin pagos en línea ni WhatsApp automatizado en esta versión

## Requisitos

- Node.js 20.9 o superior
- Docker (PostgreSQL 16 del `docker-compose.yml`) o PostgreSQL 14+

## Arranque

```bash
cp .env.example .env
```

Generá un secreto:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Pegalo en `NEXTAUTH_SECRET` dentro de `.env`. `DATABASE_URL` apunta a `localhost:5433` por defecto.

```bash
docker compose up -d
npm install
npm run db:migrate:deploy
npm run db:seed
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000).

### Admin DEMO

- Correo: `demo@pixel-craft.example`
- Contraseña: `DemoAdmin123!`

El panel está en `/admin`.

## Scripts

| Comando | Uso |
| --- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm run lint` | ESLint |
| `npm run test` | Vitest |
| `npm run build` | Build de producción |
| `npm run db:generate` | Cliente Prisma |
| `npm run db:migrate` | Migraciones en desarrollo |
| `npm run db:migrate:deploy` | Aplicar migraciones |
| `npm run db:seed` | Datos DEMO |
| `npm run db:studio` | Prisma Studio |
| `npm run db:reset` | Recrea la base y vuelve a sembrar |

## Documentación

- [Arquitectura](docs/ARQUITECTURA.md)
- [Reglas de desarrollo](docs/DESARROLLO.md)
- [Server Actions](actions/README.md)

## Estado actual

**Etapas 6–10 del documento técnico:** motor de disponibilidad, flujo de reserva, CRM, correo transaccional y QA.

El panel DEMO sigue en `/admin`. Las reservas públicas están en `/reservar`.
