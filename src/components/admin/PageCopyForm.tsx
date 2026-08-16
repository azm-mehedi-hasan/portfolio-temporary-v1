"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { savePage } from "@/lib/actions/content";
import { MdxEditor } from "./MdxEditor";
import { Button, Card, Field, FieldGroup, Input } from "./ui";

export type PageCopy = {
  slug: string;
  emoji: string;
  heading: string;
  introMdx: string;
  bodyMdx: string;
  seoTitle: string;
  seoDescription: string;
};

const PUBLIC_PATH: Record<string, string> = {
  home: "/",
  about: "/about",
  projects: "/projects",
  blog: "/blog",
  contact: "/contact",
  resume: "/resume",
};

const HAS_BODY = new Set(["about"]);

export function PageCopyForm({ page }: { page: PageCopy }) {
  const router = useRouter();
  const [values, setValues] = useState(page);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = <K extends keyof PageCopy>(k: K, v: PageCopy[K]) =>
    setValues((prev) => ({ ...prev, [k]: v }));

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setErrors({});
    const result = await savePage(values);
    setSaving(false);

    if (!result.ok) {
      setErrors(result.fieldErrors ?? {});
      toast.error(result.error);
      return;
    }
    toast.success(result.message ?? "Saved");
    router.refresh();
  }

  return (
    <Card className="p-5">
      <form
        onSubmit={submit}
        data-testid={`page-form-${values.slug}`}
        className="flex flex-col gap-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold capitalize text-neutral-900">
            {values.slug}
          </h2>
          <a
            href={PUBLIC_PATH[values.slug] ?? "/"}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-neutral-500 underline hover:text-neutral-800"
          >
            {PUBLIC_PATH[values.slug] ?? "/"}
          </a>
        </div>

        <div className="grid gap-4 sm:grid-cols-[6rem_1fr]">
          <Field label="Emoji">
            <Input
              value={values.emoji}
              onChange={(e) => set("emoji", e.target.value)}
              placeholder="👋"
            />
          </Field>
          <Field label="Heading" error={errors.heading}>
            <Input
              value={values.heading}
              onChange={(e) => set("heading", e.target.value)}
            />
          </Field>
        </div>

        <FieldGroup
          label="Lead paragraphs"
          hint="Markdown. <Highlight>text</Highlight> gives the grey emphasis style."
        >
          <MdxEditor
            value={values.introMdx}
            onChange={(v) => set("introMdx", v)}
            rows={6}
          />
        </FieldGroup>

        {HAS_BODY.has(values.slug) && (
          <FieldGroup label="Main body" hint="The long narrative shown under the gallery.">
            <MdxEditor
              value={values.bodyMdx}
              onChange={(v) => set("bodyMdx", v)}
              rows={20}
            />
          </FieldGroup>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="SEO title" error={errors.seoTitle}>
            <Input
              value={values.seoTitle}
              onChange={(e) => set("seoTitle", e.target.value)}
            />
          </Field>
          <Field
            label="SEO description"
            error={errors.seoDescription}
            hint={`${values.seoDescription.length}/160 recommended`}
          >
            <Input
              value={values.seoDescription}
              onChange={(e) => set("seoDescription", e.target.value)}
            />
          </Field>
        </div>

        <div>
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save page"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
