"use client";

import { motion } from "framer-motion";
import React from "react";

/**
 * Tiny client leaf for the staggered entrance animation.
 *
 * Exists so list components (Products, Blogs, gallery) can stay Server
 * Components: only this wrapper ships to the browser, not the content it wraps.
 */
export function Reveal({
  index = 0,
  from = "left",
  className,
  children,
}: {
  index?: number;
  from?: "left" | "up" | "scale";
  className?: string;
  children: React.ReactNode;
}) {
  const initial =
    from === "left"
      ? { opacity: 0, x: -50 }
      : from === "up"
      ? { opacity: 0, y: 30 }
      : { opacity: 0, scale: 0.95 };

  const animate =
    from === "left"
      ? { opacity: 1, x: 0 }
      : from === "up"
      ? { opacity: 1, y: 0 }
      : { opacity: 1, scale: 1 };

  return (
    <motion.div
      initial={initial}
      animate={animate}
      transition={{ duration: from === "scale" ? 0.5 : 0.2, delay: index * 0.1 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
