import { z } from "zod";
import { ICON_NAMES } from "@/lib/icons";

const id = z.string().min(1);
const slug = z
  .string()
  .min(1, "Slug is required")
  .regex(
    /^[A-Za-z0-9][A-Za-z0-9-_]*$/,
    "Use letters, numbers, dashes and underscores only"
  );

// A URL, or a path served from /public.
const urlOrPath = z
  .string()
  .min(1, "Required")
  .refine(
    (v) => v.startsWith("/") || /^https?:\/\//.test(v),
    "Enter a full URL or a path starting with /"
  );

export const ProjectSchema = z.object({
  id: id.optional(),
  slug,
  title: z.string().min(1, "Title is required").max(120),
  description: z.string().min(1, "Description is required").max(400),
  liveUrl: z.string().min(1, "Live URL is required").url("Enter a valid URL"),
  thumbnailUrl: urlOrPath,
  contentMdx: z.string().default(""),
  status: z.enum(["DRAFT", "PUBLISHED"]),
  techIds: z.array(id).default([]),
  images: z
    .array(z.object({ url: urlOrPath, alt: z.string().default("") }))
    .default([]),
});

export const PostSchema = z.object({
  id: id.optional(),
  slug,
  title: z.string().min(1, "Title is required").max(160),
  description: z.string().min(1, "Description is required").max(400),
  coverImageUrl: urlOrPath,
  contentMdx: z.string().default(""),
  status: z.enum(["DRAFT", "PUBLISHED"]),
  publishedAt: z.string().optional().nullable(),
  tags: z.array(z.string().min(1)).default([]),
});

export const TechSchema = z.object({
  id: id.optional(),
  name: z.string().min(1, "Name is required").max(60),
  logoUrl: z.string().default(""),
  displayWidth: z.string().default("w-16"),
  displayHeight: z.string().default("h-16"),
  showInStack: z.boolean().default(true),
});

export const TimelineSchema = z.object({
  id: id.optional(),
  title: z.string().min(1, "Title is required").max(120),
  dateLabel: z.string().default(""),
  description: z.string().min(1, "Description is required"),
  responsibilities: z.array(z.string().min(1)).default([]),
  visible: z.boolean().default(true),
});

export const GallerySchema = z.object({
  id: id.optional(),
  url: urlOrPath,
  alt: z.string().default(""),
  visible: z.boolean().default(true),
});

export const LinkSchema = z.object({
  id: id.optional(),
  kind: z.enum(["nav", "social"]),
  label: z.string().min(1, "Label is required").max(60),
  href: z.string().min(1, "Link is required"),
  iconName: z.enum(ICON_NAMES as [string, ...string[]]),
  visible: z.boolean().default(true),
});

export const PageSchema = z.object({
  slug: z.string().min(1),
  emoji: z.string().max(8).optional().nullable(),
  heading: z.string().min(1, "Heading is required").max(160),
  introMdx: z.string().default(""),
  bodyMdx: z.string().default(""),
  seoTitle: z.string().min(1, "SEO title is required").max(120),
  seoDescription: z.string().min(1, "SEO description is required").max(320),
});

export const SettingsSchema = z.object({
  ownerName: z.string().min(1, "Name is required").max(80),
  role: z.string().min(1, "Role is required").max(80),
  avatarUrl: urlOrPath,
  footerText: z.string().min(1, "Footer text is required").max(160),
  resumeUrl: z.string().optional().nullable(),
  resumeFileName: z.string().min(1).default("Resume.pdf"),
  ogImageUrl: z.string().optional().nullable(),
  seoTitle: z.string().min(1).max(120),
  seoDescription: z.string().min(1).max(320),
});

export const ReorderSchema = z.object({
  ids: z.array(id).min(1),
});

export const DeleteSchema = z.object({ id });

export const ContactSchema = z.object({
  name: z.string().min(1, "Please tell me your name").max(120),
  email: z.string().email("Enter a valid email address"),
  message: z.string().min(10, "Please write at least 10 characters").max(5000),
  // Bots fill hidden fields; humans leave them empty.
  website: z.string().max(0).optional(),
});

export type ProjectInput = z.infer<typeof ProjectSchema>;
export type PostInput = z.infer<typeof PostSchema>;
export type TechInput = z.infer<typeof TechSchema>;
export type TimelineInput = z.infer<typeof TimelineSchema>;
export type GalleryInput = z.infer<typeof GallerySchema>;
export type LinkInput = z.infer<typeof LinkSchema>;
export type PageInput = z.infer<typeof PageSchema>;
export type SettingsInput = z.infer<typeof SettingsSchema>;
