"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { deleteMediaAsset, updateMediaAlt } from "@/lib/actions/media";
import { MediaUploader } from "./MediaUploader";
import { Button, Card, EmptyState, Input } from "./ui";

type Asset = {
  id: string;
  publicId: string;
  url: string;
  alt: string;
  width: number;
  height: number;
  bytes: number;
  format: string;
};

const kb = (bytes: number) =>
  bytes > 1024 * 1024
    ? `${(bytes / 1024 / 1024).toFixed(1)} MB`
    : `${Math.round(bytes / 1024)} KB`;

export function MediaLibrary({
  assets,
  enabled,
}: {
  assets: Asset[];
  enabled: boolean;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<string | null>(null);
  const [altDraft, setAltDraft] = useState("");

  async function saveAlt(id: string) {
    const result = await updateMediaAlt({ id, alt: altDraft });
    if (result.ok) {
      toast.success("Saved");
      setEditing(null);
      router.refresh();
    } else toast.error(result.error);
  }

  async function remove(asset: Asset) {
    if (
      !window.confirm(
        `Delete this image? It will be removed from Cloudinary too, and any page still using it will show a broken image.`
      )
    )
      return;
    const result = await deleteMediaAsset({ id: asset.id });
    if (result.ok) {
      toast.success("Deleted");
      router.refresh();
    } else toast.error(result.error);
  }

  return (
    <div className="flex flex-col gap-4">
      {!enabled && (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <p className="font-medium">Uploads are turned off</p>
          <p className="mt-1">
            Set <code>CLOUDINARY_CLOUD_NAME</code>, <code>CLOUDINARY_API_KEY</code>{" "}
            and <code>CLOUDINARY_API_SECRET</code> to enable them. You can still
            paste image URLs directly into any image field.
          </p>
        </div>
      )}

      <div className="flex justify-end">
        <MediaUploader onUploaded={() => router.refresh()} />
      </div>

      {assets.length === 0 ? (
        <EmptyState
          title="No uploads yet"
          description="Upload an image here to reuse it across projects, articles and the gallery. Pasting an external URL into an image field works too."
        />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {assets.map((asset) => (
            <Card key={asset.id} className="overflow-hidden">
              <Image
                src={asset.url}
                alt={asset.alt}
                width={asset.width}
                height={asset.height}
                className="h-32 w-full object-cover"
              />
              <div className="flex flex-col gap-2 p-2.5">
                <p className="truncate text-xs font-medium text-neutral-800">
                  {asset.publicId.split("/").pop()}
                </p>
                <p className="text-[11px] tabular-nums text-neutral-400">
                  {asset.width}&times;{asset.height} &middot; {asset.format} &middot;{" "}
                  {kb(asset.bytes)}
                </p>

                {editing === asset.id ? (
                  <div className="flex flex-col gap-1.5">
                    <Input
                      value={altDraft}
                      onChange={(e) => setAltDraft(e.target.value)}
                      placeholder="Describe the image"
                      className="text-xs"
                    />
                    <div className="flex gap-1">
                      <Button size="sm" onClick={() => saveAlt(asset.id)}>
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setEditing(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="truncate text-[11px] text-neutral-500">
                      {asset.alt || "No alt text"}
                    </p>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setEditing(asset.id);
                          setAltDraft(asset.alt);
                        }}
                      >
                        Alt text
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => navigator.clipboard.writeText(asset.url)}
                      >
                        Copy URL
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => remove(asset)}
                      >
                        Delete
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
