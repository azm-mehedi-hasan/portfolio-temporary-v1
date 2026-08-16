import "server-only";
import rehypePrism from "@mapbox/rehype-prism";
import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";

export const mdxOptions = {
  remarkPlugins: [remarkGfm],
  rehypePlugins: [rehypePrism],
} as const;

/**
 * Compiles MDX purely to surface syntax errors.
 *
 * `MDXRemote` throws *during render*, which a try/catch around the call site
 * cannot intercept — the failure would reach the browser as a broken page.
 * Compiling up front makes the error catchable, so bad markup can be rejected
 * at the point of editing rather than at the point of reading.
 */
export async function validateMdx(
  source: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!source?.trim()) return { ok: true };

  try {
    await compileMDX({
      source,
      options: { mdxOptions: { remarkPlugins: [remarkGfm] } },
      // Unknown components resolve to a no-op so validation checks syntax only,
      // not whether every referenced component exists.
      components: new Proxy({}, { get: () => () => null }) as never,
    });
    return { ok: true };
  } catch (error) {
    const raw = error instanceof Error ? error.message : String(error);
    return {
      ok: false,
      error: raw
        .replace(/^\[next-mdx-remote\]\s*error compiling MDX:\s*/i, "")
        .split("\n")[0]
        .trim(),
    };
  }
}
