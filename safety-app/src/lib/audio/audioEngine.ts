"use client";

import { useDevice } from "@/lib/store";
import { useSimulator } from "@/lib/simulatorStore";
import { patternRegistry } from "./patterns";
import { scheduleEnvelope } from "./envelope";
import type { PatternId, PatternHandle, PatternOptions } from "./types";

/* ==================================================================
   AUDIO ENGINE
   ------------------------------------------------------------------
   Singleton Web Audio lifecycle for Simulator Mode. Every alert tone
   in this app passes through ONE fixed safety chain before reaching
   the speakers:

     [pattern oscillators/gains/panners]
             -> userVolumeGain   (bound live to useDevice.bcVolume)
             -> masterGain       (FIXED ceiling, never exposed to any
                                   UI control - see MASTER_SAFETY_CEILING)
             -> compressor        (second, independent safety net)
             -> analyser          (read-only tap for the 3D visual sync,
                                   never affects what's actually audible)
             -> destination

   init() MUST be called from inside a user gesture's call stack (the
   "Enable Audio & Calibrate" button's onClick) - browsers refuse to
   start an AudioContext otherwise, and requiring an explicit gesture
   before any alert can play is also the app's own safety rule.
================================================================== */

/** Linear gain ceiling on the master bus, roughly -6 dBFS. Nothing in
 *  the UI can raise this - it is not wired to any slider. */
export const MASTER_SAFETY_CEILING = 0.5;

/** Read once per rAF tick, reused so the read loop never allocates. */
const ENVELOPE_BUFFER = new Float32Array(32);

/** Empirical peak observed on the analyser tap at full volume, post
 *  limiter/compressor - used to normalise the burst reading to 0-1. */
const VISUAL_NORMALIZATION = 0.45;

/* ---- Haptic feedback ----
   Driven by the SAME envelope value already computed every rAF tick
   for liveTactileBurst/liveBoneBurst, rather than a separate
   precomputed pattern array per alert. This one mechanism naturally
   gets all 4 patterns right: continuous tones (Siren, Vehicle
   Approach) re-fire every throttle tick and read as continuous;
   Smoke Alarm's real on/off rhythm drops the envelope below threshold
   during its silence gaps, so the phone stops buzzing in the gaps
   with no separate schedule to keep in sync; SOS Confirmation's two
   bursts each cross the threshold once. Progressive enhancement only
   - iOS Safari has no Vibration API, so this silently no-ops there
   and never gates the audio/visual flow. */
const HAPTIC_MIN_LEVEL = 0.08;
const HAPTIC_THROTTLE_MS = 90;
const HAPTIC_MIN_MS = 40;
const HAPTIC_MAX_MS = 90;

let lastHapticAt = 0;
let vibrationActive = false;

function supportsVibration(): boolean {
  return typeof navigator !== "undefined" && "vibrate" in navigator;
}

function triggerHaptics(level: number, now: number): void {
  if (!supportsVibration()) return;
  if (level < HAPTIC_MIN_LEVEL) {
    if (vibrationActive) {
      navigator.vibrate(0); // cancel - reads as silence, not a hum
      vibrationActive = false;
    }
    return;
  }
  if (now - lastHapticAt < HAPTIC_THROTTLE_MS) return;
  lastHapticAt = now;
  const ms = Math.round(HAPTIC_MIN_MS + level * (HAPTIC_MAX_MS - HAPTIC_MIN_MS));
  navigator.vibrate(ms);
  vibrationActive = true;
}

let ctx: AudioContext | null = null;
let userVolumeGain: GainNode | null = null;
let masterGain: GainNode | null = null;
let compressor: DynamicsCompressorNode | null = null;
let analyser: AnalyserNode | null = null;
let current: PatternHandle | null = null;
let rafId: number | null = null;
let unsubscribeVolume: (() => void) | null = null;

function buildChain(context: AudioContext) {
  userVolumeGain = context.createGain();
  masterGain = context.createGain();
  masterGain.gain.value = MASTER_SAFETY_CEILING;

  compressor = context.createDynamicsCompressor();
  compressor.threshold.value = -6;
  compressor.knee.value = 0;
  compressor.ratio.value = 20;
  compressor.attack.value = 0.003;
  compressor.release.value = 0.25;

  analyser = context.createAnalyser();
  analyser.fftSize = 32;
  analyser.smoothingTimeConstant = 0;

  userVolumeGain.connect(masterGain);
  masterGain.connect(compressor);
  compressor.connect(analyser);
  analyser.connect(context.destination);
}

function handleVisibility() {
  if (!ctx) return;
  if (document.hidden) {
    void ctx.suspend();
    stopRafLoop();
    if (supportsVibration()) navigator.vibrate(0);
    vibrationActive = false;
  } else {
    void ctx.resume();
    if (current) startRafLoop();
  }
}

/** Idempotent - safe to call every time the calibration gate mounts. */
export async function init(): Promise<void> {
  if (ctx) {
    await ctx.resume();
    return;
  }
  ctx = new AudioContext();
  buildChain(ctx);
  await ctx.resume();

  // Plain zustand stores (no subscribeWithSelector middleware) only
  // expose a whole-state listener, so diff bcVolume by hand rather
  // than adding middleware just for this one subscription.
  unsubscribeVolume = useDevice.subscribe((state, prevState) => {
    if (state.bcVolume !== prevState.bcVolume) {
      userVolumeGain?.gain.setTargetAtTime(state.bcVolume / 100, ctx!.currentTime, 0.05);
    }
  });
  userVolumeGain!.gain.value = useDevice.getState().bcVolume / 100;

  document.addEventListener("visibilitychange", handleVisibility);
}

export function isReady(): boolean {
  return !!ctx && ctx.state === "running";
}

/** A short, gentle test tone for the calibration step - lets the
 *  wearer check their volume before any real alert pattern can play.
 *  Bypasses the pattern registry entirely (it's not a simulated alert,
 *  just a level check) but still passes through the same safety chain. */
export function playTestTone(): void {
  if (!ctx || !userVolumeGain) {
    throw new Error("audioEngine.init() must run from a user gesture before playTestTone()");
  }
  const t0 = ctx.currentTime;
  const osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.value = 440;
  const gain = ctx.createGain();
  osc.connect(gain).connect(userVolumeGain);
  scheduleEnvelope(gain.gain, { startTime: t0, sustainLevel: 0.3, holdDuration: 0.4 });
  osc.start(t0);
  osc.stop(t0 + 0.5);
  setTimeout(() => {
    osc.disconnect();
    gain.disconnect();
  }, 550);
}

export function play(pattern: PatternId, opts: PatternOptions = {}): void {
  if (!ctx || !userVolumeGain) {
    throw new Error("audioEngine.init() must run from a user gesture before play()");
  }
  stop(); // mutually exclusive - one simulated alert at a time
  const factory = patternRegistry[pattern];
  current = factory(ctx, userVolumeGain, opts);
  useDevice.getState().setSimulatorActive(true);
  useSimulator.getState().setActivePattern(pattern);
  startRafLoop();
}

export function stop(): void {
  current?.stop();
  current = null;
  stopRafLoop();
  if (supportsVibration()) navigator.vibrate(0);
  vibrationActive = false;
  lastHapticAt = 0;
  useDevice.getState().setSimulatorActive(false);
  useDevice.getState().setLiveTactileBurst(0);
  useDevice.getState().setLiveBoneBurst(0);
  useSimulator.getState().setActivePattern(null);
}

function readEnvelope(): number {
  if (!analyser) return 0;
  analyser.getFloatTimeDomainData(ENVELOPE_BUFFER);
  let peak = 0;
  for (let i = 0; i < ENVELOPE_BUFFER.length; i++) {
    peak = Math.max(peak, Math.abs(ENVELOPE_BUFFER[i]));
  }
  return Math.min(1, peak / VISUAL_NORMALIZATION);
}

function startRafLoop() {
  const tick = () => {
    const level = readEnvelope();
    useDevice.getState().setLiveTactileBurst(level);
    useDevice.getState().setLiveBoneBurst(level);
    triggerHaptics(level, performance.now());
    current?.onFrame?.(ctx!.currentTime);
    rafId = requestAnimationFrame(tick);
  };
  rafId = requestAnimationFrame(tick);
}

function stopRafLoop() {
  if (rafId !== null) cancelAnimationFrame(rafId);
  rafId = null;
}

/** Full teardown - not required for normal Simulator use (the page can
 *  just stop navigating away with a pattern mid-flight), but available
 *  for completeness/tests. */
export function dispose(): void {
  stop();
  document.removeEventListener("visibilitychange", handleVisibility);
  unsubscribeVolume?.();
  unsubscribeVolume = null;
  void ctx?.close();
  ctx = null;
}
