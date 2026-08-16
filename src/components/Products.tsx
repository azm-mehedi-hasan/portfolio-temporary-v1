import Image from "next/image";
import Link from "next/link";
import { getProjects } from "@/lib/queries";
import { Heading } from "./Heading";
import { Paragraph } from "./Paragraph";
import { Reveal } from "./Reveal";

/**
 * Server Component. Previously this was "use client", which pulled the entire
 * products module — including every project's long-form case study — into the
 * browser bundle of both `/` and `/projects`.
 */
export const Products = async () => {
  const products = await getProjects();

  return (
    <div>
      <div className="grid grid-cols-1 gap-10">
        {products.map((product, idx) => (
          <Reveal key={product.id} index={idx}>
            <Link
              href={`/projects/${product.slug}`}
              className="group flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 hover:bg-gray-50 rounded-2xl transition duration-200 pt-4"
            >
              <Image
                src={product.thumbnailUrl}
                alt={product.title}
                height="200"
                width="200"
                className="rounded-md"
              />
              <div className="flex flex-col justify-between">
                <div>
                  <Heading
                    as="h4"
                    className="font-black text-lg md:text-lg lg:text-lg "
                  >
                    {product.title}
                  </Heading>
                  <Paragraph className="text-sm md:text-sm lg:text-sm mt-2 max-w-xl">
                    {product.description}
                  </Paragraph>
                </div>
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
            </Link>
          </Reveal>
        ))}
      </div>
    </div>
  );
};
