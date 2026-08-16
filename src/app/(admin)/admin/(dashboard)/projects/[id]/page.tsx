import { notFound } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/admin/PageHeader";
import { ProjectForm } from "@/components/admin/ProjectForm";
import { Button } from "@/components/admin/ui";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function EditProjectPage({
  params,
}: {
  params: { id: string };
}) {
  const [project, techOptions] = await Promise.all([
    prisma.project.findUnique({
      where: { id: params.id },
      include: {
        images: { orderBy: { order: "asc" } },
        stack: { orderBy: { order: "asc" } },
      },
    }),
    prisma.tech.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!project) notFound();

  return (
    <>
      <PageHeader
        title={project.title}
        description={`/projects/${project.slug}`}
        action={
          <Link href={`/projects/${project.slug}`} target="_blank">
            <Button variant="secondary">View live</Button>
          </Link>
        }
      />
      <ProjectForm
        techOptions={techOptions.map((t) => ({ id: t.id, name: t.name }))}
        initial={{
          id: project.id,
          slug: project.slug,
          title: project.title,
          description: project.description,
          liveUrl: project.liveUrl,
          thumbnailUrl: project.thumbnailUrl,
          contentMdx: project.contentMdx,
          status: project.status,
          techIds: project.stack.map((s) => s.techId),
          images: project.images.map((i) => ({ url: i.url, alt: i.alt })),
        }}
      />
    </>
  );
}
