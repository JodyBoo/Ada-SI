let audioContext: AudioContext | null = null

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return null
  if (!audioContext) {
    audioContext = new AudioContext()
  }
  return audioContext
}

function playTone(
  ctx: AudioContext,
  frequency: number,
  start: number,
  duration: number,
  gain: number,
) {
  const osc = ctx.createOscillator()
  const amp = ctx.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(frequency, start)
  amp.gain.setValueAtTime(0.0001, start)
  amp.gain.exponentialRampToValueAtTime(gain, start + 0.02)
  amp.gain.exponentialRampToValueAtTime(0.0001, start + duration)
  osc.connect(amp)
  amp.connect(ctx.destination)
  osc.start(start)
  osc.stop(start + duration + 0.05)
}

export function playUnlockSound(leveledUp: boolean) {
  const ctx = getAudioContext()
  if (!ctx) return

  void ctx.resume()
  const now = ctx.currentTime

  if (leveledUp) {
    playTone(ctx, 523.25, now, 0.18, 0.08)
    playTone(ctx, 659.25, now + 0.1, 0.18, 0.08)
    playTone(ctx, 783.99, now + 0.2, 0.28, 0.09)
  } else {
    playTone(ctx, 587.33, now, 0.12, 0.06)
    playTone(ctx, 783.99, now + 0.08, 0.22, 0.07)
  }
}
