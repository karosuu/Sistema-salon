import { sendDueReminders } from "@/lib/notifications/email";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return Response.json({ ok: false, error: "CRON_SECRET no configurado." }, { status: 501 });
  }

  const header = request.headers.get("authorization");
  if (header !== `Bearer ${secret}`) {
    return Response.json({ ok: false, error: "No autorizado." }, { status: 401 });
  }

  const sent = await sendDueReminders();
  return Response.json({ ok: true, sent });
}
