import { redirect } from "next/navigation";
import { AdminNav } from "@/components/admin/AdminNav";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  // Middleware already redirects, but a layout must never render admin chrome
  // on the strength of that alone.
  if (!session) redirect("/admin/login");

  const unreadCount = await prisma.contactMessage.count({
    where: { isRead: false, isArchived: false },
  });

  return (
    <div className="flex min-h-screen">
      <AdminNav
        name={session.name || "Admin"}
        email={session.email}
        unreadCount={unreadCount}
      />
      <main className="min-w-0 flex-1 px-5 py-8 lg:px-10">
        <div className="mx-auto w-full max-w-5xl">{children}</div>
      </main>
    </div>
  );
}
