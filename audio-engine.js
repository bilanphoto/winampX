/**
 * Winamp Web Player - Audio Engine (Web Audio API + 10-Band EQ + YouTube Bridge)
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
    this.fxCtx = null;

    this.isInitialized = false;
    this.isFilterChainConnected = false;
    this.eqEnabled = true;
    this.preampValue = 0; // dB (-12 to +12)
    this.soundFxEnabled = true; // Mechanical Cassette Sound FX
    this.volumeValue = 0.8;
    this.balanceValue = 0.0;

    // Playback mode: 'audio' (HTML5 <audio> through 10-band EQ) or 'youtube' (YouTube IFrame API)
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
  }

  // Check if any EQ band, preamp, or stereo balance requires DSP processing
  hasActiveDsp() {
    const hasEq = this.eqEnabled && (
      Math.abs(this.preampValue) > 0.05 ||
      this.eqGains.some(g => Math.abs(g) > 0.05)
    );
    return hasEq || Math.abs(this.balanceValue) > 0.05;
  }

  // No-op: We NEVER call createMediaElementSource(this.audio) so <audio> stays 100% on the
  // OS Native Hardware Audio Pipeline (zero Bluetooth A2DP stuttering!).
  // Instead, 10-band EQ & Preamp are rendered in RAM via OfflineAudioContext!
  initAudioGraph() {
    this.isInitialized = true;
  }

  rewireGraph() {
    this._scheduleOfflineEqUpdate(120);
  }

  async ensureRunning() {
    return;
  }

  // Decode the current MP3 ArrayBuffer in RAM using OfflineAudioContext (never touches Bluetooth hardware)
  async _ensureDecodedBuffer(loadId) {
    if (this._decodedBuffer && this._decodedLoadId === loadId) {
      return this._decodedBuffer;
    }
    if (this._decodePromise && this._decodePromiseLoadId === loadId) {
      return this._decodePromise;
    }
    if (!this._rawArrayBuffer) return null;

    const OfflineCtx = window.OfflineAudioContext || window.webkitOfflineAudioContext;
    if (!OfflineCtx) return null;

    this._decodePromiseLoadId = loadId;
    this._decodePromise = (async () => {
      try {
        const tempCtx = new OfflineCtx(2, 1, 44100);
        const bufCopy = this._rawArrayBuffer.slice(0);
        const decoded = await new Promise((resolve, reject) => {
          const p = tempCtx.decodeAudioData(bufCopy, resolve, reject);
          if (p && typeof p.then === 'function') {
            p.then(resolve).catch(reject);
          }
        });
        if (loadId === this._trackLoadId) {
          this._decodedBuffer = decoded;
          this._decodedLoadId = loadId;
        }
        return decoded;
      } catch (e) {
        console.warn('Offline decodeAudioData failed:', e);
        return null;
      } finally {
        if (this._decodePromiseLoadId === loadId) {
          this._decodePromise = null;
        }
      }
    })();

    return this._decodePromise;
  }

  // Schedule a debounced OfflineAudioContext EQ render & seamless native <audio> buffer swap
  _scheduleOfflineEqUpdate(delayMs = 160) {
    if (this.activeMode !== 'audio' || !this._rawBlob) return;
    if (this._eqUpdateTimer) {
      clearTimeout(this._eqUpdateTimer);
    }
    const targetLoadId = this._trackLoadId;
    this._eqRenderSeq = (this._eqRenderSeq || 0) + 1;
    const renderSeq = this._eqRenderSeq;

    this._eqUpdateTimer = setTimeout(() => {
      this._eqUpdateTimer = null;
      this._applyOfflineEqToCurrentTrack(targetLoadId, renderSeq);
    }, delayMs);
  }

  async _applyOfflineEqToCurrentTrack(loadId, renderSeq) {
    if (loadId !== this._trackLoadId || this.activeMode !== 'audio' || !this._rawBlob) return;

    // If EQ is turned OFF or all sliders are Flat (0 dB), swap back to raw RAM MP3 blob
    if (!this.hasActiveDsp()) {
      if (this._isUsingEqBlob && this._rawBlob) {
        const rawUrl = URL.createObjectURL(this._rawBlob);
        this._isUsingEqBlob = false;
        await this._swapAudioSrcPreservingState(rawUrl, loadId);
      }
      return;
    }

    const OfflineCtx = window.OfflineAudioContext || window.webkitOfflineAudioContext;
    if (!OfflineCtx) return;

    const audioBuffer = await this._ensureDecodedBuffer(loadId);
    if (!audioBuffer || loadId !== this._trackLoadId || renderSeq !== this._eqRenderSeq) return;

    try {
      const numChannels = Math.min(2, audioBuffer.numberOfChannels || 1);
      const sampleRate = audioBuffer.sampleRate || 44100;
      const length = audioBuffer.length;

      const offlineCtx = new OfflineCtx(numChannels, length, sampleRate);
      const sourceNode = offlineCtx.createBufferSource();
      sourceNode.buffer = audioBuffer;

      let currentNode = sourceNode;

      // Preamp Gain
      if (this.eqEnabled && Math.abs(this.preampValue) > 0.05) {
        const preampNode = offlineCtx.createGain();
        preampNode.gain.value = Math.pow(10, this.preampValue / 20);
        currentNode.connect(preampNode);
        currentNode = preampNode;
      }

      // 10-Band Peaking EQ Filters (only connect bands with non-zero gain for maximum speed)
      if (this.eqEnabled) {
        for (let idx = 0; idx < this.eqFrequencies.length; idx++) {
          const gainDb = this.eqGains[idx] || 0;
          if (Math.abs(gainDb) > 0.05) {
            const filter = offlineCtx.createBiquadFilter();
            filter.type = 'peaking';
            filter.frequency.value = this.eqFrequencies[idx];
            filter.Q.value = 1.4;
            filter.gain.value = gainDb;
            currentNode.connect(filter);
            currentNode = filter;
          }
        }
      }

      // Stereo Balance Panner
      if (Math.abs(this.balanceValue) > 0.05 && offlineCtx.createStereoPanner) {
        const panner = offlineCtx.createStereoPanner();
        panner.pan.value = this.balanceValue;
        currentNode.connect(panner);
        currentNode = panner;
      }

      currentNode.connect(offlineCtx.destination);
      sourceNode.start(0);

      const renderedBuffer = await offlineCtx.startRendering();
      if (loadId !== this._trackLoadId || renderSeq !== this._eqRenderSeq || this.activeMode !== 'audio') {
        return;
      }

      const wavBlob = WinampAudioEngine.encodeAudioBufferWAV(renderedBuffer);
      const wavUrl = URL.createObjectURL(wavBlob);
      this._isUsingEqBlob = true;
      await this._swapAudioSrcPreservingState(wavUrl, loadId);
    } catch (e) {
      console.warn('Offline EQ render error:', e);
    }
  }

  async _swapAudioSrcPreservingState(newBlobUrl, loadId) {
    if (loadId !== this._trackLoadId || this.activeMode !== 'audio') {
      try { URL.revokeObjectURL(newBlobUrl); } catch (e) {}
      return;
    }

    const wasPlaying = !this.audio.paused || Boolean(this._wantPlaying);
    const savedTime = this.audio.currentTime || 0;
    const savedRate = this.audio.playbackRate || 1.0;

    this.isSwappingEqBuffer = true;
    const oldBlobUrl = this._currentBlobUrl;
    this._currentBlobUrl = newBlobUrl;

    try {
      this.audio.src = newBlobUrl;
      this.audio.volume = this.volumeValue;
      this.audio.playbackRate = savedRate;

      await new Promise((resolve) => {
        let settled = false;
        const done = () => {
          if (settled) return;
          settled = true;
          this.audio.removeEventListener('loadedmetadata', done);
          this.audio.removeEventListener('canplay', done);
          this.audio.removeEventListener('error', done);
          resolve();
        };
        this.audio.addEventListener('loadedmetadata', done, { once: true });
        this.audio.addEventListener('canplay', done, { once: true });
        this.audio.addEventListener('error', done, { once: true });
        setTimeout(done, 600);
        this.audio.load();
      });

      if (loadId === this._trackLoadId && this.activeMode === 'audio') {
        if (savedTime > 0 && isFinite(savedTime)) {
          try {
            this.audio.currentTime = savedTime;
          } catch (e) {}
        }
        if (wasPlaying) {
          try {
            await this.audio.play();
          } catch (e) {}
        }
      }
    } finally {
      this.isSwappingEqBuffer = false;
      if (oldBlobUrl && oldBlobUrl !== newBlobUrl) {
        setTimeout(() => {
          try { URL.revokeObjectURL(oldBlobUrl); } catch (e) {}
        }, 1000);
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
    this.audio.volume = clamped;
    if (this.ytPlayer && this.ytReady && typeof this.ytPlayer.setVolume === 'function') {
      try {
        this.ytPlayer.setVolume(Math.round(clamped * 100));
      } catch (e) {}
    }
  }

  // Balance (-1.0 Left to +1.0 Right)
  setBalance(val, userInitiated = false) {
    const clamped = Math.max(-1, Math.min(1, val));
    this.balanceValue = clamped;
    if (userInitiated) {
      this._scheduleOfflineEqUpdate(160);
    }
  }

  // Preamp Gain (-12dB to +12dB)
  setPreamp(db, userInitiated = false) {
    this.preampValue = db;
    if (userInitiated) {
      this._scheduleOfflineEqUpdate(160);
    }
  }

  // Individual Band Gain (index 0 to 9, -12dB to +12dB)
  setBandGain(index, db, userInitiated = false) {
    if (index >= 0 && index < this.eqGains.length) {
      this.eqGains[index] = db;
      if (userInitiated) {
        this._scheduleOfflineEqUpdate(160);
      }
    }
  }

  // Enable / Disable Equalizer
  setEqEnabled(enabled, userInitiated = false) {
    this.eqEnabled = enabled;
    if (userInitiated) {
      this._scheduleOfflineEqUpdate(80);
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
    if (this.analyser && this.isInitialized && this.activeMode === 'audio') {
      this.analyser.getByteFrequencyData(array);
      return;
    }

    // Reactive synthesized spectrum for YouTube Mode
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
    if (this.analyser && this.isInitialized && this.activeMode === 'audio') {
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

  // Load standard audio file (Blob / File / URL) on 100% Native Hardware Audio Pipeline
  async loadTrack(source) {
    if (this.activeMode === 'youtube') {
      this.activeMode = 'audio';
      this.ytPlaying = false;
      this._stopYtTimer();
      if (this.ytPlayer && this.ytReady && typeof this.ytPlayer.stopVideo === 'function') {
        try { this.ytPlayer.stopVideo(); } catch (e) {}
      }
    }

    if ('audioSession' in navigator) {
      try {
        navigator.audioSession.type = 'playback';
      } catch (e) {}
    }

    if (this._eqUpdateTimer) {
      clearTimeout(this._eqUpdateTimer);
      this._eqUpdateTimer = null;
    }

    this._trackLoadId = (this._trackLoadId || 0) + 1;
    const loadId = this._trackLoadId;
    this._decodedBuffer = null;
    this._decodePromise = null;
    this._rawArrayBuffer = null;
    this._rawBlob = null;
    this._isUsingEqBlob = false;

    let srcUrl = '';
    if (source instanceof Blob || source instanceof File) {
      if (this._currentBlobUrl) {
        try { URL.revokeObjectURL(this._currentBlobUrl); } catch (e) {}
      }
      // Pre-buffer entire MP3/audio file into contiguous RAM so IndexedDB disk reads never stall Bluetooth A2DP playback
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
      this._rawBlob = memoryBlob;
      this._currentBlobUrl = URL.createObjectURL(memoryBlob);
      srcUrl = this._currentBlobUrl;
    } else if (typeof source === 'string') {
      srcUrl = source;
    }

    this.audio.volume = this.volumeValue;
    this.audio.src = srcUrl;
    this.audio.load();

    if (this._rawArrayBuffer) {
      if (this.hasActiveDsp()) {
        this._scheduleOfflineEqUpdate(50);
      } else {
        // Pre-decode silently in background so moving any EQ slider later is super fast
        setTimeout(() => {
          if (this._trackLoadId === loadId) {
            this._ensureDecodedBuffer(loadId);
          }
        }, 250);
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
    this.audio.pause();
  }

  stop() {
    this._wantPlaying = false;
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

  // Mechanical Cassette Sound Synthesizer (Isolated AudioContext so clicks never touch <audio>)
  playMechanicalSound(type = 'click') {
    if (!this.soundFxEnabled) return;
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

        const bufferSize = Math.floor(fx.sampleRate * 0.03);
        const buffer = fx.createBuffer(1, bufferSize, fx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
        const noise = fx.createBufferSource();
        noise.buffer = buffer;
        const noiseGain = fx.createGain();
        noiseGain.gain.setValueAtTime(0.22, now);
        noise.connect(noiseGain);
        noiseGain.connect(fx.destination);
        noise.start(now);
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

  // Ultra-fast Stereo/Mono AudioBuffer -> 16-bit PCM WAV Blob encoder (uses typed Int16Array)
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
