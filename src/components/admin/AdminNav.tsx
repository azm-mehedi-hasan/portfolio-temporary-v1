"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { twMerge } from "tailwind-merge";
import { logout } from "@/lib/actions/auth";
import { Button } from "./ui";

const GROUPS: { heading: string; links: { href: string; label: string }[] }[] = [
  {
    heading: "Overview",
    links: [{ href: "/admin", label: "Dashboard" }],
  },
  {
    heading: "Content",
    links: [
      { href: "/admin/projects", label: "Projects" },
      { href: "/admin/posts", label: "Articles" },
      { href: "/admin/pages", label: "Page copy" },
    ],
  },
  {
    heading: "Page sections",
    links: [
      { href: "/admin/tech", label: "Tech stack" },
      { href: "/admin/timeline", label: "Timeline" },
      { href: "/admin/gallery", label: "About gallery" },
      { href: "/admin/navigation", label: "Navigation" },
    ],
  },
  {
    heading: "Inbox & assets",
    links: [
      { href: "/admin/messages", label: "Messages" },
      { href: "/admin/media", label: "Media" },
    ],
  },
  {
    heading: "Configuration",
    links: [{ href: "/admin/settings", label: "Settings" }],
  },
];

export function AdminNav({
  name,
  email,
  unreadCount,
}: {
  name: string;
  email: string;
  unreadCount: number;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="lg:hidden fixed bottom-4 right-4 z-50 rounded-full bg-neutral-900 px-4 py-2 text-sm text-white shadow-lg"
        aria-expanded={open}
      >
        {open ? "Close" : "Menu"}
      </button>

      <aside
        className={twMerge(
          "w-60 shrink-0 border-r border-neutral-200 bg-white flex-col justify-between",
          "fixed inset-y-0 left-0 z-40 lg:sticky lg:top-0 lg:h-screen lg:flex",
          open ? "flex" : "hidden"
        )}
      >
        <div className="flex-1 overflow-y-auto p-4">
          <Link
            href="/"
            target="_blank"
            className="mb-6 block rounded-md bg-neutral-50 px-3 py-2.5 ring-1 ring-neutral-200 hover:bg-neutral-100"
          >
            <p className="text-sm font-semibold text-neutral-900">{name}</p>
            <p className="text-xs text-neutral-500">View live site &rarr;</p>
          </Link>

          <nav className="flex flex-col gap-5">
            {GROUPS.map((group) => (
              <div key={group.heading} className="flex flex-col gap-1">
                <p className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                  {group.heading}
                </p>
                {group.links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={twMerge(
                      "flex items-center justify-between rounded-md px-2 py-1.5 text-sm transition",
                      isActive(link.href)
                        ? "bg-neutral-900 text-white"
                        : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                    )}
                  >
                    <span>{link.label}</span>
                    {link.href === "/admin/messages" && unreadCount > 0 && (
                      <span className="rounded-full bg-emerald-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                        {unreadCount}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            ))}
          </nav>
        </div>

        <div className="border-t border-neutral-200 p-4">
          <p className="mb-2 truncate text-xs text-neutral-500" title={email}>
            {email}
          </p>
          <form action={logout}>
            <Button variant="secondary" size="sm" type="submit" className="w-full">
              Sign out
            </Button>
          </form>
        </div>
      </aside>
    </>
  );
}
