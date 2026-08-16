import Image from "next/image";
import { Mdx } from "@/components/Mdx";
import type { ProjectWithRelations } from "@/lib/queries";
import { Heading } from "./Heading";
import { Paragraph } from "./Paragraph";
import { ProductGallery } from "./ProductGallery";

export const SingleProduct = ({ product }: { product: ProjectWithRelations }) => {
  return (
    <div className="py-10">
      <ProductGallery
        title={product.title}
        thumbnailUrl={product.thumbnailUrl}
        images={product.images}
      />

      <div className="flex lg:flex-row justify-between items-center flex-col mt-20">
        <Heading className="font-black mb-2 pb-1"> {product.title}</Heading>
        <div className="flex flex-wrap gap-2 md:mb-1 mt-2 md:mt-0">
          {product.stack.map(({ tech }) => (
            <span
              key={tech.id}
              className="text-xs md:text-xs lg:text-xs bg-gray-50 px-2 py-1 rounded-sm text-secondary"
            >
              {tech.name}
            </span>
          ))}
        </div>
      </div>

      <div>
        <Paragraph className="max-w-xl mt-4">{product.description}</Paragraph>
      </div>

      <div className="prose prose-sm md:prose-base max-w-none text-neutral-600">
        <Mdx source={product.contentMdx} />
      </div>

      <a
        href={product.liveUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 group/button rounded-full hover:scale-105 focus:outline-none transition ring-offset-gray-900 bg-gray-800 text-white shadow-lg shadow-black/20 sm:backdrop-blur-sm group-hover/button:bg-gray-50/15 group-hover/button:scale-105 focus-visible:ring-1 focus-visible:ring-offset-2 ring-gray-50/60 text-sm font-medium px-4 py-2 mt-auto origin-left"
      >
        Live Preview
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform"
        >
          <path d="M5 12l14 0"></path>
          <path d="M13 18l6 -6"></path>
          <path d="M13 6l6 6"></path>
        </svg>
      </a>
    </div>
  );
};
