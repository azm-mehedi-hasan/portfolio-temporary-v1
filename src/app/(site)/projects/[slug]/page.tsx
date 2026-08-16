import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/Container";
import { SingleProduct } from "@/components/Product";
import { getProjectBySlug, getProjectSlugs } from "@/lib/queries";

export const revalidate = 3600;

/** Prerenders every project at build time — this route used to be per-request. */
export async function generateStaticParams() {
  const slugs = await getProjectSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const project = await getProjectBySlug(params.slug);
  if (!project) return { title: "Project not found" };

  return {
    title: project.title,
    description: project.description,
    openGraph: {
      title: project.title,
      description: project.description,
      images: [project.thumbnailUrl],
    },
  };
}

export default async function SingleProjectPage({
  params,
}: {
  params: { slug: string };
}) {
  const project = await getProjectBySlug(params.slug);

  // 404 rather than the old redirect(): an unknown project is a missing page,
  // and a 307 to /projects told search engines the wrong thing.
  if (!project) notFound();

  return (
    <Container>
      <SingleProduct product={project} />
    </Container>
  );
}
