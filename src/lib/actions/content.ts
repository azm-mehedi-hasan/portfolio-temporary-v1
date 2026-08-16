"use server";

import readingTime from "reading-time";
import { z } from "zod";
import { adminAction, slugify } from "@/lib/actions/helpers";
import { validateMdx } from "@/lib/mdx";
import { prisma } from "@/lib/prisma";
import {
  DeleteSchema,
  GallerySchema,
  LinkSchema,
  PageSchema,
  PostSchema,
  ProjectSchema,
  ReorderSchema,
  SettingsSchema,
  TechSchema,
  TimelineSchema,
} from "@/lib/validation";

// ─────────────────────────────────────────────────────────── projects

export const saveProject = adminAction({
  schema: ProjectSchema,
  entity: "project",
  action: "save",
  successMessage: "Project saved",
  summary: (input) => input.title,
  revalidate: (input) => [`/projects/${input.slug}`],
  handler: async ({ id, techIds, images, ...data }) => {
    // Reject unparseable MDX here rather than letting it break the public page.
    const check = await validateMdx(data.contentMdx);
    if (!check.ok) throw new Error(`Case study MDX: ${check.error}`);

    const project = id
      ? await prisma.project.update({ where: { id }, data })
      : await prisma.project.create({
          data: {
            ...data,
            order: await prisma.project.count(),
          },
        });

    await prisma.projectTech.deleteMany({ where: { projectId: project.id } });
    if (techIds.length) {
      await prisma.projectTech.createMany({
        data: techIds.map((techId, order) => ({
          projectId: project.id,
          techId,
          order,
        })),
      });
    }

    await prisma.projectImage.deleteMany({ where: { projectId: project.id } });
    if (images.length) {
      await prisma.projectImage.createMany({
        data: images.map((image, order) => ({
          projectId: project.id,
          url: image.url,
          alt: image.alt,
          order,
        })),
      });
    }

    return { id: project.id, slug: project.slug };
  },
});

export const deleteProject = adminAction({
  schema: DeleteSchema,
  entity: "project",
  action: "delete",
  successMessage: "Project deleted",
  handler: async ({ id }) => {
    const project = await prisma.project.delete({ where: { id } });
    return { slug: project.slug };
  },
  revalidate: (_input, result) => [`/projects/${result.slug}`],
});

export const reorderProjects = adminAction({
  schema: ReorderSchema,
  entity: "project",
  action: "reorder",
  handler: async ({ ids }) => {
    await prisma.$transaction(
      ids.map((id, order) =>
        prisma.project.update({ where: { id }, data: { order } })
      )
    );
  },
});

// ────────────────────────────────────────────────────────────── posts

export const savePost = adminAction({
  schema: PostSchema,
  entity: "post",
  action: "save",
  successMessage: "Article saved",
  summary: (input) => input.title,
  revalidate: (input) => [`/blog/${input.slug}`],
  handler: async ({ id, tags, publishedAt, contentMdx, ...data }) => {
    const check = await validateMdx(contentMdx);
    if (!check.ok) throw new Error(`Article MDX: ${check.error}`);

    const stats = readingTime(contentMdx || "");
    const payload = {
      ...data,
      contentMdx,
      readingMinutes: Math.max(1, Math.round(stats.minutes)),
      publishedAt:
        data.status === "PUBLISHED"
          ? publishedAt
            ? new Date(publishedAt)
            : new Date()
          : publishedAt
          ? new Date(publishedAt)
          : null,
    };

    const post = id
      ? await prisma.post.update({ where: { id }, data: payload })
      : await prisma.post.create({ data: payload });

    await prisma.postTag.deleteMany({ where: { postId: post.id } });
    for (const name of tags) {
      const tag = await prisma.tag.upsert({
        where: { slug: slugify(name) },
        update: {},
        create: { name, slug: slugify(name) },
      });
      await prisma.postTag.create({ data: { postId: post.id, tagId: tag.id } });
    }

    return { id: post.id, slug: post.slug };
  },
});

export const deletePost = adminAction({
  schema: DeleteSchema,
  entity: "post",
  action: "delete",
  successMessage: "Article deleted",
  handler: async ({ id }) => {
    const post = await prisma.post.delete({ where: { id } });
    return { slug: post.slug };
  },
  revalidate: (_input, result) => [`/blog/${result.slug}`],
});

// ─────────────────────────────────────────────────────────────── tech

export const saveTech = adminAction({
  schema: TechSchema,
  entity: "tech",
  action: "save",
  successMessage: "Tech saved",
  summary: (input) => input.name,
  handler: async ({ id, ...data }) => {
    if (id) return prisma.tech.update({ where: { id }, data });
    return prisma.tech.create({
      data: { ...data, order: await prisma.tech.count() },
    });
  },
});

export const deleteTech = adminAction({
  schema: DeleteSchema,
  entity: "tech",
  action: "delete",
  successMessage: "Tech deleted",
  handler: async ({ id }) => {
    await prisma.tech.delete({ where: { id } });
  },
});

export const reorderTech = adminAction({
  schema: ReorderSchema,
  entity: "tech",
  action: "reorder",
  handler: async ({ ids }) => {
    await prisma.$transaction(
      ids.map((id, order) => prisma.tech.update({ where: { id }, data: { order } }))
    );
  },
});

// ─────────────────────────────────────────────────────────── timeline

export const saveTimeline = adminAction({
  schema: TimelineSchema,
  entity: "timeline",
  action: "save",
  successMessage: "Entry saved",
  summary: (input) => input.title,
  handler: async ({ id, ...data }) => {
    if (id) return prisma.timelineEntry.update({ where: { id }, data });
    return prisma.timelineEntry.create({
      data: { ...data, order: await prisma.timelineEntry.count() },
    });
  },
});

export const deleteTimeline = adminAction({
  schema: DeleteSchema,
  entity: "timeline",
  action: "delete",
  successMessage: "Entry deleted",
  handler: async ({ id }) => {
    await prisma.timelineEntry.delete({ where: { id } });
  },
});

export const reorderTimeline = adminAction({
  schema: ReorderSchema,
  entity: "timeline",
  action: "reorder",
  handler: async ({ ids }) => {
    await prisma.$transaction(
      ids.map((id, order) =>
        prisma.timelineEntry.update({ where: { id }, data: { order } })
      )
    );
  },
});

// ──────────────────────────────────────────────────────────── gallery

export const saveGalleryImage = adminAction({
  schema: GallerySchema,
  entity: "gallery",
  action: "save",
  successMessage: "Image saved",
  handler: async ({ id, ...data }) => {
    if (id) return prisma.galleryImage.update({ where: { id }, data });
    return prisma.galleryImage.create({
      data: { ...data, order: await prisma.galleryImage.count() },
    });
  },
});

export const deleteGalleryImage = adminAction({
  schema: DeleteSchema,
  entity: "gallery",
  action: "delete",
  successMessage: "Image removed",
  handler: async ({ id }) => {
    await prisma.galleryImage.delete({ where: { id } });
  },
});

export const reorderGallery = adminAction({
  schema: ReorderSchema,
  entity: "gallery",
  action: "reorder",
  handler: async ({ ids }) => {
    await prisma.$transaction(
      ids.map((id, order) =>
        prisma.galleryImage.update({ where: { id }, data: { order } })
      )
    );
  },
});

// ───────────────────────────────────────────────── navigation & socials

// Nav links and socials have identical shapes but separate tables. They get
// separate actions rather than a `kind` discriminator so that a Server
// Component can pass the action reference straight to a Client Component —
// wrapping one in an inline arrow would make it an ordinary function, which
// cannot cross the server/client boundary.
const LinkFields = LinkSchema.omit({ kind: true });

export const saveNavLink = adminAction({
  schema: LinkFields,
  entity: "nav",
  action: "save",
  successMessage: "Link saved",
  summary: (input) => `nav: ${input.label}`,
  handler: async ({ id, ...data }) => {
    if (id) return prisma.navLink.update({ where: { id }, data });
    return prisma.navLink.create({
      data: { ...data, order: await prisma.navLink.count() },
    });
  },
});

export const deleteNavLink = adminAction({
  schema: DeleteSchema,
  entity: "nav",
  action: "delete",
  successMessage: "Link deleted",
  handler: async ({ id }) => {
    await prisma.navLink.delete({ where: { id } });
  },
});

export const reorderNavLinks = adminAction({
  schema: ReorderSchema,
  entity: "nav",
  action: "reorder",
  handler: async ({ ids }) => {
    await prisma.$transaction(
      ids.map((id, order) =>
        prisma.navLink.update({ where: { id }, data: { order } })
      )
    );
  },
});

export const saveSocial = adminAction({
  schema: LinkFields,
  entity: "nav",
  action: "save",
  successMessage: "Link saved",
  summary: (input) => `social: ${input.label}`,
  handler: async ({ id, ...data }) => {
    if (id) return prisma.social.update({ where: { id }, data });
    return prisma.social.create({
      data: { ...data, order: await prisma.social.count() },
    });
  },
});

export const deleteSocial = adminAction({
  schema: DeleteSchema,
  entity: "nav",
  action: "delete",
  successMessage: "Link deleted",
  handler: async ({ id }) => {
    await prisma.social.delete({ where: { id } });
  },
});

export const reorderSocials = adminAction({
  schema: ReorderSchema,
  entity: "nav",
  action: "reorder",
  handler: async ({ ids }) => {
    await prisma.$transaction(
      ids.map((id, order) =>
        prisma.social.update({ where: { id }, data: { order } })
      )
    );
  },
});

// ─────────────────────────────────────────────────── pages & settings

export const savePage = adminAction({
  schema: PageSchema,
  entity: "page",
  action: "save",
  successMessage: "Page saved",
  summary: (input) => input.slug,
  revalidate: (input) => [input.slug === "home" ? "/" : `/${input.slug}`],
  handler: async ({ slug, ...data }) => {
    return prisma.page.update({ where: { slug }, data });
  },
});

export const saveSettings = adminAction({
  schema: SettingsSchema,
  entity: "settings",
  action: "save",
  successMessage: "Settings saved",
  handler: async (data) => {
    return prisma.siteSettings.update({ where: { id: "singleton" }, data });
  },
});
