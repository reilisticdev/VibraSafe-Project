"use client";

import { useEffect } from "react";
import { useProfile } from "@/lib/profileStore";
import { useContacts } from "@/lib/contacts";

/* ==================================================================
   STORE HYDRATION
   ------------------------------------------------------------------
   useProfile/useContacts use persist() with skipHydration: true, so
   both the server render and the client's first paint agree on the
   in-code defaults - no localStorage read happens during render, so
   there is no hydration mismatch. This component fires the one
   manual rehydrate() call per store after mount, which is what
   actually loads any persisted profile/contacts. Rendered once from
   layout.tsx next to Navigation so it runs on every route; owns no
   visible UI.
================================================================== */
export default function StoreHydration() {
  useEffect(() => {
    useProfile.persist.rehydrate();
    useContacts.persist.rehydrate();
  }, []);

  return null;
}
