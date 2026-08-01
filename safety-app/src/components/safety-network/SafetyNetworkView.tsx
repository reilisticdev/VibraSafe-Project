"use client";

import ContactList from "@/components/contacts/ContactList";
import MockMap from "./MockMap";

export default function SafetyNetworkView() {
  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
      <MockMap />
      <div>
        <p className="gc-label">Trusted contacts</p>
        <div className="mt-2">
          <ContactList />
        </div>
      </div>
    </div>
  );
}
