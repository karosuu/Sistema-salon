"use client";

import { useState } from "react";

import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { FieldHint, Input, Label, Select, Textarea } from "@/components/ui/field";
import { Skeleton, Spinner } from "@/components/ui/loading";
import { Modal } from "@/components/ui/modal";
import { PageHeader } from "@/components/ui/page-header";
import { Table, TBody, Td, Th, THead } from "@/components/ui/table";

export function DesignShowcase() {
  const [open, setOpen] = useState(false);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-10 px-4 pb-20 sm:px-6">
      <PageHeader
        eyebrow="Identidad visual"
        title="Sistema de diseño DEMO"
        description="Paleta, tipografía y componentes para el salón. El logo es de demostración y se usa sobre fondo claro, sin caja negra."
      />

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { name: "Azul oscuro", className: "bg-navy" },
          { name: "Cyan", className: "bg-cyan" },
          { name: "Violeta", className: "bg-violet" },
          { name: "Magenta", className: "bg-magenta" },
        ].map((color) => (
          <Card key={color.name} className="p-4">
            <div className={cnSwatch(color.className)} />
            <p className="mt-3 text-sm font-semibold text-navy">{color.name}</p>
          </Card>
        ))}
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Botones y badges</CardTitle>
        </CardHeader>
        <div className="flex flex-wrap gap-3">
          <Button>Primario</Button>
          <Button variant="secondary">Secundario</Button>
          <Button variant="accent">Acento</Button>
          <Button variant="ghost">Fantasma</Button>
          <Button variant="whatsapp">WhatsApp</Button>
          <Button variant="danger">Peligro</Button>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <Badge>Navy</Badge>
          <Badge tone="cyan">Cyan</Badge>
          <Badge tone="violet">Violeta</Badge>
          <Badge tone="magenta">Magenta</Badge>
          <Badge tone="success">Confirmada</Badge>
          <Badge tone="danger">Cancelada</Badge>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Formulario</CardTitle>
        </CardHeader>
        <form className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="demo-nombre">Nombre</Label>
            <Input id="demo-nombre" name="nombre" placeholder="Nombre de demostración" />
          </div>
          <div>
            <Label htmlFor="demo-servicio">Servicio</Label>
            <Select id="demo-servicio" name="servicio" defaultValue="corte">
              <option value="corte">Corte y peinado (DEMO)</option>
              <option value="color">Coloración (DEMO)</option>
            </Select>
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="demo-notas">Notas</Label>
            <Textarea id="demo-notas" name="notas" placeholder="Notas opcionales" />
            <FieldHint>Los datos de este formulario no se envían.</FieldHint>
          </div>
        </form>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tabla</CardTitle>
        </CardHeader>
        <Table>
          <THead>
            <tr>
              <Th>Cliente</Th>
              <Th>Servicio</Th>
              <Th>Estado</Th>
            </tr>
          </THead>
          <TBody>
            <tr>
              <Td>María Soto (DEMO)</Td>
              <Td>Corte y peinado</Td>
              <Td>
                <Badge tone="success">Completada</Badge>
              </Td>
            </tr>
            <tr>
              <Td>Carlos Jiménez (DEMO)</Td>
              <Td>Coloración</Td>
              <Td>
                <Badge tone="violet">Pendiente</Badge>
              </Td>
            </tr>
          </TBody>
        </Table>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Alert tone="success" title="Reserva confirmada">
          Tu cita DEMO quedó registrada. Te esperamos en el salón.
        </Alert>
        <Alert tone="error" title="Horario no disponible">
          Otro cliente tomó este horario. Elegí otra hora.
        </Alert>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Carga y modal</CardTitle>
        </CardHeader>
        <div className="flex flex-col gap-4">
          <Spinner />
          <Skeleton className="h-10 w-full" />
          <Button type="button" variant="secondary" onClick={() => setOpen(true)}>
            Abrir modal
          </Button>
        </div>
      </Card>

      <EmptyState
        title="Todavía no hay citas"
        description="Cuando existan reservas, aparecerán aquí. Este es un estado vacío de demostración."
        actionHref="/reservar"
        actionLabel="Reservar cita"
      />

      <Modal open={open} title="Detalle de cita DEMO" onClose={() => setOpen(false)}>
        <p className="text-sm leading-relaxed text-muted">
          Los modales se usan para confirmar cancelaciones, ver detalle o completar
          un formulario corto sin salir de la página.
        </p>
      </Modal>
    </div>
  );
}

function cnSwatch(className: string) {
  return `h-16 rounded-[var(--radius-md)] ${className}`;
}
