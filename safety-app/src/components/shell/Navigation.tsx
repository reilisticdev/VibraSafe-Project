"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Radio, Gauge, Waves, MapPin, User } from "lucide-react";

/* ==================================================================
   NAVIGATION
   ------------------------------------------------------------------
   Desktop: a frosted bar that condenses on scroll.
   Mobile:  a fixed bottom tab bar - thumb-reachable, 56px targets,
            which is where a safety app actually needs its controls.

   Real routes, not anchor scrolling: each entry is its own page under
   src/app/, and active-state comes from usePathname() rather than a
   scroll-position guess. This is rendered once from layout.tsx so it
   persists across every route.
================================================================== */

const LINKS = [
  { href: "/dashboard", label: "Dashboard", Icon: Gauge },
  { href: "/simulator", label: "Simulator", Icon: Waves },
  { href: "/safety-network", label: "Network", Icon: MapPin },
  { href: "/responder", label: "Responder", Icon: User },
];

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "border-b border-line bg-void/85 backdrop-blur-xl"
            : "border-b border-transparent"
        }`}
      >
        <nav
          aria-label="Primary"
          className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6"
        >
          <Link href="/" className="flex items-center gap-2.5 font-extrabold">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand text-void">
              <Radio size={20} aria-hidden />
            </span>
            <span className="text-lg tracking-tight">
              Vibra<span className="text-brand">Safe</span>
            </span>
          </Link>

          <ul className="hidden items-center gap-1 md:flex">
            {LINKS.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={isActive(href) ? "page" : undefined}
                  className={`gc-tap rounded-xl px-4 text-sm font-semibold transition ${
                    isActive(href)
                      ? "bg-surface text-ink"
                      : "text-muted hover:bg-surface hover:text-ink"
                  }`}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className="gc-tap hidden rounded-xl bg-ink px-5 text-sm font-bold text-void transition hover:brightness-90 sm:inline-flex"
            >
              Open dashboard
            </Link>
            <button
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              className="gc-tap rounded-xl bg-surface text-ink md:hidden"
            >
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </nav>

        <AnimatePresence>
          {open && (
            <motion.div
              id="mobile-menu"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
              className="overflow-hidden border-t border-line bg-void/95 backdrop-blur-xl md:hidden"
            >
              <ul className="px-4 py-3">
                {LINKS.map(({ href, label, Icon }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      aria-current={isActive(href) ? "page" : undefined}
                      className={`gc-tap w-full justify-start gap-3 rounded-xl px-3 font-semibold ${
                        isActive(href) ? "bg-surface text-ink" : "text-ink"
                      }`}
                    >
                      <Icon size={20} className="text-brand" aria-hidden />
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Mobile tab bar */}
      <nav
        aria-label="Quick navigation"
        className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-void/90 backdrop-blur-xl md:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <ul className="grid grid-cols-4">
          {LINKS.map(({ href, label, Icon }) => {
            const active = isActive(href);
            return (
              <li key={href} className="relative">
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`gc-tap relative w-full flex-col gap-0.5 transition ${
                    active ? "text-brand" : "text-muted active:text-brand"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="nav-pill"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                      className="absolute inset-x-2 top-1 h-0.5 rounded-full bg-brand"
                    />
                  )}
                  <Icon size={20} aria-hidden />
                  <span className="text-[10px] font-bold">{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
