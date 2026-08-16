"use server";

import { z } from "zod";
import { adminAction } from "@/lib/actions/helpers";
import { requireAdmin } from "@/lib/auth";
import { destroyAsset, isCloudinaryConfigured } from "@/lib/cloudinary";
import { prisma } from "@/lib/prisma";

export async function listMedia(query?: string) {
  await requireAdmin();
  return prisma.mediaAsset.findMany({
    where: query
      ? {
          OR: [
            { publicId: { contains: query, mode: "insensitive" } },
            { alt: { contains: query, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}

export async function mediaEnabled() {
  await requireAdmin();
  return isCloudinaryConfigured();
}

const AssetSchema = z.object({
  publicId: z.string().min(1),
  url: z.string().url(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  format: z.string().min(1),
  bytes: z.number().int().nonnegative(),
  folder: z.string().default("portfolio"),
  alt: z.string().default(""),
});

/** Called by the uploader once Cloudinary confirms the upload. */
export const registerMediaAsset = adminAction({
  schema: AssetSchema,
  entity: "media",
  action: "upload",
  successMessage: "Uploaded",
  summary: (input) => input.publicId,
  handler: async (data) => {
    return prisma.mediaAsset.upsert({
      where: { publicId: data.publicId },
      update: data,
      create: data,
    });
  },
});

export const updateMediaAlt = adminAction({
  schema: z.object({ id: z.string().min(1), alt: z.string().max(300) }),
  entity: "media",
  action: "update",
  successMessage: "Saved",
  handler: async ({ id, alt }) => {
    return prisma.mediaAsset.update({ where: { id }, data: { alt } });
  },
});

export const deleteMediaAsset = adminAction({
  schema: z.object({ id: z.string().min(1) }),
  entity: "media",
  action: "delete",
  successMessage: "Deleted",
  handler: async ({ id }) => {
    const asset = await prisma.mediaAsset.delete({ where: { id } });
    // Remove from Cloudinary too, so the library and the CDN stay in sync.
    await destroyAsset(asset.publicId);
  },
});
