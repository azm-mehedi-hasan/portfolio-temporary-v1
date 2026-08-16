"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";

/**
 * Client leaf: only the image switcher needs interactivity, so the rest of the
 * project page (including the long MDX case study) stays server-rendered.
 */
export function ProductGallery({
  title,
  thumbnailUrl,
  images,
}: {
  title: string;
  thumbnailUrl: string;
  images: { id: string; url: string; alt: string }[];
}) {
  const [activeImage, setActiveImage] = useState(thumbnailUrl);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative"
      >
        <Image
          src={activeImage}
          alt={title}
          height="1000"
          width="1000"
          className="rounded-md object-contain"
          priority
        />
        <div className="absolute bottom-0 bg-white h-40 w-full [mask-image:linear-gradient(to_bottom,transparent,white)]" />
      </motion.div>

      {images.length > 1 && (
        <div className="flex flex-row justify-center my-8 flex-wrap">
          {images.map((image) => (
            <button
              onClick={() => setActiveImage(image.url)}
              key={image.id}
              aria-label={`Show ${image.alt || title}`}
              aria-pressed={activeImage === image.url}
            >
              <Image
                src={image.url}
                alt={image.alt || title}
                height="1000"
                width="1000"
                className="h-14 w-16 md:h-40 md:w-60 object-cover object-top mr-4 mb-r border rounded-lg border-neutral-100"
              />
            </button>
          ))}
        </div>
      )}
    </>
  );
}
