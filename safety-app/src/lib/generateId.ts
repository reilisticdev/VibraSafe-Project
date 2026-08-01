/** Generates a unique-enough string ID without depending on
 *  crypto.randomUUID(), which browsers restrict to secure contexts
 *  (HTTPS or localhost) - a plain HTTP LAN IP, exactly how this app
 *  gets tested/demoed on a phone, is NOT a secure context, so
 *  crypto.randomUUID is undefined there (confirmed via a real crash).
 *  Nothing that uses this ID is security-sensitive (React keys, tel:
 *  href dedup, alert-history entries), so the Math.random() fallback
 *  is fine - this only needs to avoid collisions, not be unguessable. */
export function generateId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
