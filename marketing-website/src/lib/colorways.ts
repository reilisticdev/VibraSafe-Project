/* ==================================================================
   COLORWAYS
   ------------------------------------------------------------------
   Mirrors the exact 5 cosmetic themes and hex values defined in the
   companion app (../safety-app/src/lib/themes.ts), so the marketing
   site and the real product never disagree on what "Meadow" or
   "Lilac" looks like. A theme changes wire finish and jewelry only —
   never the safety-signal colours, which stay fixed everywhere.
================================================================== */

export interface Colorway {
  id: string;
  name: string;
  blurb: string;
  /** Concealed behind-ear wire finish. */
  wire: string;
  /** Resting colour of the visible outer-ear jewelry. */
  jewel: string;
  /** Secondary accent — drives this section's ambient background glow. */
  accent: string;
  image: string;
}

export const COLORWAYS: Colorway[] = [
  {
    id: "pearl",
    name: "Pearl",
    blurb: "Cream and soft silver",
    wire: "#cfd6e0",
    jewel: "#f2ece2",
    accent: "#e4dccd",
    image: "/cuff-pearl.png",
  },
  {
    id: "blossom",
    name: "Blossom",
    blurb: "Soft rose",
    wire: "#e0c4c2",
    jewel: "#f5c2c7",
    accent: "#e8a9b4",
    image: "/cuff-blossom.png",
  },
  {
    id: "meadow",
    name: "Meadow",
    blurb: "Fresh mint",
    wire: "#bcd6c6",
    jewel: "#b8e6c9",
    accent: "#93d3ae",
    image: "/cuff-meadow.png",
  },
  {
    id: "lilac",
    name: "Lilac",
    blurb: "Muted violet",
    wire: "#c9c0dd",
    jewel: "#d4c2f0",
    accent: "#b6a2e0",
    image: "/cuff-lilac.png",
  },
  {
    id: "powder",
    name: "Powder",
    blurb: "Powder blue",
    wire: "#bdd0dd",
    jewel: "#b8d8e8",
    accent: "#96c2da",
    image: "/cuff-powder.png",
  },
];
