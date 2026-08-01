"use client";

import { useState } from "react";
import type { HearingStatus } from "@/lib/profileStore";

const STATUS_OPTIONS: HearingStatus[] = ["Deaf", "Hard of Hearing"];

export default function ProfileQuickForm({
  onComplete,
}: {
  onComplete: (p: { userName: string; hearingStatus: HearingStatus }) => void;
}) {
  const [userName, setUserName] = useState("");
  const [hearingStatus, setHearingStatus] = useState<HearingStatus>("Deaf");

  return (
    <section className="gc-card p-6" aria-labelledby="profile-h">
      <h3 id="profile-h" className="text-lg font-bold">
        Tell us a little about you
      </h3>
      <p className="mt-1 text-sm text-muted">
        Shown on your Responder Card for first responders and new contacts.
      </p>

      <label htmlFor="onboarding-name" className="mt-5 block text-sm font-semibold text-muted">
        Name
      </label>
      <input
        id="onboarding-name"
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
        placeholder="Alex Morgan"
        className="mt-1.5 w-full rounded-xl border-2 border-line bg-surface-2 px-4 py-3 text-base font-semibold text-ink outline-none transition focus:border-brand"
      />

      <fieldset className="mt-5">
        <legend className="text-sm font-semibold text-muted">Hearing status</legend>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {STATUS_OPTIONS.map((status) => (
            <button
              key={status}
              type="button"
              aria-pressed={hearingStatus === status}
              onClick={() => setHearingStatus(status)}
              className={`gc-tap rounded-xl border-2 px-3 text-sm font-bold transition ${
                hearingStatus === status
                  ? "border-brand bg-brand/20 text-brand"
                  : "border-line bg-surface-2 text-muted hover:border-muted"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </fieldset>

      <button
        onClick={() => onComplete({ userName: userName.trim() || "Guest", hearingStatus })}
        className="gc-btn gc-btn-primary mt-6 w-full"
      >
        Continue to pairing
      </button>
    </section>
  );
}
