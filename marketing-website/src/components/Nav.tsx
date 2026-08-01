"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

const LINKS = [
  { href: "#device", label: "Device" },
  { href: "#colors", label: "Color Studio" },
  { href: "#science", label: "The Science" },
];

const EASE = [0.32, 0.72, 0, 1] as const;

export default function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Fully transparent — overlays the hero video directly, no bar
          background. Text keeps a soft drop-shadow instead, so it stays
          legible over whatever passes underneath as the page scrolls. */}
      <header className="fixed inset-x-0 top-0 z-50">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 sm:px-10">
          <a
            href="#top"
            className="flex items-center gap-2.5"
            style={{ filter: "drop-shadow(0 2px 10px rgba(0,0,0,0.55))" }}
          >
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ background: "linear-gradient(135deg, #f5a524, #38d9e8)" }}
              aria-hidden
            />
            <span className="font-display text-sm font-semibold tracking-tight text-ink">
              VibraSafe
            </span>
          </a>

          <div
            className="hidden items-center gap-1 md:flex"
            style={{ filter: "drop-shadow(0 2px 10px rgba(0,0,0,0.55))" }}
          >
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="rounded-full px-4 py-2 text-sm font-medium text-muted transition-colors duration-300 hover:text-ink"
              >
                {l.label}
              </a>
            ))}
          </div>

          <a
            href="#get-started"
            className="gc-btn gc-btn-primary hidden md:inline-flex"
            style={{ filter: "drop-shadow(0 4px 16px rgba(0,0,0,0.35))" }}
          >
            Set up my cuff
            <span className="gc-btn-icon">
              <ArrowUpRight size={16} strokeWidth={1.5} />
            </span>
          </a>

          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="relative flex h-11 w-11 items-center justify-center rounded-full bg-white/[0.08] backdrop-blur-md md:hidden"
          >
            <span className="relative block h-3.5 w-4">
              <span
                className="absolute left-0 top-0 h-[1.5px] w-4 bg-ink transition-all duration-500"
                style={{
                  transform: open ? "translateY(6px) rotate(45deg)" : "translateY(0) rotate(0)",
                  transitionTimingFunction: "cubic-bezier(0.32,0.72,0,1)",
                }}
              />
              <span
                className="absolute left-0 bottom-0 h-[1.5px] w-4 bg-ink transition-all duration-500"
                style={{
                  transform: open ? "translateY(-6px) rotate(-45deg)" : "translateY(0) rotate(0)",
                  transitionTimingFunction: "cubic-bezier(0.32,0.72,0,1)",
                }}
              />
            </span>
          </button>
        </nav>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-2 bg-void/90 backdrop-blur-2xl md:hidden"
          >
            {LINKS.map((l, i) => (
              <motion.a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                initial={{ opacity: 0, y: 48 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: EASE, delay: 0.1 + i * 0.06 }}
                className="font-display text-3xl font-semibold text-ink"
              >
                {l.label}
              </motion.a>
            ))}
            <motion.a
              href="#get-started"
              onClick={() => setOpen(false)}
              initial={{ opacity: 0, y: 48 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE, delay: 0.1 + LINKS.length * 0.06 }}
              className="gc-btn gc-btn-primary mt-6"
            >
              Set up my cuff
              <span className="gc-btn-icon">
                <ArrowUpRight size={16} strokeWidth={1.5} />
              </span>
            </motion.a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
