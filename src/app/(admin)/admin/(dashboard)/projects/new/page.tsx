import { PageHeader } from "@/components/admin/PageHeader";
import { ProjectForm } from "@/components/admin/ProjectForm";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function NewProjectPage() {
  const techOptions = await prisma.tech.findMany({ orderBy: { name: "asc" } });

  return (
    <>
      <PageHeader title="New project" description="It stays a draft until you publish it." />
      <ProjectForm
        techOptions={techOptions.map((t) => ({ id: t.id, name: t.name }))}
        initial={{
          slug: "",
          title: "",
          description: "",
          liveUrl: "",
          thumbnailUrl: "",
          contentMdx: "",
          status: "DRAFT",
          techIds: [],
          images: [],
        }}
      />
    </>
  );
}
