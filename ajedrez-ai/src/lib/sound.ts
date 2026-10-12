// Synthesizes a short percussive "tap" sound using the Web Audio API.
// No external sound files; the buffer is generated at runtime.

let cachedCtx: AudioContext | null = null;

const getCtx = (): AudioContext | null => {
  if (cachedCtx) return cachedCtx;
  try {
    const AudioCtx =
      typeof window !== "undefined"
        ? window.AudioContext ||
          (window as unknown as { webkitAudioContext?: typeof AudioContext })
            .webkitAudioContext
        : undefined;
    if (!AudioCtx) return null;
    cachedCtx = new AudioCtx();
    return cachedCtx;
  } catch {
    return null;
  }
}

export const playMoveSound = () => {
  const ctx = getCtx();
  if (!ctx) return;
  if (ctx.state === "suspended") {
    ctx.resume().catch(() => {});
  }

  // Bandpass-filtered noise burst with a quick exponential decay — reads as a
  // short wooden "tap" without sounding like a synth beep.
  const sampleRate = ctx.sampleRate;
  const length = Math.floor(sampleRate * 0.07);
  const buffer = ctx.createBuffer(1, length, sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) {
    const decay = Math.exp(-i / (sampleRate * 0.012));
    data[i] = (Math.random() * 2 - 1) * decay;
  }

  const source = ctx.createBufferSource();
  source.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 720;
  filter.Q.value = 1.1;

  const gain = ctx.createGain();
  gain.gain.value = 0.4;

  source.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  source.start();
  source.stop(ctx.currentTime + 0.1);
}
