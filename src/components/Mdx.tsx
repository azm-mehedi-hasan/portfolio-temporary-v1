import rehypePrism from "@mapbox/rehype-prism";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { CodeWindow } from "@/components/CodeWindow";
import { Heading } from "@/components/Heading";
import { Highlight } from "@/components/Highlight";
import { Paragraph } from "@/components/Paragraph";

/**
 * Renders MDX stored in the database.
 *
 * The components map is a fixed allowlist: content can only reach the
 * components named here, and an admin cannot introduce new ones by editing a
 * row. This is what lets the old file-based MDX (<CodeWindow>, <Highlight>)
 * keep working after the move to Postgres.
 */
const components = {
  CodeWindow,
  Highlight,
  Heading,
  Paragraph,
};

export function Mdx({ source }: { source: string }) {
  if (!source?.trim()) return null;

  return (
    <MDXRemote
      source={source}
      components={components}
      options={{
        mdxOptions: {
          remarkPlugins: [remarkGfm],
          rehypePlugins: [rehypePrism],
        },
      }}
    />
  );
}

/**
 * Lead copy (hero paragraphs). Paragraphs are mapped onto the site's
 * <Paragraph> so database-driven copy is styled exactly like the old JSX.
 */
export function MdxLead({
  source,
  className,
}: {
  source: string;
  className?: string;
}) {
  if (!source?.trim()) return null;

  return (
    <MDXRemote
      source={source}
      components={{
        ...components,
        p: (props) => <Paragraph className={className}>{props.children}</Paragraph>,
      }}
      options={{
        mdxOptions: { remarkPlugins: [remarkGfm] },
      }}
    />
  );
}
