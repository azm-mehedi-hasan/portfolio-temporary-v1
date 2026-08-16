"use client";

import { useState, useTransition, type ReactNode } from "react";
import { renderMdxPreview } from "@/lib/actions/preview";
import { Button, Textarea } from "./ui";

const SNIPPETS = [
  { label: "Heading", insert: "\n### Section title\n\n" },
  { label: "Bold", insert: "**text**" },
  { label: "Link", insert: "[label](https://example.com)" },
  { label: "List", insert: "\n- first\n- second\n" },
  {
    label: "Code window",
    insert:
      '\n<CodeWindow title="example.tsx">\n\n```tsx\nconst hello = "world";\n```\n\n</CodeWindow>\n\n',
  },
  { label: "Highlight", insert: "<Highlight>text</Highlight>" },
];

export function MdxEditor({
  value,
  onChange,
  rows = 18,
}: {
  value: string;
  onChange: (value: string) => void;
  rows?: number;
}) {
  const [tab, setTab] = useState<"write" | "preview">("write");
  const [preview, setPreview] = useState<ReactNode>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function showPreview() {
    setTab("preview");
    startTransition(async () => {
      const result = await renderMdxPreview(value);
      if (result.ok) {
        setPreview(result.node);
        setError(null);
      } else {
        setPreview(null);
        setError(result.error);
      }
    });
  }

  function insert(text: string) {
    onChange(value + text);
  }

  const words = value.trim() ? value.trim().split(/\s+/).length : 0;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2 border-b border-neutral-200 pb-2">
        <div className="flex rounded-md bg-neutral-100 p-0.5">
          <button
            type="button"
            onClick={() => setTab("write")}
            className={`rounded px-2.5 py-1 text-xs font-medium ${
              tab === "write" ? "bg-white shadow-sm" : "text-neutral-500"
            }`}
          >
            Write
          </button>
          <button
            type="button"
            onClick={showPreview}
            className={`rounded px-2.5 py-1 text-xs font-medium ${
              tab === "preview" ? "bg-white shadow-sm" : "text-neutral-500"
            }`}
          >
            Preview
          </button>
        </div>

        {tab === "write" && (
          <div className="flex flex-wrap gap-1">
            {SNIPPETS.map((s) => (
              <Button
                key={s.label}
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => insert(s.insert)}
              >
                {s.label}
              </Button>
            ))}
          </div>
        )}

        <span className="ml-auto text-xs tabular-nums text-neutral-400">
          {words} words
        </span>
      </div>

      {tab === "write" ? (
        <Textarea
          rows={rows}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Write in Markdown..."
        />
      ) : (
        <div className="min-h-[16rem] rounded-md border border-neutral-200 bg-white p-4">
          {pending && <p className="text-sm text-neutral-400">Rendering...</p>}
          {error && (
            <p className="rounded bg-red-50 p-3 text-sm text-red-700">
              {error}
            </p>
          )}
          {!pending && !error && (preview ?? (
            <p className="text-sm text-neutral-400">Nothing to preview yet.</p>
          ))}
        </div>
      )}
    </div>
  );
}
