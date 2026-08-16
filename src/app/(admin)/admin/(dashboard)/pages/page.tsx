import { PageCopyForm } from "@/components/admin/PageCopyForm";
import { PageHeader } from "@/components/admin/PageHeader";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const ORDER = ["home", "about", "projects", "blog", "contact", "resume"];

export default async function PagesPage() {
  const pages = await prisma.page.findMany();
  const sorted = [...pages].sort(
    (a, b) => ORDER.indexOf(a.slug) - ORDER.indexOf(b.slug)
  );

  return (
    <>
      <PageHeader
        title="Page copy"
        description="Headings, intro text and search metadata for each public page."
      />
      <div className="flex flex-col gap-5">
        {sorted.map((page) => (
          <PageCopyForm
            key={page.slug}
            page={{
              slug: page.slug,
              emoji: page.emoji ?? "",
              heading: page.heading,
              introMdx: page.introMdx,
              bodyMdx: page.bodyMdx,
              seoTitle: page.seoTitle,
              seoDescription: page.seoDescription,
            }}
          />
        ))}
      </div>
    </>
  );
}
