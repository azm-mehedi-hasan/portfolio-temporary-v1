import Link from "next/link";
import { MessageList } from "@/components/admin/MessageList";
import { PageHeader } from "@/components/admin/PageHeader";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: { view?: string };
}) {
  const archived = searchParams.view === "archived";

  const messages = await prisma.contactMessage.findMany({
    where: { isArchived: archived },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const tab = (label: string, href: string, active: boolean) => (
    <Link
      href={href}
      className={`rounded-md px-2.5 py-1 text-xs font-medium ${
        active ? "bg-neutral-900 text-white" : "text-neutral-600 hover:bg-neutral-100"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <>
      <PageHeader
        title="Messages"
        description="Everything sent through your contact form, stored here even if the email fails to send."
        action={
          <div className="flex gap-1 rounded-md bg-neutral-100 p-0.5">
            {tab("Inbox", "/admin/messages", !archived)}
            {tab("Archived", "/admin/messages?view=archived", archived)}
          </div>
        }
      />
      <MessageList
        messages={messages.map((m) => ({
          id: m.id,
          name: m.name,
          email: m.email,
          message: m.message,
          isRead: m.isRead,
          isArchived: m.isArchived,
          createdAt: m.createdAt.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
          }),
        }))}
      />
    </>
  );
}
