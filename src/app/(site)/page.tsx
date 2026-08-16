import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { Heading } from "@/components/Heading";
import { MdxLead } from "@/components/Mdx";
import { Products } from "@/components/Products";
import { TechStack } from "@/components/TechStack";
import { getPage } from "@/lib/queries";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage("home");
  return { title: page?.seoTitle, description: page?.seoDescription };
}

export default async function Home() {
  const page = await getPage("home");

  return (
    <Container>
      {page?.emoji && <span className="text-4xl">{page.emoji}</span>}
      <Heading className="font-black">{page?.heading}</Heading>

      <MdxLead source={page?.introMdx ?? ""} className="max-w-xl mt-4" />

      <Heading
        as="h2"
        className="font-black text-lg md:text-lg lg:text-lg mt-20 mb-4"
      >
        Projects and Products
      </Heading>
      <Products />

      <Heading
        as="h2"
        className="font-black text-lg md:text-lg lg:text-lg mt-20 mb-4"
      >
        Tech Stack
      </Heading>
      <TechStack />
    </Container>
  );
}
