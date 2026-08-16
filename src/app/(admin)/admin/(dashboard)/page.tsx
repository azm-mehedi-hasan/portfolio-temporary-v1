import Link from "next/link";
import { PageHeader } from "@/components/admin/PageHeader";
import { Card } from "@/components/admin/ui";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function getStats() {
  const [
    projects,
    draftProjects,
    posts,
    draftPosts,
    tech,
    timeline,
    gallery,
    unread,
    media,
    recentMessages,
    recentActivity,
  ] = await Promise.all([
    prisma.project.count(),
    prisma.project.count({ where: { status: "DRAFT" } }),
    prisma.post.count(),
    prisma.post.count({ where: { status: "DRAFT" } }),
    prisma.tech.count({ where: { showInStack: true } }),
    prisma.timelineEntry.count(),
    prisma.galleryImage.count(),
    prisma.contactMessage.count({ where: { isRead: false, isArchived: false } }),
    prisma.mediaAsset.count(),
    prisma.contactMessage.findMany({
      where: { isArchived: false },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
    prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 6 }),
  ]);

  return {
    projects, draftProjects, posts, draftPosts, tech, timeline,
    gallery, unread, media, recentMessages, recentActivity,
  };
}

function Stat({
  label,
  value,
  sub,
  href,
}: {
  label: string;
  value: number;
  sub?: string;
  href: string;
}) {
  return (
    <Link href={href} className="group">
      <Card className="h-full p-4 transition group-hover:border-neutral-400">
        <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
          {label}
        </p>
        <p className="mt-2 text-2xl font-semibold tabular-nums text-neutral-900">
          {value}
        </p>
        {sub && <p className="mt-0.5 text-xs text-amber-600">{sub}</p>}
      </Card>
    </Link>
  );
}

export default async function AdminDashboard() {
  const s = await getStats();

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Everything on the public site is managed from here. Changes go live within seconds — no deploy required."
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <Stat
          label="Projects"
          value={s.projects}
          sub={s.draftProjects ? `${s.draftProjects} draft` : undefined}
          href="/admin/projects"
        />
        <Stat
          label="Articles"
          value={s.posts}
          sub={s.draftPosts ? `${s.draftPosts} draft` : undefined}
          href="/admin/posts"
        />
        <Stat label="Tech stack" value={s.tech} href="/admin/tech" />
        <Stat label="Timeline" value={s.timeline} href="/admin/timeline" />
        <Stat label="Gallery" value={s.gallery} href="/admin/gallery" />
        <Stat label="Media" value={s.media} href="/admin/media" />
        <Stat
          label="Unread"
          value={s.unread}
          sub={s.unread ? "needs a reply" : undefined}
          href="/admin/messages"
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section>
          <h2 className="mb-3 text-sm font-semibold text-neutral-900">
            Recent messages
          </h2>
          <Card className="divide-y divide-neutral-100">
            {s.recentMessages.length === 0 && (
              <p className="p-4 text-sm text-neutral-500">No messages yet.</p>
            )}
            {s.recentMessages.map((m) => (
              <Link
                key={m.id}
                href="/admin/messages"
                className="block p-3.5 hover:bg-neutral-50"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-medium text-neutral-900">
                    {m.name}
                  </p>
                  {!m.isRead && (
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                  )}
                </div>
                <p className="truncate text-xs text-neutral-500">{m.message}</p>
              </Link>
            ))}
          </Card>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-neutral-900">
            Recent activity
          </h2>
          <Card className="divide-y divide-neutral-100">
            {s.recentActivity.length === 0 && (
              <p className="p-4 text-sm text-neutral-500">
                Edits you make will be logged here.
              </p>
            )}
            {s.recentActivity.map((a) => (
              <div key={a.id} className="flex items-baseline gap-2 p-3.5 text-sm">
                <span className="font-medium text-neutral-900">{a.action}</span>
                <span className="text-neutral-500">{a.entity}</span>
                <span className="ml-auto shrink-0 text-xs tabular-nums text-neutral-400">
                  {a.createdAt.toLocaleDateString("en-GB")}
                </span>
              </div>
            ))}
          </Card>
        </section>
      </div>
    </>
  );
}
