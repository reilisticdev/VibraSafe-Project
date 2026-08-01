/* ==================================================================
   CUFF THEMES
   ------------------------------------------------------------------
   Named by style, not by gender, so anyone can wear any of them.

   IMPORTANT - what a theme may and may not change:
     CAN change:  the concealed wire finish and the visible jewelry.
     CANNOT change:
       - the active tactile colour (always amber) and SOS (always red).
         Safety signals must look identical on every device, or a user
         could pick a palette that hides their own emergency alert.
       - the bone conduction pad, which stays neutral skin-tone so it
         remains discreet against the neck.
================================================================== */

export interface CuffTheme {
  id: string;
  name: string;
  /** One-line description shown under the swatch. */
  blurb: string;
  /** Finish of the concealed behind-ear wire. */
  wire: string;
  /** Resting colour of the visible jewelry on the outer ear. */
  jewel: string;
  /** Secondary accent for the pendant and crescent. */
  accent: string;
  /** How reflective the jewelry reads: 0 = matte, 1 = mirror. */
  metalness: number;
  roughness: number;
}

/** Fixed signal colours. Never themed. */
export const SIGNAL = {
  tactileActive: "#f5a524",
  sos: "#ff4438",
  bonePad: "#c9a88a",
  boneGlow: "#38d9e8",
} as const;

export const THEMES: CuffTheme[] = [
  {
    id: "pearl",
    name: "Pearl",
    blurb: "Cream and soft silver",
    wire: "#cfd6e0",
    jewel: "#f2ece2",
    accent: "#e4dccd",
    metalness: 0.85,
    roughness: 0.22,
  },
  {
    id: "blossom",
    name: "Blossom",
    blurb: "Soft rose",
    wire: "#e0c4c2",
    jewel: "#f5c2c7",
    accent: "#e8a9b4",
    metalness: 0.6,
    roughness: 0.3,
  },
  {
    id: "meadow",
    name: "Meadow",
    blurb: "Fresh mint",
    wire: "#bcd6c6",
    jewel: "#b8e6c9",
    accent: "#93d3ae",
    metalness: 0.6,
    roughness: 0.3,
  },
  {
    id: "lilac",
    name: "Lilac",
    blurb: "Muted violet",
    wire: "#c9c0dd",
    jewel: "#d4c2f0",
    accent: "#b6a2e0",
    metalness: 0.6,
    roughness: 0.3,
  },
  {
    id: "powder",
    name: "Powder",
    blurb: "Powder blue",
    wire: "#bdd0dd",
    jewel: "#b8d8e8",
    accent: "#96c2da",
    metalness: 0.6,
    roughness: 0.3,
  },
];

export function getTheme(id: string): CuffTheme {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}
