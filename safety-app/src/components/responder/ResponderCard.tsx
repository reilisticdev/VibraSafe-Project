"use client";

import { Ear } from "lucide-react";
import { useProfile } from "@/lib/profileStore";
import ContactList from "@/components/contacts/ContactList";
import CommPreferenceToggle from "./CommPreferenceToggle";

/* ==================================================================
   RESPONDER CARD
   ------------------------------------------------------------------
   A compact card meant to be shown to a first responder or a
   stranger in an emergency - states the wearer's hearing status and
   preferred communication method up front, then lists the same
   trusted contacts as the Safety Network view (shared ContactList).
================================================================== */

export default function ResponderCard() {
  const userName = useProfile((s) => s.userName);
  const hearingStatus = useProfile((s) => s.hearingStatus);
  const hasHydrated = useProfile((s) => s._hasHydrated);

  if (!hasHydrated) {
    return (
      <div className="mx-auto max-w-md">
        <div className="gc-card gc-breathe border-brand/30 p-6 text-center" aria-hidden>
          <span className="mx-auto block h-14 w-14 rounded-2xl bg-surface-2" />
          <span className="mx-auto mt-4 block h-4 w-24 rounded bg-surface-2" />
          <span className="mx-auto mt-2 block h-7 w-56 rounded bg-surface-2" />
          <span className="mx-auto mt-4 block h-4 w-64 rounded bg-surface-2" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="gc-card overflow-hidden border-brand/30 p-6 text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand/20 text-brand">
          <Ear size={26} aria-hidden />
        </span>
        <p className="mt-4 text-sm font-semibold text-muted">{userName || "Guest"}</p>
        <h2 className="mt-1 text-2xl font-extrabold tracking-tight">
          I am {hearingStatus === "Deaf" ? "Deaf" : "Hard of Hearing"}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Please face me and speak clearly, or use the method below.
        </p>

        <div className="mt-5">
          <CommPreferenceToggle />
        </div>
      </div>

      <div className="mt-6">
        <p className="gc-label">Emergency contacts</p>
        <div className="mt-2">
          <ContactList />
        </div>
      </div>
    </div>
  );
}
