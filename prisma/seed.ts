import { AppointmentStatus, PrismaClient, Weekday } from "@prisma/client";
import { hash } from "bcryptjs";
import { randomBytes } from "node:crypto";

import { DEMO_SALON } from "../lib/salon/defaults";

const prisma = new PrismaClient();

const DEMO_ADMIN_EMAIL = "demo@pixel-craft.example";
const DEMO_ADMIN_PASSWORD = "DemoAdmin123!";

function crDateTime(localIso: string): Date {
  return new Date(`${localIso}-06:00`);
}

function manageToken(): string {
  return randomBytes(24).toString("hex");
}

const DEMO_SERVICE_IMAGES: Record<string, string> = {
  "Coloración (DEMO)": "/demo/servicios/coloracion.png",
  "Corte y peinado (DEMO)": "/demo/servicios/corte.png",
  "Manicure (DEMO)": "/demo/servicios/manicure.png",
  "Pedicure (DEMO)": "/demo/servicios/pedicure.png",
  "Tratamiento capilar (DEMO)": "/demo/servicios/tratamiento.png",
};

const DEMO_PROFESSIONAL_PHOTOS: Record<string, string> = {
  "Ana Vargas (DEMO)": "/demo/profesionales/ana.png",
  "Luis Mora (DEMO)": "/demo/profesionales/luis.png",
  "Sofía Chen (DEMO)": "/demo/profesionales/sofia.png",
};

async function attachDemoMedia() {
  for (const [name, imageUrl] of Object.entries(DEMO_SERVICE_IMAGES)) {
    await prisma.service.updateMany({ where: { name }, data: { imageUrl } });
  }
  for (const [name, photoUrl] of Object.entries(DEMO_PROFESSIONAL_PHOTOS)) {
    await prisma.professional.updateMany({ where: { name }, data: { photoUrl } });
  }
}

async function main() {
  const existingAppointments = await prisma.appointment.count();
  if (existingAppointments > 0) {
    await attachDemoMedia();
    console.log("Seed omitido: la base ya tiene citas. Imágenes DEMO actualizadas.");
    return;
  }

  const passwordHash = await hash(DEMO_ADMIN_PASSWORD, 12);

  await prisma.salonSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      name: DEMO_SALON.name,
      tagline: DEMO_SALON.tagline,
      phone: DEMO_SALON.phone,
      whatsappNumber: DEMO_SALON.whatsappNumber,
      whatsappMessage: DEMO_SALON.whatsappMessage,
      email: DEMO_SALON.email,
      address: DEMO_SALON.address,
      instagramUrl: DEMO_SALON.instagramUrl,
      facebookUrl: DEMO_SALON.facebookUrl,
      tiktokUrl: DEMO_SALON.tiktokUrl,
      timezone: DEMO_SALON.timezone,
      currency: DEMO_SALON.currency,
    },
  });

  await prisma.adminUser.upsert({
    where: { email: DEMO_ADMIN_EMAIL },
    update: { passwordHash, name: "Admin DEMO" },
    create: {
      email: DEMO_ADMIN_EMAIL,
      name: "Admin DEMO",
      passwordHash,
    },
  });

  await prisma.businessHours.deleteMany();
  const weekdays: Array<{
    weekday: Weekday;
    opensAt: string;
    closesAt: string;
    isClosed: boolean;
  }> = [
    { weekday: "MONDAY", opensAt: "09:00", closesAt: "18:00", isClosed: false },
    { weekday: "TUESDAY", opensAt: "09:00", closesAt: "18:00", isClosed: false },
    { weekday: "WEDNESDAY", opensAt: "09:00", closesAt: "18:00", isClosed: false },
    { weekday: "THURSDAY", opensAt: "09:00", closesAt: "18:00", isClosed: false },
    { weekday: "FRIDAY", opensAt: "09:00", closesAt: "18:00", isClosed: false },
    { weekday: "SATURDAY", opensAt: "09:00", closesAt: "16:00", isClosed: false },
    { weekday: "SUNDAY", opensAt: "09:00", closesAt: "18:00", isClosed: true },
  ];

  await prisma.businessHours.createMany({ data: weekdays });

  const corte = await prisma.service.create({
    data: {
      name: "Corte y peinado (DEMO)",
      description:
        "Servicio de demostración: corte y peinado. Precio y duración de ejemplo.",
      priceCrc: 18000,
      durationMin: 60,
      imageUrl: DEMO_SERVICE_IMAGES["Corte y peinado (DEMO)"],
      isActive: true,
    },
  });

  const color = await prisma.service.create({
    data: {
      name: "Coloración (DEMO)",
      description:
        "Servicio de demostración: coloración completa. Precio y duración de ejemplo.",
      priceCrc: 35000,
      durationMin: 120,
      imageUrl: DEMO_SERVICE_IMAGES["Coloración (DEMO)"],
      isActive: true,
    },
  });

  const manicure = await prisma.service.create({
    data: {
      name: "Manicure (DEMO)",
      description:
        "Servicio de demostración: manicure. Precio y duración de ejemplo.",
      priceCrc: 12000,
      durationMin: 45,
      imageUrl: DEMO_SERVICE_IMAGES["Manicure (DEMO)"],
      isActive: true,
    },
  });

  const pedicure = await prisma.service.create({
    data: {
      name: "Pedicure (DEMO)",
      description:
        "Servicio de demostración: pedicure. Precio y duración de ejemplo.",
      priceCrc: 14000,
      durationMin: 50,
      imageUrl: DEMO_SERVICE_IMAGES["Pedicure (DEMO)"],
      isActive: true,
    },
  });

  const tratamiento = await prisma.service.create({
    data: {
      name: "Tratamiento capilar (DEMO)",
      description:
        "Servicio de demostración: tratamiento capilar. Precio y duración de ejemplo.",
      priceCrc: 22000,
      durationMin: 75,
      imageUrl: DEMO_SERVICE_IMAGES["Tratamiento capilar (DEMO)"],
      isActive: false,
    },
  });

  const weekdayHours = weekdays
    .filter((day) => !day.isClosed)
    .map((day) => ({
      weekday: day.weekday,
      startsAt: day.opensAt,
      endsAt: day.closesAt,
      isOff: false,
    }));

  const ana = await prisma.professional.create({
    data: {
      name: "Ana Vargas (DEMO)",
      bio: "Estilista de demostración. Especialidad ficticia en corte y color.",
      photoUrl: DEMO_PROFESSIONAL_PHOTOS["Ana Vargas (DEMO)"],
      isActive: true,
      services: {
        create: [{ serviceId: corte.id }, { serviceId: color.id }, { serviceId: tratamiento.id }],
      },
      availability: { create: weekdayHours },
    },
  });

  const luis = await prisma.professional.create({
    data: {
      name: "Luis Mora (DEMO)",
      bio: "Estilista de demostración. Especialidad ficticia en coloración.",
      photoUrl: DEMO_PROFESSIONAL_PHOTOS["Luis Mora (DEMO)"],
      isActive: true,
      services: {
        create: [{ serviceId: corte.id }, { serviceId: color.id }],
      },
      availability: { create: weekdayHours },
    },
  });

  const sofia = await prisma.professional.create({
    data: {
      name: "Sofía Chen (DEMO)",
      bio: "Manicurista de demostración. Especialidad ficticia en uñas.",
      photoUrl: DEMO_PROFESSIONAL_PHOTOS["Sofía Chen (DEMO)"],
      isActive: true,
      services: {
        create: [{ serviceId: manicure.id }, { serviceId: pedicure.id }],
      },
      availability: {
        create: weekdayHours.filter((day) => day.weekday !== "SATURDAY"),
      },
    },
  });

  const maria = await prisma.customer.create({
    data: {
      name: "María Soto (DEMO)",
      phone: "50670000001",
      email: "maria.demo@pixel-craft.example",
    },
  });

  const carlos = await prisma.customer.create({
    data: {
      name: "Carlos Jiménez (DEMO)",
      phone: "50670000002",
      email: "carlos.demo@pixel-craft.example",
    },
  });

  const lucia = await prisma.customer.create({
    data: {
      name: "Lucía Rojas (DEMO)",
      phone: "50670000003",
    },
  });

  await prisma.appointment.createMany({
    data: [
      {
        code: "PC-DEMO01",
        customerId: maria.id,
        serviceId: corte.id,
        professionalId: ana.id,
        startsAt: crDateTime("2026-09-14T09:00:00"),
        endsAt: crDateTime("2026-09-14T10:00:00"),
        priceCrc: corte.priceCrc,
        durationMin: corte.durationMin,
        status: AppointmentStatus.COMPLETED,
        completedAt: crDateTime("2026-09-14T10:00:00"),
        confirmedAt: crDateTime("2026-09-13T12:00:00"),
        manageToken: manageToken(),
        notes: "Cita DEMO completada.",
      },
      {
        code: "PC-DEMO02",
        customerId: carlos.id,
        serviceId: color.id,
        professionalId: luis.id,
        startsAt: crDateTime("2026-09-15T14:00:00"),
        endsAt: crDateTime("2026-09-15T16:00:00"),
        priceCrc: color.priceCrc,
        durationMin: color.durationMin,
        status: AppointmentStatus.PENDING,
        manageToken: manageToken(),
        notes: "Cita DEMO pendiente de confirmación.",
      },
      {
        code: "PC-DEMO03",
        customerId: lucia.id,
        serviceId: manicure.id,
        professionalId: sofia.id,
        startsAt: crDateTime("2026-09-16T11:00:00"),
        endsAt: crDateTime("2026-09-16T11:45:00"),
        priceCrc: manicure.priceCrc,
        durationMin: manicure.durationMin,
        status: AppointmentStatus.CONFIRMED,
        confirmedAt: crDateTime("2026-09-15T09:00:00"),
        manageToken: manageToken(),
        notes: "Cita DEMO confirmada.",
      },
      {
        code: "PC-DEMO04",
        customerId: maria.id,
        serviceId: pedicure.id,
        professionalId: sofia.id,
        startsAt: crDateTime("2026-09-17T16:00:00"),
        endsAt: crDateTime("2026-09-17T16:50:00"),
        priceCrc: pedicure.priceCrc,
        durationMin: pedicure.durationMin,
        status: AppointmentStatus.CANCELLED,
        cancelledAt: crDateTime("2026-09-16T10:00:00"),
        manageToken: manageToken(),
        notes: "Cita DEMO cancelada. No debe bloquear el horario.",
      },
    ],
  });

  await prisma.blockedTime.create({
    data: {
      professionalId: null,
      startsAt: crDateTime("2026-09-19T00:00:00"),
      endsAt: crDateTime("2026-09-20T00:00:00"),
      reason: "Cierre DEMO — feriado de ejemplo",
      isHoliday: true,
    },
  });

  await prisma.customer.update({
    where: { id: maria.id },
    data: {
      notes: "Cliente DEMO con historial de corte.",
      preferences: "Prefiere citas por la mañana (DEMO).",
    },
  });

  await prisma.sale.create({
    data: {
      customerId: maria.id,
      amountCrc: 4500,
      description: "Producto DEMO — serum capilar",
      occurredAt: crDateTime("2026-09-14T10:15:00"),
    },
  });

  console.log("Seed DEMO aplicado.");
  console.log(`Admin: ${DEMO_ADMIN_EMAIL}`);
  console.log(`Contraseña: ${DEMO_ADMIN_PASSWORD}`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
