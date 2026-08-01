"use client";

import { Phone, UserRound, X } from "lucide-react";
import { useContacts } from "@/lib/contacts";

/* ==================================================================
   CONTACT LIST
   ------------------------------------------------------------------
   Shared by the Safety Network view and the Responder Card - both
   must show the exact same contacts, so this reads useContacts
   directly rather than either view keeping its own copy.
================================================================== */

export default function ContactList() {
  const contacts = useContacts((s) => s.contacts);
  const removeContact = useContacts((s) => s.removeContact);
  const hasHydrated = useContacts((s) => s._hasHydrated);

  if (!hasHydrated) {
    return (
      <ul className="grid gap-3" aria-hidden>
        {[0, 1].map((i) => (
          <li key={i} className="gc-card gc-breathe h-[76px] p-4" />
        ))}
      </ul>
    );
  }

  return (
    <ul className="grid gap-3">
      {contacts.map((c) => (
        <li key={c.id} className="gc-card flex items-center justify-between gap-3 p-4">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-surface-2 text-brand">
              <UserRound size={20} aria-hidden />
            </span>
            <div>
              <p className="font-bold">{c.name}</p>
              <p className="text-sm text-muted">{c.relationship}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`tel:${c.phone.replace(/\s/g, "")}`}
              className="gc-tap gap-2 rounded-xl bg-surface-2 px-3 text-sm font-semibold text-safe"
              aria-label={`Call ${c.name}`}
            >
              <Phone size={16} aria-hidden />
              {c.phone}
            </a>
            <button
              onClick={() => removeContact(c.id)}
              aria-label={`Remove ${c.name}`}
              className="gc-tap rounded-xl text-faint hover:text-sos"
            >
              <X size={16} aria-hidden />
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
