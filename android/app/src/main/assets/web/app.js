/**
 * Winamp Web Player - Application Controller
 * Supports both Modern Silver Blue and Classic 2.91 Original Skins
 */

document.addEventListener('DOMContentLoaded', async () => {
  if ('audioSession' in navigator) {
    try {
      navigator.audioSession.type = 'playback';
    } catch (e) {}
  }

  // DOM Elements - Main Window
  const mainWindow = document.getElementById('mainWindow');
  const mainTitlebar = document.getElementById('mainTitlebar');
  const mainMinBtn = document.getElementById('mainMinBtn');
  const mainShadeBtn = document.getElementById('mainShadeBtn');
  const mainCloseBtn = document.getElementById('mainCloseBtn');

  // DOM Elements - EQ Window
  const eqWindow = document.getElementById('eqWindow');
  const eqTitlebar = document.getElementById('eqTitlebar');
  const eqShadeBtn = document.getElementById('eqShadeBtn');
  const eqCloseBtn = document.getElementById('eqCloseBtn');

  // DOM Elements - Playlist Window
  const plWindow = document.getElementById('plWindow');
  const plTitlebar = document.getElementById('plTitlebar');
  const plShadeBtn = document.getElementById('plShadeBtn');
  const plCloseBtn = document.getElementById('plCloseBtn');

  // DOM Elements - Cassette Deck Window & Walkman Modal
  const cassetteWindow = document.getElementById('cassetteWindow');
  const ipodWindow = document.getElementById('ipodWindow');
  const ipodClassicWindow = document.getElementById('ipodClassicWindow');
  const cassetteTitlebar = document.getElementById('cassetteTitlebar');
  const cassetteMenuBtn = document.getElementById('cassetteMenuBtn');
  const cassetteContextMenu = document.getElementById('cassetteContextMenu');
  const cassetteShadeBtn = document.getElementById('cassetteShadeBtn');
  const cassetteCloseBtn = document.getElementById('cassetteCloseBtn');
  const btnToggleTape = document.getElementById('btnToggleTape');
  const btnTitlebarWalkman = document.getElementById('btnTitlebarWalkman');

  const deckCounter = document.getElementById('deckCounter');
  const deckCounterReset = document.getElementById('deckCounterReset');
  const deckLed = document.getElementById('deckLed');
  const cassetteCard = document.getElementById('cassetteCard');
  const cassetteImg = document.getElementById('cassetteImg');
  const tapePackLeft = document.getElementById('tapePackLeft');
  const tapePackRight = document.getElementById('tapePackRight');
  const hubLeft = document.getElementById('hubLeft');
  const hubRight = document.getElementById('hubRight');
  const tapeTitle = document.getElementById('tapeTitle');
  const tapeArtist = document.getElementById('tapeArtist');
  const tapeSideStamp = document.getElementById('tapeSideStamp');
  const btnTapeClear = document.getElementById('btnTapeClear');
  const btnTapeOrange = document.getElementById('btnTapeOrange');
  const mechPlay = document.getElementById('mechPlay');
  const mechPause = document.getElementById('mechPause');
  const mechStop = document.getElementById('mechStop');
  const mechRew = document.getElementById('mechRew');
  const mechFF = document.getElementById('mechFF');
  const mechEject = document.getElementById('mechEject');
  const btnOpenWalkmanModal = document.getElementById('btnOpenWalkmanModal');

  const walkmanModal = document.getElementById('walkmanModal');
  const wmCloseBtn = document.getElementById('wmCloseBtn');
  const wmSideBtn = document.getElementById('wmSideBtn');
  const wmSoundFxBtn = document.getElementById('wmSoundFxBtn');
  const wmCassetteCard = document.getElementById('wmCassetteCard');
  const wmCassetteImg = document.getElementById('wmCassetteImg');
  const wmSpoolLeft = document.getElementById('wmSpoolLeft');
  const wmSpoolRight = document.getElementById('wmSpoolRight');
  const wmHubLeft = document.getElementById('wmHubLeft');
  const wmHubRight = document.getElementById('wmHubRight');
  const wmTrackTitle = document.getElementById('wmTrackTitle');
  const wmTrackArtist = document.getElementById('wmTrackArtist');
  const wmSideBadge = document.getElementById('wmSideBadge');
  const wmBtnClear = document.getElementById('wmBtnClear');
  const wmBtnOrange = document.getElementById('wmBtnOrange');
  const wmCounter = document.getElementById('wmCounter');
  const wmCounterReset = document.getElementById('wmCounterReset');
  const wmLed = document.getElementById('wmLed');
  const wmKeyPlay = document.getElementById('wmKeyPlay');
  const wmKeyPause = document.getElementById('wmKeyPause');
  const wmKeyStop = document.getElementById('wmKeyStop');
  const wmKeyRew = document.getElementById('wmKeyRew');
  const wmKeyFF = document.getElementById('wmKeyFF');
  const wmKeyEject = document.getElementById('wmKeyEject');
  const wmVolSlider = document.getElementById('wmVolSlider');

  const cassetteState = {
    tape: 'clear', // 'clear' or 'orange'
    side: 'A',
    counterOffset: 0
  };

  // Display Screen
  const timeDisplay = document.getElementById('timeDisplay');
  const timeMinus = document.getElementById('timeMinus');
  const timeMinTen = document.getElementById('timeMinTen');
  const timeMinOne = document.getElementById('timeMinOne');
  const timeSecTen = document.getElementById('timeSecTen');
  const timeSecOne = document.getElementById('timeSecOne');
  const playStatusIcon = document.getElementById('playStatusIcon');
  const kbpsDisplay = document.getElementById('kbpsDisplay');
  const khzDisplay = document.getElementById('khzDisplay');
  const monosterIndicator = document.getElementById('monosterIndicator');
  const titleMarquee = document.getElementById('titleMarquee');

  // Visualizer Canvas
  const visContainer = document.getElementById('visContainer');
  const visCanvas = document.getElementById('visCanvas');
  const visCtx = visCanvas.getContext('2d');

  // Sliders & Toggles
  const volTrack = document.getElementById('volTrack');
  const volTrackBg = document.getElementById('volTrackBg');
  const volThumb = document.getElementById('volThumb');
  const balTrack = document.getElementById('balTrack');
  const balTrackBg = document.getElementById('balTrackBg');
  const balThumb = document.getElementById('balThumb');
  const btnToggleEQ = document.getElementById('btnToggleEQ');
  const btnTogglePL = document.getElementById('btnTogglePL');
  const btnToggleML = document.getElementById('btnToggleML');

  // Seek / Scrubber
  const seekTrack = document.getElementById('seekTrack');
  const seekThumb = document.getElementById('seekThumb');

  // Transport Buttons
  const btnPrev = document.getElementById('btnPrev');
  const btnPlay = document.getElementById('btnPlay');
  const btnPause = document.getElementById('btnPause');
  const btnStop = document.getElementById('btnStop');
  const btnNext = document.getElementById('btnNext');
  const btnEject = document.getElementById('btnEject');
  const btnShuffle = document.getElementById('btnShuffle');
  const btnRepeat = document.getElementById('btnRepeat');
  const btnAbout = document.getElementById('btnAbout');

  // EQ Elements
  const eqOnBtn = document.getElementById('eqOnBtn');
  const eqAutoBtn = document.getElementById('eqAutoBtn');
  const eqCanvas = document.getElementById('eqCanvas');
  const eqCtx = eqCanvas.getContext('2d');
  const eqPresetsBtn = document.getElementById('eqPresetsBtn');
  const presetsMenu = document.getElementById('presetsMenu');
  const btnResetEQ = document.getElementById('btnResetEQ');
  const faderPreamp = document.getElementById('faderPreamp');
  const eqTracks = document.querySelectorAll('.eq-fader-track');

  // Playlist Elements
  const plList = document.getElementById('plList');
  const plListDropZone = document.getElementById('plListDropZone');
  const plTotalTime = document.getElementById('plTotalTime');
  const plCurTime = document.getElementById('plCurTime');
  const plScrollTrack = document.getElementById('plScrollTrack');
  const plScrollThumb = document.getElementById('plScrollThumb');
  const plAddBtn = document.getElementById('plAddBtn');
  const plAddMenu = document.getElementById('plAddMenu');
  const plRemBtn = document.getElementById('plRemBtn');
  const plRemMenu = document.getElementById('plRemMenu');
  const plSelBtn = document.getElementById('plSelBtn');
  const plSelMenu = document.getElementById('plSelMenu');
  const plMiscBtn = document.getElementById('plMiscBtn');
  const plMiscMenu = document.getElementById('plMiscMenu');
  const plOptsBtn = document.getElementById('plOptsBtn');
  const plOptsMenu = document.getElementById('plOptsMenu');
  const plResizeHandle = document.getElementById('plResizeHandle');
  const plResizeBottom = document.getElementById('plResizeBottom');
  const mainMenuBtn = document.getElementById('mainMenuBtn');
  const mainContextMenu = document.getElementById('mainContextMenu');

  // File Inputs
  const fileInput = document.getElementById('fileInput');
  const folderInput = document.getElementById('folderInput');

  // Mini Transport
  const plMiniPrev = document.getElementById('plMiniPrev');
  const plMiniPlay = document.getElementById('plMiniPlay');
  const plMiniPause = document.getElementById('plMiniPause');
  const plMiniStop = document.getElementById('plMiniStop');
  const plMiniNext = document.getElementById('plMiniNext');
  const plMiniEject = document.getElementById('plMiniEject');

  // Top Bar & Skin Switcher Buttons
  const btnSkinModern = document.getElementById('btnSkinModern');
  const btnSkinClassic = document.getElementById('btnSkinClassic');
  const btnSkinMidnight = document.getElementById('btnSkinMidnight');
  const btnLoadDemo = document.getElementById('btnLoadDemo');
  const btnResetLayout = document.getElementById('btnResetLayout');
  const btnKeyboardHelp = document.getElementById('btnKeyboardHelp');
  const helpModal = document.getElementById('helpModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const toast = document.getElementById('toast');

  // Audio Engine
  const audioElement = document.getElementById('audioElement');
  const engine = new WinampAudioEngine(audioElement);

  // App State
  const state = {
    playlist: [],
    currentIndex: -1,
    selectedIndices: new Set(),
    isPlaying: false,
    isPaused: false,
    volume: 0.8,
    balance: 0.0,
    shuffle: false,
    repeat: 'all',
    timeRemainingMode: false,
    visMode: 0,
    eqEnabled: true,
    eqAuto: false,
    preamp: 0,
    bands: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    isDraggingSeek: false,
    isDraggingVolume: false,
    isDraggingBalance: false,
    isDraggingScroll: false,
    currentSkin: 'skin-modern'
  };

  // Classic Palette
  const classicSpecColors = [
    'rgb(24,132,8)',   'rgb(41,148,0)',   'rgb(49,156,8)',   'rgb(57,181,16)',
    'rgb(50,190,16)',  'rgb(41,206,16)',  'rgb(148,222,33)', 'rgb(189,222,41)',
    'rgb(214,181,33)', 'rgb(222,165,24)', 'rgb(198,123,8)',  'rgb(214,115,0)',
    'rgb(214,102,0)',  'rgb(214,90,0)',   'rgb(206,41,16)',  'rgb(239,49,16)'
  ];

  // Modern Electric Blue Palette
  const modernSpecColors = [
    '#1e40af', '#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#38bdf8', '#7dd3fc', '#bae6fd',
    '#38bdf8', '#60a5fa', '#93c5fd', '#bae6fd', '#e0f2fe', '#f0f9ff', '#ffffff', '#ffffff'
  ];

  const numVisBars = 19;
  const peakLevels = new Array(numVisBars).fill(0);
  const peakDecay = new Array(numVisBars).fill(0);

  // Toast Helper
  let toastTimer = null;
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.remove('hidden');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.add('hidden');
    }, 2500);
  }

  // =========================================================================
  // SKIN SWITCHING LOGIC
  // =========================================================================
  function switchSkin(skinName) {
    if (skinName === 'skin-classic') {
      skinName = 'skin-midnight';
    }
    if (skinName !== 'skin-cassette' && skinName !== 'skin-ipod' && skinName !== 'skin-ipod-classic') {
      state.lastWinampSkin = skinName;
    }
    state.currentSkin = skinName;
    document.body.classList.remove('skin-classic', 'skin-modern', 'skin-midnight', 'skin-cassette', 'skin-ipod', 'skin-ipod-classic');
    document.body.classList.add(skinName);

    if (btnSkinModern) btnSkinModern.classList.toggle('active', skinName === 'skin-modern');
    if (btnSkinMidnight) btnSkinMidnight.classList.toggle('active', skinName === 'skin-midnight');

    window.winampDB.setSetting('skin', skinName);
    const skinLabels = {
      'skin-modern': 'Modern Silver Blue',
      'skin-midnight': 'Midnight Gold (Violet / Gold)',
      'skin-cassette': '📼 Walkman Cassette Player',
      'skin-ipod': '📱 Apple iPod touch (iOS)',
      'skin-ipod-classic': '💿 Apple iPod Classic (Click Wheel)'
    };
    showToast(`Switched to ${skinLabels[skinName] || skinName}`);

    if (skinName === 'skin-ipod-classic') {
      mainWindow.classList.add('hidden');
      eqWindow.classList.add('hidden');
      plWindow.classList.add('hidden');
      cassetteWindow.classList.add('hidden');
      if (ipodWindow) ipodWindow.classList.add('hidden');
      if (walkmanModal) walkmanModal.classList.add('hidden');
      if (ipodClassicWindow) ipodClassicWindow.classList.remove('hidden');
      if (typeof updateIpcUI === 'function') updateIpcUI();
      if (typeof renderIpcCoverFlow === 'function') renderIpcCoverFlow();
      if (typeof renderIpcSongs === 'function') renderIpcSongs();
      if (typeof updateIpcEQ === 'function') updateIpcEQ();
      if (typeof drawIpcCoverArt === 'function') drawIpcCoverArt();
    } else if (skinName === 'skin-ipod') {
      mainWindow.classList.add('hidden');
      eqWindow.classList.add('hidden');
      plWindow.classList.add('hidden');
      cassetteWindow.classList.add('hidden');
      if (ipodClassicWindow) ipodClassicWindow.classList.add('hidden');
      if (walkmanModal) walkmanModal.classList.add('hidden');
      if (ipodWindow) ipodWindow.classList.remove('hidden');
      if (typeof updateIpodUI === 'function') updateIpodUI();
      if (typeof renderIpodSongs === 'function') renderIpodSongs();
      if (typeof updateIpodEQ === 'function') updateIpodEQ();
      if (typeof drawIpodCoverArt === 'function') drawIpodCoverArt();
    } else if (skinName === 'skin-cassette') {
      if (ipodWindow) ipodWindow.classList.add('hidden');
      if (ipodClassicWindow) ipodClassicWindow.classList.add('hidden');
      mainWindow.classList.add('hidden');
      eqWindow.classList.add('hidden');
      cassetteWindow.classList.remove('hidden', 'shaded');
      const isPlEnabled = document.getElementById('btnCassetteTogglePL')?.classList.contains('active') ?? true;
      if (isPlEnabled) plWindow.classList.remove('hidden');
      if (state.currentIndex >= 0 && state.currentIndex < state.playlist.length) {
        updateCassetteLabel(state.playlist[state.currentIndex]);
      }
      updateCassetteUI();
    } else {
      if (ipodWindow) ipodWindow.classList.add('hidden');
      if (ipodClassicWindow) ipodClassicWindow.classList.add('hidden');
      cassetteWindow.classList.add('hidden');
      mainWindow.classList.remove('hidden', 'shaded');
      const isEqEnabled = btnToggleEQ && btnToggleEQ.classList.contains('active');
      if (isEqEnabled) eqWindow.classList.remove('hidden');
      const isPlEnabled = btnTogglePL && btnTogglePL.classList.contains('active');
      if (isPlEnabled) plWindow.classList.remove('hidden');
    }

    updateResponsiveLayout();

    // Update timer display format
    updateTimerDisplay(engine.getCurrentTime(), engine.getDuration());

    // Redraw EQ
    drawEQCurve();

    // Adjust canvas resolution for skin
    if (skinName === 'skin-modern') {
      visCanvas.width = 130;
      visCanvas.height = 30;
    } else {
      visCanvas.width = 76;
      visCanvas.height = 16;
    }

    if (typeof updatePlScrollbarThumb === 'function') {
      updatePlScrollbarThumb();
    }
    if (typeof renderIpodSongs === 'function') renderIpodSongs();
    if (typeof updateIpodUI === 'function') updateIpodUI();
    if (typeof renderIpcSongs === 'function') renderIpcSongs();
    if (typeof updateIpcUI === 'function') updateIpcUI();
  }

  if (btnSkinModern) btnSkinModern.addEventListener('click', () => switchSkin('skin-modern'));
  if (btnSkinMidnight) btnSkinMidnight.addEventListener('click', () => switchSkin('skin-midnight'));

  // =========================================================================
  // WINDOW DOCKING, SNAPPING & DRAGGING
  // =========================================================================
  const SNAP_DISTANCE = 14;
  const allWindows = [mainWindow, eqWindow, plWindow, cassetteWindow];

  function bringToFront(win) {
    allWindows.forEach(w => w.classList.remove('active-window'));
    win.classList.add('active-window');
  }

  function setupWindowDragging(win, handle) {
    let isDragging = false;
    let startX = 0, startY = 0;
    let initialLeft = 0, initialTop = 0;

    handle.addEventListener('mousedown', (e) => {
      if (e.target.classList.contains('win-btn') || e.target.classList.contains('wa-titlebar-menu')) return;
      isDragging = true;
      bringToFront(win);
      startX = e.clientX;
      startY = e.clientY;
      initialLeft = win.offsetLeft;
      initialTop = win.offsetTop;

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
      e.preventDefault();
    });

    function onMouseMove(e) {
      if (!isDragging) return;
      const scale = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--mobile-scale')) || 1;
      let newLeft = initialLeft + (e.clientX - startX) / scale;
      let newTop = initialTop + (e.clientY - startY) / scale;

      if (Math.abs(newLeft) < SNAP_DISTANCE) newLeft = 0;
      if (Math.abs(newTop) < SNAP_DISTANCE) newTop = 0;

      const myW = win.offsetWidth;
      const myH = win.offsetHeight;

      for (const other of allWindows) {
        if (other === win || other.classList.contains('hidden')) continue;
        const oL = other.offsetLeft;
        const oT = other.offsetTop;
        const oW = other.offsetWidth;
        const oH = other.offsetHeight;

        // Vertical snap
        if (Math.abs(newTop - (oT + oH)) < SNAP_DISTANCE) {
          newTop = oT + oH;
        } else if (Math.abs((newTop + myH) - oT) < SNAP_DISTANCE) {
          newTop = oT - myH;
        }

        // Horizontal snap
        if (Math.abs(newLeft - oL) < SNAP_DISTANCE) {
          newLeft = oL;
        } else if (Math.abs((newLeft + myW) - (oL + oW)) < SNAP_DISTANCE) {
          newLeft = oL + oW - myW;
        } else if (Math.abs(newLeft - (oL + oW)) < SNAP_DISTANCE) {
          newLeft = oL + oW;
        } else if (Math.abs((newLeft + myW) - oL) < SNAP_DISTANCE) {
          newLeft = oL - myW;
        }
      }

      win.style.left = `${newLeft}px`;
      win.style.top = `${newTop}px`;
    }

    function onMouseUp() {
      if (isDragging) {
        isDragging = false;
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        saveWindowPositions();
      }
    }

    win.addEventListener('mousedown', () => bringToFront(win));
  }

  setupWindowDragging(mainWindow, mainTitlebar);
  setupWindowDragging(eqWindow, eqTitlebar);
  setupWindowDragging(plWindow, plTitlebar);
  setupWindowDragging(cassetteWindow, cassetteTitlebar);

  function updateResponsiveLayout() {
    // Universal responsive auto-resizing across all screen sizes:
    const isLandscape = window.innerWidth >= window.innerHeight * 1.05;
    const winContainer = document.getElementById('windows-container');
    const isIpodSkin = document.body.classList.contains('skin-ipod');
    const isIpcSkin = document.body.classList.contains('skin-ipod-classic');
    const isCassetteSkin = document.body.classList.contains('skin-cassette');

    if (isIpcSkin) {
      document.body.classList.remove('layout-portrait', 'layout-desktop', 'layout-landscape');
      document.body.classList.add(isLandscape ? 'layout-landscape' : 'layout-portrait');

      const availW = Math.max(240, window.innerWidth - 16);
      const availH = Math.max(300, window.innerHeight - 16);
      const baseW = 320;
      const baseH = 540;

      let scale = Math.min(availW / baseW, availH / baseH);
      scale = Math.max(0.48, Math.min(scale, 1.85));

      document.documentElement.style.setProperty('--mobile-scale', scale.toFixed(3));
      document.documentElement.style.setProperty('--ws-width', `${baseW}px`);
      document.documentElement.style.setProperty('--ws-height', `${baseH}px`);

      if (ipodClassicWindow) {
        ipodClassicWindow.style.left = '0px';
        ipodClassicWindow.style.top = '0px';
      }
      return;
    }

    if (isIpodSkin) {
      document.body.classList.remove('layout-portrait', 'layout-desktop', 'layout-landscape');
      document.body.classList.add(isLandscape ? 'layout-landscape' : 'layout-portrait');

      const availW = Math.max(240, window.innerWidth - 16);
      const availH = Math.max(300, window.innerHeight - 16);
      const baseW = 340;
      const baseH = 640;

      let scale = Math.min(availW / baseW, availH / baseH);
      scale = Math.max(0.45, Math.min(scale, 1.85));

      document.documentElement.style.setProperty('--mobile-scale', scale.toFixed(3));
      document.documentElement.style.setProperty('--ws-width', `${baseW}px`);
      document.documentElement.style.setProperty('--ws-height', `${baseH}px`);

      if (ipodWindow) {
        ipodWindow.style.left = '0px';
        ipodWindow.style.top = '0px';
      }
      return;
    }

    if (isCassetteSkin) {
      // In Walkman Cassette mode: Winamp main is hidden, EQ and Playlist can be toggled
      const padL = winContainer ? parseInt(getComputedStyle(winContainer).paddingLeft, 10) || 12 : 12;
      const padR = winContainer ? parseInt(getComputedStyle(winContainer).paddingRight, 10) || 12 : 12;
      const padT = winContainer ? parseInt(getComputedStyle(winContainer).paddingTop, 10) || 12 : 12;
      const padB = winContainer ? parseInt(getComputedStyle(winContainer).paddingBottom, 10) || 12 : 12;

      const availW = Math.max(260, window.innerWidth - padL - padR);
      const availH = Math.max(200, window.innerHeight - padT - padB);

      const isEqVisible = !eqWindow.classList.contains('hidden');
      const isPlVisible = !plWindow.classList.contains('hidden');
      const csH = cassetteWindow.classList.contains('shaded') ? 14 : 232;
      const eqH = isEqVisible ? (eqWindow.classList.contains('shaded') ? 14 : 116) : 0;

      if (isLandscape) {
        document.body.classList.remove('layout-portrait', 'layout-desktop');
        document.body.classList.add('layout-landscape');

        const baseW = isPlVisible ? 550 : 275;
        const leftColH = csH + eqH;
        const baseH = Math.max(leftColH, isPlVisible ? 232 : leftColH);

        let scale = Math.min(availW / baseW, availH / baseH);
        scale = Math.max(0.6, Math.min(scale, 3.2));

        document.documentElement.style.setProperty('--mobile-scale', scale.toFixed(3));
        document.documentElement.style.setProperty('--ws-width', `${baseW}px`);
        document.documentElement.style.setProperty('--ws-height', `${baseH}px`);

        cassetteWindow.style.left = '0px';
        cassetteWindow.style.top = '0px';

        if (isEqVisible) {
          eqWindow.style.left = '0px';
          eqWindow.style.top = `${csH}px`;
        }

        if (isPlVisible) {
          plWindow.style.left = '275px';
          plWindow.style.top = '0px';
          plWindow.style.height = `${baseH}px`;
        }
      } else {
        document.body.classList.remove('layout-landscape', 'layout-desktop');
        document.body.classList.add('layout-portrait');

        let scale = availW / 275;
        scale = Math.min(scale, 2.2);

        const minReqH = csH + eqH + (isPlVisible ? 160 : 0);
        if (minReqH * scale > availH && availH > 200) {
          const heightScale = availH / minReqH;
          if (heightScale < scale) scale = Math.max(0.65, heightScale);
        }
        scale = Math.max(0.65, scale);

        document.documentElement.style.setProperty('--mobile-scale', scale.toFixed(3));
        document.documentElement.style.setProperty('--ws-width', '275px');

        cassetteWindow.style.left = '0px';
        cassetteWindow.style.top = '0px';

        let currentTop = csH;
        if (isEqVisible) {
          eqWindow.style.left = '0px';
          eqWindow.style.top = `${currentTop}px`;
          currentTop += eqH;
        }

        let totalH = currentTop;
        if (isPlVisible) {
          plWindow.style.left = '0px';
          plWindow.style.top = `${currentTop}px`;
          const availPlH = (availH / scale) - currentTop;
          const targetPlH = Math.max(160, Math.floor(availPlH));
          plWindow.style.height = `${targetPlH}px`;
          totalH = currentTop + targetPlH;
        }

        document.documentElement.style.setProperty('--ws-height', `${totalH}px`);
      }

      if (typeof updatePlScrollbarThumb === 'function') {
        updatePlScrollbarThumb();
      }
      return;
    }

    const isEqVisible = !eqWindow.classList.contains('hidden');
    const isPlVisible = !plWindow.classList.contains('hidden');
    const isCsVisible = !cassetteWindow.classList.contains('hidden');

    if (isLandscape) {
      document.body.classList.remove('layout-portrait', 'layout-desktop');
      document.body.classList.add('layout-landscape');

      const padL = winContainer ? parseInt(getComputedStyle(winContainer).paddingLeft, 10) || 16 : 16;
      const padR = winContainer ? parseInt(getComputedStyle(winContainer).paddingRight, 10) || 16 : 16;
      const padT = winContainer ? parseInt(getComputedStyle(winContainer).paddingTop, 10) || 8 : 8;
      const padB = winContainer ? parseInt(getComputedStyle(winContainer).paddingBottom, 10) || 8 : 8;

      const mainH = mainWindow.classList.contains('shaded') ? 14 : 116;
      const eqH = isEqVisible ? (eqWindow.classList.contains('shaded') ? 14 : 116) : 0;
      const csH = isCsVisible ? (cassetteWindow.classList.contains('shaded') ? 14 : 232) : 0;

      const availW = Math.max(280, window.innerWidth - padL - padR);
      const availH = Math.max(160, window.innerHeight - padT - padB);

      const canUse3Col = isCsVisible && isPlVisible && availW >= 760;

      let baseW = 550;
      let baseH = 232;

      if (canUse3Col) {
        baseW = 825;
        baseH = 232;
      } else if (!isPlVisible && !isCsVisible && !isEqVisible) {
        baseW = 275;
        baseH = mainH;
      } else if (!isPlVisible && !isCsVisible) {
        baseW = 275;
        baseH = mainH + eqH;
      } else {
        baseW = 550;
        baseH = 232;
      }

      let scale = Math.min(availW / baseW, availH / baseH);
      scale = Math.max(0.5, Math.min(scale, 3.2));

      document.documentElement.style.setProperty('--mobile-scale', scale.toFixed(3));
      document.documentElement.style.setProperty('--ws-width', `${baseW}px`);
      document.documentElement.style.setProperty('--ws-height', `${baseH}px`);

      // Col 1: Main window
      mainWindow.style.left = '0px';
      mainWindow.style.top = '0px';

      // Col 1: EQ window below Main
      if (isEqVisible) {
        eqWindow.style.left = '0px';
        eqWindow.style.top = `${mainH}px`;
      }

      if (canUse3Col) {
        // Col 2: Cassette Player
        cassetteWindow.style.left = '275px';
        cassetteWindow.style.top = '0px';
        // Col 3: Playlist
        plWindow.style.left = '550px';
        plWindow.style.top = '0px';
        plWindow.style.height = '232px';
      } else if (isCsVisible && isPlVisible) {
        cassetteWindow.style.left = '275px';
        cassetteWindow.style.top = '0px';
        plWindow.style.left = '550px';
        plWindow.style.top = '0px';
        plWindow.style.height = '232px';
      } else if (isCsVisible) {
        cassetteWindow.style.left = '275px';
        cassetteWindow.style.top = '0px';
      } else if (isPlVisible) {
        plWindow.style.left = '275px';
        plWindow.style.top = '0px';
        plWindow.style.height = '232px';
      }

      if (typeof updatePlScrollbarThumb === 'function') {
        updatePlScrollbarThumb();
      }
    } else {
      // Portrait layout: vertical stack Main -> EQ -> Cassette -> Playlist
      document.body.classList.remove('layout-landscape', 'layout-desktop');
      document.body.classList.add('layout-portrait');

      const padL = winContainer ? parseInt(getComputedStyle(winContainer).paddingLeft, 10) || 8 : 8;
      const padR = winContainer ? parseInt(getComputedStyle(winContainer).paddingRight, 10) || 8 : 8;
      const padT = winContainer ? parseInt(getComputedStyle(winContainer).paddingTop, 10) || 20 : 20;
      const padB = winContainer ? parseInt(getComputedStyle(winContainer).paddingBottom, 10) || 20 : 20;

      const availW = Math.max(260, window.innerWidth - padL - padR);
      const availH = Math.max(200, window.innerHeight - padT - padB);

      const mainH = mainWindow.classList.contains('shaded') ? 14 : 116;
      const eqH = isEqVisible ? (eqWindow.classList.contains('shaded') ? 14 : 116) : 0;
      const csH = isCsVisible ? (cassetteWindow.classList.contains('shaded') ? 14 : 232) : 0;
      const minReqH = mainH + eqH + csH + (isPlVisible ? 160 : 0);

      // Width-based scale
      let scale = availW / 275;
      scale = Math.min(scale, 2.2);

      if (minReqH * scale > availH && availH > 200) {
        const heightScale = availH / minReqH;
        if (heightScale < scale) {
          scale = Math.max(0.65, heightScale);
        }
      }
      scale = Math.max(0.65, scale);

      document.documentElement.style.setProperty('--mobile-scale', scale.toFixed(3));
      document.documentElement.style.setProperty('--ws-width', '275px');

      // Top: Main window
      mainWindow.style.left = '0px';
      mainWindow.style.top = '0px';

      // Middle 1: EQ window
      if (isEqVisible) {
        eqWindow.style.left = '0px';
        eqWindow.style.top = `${mainH}px`;
      }

      // Middle 2: Cassette Player window
      let currentTop = mainH + eqH;
      if (isCsVisible) {
        cassetteWindow.style.left = '0px';
        cassetteWindow.style.top = `${currentTop}px`;
        currentTop += csH;
      }

      // Bottom: Playlist window dynamically filling available height
      let totalH = currentTop;
      if (isPlVisible) {
        const plTop = currentTop;
        plWindow.style.left = '0px';
        plWindow.style.top = `${plTop}px`;

        const availPlH = (availH / scale) - plTop;
        const targetPlH = Math.max(160, Math.floor(availPlH));
        plWindow.style.height = `${targetPlH}px`;
        totalH = plTop + targetPlH;
      }

      document.documentElement.style.setProperty('--ws-height', `${totalH}px`);

      if (typeof updatePlScrollbarThumb === 'function') {
        updatePlScrollbarThumb();
      }
    }
  }

  function resetWindowLayout() {
    mainWindow.classList.remove('hidden', 'shaded');
    eqWindow.classList.remove('hidden', 'shaded');
    plWindow.classList.remove('hidden', 'shaded');
    cassetteWindow.classList.remove('hidden', 'shaded');
    if (btnToggleEQ) btnToggleEQ.classList.add('active');
    if (btnTogglePL) btnTogglePL.classList.add('active');
    if (btnToggleTape) btnToggleTape.classList.add('active');
    updateResponsiveLayout();
    saveWindowPositions();
  }

  async function saveWindowPositions() {
    const layout = {
      main: { left: mainWindow.style.left, top: mainWindow.style.top, shaded: mainWindow.classList.contains('shaded') },
      eq: { left: eqWindow.style.left, top: eqWindow.style.top, visible: !eqWindow.classList.contains('hidden'), shaded: eqWindow.classList.contains('shaded') },
      pl: { left: plWindow.style.left, top: plWindow.style.top, height: plWindow.style.height || '232px', visible: !plWindow.classList.contains('hidden'), shaded: plWindow.classList.contains('shaded') },
      cs: { left: cassetteWindow.style.left, top: cassetteWindow.style.top, visible: !cassetteWindow.classList.contains('hidden'), shaded: cassetteWindow.classList.contains('shaded') },
    };
    await window.winampDB.setSetting('layout', layout);
  }

  async function restoreWindowPositions() {
    const layout = await window.winampDB.getSetting('layout', null);
    if (layout) {
      if (layout.main && layout.main.shaded) mainWindow.classList.add('shaded');
      if (layout.eq) {
        if (layout.eq.visible === false) {
          eqWindow.classList.add('hidden');
          btnToggleEQ.classList.remove('active');
        } else {
          eqWindow.classList.remove('hidden');
          btnToggleEQ.classList.add('active');
        }
        if (layout.eq.shaded) eqWindow.classList.add('shaded');
      }
      if (layout.pl) {
        if (layout.pl.visible === false) {
          plWindow.classList.add('hidden');
          btnTogglePL.classList.remove('active');
        } else {
          plWindow.classList.remove('hidden');
          btnTogglePL.classList.add('active');
        }
        if (layout.pl.shaded) plWindow.classList.add('shaded');
      }
      if (layout.cs) {
        if (layout.cs.visible === false) {
          cassetteWindow.classList.add('hidden');
          if (btnToggleTape) btnToggleTape.classList.remove('active');
        } else {
          cassetteWindow.classList.remove('hidden');
          if (btnToggleTape) btnToggleTape.classList.add('active');
        }
        if (layout.cs.shaded) cassetteWindow.classList.add('shaded');
      }
    }

    // Defensive check: ensure mutually exclusive visibility matching active skin
    const isIpcSkin = document.body.classList.contains('skin-ipod-classic');
    const isIpodSkin = document.body.classList.contains('skin-ipod');
    const isCassetteSkin = document.body.classList.contains('skin-cassette');
    if (isIpcSkin) {
      if (ipodClassicWindow) ipodClassicWindow.classList.remove('hidden');
      if (ipodWindow) ipodWindow.classList.add('hidden');
      mainWindow.classList.add('hidden');
      eqWindow.classList.add('hidden');
      plWindow.classList.add('hidden');
      cassetteWindow.classList.add('hidden');
    } else if (isIpodSkin) {
      if (ipodClassicWindow) ipodClassicWindow.classList.add('hidden');
      if (ipodWindow) ipodWindow.classList.remove('hidden');
      mainWindow.classList.add('hidden');
      eqWindow.classList.add('hidden');
      plWindow.classList.add('hidden');
      cassetteWindow.classList.add('hidden');
    } else if (isCassetteSkin) {
      if (ipodClassicWindow) ipodClassicWindow.classList.add('hidden');
      if (ipodWindow) ipodWindow.classList.add('hidden');
      cassetteWindow.classList.remove('hidden', 'shaded');
      mainWindow.classList.add('hidden');
      eqWindow.classList.add('hidden');
    } else {
      if (ipodClassicWindow) ipodClassicWindow.classList.add('hidden');
      if (ipodWindow) ipodWindow.classList.add('hidden');
      cassetteWindow.classList.add('hidden');
      mainWindow.classList.remove('hidden');
    }

    updateResponsiveLayout();
  }

  mainShadeBtn.addEventListener('click', () => {
    mainWindow.classList.toggle('shaded');
    updateResponsiveLayout();
    saveWindowPositions();
  });
  eqShadeBtn.addEventListener('click', () => {
    eqWindow.classList.toggle('shaded');
    updateResponsiveLayout();
    saveWindowPositions();
  });
  plShadeBtn.addEventListener('click', () => {
    plWindow.classList.toggle('shaded');
    updateResponsiveLayout();
    saveWindowPositions();
  });
  cassetteShadeBtn.addEventListener('click', () => {
    cassetteWindow.classList.toggle('shaded');
    updateResponsiveLayout();
    saveWindowPositions();
  });

  btnToggleEQ.addEventListener('click', () => {
    eqWindow.classList.toggle('hidden');
    btnToggleEQ.classList.toggle('active', !eqWindow.classList.contains('hidden'));
    if (!eqWindow.classList.contains('hidden')) bringToFront(eqWindow);
    updateResponsiveLayout();
    saveWindowPositions();
  });

  btnTogglePL.addEventListener('click', () => {
    plWindow.classList.toggle('hidden');
    btnTogglePL.classList.toggle('active', !plWindow.classList.contains('hidden'));
    if (!plWindow.classList.contains('hidden')) bringToFront(plWindow);
    updateResponsiveLayout();
    saveWindowPositions();
  });

  if (btnToggleTape) {
    btnToggleTape.addEventListener('click', () => {
      if (document.body.classList.contains('skin-cassette')) {
        switchSkin('skin-midnight');
      } else {
        switchSkin('skin-cassette');
      }
    });
  }

  eqCloseBtn.addEventListener('click', () => {
    eqWindow.classList.add('hidden');
    btnToggleEQ.classList.remove('active');
    updateResponsiveLayout();
    saveWindowPositions();
  });

  plCloseBtn.addEventListener('click', () => {
    plWindow.classList.add('hidden');
    btnTogglePL.classList.remove('active');
    updateResponsiveLayout();
    saveWindowPositions();
  });

  cassetteCloseBtn.addEventListener('click', () => {
    switchSkin('skin-midnight');
  });

  if (btnResetLayout) btnResetLayout.addEventListener('click', resetWindowLayout);

  // =========================================================================
  // PLAYLIST RESIZING & SCROLLBAR
  // =========================================================================
  function updatePlScrollbarThumb() {
    if (!plScrollTrack || !plScrollThumb || !plList) return;
    const scrollRange = plList.scrollHeight - plList.clientHeight;
    if (scrollRange <= 0) {
      plScrollThumb.style.display = 'none';
      return;
    }
    plScrollThumb.style.display = 'block';
    const trackH = plScrollTrack.clientHeight - plScrollThumb.offsetHeight;
    if (trackH <= 0) return;
    const ratio = Math.max(0, Math.min(1, plList.scrollTop / scrollRange));
    const topPos = Math.round(ratio * trackH);
    plScrollThumb.style.top = `${topPos}px`;
  }

  function setupPlaylistScrollbar() {
    if (!plScrollTrack || !plScrollThumb || !plList) return;

    plList.addEventListener('scroll', updatePlScrollbarThumb);

    let isDraggingThumb = false;
    let startMouseY = 0;
    let startThumbTop = 0;

    plScrollThumb.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return;
      isDraggingThumb = true;
      startMouseY = e.clientY;
      startThumbTop = parseInt(plScrollThumb.style.top, 10) || 0;
      plScrollThumb.classList.add('active');
      document.body.style.cursor = 'grab';
      document.body.style.userSelect = 'none';

      function onThumbMove(ev) {
        if (!isDraggingThumb) return;
        const trackH = plScrollTrack.clientHeight - plScrollThumb.offsetHeight;
        if (trackH <= 0) return;
        const dy = ev.clientY - startMouseY;
        const newTop = Math.max(0, Math.min(trackH, startThumbTop + dy));
        plScrollThumb.style.top = `${newTop}px`;

        const scrollRange = plList.scrollHeight - plList.clientHeight;
        if (scrollRange > 0) {
          plList.scrollTop = (newTop / trackH) * scrollRange;
        }
      }

      function onThumbUp() {
        if (isDraggingThumb) {
          isDraggingThumb = false;
          plScrollThumb.classList.remove('active');
          document.body.style.cursor = '';
          document.body.style.userSelect = '';
          document.removeEventListener('mousemove', onThumbMove);
          document.removeEventListener('mouseup', onThumbUp);
        }
      }

      document.addEventListener('mousemove', onThumbMove);
      document.addEventListener('mouseup', onThumbUp);
      e.preventDefault();
      e.stopPropagation();
    });

    plScrollTrack.addEventListener('mousedown', (e) => {
      if (e.target === plScrollThumb) return;
      const rect = plScrollTrack.getBoundingClientRect();
      const clickY = e.clientY - rect.top;
      const trackH = plScrollTrack.clientHeight - plScrollThumb.offsetHeight;
      if (trackH <= 0) return;

      const targetTop = Math.max(0, Math.min(trackH, clickY - plScrollThumb.offsetHeight / 2));
      const scrollRange = plList.scrollHeight - plList.clientHeight;
      if (scrollRange > 0) {
        plList.scrollTop = (targetTop / trackH) * scrollRange;
        updatePlScrollbarThumb();
      }
    });

    window.addEventListener('resize', () => {
      updateResponsiveLayout();
      updatePlScrollbarThumb();
    });
    window.addEventListener('orientationchange', () => {
      updateResponsiveLayout();
      setTimeout(updateResponsiveLayout, 100);
      setTimeout(updateResponsiveLayout, 300);
    });
    if (window.ResizeObserver) {
      const resizeObserver = new ResizeObserver(() => {
        updateResponsiveLayout();
      });
      resizeObserver.observe(document.documentElement);
    }
  }

  function setupPlaylistResize() {
    let isResizing = false;
    let startY = 0;
    let startHeight = 232;

    function startResize(e) {
      if (e.button !== 0 && e.type !== 'touchstart') return;
      if (plWindow.classList.contains('shaded')) return;

      isResizing = true;
      bringToFront(plWindow);
      const clientY = e.clientY ?? (e.touches && e.touches[0] ? e.touches[0].clientY : 0);
      startY = clientY;
      startHeight = plWindow.offsetHeight;
      document.body.style.cursor = 'ns-resize';
      document.body.style.userSelect = 'none';

      document.addEventListener('mousemove', onResizeMove);
      document.addEventListener('mouseup', onResizeUp);
      document.addEventListener('touchmove', onResizeMove, { passive: false });
      document.addEventListener('touchend', onResizeUp);
      e.preventDefault();
      e.stopPropagation();
    }

    function onResizeMove(e) {
      if (!isResizing) return;
      const clientY = e.clientY ?? (e.touches && e.touches[0] ? e.touches[0].clientY : 0);
      const scale = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--mobile-scale')) || 1;
      const dy = (clientY - startY) / scale;
      const minH = 116;
      const maxH = Math.max(500, (window.innerHeight - 50) / scale);
      const newH = Math.max(minH, Math.min(maxH, startHeight + dy));
      plWindow.style.height = `${newH}px`;
      if (document.body.classList.contains('layout-portrait')) {
        const plTop = parseInt(plWindow.style.top, 10) || 232;
        document.documentElement.style.setProperty('--ws-height', `${plTop + newH}px`);
      }
      updatePlScrollbarThumb();
      if (e.cancelable) e.preventDefault();
    }

    function onResizeUp() {
      if (isResizing) {
        isResizing = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        document.removeEventListener('mousemove', onResizeMove);
        document.removeEventListener('mouseup', onResizeUp);
        document.removeEventListener('touchmove', onResizeMove);
        document.removeEventListener('touchend', onResizeUp);
        saveWindowPositions();
        window.winampDB.setSetting('pl_height', plWindow.style.height);
      }
    }

    if (plResizeHandle) {
      plResizeHandle.addEventListener('mousedown', startResize);
      plResizeHandle.addEventListener('touchstart', startResize, { passive: false });
      plResizeHandle.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        const currentH = plWindow.offsetHeight;
        const targetH = currentH > 260 ? 232 : 380;
        plWindow.style.height = `${targetH}px`;
        if (document.body.classList.contains('layout-portrait')) {
          const plTop = parseInt(plWindow.style.top, 10) || 232;
          document.documentElement.style.setProperty('--ws-height', `${plTop + targetH}px`);
        }
        updatePlScrollbarThumb();
        saveWindowPositions();
      });
    }

    if (plResizeBottom) {
      plResizeBottom.addEventListener('mousedown', startResize);
      plResizeBottom.addEventListener('touchstart', startResize, { passive: false });
    }
  }

  function setupMainContextMenu() {
    if (!mainMenuBtn || !mainContextMenu) return;

    mainMenuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isHidden = mainContextMenu.classList.contains('hidden');
      document.querySelectorAll('.popup-menu').forEach(m => m.classList.add('hidden'));
      if (isHidden) {
        mainContextMenu.classList.remove('hidden');
      }
    });

    mainWindow.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      e.stopPropagation();
      document.querySelectorAll('.popup-menu').forEach(m => m.classList.add('hidden'));
      mainContextMenu.classList.remove('hidden');
    });

    const menuSkinModern = document.getElementById('menuSkinModern');
    const menuSkinMidnight = document.getElementById('menuSkinMidnight');
    const menuSkinCassette = document.getElementById('menuSkinCassette');
    const menuSkinIpod = document.getElementById('menuSkinIpod');
    const menuSkinIpodClassic = document.getElementById('menuSkinIpodClassic');
    const menuTogglePlay = document.getElementById('menuTogglePlay');
    const menuStopTrack = document.getElementById('menuStopTrack');
    const menuPrevTrack = document.getElementById('menuPrevTrack');
    const menuNextTrack = document.getElementById('menuNextTrack');
    const menuToggleEqWin = document.getElementById('menuToggleEqWin');
    const menuTogglePlWin = document.getElementById('menuTogglePlWin');
    const menuTapeClear = document.getElementById('menuTapeClear');
    const menuTapeOrange = document.getElementById('menuTapeOrange');
    const menuOpenFiles = document.getElementById('menuOpenFiles');
    const menuOpenYoutube = document.getElementById('menuOpenYoutube');
    const menuOpenDemo = document.getElementById('menuOpenDemo');
    const menuResetWin = document.getElementById('menuResetWin');
    const menuShowHelp = document.getElementById('menuShowHelp');

    if (menuSkinModern) menuSkinModern.addEventListener('click', () => { switchSkin('skin-modern'); mainContextMenu.classList.add('hidden'); });
    if (menuSkinMidnight) menuSkinMidnight.addEventListener('click', () => { switchSkin('skin-midnight'); mainContextMenu.classList.add('hidden'); });
    if (menuSkinCassette) menuSkinCassette.addEventListener('click', () => { switchSkin('skin-cassette'); mainContextMenu.classList.add('hidden'); });
    if (menuSkinIpod) menuSkinIpod.addEventListener('click', () => { switchSkin('skin-ipod'); mainContextMenu.classList.add('hidden'); });
    if (menuSkinIpodClassic) menuSkinIpodClassic.addEventListener('click', () => { switchSkin('skin-ipod-classic'); mainContextMenu.classList.add('hidden'); });
    if (menuTogglePlay) menuTogglePlay.addEventListener('click', () => { btnPlay.click(); mainContextMenu.classList.add('hidden'); });
    if (menuStopTrack) menuStopTrack.addEventListener('click', () => { btnStop.click(); mainContextMenu.classList.add('hidden'); });
    if (menuPrevTrack) menuPrevTrack.addEventListener('click', () => { btnPrev.click(); mainContextMenu.classList.add('hidden'); });
    if (menuNextTrack) menuNextTrack.addEventListener('click', () => { btnNext.click(); mainContextMenu.classList.add('hidden'); });
    if (menuToggleEqWin) menuToggleEqWin.addEventListener('click', () => { btnToggleEQ.click(); mainContextMenu.classList.add('hidden'); });
    if (menuTogglePlWin) menuTogglePlWin.addEventListener('click', () => { btnTogglePL.click(); mainContextMenu.classList.add('hidden'); });
    if (menuTapeClear) menuTapeClear.addEventListener('click', () => { switchCassetteTape('clear'); mainContextMenu.classList.add('hidden'); });
    if (menuTapeOrange) menuTapeOrange.addEventListener('click', () => { switchCassetteTape('orange'); mainContextMenu.classList.add('hidden'); });
    if (menuOpenFiles) menuOpenFiles.addEventListener('click', () => { fileInput.click(); mainContextMenu.classList.add('hidden'); });
    if (menuOpenYoutube) menuOpenYoutube.addEventListener('click', () => { openYoutubeModal(); mainContextMenu.classList.add('hidden'); });
    if (menuOpenDemo) menuOpenDemo.addEventListener('click', () => { loadDemoSongs(); mainContextMenu.classList.add('hidden'); });
    if (menuResetWin) menuResetWin.addEventListener('click', () => { resetWindowLayout(); mainContextMenu.classList.add('hidden'); });
    if (menuShowHelp) menuShowHelp.addEventListener('click', () => { helpModal.classList.remove('hidden'); mainContextMenu.classList.add('hidden'); });
  }

  // =========================================================================
  // CASSETTE DECK & PORTABLE WALKMAN CONTROLS
  // =========================================================================
  const TAPE_COLORS = ['clear', 'orange', 'red', 'green', 'blue', 'yellow', 'pink'];
  const TAPE_PRESETS = {
    clear:  { label: 'ใสคริสตัล (Clear Crystal)', shortLabel: 'ใสคริสตัล', file: 'tape-clear-clean.png',  badge: '⚪', dot: 'dot-clear' },
    orange: { label: 'ส้มใส (Neon Orange)',       shortLabel: 'ส้มใส',     file: 'tape-orange-clean.png', badge: '🟠', dot: 'dot-orange' },
    red:    { label: 'แดงใส (Ruby Red)',          shortLabel: 'แดงใส',     file: 'tape-red-clean.png',    badge: '🔴', dot: 'dot-red' },
    green:  { label: 'เขียวใส (Emerald Green)',   shortLabel: 'เขียวใส',   file: 'tape-green-clean.png',  badge: '🟢', dot: 'dot-green' },
    blue:   { label: 'ฟ้าใส (Sky Blue)',          shortLabel: 'ฟ้าใส',     file: 'tape-blue-clean.png',   badge: '🔵', dot: 'dot-blue' },
    yellow: { label: 'เหลืองใส (Amber Yellow)',   shortLabel: 'เหลืองใส',  file: 'tape-yellow-clean.png', badge: '🟡', dot: 'dot-yellow' },
    pink:   { label: 'ชมพูใส (Neon Pink)',        shortLabel: 'ชมพูใส',    file: 'tape-pink-clean.png',   badge: '🌸', dot: 'dot-pink' }
  };

  function cycleNextCassetteTape(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const curIdx = Math.max(0, TAPE_COLORS.indexOf(cassetteState.tape));
    const nextIdx = (curIdx + 1) % TAPE_COLORS.length;
    const nextColor = TAPE_COLORS[nextIdx];

    const cassetteDoorLid = document.getElementById('cassetteDoorLid');
    const wmDoorLid = document.getElementById('wmDoorLid');
    if (cassetteDoorLid) cassetteDoorLid.classList.add('door-open');
    if (wmDoorLid) wmDoorLid.classList.add('door-open');

    setTimeout(() => {
      switchCassetteTape(nextColor, true);
      setTimeout(() => {
        if (cassetteDoorLid) cassetteDoorLid.classList.remove('door-open');
        if (wmDoorLid) wmDoorLid.classList.remove('door-open');
      }, 180);
    }, 120);
  }

  function triggerDoorEjectAnimation() {
    const cassetteDoorLid = document.getElementById('cassetteDoorLid');
    const wmDoorLid = document.getElementById('wmDoorLid');
    if (cassetteDoorLid) cassetteDoorLid.classList.add('door-open');
    if (wmDoorLid) wmDoorLid.classList.add('door-open');
    engine.playMechanicalSound('eject');
    setTimeout(() => {
      if (cassetteDoorLid) cassetteDoorLid.classList.remove('door-open');
      if (wmDoorLid) wmDoorLid.classList.remove('door-open');
      engine.playMechanicalSound('click');
    }, 650);
  }

  // Tape Reel Spin Gimmick (Rewind spins backwards, Fast-Forward spins forward 2x fast)
  let spinGimmickTimer = null;
  function triggerTapeSpinGimmick(mode, durationMs = 1500) {
    const hubs = [hubLeft, hubRight, wmHubLeft, wmHubRight];
    if (spinGimmickTimer) clearTimeout(spinGimmickTimer);

    hubs.forEach(h => {
      if (!h) return;
      h.classList.remove('fast-forward', 'rewind');
      h.classList.add(mode);
    });

    if (durationMs > 0) {
      spinGimmickTimer = setTimeout(() => {
        hubs.forEach(h => {
          if (!h) return;
          h.classList.remove('fast-forward', 'rewind');
          if (!engine.isPaused() && (engine.getDuration() || 0) > 0) {
            h.classList.add('spinning');
          } else {
            h.classList.remove('spinning');
          }
        });
      }, durationMs);
    }
  }

  // Custom Cassette Tape Face Artwork (Frontmost layer with punched-out reel holes)
  const customTapeSkinInput = document.getElementById('customTapeSkinInput');
  const cassetteCustomSkin = document.getElementById('cassetteCustomSkin');
  const wmCustomSkin = document.getElementById('wmCustomSkin');
  const cmenuCustomTapeSkin = document.getElementById('cmenuCustomTapeSkin');
  const cmenuResetTapeSkin = document.getElementById('cmenuResetTapeSkin');

  function processCustomCassetteSkin(sourceImgOrDataUrl, callback) {
    if (!sourceImgOrDataUrl) {
      callback('');
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const W = 936;
        const H = 564;
        const canvas = document.createElement('canvas');
        canvas.width = W;
        canvas.height = H;
        const ctx = canvas.getContext('2d');

        // 1. Clip to rounded cassette card boundary
        ctx.save();
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(14, 14, W - 28, H - 28, 22);
        } else {
          ctx.rect(14, 14, W - 28, H - 28);
        }
        ctx.clip();

        // 2. Draw user's image (object-fit: cover, centered)
        const scale = Math.max(W / img.width, H / img.height);
        const dw = img.width * scale;
        const dh = img.height * scale;
        const dx = (W - dw) / 2;
        const dy = (H - dh) / 2;
        ctx.drawImage(img, dx, dy, dw, dh);
        ctx.restore();

        // 3. Punch out holes using 'destination-out' (makes them 100% transparent!)
        ctx.save();
        ctx.globalCompositeOperation = 'destination-out';

        // Left Spool Hole (center 287.0, 259.4, radius 76px)
        ctx.beginPath();
        ctx.arc(287.0, 259.4, 76, 0, Math.PI * 2);
        ctx.fill();

        // Right Spool Hole (center 689.0, 259.4, radius 76px)
        ctx.beginPath();
        ctx.arc(689.0, 259.4, 76, 0, Math.PI * 2);
        ctx.fill();

        // Center viewing window with scale marks (x=396, y=214, w=144, h=90)
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(396, 214, 144, 90, 8);
        } else {
          ctx.rect(396, 214, 144, 90);
        }
        ctx.fill();

        // Bottom tape head cavity trapezoid
        ctx.beginPath();
        ctx.moveTo(215, 564);
        ctx.lineTo(248, 436);
        ctx.lineTo(688, 436);
        ctx.lineTo(721, 564);
        ctx.closePath();
        ctx.fill();

        ctx.restore();

        const processedDataUrl = canvas.toDataURL('image/png');
        callback(processedDataUrl);
      } catch (err) {
        console.warn('Canvas export failed, using raw data url', err);
        callback(sourceImgOrDataUrl);
      }
    };
    img.onerror = () => {
      console.warn('Failed to load image, using fallback');
      callback(sourceImgOrDataUrl);
    };
    img.src = sourceImgOrDataUrl;
  }

  function applyCustomTapeSkin(dataUrl, playSound = true) {
    if (dataUrl) {
      processCustomCassetteSkin(dataUrl, (processedUrl) => {
        if (cassetteCustomSkin) {
          cassetteCustomSkin.style.backgroundImage = `url("${processedUrl}")`;
          cassetteCustomSkin.classList.add('active');
        }
        if (wmCustomSkin) {
          wmCustomSkin.style.backgroundImage = `url("${processedUrl}")`;
          wmCustomSkin.classList.add('active');
        }
        if (cmenuResetTapeSkin) cmenuResetTapeSkin.classList.remove('hidden');
        window.winampDB.setSetting('cassette_custom_skin', dataUrl);
        if (playSound) {
          engine.playMechanicalSound('click');
          showToast('📷 ใส่รูปบนม้วนเทปเรียบร้อยแล้ว!');
        }
      });
    } else {
      if (cassetteCustomSkin) {
        cassetteCustomSkin.style.backgroundImage = 'none';
        cassetteCustomSkin.classList.remove('active');
      }
      if (wmCustomSkin) {
        wmCustomSkin.style.backgroundImage = 'none';
        wmCustomSkin.classList.remove('active');
      }
      if (cmenuResetTapeSkin) cmenuResetTapeSkin.classList.add('hidden');
      window.winampDB.setSetting('cassette_custom_skin', '');
      if (playSound) {
        engine.playMechanicalSound('click');
        showToast('🔄 คืนค่าม้วนเทปเป็นแบบดั้งเดิม');
      }
    }
  }

  function switchCassetteTape(tapeName, playSound = true) {
    const valid = TAPE_PRESETS[tapeName] ? tapeName : 'clear';
    cassetteState.tape = valid;
    const preset = TAPE_PRESETS[valid];

    const allColors = Object.keys(TAPE_PRESETS);
    if (cassetteCard) {
      allColors.forEach(c => cassetteCard.classList.remove('tape-' + c));
      cassetteCard.classList.add('tape-' + valid);
    }
    if (wmCassetteCard) {
      allColors.forEach(c => wmCassetteCard.classList.remove('tape-' + c));
      wmCassetteCard.classList.add('tape-' + valid);
    }

    const imgSrc = `assets/cassette/${preset.file}?v=3.1`;
    if (cassetteImg) cassetteImg.src = imgSrc;
    if (wmCassetteImg) wmCassetteImg.src = imgSrc;

    // Update Dropdown Chips
    const deckTapeChipDot = document.getElementById('deckTapeChipDot');
    const deckTapeChipText = document.getElementById('deckTapeChipText');
    if (deckTapeChipDot) {
      deckTapeChipDot.className = `tape-chip-dot ${preset.dot}`;
    }
    if (deckTapeChipText) {
      deckTapeChipText.textContent = preset.shortLabel;
    }

    const wmTapeChipDot = document.getElementById('wmTapeChipDot');
    const wmTapeChipText = document.getElementById('wmTapeChipText');
    if (wmTapeChipDot) {
      wmTapeChipDot.className = `tape-chip-dot ${preset.dot}`;
    }
    if (wmTapeChipText) {
      wmTapeChipText.textContent = preset.label;
    }

    // Update active state in dropdown options
    document.querySelectorAll('.tape-opt').forEach(opt => {
      opt.classList.toggle('active', opt.getAttribute('data-color') === valid);
    });
    document.querySelectorAll('.wm-tape-opt').forEach(opt => {
      opt.classList.toggle('active', opt.getAttribute('data-color') === valid);
    });

    // Also update legacy buttons if any
    document.querySelectorAll('.tape-sel-btn, .wm-tape-btn').forEach(btn => {
      const col = btn.getAttribute('data-color');
      if (col) btn.classList.toggle('active', col === valid);
    });

    window.winampDB.setSetting('cassette_tape', valid);
    if (playSound) {
      engine.playMechanicalSound('click');
      showToast(`📼 เปลี่ยนม้วนเทป: ${preset.badge} ${preset.label}`);
    }
  }

  function toggleTapeSide() {
    cassetteState.side = (cassetteState.side === 'A') ? 'B' : 'A';
    if (tapeSideStamp) tapeSideStamp.textContent = cassetteState.side;
    if (wmSideBadge) wmSideBadge.textContent = `SIDE ${cassetteState.side}`;
    triggerDoorEjectAnimation();
    updateCassetteUI();
    showToast(`📼 เปิดฝาเครื่อง พลิกหน้าเทป: Side ${cassetteState.side}`);
  }

  function toggleCassetteSoundFx() {
    engine.soundFxEnabled = !engine.soundFxEnabled;
    window.winampDB.setSetting('cassette_soundfx', engine.soundFxEnabled);
    const cmenuSoundFx = document.getElementById('cmenuSoundFx');
    if (cmenuSoundFx) cmenuSoundFx.textContent = `🔊 เสียงกลไกเทป (Sound FX: ${engine.soundFxEnabled ? 'เปิด' : 'ปิด'})`;
    if (wmSoundFxBtn) wmSoundFxBtn.textContent = `🔊 SFX: ${engine.soundFxEnabled ? 'ON' : 'OFF'}`;
    showToast(`🔊 เสียงกลไกเทป: ${engine.soundFxEnabled ? 'เปิด (ON)' : 'ปิด (OFF)'}`);
  }

  function openWalkmanModal() {
    if (!walkmanModal) return;
    walkmanModal.classList.remove('hidden');
    updateCassetteUI();
    engine.playMechanicalSound('click');
  }

  function closeWalkmanModal() {
    if (!walkmanModal) return;
    walkmanModal.classList.add('hidden');
    engine.playMechanicalSound('click');
  }

  function updateCassetteLabel(track) {
    const titleText = track ? track.title : 'NO TAPE LOADED';
    const artistText = track ? (track.artist || 'UNKNOWN ARTIST') : 'INSERT CASSETTE';

    if (tapeTitle) tapeTitle.textContent = titleText;
    if (tapeArtist) tapeArtist.textContent = artistText;
    if (wmTrackTitle) wmTrackTitle.textContent = titleText;
    if (wmTrackArtist) wmTrackArtist.textContent = artistText;
  }

  function updateCassetteUI() {
    const isPlaying = state.isPlaying;
    const isPaused = state.isPaused;

    // Reel spinning animation
    if (hubLeft) hubLeft.classList.toggle('spinning', isPlaying);
    if (hubRight) hubRight.classList.toggle('spinning', isPlaying);
    if (wmHubLeft) wmHubLeft.classList.toggle('spinning', isPlaying);
    if (wmHubRight) wmHubRight.classList.toggle('spinning', isPlaying);

    // RUN LED indicator
    if (deckLed) deckLed.classList.toggle('active', isPlaying);
    if (wmLed) wmLed.classList.toggle('active', isPlaying);

    // Dynamic Tape Ribbon Pack Physics (Concentric Magnetic Tape Winding)
    // At 0%: supply spool is full (scale 1.0), take-up spool is empty (scale 0.443, hidden under white hub)
    // As track plays: magnetic tape smoothly transfers across reels following square-root area physics
    const cur = engine.getCurrentTime() || 0;
    const dur = engine.getDuration() || 0;
    let ratio = (dur > 0 && isFinite(dur)) ? Math.max(0, Math.min(1, cur / dur)) : 0;
    let p = (cassetteState.side === 'B') ? (1 - ratio) : ratio;

    const rEmptySq = 0.196; // 0.443^2
    const areaDelta = 0.804; // 1.0 - 0.196
    const leftScaleStr = Math.sqrt(rEmptySq + areaDelta * (1 - p)).toFixed(3);
    const rightScaleStr = Math.sqrt(rEmptySq + areaDelta * p).toFixed(3);

    if (cassetteState.lastLeftScale !== leftScaleStr) {
      cassetteState.lastLeftScale = leftScaleStr;
      const leftTransform = `translate(-50%, -50%) scale(${leftScaleStr})`;
      if (tapePackLeft) tapePackLeft.style.transform = leftTransform;
      if (wmSpoolLeft) wmSpoolLeft.style.transform = leftTransform;
    }
    if (cassetteState.lastRightScale !== rightScaleStr) {
      cassetteState.lastRightScale = rightScaleStr;
      const rightTransform = `translate(-50%, -50%) scale(${rightScaleStr})`;
      if (tapePackRight) tapePackRight.style.transform = rightTransform;
      if (wmSpoolRight) wmSpoolRight.style.transform = rightTransform;
    }

    // Tape mechanical counter digits (000-999)
    const rawVal = Math.floor(cur * 0.6) + cassetteState.counterOffset;
    const countVal = ((rawVal % 1000) + 1000) % 1000;
    const countStr = String(countVal).padStart(3, '0');
    if (cassetteState.lastCountStr !== countStr) {
      cassetteState.lastCountStr = countStr;
      if (deckCounter) deckCounter.textContent = countStr;
      if (wmCounter) wmCounter.textContent = countStr;
    }

    // Physical button states
    if (mechPlay) mechPlay.classList.toggle('active', isPlaying);
    if (mechPause) mechPause.classList.toggle('active', isPaused);
    if (mechStop) mechStop.classList.toggle('active', !isPlaying && !isPaused);

    if (wmKeyPlay) wmKeyPlay.classList.toggle('active', isPlaying);
    if (wmKeyPause) wmKeyPause.classList.toggle('active', isPaused);
    if (wmKeyStop) wmKeyStop.classList.toggle('active', !isPlaying && !isPaused);
  }

  function setupCassetteControls() {
    // Deck context menu toggle
    if (cassetteMenuBtn && cassetteContextMenu) {
      cassetteMenuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isHidden = cassetteContextMenu.classList.contains('hidden');
        document.querySelectorAll('.popup-menu').forEach(m => m.classList.add('hidden'));
        if (isHidden) cassetteContextMenu.classList.remove('hidden');
      });
    }

    if (cassetteWindow && cassetteContextMenu) {
      cassetteWindow.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        e.stopPropagation();
        document.querySelectorAll('.popup-menu').forEach(m => m.classList.add('hidden'));
        cassetteContextMenu.classList.remove('hidden');
      });
    }

    // Titlebar button for portable walkman mode
    if (btnTitlebarWalkman) {
      btnTitlebarWalkman.addEventListener('click', () => switchSkin('skin-cassette'));
    }

    const btnCassetteToWinamp = document.getElementById('btnCassetteToWinamp');
    if (btnCassetteToWinamp) {
      btnCassetteToWinamp.addEventListener('click', () => {
        const targetSkin = state.lastWinampSkin || 'skin-midnight';
        switchSkin(targetSkin);
      });
    }
    if (cassetteCloseBtn) {
      cassetteCloseBtn.addEventListener('click', () => {
        const targetSkin = state.lastWinampSkin || 'skin-midnight';
        switchSkin(targetSkin);
      });
    }

    // Cassette context menu items
    const cmenuSkinModern = document.getElementById('cmenuSkinModern');
    const cmenuSkinMidnight = document.getElementById('cmenuSkinMidnight');
    const cmenuSkinCassette = document.getElementById('cmenuSkinCassette');
    const cmenuSkinIpod = document.getElementById('cmenuSkinIpod');
    const cmenuSkinIpodClassic = document.getElementById('cmenuSkinIpodClassic');
    const btnDeckIpod = document.getElementById('btnDeckIpod');
    const wmIpodBtn = document.getElementById('wmIpodBtn');

    if (cmenuSkinModern) cmenuSkinModern.addEventListener('click', () => { switchSkin('skin-modern'); if (cassetteContextMenu) cassetteContextMenu.classList.add('hidden'); });
    if (cmenuSkinMidnight) cmenuSkinMidnight.addEventListener('click', () => { switchSkin('skin-midnight'); if (cassetteContextMenu) cassetteContextMenu.classList.add('hidden'); });
    if (cmenuSkinCassette) cmenuSkinCassette.addEventListener('click', () => { switchSkin('skin-cassette'); if (cassetteContextMenu) cassetteContextMenu.classList.add('hidden'); });
    if (cmenuSkinIpod) cmenuSkinIpod.addEventListener('click', () => { switchSkin('skin-ipod'); if (cassetteContextMenu) cassetteContextMenu.classList.add('hidden'); });
    if (cmenuSkinIpodClassic) cmenuSkinIpodClassic.addEventListener('click', () => { switchSkin('skin-ipod-classic'); if (cassetteContextMenu) cassetteContextMenu.classList.add('hidden'); });
    if (btnDeckIpod) btnDeckIpod.addEventListener('click', (e) => { e.stopPropagation(); switchSkin('skin-ipod'); });
    if (wmIpodBtn) wmIpodBtn.addEventListener('click', (e) => { e.stopPropagation(); closeWalkmanModal(); switchSkin('skin-ipod'); });

    const cmenuTapeClear = document.getElementById('cmenuTapeClear');
    const cmenuTapeOrange = document.getElementById('cmenuTapeOrange');
    const cmenuTapeFlip = document.getElementById('cmenuTapeFlip');
    const cmenuSoundFx = document.getElementById('cmenuSoundFx');
    const cmenuTogglePL = document.getElementById('cmenuTogglePL');
    const cmenuOpenWalkman = document.getElementById('cmenuOpenWalkman');
    const cmenuClose = document.getElementById('cmenuClose');

    if (cmenuTapeClear) cmenuTapeClear.addEventListener('click', () => { switchCassetteTape('clear'); if (cassetteContextMenu) cassetteContextMenu.classList.add('hidden'); });
    if (cmenuTapeOrange) cmenuTapeOrange.addEventListener('click', () => { switchCassetteTape('orange'); if (cassetteContextMenu) cassetteContextMenu.classList.add('hidden'); });
    const btnDeckYoutube = document.getElementById('btnDeckYoutube');
    if (btnDeckYoutube) {
      btnDeckYoutube.addEventListener('click', (e) => {
        e.stopPropagation();
        openYoutubeModal();
      });
    }
    const wmYoutubeBtn = document.getElementById('wmYoutubeBtn');
    if (wmYoutubeBtn) {
      wmYoutubeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openYoutubeModal();
      });
    }
    const cmenuYoutube = document.getElementById('cmenuYoutube');
    if (cmenuYoutube) {
      cmenuYoutube.addEventListener('click', () => {
        if (cassetteContextMenu) cassetteContextMenu.classList.add('hidden');
        openYoutubeModal();
      });
    }
    const btnUploadTapePhoto = document.getElementById('btnUploadTapePhoto');
    if (btnUploadTapePhoto && customTapeSkinInput) {
      btnUploadTapePhoto.addEventListener('click', (e) => {
        e.stopPropagation();
        customTapeSkinInput.value = '';
        customTapeSkinInput.click();
      });
    }
    if (cmenuCustomTapeSkin && customTapeSkinInput) {
      cmenuCustomTapeSkin.addEventListener('click', () => {
        customTapeSkinInput.value = '';
        customTapeSkinInput.click();
        if (cassetteContextMenu) cassetteContextMenu.classList.add('hidden');
      });
    }
    if (cmenuResetTapeSkin) {
      cmenuResetTapeSkin.addEventListener('click', () => {
        applyCustomTapeSkin('');
        if (cassetteContextMenu) cassetteContextMenu.classList.add('hidden');
      });
    }
    if (customTapeSkinInput) {
      customTapeSkinInput.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
          applyCustomTapeSkin(evt.target.result, true);
        };
        reader.readAsDataURL(file);
      });
    }
    // Drag & Drop image directly onto cassette
    const cassetteHousingEl = document.getElementById('cassetteHousing');
    [cassetteHousingEl, walkmanModal].forEach(zone => {
      if (!zone) return;
      zone.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
      });
      zone.addEventListener('drop', (e) => {
        const files = e.dataTransfer && e.dataTransfer.files;
        if (files && files.length > 0 && files[0].type.startsWith('image/')) {
          e.preventDefault();
          e.stopPropagation();
          const reader = new FileReader();
          reader.onload = (evt) => {
            applyCustomTapeSkin(evt.target.result);
          };
          reader.readAsDataURL(files[0]);
        }
      });
    });
    if (cmenuTapeFlip) cmenuTapeFlip.addEventListener('click', () => { toggleTapeSide(); if (cassetteContextMenu) cassetteContextMenu.classList.add('hidden'); });
    if (cmenuSoundFx) cmenuSoundFx.addEventListener('click', () => { toggleCassetteSoundFx(); if (cassetteContextMenu) cassetteContextMenu.classList.add('hidden'); });
    const cmenuToggleEQ = document.getElementById('cmenuToggleEQ');
    const btnCassetteToggleEQ = document.getElementById('btnCassetteToggleEQ');
    function toggleCassetteEQ() {
      eqWindow.classList.toggle('hidden');
      const isVisible = !eqWindow.classList.contains('hidden');
      if (btnToggleEQ) btnToggleEQ.classList.toggle('active', isVisible);
      if (btnCassetteToggleEQ) btnCassetteToggleEQ.classList.toggle('active', isVisible);
      if (isVisible) {
        bringToFront(eqWindow);
        drawEQCurve();
      }
      updateResponsiveLayout();
      saveWindowPositions();
    }
    if (cmenuToggleEQ) {
      cmenuToggleEQ.addEventListener('click', () => {
        toggleCassetteEQ();
        if (cassetteContextMenu) cassetteContextMenu.classList.add('hidden');
      });
    }
    if (btnCassetteToggleEQ) {
      btnCassetteToggleEQ.addEventListener('click', toggleCassetteEQ);
    }

    if (cmenuTogglePL) {
      cmenuTogglePL.addEventListener('click', () => {
        plWindow.classList.toggle('hidden');
        const btnCassetteTogglePL = document.getElementById('btnCassetteTogglePL');
        if (btnCassetteTogglePL) btnCassetteTogglePL.classList.toggle('active', !plWindow.classList.contains('hidden'));
        updateResponsiveLayout();
        if (cassetteContextMenu) cassetteContextMenu.classList.add('hidden');
      });
    }
    if (cmenuOpenWalkman) cmenuOpenWalkman.addEventListener('click', () => { openWalkmanModal(); if (cassetteContextMenu) cassetteContextMenu.classList.add('hidden'); });
    if (cmenuClose) cmenuClose.addEventListener('click', () => { switchSkin('skin-midnight'); if (cassetteContextMenu) cassetteContextMenu.classList.add('hidden'); });

    const btnCassetteTogglePL = document.getElementById('btnCassetteTogglePL');
    if (btnCassetteTogglePL) {
      btnCassetteTogglePL.addEventListener('click', () => {
        plWindow.classList.toggle('hidden');
        btnCassetteTogglePL.classList.toggle('active', !plWindow.classList.contains('hidden'));
        updateResponsiveLayout();
      });
    }

    // Counter resets
    if (deckCounterReset) {
      deckCounterReset.addEventListener('click', () => {
        cassetteState.counterOffset = -Math.floor((engine.getCurrentTime() || 0) * 0.6);
        updateCassetteUI();
        engine.playMechanicalSound('click');
        showToast('⟲ รีเซ็ตเทปเคาน์เตอร์: 000');
      });
    }
    if (wmCounterReset) {
      wmCounterReset.addEventListener('click', () => {
        cassetteState.counterOffset = -Math.floor((engine.getCurrentTime() || 0) * 0.6);
        updateCassetteUI();
        engine.playMechanicalSound('click');
        showToast('⟲ รีเซ็ตเทปเคาน์เตอร์: 000');
      });
    }

    // Vintage Cassette Tape Dropdown logic (Deck bar)
    const tapeDropdownToggle = document.getElementById('tapeDropdownToggle');
    const tapeDropdownList = document.getElementById('tapeDropdownList');
    if (tapeDropdownToggle && tapeDropdownList) {
      tapeDropdownToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        tapeDropdownList.classList.toggle('hidden');
        const wmTapeDropList = document.getElementById('wmTapeDropdownList');
        if (wmTapeDropList) wmTapeDropList.classList.add('hidden');
      });
    }

    document.querySelectorAll('.tape-opt').forEach(opt => {
      opt.addEventListener('click', (e) => {
        e.stopPropagation();
        const color = opt.getAttribute('data-color');
        if (color) switchCassetteTape(color);
        if (tapeDropdownList) tapeDropdownList.classList.add('hidden');
      });
    });

    // Walkman Modal Tape Dropdown logic
    const wmTapeDropdownToggle = document.getElementById('wmTapeDropdownToggle');
    const wmTapeDropdownList = document.getElementById('wmTapeDropdownList');
    if (wmTapeDropdownToggle && wmTapeDropdownList) {
      wmTapeDropdownToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        wmTapeDropdownList.classList.toggle('hidden');
        if (tapeDropdownList) tapeDropdownList.classList.add('hidden');
      });
    }

    document.querySelectorAll('.wm-tape-opt').forEach(opt => {
      opt.addEventListener('click', (e) => {
        e.stopPropagation();
        const color = opt.getAttribute('data-color');
        if (color) switchCassetteTape(color);
        if (wmTapeDropdownList) wmTapeDropdownList.classList.add('hidden');
      });
    });

    // Close dropdowns on click outside
    document.addEventListener('click', () => {
      if (tapeDropdownList) tapeDropdownList.classList.add('hidden');
      if (wmTapeDropdownList) wmTapeDropdownList.classList.add('hidden');
    });



    // Tape switch buttons on deck window and Walkman modal (7 Colors - Legacy/Fallbacks)
    document.querySelectorAll('.tape-sel-btn, .wm-tape-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const color = btn.getAttribute('data-color');
        if (color) switchCassetteTape(color);
      });
    });
    if (btnOpenWalkmanModal) btnOpenWalkmanModal.addEventListener('click', openWalkmanModal);

    // Tap or click directly on cassette tape to cycle through the 7 tape colors
    const cassetteDoorLid = document.getElementById('cassetteDoorLid');
    const wmDoorLid = document.getElementById('wmDoorLid');
    const cassetteHousing = document.getElementById('cassetteHousing');
    if (cassetteCard) cassetteCard.addEventListener('click', cycleNextCassetteTape);
    if (wmCassetteCard) wmCassetteCard.addEventListener('click', cycleNextCassetteTape);
    if (cassetteHousing) cassetteHousing.addEventListener('click', cycleNextCassetteTape);
    if (cassetteDoorLid) cassetteDoorLid.addEventListener('click', cycleNextCassetteTape);
    if (wmDoorLid) wmDoorLid.addEventListener('click', cycleNextCassetteTape);

    // Deck mechanical buttons & Walkman piano keys with rewind & fast-forward spin gimmicks
    if (mechPlay) mechPlay.addEventListener('click', () => { engine.playMechanicalSound('play'); btnPlay.click(); });
    if (mechPause) mechPause.addEventListener('click', () => { engine.playMechanicalSound('pause'); btnPause.click(); });
    if (mechStop) mechStop.addEventListener('click', () => { engine.playMechanicalSound('stop'); btnStop.click(); });

    function setupHoldSeeking(btn, isRewind) {
      if (!btn) return;
      let holdTimer = null;
      let seekInterval = null;

      const startHold = (e) => {
        if (e) e.preventDefault();
        engine.playMechanicalSound('click');
        triggerTapeSpinGimmick(isRewind ? 'rewind' : 'fast-forward', 0);

        const dur = engine.getDuration();
        if (dur) {
          const delta = isRewind ? -5 : 5;
          engine.seek(Math.max(0, Math.min(dur, engine.getCurrentTime() + delta)));
        }

        holdTimer = setTimeout(() => {
          seekInterval = setInterval(() => {
            const d = engine.getDuration();
            if (d) {
              const delta = isRewind ? -5 : 5;
              engine.seek(Math.max(0, Math.min(d, engine.getCurrentTime() + delta)));
            }
          }, 160);
        }, 280);
      };

      const endHold = () => {
        if (holdTimer) clearTimeout(holdTimer);
        if (seekInterval) clearInterval(seekInterval);
        holdTimer = null;
        seekInterval = null;
        triggerTapeSpinGimmick(isRewind ? 'rewind' : 'fast-forward', 1200);
      };

      btn.addEventListener('mousedown', startHold);
      btn.addEventListener('mouseup', endHold);
      btn.addEventListener('mouseleave', endHold);
      btn.addEventListener('touchstart', startHold, { passive: false });
      btn.addEventListener('touchend', endHold);
      btn.addEventListener('touchcancel', endHold);
    }

    setupHoldSeeking(mechRew, true);
    setupHoldSeeking(mechFF, false);
    setupHoldSeeking(wmKeyRew, true);
    setupHoldSeeking(wmKeyFF, false);

    if (mechEject) {
      mechEject.addEventListener('click', () => toggleTapeSide());
    }

    // Walkman modal controls
    if (wmCloseBtn) wmCloseBtn.addEventListener('click', closeWalkmanModal);
    if (walkmanModal) {
      walkmanModal.addEventListener('click', (e) => {
        if (e.target === walkmanModal) closeWalkmanModal();
      });
    }
    if (wmSideBtn) wmSideBtn.addEventListener('click', toggleTapeSide);
    if (wmSoundFxBtn) wmSoundFxBtn.addEventListener('click', toggleCassetteSoundFx);

    // Walkman piano push keys
    if (wmKeyPlay) wmKeyPlay.addEventListener('click', () => { engine.playMechanicalSound('play'); btnPlay.click(); });
    if (wmKeyPause) wmKeyPause.addEventListener('click', () => { engine.playMechanicalSound('pause'); btnPause.click(); });
    if (wmKeyStop) wmKeyStop.addEventListener('click', () => { engine.playMechanicalSound('stop'); btnStop.click(); });
    if (wmKeyEject) {
      wmKeyEject.addEventListener('click', () => toggleTapeSide());
    }

    // Walkman volume thumbwheel slider
    if (wmVolSlider) {
      wmVolSlider.addEventListener('input', (e) => {
        updateVolumeUI(parseFloat(e.target.value));
      });
    }
  }

  setupPlaylistScrollbar();
  setupPlaylistResize();
  setupMainContextMenu();

  // =========================================================================
  // VOLUME & BALANCE SLIDERS
  // =========================================================================
  function updateVolumeUI(val) {
    state.volume = val;
    engine.setVolume(val);
    const isModern = document.body.classList.contains('skin-modern');
    if (isModern) {
      volThumb.style.left = `${Math.round(val * 114) + 8}px`;
    } else {
      const frame = Math.round(val * 27);
      volTrackBg.style.backgroundPositionY = `-${frame * 15}px`;
      volThumb.style.left = `${Math.round(val * 54) + 7}px`;
    }
    if (wmVolSlider) wmVolSlider.value = val;
    const ipodVolFill = document.getElementById('ipodVolFill');
    const ipodVolThumb = document.getElementById('ipodVolThumb');
    if (ipodVolFill) ipodVolFill.style.width = `${Math.round(val * 100)}%`;
    if (ipodVolThumb) ipodVolThumb.style.left = `${Math.round(val * 100)}%`;
    const ipcVolFill = document.getElementById('ipcVolFill');
    if (ipcVolFill) ipcVolFill.style.width = `${Math.round(val * 100)}%`;
    window.winampDB.setSetting('volume', val);
  }

  function handleVolumeDrag(e) {
    const rect = volTrack.getBoundingClientRect();
    let pos = (e.clientX - rect.left) / rect.width;
    pos = Math.max(0, Math.min(1, pos));
    updateVolumeUI(pos);
  }

  volTrack.addEventListener('mousedown', (e) => {
    state.isDraggingVolume = true;
    handleVolumeDrag(e);
    const onMove = (evt) => {
      if (state.isDraggingVolume) handleVolumeDrag(evt);
    };
    const onUp = () => {
      state.isDraggingVolume = false;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  });

  function updateBalanceUI(val, userInitiated = false) {
    state.balance = val;
    engine.setBalance(val, userInitiated);
    const norm = (val + 1) / 2;
    const frame = Math.round(norm * 27);
    balTrackBg.style.backgroundPositionY = `-${frame * 15}px`;
    balThumb.style.left = `${Math.round(norm * 24) + 7}px`;
    window.winampDB.setSetting('balance', val);
  }

  function handleBalanceDrag(e) {
    const rect = balTrack.getBoundingClientRect();
    let pos = (e.clientX - rect.left) / rect.width;
    pos = Math.max(0, Math.min(1, pos));
    if (Math.abs(pos - 0.5) < 0.08) pos = 0.5;
    const panVal = pos * 2 - 1;
    updateBalanceUI(panVal, true);
  }

  balTrack.addEventListener('mousedown', (e) => {
    state.isDraggingBalance = true;
    handleBalanceDrag(e);
    const onMove = (evt) => {
      if (state.isDraggingBalance) handleBalanceDrag(evt);
    };
    const onUp = () => {
      state.isDraggingBalance = false;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  });

  // =========================================================================
  // SEEK BAR / SCRUBBER
  // =========================================================================
  function handleSeekDrag(e) {
    const dur = engine.getDuration();
    if (!dur) return;
    const rect = seekTrack.getBoundingClientRect();
    let ratio = (e.clientX - rect.left) / rect.width;
    ratio = Math.max(0, Math.min(1, ratio));
    const targetTime = ratio * dur;
    seekThumb.style.left = `${ratio * 100}%`;
    updateTimerDisplay(targetTime, dur);
    return targetTime;
  }

  seekTrack.addEventListener('mousedown', (e) => {
    if (!engine.getDuration()) return;
    state.isDraggingSeek = true;
    const targetTime = handleSeekDrag(e);

    const onMove = (evt) => {
      if (state.isDraggingSeek) handleSeekDrag(evt);
    };

    const onUp = (evt) => {
      if (state.isDraggingSeek) {
        state.isDraggingSeek = false;
        const finalTime = handleSeekDrag(evt);
        if (finalTime !== undefined) engine.seek(finalTime);
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
      }
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  });

  // =========================================================================
  // TIME DISPLAY
  // =========================================================================
  timeDisplay.addEventListener('click', () => {
    state.timeRemainingMode = !state.timeRemainingMode;
    timeMinus.classList.toggle('active', state.timeRemainingMode);
    updateTimerDisplay(engine.getCurrentTime(), engine.getDuration());
    window.winampDB.setSetting('timeRemainingMode', state.timeRemainingMode);
  });

  function updateTimerDisplay(currentTime, duration) {
    let secs = currentTime || 0;
    if (state.timeRemainingMode && duration && isFinite(duration)) {
      secs = Math.max(0, duration - currentTime);
    }

    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);

    const m10 = Math.floor(m / 10);
    const m1 = m % 10;
    const s10 = Math.floor(s / 10);
    const s1 = s % 10;

    const isModern = document.body.classList.contains('skin-modern');
    if (isModern) {
      timeMinTen.textContent = m10 > 9 ? '9' : m10;
      timeMinOne.textContent = m1;
      timeSecTen.textContent = s10;
      timeSecOne.textContent = s1;
      timeMinus.textContent = '-';
    } else {
      timeMinTen.className = `digit-box digit-${m10 > 9 ? '9' : m10}`;
      timeMinOne.className = `digit-box digit-${m1}`;
      timeSecTen.className = `digit-box digit-${s10}`;
      timeSecOne.className = `digit-box digit-${s1}`;
    }

    plCurTime.textContent = AudioMetadataParser.formatTime(currentTime);

    const ipodTimeElapsed = document.getElementById('ipodTimeElapsed');
    const ipodTimeRemaining = document.getElementById('ipodTimeRemaining');
    if (ipodTimeElapsed) {
      ipodTimeElapsed.textContent = AudioMetadataParser.formatTime(currentTime || 0);
    }
    if (ipodTimeRemaining) {
      const rem = (duration && isFinite(duration)) ? Math.max(0, duration - (currentTime || 0)) : 0;
      ipodTimeRemaining.textContent = `-${AudioMetadataParser.formatTime(rem)}`;
    }

    const ipcTimeElapsed = document.getElementById('ipcTimeElapsed');
    const ipcTimeRemaining = document.getElementById('ipcTimeRemaining');
    if (ipcTimeElapsed) {
      ipcTimeElapsed.textContent = AudioMetadataParser.formatTime(currentTime || 0);
    }
    if (ipcTimeRemaining) {
      const rem = (duration && isFinite(duration)) ? Math.max(0, duration - (currentTime || 0)) : 0;
      ipcTimeRemaining.textContent = `-${AudioMetadataParser.formatTime(rem)}`;
    }
  }

  audioElement.addEventListener('loadedmetadata', () => {
    updateMediaSessionPosition();
    updateCassetteUI();
  });

  audioElement.addEventListener('durationchange', () => {
    updateMediaSessionPosition();
  });

  audioElement.addEventListener('seeked', () => {
    updateMediaSessionPosition();
  });

  audioElement.addEventListener('timeupdate', () => {
    if (engine.isSwappingEqBuffer) return;
    if (!state.isDraggingSeek) {
      const cur = engine.getCurrentTime();
      const dur = engine.getDuration();
      updateTimerDisplay(cur, dur);

      if (dur && isFinite(dur) && dur > 0) {
        // Update stored track duration if it was 0 (e.g. newly loaded YouTube track)
        const activeTrack = state.playlist[state.currentIndex];
        if (activeTrack && (!activeTrack.duration || activeTrack.duration === 0)) {
          activeTrack.duration = Math.round(dur);
          window.winampDB.saveTrack(activeTrack).catch(() => {});
          renderPlaylist();
        }

        const percent = Math.min(100, Math.max(0, (cur / dur) * 100));
        seekThumb.style.left = `${percent}%`;
        const ipodSeekFill = document.getElementById('ipodSeekFill');
        const ipodSeekThumb = document.getElementById('ipodSeekThumb');
        if (ipodSeekFill) ipodSeekFill.style.width = `${percent}%`;
        if (ipodSeekThumb) ipodSeekThumb.style.left = `${percent}%`;
        const ipcSeekFill = document.getElementById('ipcSeekFill');
        const ipcSeekDiamond = document.getElementById('ipcSeekDiamond');
        if (ipcSeekFill) ipcSeekFill.style.width = `${percent}%`;
        if (ipcSeekDiamond) ipcSeekDiamond.style.left = `${percent}%`;
      }
    }
    updateCassetteUI();
  });

  audioElement.addEventListener('play', () => {
    state.isPlaying = true;
    state.isPaused = false;
    playStatusIcon.className = 'play-status-icon play';
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = 'playing';
      updateMediaSessionPosition();
    }
    updateCassetteUI();
    if (typeof updateIpodUI === 'function') updateIpodUI();
    if (typeof updateIpcUI === 'function') updateIpcUI();
    if (window.AndroidBridge && typeof window.AndroidBridge.onPlaybackStateChanged === 'function') {
      try {
        const trk = state.playlist[state.currentIndex];
        window.AndroidBridge.onPlaybackStateChanged(
          true,
          trk ? (trk.title || 'Unknown Title') : 'Winamp Walkman',
          trk ? (trk.artist || '') : '',
          trk ? Math.floor((trk.duration || 0) * 1000) : 0,
          Math.floor((engine.getCurrentTime() || 0) * 1000)
        );
      } catch (e) {}
    }
  });

  audioElement.addEventListener('pause', () => {
    if (engine.isSwappingEqBuffer || engine._suppressNativeEvents || engine._isUsingBufferEngine) return;
    const cur = engine.getCurrentTime();
    const dur = engine.getDuration();
    if (cur > 0 && (!dur || cur < dur - 0.2)) {
      state.isPlaying = false;
      state.isPaused = true;
      playStatusIcon.className = 'play-status-icon pause';
      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'paused';
        updateMediaSessionPosition();
      }
      updateCassetteUI();
      if (typeof updateIpodUI === 'function') updateIpodUI();
      if (typeof updateIpcUI === 'function') updateIpcUI();
      if (window.AndroidBridge && typeof window.AndroidBridge.onPlaybackStateChanged === 'function') {
        try {
          const trk = state.playlist[state.currentIndex];
          window.AndroidBridge.onPlaybackStateChanged(
            false,
            trk ? (trk.title || 'Unknown Title') : 'Winamp Walkman',
            trk ? (trk.artist || '') : '',
            trk ? Math.floor((trk.duration || 0) * 1000) : 0,
            Math.floor((engine.getCurrentTime() || 0) * 1000)
          );
        } catch (e) {}
      }
    }
  });

  audioElement.addEventListener('error', (e) => {
    if (engine.isSwappingEqBuffer) return;
    console.error('AudioElement error:', audioElement.error);
    state.isPlaying = false;
    state.isPaused = false;
    playStatusIcon.className = 'play-status-icon stop';
    if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'none';
    updateCassetteUI();
    if (typeof updateIpodUI === 'function') updateIpodUI();
    if (typeof updateIpcUI === 'function') updateIpcUI();
  });

  audioElement.addEventListener('ended', () => {
    if (engine.isSwappingEqBuffer) return;
    handleTrackEnded();
  });

  let isHandlingTrackEnd = false;
  function handleTrackEnded() {
    if (isHandlingTrackEnd) return;
    isHandlingTrackEnd = true;
    setTimeout(() => { isHandlingTrackEnd = false; }, 400);

    if (state.playlist.length === 0) {
      setStoppedState();
      return;
    }

    if (state.shuffle && state.playlist.length > 1) {
      playRandomTrack();
    } else if (state.currentIndex < state.playlist.length - 1) {
      playTrackIndex(state.currentIndex + 1);
    } else if (state.repeat !== 'off' && state.playlist.length > 0) {
      playTrackIndex(0);
    } else {
      setStoppedState();
    }
  }

  function setStoppedState() {
    state.isPlaying = false;
    state.isPaused = false;
    playStatusIcon.className = 'play-status-icon stop';
    updateTimerDisplay(0, 0);
    seekThumb.style.left = '0%';
    const ipodSeekFill = document.getElementById('ipodSeekFill');
    const ipodSeekThumb = document.getElementById('ipodSeekThumb');
    if (ipodSeekFill) ipodSeekFill.style.width = '0%';
    if (ipodSeekThumb) ipodSeekThumb.style.left = '0%';
    const ipcSeekFill = document.getElementById('ipcSeekFill');
    const ipcSeekDiamond = document.getElementById('ipcSeekDiamond');
    if (ipcSeekFill) ipcSeekFill.style.width = '0%';
    if (ipcSeekDiamond) ipcSeekDiamond.style.left = '0%';
    updateCassetteUI();
    if (typeof updateIpodUI === 'function') updateIpodUI();
    if (typeof updateIpcUI === 'function') updateIpcUI();
  }

  // =========================================================================
  // SPECTRUM ANALYZER & OSCILLOSCOPE
  // =========================================================================
  visContainer.addEventListener('click', () => {
    state.visMode = (state.visMode + 1) % 3;
    const modeNames = ['Spectrum Analyzer', 'Oscilloscope', 'Off'];
    showToast(`Visualizer: ${modeNames[state.visMode]}`);
  });

  const freqArray = new Uint8Array(64);
  const timeArray = new Uint8Array(64);

  function renderVisualizer() {
    requestAnimationFrame(renderVisualizer);

    if (document.hidden) return;

    if (document.body.classList.contains('skin-ipod')) {
      const miniVis = document.getElementById('ipodMiniVisCanvas');
      if (miniVis) {
        const mCtx = miniVis.getContext('2d');
        mCtx.clearRect(0, 0, miniVis.width, miniVis.height);
        if (state.isPlaying) {
          engine.getFrequencyData(freqArray);
          const bars = 11;
          const bw = 4;
          const gap = 2;
          for (let i = 0; i < bars; i++) {
            const idx = Math.min(freqArray.length - 1, Math.floor(Math.pow(i / bars, 1.3) * 32) + 1);
            const val = freqArray[idx] || 0;
            const bh = Math.max(2, Math.floor((val / 255) * (miniVis.height - 4)));
            const x = 3 + i * (bw + gap);
            const grad = mCtx.createLinearGradient(0, miniVis.height, 0, 2);
            grad.addColorStop(0, '#0284c7');
            grad.addColorStop(0.6, '#38bdf8');
            grad.addColorStop(1, '#fde047');
            mCtx.fillStyle = grad;
            mCtx.fillRect(x, miniVis.height - 2 - bh, bw, bh);
          }
        }
      }
      return;
    }

    if (document.body.classList.contains('skin-ipod-classic')) {
      const miniVis = document.getElementById('ipcMiniVisCanvas');
      if (miniVis) {
        const mCtx = miniVis.getContext('2d');
        mCtx.clearRect(0, 0, miniVis.width, miniVis.height);
        if (state.isPlaying) {
          engine.getFrequencyData(freqArray);
          const bars = 14;
          const bw = 5;
          const gap = 2;
          for (let i = 0; i < bars; i++) {
            const idx = Math.min(freqArray.length - 1, Math.floor(Math.pow(i / bars, 1.3) * 32) + 1);
            const val = freqArray[idx] || 0;
            const bh = Math.max(2, Math.floor((val / 255) * (miniVis.height - 4)));
            const x = 2 + i * (bw + gap);
            const grad = mCtx.createLinearGradient(0, miniVis.height, 0, 2);
            grad.addColorStop(0, '#1d4ed8');
            grad.addColorStop(0.55, '#3b82f6');
            grad.addColorStop(1, '#93c5fd');
            mCtx.fillStyle = grad;
            mCtx.fillRect(x, miniVis.height - 2 - bh, bw, bh);
          }
        }
      }
      return;
    }

    if (document.body.classList.contains('skin-cassette') || mainWindow.classList.contains('hidden')) {
      return;
    }

    visCtx.clearRect(0, 0, visCanvas.width, visCanvas.height);

    if (state.visMode === 2) return;

    const isModern = document.body.classList.contains('skin-modern');
    const colors = isModern ? modernSpecColors : classicSpecColors;
    const peakColor = isModern ? '#ffffff' : 'rgb(150,150,150)';

    if (!state.isPlaying) {
      visCtx.fillStyle = colors[0];
      visCtx.fillRect(0, visCanvas.height - 1, visCanvas.width, 1);
      return;
    }

    if (state.visMode === 0) {
      engine.getFrequencyData(freqArray);
      const barWidth = isModern ? 5 : 3;
      const barGap = isModern ? 2 : 1;
      const maxH = visCanvas.height;

      for (let i = 0; i < numVisBars; i++) {
        const sampleIdx = Math.floor(Math.pow(i / numVisBars, 1.4) * 36) + 1;
        const val = freqArray[sampleIdx] || 0;
        const barH = Math.floor((val / 255) * maxH);

        const x = i * (barWidth + barGap);

        if (barH >= peakLevels[i]) {
          peakLevels[i] = barH;
          peakDecay[i] = 0;
        } else {
          peakDecay[i] += 0.2;
          peakLevels[i] = Math.max(0, peakLevels[i] - peakDecay[i]);
        }

        for (let y = 0; y < barH; y += (isModern ? 2 : 1)) {
          const colorIdx = Math.floor((y / maxH) * colors.length);
          visCtx.fillStyle = colors[Math.min(colors.length - 1, colorIdx)];
          visCtx.fillRect(x, maxH - 1 - y, barWidth, isModern ? 1.5 : 1);
        }

        if (peakLevels[i] > 1) {
          visCtx.fillStyle = peakColor;
          visCtx.fillRect(x, Math.max(0, maxH - 1 - Math.floor(peakLevels[i])), barWidth, 1);
        }
      }
    } else if (state.visMode === 1) {
      engine.getTimeDomainData(timeArray);
      visCtx.strokeStyle = isModern ? '#60a5fa' : '#ffffff';
      visCtx.lineWidth = 1.2;
      visCtx.beginPath();

      const sliceWidth = visCanvas.width / timeArray.length;
      let x = 0;

      for (let i = 0; i < timeArray.length; i++) {
        const v = timeArray[i] / 128.0;
        const y = (v * visCanvas.height) / 2;
        if (i === 0) {
          visCtx.moveTo(x, y);
        } else {
          visCtx.lineTo(x, y);
        }
        x += sliceWidth;
      }
      visCtx.stroke();
    }
  }

  renderVisualizer();

  // =========================================================================
  // EQUALIZER
  // =========================================================================
  function drawEQCurve() {
    eqCtx.fillStyle = '#000000';
    eqCtx.fillRect(0, 0, eqCanvas.width, eqCanvas.height);

    eqCtx.strokeStyle = '#223322';
    eqCtx.lineWidth = 1;
    for (let i = 0; i < 10; i++) {
      const gx = (i / 9) * (eqCanvas.width - 8) + 4;
      eqCtx.beginPath();
      eqCtx.moveTo(gx, 0);
      eqCtx.lineTo(gx, eqCanvas.height);
      eqCtx.stroke();
    }

    eqCtx.strokeStyle = '#334433';
    eqCtx.beginPath();
    eqCtx.moveTo(0, eqCanvas.height / 2);
    eqCtx.lineTo(eqCanvas.width, eqCanvas.height / 2);
    eqCtx.stroke();

    if (!state.eqEnabled) {
      eqCtx.strokeStyle = '#555555';
      eqCtx.beginPath();
      eqCtx.moveTo(0, eqCanvas.height / 2);
      eqCtx.lineTo(eqCanvas.width, eqCanvas.height / 2);
      eqCtx.stroke();
      if (typeof updateIpodEQ === 'function') updateIpodEQ();
      if (typeof updateIpcEQ === 'function') updateIpcEQ();
      return;
    }

    const isModern = document.body.classList.contains('skin-modern');
    const isMidnight = document.body.classList.contains('skin-midnight');
    eqCtx.strokeStyle = isModern ? '#38bdf8' : (isMidnight ? '#facc15' : '#e0aa00');
    eqCtx.lineWidth = 1.5;
    eqCtx.beginPath();

    const points = state.bands.map((gain, i) => {
      const x = (i / (state.bands.length - 1)) * (eqCanvas.width - 8) + 4;
      const y = (eqCanvas.height / 2) - (gain / 12) * (eqCanvas.height / 2 - 2);
      return { x, y };
    });

    eqCtx.moveTo(points[0].x, points[0].y);
    for (let i = 0; i < points.length - 1; i++) {
      const xc = (points[i].x + points[i + 1].x) / 2;
      const yc = (points[i].y + points[i + 1].y) / 2;
      eqCtx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
    }
    eqCtx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
    eqCtx.stroke();

    if (typeof updateIpodEQ === 'function') updateIpodEQ();
    if (typeof updateIpcEQ === 'function') updateIpcEQ();
  }

  function setupEQFaders() {
    function updateFader(track, clientY) {
      engine.ensureRunning(true);
      const bandAttr = track.getAttribute('data-band');
      const thumb = track.querySelector('.eq-fader-thumb');
      const rect = track.getBoundingClientRect();
      let ratio = 1 - (clientY - rect.top) / rect.height;
      ratio = Math.max(0, Math.min(1, ratio));

      if (Math.abs(ratio - 0.5) < 0.04) ratio = 0.5;

      const dbVal = (ratio - 0.5) * 24;
      thumb.style.bottom = `${ratio * 100}%`;

      if (bandAttr === 'preamp') {
        state.preamp = dbVal;
        engine.setPreamp(dbVal, true);
        if (typeof updateIpodEQ === 'function') updateIpodEQ();
        window.winampDB.setSetting('eq_preamp', dbVal);
      } else {
        const freq = parseInt(bandAttr, 10);
        const bandIdx = engine.eqFrequencies.indexOf(freq);
        if (bandIdx !== -1) {
          state.bands[bandIdx] = dbVal;
          engine.setBandGain(bandIdx, dbVal, true);
          drawEQCurve();
          window.winampDB.setSetting('eq_bands', state.bands);
        }
      }
    }

    let activeFaderTrack = null;

    eqTracks.forEach((track) => {
      track.addEventListener('mousedown', (e) => {
        if (e.button !== 0) return;
        e.preventDefault();
        e.stopPropagation();
        activeFaderTrack = track;
        updateFader(track, e.clientY);

        function onMouseMove(evt) {
          if (activeFaderTrack) {
            updateFader(activeFaderTrack, evt.clientY);
          }
        }

        function onMouseUp() {
          activeFaderTrack = null;
          document.removeEventListener('mousemove', onMouseMove);
          document.removeEventListener('mouseup', onMouseUp);
        }

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
      });

      track.addEventListener('touchstart', (e) => {
        if (e.touches.length > 0) {
          e.preventDefault();
          e.stopPropagation();
          activeFaderTrack = track;
          updateFader(track, e.touches[0].clientY);

          function onTouchMove(evt) {
            if (activeFaderTrack && evt.touches.length > 0) {
              updateFader(activeFaderTrack, evt.touches[0].clientY);
            }
          }

          function onTouchEnd() {
            activeFaderTrack = null;
            document.removeEventListener('touchmove', onTouchMove);
            document.removeEventListener('touchend', onTouchEnd);
          }

          document.addEventListener('touchmove', onTouchMove, { passive: false });
          document.addEventListener('touchend', onTouchEnd);
        }
      }, { passive: false });
    });

    // Cross-slider sweep / pencil-in support on the container
    const slidersContainer = document.querySelector('.eq-sliders-container');
    if (slidersContainer) {
      let isContainerDragging = false;

      function getTrackAtX(clientX) {
        for (const t of eqTracks) {
          const r = t.getBoundingClientRect();
          if (clientX >= r.left && clientX <= r.right) {
            return t;
          }
        }
        return null;
      }

      slidersContainer.addEventListener('mousedown', (e) => {
        if (e.button !== 0) return;
        e.preventDefault();
        isContainerDragging = true;
        const targetTrack = getTrackAtX(e.clientX);
        if (targetTrack) {
          updateFader(targetTrack, e.clientY);
        }

        function onContainerMove(evt) {
          if (!isContainerDragging) return;
          const tr = getTrackAtX(evt.clientX);
          if (tr) {
            updateFader(tr, evt.clientY);
          }
        }

        function onContainerUp() {
          isContainerDragging = false;
          document.removeEventListener('mousemove', onContainerMove);
          document.removeEventListener('mouseup', onContainerUp);
        }

        document.addEventListener('mousemove', onContainerMove);
        document.addEventListener('mouseup', onContainerUp);
      });
    }
  }

  setupEQFaders();

  eqOnBtn.addEventListener('click', () => {
    state.eqEnabled = !state.eqEnabled;
    eqOnBtn.classList.toggle('active', state.eqEnabled);
    engine.setEqEnabled(state.eqEnabled, true);
    if (state.eqEnabled) engine.ensureRunning();
    drawEQCurve();
    window.winampDB.setSetting('eq_enabled', state.eqEnabled);
  });

  eqAutoBtn.addEventListener('click', () => {
    state.eqAuto = !state.eqAuto;
    eqAutoBtn.classList.toggle('active', state.eqAuto);
  });

  eqPresetsBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    presetsMenu.classList.toggle('hidden');
  });

  document.addEventListener('click', (e) => {
    if (!eqPresetsBtn.contains(e.target) && !presetsMenu.contains(e.target)) {
      presetsMenu.classList.add('hidden');
    }
  });

  presetsMenu.querySelectorAll('.preset-item').forEach((item) => {
    item.addEventListener('click', () => {
      const presetKey = item.getAttribute('data-preset');
      if (presetKey && engine.presets[presetKey]) {
        applyPresetValues(engine.presets[presetKey], true);
        showToast(`EQ Preset: ${item.textContent}`);
      }
      presetsMenu.classList.add('hidden');
    });
  });

  btnResetEQ.addEventListener('click', () => {
    applyPresetValues([0, 0, 0, 0, 0, 0, 0, 0, 0, 0], true);
    showToast('EQ reset to Flat');
  });

  function applyPresetValues(vals, userInitiated = false) {
    state.bands = [...vals];
    vals.forEach((db, idx) => {
      engine.setBandGain(idx, db, false);
      const freq = engine.eqFrequencies[idx];
      const track = document.querySelector(`.eq-fader-track[data-band="${freq}"]`);
      if (track) {
        const thumb = track.querySelector('.eq-fader-thumb');
        const ratio = (db / 24) + 0.5;
        thumb.style.bottom = `${ratio * 100}%`;
      }
    });
    if (userInitiated) {
      if (engine.hasActiveDsp()) {
        engine.ensureRunning(true);
      }
      engine.rewireGraph();
    }
    drawEQCurve();
    window.winampDB.setSetting('eq_bands', state.bands);
  }

  // =========================================================================
  // PLAYLIST
  // =========================================================================
  function renderPlaylist() {
    if (state.playlist.length === 0) {
      plList.innerHTML = `
        <div class="pl-empty-tip">
          <div>(Playlist is empty)</div>
          <div class="pl-sub-tip">Drop MP3 / WAV files here or click + Add below</div>
        </div>
      `;
      plTotalTime.textContent = '0:00/0:00';
      if (typeof updatePlScrollbarThumb === 'function') {
        updatePlScrollbarThumb();
      }
      if (typeof renderIpodSongs === 'function') renderIpodSongs();
      if (typeof updateIpodUI === 'function') updateIpodUI();
      if (typeof renderIpcSongs === 'function') renderIpcSongs();
      if (typeof updateIpcUI === 'function') updateIpcUI();
      if (typeof renderIpcCoverFlow === 'function') renderIpcCoverFlow();
      return;
    }

    let totalSecs = 0;
    plList.innerHTML = '';

    state.playlist.forEach((track, idx) => {
      totalSecs += track.duration || 0;
      const isCurrent = idx === state.currentIndex;
      const isSelected = state.selectedIndices.has(idx);

      const div = document.createElement('div');
      div.className = `pl-item ${isCurrent ? 'current-track' : ''} ${isSelected ? 'selected' : ''}`;
      div.setAttribute('data-index', idx);

      const numStr = `${idx + 1}.`;
      const timeStr = AudioMetadataParser.formatTime(track.duration);

      div.innerHTML = `
        <div class="pl-item-left">
          <span class="pl-item-num">${numStr}</span>
          <span class="pl-item-title" title="${track.artist} - ${track.title}">${track.artist ? `${track.artist} - ` : ''}${track.title}</span>
        </div>
        <span class="pl-item-time">${timeStr}</span>
      `;

      div.addEventListener('click', (e) => {
        if (e.shiftKey) {
          state.selectedIndices.add(idx);
          renderPlaylist();
        } else if (e.ctrlKey || e.metaKey) {
          if (state.selectedIndices.has(idx)) {
            state.selectedIndices.delete(idx);
          } else {
            state.selectedIndices.add(idx);
          }
          renderPlaylist();
        } else {
          state.selectedIndices.clear();
          state.selectedIndices.add(idx);
          playTrackIndex(idx);
        }
      });

      div.addEventListener('dblclick', () => {
        playTrackIndex(idx);
      });

      plList.appendChild(div);
    });

    const currentTrackDuration = state.currentIndex >= 0 && state.playlist[state.currentIndex] ?
      AudioMetadataParser.formatTime(state.playlist[state.currentIndex].duration) : '0:00';
    const totalDurationStr = AudioMetadataParser.formatTime(totalSecs);
    plTotalTime.textContent = `${currentTrackDuration}/${totalDurationStr}`;

    const currentElem = plList.querySelector('.current-track');
    if (currentElem) {
      currentElem.scrollIntoView({ block: 'nearest' });
    }
    if (typeof updatePlScrollbarThumb === 'function') {
      updatePlScrollbarThumb();
    }
    if (typeof renderIpodSongs === 'function') renderIpodSongs();
    if (typeof updateIpodUI === 'function') updateIpodUI();
    if (typeof renderIpcSongs === 'function') renderIpcSongs();
    if (typeof updateIpcUI === 'function') updateIpcUI();
    if (typeof renderIpcCoverFlow === 'function') renderIpcCoverFlow();
  }

  function updateMediaSession(track) {
    if (window.AndroidBridge && typeof window.AndroidBridge.onPlaybackStateChanged === 'function') {
      try {
        const isPlaying = !audioElement.paused;
        window.AndroidBridge.onPlaybackStateChanged(
          isPlaying,
          track ? (track.title || 'Unknown Title') : 'Winamp Walkman',
          track ? (track.artist || '') : '',
          track ? Math.floor((track.duration || 0) * 1000) : 0,
          Math.floor((engine.getCurrentTime() || 0) * 1000)
        );
      } catch (e) {}
    }
    if ('mediaSession' in navigator && track) {
      try {
        const icon192 = new URL('icon-192.png', window.location.href).href;
        const icon512 = new URL('icon-512.png', window.location.href).href;
        const artworkList = track.thumbnail
          ? [
              { src: track.thumbnail, sizes: '480x360', type: 'image/jpeg' },
              { src: icon192, sizes: '192x192', type: 'image/png' },
              { src: icon512, sizes: '512x512', type: 'image/png' }
            ]
          : [
              { src: icon192, sizes: '192x192', type: 'image/png' },
              { src: icon512, sizes: '512x512', type: 'image/png' }
            ];

        navigator.mediaSession.metadata = new MediaMetadata({
          title: track.title || 'Unknown Title',
          artist: track.artist || 'Winamp Web Player',
          album: track.album || 'Winamp',
          artwork: artworkList
        });
        updateMediaSessionPosition();
      } catch (e) {}
    }
  }

  function updateMediaSessionPosition() {
    if ('mediaSession' in navigator && 'setPositionState' in navigator.mediaSession) {
      const dur = engine.getDuration();
      if (dur && isFinite(dur) && dur > 0) {
        try {
          navigator.mediaSession.setPositionState({
            duration: dur,
            playbackRate: audioElement.playbackRate || 1.0,
            position: Math.min(Math.max(0, engine.getCurrentTime() || 0), dur)
          });
        } catch (e) {}
      }
    }
  }

  async function playTrackIndex(idx) {
    if (idx < 0 || idx >= state.playlist.length) return;
    const track = state.playlist[idx];
    state.currentIndex = idx;

    const fullTitle = `${idx + 1}. ${track.artist ? `${track.artist} - ` : ''}${track.title} (${AudioMetadataParser.formatTime(track.duration)})`;
    titleMarquee.textContent = fullTitle;
    titleMarquee.style.animation = 'none';
    void titleMarquee.offsetWidth;
    titleMarquee.style.animation = '';
    updateMediaSession(track);

    kbpsDisplay.textContent = `${track.bitrate || 128} KBPS`;
    khzDisplay.textContent = `${Math.round((track.sampleRate || 44100) / 1000)} KHZ`;
    
    if (track.channels === 1) {
      monosterIndicator.className = 'monoster-box mono';
    } else {
      monosterIndicator.className = 'monoster-box stereo';
    }

    try {
      updateCassetteLabel(track);
      updateCassetteUI();
      renderPlaylist();
      if (typeof drawIpodCoverArt === 'function') drawIpodCoverArt();
      if (typeof updateIpodUI === 'function') updateIpodUI();
      if (typeof drawIpcCoverArt === 'function') drawIpcCoverArt();
      if (typeof updateIpcUI === 'function') updateIpcUI();
      if (typeof renderIpcCoverFlow === 'function') renderIpcCoverFlow();
      window.winampDB.setSetting('lastTrackIndex', idx);

      if (track.youtubeId) {
        if (!navigator.onLine) {
          showToast('📴 เพลงจาก YouTube ต้องใช้อินเทอร์เน็ตในการเล่น');
          return;
        }
        await engine.loadYoutubeTrack(track.youtubeId, track.duration || 0);
      } else {
        await engine.loadTrack(track.blob);
        await engine.play();
      }
    } catch (e) {
      console.error("Playback error:", e);
      showToast(`Playback failed: ${track.title}`);
    }
  }

  function playRandomTrack() {
    if (state.playlist.length <= 1) {
      playTrackIndex(0);
      return;
    }
    let rand = state.currentIndex;
    while (rand === state.currentIndex) {
      rand = Math.floor(Math.random() * state.playlist.length);
    }
    playTrackIndex(rand);
  }

  async function addAudioFiles(fileList) {
    const files = Array.from(fileList);
    if (files.length === 0) return;

    showToast(`Importing ${files.length} audio file(s)...`);
    const newTracks = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('audio/') && !/\.(mp3|wav|ogg|m4a|flac|aac)$/i.test(file.name)) {
        continue;
      }

      const meta = await AudioMetadataParser.parse(file);
      const trackObj = {
        id: `track_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: meta.title,
        artist: meta.artist,
        album: meta.album,
        duration: meta.duration,
        bitrate: meta.bitrate,
        sampleRate: meta.sampleRate,
        channels: meta.channels,
        blob: file,
        order: state.playlist.length + newTracks.length
      };

      newTracks.push(trackObj);
    }

    if (newTracks.length > 0) {
      await window.winampDB.saveTracks(newTracks);
      state.playlist.push(...newTracks);
      renderPlaylist();
      showToast(`Added ${newTracks.length} song(s) to playlist!`);

      if (state.currentIndex === -1) {
        state.currentIndex = 0;
        playTrackIndex(0);
      }
    }
  }

  fileInput.addEventListener('change', (e) => {
    addAudioFiles(e.target.files);
    fileInput.value = '';
  });

  folderInput.addEventListener('change', (e) => {
    addAudioFiles(e.target.files);
    folderInput.value = '';
  });

  const dropTargets = [document.body, plListDropZone, mainWindow, eqWindow, plWindow];
  dropTargets.forEach(target => {
    if (!target) return;
    target.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
    });
    target.addEventListener('drop', (e) => {
      e.preventDefault();
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        addAudioFiles(e.dataTransfer.files);
      }
    });
  });

  btnPlay.addEventListener('click', async () => {
    if (state.playlist.length === 0) {
      await loadDemoSongs();
    }
    if (state.isPaused) {
      engine.play();
    } else if (state.currentIndex >= 0) {
      playTrackIndex(state.currentIndex);
    } else if (state.playlist.length > 0) {
      playTrackIndex(0);
    }
  });

  btnPause.addEventListener('click', () => {
    if (state.isPlaying) {
      engine.pause();
    } else if (state.isPaused) {
      engine.play();
    }
  });

  btnStop.addEventListener('click', () => {
    engine.stop();
    setStoppedState();
  });

  btnPrev.addEventListener('click', () => {
    triggerTapeSpinGimmick('rewind');
    if (engine.getCurrentTime() > 3) {
      engine.seek(0);
    } else if (state.shuffle) {
      playRandomTrack();
    } else if (state.currentIndex > 0) {
      playTrackIndex(state.currentIndex - 1);
    } else if (state.playlist.length > 0) {
      playTrackIndex(state.playlist.length - 1);
    }
  });

  btnNext.addEventListener('click', () => {
    triggerTapeSpinGimmick('fast-forward');
    if (state.shuffle) {
      playRandomTrack();
    } else if (state.currentIndex < state.playlist.length - 1) {
      playTrackIndex(state.currentIndex + 1);
    } else if (state.playlist.length > 0) {
      playTrackIndex(0);
    }
  });

  btnEject.addEventListener('click', () => {
    fileInput.click();
  });

  if (mainMinBtn) {
    mainMinBtn.addEventListener('click', () => {
      mainWindow.classList.toggle('shaded');
      updateResponsiveLayout();
      saveWindowPositions();
    });
  }

  // Setup MediaSession API for Apple CarPlay, Lock Screen & Background Playback
  if ('mediaSession' in navigator) {
    const handlers = {
      play: async () => {
        if (state.currentIndex < 0 && state.playlist.length > 0) {
          await playTrackIndex(0);
        } else {
          await engine.play();
        }
      },
      pause: () => {
        engine.pause();
      },
      stop: () => {
        engine.stop();
        setStoppedState();
      },
      previoustrack: () => {
        btnPrev.click();
      },
      nexttrack: () => {
        btnNext.click();
      },
      seekto: (details) => {
        if (details && details.seekTime !== undefined) {
          engine.seek(details.seekTime);
          updateMediaSessionPosition();
        }
      },
      seekbackward: (details) => {
        const skip = (details && details.seekOffset) || 10;
        engine.seek(Math.max(0, engine.getCurrentTime() - skip));
        updateMediaSessionPosition();
      },
      seekforward: (details) => {
        const skip = (details && details.seekOffset) || 10;
        engine.seek(Math.min(engine.getDuration() || 0, engine.getCurrentTime() + skip));
        updateMediaSessionPosition();
      }
    };

    Object.entries(handlers).forEach(([action, handler]) => {
      try {
        navigator.mediaSession.setActionHandler(action, handler);
      } catch (e) {}
    });

    window.addEventListener('android-media-control', (e) => {
      const act = e.detail && e.detail.action;
      if (act === 'play') {
        if (handlers.play) handlers.play();
      } else if (act === 'pause') {
        if (handlers.pause) handlers.pause();
      } else if (act === 'next') {
        if (handlers.nexttrack) handlers.nexttrack();
      } else if (act === 'previous') {
        if (handlers.previoustrack) handlers.previoustrack();
      }
    });
  }

  btnShuffle.addEventListener('click', () => {
    state.shuffle = !state.shuffle;
    btnShuffle.classList.toggle('active', state.shuffle);
    if (typeof updateIpodUI === 'function') updateIpodUI();
    showToast(`Shuffle: ${state.shuffle ? 'ON' : 'OFF'}`);
    window.winampDB.setSetting('shuffle', state.shuffle);
  });

  btnRepeat.addEventListener('click', () => {
    if (state.repeat !== 'off') {
      state.repeat = 'off';
      btnRepeat.classList.remove('active');
      showToast('Repeat Playlist: OFF');
    } else {
      state.repeat = 'all';
      btnRepeat.classList.add('active');
      showToast('Repeat Playlist: ON');
    }
    if (typeof updateIpodUI === 'function') updateIpodUI();
    window.winampDB.setSetting('repeat', state.repeat);
  });

  plMiniPlay.addEventListener('click', () => btnPlay.click());
  plMiniPause.addEventListener('click', () => btnPause.click());
  plMiniStop.addEventListener('click', () => btnStop.click());
  plMiniPrev.addEventListener('click', () => btnPrev.click());
  plMiniNext.addEventListener('click', () => btnNext.click());
  plMiniEject.addEventListener('click', () => fileInput.click());

  function setupPopup(btn, menu) {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      document.querySelectorAll('.popup-menu').forEach(m => {
        if (m !== menu) m.classList.add('hidden');
      });
      menu.classList.toggle('hidden');
    });
  }

  setupPopup(plAddBtn, plAddMenu);
  setupPopup(plRemBtn, plRemMenu);
  setupPopup(plSelBtn, plSelMenu);
  setupPopup(plMiscBtn, plMiscMenu);
  setupPopup(plOptsBtn, plOptsMenu);

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.menu-btn-wrap')) {
      document.querySelectorAll('.popup-menu').forEach(m => m.classList.add('hidden'));
    }
  });

  const menuAddYoutube = document.getElementById('menuAddYoutube');
  if (menuAddYoutube) {
    menuAddYoutube.addEventListener('click', () => {
      plAddMenu.classList.add('hidden');
      openYoutubeModal();
    });
  }

  document.getElementById('menuAddFile').addEventListener('click', () => {
    fileInput.click();
    plAddMenu.classList.add('hidden');
  });

  document.getElementById('menuAddFolder').addEventListener('click', () => {
    folderInput.click();
    plAddMenu.classList.add('hidden');
  });

  document.getElementById('menuAddDemo').addEventListener('click', () => {
    loadDemoSongs();
    plAddMenu.classList.add('hidden');
  });

  if (btnLoadDemo) btnLoadDemo.addEventListener('click', loadDemoSongs);

  document.getElementById('menuRemSelected').addEventListener('click', async () => {
    plRemMenu.classList.add('hidden');
    if (state.selectedIndices.size === 0) return;

    const remaining = [];
    for (let i = 0; i < state.playlist.length; i++) {
      if (state.selectedIndices.has(i)) {
        await window.winampDB.deleteTrack(state.playlist[i].id);
      } else {
        remaining.push(state.playlist[i]);
      }
    }

    state.playlist = remaining;
    state.selectedIndices.clear();
    await window.winampDB.updateOrder(state.playlist);

    if (state.currentIndex >= state.playlist.length) {
      state.currentIndex = state.playlist.length - 1;
    }
    renderPlaylist();
    showToast('Removed selected tracks');
  });

  document.getElementById('menuRemCrop').addEventListener('click', async () => {
    plRemMenu.classList.add('hidden');
    if (state.selectedIndices.size === 0) return;

    const cropped = [];
    for (let i = 0; i < state.playlist.length; i++) {
      if (state.selectedIndices.has(i)) {
        cropped.push(state.playlist[i]);
      } else {
        await window.winampDB.deleteTrack(state.playlist[i].id);
      }
    }

    state.playlist = cropped;
    state.selectedIndices.clear();
    await window.winampDB.updateOrder(state.playlist);
    state.currentIndex = 0;
    renderPlaylist();
    showToast('Cropped playlist to selection');
  });

  document.getElementById('menuRemAll').addEventListener('click', async () => {
    plRemMenu.classList.add('hidden');
    await window.winampDB.clearTracks();
    state.playlist = [];
    state.selectedIndices.clear();
    state.currentIndex = -1;
    engine.stop();
    setStoppedState();
    titleMarquee.textContent = 'WINAMP (READY)';
    renderPlaylist();
    showToast('Cleared entire playlist');
  });

  document.getElementById('menuSelAll').addEventListener('click', () => {
    plSelMenu.classList.add('hidden');
    state.selectedIndices = new Set(state.playlist.map((_, i) => i));
    renderPlaylist();
  });

  document.getElementById('menuSelNone').addEventListener('click', () => {
    plSelMenu.classList.add('hidden');
    state.selectedIndices.clear();
    renderPlaylist();
  });

  document.getElementById('menuSelInvert').addEventListener('click', () => {
    plSelMenu.classList.add('hidden');
    const inverted = new Set();
    state.playlist.forEach((_, i) => {
      if (!state.selectedIndices.has(i)) inverted.add(i);
    });
    state.selectedIndices = inverted;
    renderPlaylist();
  });

  document.getElementById('menuSortTitle').addEventListener('click', async () => {
    plMiscMenu.classList.add('hidden');
    state.playlist.sort((a, b) => a.title.localeCompare(b.title));
    await window.winampDB.updateOrder(state.playlist);
    renderPlaylist();
    showToast('Sorted by title');
  });

  document.getElementById('menuSortFilename').addEventListener('click', async () => {
    plMiscMenu.classList.add('hidden');
    state.playlist.sort((a, b) => ((a.blob && a.blob.name) || a.title).localeCompare((b.blob && b.blob.name) || b.title));
    await window.winampDB.updateOrder(state.playlist);
    renderPlaylist();
    showToast('Sorted by filename');
  });

  document.getElementById('menuShuffleList').addEventListener('click', async () => {
    plMiscMenu.classList.add('hidden');
    for (let i = state.playlist.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [state.playlist[i], state.playlist[j]] = [state.playlist[j], state.playlist[i]];
    }
    await window.winampDB.updateOrder(state.playlist);
    renderPlaylist();
    showToast('Playlist randomized');
  });

  document.getElementById('menuReverseList').addEventListener('click', async () => {
    plMiscMenu.classList.add('hidden');
    state.playlist.reverse();
    await window.winampDB.updateOrder(state.playlist);
    renderPlaylist();
    showToast('Playlist reversed');
  });

  document.getElementById('menuExportM3U').addEventListener('click', () => {
    plOptsMenu.classList.add('hidden');
    if (state.playlist.length === 0) {
      showToast('Playlist is empty');
      return;
    }
    let m3uContent = '#EXTM3U\n';
    state.playlist.forEach(track => {
      m3uContent += `#EXTINF:${Math.round(track.duration)},${track.artist ? `${track.artist} - ` : ''}${track.title}\n`;
      m3uContent += `${track.title}.mp3\n`;
    });
    const blob = new Blob([m3uContent], { type: 'audio/x-mpegurl' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'playlist.m3u';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Exported playlist.m3u');
  });

  document.getElementById('menuSavePlaylist').addEventListener('click', async () => {
    plOptsMenu.classList.add('hidden');
    await window.winampDB.updateOrder(state.playlist);
    showToast('Playlist saved to IndexedDB');
  });

  document.getElementById('menuReloadStorage').addEventListener('click', async () => {
    plOptsMenu.classList.add('hidden');
    await loadStoredTracks();
    showToast('Reloaded tracks from storage');
  });

  // =========================================================================
  // DEMO SONGS
  // =========================================================================
  async function loadDemoSongs() {
    showToast('Loading Winamp demo tracks...');
    
    // 1. Classic Llama Whipping Intro
    const llamaBlob = WinampAudioEngine.createLlamaIntroBlob();
    const chiptuneBlob = WinampAudioEngine.createDemoChiptuneBlob();

    const demoTracks = [
      {
        id: 'track_mori_calliope',
        title: 'Go-Getters',
        artist: 'Mori Calliope',
        album: 'Suicide Squad ISEKAI',
        duration: 195,
        bitrate: 128,
        sampleRate: 48000,
        channels: 2,
        blob: chiptuneBlob,
        order: 0
      },
      {
        id: 'track_circusp',
        title: 'Goodbye',
        artist: 'CircusP',
        album: 'Vocaloid Classics',
        duration: 204,
        bitrate: 128,
        sampleRate: 48000,
        channels: 2,
        blob: chiptuneBlob,
        order: 1
      },
      {
        id: 'track_amalee',
        title: 'Siren',
        artist: 'AmaLee',
        album: 'Equinox',
        duration: 242,
        bitrate: 128,
        sampleRate: 48000,
        channels: 2,
        blob: chiptuneBlob,
        order: 2
      },
      {
        id: 'track_crusher_p',
        title: 'Echo',
        artist: 'Crusher-P',
        album: 'Vocaloid Hits',
        duration: 230,
        bitrate: 128,
        sampleRate: 48000,
        channels: 2,
        blob: chiptuneBlob,
        order: 3
      },
      {
        id: 'track_m83',
        title: 'Midnight City',
        artist: 'M83',
        album: 'Hurry Up, We\'re Dreaming',
        duration: 243,
        bitrate: 128,
        sampleRate: 48000,
        channels: 2,
        blob: chiptuneBlob,
        order: 4
      },
      {
        id: 'track_sunnexo',
        title: 'Please Wait',
        artist: 'Sunnexo',
        album: 'Future Bass',
        duration: 255,
        bitrate: 128,
        sampleRate: 48000,
        channels: 2,
        blob: chiptuneBlob,
        order: 5
      },
      {
        id: 'track_omaru_polka',
        title: 'Persona',
        artist: 'Omaru Polka',
        album: 'Hololive Production',
        duration: 296,
        bitrate: 128,
        sampleRate: 48000,
        channels: 2,
        blob: chiptuneBlob,
        order: 6
      },
      {
        id: 'demo_llama_intro',
        title: 'Llama Whipping Intro',
        artist: 'DJ Mike Llama',
        album: 'Winamp Classic Audio',
        duration: 5,
        bitrate: 128,
        sampleRate: 44100,
        channels: 2,
        blob: llamaBlob,
        order: 7
      }
    ];

    for (const t of demoTracks) {
      await window.winampDB.saveTrack(t);
      state.playlist.push(t);
    }

    renderPlaylist();
    showToast('Loaded iconic Winamp demo tracks!');

    if (state.currentIndex === -1) {
      playTrackIndex(3);
    }
  }

  // =========================================================================
  // STARTUP RESTORATION
  // =========================================================================
  async function loadStoredTracks() {
    const tracks = await window.winampDB.getAllTracks();
    if (tracks && tracks.length > 0) {
      state.playlist = tracks;
      renderPlaylist();

      const lastIdx = await window.winampDB.getSetting('lastTrackIndex', 0);
      if (lastIdx >= 0 && lastIdx < state.playlist.length) {
        state.currentIndex = lastIdx;
        const track = state.playlist[lastIdx];
        titleMarquee.textContent = `${lastIdx + 1}. ${track.artist ? `${track.artist} - ` : ''}${track.title} (${AudioMetadataParser.formatTime(track.duration)})`;
        titleMarquee.style.animation = 'none';
        void titleMarquee.offsetWidth;
        titleMarquee.style.animation = '';
        updateMediaSession(track);
        updateCassetteLabel(track);
        updateCassetteUI();
        if (typeof drawIpodCoverArt === 'function') drawIpodCoverArt();
        if (typeof updateIpodUI === 'function') updateIpodUI();
        if (typeof drawIpcCoverArt === 'function') drawIpcCoverArt();
        if (typeof updateIpcUI === 'function') updateIpcUI();
        if (typeof renderIpcCoverFlow === 'function') renderIpcCoverFlow();
        kbpsDisplay.textContent = `${track.bitrate || 128} KBPS`;
        khzDisplay.textContent = `${Math.round((track.sampleRate || 44100) / 1000)} KHZ`;
      }
    } else {
      await loadDemoSongs();
    }
  }

  async function restoreSettings() {
    const savedSkin = await window.winampDB.getSetting('skin', 'skin-midnight');
    switchSkin(savedSkin);

    const vol = await window.winampDB.getSetting('volume', 0.8);
    updateVolumeUI(vol);

    const bal = await window.winampDB.getSetting('balance', 0.0);
    updateBalanceUI(bal);

    const shuff = await window.winampDB.getSetting('shuffle', false);
    state.shuffle = shuff;
    btnShuffle.classList.toggle('active', shuff);

    let rep = await window.winampDB.getSetting('repeat', 'all');
    if (rep === 'single') {
      rep = 'all';
      window.winampDB.setSetting('repeat', 'all');
    }
    state.repeat = rep;
    btnRepeat.classList.toggle('active', rep !== 'off');

    const eqEn = await window.winampDB.getSetting('eq_enabled', true);
    state.eqEnabled = eqEn;
    eqOnBtn.classList.toggle('active', eqEn);
    engine.setEqEnabled(eqEn);

    const bands = await window.winampDB.getSetting('eq_bands', null);
    if (bands && Array.isArray(bands)) {
      applyPresetValues(bands);
    } else {
      drawEQCurve();
    }

    const preamp = await window.winampDB.getSetting('eq_preamp', 0);
    state.preamp = preamp;
    engine.setPreamp(preamp);
    const preampRatio = (preamp / 24) + 0.5;
    faderPreamp.style.bottom = `${preampRatio * 100}%`;

    const remMode = await window.winampDB.getSetting('timeRemainingMode', false);
    state.timeRemainingMode = remMode;
    timeMinus.classList.toggle('active', remMode);

    const savedTape = await window.winampDB.getSetting('cassette_tape', 'clear');
    switchCassetteTape(savedTape, false);

    const savedCustomSkin = await window.winampDB.getSetting('cassette_custom_skin', '');
    if (savedCustomSkin) {
      applyCustomTapeSkin(savedCustomSkin, false);
    }

    const savedSoundFx = await window.winampDB.getSetting('cassette_soundfx', true);
    engine.soundFxEnabled = savedSoundFx;
    const cmenuSoundFx = document.getElementById('cmenuSoundFx');
    if (cmenuSoundFx) cmenuSoundFx.textContent = `🔊 เสียงกลไกเทป (Sound FX: ${savedSoundFx ? 'เปิด' : 'ปิด'})`;
    if (wmSoundFxBtn) wmSoundFxBtn.textContent = `🔊 SFX: ${savedSoundFx ? 'ON' : 'OFF'}`;

    const savedIpodCover = await window.winampDB.getSetting('ipod_custom_cover', '');
    if (savedIpodCover && typeof applyIpodCustomCover === 'function') {
      applyIpodCustomCover(savedIpodCover, false);
    }
    const savedIpcColor = await window.winampDB.getSetting('ipod_classic_color', 'silver');
    if (typeof cycleIpcColor === 'function') {
      cycleIpcColor(savedIpcColor);
    }
    if (typeof updateIpodUI === 'function') updateIpodUI();
    if (typeof updateIpodEQ === 'function') updateIpodEQ();
    if (typeof updateIpcUI === 'function') updateIpcUI();
    if (typeof updateIpcEQ === 'function') updateIpcEQ();
  }

  // =========================================================================
  // YOUTUBE LINK PASTE & PLAY ENGINE
  // =========================================================================
  const youtubeModal = document.getElementById('youtubeModal');
  const ytModalCloseBtn = document.getElementById('ytModalCloseBtn');
  const ytUrlInput = document.getElementById('ytUrlInput');
  const ytPasteBtn = document.getElementById('ytPasteBtn');
  const ytPlayNowBtn = document.getElementById('ytPlayNowBtn');
  const ytAddQueueBtn = document.getElementById('ytAddQueueBtn');
  const ytStatusMsg = document.getElementById('ytStatusMsg');

  function extractYoutubeId(input) {
    if (!input || typeof input !== 'string') return null;
    const str = input.trim();
    // Match standard watch?v=, youtu.be/, shorts/, embed/, live/, music.youtube.com
    const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts|live)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = str.match(regExp);
    if (match && match[1]) return match[1];
    // Or if the user pasted a raw 11-char video ID directly in the modal
    if (/^[a-zA-Z0-9_-]{11}$/.test(str)) return str;
    return null;
  }

  function showYtStatus(msg, isError = false) {
    if (!ytStatusMsg) return;
    ytStatusMsg.textContent = msg;
    ytStatusMsg.style.color = isError ? '#f87171' : '#38bdf8';
    ytStatusMsg.classList.remove('hidden');
  }

  function openYoutubeModal(prefillUrl = '') {
    if (!youtubeModal) return;
    youtubeModal.classList.remove('hidden');
    if (ytStatusMsg) ytStatusMsg.classList.add('hidden');
    if (ytUrlInput) {
      ytUrlInput.value = prefillUrl || '';
      setTimeout(() => ytUrlInput.focus(), 60);
    }
    // Pre-warm YouTube IFrame API in the background
    if (navigator.onLine) {
      engine.initYoutubePlayer().catch(() => {});
    }
  }

  function closeYoutubeModal() {
    if (!youtubeModal) return;
    youtubeModal.classList.add('hidden');
  }

  async function fetchYoutubeMetadata(videoId) {
    const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const defaultMeta = {
      title: `YouTube Track (${videoId})`,
      artist: 'YouTube',
      thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
    };
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(watchUrl)}`, {
        signal: controller.signal
      });
      clearTimeout(timer);
      if (res.ok) {
        const data = await res.json();
        if (data && data.title) {
          return {
            title: data.title,
            artist: data.author_name || 'YouTube',
            thumbnail: data.thumbnail_url || defaultMeta.thumbnail
          };
        }
      }
    } catch (e) {}
    return defaultMeta;
  }

  async function addYoutubeUrl(rawUrl, playImmediately = true) {
    const videoId = extractYoutubeId(rawUrl);
    if (!videoId) {
      showYtStatus('❌ ลิงก์ YouTube ไม่ถูกต้อง กรุณาวางลิงก์เช่น https://youtu.be/... หรือ https://www.youtube.com/watch?v=...', true);
      showToast('❌ ลิงก์ YouTube ไม่ถูกต้อง');
      return false;
    }

    const trackObj = {
      id: `yt_${videoId}_${Date.now()}`,
      title: `▶️ YouTube (${videoId})`,
      artist: 'YouTube',
      album: 'YouTube Stream',
      duration: 0,
      bitrate: 192,
      sampleRate: 44100,
      channels: 2,
      youtubeId: videoId,
      youtubeUrl: `https://www.youtube.com/watch?v=${videoId}`,
      thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      order: state.playlist.length
    };

    state.playlist.push(trackObj);
    const newIdx = state.playlist.length - 1;
    renderPlaylist();
    closeYoutubeModal();

    // Trigger playback synchronously inside user click gesture BEFORE async metadata fetch!
    if (playImmediately || state.currentIndex === -1) {
      playTrackIndex(newIdx);
    }

    // Fetch real title & channel name in background and update playlist & cassette label
    fetchYoutubeMetadata(videoId).then(async (meta) => {
      if (meta && meta.title) {
        trackObj.title = `▶️ ${meta.title}`;
        trackObj.artist = meta.artist || 'YouTube';
        trackObj.thumbnail = meta.thumbnail || trackObj.thumbnail;
      }
      await window.winampDB.saveTrack(trackObj);
      renderPlaylist();
      if (state.currentIndex === newIdx) {
        updateCassetteLabel(trackObj);
        updateMediaSession(trackObj);
        titleMarquee.textContent = `${newIdx + 1}. ${trackObj.artist ? `${trackObj.artist} - ` : ''}${trackObj.title}`;
        if (typeof drawIpodCoverArt === 'function') drawIpodCoverArt();
        if (typeof updateIpodUI === 'function') updateIpodUI();
        if (typeof drawIpcCoverArt === 'function') drawIpcCoverArt();
        if (typeof updateIpcUI === 'function') updateIpcUI();
        if (typeof renderIpcCoverFlow === 'function') renderIpcCoverFlow();
      }
      showToast(`▶️ ${trackObj.title}`);
    }).catch(() => {
      window.winampDB.saveTrack(trackObj).catch(() => {});
    });

    return true;
  }

  if (ytModalCloseBtn) ytModalCloseBtn.addEventListener('click', closeYoutubeModal);
  if (youtubeModal) {
    youtubeModal.addEventListener('click', (e) => {
      if (e.target === youtubeModal) closeYoutubeModal();
    });
  }

  if (ytPasteBtn && ytUrlInput) {
    ytPasteBtn.addEventListener('click', async () => {
      try {
        const text = await navigator.clipboard.readText();
        if (text) {
          ytUrlInput.value = text.trim();
          showYtStatus('📋 วางลิงก์จากคลิปบอร์ดแล้ว กด "เล่นทันที" ได้เลย');
        }
      } catch (err) {
        ytUrlInput.focus();
        showYtStatus('กรุณากดค้างในช่องแล้วเลือก "วาง (Paste)"', true);
      }
    });
  }

  if (ytPlayNowBtn && ytUrlInput) {
    ytPlayNowBtn.addEventListener('click', () => {
      addYoutubeUrl(ytUrlInput.value, true);
    });
  }

  if (ytAddQueueBtn && ytUrlInput) {
    ytAddQueueBtn.addEventListener('click', () => {
      addYoutubeUrl(ytUrlInput.value, false);
    });
  }

  if (ytUrlInput) {
    ytUrlInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        addYoutubeUrl(ytUrlInput.value, true);
      } else if (e.key === 'Escape') {
        closeYoutubeModal();
      }
    });
  }

  // Global Paste Listener: Paste a YouTube link anywhere on the app to play immediately!
  window.addEventListener('paste', (e) => {
    if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
    const pastedText = (e.clipboardData || window.clipboardData)?.getData('text');
    if (pastedText && extractYoutubeId(pastedText)) {
      e.preventDefault();
      addYoutubeUrl(pastedText, true);
    }
  });

  if (btnKeyboardHelp) btnKeyboardHelp.addEventListener('click', () => helpModal.classList.remove('hidden'));
  if (btnAbout) btnAbout.addEventListener('click', () => helpModal.classList.remove('hidden'));
  modalCloseBtn.addEventListener('click', () => helpModal.classList.add('hidden'));
  helpModal.addEventListener('click', (e) => {
    if (e.target === helpModal) helpModal.classList.add('hidden');
  });

  window.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    switch (e.key.toUpperCase()) {
      case 'Y':
        e.preventDefault();
        openYoutubeModal();
        break;
      case 'Z':
        btnPrev.click();
        break;
      case 'X':
        btnPlay.click();
        break;
      case 'C':
        btnPause.click();
        break;
      case 'V':
        btnStop.click();
        break;
      case 'B':
        btnNext.click();
        break;
      case 'L':
        btnEject.click();
        break;
      case 'S':
        btnShuffle.click();
        break;
      case 'R':
        btnRepeat.click();
        break;
      case 'T':
        if (e.altKey) {
          e.preventDefault();
          switchSkin(document.body.classList.contains('skin-cassette') ? 'skin-midnight' : 'skin-cassette');
        }
        break;
      case 'W':
        if (e.altKey) {
          e.preventDefault();
          openWalkmanModal();
        }
        break;
      case 'I':
        if (e.altKey) {
          e.preventDefault();
          switchSkin(document.body.classList.contains('skin-ipod') ? (state.lastWinampSkin || 'skin-midnight') : 'skin-ipod');
        }
        break;
      case ' ':
        e.preventDefault();
        btnPause.click();
        break;
      case 'ARROWUP':
        e.preventDefault();
        updateVolumeUI(Math.min(1, state.volume + 0.05));
        break;
      case 'ARROWDOWN':
        e.preventDefault();
        updateVolumeUI(Math.max(0, state.volume - 0.05));
        break;
      case 'ARROWLEFT':
        e.preventDefault();
        if (engine.getDuration()) {
          engine.seek(Math.max(0, engine.getCurrentTime() - 5));
        }
        break;
      case 'ARROWRIGHT':
        e.preventDefault();
        if (engine.getDuration()) {
          engine.seek(Math.min(engine.getDuration(), engine.getCurrentTime() + 5));
        }
        break;
      case 'DELETE':
        document.getElementById('menuRemSelected').click();
        break;
    }
  });

  // =========================================================================
  // 7. APPLE iPOD TOUCH SKIN CONTROLLER (iOS 4 / iPod OS Skeuomorphic UI/UX)
  // =========================================================================
  const ipodState = {
    activeView: 'nowplaying', // 'nowplaying', 'songs', 'eq', 'home'
    isFlipped: false,
    isLocked: false,
    searchQuery: '',
    customCoverUrl: '',
    customCoverImg: null,
    ytCoverCache: {},
    lastDrawnKey: ''
  };

  const ipodStatusTime = document.getElementById('ipodStatusTime');
  const ipodStatusPlay = document.getElementById('ipodStatusPlay');
  const ipodNavbar = document.getElementById('ipodNavbar');
  const ipodNavLeftBtn = document.getElementById('ipodNavLeftBtn');
  const ipodNavLeftLabel = document.getElementById('ipodNavLeftLabel');
  const ipodNavTrackInfo = document.getElementById('ipodNavTrackInfo');
  const ipodNavArtist = document.getElementById('ipodNavArtist');
  const ipodNavTitle = document.getElementById('ipodNavTitle');
  const ipodNavAlbum = document.getElementById('ipodNavAlbum');
  const ipodNavViewTitle = document.getElementById('ipodNavViewTitle');
  const ipodNavRightBtn = document.getElementById('ipodNavRightBtn');

  const ipodRepeatBtn = document.getElementById('ipodRepeatBtn');
  const ipodShuffleBtn = document.getElementById('ipodShuffleBtn');
  const ipodTrackCount = document.getElementById('ipodTrackCount');
  const ipodSeekTrack = document.getElementById('ipodSeekTrack');
  const ipodSeekFill = document.getElementById('ipodSeekFill');
  const ipodSeekThumb = document.getElementById('ipodSeekThumb');
  const ipodScrubberBar = document.getElementById('ipodScrubberBar');

  const ipodFlipCard = document.getElementById('ipodFlipCard');
  const ipodCoverFront = document.getElementById('ipodCoverFront');
  const ipodArtworkCanvas = document.getElementById('ipodArtworkCanvas');
  const ipodReflectCanvas = document.getElementById('ipodReflectCanvas');
  const ipodBackThumbCanvas = document.getElementById('ipodBackThumbCanvas');
  const ipodLockCoverCanvas = document.getElementById('ipodLockCoverCanvas');
  const ipodBackTitle = document.getElementById('ipodBackTitle');
  const ipodBackArtist = document.getElementById('ipodBackArtist');
  const ipodBackTracklist = document.getElementById('ipodBackTracklist');
  const ipodStarRating = document.getElementById('ipodStarRating');
  const ipodBtnCustomCover = document.getElementById('ipodBtnCustomCover');
  const ipodCoverInput = document.getElementById('ipodCoverInput');

  const ipodPrevBtn = document.getElementById('ipodPrevBtn');
  const ipodPlayPauseBtn = document.getElementById('ipodPlayPauseBtn');
  const ipodPlaySvg = document.getElementById('ipodPlaySvg');
  const ipodPauseSvg = document.getElementById('ipodPauseSvg');
  const ipodNextBtn = document.getElementById('ipodNextBtn');
  const ipodVolTrack = document.getElementById('ipodVolTrack');

  const ipodSearchInput = document.getElementById('ipodSearchInput');
  const ipodBtnAddMp3 = document.getElementById('ipodBtnAddMp3');
  const ipodBtnAddYt = document.getElementById('ipodBtnAddYt');
  const ipodBtnLoadDemo = document.getElementById('ipodBtnLoadDemo');
  const ipodBtnClearPl = document.getElementById('ipodBtnClearPl');
  const ipodSongsList = document.getElementById('ipodSongsList');
  const ipodSongsFooter = document.getElementById('ipodSongsFooter');

  const ipodEqToggleBtn = document.getElementById('ipodEqToggleBtn');
  const ipodEqResetBtn = document.getElementById('ipodEqResetBtn');
  const ipodEqCanvas = document.getElementById('ipodEqCanvas');
  const ipodEqSliders = document.getElementById('ipodEqSliders');
  const ipodEqPresetList = document.getElementById('ipodEqPresetList');

  const ipodSleepBtn = document.getElementById('ipodSleepBtn');
  const ipodLockOverlay = document.getElementById('ipodLockOverlay');
  const ipodLockTime = document.getElementById('ipodLockTime');
  const ipodLockDate = document.getElementById('ipodLockDate');
  const ipodLockSong = document.getElementById('ipodLockSong');
  const ipodLockArtist = document.getElementById('ipodLockArtist');
  const ipodLockPrev = document.getElementById('ipodLockPrev');
  const ipodLockPlay = document.getElementById('ipodLockPlay');
  const ipodLockNext = document.getElementById('ipodLockNext');
  const ipodUnlockTrack = document.getElementById('ipodUnlockTrack');
  const ipodUnlockThumb = document.getElementById('ipodUnlockThumb');
  const ipodHomeBtn = document.getElementById('ipodHomeBtn');

  function updateIpodClock() {
    const now = new Date();
    let hrs = now.getHours();
    const mins = String(now.getMinutes()).padStart(2, '0');
    const ampm = hrs >= 12 ? 'PM' : 'AM';
    hrs = hrs % 12 || 12;
    if (ipodStatusTime) ipodStatusTime.textContent = `${hrs}:${mins} ${ampm}`;
    if (ipodLockTime) ipodLockTime.textContent = `${hrs}:${mins}`;
    if (ipodLockDate) {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      ipodLockDate.textContent = `${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}`;
    }
  }

  function switchIpodView(viewName) {
    if (viewName === 'youtube') {
      openYoutubeModal();
      return;
    }
    ipodState.activeView = viewName;

    document.querySelectorAll('#ipodViewport .ipod-view').forEach(v => {
      v.classList.toggle('active', v.getAttribute('data-view') === viewName);
    });

    document.querySelectorAll('#ipodTabBar .ipod-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-ipod-tab') === viewName);
    });

    const isLightNavbar = (viewName === 'songs' || viewName === 'eq');
    if (ipodNavbar) {
      ipodNavbar.classList.toggle('navbar-light', isLightNavbar);
    }

    if (viewName === 'nowplaying') {
      if (ipodNavTrackInfo) ipodNavTrackInfo.classList.remove('hidden');
      if (ipodNavViewTitle) ipodNavViewTitle.classList.add('hidden');
      if (ipodNavLeftLabel) ipodNavLeftLabel.textContent = 'Songs';
      if (ipodNavRightBtn) ipodNavRightBtn.style.visibility = 'visible';
    } else {
      if (ipodNavTrackInfo) ipodNavTrackInfo.classList.add('hidden');
      if (ipodNavViewTitle) {
        ipodNavViewTitle.classList.remove('hidden');
        const titles = {
          songs: 'Songs',
          eq: 'Equalizer',
          home: 'iPod touch'
        };
        ipodNavViewTitle.textContent = titles[viewName] || 'iPod';
      }
      if (ipodNavLeftLabel) ipodNavLeftLabel.textContent = 'Now Playing';
      if (ipodNavRightBtn) ipodNavRightBtn.style.visibility = (viewName === 'songs') ? 'visible' : 'hidden';
    }

    if (viewName === 'songs') renderIpodSongs();
    if (viewName === 'eq') updateIpodEQ();
  }

  function toggleIpodCoverFlip(forceState) {
    ipodState.isFlipped = (typeof forceState === 'boolean') ? forceState : !ipodState.isFlipped;
    if (ipodFlipCard) {
      ipodFlipCard.classList.toggle('flipped', ipodState.isFlipped);
    }
    if (ipodState.isFlipped) {
      renderIpodBackTracklist();
    }
  }

  function applyIpodCustomCover(dataUrl, notify = true) {
    ipodState.customCoverUrl = dataUrl || '';
    ipodState.lastDrawnKey = '';
    if (dataUrl) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        ipodState.customCoverImg = img;
        drawIpodCoverArt(true);
        if (notify) showToast('📷 เปลี่ยนรูปปกอัลบั้มบน iPod touch เรียบร้อย!');
      };
      img.src = dataUrl;
      window.winampDB.setSetting('ipod_custom_cover', dataUrl);
    } else {
      ipodState.customCoverImg = null;
      window.winampDB.setSetting('ipod_custom_cover', '');
      drawIpodCoverArt(true);
      if (notify) showToast('🔄 ใช้รูปปกอัลบั้มอัตโนมัติตามเพลง');
    }
  }

  function copyCanvasToReflectionAndThumbs(srcCanvas) {
    if (!srcCanvas) return;
    if (ipodReflectCanvas) {
      const rCtx = ipodReflectCanvas.getContext('2d');
      rCtx.clearRect(0, 0, ipodReflectCanvas.width, ipodReflectCanvas.height);
      rCtx.drawImage(
        srcCanvas,
        0, srcCanvas.height - 90, srcCanvas.width, 90,
        0, 0, ipodReflectCanvas.width, ipodReflectCanvas.height
      );
    }
    if (ipodBackThumbCanvas) {
      const bCtx = ipodBackThumbCanvas.getContext('2d');
      bCtx.clearRect(0, 0, ipodBackThumbCanvas.width, ipodBackThumbCanvas.height);
      bCtx.drawImage(srcCanvas, 0, 0, ipodBackThumbCanvas.width, ipodBackThumbCanvas.height);
    }
    if (ipodLockCoverCanvas) {
      const lCtx = ipodLockCoverCanvas.getContext('2d');
      lCtx.clearRect(0, 0, ipodLockCoverCanvas.width, ipodLockCoverCanvas.height);
      lCtx.drawImage(srcCanvas, 0, 0, ipodLockCoverCanvas.width, ipodLockCoverCanvas.height);
    }
  }

  function drawIpodCoverArt(force = false) {
    if (!ipodArtworkCanvas) return;
    const track = (state.currentIndex >= 0 && state.playlist[state.currentIndex]) ? state.playlist[state.currentIndex] : null;
    const key = `${ipodState.customCoverUrl ? 'custom' : 'auto'}_${track ? track.id + '_' + track.title : 'empty'}`;
    if (!force && ipodState.lastDrawnKey === key) return;
    ipodState.lastDrawnKey = key;

    const ctx = ipodArtworkCanvas.getContext('2d');
    const W = ipodArtworkCanvas.width;
    const H = ipodArtworkCanvas.height;

    // 1. If user uploaded custom cover photo, draw it center-cropped
    if (ipodState.customCoverImg && ipodState.customCoverImg.complete && ipodState.customCoverImg.naturalWidth > 0) {
      const img = ipodState.customCoverImg;
      const scale = Math.max(W / img.naturalWidth, H / img.naturalHeight);
      const dw = img.naturalWidth * scale;
      const dh = img.naturalHeight * scale;
      ctx.clearRect(0, 0, W, H);
      ctx.drawImage(img, (W - dw) / 2, (H - dh) / 2, dw, dh);
      copyCanvasToReflectionAndThumbs(ipodArtworkCanvas);
      return;
    }

    // 2. If playing a YouTube track with thumbnail, load & draw it (with procedural fallback)
    if (track && track.thumbnail && navigator.onLine) {
      const cached = ipodState.ytCoverCache[track.thumbnail];
      if (cached && cached.complete && cached.naturalWidth > 0) {
        const scale = Math.max(W / cached.naturalWidth, H / cached.naturalHeight);
        const dw = cached.naturalWidth * scale;
        const dh = cached.naturalHeight * scale;
        ctx.clearRect(0, 0, W, H);
        ctx.drawImage(cached, (W - dw) / 2, (H - dh) / 2, dw, dh);
        copyCanvasToReflectionAndThumbs(ipodArtworkCanvas);
        return;
      } else if (!cached) {
        const ytImg = new Image();
        ytImg.crossOrigin = 'anonymous';
        ipodState.ytCoverCache[track.thumbnail] = ytImg;
        ytImg.onload = () => {
          ipodState.lastDrawnKey = '';
          drawIpodCoverArt(true);
        };
        ytImg.src = track.thumbnail;
      }
    }

    // 3. Procedural High-Resolution Album Artwork per Song
    const palettes = [
      ['#0f172a', '#1d4ed8', '#38bdf8', '#fde047'],
      ['#1e1b4b', '#6d28d9', '#ec4899', '#f43f5e'],
      ['#064e3b', '#059669', '#34d399', '#a7f3d0'],
      ['#451a03', '#d97706', '#f59e0b', '#fef08a'],
      ['#31102f', '#9d174d', '#f472b6', '#fbcfe8'],
      ['#090d16', '#0284c7', '#22d3ee', '#ffffff']
    ];
    const hash = track ? (track.title || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0) : 0;
    const pal = palettes[hash % palettes.length];

    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, pal[0]);
    grad.addColorStop(0.55, pal[1]);
    grad.addColorStop(1, pal[2]);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Subtle geometric studio glow & vinyl record grooves
    ctx.save();
    ctx.translate(W / 2, H / 2 - 14);
    ctx.beginPath();
    ctx.arc(0, 0, 108, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(8, 10, 16, 0.88)';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
    ctx.stroke();

    for (let r = 46; r <= 98; r += 8) {
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Center vinyl label
    ctx.beginPath();
    ctx.arc(0, 0, 34, 0, Math.PI * 2);
    ctx.fillStyle = pal[2];
    ctx.fill();

    ctx.beginPath();
    ctx.arc(0, 0, 8, 0, Math.PI * 2);
    ctx.fillStyle = '#090d16';
    ctx.fill();

    // Musical note icon in center
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px -apple-system, Helvetica, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('♪', -18, -12);
    ctx.restore();

    // Bottom album typography banner
    const bannerGrad = ctx.createLinearGradient(0, H - 105, 0, H);
    bannerGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    bannerGrad.addColorStop(0.35, 'rgba(5, 8, 15, 0.78)');
    bannerGrad.addColorStop(1, 'rgba(5, 8, 15, 0.95)');
    ctx.fillStyle = bannerGrad;
    ctx.fillRect(0, H - 105, W, 105);

    const titleStr = track ? (track.title || 'Unknown Title').replace(/^▶️\s*/, '') : 'iPod touch';
    const artistStr = track ? (track.artist || 'Winamp Audio') : 'Select a Song to Play';
    const albumStr = track ? (track.album || 'iPod Digital Audio') : 'Apple iOS Retro Edition';

    ctx.fillStyle = '#ffffff';
    ctx.font = '800 20px -apple-system, "Helvetica Neue", Helvetica, Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(titleStr.slice(0, 26), 18, H - 52);

    ctx.fillStyle = pal[3];
    ctx.font = '700 14px -apple-system, "Helvetica Neue", Helvetica, Arial, sans-serif';
    ctx.fillText(artistStr.slice(0, 32), 18, H - 30);

    ctx.fillStyle = 'rgba(226, 232, 240, 0.75)';
    ctx.font = '600 11.5px -apple-system, "Helvetica Neue", Helvetica, Arial, sans-serif';
    ctx.fillText(albumStr.slice(0, 36), 18, H - 13);

    copyCanvasToReflectionAndThumbs(ipodArtworkCanvas);
  }

  function renderIpodBackTracklist() {
    if (!ipodBackTracklist) return;
    const curTrack = (state.currentIndex >= 0 && state.playlist[state.currentIndex]) ? state.playlist[state.currentIndex] : null;
    if (ipodBackTitle) ipodBackTitle.textContent = curTrack ? curTrack.title : 'No Song Loaded';
    if (ipodBackArtist) ipodBackArtist.textContent = curTrack ? (curTrack.artist || 'Unknown Artist') : 'iPod touch';

    ipodBackTracklist.innerHTML = '';
    state.playlist.forEach((t, idx) => {
      const row = document.createElement('div');
      const isCur = idx === state.currentIndex;
      row.className = `ipod-back-row ${isCur ? 'active' : ''}`;
      row.innerHTML = `
        <span class="ipod-back-row-num">${isCur ? '🔊' : (idx + 1) + '.'}</span>
        <span class="ipod-back-row-title">${t.title}</span>
        <span class="ipod-back-row-time">${AudioMetadataParser.formatTime(t.duration)}</span>
      `;
      row.addEventListener('click', (e) => {
        e.stopPropagation();
        playTrackIndex(idx);
      });
      ipodBackTracklist.appendChild(row);
    });
  }

  function renderIpodSongs() {
    if (!ipodSongsList) return;
    const q = (ipodState.searchQuery || '').trim().toLowerCase();
    ipodSongsList.innerHTML = '';

    let visibleCount = 0;
    state.playlist.forEach((track, idx) => {
      const text = `${track.title || ''} ${track.artist || ''} ${track.album || ''}`.toLowerCase();
      if (q && !text.includes(q)) return;
      visibleCount++;

      const isCurrent = idx === state.currentIndex;
      const row = document.createElement('div');
      row.className = `ipod-song-row ${isCurrent ? 'active' : ''}`;

      const durStr = AudioMetadataParser.formatTime(track.duration);
      const subStr = `${track.artist || 'Unknown Artist'}${track.album ? ' • ' + track.album : ''}`;

      row.innerHTML = `
        <div class="ipod-song-left">
          <span class="ipod-song-num">${isCurrent ? '🔊' : (idx + 1)}</span>
          <div class="ipod-song-meta">
            <div class="ipod-song-title">${track.title}</div>
            <div class="ipod-song-sub">${subStr}</div>
          </div>
        </div>
        <div class="ipod-song-right">
          <span class="ipod-song-dur">${durStr}</span>
          <button class="ipod-song-del" title="Remove Song">✕</button>
        </div>
      `;

      row.addEventListener('click', (e) => {
        if (e.target.closest('.ipod-song-del')) return;
        playTrackIndex(idx);
      });

      const delBtn = row.querySelector('.ipod-song-del');
      if (delBtn) {
        delBtn.addEventListener('click', async (e) => {
          e.stopPropagation();
          const removed = state.playlist[idx];
          if (removed && removed.id) {
            await window.winampDB.deleteTrack(removed.id);
          }
          state.playlist.splice(idx, 1);
          if (state.currentIndex >= state.playlist.length) {
            state.currentIndex = state.playlist.length - 1;
          }
          await window.winampDB.updateOrder(state.playlist);
          renderPlaylist();
          showToast('🗑 ลบเพลงออกจากเพลย์ลิสต์แล้ว');
        });
      }

      ipodSongsList.appendChild(row);
    });

    if (visibleCount === 0) {
      ipodSongsList.innerHTML = `<div style="padding:28px 16px;text-align:center;color:#64748b;font-size:12px;font-weight:600;">No songs found.<br><span style="font-size:10.5px;font-weight:400;">Tap <b>+ MP3</b>, <b>▶️ YouTube</b>, or <b>🎵 Demo</b> above to add music.</span></div>`;
    }

    if (ipodSongsFooter) {
      ipodSongsFooter.textContent = `${state.playlist.length} Song${state.playlist.length === 1 ? '' : 's'}`;
    }
    renderIpodBackTracklist();
  }

  function updateIpodEQ() {
    if (ipodEqToggleBtn) {
      ipodEqToggleBtn.classList.toggle('active', state.eqEnabled);
    }

    // Update 11 vertical sliders in iPod EQ view
    if (ipodEqSliders) {
      ipodEqSliders.querySelectorAll('.ipod-eq-col').forEach(col => {
        const bandAttr = col.getAttribute('data-ipod-band');
        const knob = col.querySelector('.ipod-eq-knob');
        if (!knob) return;
        const dbVal = (bandAttr === 'preamp') ? (state.preamp || 0) : (state.bands[parseInt(bandAttr, 10)] || 0);
        const ratio = Math.max(0, Math.min(1, (dbVal / 24) + 0.5));
        knob.style.bottom = `${ratio * 100}%`;
      });
    }

    // Draw live EQ curve on #ipodEqCanvas
    if (ipodEqCanvas) {
      const ctx = ipodEqCanvas.getContext('2d');
      const W = ipodEqCanvas.width;
      const H = ipodEqCanvas.height;
      ctx.clearRect(0, 0, W, H);

      ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, H / 2);
      ctx.lineTo(W, H / 2);
      ctx.stroke();

      ctx.strokeStyle = state.eqEnabled ? '#38bdf8' : '#64748b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      const pts = state.bands.map((gain, i) => ({
        x: (i / (state.bands.length - 1)) * (W - 16) + 8,
        y: (H / 2) - ((state.eqEnabled ? gain : 0) / 12) * (H / 2 - 5)
      }));
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 0; i < pts.length - 1; i++) {
        const xc = (pts[i].x + pts[i + 1].x) / 2;
        const yc = (pts[i].y + pts[i + 1].y) / 2;
        ctx.quadraticCurveTo(pts[i].x, pts[i].y, xc, yc);
      }
      ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
      ctx.stroke();
    }

    // Highlight matching preset row if any
    if (ipodEqPresetList && engine.presets) {
      ipodEqPresetList.querySelectorAll('.ipod-preset-row').forEach(row => {
        const key = row.getAttribute('data-ipod-preset');
        const pVals = engine.presets[key];
        const isMatch = pVals && pVals.every((v, idx) => Math.abs(v - (state.bands[idx] || 0)) < 0.4);
        row.classList.toggle('active', Boolean(isMatch));
      });
    }
  }

  function updateIpodUI() {
    const track = (state.currentIndex >= 0 && state.playlist[state.currentIndex]) ? state.playlist[state.currentIndex] : null;

    if (ipodNavArtist) ipodNavArtist.textContent = track ? (track.artist || 'Winamp') : 'Apple iPod';
    if (ipodNavTitle) ipodNavTitle.textContent = track ? track.title : 'No Song Playing';
    if (ipodNavAlbum) ipodNavAlbum.textContent = track ? (track.album || 'iPod touch') : 'Select a Song';

    if (ipodLockSong) ipodLockSong.textContent = track ? track.title : 'No Song Playing';
    if (ipodLockArtist) ipodLockArtist.textContent = track ? (track.artist || 'iPod touch') : 'iPod touch';

    if (ipodTrackCount) {
      const total = state.playlist.length;
      const cur = total > 0 ? Math.max(1, state.currentIndex + 1) : 0;
      ipodTrackCount.textContent = `${cur} of ${total}`;
    }

    if (ipodStatusPlay) {
      ipodStatusPlay.classList.toggle('active', state.isPlaying);
    }

    if (ipodPlaySvg && ipodPauseSvg) {
      ipodPlaySvg.classList.toggle('hidden', state.isPlaying);
      ipodPauseSvg.classList.toggle('hidden', !state.isPlaying);
    }

    if (ipodRepeatBtn) {
      ipodRepeatBtn.classList.toggle('active', state.repeat !== 'off');
    }
    if (ipodShuffleBtn) {
      ipodShuffleBtn.classList.toggle('active', Boolean(state.shuffle));
    }

    drawIpodCoverArt();
    renderIpodBackTracklist();
  }

  function setupIpodControls() {
    updateIpodClock();
    setInterval(updateIpodClock, 10000);

    // Top Navigation Bar Left & Right Buttons
    if (ipodNavLeftBtn) {
      ipodNavLeftBtn.addEventListener('click', () => {
        if (ipodState.activeView === 'nowplaying') {
          switchIpodView('songs');
        } else {
          switchIpodView('nowplaying');
        }
      });
    }

    if (ipodNavRightBtn) {
      ipodNavRightBtn.addEventListener('click', () => {
        if (ipodState.activeView === 'nowplaying') {
          toggleIpodCoverFlip();
        } else if (ipodState.activeView === 'songs') {
          fileInput.click();
        }
      });
    }

    // Physical Concave Home Button
    if (ipodHomeBtn) {
      ipodHomeBtn.addEventListener('click', () => {
        engine.playMechanicalSound('click');
        if (ipodLockOverlay && !ipodLockOverlay.classList.contains('hidden')) {
          ipodLockOverlay.classList.add('hidden');
          ipodState.isLocked = false;
          return;
        }
        if (ipodState.activeView === 'nowplaying') {
          if (ipodState.isFlipped) {
            toggleIpodCoverFlip(false);
          } else {
            switchIpodView('home');
          }
        } else if (ipodState.activeView === 'home') {
          switchIpodView('nowplaying');
        } else {
          switchIpodView('nowplaying');
        }
      });
    }

    // Bottom iOS Tab Bar
    document.querySelectorAll('#ipodTabBar .ipod-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-ipod-tab');
        if (tab) switchIpodView(tab);
      });
    });

    // SpringBoard Home Screen App Icons
    document.querySelectorAll('[data-ipod-app]').forEach(appBtn => {
      appBtn.addEventListener('click', () => {
        const app = appBtn.getAttribute('data-ipod-app');
        if (app === 'nowplaying' || app === 'songs' || app === 'eq') {
          switchIpodView(app);
        } else if (app === 'youtube') {
          openYoutubeModal();
        } else if (app === 'addmp3') {
          fileInput.click();
        } else if (app === 'coverart') {
          if (ipodCoverInput) {
            ipodCoverInput.value = '';
            ipodCoverInput.click();
          }
        } else if (app === 'resetcover') {
          applyIpodCustomCover('', true);
        } else if (app === 'lock') {
          if (ipodLockOverlay) {
            ipodLockOverlay.classList.remove('hidden');
            ipodState.isLocked = true;
            updateIpodClock();
          }
        } else if (app && app.startsWith('skin-')) {
          switchSkin(app);
        }
      });
    });

    // Album Cover Front Click / Double-Click to Flip
    if (ipodCoverFront) {
      let lastTap = 0;
      ipodCoverFront.addEventListener('click', () => {
        const now = Date.now();
        if (now - lastTap < 320) {
          toggleIpodCoverFlip();
        } else if (ipodScrubberBar) {
          ipodScrubberBar.classList.toggle('autohide');
        }
        lastTap = now;
      });
    }

    // Star Rating on Back of Album Cover
    if (ipodStarRating) {
      ipodStarRating.querySelectorAll('.ipod-star').forEach(star => {
        star.addEventListener('click', (e) => {
          e.stopPropagation();
          const rating = parseInt(star.getAttribute('data-star'), 10) || 5;
          ipodStarRating.querySelectorAll('.ipod-star').forEach(s => {
            const val = parseInt(s.getAttribute('data-star'), 10) || 1;
            s.classList.toggle('active', val <= rating);
          });
          showToast(`Rated ${'★'.repeat(rating)}`);
        });
      });
    }

    // Custom Cover Upload Button
    if (ipodBtnCustomCover && ipodCoverInput) {
      ipodBtnCustomCover.addEventListener('click', (e) => {
        e.stopPropagation();
        ipodCoverInput.value = '';
        ipodCoverInput.click();
      });
    }
    if (ipodCoverInput) {
      ipodCoverInput.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
          applyIpodCustomCover(evt.target.result, true);
        };
        reader.readAsDataURL(file);
      });
    }

    // Repeat & Shuffle Sub-buttons
    if (ipodRepeatBtn) {
      ipodRepeatBtn.addEventListener('click', () => btnRepeat.click());
    }
    if (ipodShuffleBtn) {
      ipodShuffleBtn.addEventListener('click', () => btnShuffle.click());
    }

    // Transport Controls (Play/Pause, Prev, Next)
    if (ipodPlayPauseBtn) {
      ipodPlayPauseBtn.addEventListener('click', () => {
        if (state.isPlaying) {
          btnPause.click();
        } else {
          btnPlay.click();
        }
      });
    }
    if (ipodPrevBtn) {
      ipodPrevBtn.addEventListener('click', () => btnPrev.click());
    }
    if (ipodNextBtn) {
      ipodNextBtn.addEventListener('click', () => btnNext.click());
    }

    // Interactive Scrubber Bar (Mouse + Touch)
    if (ipodSeekTrack) {
      const scrubToClientX = (clientX, commitSeek = false) => {
        const dur = engine.getDuration();
        if (!dur) return;
        const rect = ipodSeekTrack.getBoundingClientRect();
        const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        const target = ratio * dur;
        if (ipodSeekFill) ipodSeekFill.style.width = `${ratio * 100}%`;
        if (ipodSeekThumb) ipodSeekThumb.style.left = `${ratio * 100}%`;
        updateTimerDisplay(target, dur);
        if (commitSeek) engine.seek(target);
      };

      ipodSeekTrack.addEventListener('mousedown', (e) => {
        if (!engine.getDuration()) return;
        state.isDraggingSeek = true;
        scrubToClientX(e.clientX, false);
        const onMove = (ev) => scrubToClientX(ev.clientX, false);
        const onUp = (ev) => {
          state.isDraggingSeek = false;
          scrubToClientX(ev.clientX, true);
          document.removeEventListener('mousemove', onMove);
          document.removeEventListener('mouseup', onUp);
        };
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
      });

      ipodSeekTrack.addEventListener('touchstart', (e) => {
        if (!engine.getDuration() || !e.touches[0]) return;
        e.preventDefault();
        state.isDraggingSeek = true;
        scrubToClientX(e.touches[0].clientX, false);
        const onTouchMove = (ev) => {
          if (ev.touches[0]) scrubToClientX(ev.touches[0].clientX, false);
        };
        const onTouchEnd = (ev) => {
          state.isDraggingSeek = false;
          const touch = (ev.changedTouches && ev.changedTouches[0]) || null;
          if (touch) scrubToClientX(touch.clientX, true);
          document.removeEventListener('touchmove', onTouchMove);
          document.removeEventListener('touchend', onTouchEnd);
        };
        document.addEventListener('touchmove', onTouchMove, { passive: false });
        document.addEventListener('touchend', onTouchEnd);
      }, { passive: false });
    }

    // Interactive iOS Brushed-Aluminum Volume Slider (Mouse + Touch)
    if (ipodVolTrack) {
      const setVolFromClientX = (clientX) => {
        const rect = ipodVolTrack.getBoundingClientRect();
        const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        updateVolumeUI(ratio);
      };

      ipodVolTrack.addEventListener('mousedown', (e) => {
        setVolFromClientX(e.clientX);
        const onMove = (ev) => setVolFromClientX(ev.clientX);
        const onUp = () => {
          document.removeEventListener('mousemove', onMove);
          document.removeEventListener('mouseup', onUp);
        };
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
      });

      ipodVolTrack.addEventListener('touchstart', (e) => {
        if (!e.touches[0]) return;
        e.preventDefault();
        setVolFromClientX(e.touches[0].clientX);
        const onTouchMove = (ev) => {
          if (ev.touches[0]) setVolFromClientX(ev.touches[0].clientX);
        };
        const onTouchEnd = () => {
          document.removeEventListener('touchmove', onTouchMove);
          document.removeEventListener('touchend', onTouchEnd);
        };
        document.addEventListener('touchmove', onTouchMove, { passive: false });
        document.addEventListener('touchend', onTouchEnd);
      }, { passive: false });
    }

    // Songs View Search & Action Buttons
    if (ipodSearchInput) {
      ipodSearchInput.addEventListener('input', (e) => {
        ipodState.searchQuery = e.target.value || '';
        renderIpodSongs();
      });
    }
    if (ipodBtnAddMp3) ipodBtnAddMp3.addEventListener('click', () => fileInput.click());
    if (ipodBtnAddYt) ipodBtnAddYt.addEventListener('click', () => openYoutubeModal());
    if (ipodBtnLoadDemo) ipodBtnLoadDemo.addEventListener('click', () => loadDemoSongs());
    if (ipodBtnClearPl) {
      ipodBtnClearPl.addEventListener('click', () => {
        const remAll = document.getElementById('menuRemAll');
        if (remAll) remAll.click();
      });
    }

    // Equalizer View Controls (Switch, Reset, 11 Sliders, Presets)
    if (ipodEqToggleBtn) {
      ipodEqToggleBtn.addEventListener('click', () => eqOnBtn.click());
    }
    if (ipodEqResetBtn) {
      ipodEqResetBtn.addEventListener('click', () => btnResetEQ.click());
    }

    if (ipodEqSliders) {
      const updateIpodEqBandFromY = (col, clientY) => {
        const rail = col.querySelector('.ipod-eq-rail');
        if (!rail) return;
        engine.ensureRunning(true);
        const rect = rail.getBoundingClientRect();
        let ratio = 1 - (clientY - rect.top) / rect.height;
        ratio = Math.max(0, Math.min(1, ratio));
        if (Math.abs(ratio - 0.5) < 0.04) ratio = 0.5;
        const dbVal = (ratio - 0.5) * 24;

        const bandAttr = col.getAttribute('data-ipod-band');
        if (bandAttr === 'preamp') {
          state.preamp = dbVal;
          engine.setPreamp(dbVal, true);
          if (faderPreamp) faderPreamp.style.bottom = `${ratio * 100}%`;
          window.winampDB.setSetting('eq_preamp', dbVal);
        } else {
          const idx = parseInt(bandAttr, 10);
          if (!isNaN(idx) && idx >= 0 && idx < 10) {
            state.bands[idx] = dbVal;
            engine.setBandGain(idx, dbVal, true);
            const freq = engine.eqFrequencies[idx];
            const winTrack = document.querySelector(`.eq-fader-track[data-band="${freq}"] .eq-fader-thumb`);
            if (winTrack) winTrack.style.bottom = `${ratio * 100}%`;
            window.winampDB.setSetting('eq_bands', state.bands);
          }
        }
        drawEQCurve();
      };

      ipodEqSliders.querySelectorAll('.ipod-eq-col').forEach(col => {
        col.addEventListener('mousedown', (e) => {
          e.preventDefault();
          updateIpodEqBandFromY(col, e.clientY);
          const onMove = (ev) => updateIpodEqBandFromY(col, ev.clientY);
          const onUp = () => {
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseup', onUp);
          };
          document.addEventListener('mousemove', onMove);
          document.addEventListener('mouseup', onUp);
        });

        col.addEventListener('touchstart', (e) => {
          if (!e.touches[0]) return;
          e.preventDefault();
          updateIpodEqBandFromY(col, e.touches[0].clientY);
          const onTouchMove = (ev) => {
            if (ev.touches[0]) updateIpodEqBandFromY(col, ev.touches[0].clientY);
          };
          const onTouchEnd = () => {
            document.removeEventListener('touchmove', onTouchMove);
            document.removeEventListener('touchend', onTouchEnd);
          };
          document.addEventListener('touchmove', onTouchMove, { passive: false });
          document.addEventListener('touchend', onTouchEnd);
        }, { passive: false });
      });
    }

    if (ipodEqPresetList) {
      ipodEqPresetList.querySelectorAll('.ipod-preset-row').forEach(row => {
        row.addEventListener('click', () => {
          const presetKey = row.getAttribute('data-ipod-preset');
          if (presetKey && engine.presets[presetKey]) {
            applyPresetValues(engine.presets[presetKey], true);
            showToast(`🎚 iPod EQ: ${row.textContent.replace('✓', '').trim()}`);
          }
        });
      });
    }

    // Sleep / Wake Hardware Button & Slide-to-Unlock Lock Screen
    if (ipodSleepBtn && ipodLockOverlay) {
      ipodSleepBtn.addEventListener('click', () => {
        engine.playMechanicalSound('click');
        ipodState.isLocked = !ipodLockOverlay.classList.contains('hidden') ? false : true;
        ipodLockOverlay.classList.toggle('hidden', !ipodState.isLocked);
        updateIpodClock();
      });
    }

    if (ipodLockPrev) ipodLockPrev.addEventListener('click', () => btnPrev.click());
    if (ipodLockPlay) ipodLockPlay.addEventListener('click', () => (state.isPlaying ? btnPause.click() : btnPlay.click()));
    if (ipodLockNext) ipodLockNext.addEventListener('click', () => btnNext.click());

    if (ipodUnlockTrack && ipodUnlockThumb && ipodLockOverlay) {
      let isDraggingUnlock = false;
      let startX = 0;

      const startUnlockDrag = (clientX) => {
        isDraggingUnlock = true;
        startX = clientX;
        ipodUnlockThumb.style.transition = 'none';
      };

      const moveUnlockDrag = (clientX) => {
        if (!isDraggingUnlock) return;
        const maxScroll = ipodUnlockTrack.clientWidth - ipodUnlockThumb.offsetWidth - 6;
        const dx = Math.max(0, Math.min(maxScroll, clientX - startX));
        ipodUnlockThumb.style.left = `${3 + dx}px`;
        if (dx >= maxScroll * 0.82) {
          isDraggingUnlock = false;
          ipodUnlockThumb.style.transition = 'left 0.15s ease';
          ipodUnlockThumb.style.left = '3px';
          ipodLockOverlay.classList.add('hidden');
          ipodState.isLocked = false;
          engine.playMechanicalSound('click');
        }
      };

      const endUnlockDrag = () => {
        if (!isDraggingUnlock) return;
        isDraggingUnlock = false;
        ipodUnlockThumb.style.transition = 'left 0.2s ease';
        ipodUnlockThumb.style.left = '3px';
      };

      ipodUnlockThumb.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        startUnlockDrag(e.clientX);
        const onMove = (ev) => moveUnlockDrag(ev.clientX);
        const onUp = () => {
          endUnlockDrag();
          document.removeEventListener('mousemove', onMove);
          document.removeEventListener('mouseup', onUp);
        };
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
      });

      ipodUnlockThumb.addEventListener('touchstart', (e) => {
        if (!e.touches[0]) return;
        e.preventDefault();
        e.stopPropagation();
        startUnlockDrag(e.touches[0].clientX);
        const onMove = (ev) => {
          if (ev.touches[0]) moveUnlockDrag(ev.touches[0].clientX);
        };
        const onEnd = () => {
          endUnlockDrag();
          document.removeEventListener('touchmove', onMove);
          document.removeEventListener('touchend', onEnd);
        };
        document.addEventListener('touchmove', onMove, { passive: false });
        document.addEventListener('touchend', onEnd);
      }, { passive: false });

      ipodUnlockTrack.addEventListener('click', () => {
        ipodLockOverlay.classList.add('hidden');
        ipodState.isLocked = false;
        engine.playMechanicalSound('click');
      });
    }
  }

  // =========================================================================
  // 8. APPLE iPOD CLASSIC 160GB CONTROLLER (6th / 7th Gen Click Wheel Edition)
  // =========================================================================
  const ipcState = {
    activeView: 'menu', // 'menu', 'nowplaying', 'coverflow', 'songs', 'eq', 'skins'
    menuIndex: 0,
    coverFlowIndex: 0,
    songsIndex: 0,
    eqIndex: 0,
    skinsIndex: 0,
    centerMode: 'scrub', // 'scrub', 'vol', 'rating'
    isHold: false,
    color: 'silver', // 'silver', 'black', 'white'
    starRating: 5
  };

  const ipcHoldSwitch = document.getElementById('ipcHoldSwitch');
  const ipcStatusTitle = document.getElementById('ipcStatusTitle');
  const ipcStatusLock = document.getElementById('ipcStatusLock');
  const ipcStatusPlay = document.getElementById('ipcStatusPlay');

  const ipcViewMenu = document.getElementById('ipcViewMenu');
  const ipcViewNowPlaying = document.getElementById('ipcViewNowPlaying');
  const ipcViewCoverFlow = document.getElementById('ipcViewCoverFlow');
  const ipcViewSongs = document.getElementById('ipcViewSongs');
  const ipcViewEQ = document.getElementById('ipcViewEQ');
  const ipcViewSkins = document.getElementById('ipcViewSkins');

  const ipcMenuList = document.getElementById('ipcMenuList');
  const ipcSplitPreview = document.getElementById('ipcSplitPreview');
  const ipcSplitCoverCanvas = document.getElementById('ipcSplitCoverCanvas');
  const ipcSplitReflectCanvas = document.getElementById('ipcSplitReflectCanvas');
  const ipcSplitCaptionTitle = document.getElementById('ipcSplitCaptionTitle');
  const ipcSplitCaptionSub = document.getElementById('ipcSplitCaptionSub');
  const ipcMenuShuffleVal = document.getElementById('ipcMenuShuffleVal');
  const ipcMenuRepeatVal = document.getElementById('ipcMenuRepeatVal');
  const ipcMenuColorVal = document.getElementById('ipcMenuColorVal');

  const ipcNpCoverWrap = document.getElementById('ipcNpCoverWrap');
  const ipcNpCoverCanvas = document.getElementById('ipcNpCoverCanvas');
  const ipcNpReflectCanvas = document.getElementById('ipcNpReflectCanvas');
  const ipcNpIndex = document.getElementById('ipcNpIndex');
  const ipcNpTitle = document.getElementById('ipcNpTitle');
  const ipcNpArtist = document.getElementById('ipcNpArtist');
  const ipcNpAlbum = document.getElementById('ipcNpAlbum');
  const ipcNpShuffleBtn = document.getElementById('ipcNpShuffleBtn');
  const ipcNpRepeatBtn = document.getElementById('ipcNpRepeatBtn');
  const ipcNpModeBtn = document.getElementById('ipcNpModeBtn');
  const ipcNpBarProgress = document.getElementById('ipcNpBarProgress');
  const ipcNpBarVolume = document.getElementById('ipcNpBarVolume');
  const ipcNpBarRating = document.getElementById('ipcNpBarRating');
  const ipcSeekTrack = document.getElementById('ipcSeekTrack');
  const ipcSeekFill = document.getElementById('ipcSeekFill');
  const ipcSeekDiamond = document.getElementById('ipcSeekDiamond');
  const ipcTimeElapsed = document.getElementById('ipcTimeElapsed');
  const ipcTimeRemaining = document.getElementById('ipcTimeRemaining');
  const ipcVolTrack = document.getElementById('ipcVolTrack');
  const ipcVolFill = document.getElementById('ipcVolFill');
  const ipcRatingStars = document.getElementById('ipcRatingStars');

  const ipcCoverFlowStage = document.getElementById('ipcCoverFlowStage');
  const ipcCfTitle = document.getElementById('ipcCfTitle');
  const ipcCfArtist = document.getElementById('ipcCfArtist');

  const ipcSongsList = document.getElementById('ipcSongsList');
  const ipcBtnAddMp3 = document.getElementById('ipcBtnAddMp3');
  const ipcBtnAddYt = document.getElementById('ipcBtnAddYt');
  const ipcBtnLoadDemo = document.getElementById('ipcBtnLoadDemo');
  const ipcBtnClearPl = document.getElementById('ipcBtnClearPl');

  const ipcEqCanvas = document.getElementById('ipcEqCanvas');
  const ipcEqPresetList = document.getElementById('ipcEqPresetList');
  const ipcEqResetBtn = document.getElementById('ipcEqResetBtn');
  const ipcEqToggleBtn = document.getElementById('ipcEqToggleBtn');

  const ipcSkinsList = document.getElementById('ipcSkinsList');

  const ipcClickWheel = document.getElementById('ipcClickWheel');
  const ipcWheelDot = document.getElementById('ipcWheelDot');
  const ipcBtnMenu = document.getElementById('ipcBtnMenu');
  const ipcBtnPrev = document.getElementById('ipcBtnPrev');
  const ipcBtnNext = document.getElementById('ipcBtnNext');
  const ipcBtnPlayPause = document.getElementById('ipcBtnPlayPause');
  const ipcBtnSelect = document.getElementById('ipcBtnSelect');

  function switchIpcView(viewName) {
    if (viewName === 'youtube') {
      openYoutubeModal();
      return;
    }
    ipcState.activeView = viewName;

    document.querySelectorAll('#ipcViewport .ipc-view').forEach(v => {
      v.classList.toggle('active', v.getAttribute('data-ipc-view') === viewName);
    });

    const titles = {
      menu: 'iPod',
      nowplaying: 'Now Playing',
      coverflow: 'Cover Flow',
      songs: 'Songs',
      eq: 'Equalizer',
      skins: 'Switch Player'
    };
    if (ipcStatusTitle) {
      ipcStatusTitle.textContent = titles[viewName] || 'iPod';
    }

    if (viewName === 'menu') {
      updateIpcMenuStatusValues();
      updateIpcMenuPreview();
    } else if (viewName === 'nowplaying') {
      updateIpcUI();
    } else if (viewName === 'coverflow') {
      renderIpcCoverFlow();
    } else if (viewName === 'songs') {
      renderIpcSongs();
    } else if (viewName === 'eq') {
      updateIpcEQ();
    }
  }

  function updateIpcMenuStatusValues() {
    if (ipcMenuShuffleVal) {
      ipcMenuShuffleVal.textContent = state.shuffle ? 'Songs' : 'Off';
    }
    if (ipcMenuRepeatVal) {
      ipcMenuRepeatVal.textContent = state.repeat !== 'off' ? 'All' : 'Off';
    }
    const colorNames = { silver: 'Silver', black: 'Black', white: 'White' };
    if (ipcMenuColorVal) {
      ipcMenuColorVal.textContent = colorNames[ipcState.color] || ipcState.color;
    }
  }

  function updateIpcMenuPreview() {
    if (!ipcSplitPreview) return;
    const curTrack = (state.currentIndex >= 0 && state.playlist[state.currentIndex]) ? state.playlist[state.currentIndex] : null;

    if (ipcState.menuIndex === 0 || ipcState.menuIndex === 1 || ipcState.menuIndex === 2 || ipcState.menuIndex === 6) {
      if (curTrack) {
        if (ipcSplitCaptionTitle) ipcSplitCaptionTitle.textContent = curTrack.title;
        if (ipcSplitCaptionSub) ipcSplitCaptionSub.textContent = curTrack.artist || 'iPod Classic';
      } else {
        if (ipcSplitCaptionTitle) ipcSplitCaptionTitle.textContent = 'iPod Classic';
        if (ipcSplitCaptionSub) ipcSplitCaptionSub.textContent = '160GB • Ready';
      }
    } else if (ipcState.menuIndex === 3) {
      if (ipcSplitCaptionTitle) ipcSplitCaptionTitle.textContent = 'Equalizer';
      if (ipcSplitCaptionSub) ipcSplitCaptionSub.textContent = '10-Band EQ DSP';
    } else if (ipcState.menuIndex === 4) {
      if (ipcSplitCaptionTitle) ipcSplitCaptionTitle.textContent = 'YouTube Audio';
      if (ipcSplitCaptionSub) ipcSplitCaptionSub.textContent = 'Paste & Stream';
    } else if (ipcState.menuIndex === 5) {
      if (ipcSplitCaptionTitle) ipcSplitCaptionTitle.textContent = 'Add Music';
      if (ipcSplitCaptionSub) ipcSplitCaptionSub.textContent = 'Import Audio Files';
    } else if (ipcState.menuIndex === 7 || ipcState.menuIndex === 8) {
      if (ipcSplitCaptionTitle) ipcSplitCaptionTitle.textContent = 'Settings';
      if (ipcSplitCaptionSub) ipcSplitCaptionSub.textContent = 'Shuffle & Repeat';
    } else if (ipcState.menuIndex === 9) {
      if (ipcSplitCaptionTitle) ipcSplitCaptionTitle.textContent = 'Color Finish';
      if (ipcSplitCaptionSub) ipcSplitCaptionSub.textContent = 'Silver / Black / White';
    } else if (ipcState.menuIndex === 10) {
      if (ipcSplitCaptionTitle) ipcSplitCaptionTitle.textContent = 'Player Skins';
      if (ipcSplitCaptionSub) ipcSplitCaptionSub.textContent = 'Winamp • Walkman';
    }
    drawIpcCoverArt();
  }

  function setIpcCenterMode(mode) {
    ipcState.centerMode = mode;
    if (ipcNpModeBtn) {
      const modeText = { scrub: 'SCRUB', vol: 'VOL', rating: 'RATE' };
      ipcNpModeBtn.textContent = modeText[mode] || 'SCRUB';
    }

    if (ipcNpBarProgress) ipcNpBarProgress.classList.toggle('hidden', mode !== 'scrub');
    if (ipcNpBarVolume) ipcNpBarVolume.classList.toggle('hidden', mode !== 'vol');
    if (ipcNpBarRating) ipcNpBarRating.classList.toggle('hidden', mode !== 'rating');

    if (ipcSeekDiamond) {
      ipcSeekDiamond.classList.toggle('hidden', mode !== 'scrub');
    }
  }

  function updateIpcRatingStars() {
    if (!ipcRatingStars) return;
    ipcRatingStars.querySelectorAll('.ipc-star').forEach(s => {
      const val = parseInt(s.getAttribute('data-star'), 10) || 1;
      s.classList.toggle('active', val <= ipcState.starRating);
    });
  }

  function cycleIpcColor(targetColor) {
    const colors = ['silver', 'black', 'white'];
    const curIdx = colors.indexOf(ipcState.color);
    const nextColor = targetColor || colors[(curIdx + 1) % colors.length];
    ipcState.color = nextColor;

    if (ipodClassicWindow) {
      colors.forEach(c => ipodClassicWindow.classList.remove(`ipc-color-${c}`));
      ipodClassicWindow.classList.add(`ipc-color-${nextColor}`);
    }

    const labels = { silver: 'Silver', black: 'Black', white: 'White' };
    if (ipcMenuColorVal) ipcMenuColorVal.textContent = labels[nextColor] || nextColor;
    window.winampDB.setSetting('ipod_classic_color', nextColor);
    showToast(`🎨 iPod Finish: ${labels[nextColor]}`);
  }

  function toggleIpcHoldSwitch() {
    ipcState.isHold = !ipcState.isHold;
    engine.playMechanicalSound('click');
    if (ipcHoldSwitch) ipcHoldSwitch.classList.toggle('locked', ipcState.isHold);
    if (ipcStatusLock) ipcStatusLock.classList.toggle('hidden', !ipcState.isHold);
    showToast(ipcState.isHold ? '🔒 iPod Classic: HOLD Switch ON (ปุ่มล็อก)' : '🔓 iPod Classic: HOLD Switch OFF (ปลดล็อก)');
  }

  function drawTrackArtworkToCanvas(canvas, track) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;

    // 1. If user uploaded custom cover
    if (ipodState.customCoverImg && ipodState.customCoverImg.complete && ipodState.customCoverImg.naturalWidth > 0) {
      const img = ipodState.customCoverImg;
      const scale = Math.max(W / img.naturalWidth, H / img.naturalHeight);
      const dw = img.naturalWidth * scale;
      const dh = img.naturalHeight * scale;
      ctx.clearRect(0, 0, W, H);
      ctx.drawImage(img, (W - dw) / 2, (H - dh) / 2, dw, dh);
      return;
    }

    // 2. If YouTube track with cached image
    if (track && track.thumbnail && ipodState.ytCoverCache[track.thumbnail]) {
      const cached = ipodState.ytCoverCache[track.thumbnail];
      if (cached.complete && cached.naturalWidth > 0) {
        const scale = Math.max(W / cached.naturalWidth, H / cached.naturalHeight);
        const dw = cached.naturalWidth * scale;
        const dh = cached.naturalHeight * scale;
        ctx.clearRect(0, 0, W, H);
        ctx.drawImage(cached, (W - dw) / 2, (H - dh) / 2, dw, dh);
        return;
      }
    }

    // 3. Procedural artwork
    const palettes = [
      ['#0f172a', '#1d4ed8', '#38bdf8', '#fde047'],
      ['#1e1b4b', '#6d28d9', '#ec4899', '#f43f5e'],
      ['#064e3b', '#059669', '#34d399', '#a7f3d0'],
      ['#451a03', '#d97706', '#f59e0b', '#fef08a'],
      ['#31102f', '#9d174d', '#f472b6', '#fbcfe8'],
      ['#090d16', '#0284c7', '#22d3ee', '#ffffff']
    ];
    const hash = track ? (track.title || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0) : 0;
    const pal = palettes[hash % palettes.length];

    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, pal[0]);
    grad.addColorStop(0.55, pal[1]);
    grad.addColorStop(1, pal[2]);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    ctx.save();
    ctx.translate(W / 2, H / 2 - 8);
    ctx.beginPath();
    ctx.arc(0, 0, W * 0.32, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(8, 10, 16, 0.88)';
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, W * 0.12, 0, Math.PI * 2);
    ctx.fillStyle = pal[2];
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${Math.round(W * 0.14)}px -apple-system, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('♪', 0, 0);
    ctx.restore();

    // Bottom banner
    ctx.fillStyle = 'rgba(5, 8, 15, 0.9)';
    ctx.fillRect(0, H - 28, W, 28);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px -apple-system, sans-serif';
    ctx.textAlign = 'left';
    const titleText = track ? (track.title || '').replace(/^▶️\s*/, '').slice(0, 18) : 'iPod Classic';
    ctx.fillText(titleText, 6, H - 11);
  }

  function drawIpcCoverArt(force = false) {
    const track = (state.currentIndex >= 0 && state.playlist[state.currentIndex]) ? state.playlist[state.currentIndex] : null;

    if (ipcNpCoverCanvas) {
      drawTrackArtworkToCanvas(ipcNpCoverCanvas, track);
      if (ipcNpReflectCanvas) {
        const rCtx = ipcNpReflectCanvas.getContext('2d');
        rCtx.clearRect(0, 0, ipcNpReflectCanvas.width, ipcNpReflectCanvas.height);
        rCtx.drawImage(
          ipcNpCoverCanvas,
          0, ipcNpCoverCanvas.height - 36, ipcNpCoverCanvas.width, 36,
          0, 0, ipcNpReflectCanvas.width, ipcNpReflectCanvas.height
        );
      }
    }

    if (ipcSplitCoverCanvas) {
      drawTrackArtworkToCanvas(ipcSplitCoverCanvas, track);
      if (ipcSplitReflectCanvas) {
        const srCtx = ipcSplitReflectCanvas.getContext('2d');
        srCtx.clearRect(0, 0, ipcSplitReflectCanvas.width, ipcSplitReflectCanvas.height);
        srCtx.drawImage(
          ipcSplitCoverCanvas,
          0, ipcSplitCoverCanvas.height - 40, ipcSplitCoverCanvas.width, 40,
          0, 0, ipcSplitReflectCanvas.width, ipcSplitReflectCanvas.height
        );
      }
    }
  }

  function updateIpcUI() {
    const track = (state.currentIndex >= 0 && state.playlist[state.currentIndex]) ? state.playlist[state.currentIndex] : null;

    if (ipcStatusPlay) {
      ipcStatusPlay.classList.toggle('active', state.isPlaying);
    }

    if (ipcNpIndex) {
      const total = state.playlist.length;
      const cur = total > 0 ? Math.max(1, state.currentIndex + 1) : 0;
      ipcNpIndex.textContent = `${cur} of ${total}`;
    }

    if (ipcNpTitle) ipcNpTitle.textContent = track ? track.title : 'No Song Playing';
    if (ipcNpArtist) ipcNpArtist.textContent = track ? (track.artist || 'iPod Classic') : 'Select a Song';
    if (ipcNpAlbum) ipcNpAlbum.textContent = track ? (track.album || '160GB Retro Edition') : 'Click Wheel';

    if (ipcNpShuffleBtn) ipcNpShuffleBtn.classList.toggle('active', Boolean(state.shuffle));
    if (ipcNpRepeatBtn) ipcNpRepeatBtn.classList.toggle('active', state.repeat !== 'off');

    drawIpcCoverArt();
    updateIpcMenuStatusValues();
    updateIpcRatingStars();
  }

  function renderIpcSongs() {
    if (!ipcSongsList) return;
    ipcSongsList.innerHTML = '';

    state.playlist.forEach((track, idx) => {
      const isCur = idx === state.currentIndex;
      const isSel = idx === ipcState.songsIndex;
      const row = document.createElement('div');
      row.className = `ipc-song-row ${isSel ? 'selected' : ''}`;
      row.innerHTML = `
        <div class="ipc-song-left">
          <span class="ipc-song-num">${isCur ? '🔊' : (idx + 1) + '.'}</span>
          <span class="ipc-song-title">${track.title}</span>
        </div>
        <span class="ipc-song-dur">${AudioMetadataParser.formatTime(track.duration)}</span>
      `;
      row.addEventListener('click', () => {
        ipcState.songsIndex = idx;
        playTrackIndex(idx);
        switchIpcView('nowplaying');
      });
      ipcSongsList.appendChild(row);
    });

    if (state.playlist.length === 0) {
      ipcSongsList.innerHTML = `<div style="padding:24px 12px;text-align:center;color:#64748b;font-size:11px;font-weight:700;">No Songs<br><span style="font-size:10px;font-weight:400;">Tap +MP3 or ▶️YT above to add music.</span></div>`;
    }
  }

  function updateIpcCoverFlowCards() {
    if (!ipcCoverFlowStage) return;
    const cards = ipcCoverFlowStage.querySelectorAll('.ipc-cf-card');
    const curIdx = ipcState.coverFlowIndex;

    cards.forEach((card, idx) => {
      const offset = idx - curIdx;
      if (offset === 0) {
        card.style.transform = 'translateX(0px) translateZ(48px) rotateY(0deg)';
        card.style.opacity = '1';
        card.style.zIndex = '30';
      } else if (offset < 0) {
        const tx = -54 + Math.max(-120, offset * 22);
        card.style.transform = `translateX(${tx}px) translateZ(-40px) rotateY(58deg)`;
        card.style.opacity = `${Math.max(0.18, 1 - Math.abs(offset) * 0.22)}`;
        card.style.zIndex = `${15 + offset}`;
      } else {
        const tx = 54 + Math.min(120, offset * 22);
        card.style.transform = `translateX(${tx}px) translateZ(-40px) rotateY(-58deg)`;
        card.style.opacity = `${Math.max(0.18, 1 - Math.abs(offset) * 0.22)}`;
        card.style.zIndex = `${15 - offset}`;
      }
    });

    const activeTrack = state.playlist[curIdx];
    if (activeTrack) {
      if (ipcCfTitle) ipcCfTitle.textContent = activeTrack.title;
      if (ipcCfArtist) ipcCfArtist.textContent = activeTrack.artist || 'iPod Classic';
    } else {
      if (ipcCfTitle) ipcCfTitle.textContent = 'Cover Flow';
      if (ipcCfArtist) ipcCfArtist.textContent = 'No Songs Available';
    }
  }

  function renderIpcCoverFlow() {
    if (!ipcCoverFlowStage) return;
    ipcCoverFlowStage.innerHTML = '';
    ipcState.coverFlowIndex = Math.max(0, Math.min(state.playlist.length - 1, state.currentIndex >= 0 ? state.currentIndex : 0));

    state.playlist.forEach((track, idx) => {
      const card = document.createElement('div');
      card.className = 'ipc-cf-card';
      const canvas = document.createElement('canvas');
      canvas.width = 160;
      canvas.height = 160;
      drawTrackArtworkToCanvas(canvas, track);
      card.appendChild(canvas);

      card.addEventListener('click', () => {
        if (ipcState.coverFlowIndex === idx) {
          playTrackIndex(idx);
          switchIpcView('nowplaying');
        } else {
          ipcState.coverFlowIndex = idx;
          updateIpcCoverFlowCards();
        }
      });

      ipcCoverFlowStage.appendChild(card);
    });

    updateIpcCoverFlowCards();
  }

  function updateIpcEQ() {
    if (ipcEqToggleBtn) {
      ipcEqToggleBtn.textContent = `EQ: ${state.eqEnabled ? 'ON' : 'OFF'}`;
      ipcEqToggleBtn.classList.toggle('active', state.eqEnabled);
    }

    if (ipcEqCanvas) {
      const ctx = ipcEqCanvas.getContext('2d');
      const W = ipcEqCanvas.width;
      const H = ipcEqCanvas.height;
      ctx.clearRect(0, 0, W, H);

      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, H / 2);
      ctx.lineTo(W, H / 2);
      ctx.stroke();

      ctx.strokeStyle = state.eqEnabled ? '#38bdf8' : '#64748b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      const pts = state.bands.map((gain, i) => ({
        x: (i / (state.bands.length - 1)) * (W - 14) + 7,
        y: (H / 2) - ((state.eqEnabled ? gain : 0) / 12) * (H / 2 - 4)
      }));
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 0; i < pts.length - 1; i++) {
        const xc = (pts[i].x + pts[i + 1].x) / 2;
        const yc = (pts[i].y + pts[i + 1].y) / 2;
        ctx.quadraticCurveTo(pts[i].x, pts[i].y, xc, yc);
      }
      ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
      ctx.stroke();
    }

    if (ipcEqPresetList && engine.presets) {
      ipcEqPresetList.querySelectorAll('.ipc-eq-row').forEach(row => {
        const key = row.getAttribute('data-ipc-preset');
        const pVals = engine.presets[key];
        const isMatch = pVals && pVals.every((v, idx) => Math.abs(v - (state.bands[idx] || 0)) < 0.4);
        row.classList.toggle('active', Boolean(isMatch));
      });
    }
  }

  function handleWheelStep(dir) {
    if (ipcState.isHold) return;
    engine.playMechanicalSound('wheel');

    if (ipcState.activeView === 'menu') {
      const rows = document.querySelectorAll('#ipcMenuList .ipc-menu-row');
      const count = rows.length;
      if (count === 0) return;
      ipcState.menuIndex = (ipcState.menuIndex + dir + count) % count;
      rows.forEach((r, idx) => r.classList.toggle('active', idx === ipcState.menuIndex));
      const activeRow = rows[ipcState.menuIndex];
      if (activeRow) activeRow.scrollIntoView({ block: 'nearest' });
      updateIpcMenuPreview();
    } else if (ipcState.activeView === 'songs') {
      const rows = document.querySelectorAll('#ipcSongsList .ipc-song-row');
      const count = rows.length;
      if (count === 0) return;
      ipcState.songsIndex = Math.max(0, Math.min(count - 1, ipcState.songsIndex + dir));
      rows.forEach((r, idx) => r.classList.toggle('selected', idx === ipcState.songsIndex));
      const activeRow = rows[ipcState.songsIndex];
      if (activeRow) activeRow.scrollIntoView({ block: 'nearest' });
    } else if (ipcState.activeView === 'coverflow') {
      const count = state.playlist.length;
      if (count === 0) return;
      ipcState.coverFlowIndex = Math.max(0, Math.min(count - 1, ipcState.coverFlowIndex + dir));
      updateIpcCoverFlowCards();
    } else if (ipcState.activeView === 'eq') {
      const rows = document.querySelectorAll('#ipcEqPresetList .ipc-eq-row');
      const count = rows.length;
      if (count === 0) return;
      ipcState.eqIndex = Math.max(0, Math.min(count - 1, ipcState.eqIndex + dir));
      rows.forEach((r, idx) => r.classList.toggle('selected', idx === ipcState.eqIndex));
      const activeRow = rows[ipcState.eqIndex];
      if (activeRow) activeRow.scrollIntoView({ block: 'nearest' });
    } else if (ipcState.activeView === 'skins') {
      const rows = document.querySelectorAll('#ipcSkinsList .ipc-skin-row');
      const count = rows.length;
      if (count === 0) return;
      ipcState.skinsIndex = Math.max(0, Math.min(count - 1, ipcState.skinsIndex + dir));
      rows.forEach((r, idx) => r.classList.toggle('active', idx === ipcState.skinsIndex));
      const activeRow = rows[ipcState.skinsIndex];
      if (activeRow) activeRow.scrollIntoView({ block: 'nearest' });
    } else if (ipcState.activeView === 'nowplaying') {
      if (ipcState.centerMode === 'vol') {
        const nextVol = Math.max(0, Math.min(1, state.volume + dir * 0.04));
        updateVolumeUI(nextVol);
      } else if (ipcState.centerMode === 'scrub') {
        const dur = engine.getDuration();
        if (dur) {
          const nextTime = Math.max(0, Math.min(dur, engine.getCurrentTime() + dir * 4));
          engine.seek(nextTime);
          updateTimerDisplay(nextTime, dur);
        }
      } else if (ipcState.centerMode === 'rating') {
        ipcState.starRating = Math.max(1, Math.min(5, ipcState.starRating + dir));
        updateIpcRatingStars();
      }
    }
  }

  function handleIpcCenterSelect() {
    if (ipcState.isHold) {
      showToast('🔒 iPod HOLD switch is ON');
      return;
    }
    engine.playMechanicalSound('click');

    if (ipcState.activeView === 'menu') {
      const actions = [
        'nowplaying', 'songs', 'coverflow', 'eq', 'youtube',
        'addmp3', 'coverart', 'shuffle', 'repeat', 'color', 'skins'
      ];
      const action = actions[ipcState.menuIndex];
      if (action === 'nowplaying') {
        switchIpcView('nowplaying');
      } else if (action === 'songs') {
        switchIpcView('songs');
      } else if (action === 'coverflow') {
        switchIpcView('coverflow');
      } else if (action === 'eq') {
        switchIpcView('eq');
      } else if (action === 'youtube') {
        openYoutubeModal();
      } else if (action === 'addmp3') {
        fileInput.click();
      } else if (action === 'coverart') {
        if (ipodCoverInput) {
          ipodCoverInput.value = '';
          ipodCoverInput.click();
        }
      } else if (action === 'shuffle') {
        btnShuffle.click();
        updateIpcMenuStatusValues();
      } else if (action === 'repeat') {
        btnRepeat.click();
        updateIpcMenuStatusValues();
      } else if (action === 'color') {
        cycleIpcColor();
      } else if (action === 'skins') {
        switchIpcView('skins');
      }
    } else if (ipcState.activeView === 'nowplaying') {
      if (ipcState.centerMode === 'scrub') {
        setIpcCenterMode('vol');
      } else if (ipcState.centerMode === 'vol') {
        setIpcCenterMode('rating');
      } else {
        setIpcCenterMode('scrub');
      }
    } else if (ipcState.activeView === 'songs') {
      if (ipcState.songsIndex >= 0 && ipcState.songsIndex < state.playlist.length) {
        playTrackIndex(ipcState.songsIndex);
        switchIpcView('nowplaying');
      }
    } else if (ipcState.activeView === 'coverflow') {
      if (ipcState.coverFlowIndex >= 0 && ipcState.coverFlowIndex < state.playlist.length) {
        playTrackIndex(ipcState.coverFlowIndex);
        switchIpcView('nowplaying');
      }
    } else if (ipcState.activeView === 'eq') {
      const rows = document.querySelectorAll('#ipcEqPresetList .ipc-eq-row');
      const row = rows[ipcState.eqIndex];
      if (row) {
        const presetKey = row.getAttribute('data-ipc-preset');
        if (presetKey && engine.presets[presetKey]) {
          applyPresetValues(engine.presets[presetKey], true);
          showToast(`🎚 iPod EQ: ${row.textContent.replace('✓', '').trim()}`);
          updateIpcEQ();
        }
      }
    } else if (ipcState.activeView === 'skins') {
      const rows = document.querySelectorAll('#ipcSkinsList .ipc-skin-row');
      const row = rows[ipcState.skinsIndex];
      if (row) {
        const targetSkin = row.getAttribute('data-ipc-skin');
        if (targetSkin) switchSkin(targetSkin);
      }
    }
  }

  function handleIpcMenuBtn() {
    if (ipcState.isHold) return;
    engine.playMechanicalSound('click');

    if (ipcState.activeView === 'menu') {
      if (state.currentIndex >= 0 && state.currentIndex < state.playlist.length) {
        switchIpcView('nowplaying');
      }
    } else {
      switchIpcView('menu');
    }
  }

  function setupIpcClickWheel() {
    if (!ipcClickWheel) return;

    let isTouching = false;
    let lastAngle = null;
    let accumulated = 0;
    const STEP_ANGLE = 16;

    const getAngle = (clientX, clientY) => {
      const rect = ipcClickWheel.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      return Math.atan2(clientY - cy, clientX - cx) * (180 / Math.PI);
    };

    const flashWheelDot = (angle) => {
      if (!ipcWheelDot) return;
      const rad = (angle * Math.PI) / 180;
      const r = 78;
      const x = Math.cos(rad) * r;
      const y = Math.sin(rad) * r;
      ipcWheelDot.style.left = `calc(50% + ${x}px - 4px)`;
      ipcWheelDot.style.top = `calc(50% + ${y}px - 4px)`;
      ipcWheelDot.classList.add('active');
    };

    const onStart = (clientX, clientY) => {
      if (ipcState.isHold) return;
      isTouching = true;
      lastAngle = getAngle(clientX, clientY);
      accumulated = 0;
      flashWheelDot(lastAngle);
    };

    const onMove = (clientX, clientY) => {
      if (!isTouching || ipcState.isHold) return;
      const currentAngle = getAngle(clientX, clientY);
      let diff = currentAngle - lastAngle;
      if (diff > 180) diff -= 360;
      if (diff < -180) diff += 360;
      lastAngle = currentAngle;

      accumulated += diff;
      flashWheelDot(currentAngle);

      while (Math.abs(accumulated) >= STEP_ANGLE) {
        const stepDir = accumulated > 0 ? 1 : -1;
        handleWheelStep(stepDir);
        accumulated -= stepDir * STEP_ANGLE;
      }
    };

    const onEnd = () => {
      isTouching = false;
      lastAngle = null;
      accumulated = 0;
      if (ipcWheelDot) ipcWheelDot.classList.remove('active');
    };

    ipcClickWheel.addEventListener('mousedown', (e) => {
      if (e.target.closest('.ipc-wheel-btn') || e.target.closest('.ipc-center-btn')) return;
      e.preventDefault();
      onStart(e.clientX, e.clientY);
      const move = (ev) => onMove(ev.clientX, ev.clientY);
      const up = () => {
        onEnd();
        document.removeEventListener('mousemove', move);
        document.removeEventListener('mouseup', up);
      };
      document.addEventListener('mousemove', move);
      document.addEventListener('mouseup', up);
    });

    ipcClickWheel.addEventListener('touchstart', (e) => {
      if (e.target.closest('.ipc-wheel-btn') || e.target.closest('.ipc-center-btn')) return;
      if (!e.touches[0]) return;
      e.preventDefault();
      onStart(e.touches[0].clientX, e.touches[0].clientY);
      const touchMove = (ev) => {
        if (ev.touches[0]) onMove(ev.touches[0].clientX, ev.touches[0].clientY);
      };
      const touchEnd = () => {
        onEnd();
        document.removeEventListener('touchmove', touchMove);
        document.removeEventListener('touchend', touchEnd);
      };
      document.addEventListener('touchmove', touchMove, { passive: false });
      document.addEventListener('touchend', touchEnd);
    }, { passive: false });

    ipcClickWheel.addEventListener('wheel', (e) => {
      e.preventDefault();
      if (ipcState.isHold) return;
      const dir = (e.deltaY || e.deltaX) > 0 ? 1 : -1;
      handleWheelStep(dir);
    }, { passive: false });
  }

  function setupIpodClassicControls() {
    setupIpcClickWheel();

    if (ipcHoldSwitch) {
      ipcHoldSwitch.addEventListener('click', toggleIpcHoldSwitch);
    }

    if (ipcBtnSelect) {
      ipcBtnSelect.addEventListener('click', handleIpcCenterSelect);
    }

    if (ipcBtnMenu) {
      ipcBtnMenu.addEventListener('click', handleIpcMenuBtn);
    }

    if (ipcBtnPrev) {
      ipcBtnPrev.addEventListener('click', () => {
        if (ipcState.isHold) return;
        btnPrev.click();
      });
    }

    if (ipcBtnNext) {
      ipcBtnNext.addEventListener('click', () => {
        if (ipcState.isHold) return;
        btnNext.click();
      });
    }

    if (ipcBtnPlayPause) {
      ipcBtnPlayPause.addEventListener('click', () => {
        if (ipcState.isHold) return;
        if (state.isPlaying) {
          btnPause.click();
        } else {
          btnPlay.click();
        }
      });
    }

    // Menu rows click
    document.querySelectorAll('#ipcMenuList .ipc-menu-row').forEach(row => {
      row.addEventListener('click', () => {
        const idx = parseInt(row.getAttribute('data-ipc-idx'), 10) || 0;
        ipcState.menuIndex = idx;
        document.querySelectorAll('#ipcMenuList .ipc-menu-row').forEach((r, i) => r.classList.toggle('active', i === idx));
        handleIpcCenterSelect();
      });
    });

    // Now Playing Mode Button & Badges
    if (ipcNpModeBtn) {
      ipcNpModeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        handleIpcCenterSelect();
      });
    }

    if (ipcNpShuffleBtn) {
      ipcNpShuffleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        btnShuffle.click();
      });
    }

    if (ipcNpRepeatBtn) {
      ipcNpRepeatBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        btnRepeat.click();
      });
    }

    if (ipcNpCoverWrap && ipodCoverInput) {
      ipcNpCoverWrap.addEventListener('click', () => {
        ipodCoverInput.value = '';
        ipodCoverInput.click();
      });
    }

    // Now Playing Seek Track Click & Drag
    if (ipcSeekTrack) {
      const scrubToClientX = (clientX) => {
        const dur = engine.getDuration();
        if (!dur) return;
        const rect = ipcSeekTrack.getBoundingClientRect();
        const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        const target = ratio * dur;
        if (ipcSeekFill) ipcSeekFill.style.width = `${ratio * 100}%`;
        if (ipcSeekDiamond) ipcSeekDiamond.style.left = `${ratio * 100}%`;
        updateTimerDisplay(target, dur);
        engine.seek(target);
      };

      ipcSeekTrack.addEventListener('click', (e) => scrubToClientX(e.clientX));
    }

    // Volume Track Click
    if (ipcVolTrack) {
      ipcVolTrack.addEventListener('click', (e) => {
        const rect = ipcVolTrack.getBoundingClientRect();
        const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        updateVolumeUI(ratio);
      });
    }

    // Star rating tap
    if (ipcRatingStars) {
      ipcRatingStars.querySelectorAll('.ipc-star').forEach(star => {
        star.addEventListener('click', (e) => {
          e.stopPropagation();
          const val = parseInt(star.getAttribute('data-star'), 10) || 5;
          ipcState.starRating = val;
          updateIpcRatingStars();
          showToast(`Rated ${'★'.repeat(val)}`);
        });
      });
    }

    // Songs action toolbar
    if (ipcBtnAddMp3) ipcBtnAddMp3.addEventListener('click', () => fileInput.click());
    if (ipcBtnAddYt) ipcBtnAddYt.addEventListener('click', () => openYoutubeModal());
    if (ipcBtnLoadDemo) ipcBtnLoadDemo.addEventListener('click', () => loadDemoSongs());
    if (ipcBtnClearPl) {
      ipcBtnClearPl.addEventListener('click', () => {
        const remAll = document.getElementById('menuRemAll');
        if (remAll) remAll.click();
      });
    }

    // EQ Preset rows click
    if (ipcEqPresetList) {
      ipcEqPresetList.querySelectorAll('.ipc-eq-row').forEach(row => {
        row.addEventListener('click', () => {
          const key = row.getAttribute('data-ipc-preset');
          if (key && engine.presets[key]) {
            applyPresetValues(engine.presets[key], true);
            showToast(`🎚 iPod EQ: ${row.textContent.replace('✓', '').trim()}`);
            updateIpcEQ();
          }
        });
      });
    }

    if (ipcEqToggleBtn) {
      ipcEqToggleBtn.addEventListener('click', () => eqOnBtn.click());
    }

    if (ipcEqResetBtn) {
      ipcEqResetBtn.addEventListener('click', () => btnResetEQ.click());
    }

    // Skins submenu click
    if (ipcSkinsList) {
      ipcSkinsList.querySelectorAll('.ipc-skin-row').forEach(row => {
        row.addEventListener('click', () => {
          const target = row.getAttribute('data-ipc-skin');
          if (target) switchSkin(target);
        });
      });
    }
  }

  // Init
  setupCassetteControls();
  setupIpodControls();
  setupIpodClassicControls();
  await window.winampDB.init();
  await restoreSettings();
  await restoreWindowPositions();
  await loadStoredTracks();

  // Pre-warm YouTube IFrame API on startup so the first YouTube link plays instantaneously
  if (navigator.onLine) {
    engine.initYoutubePlayer().catch(() => {});
  }

  // Request Persistent Storage so browser never evicts cached songs or offline app shell
  if (navigator.storage && navigator.storage.persist) {
    navigator.storage.persist().catch(() => {});
  }

  // =========================================================================
  // AUTO VERSION CHECKER & AUTOMATIC UPDATER
  // =========================================================================
  const badgeElem = document.querySelector('.app-ver-badge');
  const CURRENT_APP_VERSION = badgeElem ? badgeElem.textContent.trim() : 'v4.9';
  let isAutoUpdating = false;
  let swRegInstance = null;

  async function triggerSeamlessUpdate(newVerLabel) {
    if (isAutoUpdating) return;
    isAutoUpdating = true;
    showToast(`🚀 พบเวอร์ชันใหม่ (${newVerLabel || 'Update'}) กำลังอัปเดตอัตโนมัติ...`);

    try {
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map(k => caches.delete(k)));
      }
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map(r => r.unregister()));
      }
    } catch (e) {}

    setTimeout(() => {
      const url = new URL(window.location.href);
      url.searchParams.set('_v', Date.now().toString());
      window.location.replace(url.toString());
    }, 600);
  }

  async function checkForNewVersionAndAutoUpdate(manual = false) {
    if (isAutoUpdating || !navigator.onLine) {
      if (manual && !navigator.onLine) {
        showToast('📴 ขณะนี้ออฟไลน์ ไม่สามารถเช็คเวอร์ชันใหม่ได้');
      }
      return;
    }

    if (manual) {
      showToast(`🔍 กำลังเช็คเวอร์ชันใหม่ (ปัจจุบัน ${CURRENT_APP_VERSION})...`);
    }

    try {
      if (swRegInstance) {
        swRegInstance.update().catch(() => {});
      }

      // Fetch fresh index.html bypassing all browser & CDN caches
      const res = await fetch(`./index.html?_check=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });

      if (!res.ok) return;
      const html = await res.text();
      const match = html.match(/class=["']app-ver-badge["'][^>]*>\s*(v[0-9.]+)\s*</i);
      const remoteVersion = match ? match[1].trim() : null;

      if (remoteVersion && remoteVersion !== CURRENT_APP_VERSION) {
        await triggerSeamlessUpdate(remoteVersion);
      } else if (manual) {
        showToast(`✅ คุณใช้เวอร์ชันล่าสุดแล้ว (${CURRENT_APP_VERSION})`);
      }
    } catch (err) {
      if (manual) {
        showToast(`✅ เวอร์ชันปัจจุบัน: ${CURRENT_APP_VERSION}`);
      }
    }
  }

  // Click on any version badge to manually check for updates immediately
  document.querySelectorAll('.app-ver-badge').forEach((badge) => {
    badge.style.cursor = 'pointer';
    badge.title = 'คลิกเพื่อเช็คอัปเดตเวอร์ชันใหม่ (Click to check for updates)';
    badge.addEventListener('click', (e) => {
      e.stopPropagation();
      checkForNewVersionAndAutoUpdate(true);
    });
  });

  // Register Service Worker for 100% Offline Support + Auto-Update
  if ('serviceWorker' in navigator) {
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing && !isAutoUpdating) {
        refreshing = true;
        window.location.reload();
      }
    });

    navigator.serviceWorker.register('./sw.js', { scope: './', updateViaCache: 'none' })
      .then((reg) => {
        swRegInstance = reg;
        if (navigator.onLine) {
          reg.update().catch(() => {});
        }
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (!newWorker) return;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              newWorker.postMessage({ type: 'SKIP_WAITING' });
            } else if (newWorker.state === 'activated' && !navigator.serviceWorker.controller) {
              showToast('✅ บันทึกแอปลงเครื่องแล้ว ครั้งต่อไปเปิดเล่นได้โดยไม่ต้องต่อเน็ต!');
            }
          });
        });
      })
      .catch((err) => {
        console.warn('Service Worker registration failed:', err);
      });
  }

  // Automatically check for new versions on startup, when returning to app, when back online, and every 60s
  setTimeout(() => checkForNewVersionAndAutoUpdate(false), 1500);
  setInterval(() => {
    if (!document.hidden && navigator.onLine) {
      checkForNewVersionAndAutoUpdate(false);
    }
  }, 60000);

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && navigator.onLine) {
      checkForNewVersionAndAutoUpdate(false);
    }
  });

  // Offline / Online status notifications
  if (!navigator.onLine) {
    setTimeout(() => {
      showToast('📴 โหมดออฟไลน์: พร้อมเล่นเพลงได้ทันทีโดยไม่ต้องใช้อินเทอร์เน็ต');
    }, 600);
  }
  window.addEventListener('offline', () => {
    showToast('📴 ตัดการเชื่อมต่อเน็ตแล้ว (ยังเปิดและเล่นเพลงแบบออฟไลน์ได้ตามปกติ)');
  });
  window.addEventListener('online', () => {
    showToast('🌐 เชื่อมต่ออินเทอร์เน็ตแล้ว');
    checkForNewVersionAndAutoUpdate(false);
  });
});
