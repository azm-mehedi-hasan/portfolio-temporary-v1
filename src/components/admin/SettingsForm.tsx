"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { saveSettings } from "@/lib/actions/content";
import { MediaField } from "./MediaField";
import { Button, Card, Field, Input } from "./ui";

export type SettingsValues = {
  ownerName: string;
  role: string;
  avatarUrl: string;
  footerText: string;
  resumeUrl: string;
  resumeFileName: string;
  ogImageUrl: string;
  seoTitle: string;
  seoDescription: string;
};

export function SettingsForm({ settings }: { settings: SettingsValues }) {
  const router = useRouter();
  const [values, setValues] = useState(settings);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof SettingsValues>(k: K, v: SettingsValues[K]) =>
    setValues((prev) => ({ ...prev, [k]: v }));

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setErrors({});
    const result = await saveSettings(values);
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
    <form onSubmit={submit} className="flex flex-col gap-6">
      <Card className="flex flex-col gap-4 p-5">
        <h2 className="text-sm font-semibold text-neutral-900">Identity</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name" error={errors.ownerName} hint="Shown in the sidebar.">
            <Input
              value={values.ownerName}
              onChange={(e) => set("ownerName", e.target.value)}
            />
          </Field>
          <Field label="Role" error={errors.role}>
            <Input value={values.role} onChange={(e) => set("role", e.target.value)} />
          </Field>
        </div>

        <MediaField
          label="Avatar"
          value={values.avatarUrl}
          onChange={(url) => set("avatarUrl", url)}
          error={errors.avatarUrl}
        />

        <Field label="Footer text" error={errors.footerText}>
          <Input
            value={values.footerText}
            onChange={(e) => set("footerText", e.target.value)}
          />
        </Field>
      </Card>

      <Card className="flex flex-col gap-4 p-5">
        <h2 className="text-sm font-semibold text-neutral-900">Resume</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Resume file URL"
            hint="Upload a PDF anywhere public, or keep the file in /public."
          >
            <Input
              value={values.resumeUrl}
              onChange={(e) => set("resumeUrl", e.target.value)}
              placeholder="/Mern_Stack_developer_Mehedi_Hasan.pdf"
            />
          </Field>
          <Field label="Download filename">
            <Input
              value={values.resumeFileName}
              onChange={(e) => set("resumeFileName", e.target.value)}
            />
          </Field>
        </div>
      </Card>

      <Card className="flex flex-col gap-4 p-5">
        <h2 className="text-sm font-semibold text-neutral-900">
          Default search &amp; social preview
        </h2>
        <p className="-mt-2 text-xs text-neutral-500">
          Used when a page has nothing more specific. Per-page overrides live in
          Page copy.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Site title" error={errors.seoTitle}>
            <Input
              value={values.seoTitle}
              onChange={(e) => set("seoTitle", e.target.value)}
            />
          </Field>
          <Field label="Site description" error={errors.seoDescription}>
            <Input
              value={values.seoDescription}
              onChange={(e) => set("seoDescription", e.target.value)}
            />
          </Field>
        </div>

        <MediaField
          label="Social share image"
          value={values.ogImageUrl}
          onChange={(url) => set("ogImageUrl", url)}
          hint="1200×630 works best. Leave blank to omit."
        />
      </Card>

      <div className="sticky bottom-0 border-t border-neutral-200 bg-neutral-50/95 py-3 backdrop-blur">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save settings"}
        </Button>
      </div>
    </form>
  );
}
