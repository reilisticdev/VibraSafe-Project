import { useDevice } from "@/lib/store";
import { scheduleEnvelope } from "../envelope";
import type { PatternFactory } from "../types";

/* ==================================================================
   SOS CONFIRMATION
   ------------------------------------------------------------------
   Two short 1kHz bursts, hard-left then hard-right, confirming the
   wearer's SOS was registered. Reuses the EXISTING triggerSos()/
   clearSos() actions rather than adding any new plumbing -
   VibraSafeModel.tsx's SOS branch already makes all four tactile
   nodes red-pulse, the status LED red-flash, and the assembly shake,
   so this pattern only needs to flip that flag and clear it again.
================================================================== */

const BURST_GAP = 0.16;
const AUTO_CLEAR_MS = 2500;

function burst(ctx: AudioContext, input: GainNode, startTime: number, pan: number) {
  const osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.value = 1000;
  const gain = ctx.createGain();
  const panner = ctx.createStereoPanner();
  panner.pan.value = pan;
  osc.connect(gain).connect(panner).connect(input);
  scheduleEnvelope(gain.gain, {
    startTime,
    attack: 0.012,
    sustainLevel: 0.4,
    holdDuration: 0.09,
    release: 0.015,
  });
  osc.start(startTime);
  osc.stop(startTime + 0.15);
  setTimeout(() => [osc, gain, panner].forEach((n) => n.disconnect()), (startTime - ctx.currentTime + 0.2) * 1000);
}

export const createSosConfirm: PatternFactory = (ctx, input) => {
  const t0 = ctx.currentTime;
  burst(ctx, input, t0, -1);
  burst(ctx, input, t0 + BURST_GAP, 1);

  useDevice.getState().triggerSos();
  const clearTimer = setTimeout(() => useDevice.getState().clearSos(), AUTO_CLEAR_MS);

  let stopped = false;
  return {
    stop: () => {
      if (stopped) return;
      stopped = true;
      clearTimeout(clearTimer);
      useDevice.getState().clearSos();
    },
  };
};
