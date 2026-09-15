import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { LogoutButton } from "@/components/admin/logout-button";
import { AuthSessionProvider } from "@/components/admin/session-provider";
import { requireAdminSession } from "@/lib/require-admin";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdminSession();

  return (
    <AuthSessionProvider>
      <div className="flex min-h-full flex-col bg-cream md:flex-row">
        <AdminSidebar userName={session.user.name ?? "Administración"} />
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex justify-end border-b border-border bg-surface/80 px-4 py-3">
            <LogoutButton />
          </div>
          <div className="flex-1">{children}</div>
        </div>
      </div>
    </AuthSessionProvider>
  );
}
