import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/prisma";

/**
 * Read side of the CMS. Every public page goes through here.
 *
 * `cache()` dedupes calls within a single render pass (the layout and a page
 * both asking for site settings hit the database once). Cross-request caching
 * is handled by ISR on the pages themselves — see `revalidate` exports and the
 * `revalidatePath` calls in src/lib/actions/*.
 */

export const getSettings = cache(async () => {
  const settings = await prisma.siteSettings.findUnique({
    where: { id: "singleton" },
  });
  if (!settings) {
    throw new Error(
      "SiteSettings row is missing. Run `npm run db:seed` to create it."
    );
  }
  return settings;
});

export const getPage = cache(async (slug: string) => {
  return prisma.page.findUnique({ where: { slug } });
});

export const getNavLinks = cache(async () => {
  return prisma.navLink.findMany({
    where: { visible: true },
    orderBy: { order: "asc" },
  });
});

export const getSocials = cache(async () => {
  return prisma.social.findMany({
    where: { visible: true },
    orderBy: { order: "asc" },
  });
});

export const getTechStack = cache(async () => {
  return prisma.tech.findMany({
    where: { showInStack: true },
    orderBy: { order: "asc" },
  });
});

export const getTimeline = cache(async () => {
  return prisma.timelineEntry.findMany({
    where: { visible: true },
    orderBy: { order: "asc" },
  });
});

export const getGallery = cache(async () => {
  return prisma.galleryImage.findMany({
    where: { visible: true },
    orderBy: { order: "asc" },
  });
});

export const getProjects = cache(async () => {
  return prisma.project.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { order: "asc" },
    include: {
      images: { orderBy: { order: "asc" } },
      stack: { orderBy: { order: "asc" }, include: { tech: true } },
    },
  });
});

export const getProjectBySlug = cache(async (slug: string) => {
  return prisma.project.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: {
      images: { orderBy: { order: "asc" } },
      stack: { orderBy: { order: "asc" }, include: { tech: true } },
    },
  });
});

export const getProjectSlugs = cache(async () => {
  const rows = await prisma.project.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true },
  });
  return rows.map((r) => r.slug);
});

export const getPosts = cache(async () => {
  return prisma.post.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    include: { tags: { include: { tag: true } } },
  });
});

export const getPostBySlug = cache(async (slug: string) => {
  return prisma.post.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: { tags: { include: { tag: true } } },
  });
});

export const getPostSlugs = cache(async () => {
  const rows = await prisma.post.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true },
  });
  return rows.map((r) => r.slug);
});

export type ProjectWithRelations = Awaited<ReturnType<typeof getProjects>>[number];
export type PostWithTags = Awaited<ReturnType<typeof getPosts>>[number];
