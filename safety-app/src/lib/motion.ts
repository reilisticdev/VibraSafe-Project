/* ==================================================================
   SCROLL-REVEAL MOTION PRIMITIVES
   ------------------------------------------------------------------
   Shared Framer Motion config for the landing page's staggered
   fade-up entrance (eyebrow -> heading -> paragraph -> CTA), inspired
   by the reference template's WOW.js + animate.css scroll reveals but
   implemented natively via Motion's whileInView/variants - no new
   library. Reserved for genuinely scroll-past marketing content
   (src/app/page.tsx); functional app views should render their live
   state immediately, never gated behind a scroll-triggered reveal.
================================================================== */

import type { Variants } from "framer-motion";

export const staggerContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.2, delayChildren: 0 } },
};

export const fadeUpItem: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    // Hardcoded --ease-native: Motion's transition prop runs in JS and
    // can't read CSS custom properties, so the cubic-bezier is
    // duplicated here to stay numerically identical to the CSS token.
    transition: { duration: 0.6, ease: [0.32, 0.72, 0, 1] },
  },
};

/** once:true guarantees a section's reveal fires on the way down and
 *  never re-triggers scrolling back up. */
export const viewportOnce = { once: true, margin: "-80px 0px -80px 0px" } as const;
