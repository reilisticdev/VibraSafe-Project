"use client";

import { useState } from "react";
import { Headphones, Play } from "lucide-react";
import { useDevice } from "@/lib/store";
import { useSimulator } from "@/lib/simulatorStore";
import { ChannelSlider } from "@/components/device/DeviceControls";
import * as audioEngine from "@/lib/audio/audioEngine";

/* ==================================================================
   CALIBRATION GATE
   ------------------------------------------------------------------
   No alert tone may play until this step completes. Two safety
   reasons converge here: browsers refuse to start an AudioContext
   without a user gesture, and this app's own rule requires an
   explicit "Enable Audio & Calibrate" step before anything plays -
   so the button click satisfies both at once.
================================================================== */

export default function CalibrationGate() {
  const [enabled, setEnabled] = useState(false);
  const bcVolume = useDevice((s) => s.bcVolume);
  const setBcVolume = useDevice((s) => s.setBcVolume);
  const setCalibrated = useSimulator((s) => s.setCalibrated);

  async function handleEnable() {
    await audioEngine.init();
    setEnabled(true);
    audioEngine.playTestTone();
  }

  return (
    <section className="gc-card mx-auto max-w-md p-6 text-center" aria-labelledby="calibrate-h">
      <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-surface-2 text-brand">
        <Headphones size={26} aria-hidden />
      </span>
      <h3 id="calibrate-h" className="mt-4 text-lg font-bold">
        Put on headphones
      </h3>
      <p className="mt-1 text-sm leading-relaxed text-muted">
        Simulated alerts play through this device's own safety-limited output.
        Enable audio to calibrate your volume before any alert can play.
      </p>

      {!enabled ? (
        <button onClick={handleEnable} className="gc-btn gc-btn-primary mt-5 w-full">
          Enable Audio &amp; Calibrate
        </button>
      ) : (
        <div className="mt-5 grid gap-4 text-left">
          <ChannelSlider
            id="calibrate-volume"
            label="Bone conduction volume"
            hint="This also controls how loud every simulated alert plays."
            value={bcVolume}
            onChange={setBcVolume}
            accent="var(--color-bone)"
            Icon={Play}
          />
          <button
            onClick={() => audioEngine.playTestTone()}
            className="gc-btn gc-btn-ghost"
          >
            <Play size={16} aria-hidden />
            Play test tone
          </button>
          <button onClick={() => setCalibrated(true)} className="gc-btn gc-btn-primary">
            Start Simulator
          </button>
        </div>
      )}
    </section>
  );
}
