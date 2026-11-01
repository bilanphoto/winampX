/**
 * Winamp Web Player - Audio Engine (Hybrid AudioBuffer + Native Hardware Audio + 10-Band EQ + YouTube Bridge)
 *
 * Architecture (v4.2 - Bluetooth A2DP & Instant 0ms EQ):
 * 1. Native Hardware Mode (Default / EQ OFF or Flat):
 *    Plays pre-buffered RAM Blob directly on <audio> via native OS hardware pipeline -> 0% Bluetooth A2DP stutter!
 * 2. Real-Time Decoded PCM EQ Mode (When EQ / Preamp / Balance is active):
 *    Decodes the track into a Web Audio `AudioBuffer` in RAM and plays it through a pure Web Audio graph:
 *    `AudioBufferSourceNode -> Preamp -> 10 BiquadFilterNodes -> StereoPanner -> MasterGain -> ctx.destination`.
 *    Avoids `createMediaElementSource(this.audio)` completely (which is the WebKit/Chromium bug that causes
 *    Bluetooth A2DP clock drift and stuttering!), while giving 0ms instant real-time EQ slider response!
 *    Meanwhile, `this.audio` plays muted in sync so Lock Screen / CarPlay / Bluetooth AVRCP controls & ended events work natively.
 */

class WinampAudioEngine {
  constructor(audioElement) {
    this.audio = audioElement;
    this.ctx = null;
    this.preampGain = null;
    this.eqFilters = [];
    this.panner = null;
    this.masterGain = null;
    this.analyser = null;

    this.isInitialized = false;
    this.eqEnabled = true;
    this.preampValue = 0; // dB (-12 to +12)
    this.soundFxEnabled = true; // Mechanical Cassette Sound FX
    this.volumeValue = 0.8;
    this.balanceValue = 0.0;

    // Decoded PCM AudioBuffer Engine state (for stutter-free Bluetooth + 0ms EQ)
    this._rawArrayBuffer = null;
    this._decodedAudioBuffer = null;
    this._decodePromise = null;
    this._decodeToken = 0;
    this._bufferSource = null;
    this._isUsingBufferEngine = false;
    this._bufferStartContextTime = 0;
    this._bufferStartOffset = 0;
    this._wantPlaying = false;

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

    // Keep AudioBufferSourceNode synchronized with native <audio> events (play, pause, seek, ended)
    this.audio.addEventListener('play', () => {
      if (this.activeMode !== 'audio') return;
      if (this.isInitialized && this.ctx && this.ctx.state !== 'running') {
        this.ctx.resume().catch(() => {});
      }
      if (this._isUsingBufferEngine && this._decodedAudioBuffer) {
        this._startBufferSourceAt(this.audio.currentTime || 0);
      }
    });

    this.audio.addEventListener('pause', () => {
      if (this.activeMode !== 'audio') return;
      this._stopBufferSource();
    });

    this.audio.addEventListener('ended', () => {
      if (this.activeMode !== 'audio') return;
      this._stopBufferSource();
    });

    this.audio.addEventListener('seeked', () => {
      if (this.activeMode !== 'audio') return;
      if (this._isUsingBufferEngine && !this.audio.paused && this._decodedAudioBuffer) {
        this._startBufferSourceAt(this.audio.currentTime || 0);
      }
    });
  }

  // Check if any EQ band, preamp, or stereo balance requires DSP processing
  hasActiveDsp() {
    const hasEq = this.eqEnabled && (
      Math.abs(this.preampValue) > 0.05 ||
      this.eqGains.some(g => Math.abs(g) > 0.05)
    );
    return hasEq || Math.abs(this.balanceValue) > 0.05;
  }

  rewireGraph() {
    // Sync between native <audio> hardware output and Web Audio Buffer DSP output
    this._syncPlaybackEngine();
  }

  // Initialize Pure Web Audio DSP Graph (NO createMediaElementSource!)
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

      // Create Web Audio nodes for 10-band Equalizer, Preamp, Stereo Panner, Master Gain & Analyser
      // IMPORTANT: Never call ctx.createMediaElementSource(this.audio)!
      // Leaving <audio> uncaptured lets native hardware audio work 100% stutter-free over Bluetooth A2DP,
      // and when DSP is needed we feed decoded PCM via AudioBufferSourceNode into this filter chain!
      this.preampGain = this.ctx.createGain();
      this.panner = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;
      this.masterGain = this.ctx.createGain();
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 128;
      this.analyser.smoothingTimeConstant = 0.75;

      const initialPreamp = this.eqEnabled ? Math.pow(10, this.preampValue / 20) : 1.0;
      this.preampGain.gain.value = initialPreamp;
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

      // Permanent chain: Preamp -> 10 EQ Filters -> Panner -> Master -> Analyser -> Destination
      let currentNode = this.preampGain;
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

      if (this.ctx) {
        this.ctx.addEventListener('statechange', () => {
          if (!this.audio.paused && this._isUsingBufferEngine && this.ctx && (this.ctx.state === 'suspended' || this.ctx.state === 'interrupted')) {
            this.ctx.resume().catch(() => {});
          }
        });
      }

      const resumeFn = () => {
        if (!this.audio.paused && this._isUsingBufferEngine && this.ctx && this.ctx.state !== 'running') {
          this.ctx.resume().catch(() => {});
        }
      };
      document.addEventListener('visibilitychange', resumeFn);
      window.addEventListener('pageshow', resumeFn);

      this.isInitialized = true;
    } catch (e) {
      console.warn('Web Audio API could not be initialized yet:', e);
    }
  }

  // Start playing decoded AudioBufferSourceNode at exact offset in sync with <audio>
  _startBufferSourceAt(offsetSeconds = 0) {
    this._stopBufferSource();
    if (!this._decodedAudioBuffer || !this.isInitialized || !this.ctx || !this.preampGain) return;

    try {
      if (this.ctx.state === 'suspended' || this.ctx.state === 'interrupted') {
        this.ctx.resume().catch(() => {});
      }
      const src = this.ctx.createBufferSource();
      src.buffer = this._decodedAudioBuffer;
      src.connect(this.preampGain);

      const safeOffset = Math.max(0, Math.min(offsetSeconds, Math.max(0, this._decodedAudioBuffer.duration - 0.01)));
      src.start(0, safeOffset);
      this._bufferSource = src;
      this._bufferStartContextTime = this.ctx.currentTime;
      this._bufferStartOffset = safeOffset;
    } catch (e) {
      console.warn('Failed to start AudioBufferSourceNode:', e);
    }
  }

  _stopBufferSource() {
    if (this._bufferSource) {
      try {
        this._bufferSource.stop();
      } catch (e) {}
      try {
        this._bufferSource.disconnect();
      } catch (e) {}
      this._bufferSource = null;
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

    const needDsp = this.hasActiveDsp();

    if (!needDsp) {
      // Switch back to 100% pure native hardware <audio> playback (zero Web Audio load on Bluetooth!)
      if (this._isUsingBufferEngine) {
        this._isUsingBufferEngine = false;
        this._stopBufferSource();
        this.audio.muted = false;
        this.audio.volume = this.volumeValue;
      } else {
        this.audio.muted = false;
        this.audio.volume = this.volumeValue;
      }
      return;
    }

    // We need DSP (EQ / Preamp / Balance is active)
    this.initAudioGraph();
    if (!this.ctx) return;

    if (this.ctx.state === 'suspended' || this.ctx.state === 'interrupted') {
      try { await this.ctx.resume(); } catch (e) {}
    }

    if (!this._decodedAudioBuffer) {
      const decoded = await this._ensureAudioDecoded();
      if (!decoded || !this.hasActiveDsp() || this.activeMode !== 'audio') return;
    }

    if (!this._isUsingBufferEngine) {
      this._isUsingBufferEngine = true;
      // Mute native <audio> element (keeps running as clock & MediaSession / CarPlay / Bluetooth AVRCP anchor)
      this.audio.muted = true;
      if (!this.audio.paused) {
        this._startBufferSourceAt(this.audio.currentTime || 0);
      }
    } else if (!this.audio.paused && !this._bufferSource) {
      this.audio.muted = true;
      this._startBufferSourceAt(this.audio.currentTime || 0);
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

  // Unified getters for active playback (works for both <audio> and YouTube)
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
    return this.audio.duration || 0;
  }

  isPaused() {
    if (this.activeMode === 'youtube') {
      return !this.ytPlaying;
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

    if (!this._isUsingBufferEngine) {
      this.audio.volume = clamped;
    }

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
    }
  }

  // Preamp Gain (-12dB to +12dB) - Instant 0ms real-time response
  setPreamp(db, userInitiated = false) {
    this.preampValue = db;
    if (userInitiated && Math.abs(db) > 0.05 && !this.isInitialized) {
      this.initAudioGraph();
    }
    if (this.preampGain && this.ctx) {
      const gainVal = this.eqEnabled ? Math.pow(10, db / 20) : 1.0;
      this.preampGain.gain.value = gainVal;
      try {
        this.preampGain.gain.setTargetAtTime(gainVal, this.ctx.currentTime, 0.015);
      } catch (e) {}
    }
    if (userInitiated) {
      this._syncPlaybackEngine();
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
      if (userInitiated) {
        this._syncPlaybackEngine();
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
    return true;
  }

  // Get Frequency / FFT Data for Spectrum Analyzer (0 - 255)
  getFrequencyData(array) {
    if (this._isUsingBufferEngine && this.analyser && this.isInitialized && this.activeMode === 'audio') {
      this.analyser.getByteFrequencyData(array);
      return;
    }

    // Reactive synthesized spectrum for Native Hardware Audio & YouTube Mode
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
    if (this._isUsingBufferEngine && this.analyser && this.isInitialized && this.activeMode === 'audio') {
      this.analyser.getByteTimeDomainData(array);
      return;
    }

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
    this._stopBufferSource();
    this._isUsingBufferEngine = false;
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

    this._stopBufferSource();
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

    const useDspNow = this.hasActiveDsp();
    if (useDspNow) {
      this.initAudioGraph();
      await this._ensureAudioDecoded();
      this._isUsingBufferEngine = Boolean(this._decodedAudioBuffer);
    } else {
      this._isUsingBufferEngine = false;
      // Pre-decode in background if AudioContext is already initialized so moving EQ later is 0ms instant
      if (this.isInitialized && this._rawArrayBuffer) {
        this._ensureAudioDecoded().catch(() => {});
      }
    }

    this.audio.muted = this._isUsingBufferEngine;
    this.audio.volume = this.volumeValue;
    this.audio.src = srcUrl;
    this.audio.load();
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

    if (this.hasActiveDsp()) {
      this.initAudioGraph();
      if (this.ctx && (this.ctx.state === 'suspended' || this.ctx.state === 'interrupted')) {
        try { await this.ctx.resume(); } catch (e) {}
      }
      if (!this._decodedAudioBuffer && this._rawArrayBuffer) {
        await this._ensureAudioDecoded();
      }
      this._isUsingBufferEngine = Boolean(this._decodedAudioBuffer);
    } else {
      this._isUsingBufferEngine = false;
    }

    this.audio.muted = this._isUsingBufferEngine;
    this.audio.volume = this.volumeValue;
    return this.audio.play();
  }

  pause() {
    this._wantPlaying = false;
    this._stopBufferSource();
    if (this.activeMode === 'youtube') {
      if (this.ytPlayer && this.ytReady && typeof this.ytPlayer.pauseVideo === 'function') {
        this.ytPlayer.pauseVideo();
      }
      return;
    }
    this.audio.pause();
  }

  stop() {
    this._wantPlaying = false;
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
    this.audio.currentTime = seconds;
    if (this._isUsingBufferEngine && !this.audio.paused && this._decodedAudioBuffer) {
      this._startBufferSourceAt(seconds);
    }
  }

  // Mechanical Cassette Sound Synthesizer (Skipped while music is actively playing to avoid Bluetooth A2DP contention)
  playMechanicalSound(type = 'click') {
    if (!this.soundFxEnabled) return;
    // Never interrupt an active Bluetooth stream with a secondary AudioContext click
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
