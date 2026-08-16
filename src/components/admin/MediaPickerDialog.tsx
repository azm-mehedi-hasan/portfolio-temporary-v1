"use client";

import * as Dialog from "@radix-ui/react-dialog";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { listMedia } from "@/lib/actions/media";
import { MediaUploader } from "./MediaUploader";
import { Button, Input } from "./ui";

type Asset = {
  id: string;
  url: string;
  publicId: string;
  alt: string;
  width: number;
  height: number;
};

export function MediaPickerDialog({
  open,
  onClose,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
}) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  async function refresh(q = "") {
    setLoading(true);
    try {
      setAssets((await listMedia(q)) as Asset[]);
    } catch {
      toast.error("Could not load the media library.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (open) refresh(query);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 flex max-h-[85vh] w-[min(56rem,92vw)] -translate-x-1/2 -translate-y-1/2 flex-col rounded-lg bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-neutral-200 p-4">
            <div>
              <Dialog.Title className="text-base font-semibold text-neutral-900">
                Media library
              </Dialog.Title>
              <Dialog.Description className="text-xs text-neutral-500">
                Pick an existing image, upload a new one, or paste a URL directly
                into the field.
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <Button variant="ghost" size="sm">Close</Button>
            </Dialog.Close>
          </div>

          <div className="flex flex-wrap items-center gap-2 border-b border-neutral-100 p-3">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && refresh(query)}
              placeholder="Search by name or alt text..."
              className="max-w-xs"
            />
            <Button variant="secondary" size="sm" onClick={() => refresh(query)}>
              Search
            </Button>
            <div className="ml-auto">
              <MediaUploader onUploaded={() => refresh(query)} />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {loading && <p className="text-sm text-neutral-500">Loading...</p>}

            {!loading && assets.length === 0 && (
              <p className="py-10 text-center text-sm text-neutral-500">
                Nothing here yet. Upload an image, or paste a URL into the field
                directly — both work.
              </p>
            )}

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-5">
              {assets.map((asset) => (
                <button
                  key={asset.id}
                  type="button"
                  onClick={() => onSelect(asset.url)}
                  className="group overflow-hidden rounded-md ring-1 ring-neutral-200 transition hover:ring-2 hover:ring-neutral-900"
                >
                  <Image
                    src={asset.url}
                    alt={asset.alt}
                    width={200}
                    height={140}
                    className="h-24 w-full object-cover"
                  />
                  <p className="truncate p-1.5 text-left text-[11px] text-neutral-500">
                    {asset.publicId.split("/").pop()}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
