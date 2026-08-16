import Image from "next/image";
import { twMerge } from "tailwind-merge";
import { getTechStack } from "@/lib/queries";

export const TechStack = async () => {
  const stack = await getTechStack();

  if (stack.length === 0) return null;

  return (
    <div className="flex flex-wrap justify-center">
      {stack.map((item) => (
        <div key={item.id} className="flex items-center justify-center p-2">
          <Image
            src={item.logoUrl}
            width={200}
            height={200}
            alt={item.name}
            title={item.name}
            className={twMerge(
              "object-contain",
              item.displayHeight,
              item.displayWidth
            )}
          />
        </div>
      ))}
    </div>
  );
};
