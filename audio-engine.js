/**
 * Winamp Web Player - Audio Engine (Web Audio API)
 * Handles audio playback, 10-band equalizer, preamp, stereo panning,
 * spectrum & oscilloscope analysis, and chiptune demo generation.
 */

class WinampAudioEngine {
  constructor(audioElement) {
    this.audio = audioElement;
    this.ctx = null;
    this.source = null;
    this.preampGain = null;
    this.eqFilters = [];
    this.panner = null;
    this.masterGain = null;
    this.analyser = null;

    this.isInitialized = false;
    this.eqEnabled = true;
    this.preampValue = 0; // dB (-12 to +12)
    
    // Winamp EQ Frequencies (Hz)
    this.eqFrequencies = [60, 170, 310, 600, 1000, 3000, 6000, 12000, 14000, 16000];
    this.eqGains = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]; // dB

    // Classic Presets
    this.presets = {
      flat: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      rock: [4.8, 3.2, -1.6, -3.2, -1.6, 2.4, 4.8, 6.4, 6.4, 6.4],
      pop: [-1.6, 1.2, 4.2, 4.8, 3.2, -1.2, -1.8, -1.8, -1.2, -1.2],
      techno: [4.8, 4.2, 0, -3.6, -3.2, 0, 4.8, 5.8, 5.8, 5.2],
      classical: [4.8, 4.2, 3.2, 2.4, -1.6, -1.6, 0, 2.4, 3.2, 3.2],
      club: [0, 0, 2.4, 3.6, 3.6, 3.6, 2.4, 0, 0, 0],
      dance: [6.8, 5.2, 1.8, 0, 1.8, 3.6, 5.2, 5.2, 0, 0],
      fullbass: [6.8, 6.8, 6.8, 3.6, 1.2, -2.4, -5.2, -6.8, -7.2, -7.2],
      fullbasstreble: [5.2, 4.2, 0, -4.8, -3.2, 1.2, 5.8, 7.2, 7.8, 7.8],
      fulltreble: [-6.8, -6.8, -6.8, -2.4, 1.8, 6.8, 10.2, 10.2, 10.2, 11.0],
      laptopspeakers: [3.2, 7.2, 3.6, -2.4, -1.2, 1.2, 3.2, 5.8, 7.2, 8.4],
      live: [-3.2, 0, 2.4, 3.2, 3.6, 3.6, 2.4, 1.8, 1.8, 1.8],
      party: [4.8, 4.8, 0, 0, 0, 0, 0, 0, 4.8, 4.8],
      reggae: [0, 0, -0.6, -3.6, 0, 4.2, 4.2, 0, 0, 0],
      softrock: [2.4, 2.4, 1.2, -0.6, -2.4, -3.2, -1.8, 0, 1.8, 5.8],
      vocal: [-1.8, -3.2, -3.2, 1.2, 4.8, 4.8, 3.2, 1.2, 0, -1.8]
    };
  }

  // Initialize Web Audio Graph upon first user interaction
  initAudioGraph() {
    if (this.isInitialized) return;

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();

      // Create nodes
      this.source = this.ctx.createMediaElementSource(this.audio);
      this.preampGain = this.ctx.createGain();
      this.panner = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;
      this.masterGain = this.ctx.createGain();
      this.analyser = this.ctx.createAnalyser();

      // Analyser config for smooth Winamp visualizer
      this.analyser.fftSize = 128;
      this.analyser.smoothingTimeConstant = 0.75;

      // Create 10 EQ Peaking Filters
      this.eqFilters = this.eqFrequencies.map((freq) => {
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'peaking';
        filter.frequency.value = freq;
        filter.Q.value = 1.4;
        filter.gain.value = 0;
        return filter;
      });

      // Chain: Source -> Preamp -> EQ filters -> Panner -> Master -> Analyser -> Destination
      let currentNode = this.source;
      currentNode.connect(this.preampGain);
      currentNode = this.preampGain;

      for (const filter of this.eqFilters) {
        currentNode.connect(filter);
        currentNode = filter;
      }

      if (this.panner) {
        currentNode.connect(this.panner);
        currentNode = this.panner;
      }

      currentNode.connect(this.masterGain);
      this.masterGain.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);

      document.addEventListener('visibilitychange', () => {
        if (this.ctx && this.ctx.state === 'suspended' && !this.audio.paused) {
          this.ctx.resume().catch(() => {});
        }
      });

      this.isInitialized = true;
    } catch (e) {
      console.warn("Web Audio API could not be initialized yet:", e);
    }
  }

  // Resume context if suspended
  async ensureRunning() {
    this.initAudioGraph();
    if (this.ctx && this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
  }

  // Volume (0.0 to 1.0)
  setVolume(val) {
    const clamped = Math.max(0, Math.min(1, val));
    this.audio.volume = clamped;
    if (this.masterGain) {
      this.masterGain.gain.setValueAtTime(clamped, this.ctx.currentTime);
    }
  }

  // Balance (-1.0 Left to +1.0 Right)
  setBalance(val) {
    const clamped = Math.max(-1, Math.min(1, val));
    if (this.panner && this.ctx) {
      this.panner.pan.setValueAtTime(clamped, this.ctx.currentTime);
    }
  }

  // Preamp Gain (-12dB to +12dB)
  setPreamp(db) {
    this.preampValue = db;
    if (this.preampGain && this.ctx) {
      if (this.eqEnabled) {
        const gainVal = Math.pow(10, db / 20);
        this.preampGain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
      } else {
        this.preampGain.gain.setValueAtTime(1.0, this.ctx.currentTime);
      }
    }
  }

  // Individual Band Gain (index 0 to 9, -12dB to +12dB)
  setBandGain(index, db) {
    if (index >= 0 && index < this.eqGains.length) {
      this.eqGains[index] = db;
      if (this.eqFilters[index] && this.ctx) {
        this.eqFilters[index].gain.setValueAtTime(this.eqEnabled ? db : 0, this.ctx.currentTime);
      }
    }
  }

  // Enable / Disable Equalizer
  setEqEnabled(enabled) {
    this.eqEnabled = enabled;
    if (this.ctx) {
      this.setPreamp(this.preampValue);
      this.eqFilters.forEach((filter, idx) => {
        filter.gain.setValueAtTime(this.eqEnabled ? this.eqGains[idx] : 0, this.ctx.currentTime);
      });
    }
  }

  // Apply a preset
  applyPreset(name) {
    const preset = this.presets[name.toLowerCase()];
    if (!preset) return false;
    
    preset.forEach((val, idx) => {
      this.setBandGain(idx, val);
    });
    return true;
  }

  // Get Frequency / FFT Data for Spectrum Analyzer (0 - 255)
  getFrequencyData(array) {
    if (this.analyser && this.isInitialized) {
      this.analyser.getByteFrequencyData(array);
    } else {
      array.fill(0);
    }
  }

  // Get TimeDomain / Waveform Data for Oscilloscope (0 - 255)
  getTimeDomainData(array) {
    if (this.analyser && this.isInitialized) {
      this.analyser.getByteTimeDomainData(array);
    } else {
      array.fill(128);
    }
  }

  // Play audio file (Blob / URL)
  async loadTrack(source) {
    await this.ensureRunning();
    return new Promise((resolve, reject) => {
      let srcUrl = '';
      if (source instanceof Blob || source instanceof File) {
        srcUrl = URL.createObjectURL(source);
      } else if (typeof source === 'string') {
        srcUrl = source;
      }

      this.audio.src = srcUrl;
      this.audio.oncanplay = () => resolve();
      this.audio.onerror = (e) => reject(e);
      this.audio.load();
    });
  }

  play() {
    this.ensureRunning();
    return this.audio.play();
  }

  pause() {
    this.audio.pause();
  }

  stop() {
    this.audio.pause();
    this.audio.currentTime = 0;
  }

  seek(seconds) {
    if (isFinite(seconds) && seconds >= 0) {
      this.audio.currentTime = seconds;
    }
  }

  // Generate an authentic retro chiptune wav blob for demo music!
  static createDemoChiptuneBlob() {
    const sampleRate = 22050;
    const duration = 24; // 24 seconds loop
    const numSamples = sampleRate * duration;
    const buffer = new Float32Array(numSamples);

    // Retro 8-bit / 90s tracker arpeggios and chords (Am - F - C - G progression)
    const chords = [
      [220, 261.63, 329.63, 440], // Am
      [174.61, 220, 261.63, 349.23], // F
      [130.81, 164.81, 196, 261.63], // C
      [196, 246.94, 293.66, 392]  // G
    ];

    const bpm = 135;
    const beatSamples = Math.floor((60 / bpm) * sampleRate);
    const stepSamples = Math.floor(beatSamples / 4); // 16th note

    let sampleIdx = 0;
    for (let step = 0; sampleIdx < numSamples; step++) {
      const chordIdx = Math.floor((step / 16) % chords.length);
      const chord = chords[chordIdx];
      const arpNote = chord[step % chord.length];

      // Bass note
      const bassFreq = chord[0] / 2;

      for (let s = 0; s < stepSamples && sampleIdx < numSamples; s++, sampleIdx++) {
        const t = sampleIdx / sampleRate;

        // Lead: Pulse wave with envelope
        const env = Math.exp(-((s / stepSamples) * 3));
        const leadPhase = (t * arpNote) % 1;
        const lead = (leadPhase < 0.3 ? 1 : -1) * 0.22 * env;

        // Bass: Triangular/Saw wave
        const bassPhase = (t * bassFreq) % 1;
        const bass = (bassPhase * 2 - 1) * 0.25;

        // Drums: Kick on 0, 4, 8, 12; Snare on 4, 12; Hi-hat on every 2
        let drum = 0;
        const stepInBeat = step % 4;
        if (stepInBeat === 0) {
          // Kick
          const kickEnv = Math.exp(-(s / (sampleRate * 0.15)) * 12);
          const kickFreq = 120 * Math.exp(-(s / (sampleRate * 0.05)) * 8);
          drum += Math.sin(2 * Math.PI * kickFreq * (s / sampleRate)) * 0.5 * kickEnv;
        } else if (stepInBeat === 2) {
          // Snare (noise)
          const snareEnv = Math.exp(-(s / (sampleRate * 0.12)) * 10);
          drum += (Math.random() * 2 - 1) * 0.35 * snareEnv;
        }
        // Hihat on 16ths
        const hatEnv = Math.exp(-(s / (sampleRate * 0.04)) * 20);
        drum += (Math.random() * 2 - 1) * 0.08 * hatEnv;

        // Mix
        let sample = lead + bass + drum;
        // Soft clipping
        buffer[sampleIdx] = Math.max(-0.95, Math.min(0.95, sample));
      }
    }

    // Convert to 16-bit PCM WAV Blob
    return this.encodeWAV(buffer, sampleRate);
  }

  // Generate iconic Llama Whipping demo intro
  static createLlamaIntroBlob() {
    const sampleRate = 22050;
    const duration = 5;
    const numSamples = sampleRate * duration;
    const buffer = new Float32Array(numSamples);

    // Retro FM Synth sweep + "WINAMP - IT REALLY WHIPS THE LLAMA'S ASS" fanfare
    const melody = [261.63, 329.63, 392, 523.25, 392, 523.25];
    const noteDuration = sampleRate * 0.4;

    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      const noteIdx = Math.min(melody.length - 1, Math.floor(i / noteDuration));
      const freq = melody[noteIdx];
      const noteT = (i % noteDuration) / sampleRate;

      // Brass-like synth FM modulation
      const mod = Math.sin(2 * Math.PI * (freq * 2) * noteT) * 2;
      const carrier = Math.sin(2 * Math.PI * freq * noteT + mod);
      const env = Math.exp(-noteT * 2.5);

      // Whip whip noise sound at the end
      let whip = 0;
      if (t > 2.8 && t < 3.8) {
        const whipT = t - 2.8;
        const whipFreq = 800 - whipT * 600;
        whip = Math.sin(2 * Math.PI * whipFreq * whipT) * Math.exp(-whipT * 4) * 0.5;
        whip += (Math.random() * 2 - 1) * Math.exp(-whipT * 5) * 0.3;
      }

      buffer[i] = Math.max(-0.95, Math.min(0.95, carrier * 0.35 * env + whip));
    }

    return this.encodeWAV(buffer, sampleRate);
  }

  // Helper to encode float buffer to WAV Blob
  static encodeWAV(samples, sampleRate) {
    const buffer = new ArrayBuffer(44 + samples.length * 2);
    const view = new DataView(buffer);

    // RIFF chunk descriptor
    this.writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + samples.length * 2, true);
    this.writeString(view, 8, 'WAVE');

    // fmt sub-chunk
    this.writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
    view.setUint16(20, 1, true); // AudioFormat (1 = PCM)
    view.setUint16(22, 1, true); // NumChannels (1 = Mono)
    view.setUint32(24, sampleRate, true); // SampleRate
    view.setUint32(28, sampleRate * 2, true); // ByteRate
    view.setUint16(32, 2, true); // BlockAlign
    view.setUint16(34, 16, true); // BitsPerSample (16 bits)

    // data sub-chunk
    this.writeString(view, 36, 'data');
    view.setUint32(40, samples.length * 2, true);

    // Write PCM 16-bit samples
    let offset = 44;
    for (let i = 0; i < samples.length; i++, offset += 2) {
      const s = Math.max(-1, Math.min(1, samples[i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }

    return new Blob([buffer], { type: 'audio/wav' });
  }

  static writeString(view, offset, string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }
}

window.WinampAudioEngine = WinampAudioEngine;
