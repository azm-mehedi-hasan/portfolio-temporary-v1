import { IconCircleCheckFilled } from "@tabler/icons-react";
import React from "react";
import { getTimeline } from "@/lib/queries";
import { Heading } from "./Heading";
import { Paragraph } from "./Paragraph";

export const WorkHistory = async () => {
  const timeline = await getTimeline();

  return (
    <div className="relative bg-white py-8 px-4">
      {timeline.map((item, index) => (
        <div
          key={item.id}
          className={`relative flex flex-col md:flex-row items-start space-y-6 md:space-y-0 md:space-x-6 my-12 pl-10 ${
            index % 2 === 0 ? "md:flex-row-reverse" : ""
          }`}
        >
          <div className="absolute left-0 md:left-auto md:right-0 transform -translate-x-8 md:translate-x-8">
            <div className="w-6 h-6 bg-black rounded-full border-2 border-white shadow-sm"></div>
          </div>

          <Paragraph className="text-black font-semibold text-sm md:text-md md:w-32">
            {item.dateLabel}
          </Paragraph>

          <div className="bg-white shadow-sm rounded-lg p-6 w-full max-w-3xl hover:shadow-md transition-shadow duration-300 border border-black">
            <Heading as="h5" className="text-lg md:text-xl font-bold text-black">
              {item.title}
            </Heading>
            <Paragraph className="text-sm md:text-base font-medium text-black mt-2">
              {item.description}
            </Paragraph>
            <ul className="mt-4 space-y-2">
              {item.responsibilities.map((responsibility, idx) => (
                <Step key={`${item.id}-${idx}`}>{responsibility}</Step>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
};

const Step = ({ children }: { children: React.ReactNode }) => {
  return (
    <li className="flex space-x-3 items-start">
      <IconCircleCheckFilled className="h-5 w-5 text-black mt-1" />
      <Paragraph className="text-sm md:text-base text-black">
        {children}
      </Paragraph>
    </li>
  );
};
