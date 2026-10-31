/**
 * Winamp Web Player - Audio Engine (Web Audio API + Native CarPlay Pipeline + YouTube Bridge)
 * Handles audio playback, 10-band equalizer, preamp, stereo panning,
 * spectrum & oscilloscope analysis, YouTube link playback, and chiptune demo generation.
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
    this.soundFxEnabled = true; // Mechanical Cassette Sound FX
    this.volumeValue = 0.8;

    // Detect iOS / iPadOS / Apple CarPlay environment:
    // On iOS WebKit, calling AudioContext.createMediaElementSource(audio) detaches <audio>
    // from iOS's native hardware AVPlayer pipeline, causing Apple CarPlay & Lock Screen
    // controls/audio routing to fail or mute. Keeping <audio> on the native pipeline
    // guarantees 100% Apple CarPlay compatibility!
    this.isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent || '') ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    this.useNativeAudio = this.isIOS;

    // Playback mode: 'audio' (HTML5 <audio>) or 'youtube' (YouTube IFrame API)
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

    // Configure iOS audioSession to 'playback' immediately if supported
    if ('audioSession' in navigator) {
      try {
        navigator.audioSession.type = 'playback';
      } catch (e) {}
    }
  }

  // Initialize Web Audio Graph upon first user interaction
  initAudioGraph() {
    if (this.isInitialized) return;

    try {
      const oldBg = document.getElementById('winampBackgroundStream');
      if (oldBg) oldBg.remove();

      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;

      try {
        this.ctx = new AudioCtx({ latencyHint: 'playback' });
      } catch (e) {
        this.ctx = new AudioCtx();
      }

      // Set audioSession type to 'playback' for iOS Safari & Apple CarPlay integration
      if ('audioSession' in navigator) {
        try {
          navigator.audioSession.type = 'playback';
        } catch (e) {}
      }

      // IMPORTANT FOR APPLE CARPLAY & iOS:
      // Do NOT call createMediaElementSource(this.audio) on iOS/CarPlay devices!
      // Leaving this.audio attached directly to iOS's native hardware AVPlayer allows
      // seamless Apple CarPlay audio routing, steering-wheel controls, and lock-screen playback.
      if (!this.useNativeAudio) {
        this.source = this.ctx.createMediaElementSource(this.audio);
        this.preampGain = this.ctx.createGain();
        this.panner = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;
        this.masterGain = this.ctx.createGain();
        this.analyser = this.ctx.createAnalyser();

        this.analyser.fftSize = 128;
        this.analyser.smoothingTimeConstant = 0.75;

        this.eqFilters = this.eqFrequencies.map((freq, idx) => {
          const filter = this.ctx.createBiquadFilter();
          filter.type = 'peaking';
          filter.frequency.value = freq;
          filter.Q.value = 1.4;
          filter.gain.value = this.eqEnabled ? (this.eqGains[idx] || 0) : 0;
          return filter;
        });

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
      }

      if (this.ctx) {
        this.ctx.addEventListener('statechange', () => {
          if (!this.isPaused() && this.ctx && this.ctx.state !== 'running') {
            this.ctx.resume().catch(() => {});
          }
        });
      }

      this.audio.addEventListener('play', () => {
        if (!this.useNativeAudio) this.ensureRunning();
      });

      this.isInitialized = true;
    } catch (e) {
      console.warn('Web Audio API initialization skipped:', e);
    }
  }

  // Resume context if suspended or interrupted (non-blocking for native audio)
  async ensureRunning() {
    this.initAudioGraph();
    if (this.ctx && (this.ctx.state === 'suspended' || this.ctx.state === 'interrupted')) {
      try {
        await this.ctx.resume();
      } catch (e) {}
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
    this.audio.volume = clamped;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(clamped, this.ctx.currentTime);
    }
    if (this.ytPlayer && this.ytReady && typeof this.ytPlayer.setVolume === 'function') {
      try {
        this.ytPlayer.setVolume(Math.round(clamped * 100));
      } catch (e) {}
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
    if (this.analyser && this.isInitialized && !this.useNativeAudio && this.activeMode === 'audio') {
      this.analyser.getByteFrequencyData(array);
      return;
    }

    // Reactive synthesized spectrum for Native CarPlay Audio Mode & YouTube Mode
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
    if (this.analyser && this.isInitialized && !this.useNativeAudio && this.activeMode === 'audio') {
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
  // YOUTUBE IFRAME API & DIRECT STREAM SUPPORT
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
          this.ytPlayer = new window.YT.Player('ytPlayerFrame', {
            width: '200',
            height: '112',
            playerVars: {
              autoplay: 1,
              controls: 0,
              disablekb: 1,
              fs: 0,
              iv_load_policy: 3,
              modestbranding: 1,
              playsinline: 1,
              rel: 0,
              origin: window.location.origin
            },
            events: {
              onReady: () => {
                this.ytReady = true;
                try {
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
                    this.ytPlayer.loadVideoById(vid);
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
                  const d = this.ytPlayer.getDuration();
                  if (isFinite(d) && d > 0) this.ytDuration = d;
                  this._startYtTimer();
                  this.audio.dispatchEvent(new Event('play'));
                  this.audio.dispatchEvent(new Event('timeupdate'));
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

  // Load a YouTube track (uses YT IFrame Player API for 100% reliability)
  async loadYoutubeTrack(videoId, knownDuration = 0) {
    // Stop HTML5 audio cleanly
    try {
      this.audio.pause();
    } catch (e) {}

    this.activeMode = 'youtube';
    this.ytCurrentTime = 0;
    this.ytDuration = knownDuration || 0;
    this.ytPlaying = false;
    this.ytPendingVideoId = videoId;
    this.ytPendingAutoPlay = true;

    await this.initYoutubePlayer();
    if (this.ytPlayer && this.ytReady) {
      this.ytPendingVideoId = null;
      this.ytPlayer.setVolume(Math.round(this.volumeValue * 100));
      this.ytPlayer.loadVideoById(videoId);
    }
  }

  // Load standard audio file (Blob / File / URL)
  // Synchronous src assignment preserves iOS Safari / Apple CarPlay user gesture & MediaSession tokens!
  async loadTrack(source) {
    // Stop YouTube player if switching back to standard audio
    if (this.activeMode === 'youtube') {
      this.activeMode = 'audio';
      this.ytPlaying = false;
      this._stopYtTimer();
      if (this.ytPlayer && this.ytReady && typeof this.ytPlayer.stopVideo === 'function') {
        try { this.ytPlayer.stopVideo(); } catch (e) {}
      }
    }

    if (!this.useNativeAudio) {
      this.initAudioGraph();
      if (this.ctx && (this.ctx.state === 'suspended' || this.ctx.state === 'interrupted')) {
        this.ctx.resume().catch(() => {});
      }
    }

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
      this._currentBlobUrl = URL.createObjectURL(source);
      srcUrl = this._currentBlobUrl;
    } else if (typeof source === 'string') {
      srcUrl = source;
    }

    this.audio.src = srcUrl;
    this.audio.load();
  }

  async play() {
    if ('audioSession' in navigator) {
      try {
        navigator.audioSession.type = 'playback';
      } catch (e) {}
    }

    if (this.activeMode === 'youtube') {
      await this.initYoutubePlayer();
      if (this.ytPlayer && this.ytReady && typeof this.ytPlayer.playVideo === 'function') {
        this.ytPlayer.playVideo();
      }
      return;
    }

    if (!this.useNativeAudio) {
      this.initAudioGraph();
      if (this.ctx && (this.ctx.state === 'suspended' || this.ctx.state === 'interrupted')) {
        this.ctx.resume().catch(() => {});
      }
    }

    return this.audio.play();
  }

  pause() {
    if (this.activeMode === 'youtube') {
      if (this.ytPlayer && this.ytReady && typeof this.ytPlayer.pauseVideo === 'function') {
        this.ytPlayer.pauseVideo();
      }
      return;
    }
    this.audio.pause();
  }

  stop() {
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
  }

  // Mechanical Cassette Sound Synthesizer (Realistic Walkman physical button sounds)
  // On iOS/CarPlay, skips creating WebAudio oscillators so iOS never interrupts CarPlay AVPlayer!
  playMechanicalSound(type = 'click') {
    if (!this.soundFxEnabled || this.useNativeAudio) return;
    try {
      this.initAudioGraph();
      if (!this.ctx || this.ctx.state !== 'running') return;
      const now = this.ctx.currentTime;
      if (type === 'play' || type === 'clunk') {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(35, now + 0.08);
        gain.gain.setValueAtTime(0.28, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.08);

        const bufferSize = Math.floor(this.ctx.sampleRate * 0.03);
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(0.22, now);
        noise.connect(noiseGain);
        noiseGain.connect(this.ctx.destination);
        noise.start(now);
      } else if (type === 'stop' || type === 'pause' || type === 'click') {
        const bufferSize = Math.floor(this.ctx.sampleRate * 0.025);
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.2));
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(0.2, now);
        noise.connect(noiseGain);
        noiseGain.connect(this.ctx.destination);
        noise.start(now);
      } else if (type === 'eject') {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(260, now);
        osc.frequency.exponentialRampToValueAtTime(70, now + 0.1);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.1);
      }
    } catch (e) {}
  }

  // Generate an authentic retro chiptune wav blob for demo music!
  static createDemoChiptuneBlob() {
    const sampleRate = 22050;
    const duration = 24; // 24 seconds loop
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
    const stepSamples = Math.floor(beatSamples / 4); // 16th note

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

  // Helper to encode float buffer to WAV Blob
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
    view.setUint32(40, samples.length * 2, true);

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
