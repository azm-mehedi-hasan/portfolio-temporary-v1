import "server-only";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type ActionResult<T = void> =
  | { ok: true; data?: T; message?: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

/** Public routes affected by each kind of content change. */
const REVALIDATION: Record<string, string[]> = {
  project: ["/", "/projects"],
  post: ["/blog"],
  tech: ["/", "/projects"],
  timeline: ["/resume"],
  gallery: ["/about"],
  page: [],
  settings: [],
  nav: [],
  message: [],
  media: [],
};

export function revalidateFor(entity: string, extraPaths: string[] = []) {
  for (const path of REVALIDATION[entity] ?? []) {
    revalidatePath(path);
  }
  for (const path of extraPaths) {
    revalidatePath(path);
  }
  // Navigation, socials and site settings render inside the shared layout, so
  // every page underneath it has to be rebuilt.
  if (entity === "nav" || entity === "settings") {
    revalidatePath("/", "layout");
  }
}

/**
 * Wraps a mutation with authorization, validation, audit logging and error
 * handling, so individual actions stay declarative.
 *
 * The auth check here is the real one — middleware only handles routing, and a
 * Server Action can be invoked without passing through the matcher.
 */
export function adminAction<Schema extends z.ZodTypeAny, Result>(config: {
  schema: Schema;
  entity: string;
  action: string;
  handler: (input: z.infer<Schema>, adminId: string) => Promise<Result>;
  // These are declared as possibly-async on purpose. In a "use server" module
  // Next's compiler rewrites every function in the file into an async server
  // reference, so even a sync arrow like `(input) => input.title` comes back as
  // a Promise at runtime. Both are awaited below.
  summary?: (input: z.infer<Schema>, result: Result) => string | Promise<string>;
  revalidate?: (
    input: z.infer<Schema>,
    result: Result
  ) => string[] | Promise<string[]>;
  successMessage?: string;
}) {
  return async (raw: unknown): Promise<ActionResult<Result>> => {
    let adminId: string;
    try {
      adminId = (await requireAdmin()).sub;
    } catch {
      return { ok: false, error: "Your session expired. Sign in again." };
    }

    const parsed = config.schema.safeParse(raw);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path.join(".") || "_";
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      return { ok: false, error: parsed.error.issues[0].message, fieldErrors };
    }

    try {
      const result = await config.handler(parsed.data, adminId);

      const summary = (await config.summary?.(parsed.data, result)) ?? "";
      const extraPaths = (await config.revalidate?.(parsed.data, result)) ?? [];

      await prisma.auditLog.create({
        data: {
          adminId,
          action: config.action,
          entity: config.entity,
          summary,
        },
      });

      revalidateFor(config.entity, extraPaths);

      return { ok: true, data: result, message: config.successMessage };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Something went wrong.";
      if (message.includes("Unique constraint")) {
        return { ok: false, error: "That value is already taken." };
      }
      console.error(`[${config.entity}.${config.action}]`, error);
      return { ok: false, error: message };
    }
  };
}

export const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
