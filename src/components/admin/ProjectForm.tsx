"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { saveProject } from "@/lib/actions/content";
import { MdxEditor } from "./MdxEditor";
import { MediaField } from "./MediaField";
import { Button, Card, Field, Input, Select, Textarea } from "./ui";

export type TechOption = { id: string; name: string };

export type ProjectFormValues = {
  id?: string;
  slug: string;
  title: string;
  description: string;
  liveUrl: string;
  thumbnailUrl: string;
  contentMdx: string;
  status: "DRAFT" | "PUBLISHED";
  techIds: string[];
  images: { url: string; alt: string }[];
};

const slugify = (v: string) =>
  v.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export function ProjectForm({
  initial,
  techOptions,
}: {
  initial: ProjectFormValues;
  techOptions: TechOption[];
}) {
  const router = useRouter();
  const [values, setValues] = useState<ProjectFormValues>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const isNew = !initial.id;

  const set = <K extends keyof ProjectFormValues>(
    key: K,
    value: ProjectFormValues[K]
  ) => setValues((v) => ({ ...v, [key]: value }));

  function toggleTech(id: string) {
    set(
      "techIds",
      values.techIds.includes(id)
        ? values.techIds.filter((t) => t !== id)
        : [...values.techIds, id]
    );
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setErrors({});

    const result = await saveProject(values);
    setSaving(false);

    if (!result.ok) {
      setErrors(result.fieldErrors ?? {});
      toast.error(result.error);
      return;
    }

    toast.success(result.message ?? "Saved");
    if (isNew && result.data) {
      router.push(`/admin/projects/${result.data.id}`);
    }
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-6">
      <Card className="flex flex-col gap-4 p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Title" error={errors.title}>
            <Input
              value={values.title}
              onChange={(e) => {
                const title = e.target.value;
                setValues((v) => ({
                  ...v,
                  title,
                  slug: isNew && !v.slug ? slugify(title) : v.slug,
                }));
              }}
              placeholder="RenTaxi"
            />
          </Field>

          <Field
            label="Slug"
            error={errors.slug}
            hint={`Public URL: /projects/${values.slug || "..."}`}
          >
            <Input
              value={values.slug}
              onChange={(e) => set("slug", e.target.value)}
              placeholder="rentaxi"
            />
          </Field>
        </div>

        <Field label="Short description" error={errors.description} hint="Shown on the project cards.">
          <Input
            value={values.description}
            onChange={(e) => set("description", e.target.value)}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Live URL" error={errors.liveUrl}>
            <Input
              value={values.liveUrl}
              onChange={(e) => set("liveUrl", e.target.value)}
              placeholder="https://example.com"
            />
          </Field>

          <Field label="Status">
            <Select
              value={values.status}
              onChange={(e) => set("status", e.target.value as "DRAFT" | "PUBLISHED")}
            >
              <option value="PUBLISHED">Published</option>
              <option value="DRAFT">Draft (hidden from the site)</option>
            </Select>
          </Field>
        </div>

        <MediaField
          label="Thumbnail"
          value={values.thumbnailUrl}
          onChange={(url) => set("thumbnailUrl", url)}
          error={errors.thumbnailUrl}
        />
      </Card>

      <Card className="flex flex-col gap-3 p-5">
        <div>
          <h2 className="text-sm font-semibold text-neutral-900">Tech stack</h2>
          <p className="text-xs text-neutral-500">
            Chips shown under the project. Managed in Tech stack.
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {techOptions.map((tech) => {
            const active = values.techIds.includes(tech.id);
            return (
              <button
                key={tech.id}
                type="button"
                onClick={() => toggleTech(tech.id)}
                aria-pressed={active}
                className={`rounded-full px-2.5 py-1 text-xs transition ${
                  active
                    ? "bg-neutral-900 text-white"
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                }`}
              >
                {tech.name}
              </button>
            );
          })}
        </div>
      </Card>

      <Card className="flex flex-col gap-3 p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-neutral-900">Screenshots</h2>
            <p className="text-xs text-neutral-500">
              Shown as switchable thumbnails on the project page.
            </p>
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => set("images", [...values.images, { url: "", alt: "" }])}
          >
            Add image
          </Button>
        </div>

        {values.images.length === 0 && (
          <p className="text-sm text-neutral-500">No screenshots yet.</p>
        )}

        {values.images.map((image, index) => (
          <div key={index} className="flex items-end gap-2 rounded-md bg-neutral-50 p-3">
            <div className="flex-1">
              <MediaField
                label={`Image ${index + 1}`}
                value={image.url}
                onChange={(url) =>
                  set(
                    "images",
                    values.images.map((im, i) => (i === index ? { ...im, url } : im))
                  )
                }
              />
            </div>
            <div className="flex-1">
              <Field label="Alt text">
                <Input
                  value={image.alt}
                  onChange={(e) =>
                    set(
                      "images",
                      values.images.map((im, i) =>
                        i === index ? { ...im, alt: e.target.value } : im
                      )
                    )
                  }
                />
              </Field>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="mb-1 text-red-600 hover:bg-red-50"
              onClick={() =>
                set("images", values.images.filter((_, i) => i !== index))
              }
            >
              Remove
            </Button>
          </div>
        ))}
      </Card>

      <Card className="flex flex-col gap-3 p-5">
        <div>
          <h2 className="text-sm font-semibold text-neutral-900">Case study</h2>
          <p className="text-xs text-neutral-500">
            Markdown. Use <code>&lt;CodeWindow title=&quot;file.tsx&quot;&gt;</code> around a
            fenced code block for a titled snippet.
          </p>
        </div>
        <MdxEditor
          value={values.contentMdx}
          onChange={(v) => set("contentMdx", v)}
        />
      </Card>

      <div className="sticky bottom-0 flex gap-2 border-t border-neutral-200 bg-neutral-50/95 py-3 backdrop-blur">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : isNew ? "Create project" : "Save changes"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push("/admin/projects")}
        >
          Back to projects
        </Button>
      </div>
    </form>
  );
}
