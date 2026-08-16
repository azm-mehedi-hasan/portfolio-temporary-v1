"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { registerMediaAsset } from "@/lib/actions/media";
import { Button } from "./ui";

const MAX_BYTES = 10 * 1024 * 1024;

/**
 * Direct-to-Cloudinary upload. The file never passes through the app server:
 * we fetch a short-lived signature, POST straight to Cloudinary, then record
 * the result in the media library.
 */
export function MediaUploader({ onUploaded }: { onUploaded: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function upload(file: File) {
    if (file.size > MAX_BYTES) {
      toast.error("That file is larger than 10 MB. Try a smaller image.");
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
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: "POST", body: form }
      );

      if (!uploadRes.ok) {
        toast.error("Cloudinary rejected the upload.");
        return;
      }

      const asset = await uploadRes.json();
      const result = await registerMediaAsset({
        publicId: asset.public_id,
        url: asset.secure_url,
        width: asset.width,
        height: asset.height,
        format: asset.format,
        bytes: asset.bytes,
        folder: asset.folder ?? folder,
        alt: "",
      });

      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      toast.success("Uploaded");
      onUploaded();
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
        accept="image/*"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) upload(file);
        }}
      />
      <Button
        type="button"
        size="sm"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
      >
        {busy ? "Uploading..." : "Upload image"}
      </Button>
    </>
  );
}
