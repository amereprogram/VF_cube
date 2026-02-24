class AudioEngine {
  private ctx: AudioContext | null = null
  private masterGain: GainNode | null = null
  private noiseBuffer: AudioBuffer | null = null
  private _muted = false

  get muted() {
    return this._muted
  }

  set muted(v: boolean) {
    this._muted = v
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(v ? 0 : 0.6, this.ctx.currentTime, 0.05)
    }
  }

  init() {
    if (this.ctx) return
    this.ctx = new AudioContext()
    this.masterGain = this.ctx.createGain()
    this.masterGain.gain.value = 0.6
    this.masterGain.connect(this.ctx.destination)

    const sr = this.ctx.sampleRate
    const len = sr
    this.noiseBuffer = this.ctx.createBuffer(1, len, sr)
    const data = this.noiseBuffer.getChannelData(0)
    for (let i = 0; i < len; i++) {
      data[i] = Math.random() * 2 - 1
    }
  }

  private ensure(): AudioContext {
    if (!this.ctx) this.init()
    if (this.ctx!.state === 'suspended') this.ctx!.resume()
    return this.ctx!
  }

  playClick() {
    if (this._muted) return
    const ctx = this.ensure()
    const now = ctx.currentTime

    const noise = ctx.createBufferSource()
    noise.buffer = this.noiseBuffer

    const filter = ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.value = 3500
    filter.Q.value = 5

    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(0.3, now + 0.001)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035)

    noise.connect(filter).connect(gain).connect(this.masterGain!)
    noise.start(now)
    noise.stop(now + 0.05)
  }

  playToggle() {
    if (this._muted) return
    const ctx = this.ensure()
    const now = ctx.currentTime

    const osc = ctx.createOscillator()
    osc.type = 'square'
    osc.frequency.value = 480

    const g1 = ctx.createGain()
    g1.gain.setValueAtTime(0, now)
    g1.gain.linearRampToValueAtTime(0.12, now + 0.001)
    g1.gain.exponentialRampToValueAtTime(0.001, now + 0.06)

    osc.connect(g1).connect(this.masterGain!)
    osc.start(now)
    osc.stop(now + 0.07)

    const noise = ctx.createBufferSource()
    noise.buffer = this.noiseBuffer

    const bpf = ctx.createBiquadFilter()
    bpf.type = 'bandpass'
    bpf.frequency.value = 2000
    bpf.Q.value = 3

    const g2 = ctx.createGain()
    g2.gain.setValueAtTime(0, now)
    g2.gain.linearRampToValueAtTime(0.08, now + 0.001)
    g2.gain.exponentialRampToValueAtTime(0.001, now + 0.03)

    noise.connect(bpf).connect(g2).connect(this.masterGain!)
    noise.start(now)
    noise.stop(now + 0.04)
  }

  playGearTick() {
    if (this._muted) return
    const ctx = this.ensure()
    const now = ctx.currentTime

    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.value = 1800

    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(0.12, now + 0.0005)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.018)

    osc.connect(gain).connect(this.masterGain!)
    osc.start(now)
    osc.stop(now + 0.025)
  }

  playRoll() {
    if (this._muted) return
    const ctx = this.ensure()
    const now = ctx.currentTime

    const noise = ctx.createBufferSource()
    noise.buffer = this.noiseBuffer

    const lpf = ctx.createBiquadFilter()
    lpf.type = 'lowpass'
    lpf.frequency.value = 400

    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.04, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06)

    noise.connect(lpf).connect(gain).connect(this.masterGain!)
    noise.start(now)
    noise.stop(now + 0.07)
  }

  playSlide(position: number) {
    if (this._muted) return
    const ctx = this.ensure()
    const now = ctx.currentTime

    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.value = 200 + position * 600

    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.025, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04)

    osc.connect(gain).connect(this.masterGain!)
    osc.start(now)
    osc.stop(now + 0.05)
  }

  playJoystick() {
    if (this._muted) return
    const ctx = this.ensure()
    const now = ctx.currentTime

    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(250, now)
    osc.frequency.exponentialRampToValueAtTime(500, now + 0.05)

    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(0.08, now + 0.005)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12)

    osc.connect(gain).connect(this.masterGain!)
    osc.start(now)
    osc.stop(now + 0.13)
  }
}

export const audioEngine = new AudioEngine()
