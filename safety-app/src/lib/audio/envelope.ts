/* ==================================================================
   ENVELOPE HELPERS
   ------------------------------------------------------------------
   Every audible transition in this app must be a ramp, never a jump.
   A hard setValueAtTime step on a live gain value produces an audible
   click/pop and, at the margins, something closer to clipping - so
   every pattern in patterns/ routes its gain changes through
   scheduleEnvelope or rampDownNow instead of touching AudioParams
   directly. 10-20ms is enough to be inaudible as a transition while
   staying tight enough not to blur short pulses (e.g. the smoke alarm
   beep, SOS bursts) into mush.
================================================================== */

interface EnvelopeOptions {
  /** AudioContext time the attack ramp begins. */
  startTime: number;
  /** Attack ramp duration, seconds. Keep within 0.010-0.020. */
  attack?: number;
  /** Peak linear gain to hold at. */
  sustainLevel: number;
  /** How long to hold at sustainLevel before releasing, seconds. */
  holdDuration: number;
  /** Release ramp duration, seconds. Keep within 0.010-0.020. */
  release?: number;
}

/** Click-free attack -> hold -> release envelope. The only
 *  setValueAtTime call anchors an inaudible floor (0.0001) as the
 *  ramp's starting point - it is never used for an audible jump. */
export function scheduleEnvelope(
  gain: AudioParam,
  { startTime, attack = 0.015, sustainLevel, holdDuration, release = 0.015 }: EnvelopeOptions
): void {
  gain.cancelScheduledValues(startTime);
  gain.setValueAtTime(0.0001, startTime);
  gain.linearRampToValueAtTime(sustainLevel, startTime + attack);
  gain.setValueAtTime(sustainLevel, startTime + attack + holdDuration);
  gain.linearRampToValueAtTime(0.0001, startTime + attack + holdDuration + release);
}

/** Early/manual stop - ramps down from whatever the gain's current
 *  value is right now, used when a pattern is interrupted mid-flight
 *  (e.g. the user hits "Stop" partway through a siren sweep). */
export function rampDownNow(gain: AudioParam, ctx: AudioContext, release = 0.015): void {
  const now = ctx.currentTime;
  gain.cancelScheduledValues(now);
  gain.setValueAtTime(gain.value, now);
  gain.linearRampToValueAtTime(0.0001, now + release);
}
