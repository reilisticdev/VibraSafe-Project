import { useDevice } from "@/lib/store";
import { scheduleEnvelope, rampDownNow } from "../envelope";
import type { PatternFactory } from "../types";

/* ==================================================================
   EMERGENCY SIREN
   ------------------------------------------------------------------
   A continuous sweeping-pitch tone (600-1200Hz) with its own slow
   stereo pan sweep, representing an emergency vehicle's siren moving
   past. Runs until stop() is called - the Simulator's "Stop" control
   or switching to another pattern (play() always stops the current
   one first).
================================================================== */

export const createSiren: PatternFactory = (ctx, input, { bearing = 0 }) => {
  const t0 = ctx.currentTime;

  const carrier = ctx.createOscillator();
  carrier.type = "sine";
  carrier.frequency.value = 900; // center of the 600-1200Hz sweep

  const sweepLfo = ctx.createOscillator();
  sweepLfo.type = "sine";
  sweepLfo.frequency.value = 0.45; // ~2.2s per sweep cycle
  const sweepGain = ctx.createGain();
  sweepGain.gain.value = 300; // +-300Hz swing -> 600-1200Hz range

  const panLfo = ctx.createOscillator();
  panLfo.type = "sine";
  panLfo.frequency.value = 0.6;

  const gainEnv = ctx.createGain();
  const panner = ctx.createStereoPanner();

  sweepLfo.connect(sweepGain).connect(carrier.frequency);
  panLfo.connect(panner.pan);
  carrier.connect(gainEnv).connect(panner).connect(input);

  scheduleEnvelope(gainEnv.gain, { startTime: t0, sustainLevel: 0.35, holdDuration: 60 });
  carrier.start(t0);
  sweepLfo.start(t0);
  panLfo.start(t0);

  useDevice.getState().pushAlert("siren", "Emergency siren", bearing);

  let stopped = false;
  return {
    stop: () => {
      if (stopped) return;
      stopped = true;
      rampDownNow(gainEnv.gain, ctx);
      setTimeout(() => {
        carrier.stop();
        sweepLfo.stop();
        panLfo.stop();
        [carrier, sweepLfo, panLfo, sweepGain, gainEnv, panner].forEach((n) => n.disconnect());
      }, 30);
    },
  };
};
