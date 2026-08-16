import { CollectionEditor } from "@/components/admin/CollectionEditor";
import { PageHeader } from "@/components/admin/PageHeader";
import { deleteTech, reorderTech, saveTech } from "@/lib/actions/content";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function TechPage() {
  const tech = await prisma.tech.findMany({ orderBy: { order: "asc" } });

  return (
    <>
      <PageHeader
        title="Tech stack"
        description="Logos shown on the home page, and the chips attached to projects. Anything with “Show in stack” unticked can still tag a project without appearing in the grid."
      />
      <CollectionEditor
        items={tech}
        primaryKey="name"
        secondaryKey="logoUrl"
        imageKey="logoUrl"
        addLabel="Add technology"
        emptyTitle="No technologies yet"
        emptyDescription="Add the tools you want shown on the home page."
        defaults={{ displayWidth: "w-16", displayHeight: "h-16", showInStack: true }}
        fields={[
          { name: "name", label: "Name", type: "text", placeholder: "React.js" },
          { name: "logoUrl", label: "Logo URL", type: "text", placeholder: "/images/logos/react.png", full: true },
          { name: "displayWidth", label: "Width class", type: "text", hint: "Tailwind width, e.g. w-16" },
          { name: "displayHeight", label: "Height class", type: "text", hint: "Tailwind height, e.g. h-16" },
          { name: "showInStack", label: "Show in the tech stack grid", type: "checkbox" },
        ]}
        onSave={saveTech}
        onDelete={deleteTech}
        onReorder={reorderTech}
      />
    </>
  );
}
