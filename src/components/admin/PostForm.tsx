"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { savePost } from "@/lib/actions/content";
import { MdxEditor } from "./MdxEditor";
import { MediaField } from "./MediaField";
import { Button, Card, Field, Input, Select } from "./ui";

export type PostFormValues = {
  id?: string;
  slug: string;
  title: string;
  description: string;
  coverImageUrl: string;
  contentMdx: string;
  status: "DRAFT" | "PUBLISHED";
  publishedAt: string;
  tags: string[];
};

const slugify = (v: string) =>
  v.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export function PostForm({ initial }: { initial: PostFormValues }) {
  const router = useRouter();
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [tagDraft, setTagDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const isNew = !initial.id;

  const set = <K extends keyof PostFormValues>(k: K, v: PostFormValues[K]) =>
    setValues((prev) => ({ ...prev, [k]: v }));

  function addTag() {
    const tag = tagDraft.trim();
    if (!tag || values.tags.includes(tag)) return setTagDraft("");
    set("tags", [...values.tags, tag]);
    setTagDraft("");
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setErrors({});

    const result = await savePost({
      ...values,
      publishedAt: values.publishedAt || null,
    });
    setSaving(false);

    if (!result.ok) {
      setErrors(result.fieldErrors ?? {});
      toast.error(result.error);
      return;
    }

    toast.success(result.message ?? "Saved");
    if (isNew && result.data) router.push(`/admin/posts/${result.data.id}`);
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
            />
          </Field>

          <Field
            label="Slug"
            error={errors.slug}
            hint={`Public URL: /blog/${values.slug || "..."}`}
          >
            <Input value={values.slug} onChange={(e) => set("slug", e.target.value)} />
          </Field>
        </div>

        <Field label="Summary" error={errors.description} hint="Shown in the article list.">
          <Input
            value={values.description}
            onChange={(e) => set("description", e.target.value)}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Status">
            <Select
              value={values.status}
              onChange={(e) => set("status", e.target.value as "DRAFT" | "PUBLISHED")}
            >
              <option value="DRAFT">Draft (hidden from the site)</option>
              <option value="PUBLISHED">Published</option>
            </Select>
          </Field>

          <Field
            label="Publish date"
            hint="Leave blank to use today when publishing."
          >
            <Input
              type="date"
              value={values.publishedAt}
              onChange={(e) => set("publishedAt", e.target.value)}
            />
          </Field>
        </div>

        <MediaField
          label="Cover image"
          value={values.coverImageUrl}
          onChange={(url) => set("coverImageUrl", url)}
          error={errors.coverImageUrl}
        />

        <Field label="Tags">
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <Input
                value={tagDraft}
                onChange={(e) => setTagDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag();
                  }
                }}
                placeholder="Add a tag and press Enter"
              />
              <Button type="button" variant="secondary" onClick={addTag}>
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {values.tags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => set("tags", values.tags.filter((t) => t !== tag))}
                  className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs text-neutral-700 hover:bg-red-50 hover:text-red-700"
                  title="Remove tag"
                >
                  {tag} &times;
                </button>
              ))}
            </div>
          </div>
        </Field>
      </Card>

      <Card className="flex flex-col gap-3 p-5">
        <div>
          <h2 className="text-sm font-semibold text-neutral-900">Article</h2>
          <p className="text-xs text-neutral-500">
            Markdown. Reading time is calculated automatically when you save.
          </p>
        </div>
        <MdxEditor
          value={values.contentMdx}
          onChange={(v) => set("contentMdx", v)}
          rows={24}
        />
      </Card>

      <div className="sticky bottom-0 flex gap-2 border-t border-neutral-200 bg-neutral-50/95 py-3 backdrop-blur">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : isNew ? "Create article" : "Save changes"}
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.push("/admin/posts")}>
          Back to articles
        </Button>
      </div>
    </form>
  );
}
