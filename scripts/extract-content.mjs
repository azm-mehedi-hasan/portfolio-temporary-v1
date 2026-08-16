/**
 * One-time migration helper.
 *
 * Renders the *current* file-based site and converts each long-form body to
 * Markdown, so the database is seeded with exactly what the site shows today
 * rather than a hand-retyped approximation.
 *
 * Usage:  node scripts/extract-content.mjs http://localhost:3210
 * Output: prisma/seed-content/{projects,posts}/<slug>.md
 *
 * Safe to delete once the migration has landed.
 */
import { JSDOM } from "jsdom";
import TurndownService from "turndown";
import fs from "node:fs/promises";
import path from "node:path";

const BASE = process.argv[2] || "http://localhost:3210";
const OUT = path.join(process.cwd(), "prisma", "seed-content");

const PROJECTS = [
  "rentaxi",
  "chillGamerOG",
  "LearnHub",
  "pet",
  "electricity-billing-system",
];
const POSTS = [
  "clean-code",
  "dark-mode-with-nextjs",
  "how-to-win-clients",
  "tailwindcss-tips-and-tricks",
];

const td = new TurndownService({
  headingStyle: "atx",
  codeBlockStyle: "fenced",
  bulletListMarker: "-",
  emDelimiter: "_",
});

// The CodeWindow chrome renders as a title bar + a Copy button wrapping a <pre>.
// Map it back to a <CodeWindow> MDX block so the component survives the round trip.
td.addRule("codeWindow", {
  filter: (node) =>
    node.nodeName === "DIV" &&
    node.classList.contains("bg-slate-900") &&
    !!node.querySelector("pre"),
  replacement: (_content, node) => {
    const title = node.querySelector("p")?.textContent?.trim() || "code";
    const pre = node.querySelector("pre");
    const code = pre?.textContent?.replace(/\s+$/, "") || "";
    const lang = (pre?.querySelector("code")?.className || "")
      .match(/language-(\w+)/)?.[1] || "tsx";
    return `\n\n<CodeWindow title="${title}">\n\n\`\`\`${lang}\n${code}\n\`\`\`\n\n</CodeWindow>\n\n`;
  },
});

// Drop the copy button entirely.
td.addRule("dropCopyButton", {
  filter: (node) =>
    node.nodeName === "BUTTON" && /^(Copy|Copied!)$/.test(node.textContent.trim()),
  replacement: () => "",
});

const clean = (md) =>
  md
    .replace(/ /g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]+$/gm, "")
    .trim() + "\n";

async function grab(url, selector) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} → ${res.status}`);
  const dom = new JSDOM(await res.text());
  const el = dom.window.document.querySelector(selector);
  if (!el) throw new Error(`no ${selector} at ${url}`);
  return el.innerHTML;
}

/**
 * Two shapes exist in this repo:
 *   A) `export default (props) => <BlogLayout meta={meta} {...props} />;`
 *      followed by a Markdown body.
 *   B) `export default (props) => (` … `<BlogLayout …> JSX </BlogLayout>` … `);`
 *      where the body is JSX (valid MDX, but must be dedented to column 0 or
 *      Markdown reads the indentation as a code block).
 */
function extractPostBody(src) {
  const lines = src.split("\n");
  const openIdx = lines.findIndex((l) => l.includes("<BlogLayout"));
  const closeIdx = lines.findIndex((l) => l.includes("</BlogLayout>"));

  if (closeIdx === -1) {
    // Shape A — everything after the self-closing default export.
    const defIdx = lines.findIndex((l) => l.startsWith("export default"));
    return clean(lines.slice(defIdx + 1).join("\n"));
  }

  // Shape B — dedent the JSX body.
  const body = lines.slice(openIdx + 1, closeIdx);
  const indent = Math.min(
    ...body.filter((l) => l.trim()).map((l) => l.match(/^ */)[0].length)
  );
  return clean(body.map((l) => l.slice(indent)).join("\n"));
}

async function main() {
  await fs.mkdir(path.join(OUT, "projects"), { recursive: true });
  await fs.mkdir(path.join(OUT, "posts"), { recursive: true });

  for (const slug of PROJECTS) {
    const html = await grab(`${BASE}/projects/${slug}`, "div.prose");
    const md = clean(td.turndown(html));
    await fs.writeFile(path.join(OUT, "projects", `${slug}.md`), md);
    console.log(`project  ${slug.padEnd(28)} ${md.length} chars`);
  }

  // Posts come from MDX *source*, not rendered HTML: CodeWindow is gated behind
  // an isClient check, so code blocks never appear in the server HTML at all.
  for (const slug of POSTS) {
    const src = await fs.readFile(
      path.join(process.cwd(), "src/app/(site)/blog", slug, "content.mdx"),
      "utf8"
    );
    const body = extractPostBody(src);
    await fs.writeFile(path.join(OUT, "posts", `${slug}.md`), body);
    const fences = (body.match(/^```/gm) || []).length / 2;
    console.log(
      `post     ${slug.padEnd(28)} ${String(body.length).padStart(5)} chars` +
        `  ${fences} code block(s)`
    );
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
