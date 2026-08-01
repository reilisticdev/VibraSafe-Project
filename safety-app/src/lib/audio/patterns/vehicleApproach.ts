import { useDevice } from "@/lib/store";
import { rampDownNow } from "../envelope";
import type { PatternFactory } from "../types";

/* ==================================================================
   VEHICLE APPROACH
   ------------------------------------------------------------------
   Two layers sharing one panner, over a fixed ~6s pass:
     - Engine rumble: 80Hz sine through a lowpass, kept in the
       60-120Hz range required for bass content in this app. Sustained
       low-frequency energy near the ear canal's resonance can feel
       disproportionately intense at high SPL, so the fundamental is
       anchored at 80Hz with a lowpass keeping energy away from the
       2-5kHz sensitivity region entirely - this is the one place in
       the module that constraint actually applies.
     - Tire/engine whine: sawtooth through a bandpass, carrying the
       audible Doppler shift (rises while approaching, drops sharply
       at the pass point, settles after).

   Amplitude for both layers follows a bell curve peaking at the
   midpoint ("passing" the listener), and onFrame() sweeps the store's
   bearing live across the pass so the 3D model's active tactile node
   visibly moves left -> front -> right in sync with the audio.
================================================================== */

const DURATION = 6;
const START_BEARING = 270; // approaching from the left
const END_BEARING = 90; // passing off to the right

export const createVehicleApproach: PatternFactory = (ctx, input) => {
  const t0 = ctx.currentTime;

  const rumble = ctx.createOscillator();
  rumble.type = "sine";
  rumble.frequency.value = 80;
  const rumbleFilter = ctx.createBiquadFilter();
  rumbleFilter.type = "lowpass";
  rumbleFilter.frequency.value = 150;
  const rumbleGain = ctx.createGain();

  const whine = ctx.createOscillator();
  whine.type = "sawtooth";
  whine.frequency.value = 320;
  const whineFilter = ctx.createBiquadFilter();
  whineFilter.type = "bandpass";
  whineFilter.frequency.value = 600;
  whineFilter.Q.value = 0.7;
  const whineGain = ctx.createGain();

  const panner = ctx.createStereoPanner(); // shared, so both layers pan identically

  rumble.connect(rumbleFilter).connect(rumbleGain).connect(panner);
  whine.connect(whineFilter).connect(whineGain).connect(panner);
  panner.connect(input);

  [
    { gain: rumbleGain, peak: 0.4 },
    { gain: whineGain, peak: 0.18 },
  ].forEach(({ gain, peak }) => {
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.linearRampToValueAtTime(peak, t0 + DURATION / 2);
    gain.gain.linearRampToValueAtTime(0.0001, t0 + DURATION);
  });

  whine.frequency.setValueAtTime(320, t0);
  whine.frequency.linearRampToValueAtTime(360, t0 + DURATION / 2);
  whine.frequency.linearRampToValueAtTime(260, t0 + DURATION / 2 + 0.4);
  whine.frequency.linearRampToValueAtTime(300, t0 + DURATION);

  rumble.start(t0);
  whine.start(t0);
  useDevice.getState().pushAlert("vehicle", "Vehicle approaching", START_BEARING);

  let stopped = false;
  function teardown() {
    if (stopped) return;
    stopped = true;
    rumble.stop();
    whine.stop();
    [rumble, whine, rumbleFilter, whineFilter, rumbleGain, whineGain, panner].forEach((n) =>
      n.disconnect()
    );
  }

  const selfStopTimer = setTimeout(teardown, DURATION * 1000 + 200);

  return {
    onFrame: (currentTime) => {
      if (stopped) return;
      const elapsed = currentTime - t0;
      const progress = Math.min(1, elapsed / DURATION);
      const sweep = START_BEARING + (END_BEARING - START_BEARING + 360) % 360 * progress;
      useDevice.getState().setBearing(sweep);
      panner.pan.setValueAtTime(-1 + 2 * progress, ctx.currentTime);
    },
    stop: () => {
      clearTimeout(selfStopTimer);
      if (stopped) return;
      rampDownNow(rumbleGain.gain, ctx);
      rampDownNow(whineGain.gain, ctx);
      setTimeout(teardown, 30);
    },
  };
};
