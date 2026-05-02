// Simple Web Audio API Synthesizer for UI sound design
class AudioFXController {
  constructor() {
    this.ctx = null
    this.ambientOsc = null
    this.ambientGain = null
    this.initialized = false
  }

  init() {
    if (this.initialized) return
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext
      this.ctx = new AudioContext()
      this.initialized = true
      this.startAmbient()
    } catch (e) {
      console.warn('Web Audio API not supported')
    }
  }

  startAmbient() {
    if (!this.ctx) return
    this.ambientOsc = this.ctx.createOscillator()
    this.ambientGain = this.ctx.createGain()
    
    // Very low, subtle drone (C2)
    this.ambientOsc.type = 'sine'
    this.ambientOsc.frequency.setValueAtTime(65.41, this.ctx.currentTime) // C2
    
    this.ambientGain.gain.setValueAtTime(0, this.ctx.currentTime)
    this.ambientGain.gain.linearRampToValueAtTime(0.02, this.ctx.currentTime + 5) // Fade in over 5 seconds
    
    this.ambientOsc.connect(this.ambientGain)
    this.ambientGain.connect(this.ctx.destination)
    this.ambientOsc.start()
  }

  playHover() {
    if (!this.ctx) return
    if (this.ctx.state === 'suspended') this.ctx.resume()

    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()
    
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(800, this.ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.1)
    
    gain.gain.setValueAtTime(0, this.ctx.currentTime)
    gain.gain.linearRampToValueAtTime(0.05, this.ctx.currentTime + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1)
    
    osc.connect(gain)
    gain.connect(this.ctx.destination)
    osc.start()
    osc.stop(this.ctx.currentTime + 0.1)
  }

  playClick() {
    if (!this.ctx) return
    if (this.ctx.state === 'suspended') this.ctx.resume()

    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()
    
    osc.type = 'square'
    osc.frequency.setValueAtTime(150, this.ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.1)
    
    gain.gain.setValueAtTime(0.1, this.ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1)
    
    osc.connect(gain)
    gain.connect(this.ctx.destination)
    osc.start()
    osc.stop(this.ctx.currentTime + 0.1)
  }
}

export const AudioFX = new AudioFXController()
