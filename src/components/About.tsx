import Image from "next/image";
import { Mdx } from "@/components/Mdx";
import { getGallery, getPage } from "@/lib/queries";
import { Reveal } from "./Reveal";

export default async function About() {
  const [gallery, page] = await Promise.all([getGallery(), getPage("about")]);

  return (
    <div className="container mx-auto px-4 py-12">
      {gallery.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {gallery.map((image, index) => (
            <Reveal
              key={image.id}
              index={index}
              from="scale"
              className="overflow-hidden rounded-lg shadow-lg"
            >
              <Image
                src={image.url}
                width={400}
                height={300}
                alt={image.alt || `Gallery image ${index + 1}`}
                className="object-cover w-full h-48 sm:h-60 md:h-72 transition-transform duration-300 transform hover:scale-105"
              />
            </Reveal>
          ))}
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-extrabold mb-8 text-center text-indigo-600">
          {page?.heading ?? "About Me"}
        </h1>

        <div className="prose prose-neutral max-w-none prose-p:text-secondary prose-p:text-sm lg:prose-p:text-base prose-strong:text-neutral-800">
          <Mdx source={page?.bodyMdx ?? ""} />
        </div>
      </div>
    </div>
  );
}
