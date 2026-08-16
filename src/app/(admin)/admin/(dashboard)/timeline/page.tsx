import { CollectionEditor } from "@/components/admin/CollectionEditor";
import { PageHeader } from "@/components/admin/PageHeader";
import { deleteTimeline, reorderTimeline, saveTimeline } from "@/lib/actions/content";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function TimelinePage() {
  const entries = await prisma.timelineEntry.findMany({ orderBy: { order: "asc" } });

  return (
    <>
      <PageHeader
        title="Timeline"
        description="The entries shown on your resume page."
      />
      <CollectionEditor
        items={entries}
        primaryKey="title"
        secondaryKey="description"
        addLabel="Add entry"
        emptyTitle="No timeline entries"
        emptyDescription="Add education, roles, projects or certifications."
        defaults={{ visible: true }}
        fields={[
          { name: "title", label: "Title", type: "text", placeholder: "Education" },
          { name: "dateLabel", label: "Date", type: "text", placeholder: "2018 - 2024" },
          { name: "description", label: "Description", type: "text", full: true },
          {
            name: "responsibilities",
            label: "Bullet points",
            type: "lines",
            hint: "One per line.",
          },
          { name: "visible", label: "Visible on the site", type: "checkbox" },
        ]}
        onSave={saveTimeline}
        onDelete={deleteTimeline}
        onReorder={reorderTimeline}
      />
    </>
  );
}
