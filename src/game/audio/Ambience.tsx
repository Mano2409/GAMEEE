import { useEffect, useRef } from 'react'
import { useGame } from '../../state/game'
export function Ambience() {
  const volume = useGame(s => s.volume)
  const notice = useGame(s => s.notice)
  const audio = useRef<{ context: AudioContext; gain: GainNode }>()
  useEffect(() => {
    const start = () => {
      if (audio.current) { void audio.current.context.resume(); return }
      const context = new AudioContext(); const gain = context.createGain(); gain.gain.value = useGame.getState().volume * .11; gain.connect(context.destination)
      const hum = context.createOscillator(); hum.frequency.value = 60; hum.type = 'sine'; hum.connect(gain); hum.start()
      const buffer = context.createBuffer(1, context.sampleRate * 3, context.sampleRate)
      const samples = buffer.getChannelData(0); for (let i = 0; i < samples.length; i++) samples[i] = Math.random() * .6 - .3
      const noise = context.createBufferSource(); noise.buffer = buffer; noise.loop = true
      const filter = context.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 350
      noise.connect(filter); filter.connect(gain); noise.start(); audio.current = { context, gain }
    }
    document.addEventListener('pointerdown', start)
    const visibility = () => { if (document.hidden) void audio.current?.context.suspend(); else if (audio.current) void audio.current.context.resume() }
    document.addEventListener('visibilitychange', visibility)
    return () => { document.removeEventListener('pointerdown', start); document.removeEventListener('visibilitychange', visibility); void audio.current?.context.close(); audio.current = undefined }
  }, [])
  useEffect(() => { if (audio.current) audio.current.gain.gain.setTargetAtTime(volume * .11, audio.current.context.currentTime, .1) }, [volume])
  useEffect(() => {
    if (!notice || !audio.current) return
    const { context } = audio.current; const tone = context.createOscillator(); const gain = context.createGain()
    tone.frequency.value = 620; gain.gain.setValueAtTime(volume * .06, context.currentTime); gain.gain.exponentialRampToValueAtTime(.0001, context.currentTime + .15)
    tone.connect(gain); gain.connect(context.destination); tone.start(); tone.stop(context.currentTime + .2)
  }, [notice, volume])
  return null
}
