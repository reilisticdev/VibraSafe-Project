import { useDevice } from "@/lib/store";
import { scheduleEnvelope, rampDownNow } from "../envelope";
import { bearingToPan } from "../bearing";
import type { PatternFactory } from "../types";

/* ==================================================================
   SMOKE ALARM
   ------------------------------------------------------------------
   The real-world standard temporal pattern (UL217 / ISO 8201 "T-3"):
   three 0.5s beeps separated by 0.5s of silence, then a 1.5s pause,
   repeating. Fixed at ~3100Hz, which is the real-world frequency for
   this alert - deliberately NOT the 60-120Hz bass-rumble range that
   applies elsewhere in this module (see Vehicle Approach). That rule
   exists to keep sustained low-frequency energy away from the ear; a
   smoke alarm is a short, high, recognisable beep by design, and a
   low rumble in its place would not read as a smoke alarm to anyone
   at the expo.

   One deliberate deviation from a real detector: a sine tone instead
   of a square/buzzer wave. A square wave at 3.1kHz stacks meaningful
   harmonic energy at 9.3kHz and 15.5kHz, which is harsher than
   necessary for a demo played through headphones at close range.
================================================================== */

const FREQUENCY = 3100;
const PULSE_ON = 0.5;
const PULSE_OFF = 0.5;
const PULSES_PER_CYCLE = 3;
const PAUSE = 1.5;
const CYCLES = 60; // ~3 minutes of schedule; stop() cuts it short well before that

export const createSmokeAlarm: PatternFactory = (ctx, input, { bearing = 0 }) => {
  const t0 = ctx.currentTime;

  const osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.value = FREQUENCY;

  const gain = ctx.createGain();
  const panner = ctx.createStereoPanner();
  panner.pan.value = bearingToPan(bearing); // static - this alert doesn't move

  osc.connect(gain).connect(panner).connect(input);

  let t = t0;
  for (let cycle = 0; cycle < CYCLES; cycle++) {
    for (let pulse = 0; pulse < PULSES_PER_CYCLE; pulse++) {
      scheduleEnvelope(gain.gain, {
        startTime: t,
        sustainLevel: 0.3,
        holdDuration: PULSE_ON - 0.03,
      });
      t += PULSE_ON + PULSE_OFF;
    }
    t += PAUSE - PULSE_OFF;
  }

  osc.start(t0);
  useDevice.getState().pushAlert("alarm", "Smoke alarm", bearing);

  let stopped = false;
  return {
    stop: () => {
      if (stopped) return;
      stopped = true;
      rampDownNow(gain.gain, ctx);
      setTimeout(() => {
        osc.stop();
        [osc, gain, panner].forEach((n) => n.disconnect());
      }, 30);
    },
  };
};
