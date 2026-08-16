"use server";

import { Mdx } from "@/components/Mdx";
import { requireAdmin } from "@/lib/auth";
import { validateMdx } from "@/lib/mdx";

/**
 * Renders MDX through the *same* component used in production, so the editor
 * preview can never drift from what visitors will see.
 *
 * Server Actions can return React elements, so the rendered tree is streamed to
 * the client without pulling the MDX pipeline into the browser bundle.
 */
export async function renderMdxPreview(source: string) {
  await requireAdmin();

  // Compile first: MDXRemote throws during render, which would escape a
  // try/catch here and surface as a server error instead of a helpful message.
  const check = await validateMdx(source);
  if (!check.ok) {
    return { ok: false as const, error: check.error };
  }

  return {
    ok: true as const,
    node: (
      <div className="prose prose-sm max-w-none prose-headings:text-neutral-900 prose-p:text-neutral-600">
        <Mdx source={source} />
      </div>
    ),
  };
}
