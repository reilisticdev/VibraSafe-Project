"use client";

import { useEffect, useRef, useState } from "react";
import { BluetoothSearching } from "lucide-react";
import { useDevice } from "@/lib/store";

/* ==================================================================
   PAIRING CODE INPUT
   ------------------------------------------------------------------
   An honest 6-character code entry for the expo demo: this is not a
   real BLE pairing handshake, so the hint code is shown on screen
   rather than pretending any input works. Entering it drives the
   store's EXISTING beginPairing() action, which already fakes a
   2200ms BLE handshake (see src/lib/store.ts) - no new pairing logic
   needed here.
================================================================== */

const CODE_LENGTH = 6;
const DEMO_CODE = "482196";

export default function PairingCodeInput({ onPaired }: { onPaired: () => void }) {
  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const [mismatch, setMismatch] = useState(false);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  const connection = useDevice((s) => s.connection);
  const beginPairing = useDevice((s) => s.beginPairing);

  const code = digits.join("");
  const complete = code.length === CODE_LENGTH && digits.every((d) => d !== "");

  useEffect(() => {
    if (connection === "connected" && complete) onPaired();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connection]);

  function setDigit(index: number, value: string) {
    const next = [...digits];
    next[index] = value;
    setDigits(next);
  }

  function handleChange(index: number, raw: string) {
    const value = raw.replace(/\D/g, "").slice(-1);
    setDigit(index, value);
    setMismatch(false);
    if (value && index < CODE_LENGTH - 1) inputs.current[index + 1]?.focus();
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, CODE_LENGTH);
    if (!pasted) return;
    const next = Array(CODE_LENGTH).fill("");
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    setDigits(next);
    setMismatch(false);
    inputs.current[Math.min(pasted.length, CODE_LENGTH - 1)]?.focus();
  }

  function submit() {
    if (!complete || connection === "pairing") return;
    if (code !== DEMO_CODE) {
      setMismatch(true);
      return;
    }
    beginPairing();
  }

  return (
    <section className="gc-card p-6" aria-labelledby="pairing-h">
      <h3 id="pairing-h" className="text-lg font-bold">
        Enter the code on your cuff
      </h3>
      <p className="mt-1 text-sm text-muted">
        Demo booth code: <span className="font-bold tabular-nums text-brand">{DEMO_CODE}</span>
      </p>

      <div className="mt-5 flex justify-center gap-2" onPaste={handlePaste}>
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => {
              inputs.current[i] = el;
            }}
            value={d}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            inputMode="numeric"
            maxLength={1}
            aria-label={`Digit ${i + 1} of ${CODE_LENGTH}`}
            className={`h-14 w-11 rounded-xl border-2 bg-surface-2 text-center text-2xl font-extrabold tabular-nums text-ink outline-none transition focus:border-brand ${
              mismatch ? "border-sos" : "border-line"
            }`}
          />
        ))}
      </div>

      {mismatch && (
        <p role="alert" className="mt-2 text-center text-sm font-semibold text-sos">
          That code doesn&apos;t match. Try {DEMO_CODE}.
        </p>
      )}

      <button
        onClick={submit}
        disabled={!complete || connection === "pairing"}
        className="gc-btn gc-btn-primary mt-6 w-full disabled:opacity-40"
      >
        {connection === "pairing" ? (
          <>
            <BluetoothSearching size={18} className="animate-pulse" aria-hidden />
            Pairing...
          </>
        ) : (
          "Bind device"
        )}
      </button>

      <p role="status" aria-live="polite" className="sr-only">
        {connection === "pairing" ? "Pairing in progress." : connection === "connected" ? "Device paired." : ""}
      </p>
    </section>
  );
}
