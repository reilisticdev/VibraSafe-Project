"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { generateId } from "@/lib/generateId";

/* ==================================================================
   EMERGENCY CONTACTS
   ------------------------------------------------------------------
   Single shared source for both the Safety Network view and the
   Responder Card - both must show the exact same list, so this store
   is the only place contact data lives. Do not duplicate it locally
   in either view.

   Persisted (unlike useDevice/useSimulator): an accidental refresh at
   an expo booth must not wipe a wearer's edited contact list. Seed
   IDs are stable string literals rather than a generated ID -
   generating one inside this initializer would run once in the Node
   server process and once in the browser, producing two different
   IDs for the same seed contact on the very first render. addContact
   uses generateId() (not crypto.randomUUID() directly) since this app
   is tested/demoed over a plain HTTP LAN IP, which is not a secure
   context - crypto.randomUUID() is undefined there.

   skipHydration + the _hasHydrated flag exist so the server render
   and the client's first paint both show these coded defaults - the
   actual localStorage read is deferred to a manual rehydrate() call
   (see src/components/shell/StoreHydration.tsx), which is what avoids
   a hydration mismatch. Consumers that render `contacts` as visible
   text on first mount (ContactList.tsx) must gate on _hasHydrated.
================================================================== */

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
}

interface ContactsStore {
  contacts: EmergencyContact[];
  _hasHydrated: boolean;
  _setHasHydrated: (v: boolean) => void;
  addContact: (c: Omit<EmergencyContact, "id">) => void;
  removeContact: (id: string) => void;
}

export const useContacts = create<ContactsStore>()(
  persist(
    (set) => ({
      contacts: [
        { id: "contact-mom", name: "Mom", relationship: "Parent", phone: "+27 82 000 0001" },
        { id: "contact-jordan", name: "Jordan", relationship: "Roommate", phone: "+27 82 000 0002" },
      ],

      _hasHydrated: false,
      _setHasHydrated: (v) => set({ _hasHydrated: v }),

      addContact: (c) =>
        set((s) => ({ contacts: [...s.contacts, { ...c, id: generateId() }] })),

      removeContact: (id) =>
        set((s) => ({ contacts: s.contacts.filter((c) => c.id !== id) })),
    }),
    {
      name: "gc-contacts",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (s) => ({ contacts: s.contacts }),
      onRehydrateStorage: () => (state) => {
        state?._setHasHydrated(true);
      },
    }
  )
);
