/**
 * Winamp Web Player - Audio Engine (Unified Sound Signature + Background EQ Bake + Bluetooth A2DP + YouTube Bridge)
 *
 * Architecture (v4.5 - 100% Identical Sound & Loudness in Foreground and Background / Screen Off):
 * 1. Why Foreground & Background sounded different in v4.3:
 *    - In v4.3, minimizing the app switched from the Web Audio EQ engine back to the raw un-equalized MP3 file
 *      on `<audio>`, AND the foreground engine was applying a large headroom reduction (`overlapHeadroomDb`),
 *      making the foreground quieter and EQ-colored while the background was louder and flat!
 * 2. How v4.5 makes Foreground & Background 100% Identical in both Volume and EQ Tone:
 *    - **True Unity Preamp Gain**: Removed the artificial volume-drop penalty so 0dB Preamp = 100% identical
 *      base loudness (`1.0`) in both foreground and background, while a transparent 0dBFS safety ceiling
 *      (`threshold: -0.3 dB`) prevents digital clipping on heavy boosts.
 *    - **Background EQ WAV Pre-Baking (`OfflineAudioContext`)**:
 *      Whenever an EQ curve is active (or adjusted), the engine quietly renders an exact 16-bit PCM WAV Blob
 *      of the track through the exact same 10-band BiquadFilter + Preamp + Balance + Limiter chain in the background!
 *      When you minimize the app or turn off the screen (`visibilitychange` / `pagehide`), `<audio>` plays that
 *      **EQ-baked WAV Blob** at the exact current timestamp!
 *      Result:
 *      - Moving EQ sliders in the app responds in **0ms real-time** (via `AudioBufferSourceNode`).
 *      - Minimizing the app or locking the screen plays **the exact same EQ sound & exact same volume**
 *        through native hardware `<audio>` without stopping or changing tone!
 */

class WinampAudioEngine {
  constructor(audioElement) {
    this.audio = audioElement;
    this.ctx = null;
    this.preampGain = null;
    this.eqFilters = [];
    this.panner = null;
    this.limiter = null;
    this.masterGain = null;

    this.isInitialized = false;
    this.eqEnabled = true;
    this.preampValue = 0; // dB (-12 to +12)
    this.soundFxEnabled = true; // Mechanical Cassette Sound FX
    this.volumeValue = 0.8;
    this.balanceValue = 0.0;

    // Decoded PCM AudioBuffer Engine state (for foreground 0ms EQ)
    this._rawArrayBuffer = null;
    this._decodedAudioBuffer = null;
    this._decodePromise = null;
    this._decodeToken = 0;
    this._bufferSource = null;
    this._isUsingBufferEngine = false;
    this._bufferPlaying = false;
    this._bufferStartContextTime = 0;
    this._bufferStartOffset = 0;
    this._bufferPauseOffset = 0;
    this._bufferTimer = null;
    this._suppressNativeEvents = false;
    this._wantPlaying = false;

    // Background EQ-Baked WAV state (so minimizing/screen-off has 100% identical EQ & volume!)
    this._originalBlobUrl = '';
    this._bakedEqBlobUrl = '';
    this._bakedDspSignature = '';
    this._bakeDebounceTimer = null;
    this._bakeRenderId = 0;

    // Playback mode: 'audio' (Local/Demo file) or 'youtube' (YouTube IFrame API)
    this.activeMode = 'audio';
    this.ytPlayer = null;
    this.ytReady = false;
    this.ytApiLoading = false;
    this.ytPendingVideoId = null;
    this.ytPendingAutoPlay = false;
    this.ytTimer = null;
    this.ytPlaying = false;
    this.ytDuration = 0;
    this.ytCurrentTime = 0;

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

    if ('audioSession' in navigator) {
      try {
        navigator.audioSession.type = 'playback';
      } catch (e) {}
    }

    // Seamless Background / Lock-Screen Handover:
    const handleVisibilityChange = () => {
      if (this.activeMode !== 'audio') return;
      if (document.hidden) {
        if (this._isUsingBufferEngine && this._bufferPlaying) {
          this._handoverBufferToNativeAudio();
        }
      } else {
        // When returning to foreground, if <audio> is already playing the exact up-to-date EQ-baked WAV,
        // keep playing it smoothly until the user touches an EQ slider!
        // Only switch to BufferEngine if the baked WAV isn't ready yet.
        if (
          this._wantPlaying &&
          !this.audio.paused &&
          this.hasActiveDsp() &&
          this._bakedDspSignature !== this._getDspSignature()
        ) {
          this._syncPlaybackEngine();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', () => {
      if (this.activeMode === 'audio' && this._isUsingBufferEngine && this._bufferPlaying) {
        this._handoverBufferToNativeAudio();
      }
    });
  }

  // Unique signature of current EQ/Preamp/Balance settings
  _getDspSignature() {
    if (!this.hasActiveDsp()) return 'flat';
    return `${this.eqEnabled ? 1 : 0}_${this.preampValue.toFixed(2)}_${this.balanceValue.toFixed(2)}_${this.eqGains.map(g => g.toFixed(2)).join(',')}`;
  }

  // Hand over playback from Web Audio Buffer Engine to Native Hardware <audio> (using EQ-baked WAV if ready!)
  _handoverBufferToNativeAudio() {
    const curTime = this.getCurrentTime();
    this._isUsingBufferEngine = false;
    this._bufferPlaying = false;
    this._stopBufferTimer();
    this._stopBufferSource();

    const targetUrl = (this.hasActiveDsp() && this._bakedEqBlobUrl) ? this._bakedEqBlobUrl : this._originalBlobUrl;
    if (targetUrl && this.audio.src !== targetUrl) {
      this._suppressNativeEvents = true;
      this.audio.src = targetUrl;
      this._suppressNativeEvents = false;
    }

    this.audio.muted = false;
    this.audio.volume = this.volumeValue;
    try {
      if (isFinite(curTime) && curTime > 0) {
        this.audio.currentTime = curTime;
      }
    } catch (e) {}
    const playPromise = this.audio.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(() => {});
    }
  }

  // Check if any EQ band, preamp, or stereo balance requires DSP processing
  hasActiveDsp() {
    const hasEq = this.eqEnabled && (
      Math.abs(this.preampValue) > 0.05 ||
      this.eqGains.some(g => Math.abs(g) > 0.05)
    );
    return hasEq || Math.abs(this.balanceValue) > 0.05;
  }

  // True Unity Gain (0dB Preamp = 1.0x gain) with gentle anti-clipping protection only on extreme multi-band boosts
  // Ensures foreground and background loudness match 1:1!
  _computeEffectivePreampGain() {
    if (!this.eqEnabled) return 1.0;
    let maxBoostDb = 0;
    for (let i = 0; i < this.eqGains.length; i++) {
      const g = this.eqGains[i] || 0;
      if (g > maxBoostDb) maxBoostDb = g;
    }
    // Only attenuate slightly if boost exceeds +6dB so normal presets & flat settings have 100% identical loudness
    const excessBoostDb = Math.max(0, maxBoostDb - 6.0) * 0.35;
    const netDb = this.preampValue - excessBoostDb;
    return Math.pow(10, netDb / 20);
  }

  // Schedule quiet background rendering of the EQ-processed WAV so native <audio> has the exact same EQ sound
  _scheduleBackgroundEqBake(delayMs = 350) {
    if (this._bakeDebounceTimer) {
      clearTimeout(this._bakeDebounceTimer);
      this._bakeDebounceTimer = null;
    }

    if (!this.hasActiveDsp()) {
      this._bakedDspSignature = 'flat';
      if (this._originalBlobUrl && !this._isUsingBufferEngine && this.audio.src !== this._originalBlobUrl) {
        const wasPlaying = !this.audio.paused;
        const cur = this.audio.currentTime || 0;
        this._suppressNativeEvents = true;
        this.audio.src = this._originalBlobUrl;
        try { this.audio.currentTime = cur; } catch (e) {}
        this._suppressNativeEvents = false;
        if (wasPlaying) this.audio.play().catch(() => {});
      }
      return;
    }

    const targetSig = this._getDspSignature();
    if (this._bakedDspSignature === targetSig && this._bakedEqBlobUrl) {
      return;
    }

    this._bakeDebounceTimer = setTimeout(() => {
      this._bakeEqToNativeWav().catch(() => {});
    }, delayMs);
  }

  // Render the decoded AudioBuffer through an OfflineAudioContext with identical 10-band EQ + Preamp + Limiter
  async _bakeEqToNativeWav() {
    if (this.activeMode !== 'audio' || !this.hasActiveDsp()) return;
    const decoded = await this._ensureAudioDecoded();
    if (!decoded || this.activeMode !== 'audio' || !this.hasActiveDsp()) return;

    const OfflineCtx = window.OfflineAudioContext || window.webkitOfflineAudioContext;
    if (!OfflineCtx) return;

    const renderId = ++this._bakeRenderId;
    const token = this._decodeToken;
    const sig = this._getDspSignature();

    try {
      const numChannels = Math.min(2, decoded.numberOfChannels || 2);
      const sampleRate = decoded.sampleRate || 44100;
      const length = decoded.length;

      const offline = new OfflineCtx(numChannels, length, sampleRate);

      const src = offline.createBufferSource();
      src.buffer = decoded;

      const preamp = offline.createGain();
      preamp.gain.value = this._computeEffectivePreampGain();

      let currentNode = src;
      currentNode.connect(preamp);
      currentNode = preamp;

      for (let i = 0; i < this.eqFrequencies.length; i++) {
        const filter = offline.createBiquadFilter();
        filter.type = 'peaking';
        filter.frequency.value = this.eqFrequencies[i];
        filter.Q.value = 1.4;
        filter.gain.value = this.eqEnabled ? (this.eqGains[i] || 0) : 0;
        currentNode.connect(filter);
        currentNode = filter;
      }

      if (offline.createStereoPanner && Math.abs(this.balanceValue) > 0.05) {
        const panner = offline.createStereoPanner();
        panner.pan.value = this.balanceValue;
        currentNode.connect(panner);
        currentNode = panner;
      }

      if (offline.createDynamicsCompressor) {
        const limiter = offline.createDynamicsCompressor();
        limiter.threshold.value = -0.3;
        limiter.knee.value = 0.0;
        limiter.ratio.value = 20.0;
        limiter.attack.value = 0.001;
        limiter.release.value = 0.050;
        currentNode.connect(limiter);
        currentNode = limiter;
      }

      currentNode.connect(offline.destination);
      src.start(0);

      const renderedBuffer = await offline.startRendering();
      if (renderId !== this._bakeRenderId || token !== this._decodeToken) return;

      const wavBlob = WinampAudioEngine.encodeAudioBufferWAV(renderedBuffer);
      if (renderId !== this._bakeRenderId || token !== this._decodeToken) return;

      if (this._bakedEqBlobUrl) {
        try { URL.revokeObjectURL(this._bakedEqBlobUrl); } catch (e) {}
      }
      this._bakedEqBlobUrl = URL.createObjectURL(wavBlob);
      this._bakedDspSignature = sig;

      // Pre-load the EQ-baked WAV into the paused <audio> element so when the user minimizes the app or
      // locks the screen, <audio> is ALREADY loaded with the exact same EQ sound!
      if (this._isUsingBufferEngine && this.audio.paused) {
        this._suppressNativeEvents = true;
        this.audio.src = this._bakedEqBlobUrl;
        this.audio.load();
        this._suppressNativeEvents = false;
      } else if (!this._isUsingBufferEngine && this.hasActiveDsp()) {
        // If already in background / native mode, hot-swap to the baked EQ WAV at the current position
        const wasPlaying = !this.audio.paused;
        const cur = this.audio.currentTime || 0;
        this._suppressNativeEvents = true;
        this.audio.src = this._bakedEqBlobUrl;
        try { this.audio.currentTime = cur; } catch (e) {}
        this._suppressNativeEvents = false;
        if (wasPlaying) {
          this.audio.play().catch(() => {});
        }
      }
    } catch (err) {
      console.warn('Background EQ WAV bake skipped:', err);
    }
  }

  rewireGraph() {
    this._syncPlaybackEngine();
    this._scheduleBackgroundEqBake(300);
  }

  // Initialize Pure Web Audio DSP Graph (NO createMediaElementSource & NO AnalyserNode in series)
  initAudioGraph() {
    if (this.isInitialized) return;

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;

      this.ctx = new AudioCtx();

      if ('audioSession' in navigator) {
        try {
          navigator.audioSession.type = 'playback';
        } catch (e) {}
      }

      this.preampGain = this.ctx.createGain();
      this.panner = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;
      this.masterGain = this.ctx.createGain();

      // Transparent 0dBFS Peak Ceiling Limiter (does NOT reduce normal volume; only catches > -0.3dBFS peaks)
      if (this.ctx.createDynamicsCompressor) {
        this.limiter = this.ctx.createDynamicsCompressor();
        this.limiter.threshold.value = -0.3; // dBFS ceiling (unity loudness)
        this.limiter.knee.value = 0.0;       // hard ceiling only at peak
        this.limiter.ratio.value = 20.0;     // brickwall limiting
        this.limiter.attack.value = 0.001;   // 1ms fast attack
        this.limiter.release.value = 0.050;  // 50ms release
      }

      this.preampGain.gain.value = this._computeEffectivePreampGain();
      this.masterGain.gain.value = this.volumeValue;

      if (this.panner) {
        this.panner.pan.value = this.balanceValue;
      }

      // Create 10 EQ Peaking Filters
      this.eqFilters = this.eqFrequencies.map((freq, idx) => {
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'peaking';
        filter.frequency.value = freq;
        filter.Q.value = 1.4;
        filter.gain.value = this.eqEnabled ? (this.eqGains[idx] || 0) : 0;
        return filter;
      });

      // Clean Audio-Thread-Only Chain: Preamp -> 10 EQ Filters -> Panner -> Peak Limiter -> MasterGain -> Destination
      let currentNode = this.preampGain;
      for (const filter of this.eqFilters) {
        currentNode.connect(filter);
        currentNode = filter;
      }

      if (this.panner) {
        currentNode.connect(this.panner);
        currentNode = this.panner;
      }

      if (this.limiter) {
        currentNode.connect(this.limiter);
        currentNode = this.limiter;
      }

      currentNode.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);

      if (this.ctx) {
        this.ctx.addEventListener('statechange', () => {
          if (this._isUsingBufferEngine && this._bufferPlaying && this.ctx && (this.ctx.state === 'suspended' || this.ctx.state === 'interrupted')) {
            if (document.hidden) {
              this._handoverBufferToNativeAudio();
            } else {
              this.ctx.resume().catch(() => {});
            }
          }
        });
      }

      this.isInitialized = true;
    } catch (e) {
      console.warn('Web Audio API could not be initialized yet:', e);
    }
  }

  // Start playing decoded AudioBufferSourceNode at exact offset (ONLY source playing — native <audio> is paused!)
  _startBufferSourceAt(offsetSeconds = 0) {
    this._stopBufferSource();
    if (!this._decodedAudioBuffer || !this.isInitialized || !this.ctx || !this.preampGain) return;

    try {
      if (this.ctx.state === 'suspended' || this.ctx.state === 'interrupted') {
        this.ctx.resume().catch(() => {});
      }

      // Pause native <audio> so OS Bluetooth A2DP mixer only receives ONE single audio stream
      if (!this.audio.paused) {
        this._suppressNativeEvents = true;
        try { this.audio.pause(); } catch (e) {}
        this._suppressNativeEvents = false;
      }

      const dur = this._decodedAudioBuffer.duration || 0;
      const safeOffset = Math.max(0, Math.min(offsetSeconds, Math.max(0, dur - 0.01)));

      const src = this.ctx.createBufferSource();
      src.buffer = this._decodedAudioBuffer;
      src.connect(this.preampGain);

      src.onended = () => {
        if (this._bufferSource !== src) return;
        this._bufferSource = null;
        if (this._isUsingBufferEngine && this._bufferPlaying) {
          const elapsed = this._bufferStartOffset + (this.ctx.currentTime - this._bufferStartContextTime);
          if (dur > 0 && elapsed >= dur - 0.15) {
            this._bufferPlaying = false;
            this._bufferPauseOffset = 0;
            this._stopBufferTimer();
            this.audio.dispatchEvent(new Event('ended'));
          }
        }
      };

      src.start(0, safeOffset);
      this._bufferSource = src;
      this._bufferStartContextTime = this.ctx.currentTime;
      this._bufferStartOffset = safeOffset;
      this._bufferPauseOffset = safeOffset;
      this._bufferPlaying = true;
      this._startBufferTimer();
      this.audio.dispatchEvent(new Event('play'));
      this.audio.dispatchEvent(new Event('timeupdate'));
    } catch (e) {
      console.warn('Failed to start AudioBufferSourceNode:', e);
    }
  }

  _stopBufferSource() {
    if (this._bufferSource) {
      const s = this._bufferSource;
      this._bufferSource = null;
      s.onended = null;
      try { s.stop(); } catch (e) {}
      try { s.disconnect(); } catch (e) {}
    }
  }

  _startBufferTimer() {
    this._stopBufferTimer();
    this._bufferTimer = setInterval(() => {
      if (this._isUsingBufferEngine && this._bufferPlaying && this.ctx) {
        const cur = this.getCurrentTime();
        const dur = this.getDuration();
        if (dur > 0 && cur >= dur) {
          this._bufferPlaying = false;
          this._bufferPauseOffset = 0;
          this._stopBufferTimer();
          this._stopBufferSource();
          this.audio.dispatchEvent(new Event('ended'));
          return;
        }
        this.audio.dispatchEvent(new Event('timeupdate'));
      }
    }, 250);
  }

  _stopBufferTimer() {
    if (this._bufferTimer) {
      clearInterval(this._bufferTimer);
      this._bufferTimer = null;
    }
  }

  // Decode raw audio ArrayBuffer into an AudioBuffer in RAM (cached per track)
  async _ensureAudioDecoded() {
    if (this._decodedAudioBuffer) return this._decodedAudioBuffer;
    if (this._decodePromise) return this._decodePromise;
    if (!this._rawArrayBuffer) return null;

    this.initAudioGraph();
    if (!this.ctx) return null;

    const token = this._decodeToken;
    const bufferCopy = this._rawArrayBuffer.slice(0);

    this._decodePromise = new Promise((resolve) => {
      try {
        this.ctx.decodeAudioData(
          bufferCopy,
          (decoded) => {
            if (this._decodeToken === token) {
              this._decodedAudioBuffer = decoded;
            }
            this._decodePromise = null;
            resolve(decoded);
          },
          () => {
            this._decodePromise = null;
            resolve(null);
          }
        );
      } catch (e) {
        this._decodePromise = null;
        resolve(null);
      }
    });

    return this._decodePromise;
  }

  // Seamlessly switch or maintain native <audio> vs Web Audio Buffer Engine
  async _syncPlaybackEngine() {
    if (this.activeMode !== 'audio') return;

    const needDsp = this.hasActiveDsp() && !document.hidden;

    if (!needDsp) {
      if (this._isUsingBufferEngine) {
        const wasPlaying = this._bufferPlaying;
        const curTime = this.getCurrentTime();
        this._isUsingBufferEngine = false;
        this._bufferPlaying = false;
        this._stopBufferTimer();
        this._stopBufferSource();

        const targetUrl = (this.hasActiveDsp() && this._bakedEqBlobUrl) ? this._bakedEqBlobUrl : this._originalBlobUrl;
        if (targetUrl && this.audio.src !== targetUrl) {
          this._suppressNativeEvents = true;
          this.audio.src = targetUrl;
          this._suppressNativeEvents = false;
        }

        this.audio.muted = false;
        this.audio.volume = this.volumeValue;
        try {
          if (isFinite(curTime) && curTime >= 0) {
            this.audio.currentTime = curTime;
          }
        } catch (e) {}
        if (wasPlaying) {
          this.audio.play().catch(() => {});
        }
      } else {
        this.audio.muted = false;
        this.audio.volume = this.volumeValue;
      }
      return;
    }

    // Foreground + DSP (EQ / Preamp / Balance is active)
    this.initAudioGraph();
    if (!this.ctx) return;

    if (this.ctx.state === 'suspended' || this.ctx.state === 'interrupted') {
      try { await this.ctx.resume(); } catch (e) {}
    }

    if (!this._decodedAudioBuffer) {
      const decoded = await this._ensureAudioDecoded();
      if (!decoded || !this.hasActiveDsp() || document.hidden || this.activeMode !== 'audio') return;
    }

    if (!this._isUsingBufferEngine) {
      const wasNativePlaying = !this.audio.paused;
      const curOffset = this.audio.currentTime || this._bufferPauseOffset || 0;
      this._isUsingBufferEngine = true;
      this._bufferPauseOffset = curOffset;

      if (wasNativePlaying || this._wantPlaying) {
        this._startBufferSourceAt(curOffset);
      }
    } else if (this._wantPlaying && !this._bufferPlaying) {
      this._startBufferSourceAt(this._bufferPauseOffset || 0);
    }
  }

  // Resume context if suspended or interrupted
  async ensureRunning(forceInit = false) {
    if (forceInit || this.hasActiveDsp()) {
      this.initAudioGraph();
      if (this.ctx && (this.ctx.state === 'suspended' || this.ctx.state === 'interrupted')) {
        try {
          await this.ctx.resume();
        } catch (e) {}
      }
    }
  }

  // Unified getters for active playback (works for Native <audio>, Buffer Engine, and YouTube)
  getCurrentTime() {
    if (this.activeMode === 'youtube') {
      if (this.ytPlayer && this.ytReady && typeof this.ytPlayer.getCurrentTime === 'function') {
        try {
          const t = this.ytPlayer.getCurrentTime();
          if (isFinite(t)) this.ytCurrentTime = t;
        } catch (e) {}
      }
      return this.ytCurrentTime || 0;
    }
    if (this._isUsingBufferEngine) {
      if (this._bufferPlaying && this.ctx) {
        const dur = this.getDuration();
        const elapsed = this._bufferStartOffset + Math.max(0, this.ctx.currentTime - this._bufferStartContextTime);
        return dur > 0 ? Math.min(dur, elapsed) : elapsed;
      }
      return this._bufferPauseOffset || 0;
    }
    return this.audio.currentTime || 0;
  }

  getDuration() {
    if (this.activeMode === 'youtube') {
      if (this.ytPlayer && this.ytReady && typeof this.ytPlayer.getDuration === 'function') {
        try {
          const d = this.ytPlayer.getDuration();
          if (isFinite(d) && d > 0) this.ytDuration = d;
        } catch (e) {}
      }
      return this.ytDuration || 0;
    }
    if (this._decodedAudioBuffer && this._decodedAudioBuffer.duration > 0) {
      return this._decodedAudioBuffer.duration;
    }
    return this.audio.duration || 0;
  }

  isPaused() {
    if (this.activeMode === 'youtube') {
      return !this.ytPlaying;
    }
    if (this._isUsingBufferEngine) {
      return !this._bufferPlaying;
    }
    return this.audio.paused;
  }

  // Volume (0.0 to 1.0)
  setVolume(val) {
    const clamped = Math.max(0, Math.min(1, val));
    this.volumeValue = clamped;

    if (this.isInitialized && this.masterGain && this.ctx) {
      this.masterGain.gain.value = clamped;
      try {
        this.masterGain.gain.setTargetAtTime(clamped, this.ctx.currentTime, 0.015);
      } catch (e) {}
    }

    this.audio.volume = clamped;

    if (this.ytPlayer && this.ytReady && typeof this.ytPlayer.setVolume === 'function') {
      try {
        this.ytPlayer.setVolume(Math.round(clamped * 100));
      } catch (e) {}
    }
  }

  // Balance (-1.0 Left to +1.0 Right) - Instant 0ms real-time response
  setBalance(val, userInitiated = false) {
    const clamped = Math.max(-1, Math.min(1, val));
    this.balanceValue = clamped;
    if (userInitiated && Math.abs(clamped) > 0.05 && !this.isInitialized) {
      this.initAudioGraph();
    }
    if (this.panner && this.ctx) {
      this.panner.pan.value = clamped;
      try {
        this.panner.pan.setTargetAtTime(clamped, this.ctx.currentTime, 0.015);
      } catch (e) {}
    }
    if (userInitiated) {
      this._syncPlaybackEngine();
      this._scheduleBackgroundEqBake(350);
    }
  }

  // Preamp Gain (-12dB to +12dB) - Instant 0ms real-time response
  setPreamp(db, userInitiated = false) {
    this.preampValue = db;
    if (userInitiated && Math.abs(db) > 0.05 && !this.isInitialized) {
      this.initAudioGraph();
    }
    if (this.preampGain && this.ctx) {
      const gainVal = this._computeEffectivePreampGain();
      this.preampGain.gain.value = gainVal;
      try {
        this.preampGain.gain.setTargetAtTime(gainVal, this.ctx.currentTime, 0.015);
      } catch (e) {}
    }
    if (userInitiated) {
      this._syncPlaybackEngine();
      this._scheduleBackgroundEqBake(350);
    }
  }

  // Individual Band Gain (index 0 to 9, -12dB to +12dB) - Instant 0ms real-time response
  setBandGain(index, db, userInitiated = false) {
    if (index >= 0 && index < this.eqGains.length) {
      this.eqGains[index] = db;
      if (userInitiated && Math.abs(db) > 0.05 && !this.isInitialized) {
        this.initAudioGraph();
      }
      if (this.eqFilters[index] && this.ctx) {
        const targetDb = this.eqEnabled ? db : 0;
        this.eqFilters[index].gain.value = targetDb;
        try {
          this.eqFilters[index].gain.setTargetAtTime(targetDb, this.ctx.currentTime, 0.015);
        } catch (e) {}
      }
      if (this.preampGain && this.ctx) {
        const gainVal = this._computeEffectivePreampGain();
        this.preampGain.gain.value = gainVal;
        try {
          this.preampGain.gain.setTargetAtTime(gainVal, this.ctx.currentTime, 0.015);
        } catch (e) {}
      }
      if (userInitiated) {
        this._syncPlaybackEngine();
        this._scheduleBackgroundEqBake(350);
      }
    }
  }

  // Enable / Disable Equalizer - Instant 0ms real-time response
  setEqEnabled(enabled, userInitiated = false) {
    this.eqEnabled = enabled;
    if (userInitiated && enabled && this.hasActiveDsp() && !this.isInitialized) {
      this.initAudioGraph();
    }
    if (this.ctx) {
      this.setPreamp(this.preampValue, false);
      this.eqFilters.forEach((filter, idx) => {
        const targetDb = this.eqEnabled ? this.eqGains[idx] : 0;
        filter.gain.value = targetDb;
        try {
          filter.gain.setTargetAtTime(targetDb, this.ctx.currentTime, 0.015);
        } catch (e) {}
      });
    }
    if (userInitiated) {
      this._syncPlaybackEngine();
      this._scheduleBackgroundEqBake(250);
    }
  }

  // Apply a preset
  applyPreset(name) {
    const preset = this.presets[name.toLowerCase()];
    if (!preset) return false;
    preset.forEach((val, idx) => {
      this.setBandGain(idx, val, false);
    });
    this._syncPlaybackEngine();
    this._scheduleBackgroundEqBake(250);
    return true;
  }

  // Get Frequency / FFT Data for Spectrum Analyzer (0 - 255)
  getFrequencyData(array) {
    if (this.isPaused()) {
      array.fill(0);
      return;
    }

    const now = performance.now() * 0.006;
    const t = this.getCurrentTime();
    const beat = Math.pow(Math.max(0, Math.sin(t * 7.2) * 0.5 + Math.sin(now * 2.3) * 0.5), 1.4);
    const volScale = Math.max(0.25, this.volumeValue);

    for (let i = 0; i < array.length; i++) {
      const norm = i / array.length;
      const eqIdx = Math.min(9, Math.floor(norm * 10));
      const eqBoost = this.eqEnabled ? ((this.eqGains[eqIdx] || 0) * 3.5) : 0;
      const bassEnvelope = Math.exp(-norm * 2.2) * 145 * (0.65 + 0.55 * beat);
      const midWave = Math.abs(Math.sin(now * 1.7 + i * 0.45) * Math.cos(now * 1.1 - i * 0.25)) * 115 * (1 - norm * 0.45);
      const shimmer = Math.abs(Math.sin(now * 4.3 + i * 1.7)) * 42;
      const raw = (bassEnvelope + midWave + shimmer + eqBoost) * volScale;
      array[i] = Math.max(0, Math.min(255, Math.floor(raw)));
    }
  }

  // Get TimeDomain / Waveform Data for Oscilloscope (0 - 255)
  getTimeDomainData(array) {
    if (this.isPaused()) {
      array.fill(128);
      return;
    }

    const now = performance.now() * 0.012;
    const amp = 48 * Math.max(0.25, this.volumeValue);
    for (let i = 0; i < array.length; i++) {
      const wave = Math.sin(now * 2.2 + i * 0.35) * 0.6 +
                   Math.sin(now * 5.1 - i * 0.7) * 0.4;
      array[i] = Math.max(0, Math.min(255, Math.floor(128 + wave * amp)));
    }
  }

  // =========================================================================
  // YOUTUBE IFRAME API SUPPORT
  // =========================================================================
  initYoutubePlayer() {
    return new Promise((resolve) => {
      if (this.ytReady && this.ytPlayer) {
        resolve(this.ytPlayer);
        return;
      }

      this._ytResolveList = this._ytResolveList || [];
      this._ytResolveList.push(resolve);

      const createPlayerInstance = () => {
        if (this.ytPlayer) return;
        try {
          const playerVars = {
            autoplay: 1,
            controls: 0,
            disablekb: 1,
            fs: 0,
            iv_load_policy: 3,
            modestbranding: 1,
            playsinline: 1,
            rel: 0
          };
          if (window.location.origin && window.location.origin.startsWith('http')) {
            playerVars.origin = window.location.origin;
          }

          this.ytPlayer = new window.YT.Player('ytPlayerFrame', {
            width: '200',
            height: '112',
            playerVars,
            events: {
              onReady: () => {
                this.ytReady = true;
                try {
                  this.ytPlayer.unMute();
                  this.ytPlayer.setVolume(Math.round(this.volumeValue * 100));
                } catch (e) {}

                if (this._ytResolveList) {
                  this._ytResolveList.forEach(fn => fn(this.ytPlayer));
                  this._ytResolveList = [];
                }

                if (this.ytPendingVideoId) {
                  const vid = this.ytPendingVideoId;
                  const auto = this.ytPendingAutoPlay;
                  this.ytPendingVideoId = null;
                  if (auto) {
                    try { this.ytPlayer.unMute(); } catch (e) {}
                    this.ytPlayer.loadVideoById(vid);
                    try { this.ytPlayer.playVideo(); } catch (e) {}
                  } else {
                    this.ytPlayer.cueVideoById(vid);
                  }
                }
              },
              onStateChange: (event) => {
                if (this.activeMode !== 'youtube') return;
                const YTState = window.YT ? window.YT.PlayerState : {};
                if (event.data === YTState.PLAYING) {
                  this.ytPlaying = true;
                  try {
                    this.ytPlayer.unMute();
                    this.ytPlayer.setVolume(Math.round(this.volumeValue * 100));
                  } catch (e) {}
                  const d = this.ytPlayer.getDuration();
                  if (isFinite(d) && d > 0) this.ytDuration = d;
                  this._startYtTimer();
                  this.audio.dispatchEvent(new Event('play'));
                  this.audio.dispatchEvent(new Event('timeupdate'));
                } else if (event.data === YTState.CUED && this.ytPendingAutoPlay) {
                  try {
                    this.ytPlayer.unMute();
                    this.ytPlayer.playVideo();
                  } catch (e) {}
                } else if (event.data === YTState.PAUSED) {
                  this.ytPlaying = false;
                  this._stopYtTimer();
                  this.audio.dispatchEvent(new Event('pause'));
                } else if (event.data === YTState.ENDED) {
                  this.ytPlaying = false;
                  this._stopYtTimer();
                  this.audio.dispatchEvent(new Event('ended'));
                }
              },
              onError: (err) => {
                console.warn('YouTube Player error:', err);
                if (this.activeMode === 'youtube') {
                  this.ytPlaying = false;
                  this._stopYtTimer();
                  this.audio.dispatchEvent(new Event('error'));
                }
              }
            }
          });
        } catch (err) {
          console.warn('Failed to create YT.Player:', err);
          if (this._ytResolveList) {
            this._ytResolveList.forEach(fn => fn(null));
            this._ytResolveList = [];
          }
        }
      };

      if (window.YT && window.YT.Player) {
        createPlayerInstance();
        return;
      }

      const prevCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (typeof prevCallback === 'function') prevCallback();
        createPlayerInstance();
      };

      if (!this.ytApiLoading) {
        this.ytApiLoading = true;
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        tag.async = true;
        tag.onerror = () => {
          this.ytApiLoading = false;
          if (this._ytResolveList) {
            this._ytResolveList.forEach(fn => fn(null));
            this._ytResolveList = [];
          }
        };
        document.head.appendChild(tag);
      }
    });
  }

  _startYtTimer() {
    this._stopYtTimer();
    this.ytTimer = setInterval(() => {
      if (this.activeMode === 'youtube' && this.ytPlaying && this.ytPlayer && this.ytReady) {
        try {
          const cur = this.ytPlayer.getCurrentTime();
          const dur = this.ytPlayer.getDuration();
          if (isFinite(cur)) this.ytCurrentTime = cur;
          if (isFinite(dur) && dur > 0) this.ytDuration = dur;
          this.audio.dispatchEvent(new Event('timeupdate'));
        } catch (e) {}
      }
    }, 250);
  }

  _stopYtTimer() {
    if (this.ytTimer) {
      clearInterval(this.ytTimer);
      this.ytTimer = null;
    }
  }

  // Load a YouTube track (synchronous call when player is ready to preserve user gesture)
  async loadYoutubeTrack(videoId, knownDuration = 0) {
    this._stopBufferTimer();
    this._stopBufferSource();
    this._isUsingBufferEngine = false;
    this._bufferPlaying = false;
    try {
      this.audio.pause();
    } catch (e) {}

    this.activeMode = 'youtube';
    this.ytCurrentTime = 0;
    this.ytDuration = knownDuration || 0;
    this.ytPlaying = false;
    this.ytPendingVideoId = videoId;
    this.ytPendingAutoPlay = true;

    if (this.ytPlayer && this.ytReady && typeof this.ytPlayer.loadVideoById === 'function') {
      this.ytPendingVideoId = null;
      try {
        this.ytPlayer.unMute();
        this.ytPlayer.setVolume(Math.round(this.volumeValue * 100));
        this.ytPlayer.loadVideoById(videoId);
        this.ytPlayer.playVideo();
      } catch (e) {}
      return;
    }

    await this.initYoutubePlayer();
    if (this.ytPlayer && this.ytReady && this.ytPendingVideoId) {
      const vid = this.ytPendingVideoId;
      this.ytPendingVideoId = null;
      try {
        this.ytPlayer.unMute();
        this.ytPlayer.setVolume(Math.round(this.volumeValue * 100));
        this.ytPlayer.loadVideoById(vid);
        this.ytPlayer.playVideo();
      } catch (e) {}
    }
  }

  // Load standard audio file (Blob / File / URL) into contiguous RAM
  async loadTrack(source) {
    if (this.activeMode === 'youtube') {
      this.activeMode = 'audio';
      this.ytPlaying = false;
      this._stopYtTimer();
      if (this.ytPlayer && this.ytReady && typeof this.ytPlayer.stopVideo === 'function') {
        try { this.ytPlayer.stopVideo(); } catch (e) {}
      }
    }

    if (this._bakeDebounceTimer) {
      clearTimeout(this._bakeDebounceTimer);
      this._bakeDebounceTimer = null;
    }
    this._bakeRenderId++;
    if (this._bakedEqBlobUrl) {
      try { URL.revokeObjectURL(this._bakedEqBlobUrl); } catch (e) {}
      this._bakedEqBlobUrl = '';
    }
    this._bakedDspSignature = '';

    this._stopBufferTimer();
    this._stopBufferSource();
    this._bufferPlaying = false;
    this._bufferPauseOffset = 0;
    this._decodeToken++;
    this._decodedAudioBuffer = null;
    this._decodePromise = null;
    this._rawArrayBuffer = null;

    if ('audioSession' in navigator) {
      try {
        navigator.audioSession.type = 'playback';
      } catch (e) {}
    }

    let srcUrl = '';
    if (source instanceof Blob || source instanceof File) {
      if (this._currentBlobUrl) {
        try { URL.revokeObjectURL(this._currentBlobUrl); } catch (e) {}
      }
      // Pre-buffer entire MP3/audio file into contiguous RAM so IndexedDB disk reads never stall Bluetooth A2DP
      let memoryBlob = source;
      if (typeof source.arrayBuffer === 'function') {
        try {
          const ramBuffer = await source.arrayBuffer();
          this._rawArrayBuffer = ramBuffer;
          memoryBlob = new Blob([ramBuffer], { type: source.type || 'audio/mpeg' });
        } catch (e) {
          memoryBlob = source;
        }
      }
      this._currentBlobUrl = URL.createObjectURL(memoryBlob);
      srcUrl = this._currentBlobUrl;
    } else if (typeof source === 'string') {
      srcUrl = source;
    }

    this._originalBlobUrl = srcUrl;

    // Prepare the native <audio> element
    this.audio.muted = false;
    this.audio.volume = this.volumeValue;
    this.audio.src = srcUrl;
    this.audio.load();

    const useDspNow = this.hasActiveDsp();
    if (useDspNow && this._rawArrayBuffer) {
      this.initAudioGraph();
      await this._ensureAudioDecoded();
      this._isUsingBufferEngine = Boolean(this._decodedAudioBuffer) && !document.hidden;
      // Immediately start baking the EQ WAV in the background so if the user locks screen or minimizes,
      // the background <audio> has the exact same EQ curve & volume!
      this._scheduleBackgroundEqBake(80);
    } else {
      this._isUsingBufferEngine = false;
      if (this.isInitialized && this._rawArrayBuffer) {
        this._ensureAudioDecoded().catch(() => {});
      }
    }
  }

  async play() {
    this._wantPlaying = true;
    if ('audioSession' in navigator) {
      try {
        navigator.audioSession.type = 'playback';
      } catch (e) {}
    }

    if (this.activeMode === 'youtube') {
      if (this.ytPlayer && this.ytReady && typeof this.ytPlayer.playVideo === 'function') {
        try {
          this.ytPlayer.unMute();
          this.ytPlayer.playVideo();
        } catch (e) {}
        return;
      }
      await this.initYoutubePlayer();
      if (this.ytPlayer && this.ytReady && typeof this.ytPlayer.playVideo === 'function') {
        try {
          this.ytPlayer.unMute();
          this.ytPlayer.playVideo();
        } catch (e) {}
      }
      return;
    }

    // Use Web Audio Buffer Engine when in foreground AND EQ/DSP is active
    if (this.hasActiveDsp() && !document.hidden && this._rawArrayBuffer) {
      this.initAudioGraph();
      if (this.ctx && (this.ctx.state === 'suspended' || this.ctx.state === 'interrupted')) {
        try { await this.ctx.resume(); } catch (e) {}
      }
      if (!this._decodedAudioBuffer) {
        await this._ensureAudioDecoded();
      }
      if (this._decodedAudioBuffer && !document.hidden) {
        this._isUsingBufferEngine = true;
        this._startBufferSourceAt(this._bufferPauseOffset || this.audio.currentTime || 0);
        this._scheduleBackgroundEqBake(150);
        return;
      }
    }

    // Otherwise play via native hardware <audio> (using EQ-baked WAV if DSP is active!)
    this._isUsingBufferEngine = false;
    this._bufferPlaying = false;
    this._stopBufferTimer();
    this._stopBufferSource();
    const targetUrl = (this.hasActiveDsp() && this._bakedEqBlobUrl) ? this._bakedEqBlobUrl : this._originalBlobUrl;
    if (targetUrl && this.audio.src !== targetUrl) {
      this._suppressNativeEvents = true;
      this.audio.src = targetUrl;
      this._suppressNativeEvents = false;
    }
    this.audio.muted = false;
    this.audio.volume = this.volumeValue;
    return this.audio.play();
  }

  pause() {
    this._wantPlaying = false;
    if (this.activeMode === 'youtube') {
      if (this.ytPlayer && this.ytReady && typeof this.ytPlayer.pauseVideo === 'function') {
        this.ytPlayer.pauseVideo();
      }
      return;
    }
    if (this._isUsingBufferEngine) {
      this._bufferPauseOffset = this.getCurrentTime();
      this._bufferPlaying = false;
      this._stopBufferTimer();
      this._stopBufferSource();
      try {
        this.audio.currentTime = this._bufferPauseOffset;
      } catch (e) {}
      this.audio.dispatchEvent(new Event('pause'));
      return;
    }
    this.audio.pause();
  }

  stop() {
    this._wantPlaying = false;
    this._bufferPauseOffset = 0;
    this._bufferPlaying = false;
    this._stopBufferTimer();
    this._stopBufferSource();
    if (this.activeMode === 'youtube') {
      this.ytPlaying = false;
      this.ytCurrentTime = 0;
      this._stopYtTimer();
      if (this.ytPlayer && this.ytReady && typeof this.ytPlayer.stopVideo === 'function') {
        try { this.ytPlayer.stopVideo(); } catch (e) {}
      }
      return;
    }
    this.audio.pause();
    this.audio.currentTime = 0;
  }

  seek(seconds) {
    if (!isFinite(seconds) || seconds < 0) return;
    if (this.activeMode === 'youtube') {
      this.ytCurrentTime = seconds;
      if (this.ytPlayer && this.ytReady && typeof this.ytPlayer.seekTo === 'function') {
        try {
          this.ytPlayer.seekTo(seconds, true);
          this.audio.dispatchEvent(new Event('timeupdate'));
        } catch (e) {}
      }
      return;
    }
    this._bufferPauseOffset = seconds;
    try {
      this.audio.currentTime = seconds;
    } catch (e) {}
    if (this._isUsingBufferEngine) {
      if (this._bufferPlaying && this._decodedAudioBuffer) {
        this._startBufferSourceAt(seconds);
      } else {
        this.audio.dispatchEvent(new Event('timeupdate'));
      }
    }
  }

  // Mechanical Cassette Sound Synthesizer (Skipped while music is actively playing to avoid Bluetooth A2DP contention)
  playMechanicalSound(type = 'click') {
    if (!this.soundFxEnabled) return;
    if (!this.isPaused()) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!this.fxCtx) {
        this.fxCtx = new AudioCtx();
      }
      if (this.fxCtx.state === 'suspended' || this.fxCtx.state === 'interrupted') {
        this.fxCtx.resume().catch(() => {});
      }
      if (this.fxCtx.state !== 'running') return;
      const fx = this.fxCtx;
      const now = fx.currentTime;
      if (type === 'play' || type === 'clunk') {
        const osc = fx.createOscillator();
        const gain = fx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(35, now + 0.08);
        gain.gain.setValueAtTime(0.28, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.connect(gain);
        gain.connect(fx.destination);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === 'stop' || type === 'pause' || type === 'click') {
        const bufferSize = Math.floor(fx.sampleRate * 0.025);
        const buffer = fx.createBuffer(1, bufferSize, fx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.2));
        const noise = fx.createBufferSource();
        noise.buffer = buffer;
        const noiseGain = fx.createGain();
        noiseGain.gain.setValueAtTime(0.2, now);
        noise.connect(noiseGain);
        noiseGain.connect(fx.destination);
        noise.start(now);
      } else if (type === 'eject') {
        const osc = fx.createOscillator();
        const gain = fx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(260, now);
        osc.frequency.exponentialRampToValueAtTime(70, now + 0.1);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.connect(gain);
        gain.connect(fx.destination);
        osc.start(now);
        osc.stop(now + 0.1);
      }
    } catch (e) {}
  }

  // Generate an authentic retro chiptune wav blob for demo music!
  static createDemoChiptuneBlob() {
    const sampleRate = 22050;
    const duration = 24;
    const numSamples = sampleRate * duration;
    const buffer = new Float32Array(numSamples);

    const chords = [
      [220, 261.63, 329.63, 440], // Am
      [174.61, 220, 261.63, 349.23], // F
      [130.81, 164.81, 196, 261.63], // C
      [196, 246.94, 293.66, 392]  // G
    ];

    const bpm = 135;
    const beatSamples = Math.floor((60 / bpm) * sampleRate);
    const stepSamples = Math.floor(beatSamples / 4);

    let sampleIdx = 0;
    for (let step = 0; sampleIdx < numSamples; step++) {
      const chordIdx = Math.floor((step / 16) % chords.length);
      const chord = chords[chordIdx];
      const arpNote = chord[step % chord.length];
      const bassFreq = chord[0] / 2;

      for (let s = 0; s < stepSamples && sampleIdx < numSamples; s++, sampleIdx++) {
        const t = sampleIdx / sampleRate;
        const env = Math.exp(-((s / stepSamples) * 3));
        const leadPhase = (t * arpNote) % 1;
        const lead = (leadPhase < 0.3 ? 1 : -1) * 0.22 * env;

        const bassPhase = (t * bassFreq) % 1;
        const bass = (bassPhase * 2 - 1) * 0.25;

        let drum = 0;
        const stepInBeat = step % 4;
        if (stepInBeat === 0) {
          const kickEnv = Math.exp(-(s / (sampleRate * 0.15)) * 12);
          const kickFreq = 120 * Math.exp(-(s / (sampleRate * 0.05)) * 8);
          drum += Math.sin(2 * Math.PI * kickFreq * (s / sampleRate)) * 0.5 * kickEnv;
        } else if (stepInBeat === 2) {
          const snareEnv = Math.exp(-(s / (sampleRate * 0.12)) * 10);
          drum += (Math.random() * 2 - 1) * 0.35 * snareEnv;
        }
        const hatEnv = Math.exp(-(s / (sampleRate * 0.04)) * 20);
        drum += (Math.random() * 2 - 1) * 0.08 * hatEnv;

        let sample = lead + bass + drum;
        buffer[sampleIdx] = Math.max(-0.95, Math.min(0.95, sample));
      }
    }

    return this.encodeWAV(buffer, sampleRate);
  }

  // Generate iconic Llama Whipping demo intro
  static createLlamaIntroBlob() {
    const sampleRate = 22050;
    const duration = 5;
    const numSamples = sampleRate * duration;
    const buffer = new Float32Array(numSamples);

    const melody = [261.63, 329.63, 392, 523.25, 392, 523.25];
    const noteDuration = sampleRate * 0.4;

    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      const noteIdx = Math.min(melody.length - 1, Math.floor(i / noteDuration));
      const freq = melody[noteIdx];
      const noteT = (i % noteDuration) / sampleRate;

      const mod = Math.sin(2 * Math.PI * (freq * 2) * noteT) * 2;
      const carrier = Math.sin(2 * Math.PI * freq * noteT + mod);
      const env = Math.exp(-noteT * 2.5);

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

  // Ultra-fast Stereo/Mono AudioBuffer -> 16-bit PCM WAV Blob encoder
  static encodeAudioBufferWAV(audioBuffer) {
    const numChannels = Math.min(2, audioBuffer.numberOfChannels || 1);
    const sampleRate = audioBuffer.sampleRate || 44100;
    const numFrames = audioBuffer.length;
    const bytesPerSample = 2;
    const blockAlign = numChannels * bytesPerSample;
    const dataByteLength = numFrames * blockAlign;
    const buffer = new ArrayBuffer(44 + dataByteLength);
    const view = new DataView(buffer);

    this.writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + dataByteLength, true);
    this.writeString(view, 8, 'WAVE');

    this.writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * blockAlign, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, 16, true);

    this.writeString(view, 36, 'data');
    view.setUint32(40, dataByteLength, true);

    const pcm16 = new Int16Array(buffer, 44, numFrames * numChannels);
    if (numChannels === 2) {
      const ch0 = audioBuffer.getChannelData(0);
      const ch1 = audioBuffer.getChannelData(1);
      let outIdx = 0;
      for (let i = 0; i < numFrames; i++) {
        let s0 = ch0[i];
        let s1 = ch1[i];
        s0 = s0 < -1 ? -1 : (s0 > 1 ? 1 : s0);
        s1 = s1 < -1 ? -1 : (s1 > 1 ? 1 : s1);
        pcm16[outIdx++] = s0 < 0 ? (s0 * 32768) | 0 : (s0 * 32767) | 0;
        pcm16[outIdx++] = s1 < 0 ? (s1 * 32768) | 0 : (s1 * 32767) | 0;
      }
    } else {
      const ch0 = audioBuffer.getChannelData(0);
      for (let i = 0; i < numFrames; i++) {
        let s0 = ch0[i];
        s0 = s0 < -1 ? -1 : (s0 > 1 ? 1 : s0);
        pcm16[i] = s0 < 0 ? (s0 * 32768) | 0 : (s0 * 32767) | 0;
      }
    }

    return new Blob([buffer], { type: 'audio/wav' });
  }

  static encodeWAV(samples, sampleRate) {
    const buffer = new ArrayBuffer(44 + samples.length * 2);
    const view = new DataView(buffer);

    this.writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + samples.length * 2, true);
    this.writeString(view, 8, 'WAVE');

    this.writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);

    this.writeString(view, 36, 'data');
    this.setUint32Length(view, samples);

    let offset = 44;
    for (let i = 0; i < samples.length; i++, offset += 2) {
      const s = Math.max(-1, Math.min(1, samples[i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }

    return new Blob([buffer], { type: 'audio/wav' });
  }

  static setUint32Length(view, samples) {
    view.setUint32(40, samples.length * 2, true);
  }

  static writeString(view, offset, string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }
}

window.WinampAudioEngine = WinampAudioEngine;
