import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { BlockedTimeForm, DeleteBlockedTimeButton } from "@/components/admin/blocked-time-form";
import { BusinessHoursForm } from "@/components/admin/business-hours-form";
import { Card } from "@/components/ui/card";
import { Table, TBody, Td, Th, THead } from "@/components/ui/table";
import { listAdminProfessionals, listBlockedTimes, listBusinessHours } from "@/lib/data";
import { formatDateTimeCR, utcToCostaRicaYmd } from "@/lib/timezone";

export default async function AdminHoursPage() {
  const [hours, blocked, professionals] = await Promise.all([
    listBusinessHours(),
    listBlockedTimes(),
    listAdminProfessionals(),
  ]);

  return (
    <div className="px-4 py-6 sm:px-6">
      <AdminPageHeader
        eyebrow="Agenda"
        title="Horarios y bloqueos"
        description="El motor de disponibilidad cruza horario del salón, horario del profesional, bloqueos y citas activas. Zona America/Costa_Rica."
      />
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="font-display mb-4 text-2xl text-navy">Horario del salón</h2>
          <BusinessHoursForm defaults={hours} />
        </Card>
        <Card>
          <h2 className="font-display mb-4 text-2xl text-navy">Bloqueos y feriados</h2>
          <BlockedTimeForm
            professionals={professionals.map((item) => ({ id: item.id, name: item.name }))}
            todayYmd={utcToCostaRicaYmd(new Date())}
          />
        </Card>
      </div>
      <div className="mt-8">
        <Table>
          <THead>
            <tr>
              <Th>Desde</Th>
              <Th>Hasta</Th>
              <Th>Ámbito</Th>
              <Th>Motivo</Th>
              <Th>Acciones</Th>
            </tr>
          </THead>
          <TBody>
            {blocked.map((item) => (
              <tr key={item.id}>
                <Td>{formatDateTimeCR(item.startsAt)}</Td>
                <Td>{formatDateTimeCR(item.endsAt)}</Td>
                <Td>{item.professionalName ?? "Todo el salón"}</Td>
                <Td>{item.reason ?? (item.isHoliday ? "Feriado" : "—")}</Td>
                <Td>
                  <DeleteBlockedTimeButton id={item.id} />
                </Td>
              </tr>
            ))}
          </TBody>
        </Table>
      </div>
    </div>
  );
}
