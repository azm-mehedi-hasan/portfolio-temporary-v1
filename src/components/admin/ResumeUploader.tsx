"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "./ui";

const MAX_BYTES = 10 * 1024 * 1024;

/**
 * Direct-to-Cloudinary upload for the resume PDF. Reuses the same signed
 * upload flow as MediaUploader, but targets Cloudinary's raw-upload endpoint
 * (PDFs aren't images) and hands the resulting URL straight back to the
 * caller instead of registering a MediaAsset row.
 */
export function ResumeUploader({
  onUploaded,
}: {
  onUploaded: (result: { url: string; fileName: string }) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function upload(file: File) {
    if (file.size > MAX_BYTES) {
      toast.error("That file is larger than 10 MB. Try a smaller PDF.");
      return;
    }

    setBusy(true);
    try {
      const signRes = await fetch("/api/media/sign", { method: "POST" });
      if (!signRes.ok) {
        const { error } = await signRes.json().catch(() => ({ error: "" }));
        toast.error(error || "Could not start the upload.");
        return;
      }
      const { cloudName, apiKey, timestamp, signature, folder } =
        await signRes.json();

      const form = new FormData();
      form.append("file", file);
      form.append("api_key", apiKey);
      form.append("timestamp", String(timestamp));
      form.append("signature", signature);
      form.append("folder", folder);

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`,
        { method: "POST", body: form }
      );

      if (!uploadRes.ok) {
        toast.error("Cloudinary rejected the upload.");
        return;
      }

      const asset = await uploadRes.json();
      toast.success("Uploaded");
      onUploaded({ url: asset.secure_url, fileName: file.name });
    } catch {
      toast.error("The upload failed. Check your connection and try again.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) upload(file);
        }}
      />
      <Button
        type="button"
        variant="secondary"
        size="sm"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
      >
        {busy ? "Uploading..." : "Upload PDF"}
      </Button>
    </>
  );
}
