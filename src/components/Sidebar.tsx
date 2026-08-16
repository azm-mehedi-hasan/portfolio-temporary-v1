"use client";
import { isMobile } from "@/lib/utils";
import { getIcon } from "@/lib/icons";
import { IconLayoutSidebarRightCollapse } from "@tabler/icons-react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";
import { Badge } from "./Badge";
import { Heading } from "./Heading";

export type SidebarLink = {
  id: string;
  label: string;
  href: string;
  iconName: string;
};

export const Sidebar = ({
  navlinks,
  socials,
  ownerName,
  role,
  avatarUrl,
}: {
  navlinks: SidebarLink[];
  socials: SidebarLink[];
  ownerName: string;
  role: string;
  avatarUrl: string;
}) => {
  // Start open on both server and client so the markup matches, then collapse
  // on mobile after mount. Deriving this during render caused a hydration
  // mismatch: the server has no `window`, so it always rendered the open state.
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (isMobile()) setOpen(false);
  }, []);

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: -200 }}
            animate={{ x: 0 }}
            transition={{ duration: 0.2, ease: "linear" }}
            exit={{ x: -200 }}
            className="px-6  z-[100] py-10 bg-neutral-100 max-w-[14rem] lg:w-fit  fixed lg:relative  h-screen left-0 flex flex-col justify-between"
          >
            <div className="flex-1 overflow-auto">
              <SidebarHeader
                ownerName={ownerName}
                role={role}
                avatarUrl={avatarUrl}
              />
              <Navigation
                navlinks={navlinks}
                socials={socials}
                setOpen={setOpen}
              />
            </div>
            <div onClick={() => isMobile() && setOpen(false)}>
              <Badge href="/resume" text="Read Resume" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <button
        className="fixed lg:hidden bottom-4 right-4 h-8 w-8 border border-neutral-200 rounded-full backdrop-blur-sm flex items-center justify-center z-50"
        onClick={() => setOpen(!open)}
        aria-label="Toggle navigation"
      >
        <IconLayoutSidebarRightCollapse className="h-4 w-4 text-secondary" />
      </button>
    </>
  );
};

export const Navigation = ({
  navlinks,
  socials,
  setOpen,
}: {
  navlinks: SidebarLink[];
  socials: SidebarLink[];
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href;

  return (
    <div className="flex flex-col space-y-1 my-10 relative z-[100]">
      {navlinks.map((link) => {
        const Icon = getIcon(link.iconName);
        return (
          <Link
            key={link.id}
            href={link.href}
            onClick={() => isMobile() && setOpen(false)}
            className={twMerge(
              "text-secondary hover:text-primary transition duration-200 flex items-center space-x-2 py-2 px-2 rounded-md text-sm",
              isActive(link.href) && "bg-white shadow-lg text-primary"
            )}
          >
            <Icon
              className={twMerge(
                "h-4 w-4 flex-shrink-0",
                isActive(link.href) && "text-sky-500"
              )}
            />
            <span>{link.label}</span>
          </Link>
        );
      })}

      <Heading as="p" className="text-sm md:text-sm lg:text-sm pt-10 px-2">
        Socials
      </Heading>
      {socials.map((link) => {
        const Icon = getIcon(link.iconName);
        return (
          <Link
            key={link.id}
            href={link.href}
            className="text-secondary hover:text-primary transition duration-200 flex items-center space-x-2 py-2 px-2 rounded-md text-sm"
          >
            <Icon className="h-4 w-4 flex-shrink-0" />
            <span>{link.label}</span>
          </Link>
        );
      })}
    </div>
  );
};

const SidebarHeader = ({
  ownerName,
  role,
  avatarUrl,
}: {
  ownerName: string;
  role: string;
  avatarUrl: string;
}) => {
  return (
    <div className="flex space-x-2">
      <Image
        src={avatarUrl}
        alt={ownerName}
        height="40"
        width="40"
        className="object-cover object-top rounded-full flex-shrink-0"
      />
      <div className="flex text-sm flex-col">
        <p className="font-bold text-primary">{ownerName}</p>
        <p className="font-light text-secondary">{role}</p>
      </div>
    </div>
  );
};
