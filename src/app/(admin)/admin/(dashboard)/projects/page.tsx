import Link from "next/link";
import { PageHeader } from "@/components/admin/PageHeader";
import { ProjectList } from "@/components/admin/ProjectList";
import { Button, EmptyState } from "@/components/admin/ui";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const projects = await prisma.project.findMany({
    orderBy: { order: "asc" },
    include: { stack: { include: { tech: true } }, images: true },
  });

  return (
    <>
      <PageHeader
        title="Projects"
        description="Case studies shown on the home page and /projects. Drag to reorder."
        action={
          <Link href="/admin/projects/new">
            <Button>New project</Button>
          </Link>
        }
      />

      {projects.length === 0 ? (
        <EmptyState
          title="No projects yet"
          description="Add your first project to show it on the home page."
          action={
            <Link href="/admin/projects/new">
              <Button>New project</Button>
            </Link>
          }
        />
      ) : (
        <ProjectList
          projects={projects.map((p) => ({
            id: p.id,
            slug: p.slug,
            title: p.title,
            description: p.description,
            thumbnailUrl: p.thumbnailUrl,
            status: p.status,
            techCount: p.stack.length,
            imageCount: p.images.length,
          }))}
        />
      )}
    </>
  );
}
