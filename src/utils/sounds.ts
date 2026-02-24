"use client";

// Web Audio API based sound effects - no external files needed
export function createAudioContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    try {
        return new (window.AudioContext ||
            (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    } catch {
        return null;
    }
}

export function playLaunchSound(ctx: AudioContext | null) {
    if (!ctx) return;

    // Rising sweep
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = "sine";
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.5);

    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.5);
}

export function playCountdownBeep(
    ctx: AudioContext | null,
    pitch: number = 440
) {
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = "sine";
    osc.frequency.setValueAtTime(pitch, ctx.currentTime);

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
}

export function playWarpSound(ctx: AudioContext | null) {
    if (!ctx) return;

    // Warp sweep
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(100, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(2000, ctx.currentTime + 1);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(500, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(4000, ctx.currentTime + 1);

    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 1);

    // Impact
    const noise = ctx.createOscillator();
    const noiseGain = ctx.createGain();
    noise.connect(noiseGain);
    noiseGain.connect(ctx.destination);

    noise.type = "square";
    noise.frequency.setValueAtTime(40, ctx.currentTime + 0.8);

    noiseGain.gain.setValueAtTime(0, ctx.currentTime);
    noiseGain.gain.setValueAtTime(0.1, ctx.currentTime + 0.8);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);

    noise.start(ctx.currentTime + 0.8);
    noise.stop(ctx.currentTime + 1.2);
}
