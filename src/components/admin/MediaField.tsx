"use client";

import Image from "next/image";
import { useState } from "react";
import { MediaPickerDialog } from "./MediaPickerDialog";
import { Button, FieldGroup, Input } from "./ui";

/**
 * URL input with a thumbnail preview and a picker into the media library.
 * Accepts both Cloudinary URLs and paths served from /public.
 */
export function MediaField({
  label,
  value,
  onChange,
  error,
  hint,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  error?: string;
  hint?: string;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [broken, setBroken] = useState(false);

  return (
    <>
      <FieldGroup label={label} hint={hint}>
        <div className="flex items-start gap-3">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md bg-neutral-100 ring-1 ring-neutral-200">
            {value && !broken ? (
              <Image
                src={value}
                alt=""
                width={64}
                height={64}
                className="h-16 w-16 object-cover"
                onError={() => setBroken(true)}
              />
            ) : (
              <span className="text-[10px] text-neutral-400">No image</span>
            )}
          </div>

          <div className="flex flex-1 flex-col gap-2">
            <Input
              aria-label={label}
              value={value}
              placeholder="https://res.cloudinary.com/... or /images/example.png"
              onChange={(e) => {
                setBroken(false);
                onChange(e.target.value);
              }}
            />
            <div className="flex gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setPickerOpen(true)}
              >
                Choose from media
              </Button>
              {value && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onChange("")}
                >
                  Clear
                </Button>
              )}
            </div>
          </div>
        </div>
        {error && <span className="text-xs text-red-600">{error}</span>}
      </FieldGroup>

      <MediaPickerDialog
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(url) => {
          setBroken(false);
          onChange(url);
          setPickerOpen(false);
        }}
      />
    </>
  );
}
