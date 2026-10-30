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
    state.currentSkin = skinName;
    document.body.classList.remove('skin-classic', 'skin-modern', 'skin-midnight', 'skin-cassette');
    document.body.classList.add(skinName);

    if (btnSkinModern) btnSkinModern.classList.toggle('active', skinName === 'skin-modern');
    if (btnSkinClassic) btnSkinClassic.classList.toggle('active', skinName === 'skin-classic');
    if (btnSkinMidnight) btnSkinMidnight.classList.toggle('active', skinName === 'skin-midnight');

    window.winampDB.setSetting('skin', skinName);
    const skinLabels = {
      'skin-classic': 'Classic 2.91 Original',
      'skin-modern': 'Modern Silver Blue',
      'skin-midnight': 'Midnight Gold (Violet / Gold)',
      'skin-cassette': '📼 Walkman Cassette Player'
    };
    showToast(`Switched to ${skinLabels[skinName] || skinName}`);

    if (skinName === 'skin-cassette') {
      mainWindow.classList.add('hidden');
      eqWindow.classList.add('hidden');
      cassetteWindow.classList.remove('hidden');
      if (state.currentIndex >= 0 && state.currentIndex < state.playlist.length) {
        updateCassetteLabel(state.playlist[state.currentIndex]);
      }
      updateCassetteUI();
    } else {
      mainWindow.classList.remove('hidden');
      cassetteWindow.classList.add('hidden');
      const isEqEnabled = btnToggleEQ && btnToggleEQ.classList.contains('active');
      if (isEqEnabled) eqWindow.classList.remove('hidden');
    }

    updateResponsiveLayout();

    // Update timer display format
    updateTimerDisplay(audioElement.currentTime, audioElement.duration);

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
  }

  if (btnSkinModern) btnSkinModern.addEventListener('click', () => switchSkin('skin-modern'));
  if (btnSkinClassic) btnSkinClassic.addEventListener('click', () => switchSkin('skin-classic'));
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
    const isCassetteSkin = document.body.classList.contains('skin-cassette');

    if (isCassetteSkin) {
      // In Walkman Cassette mode: Winamp main and EQ are hidden
      const padL = winContainer ? parseInt(getComputedStyle(winContainer).paddingLeft, 10) || 12 : 12;
      const padR = winContainer ? parseInt(getComputedStyle(winContainer).paddingRight, 10) || 12 : 12;
      const padT = winContainer ? parseInt(getComputedStyle(winContainer).paddingTop, 10) || 12 : 12;
      const padB = winContainer ? parseInt(getComputedStyle(winContainer).paddingBottom, 10) || 12 : 12;

      const availW = Math.max(260, window.innerWidth - padL - padR);
      const availH = Math.max(200, window.innerHeight - padT - padB);

      const isPlVisible = !plWindow.classList.contains('hidden');
      const csH = cassetteWindow.classList.contains('shaded') ? 14 : 232;

      if (isLandscape) {
        document.body.classList.remove('layout-portrait', 'layout-desktop');
        document.body.classList.add('layout-landscape');

        const baseW = isPlVisible ? 550 : 275;
        const baseH = 232;

        let scale = Math.min(availW / baseW, availH / baseH);
        scale = Math.max(0.6, Math.min(scale, 3.2));

        document.documentElement.style.setProperty('--mobile-scale', scale.toFixed(3));
        document.documentElement.style.setProperty('--ws-width', `${baseW}px`);
        document.documentElement.style.setProperty('--ws-height', `${baseH}px`);

        cassetteWindow.style.left = '0px';
        cassetteWindow.style.top = '0px';

        if (isPlVisible) {
          plWindow.style.left = '275px';
          plWindow.style.top = '0px';
          plWindow.style.height = '232px';
        }
      } else {
        document.body.classList.remove('layout-landscape', 'layout-desktop');
        document.body.classList.add('layout-portrait');

        let scale = availW / 275;
        scale = Math.min(scale, 2.2);

        const minReqH = csH + (isPlVisible ? 160 : 0);
        if (minReqH * scale > availH && availH > 200) {
          const heightScale = availH / minReqH;
          if (heightScale < scale) scale = Math.max(0.65, heightScale);
        }
        scale = Math.max(0.65, scale);

        document.documentElement.style.setProperty('--mobile-scale', scale.toFixed(3));
        document.documentElement.style.setProperty('--ws-width', '275px');

        cassetteWindow.style.left = '0px';
        cassetteWindow.style.top = '0px';

        let totalH = csH;
        if (isPlVisible) {
          plWindow.style.left = '0px';
          plWindow.style.top = `${csH}px`;
          const availPlH = (availH / scale) - csH;
          const targetPlH = Math.max(160, Math.floor(availPlH));
          plWindow.style.height = `${targetPlH}px`;
          totalH = csH + targetPlH;
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

    const menuSkinClassic = document.getElementById('menuSkinClassic');
    const menuSkinModern = document.getElementById('menuSkinModern');
    const menuSkinMidnight = document.getElementById('menuSkinMidnight');
    const menuSkinCassette = document.getElementById('menuSkinCassette');
    const menuTogglePlay = document.getElementById('menuTogglePlay');
    const menuStopTrack = document.getElementById('menuStopTrack');
    const menuPrevTrack = document.getElementById('menuPrevTrack');
    const menuNextTrack = document.getElementById('menuNextTrack');
    const menuToggleEqWin = document.getElementById('menuToggleEqWin');
    const menuTogglePlWin = document.getElementById('menuTogglePlWin');
    const menuTapeClear = document.getElementById('menuTapeClear');
    const menuTapeOrange = document.getElementById('menuTapeOrange');
    const menuOpenFiles = document.getElementById('menuOpenFiles');
    const menuOpenDemo = document.getElementById('menuOpenDemo');
    const menuResetWin = document.getElementById('menuResetWin');
    const menuShowHelp = document.getElementById('menuShowHelp');

    if (menuSkinClassic) menuSkinClassic.addEventListener('click', () => { switchSkin('skin-classic'); mainContextMenu.classList.add('hidden'); });
    if (menuSkinModern) menuSkinModern.addEventListener('click', () => { switchSkin('skin-modern'); mainContextMenu.classList.add('hidden'); });
    if (menuSkinMidnight) menuSkinMidnight.addEventListener('click', () => { switchSkin('skin-midnight'); mainContextMenu.classList.add('hidden'); });
    if (menuSkinCassette) menuSkinCassette.addEventListener('click', () => { switchSkin('skin-cassette'); mainContextMenu.classList.add('hidden'); });
    if (menuTogglePlay) menuTogglePlay.addEventListener('click', () => { btnPlay.click(); mainContextMenu.classList.add('hidden'); });
    if (menuStopTrack) menuStopTrack.addEventListener('click', () => { btnStop.click(); mainContextMenu.classList.add('hidden'); });
    if (menuPrevTrack) menuPrevTrack.addEventListener('click', () => { btnPrev.click(); mainContextMenu.classList.add('hidden'); });
    if (menuNextTrack) menuNextTrack.addEventListener('click', () => { btnNext.click(); mainContextMenu.classList.add('hidden'); });
    if (menuToggleEqWin) menuToggleEqWin.addEventListener('click', () => { btnToggleEQ.click(); mainContextMenu.classList.add('hidden'); });
    if (menuTogglePlWin) menuTogglePlWin.addEventListener('click', () => { btnTogglePL.click(); mainContextMenu.classList.add('hidden'); });
    if (menuTapeClear) menuTapeClear.addEventListener('click', () => { switchCassetteTape('clear'); mainContextMenu.classList.add('hidden'); });
    if (menuTapeOrange) menuTapeOrange.addEventListener('click', () => { switchCassetteTape('orange'); mainContextMenu.classList.add('hidden'); });
    if (menuOpenFiles) menuOpenFiles.addEventListener('click', () => { fileInput.click(); mainContextMenu.classList.add('hidden'); });
    if (menuOpenDemo) menuOpenDemo.addEventListener('click', () => { loadDemoSongs(); mainContextMenu.classList.add('hidden'); });
    if (menuResetWin) menuResetWin.addEventListener('click', () => { resetWindowLayout(); mainContextMenu.classList.add('hidden'); });
    if (menuShowHelp) menuShowHelp.addEventListener('click', () => { helpModal.classList.remove('hidden'); mainContextMenu.classList.add('hidden'); });
  }

  // =========================================================================
  // CASSETTE DECK & PORTABLE WALKMAN CONTROLS
  // =========================================================================
  const TAPE_PRESETS = {
    clear:  { label: 'Clear Crystal (ม้วนใสคริสตัล)',   file: 'tape-clear-clean.png',  badge: '⚪' },
    orange: { label: 'Neon Orange (ม้วนส้มใส)',         file: 'tape-orange-clean.png', badge: '🟠' },
    red:    { label: 'Ruby Red (ม้วนแดงใส)',            file: 'tape-red-clean.png',    badge: '🔴' },
    green:  { label: 'Emerald Green (ม้วนเขียวใส)',     file: 'tape-green-clean.png',  badge: '🟢' },
    blue:   { label: 'Sky Blue (ม้วนฟ้าใส)',            file: 'tape-blue-clean.png',   badge: '🔵' },
    yellow: { label: 'Amber Yellow (ม้วนเหลืองใส)',     file: 'tape-yellow-clean.png', badge: '🟡' },
    pink:   { label: 'Neon Pink (ม้วนชมพูใส)',          file: 'tape-pink-clean.png',   badge: '🌸' }
  };

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

  function switchCassetteTape(tapeName, playSound = true) {
    const valid = TAPE_PRESETS[tapeName] ? tapeName : 'clear';
    cassetteState.tape = valid;

    const allColors = Object.keys(TAPE_PRESETS);
    if (cassetteCard) {
      allColors.forEach(c => cassetteCard.classList.remove('tape-' + c));
      cassetteCard.classList.add('tape-' + valid);
    }
    if (wmCassetteCard) {
      allColors.forEach(c => wmCassetteCard.classList.remove('tape-' + c));
      wmCassetteCard.classList.add('tape-' + valid);
    }

    const preset = TAPE_PRESETS[valid];
    const imgSrc = `assets/cassette/${preset.file}?v=2.4`;
    if (cassetteImg) cassetteImg.src = imgSrc;
    if (wmCassetteImg) wmCassetteImg.src = imgSrc;

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

    // Tape pack / spool diameter calculation
    const cur = audioElement.currentTime || 0;
    const dur = audioElement.duration || 0;
    let ratio = (dur > 0 && isFinite(dur)) ? Math.max(0, Math.min(1, cur / dur)) : 0;
    if (cassetteState.side === 'B') {
      ratio = 1 - ratio;
    }

    // Left pack shrinks from 1.0 down to 0.42; Right pack expands from 0.42 up to 1.0
    const leftScale = 1.0 - (ratio * 0.58);
    const rightScale = 0.42 + (ratio * 0.58);

    if (tapePackLeft) tapePackLeft.style.transform = `translate(-50%, -50%) scale(${leftScale.toFixed(3)})`;
    if (tapePackRight) tapePackRight.style.transform = `translate(-50%, -50%) scale(${rightScale.toFixed(3)})`;
    if (wmSpoolLeft) wmSpoolLeft.style.transform = `translate(-50%, -50%) scale(${leftScale.toFixed(3)})`;
    if (wmSpoolRight) wmSpoolRight.style.transform = `translate(-50%, -50%) scale(${rightScale.toFixed(3)})`;

    // Tape mechanical counter digits (000-999)
    const rawVal = Math.floor(cur * 0.6) + cassetteState.counterOffset;
    const countVal = ((rawVal % 1000) + 1000) % 1000;
    const countStr = String(countVal).padStart(3, '0');
    if (deckCounter) deckCounter.textContent = countStr;
    if (wmCounter) wmCounter.textContent = countStr;

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
      btnCassetteToWinamp.addEventListener('click', () => switchSkin('skin-midnight'));
    }
    if (cassetteCloseBtn) {
      cassetteCloseBtn.addEventListener('click', () => switchSkin('skin-midnight'));
    }

    // Cassette context menu items
    const cmenuSkinClassic = document.getElementById('cmenuSkinClassic');
    const cmenuSkinModern = document.getElementById('cmenuSkinModern');
    const cmenuSkinMidnight = document.getElementById('cmenuSkinMidnight');
    const cmenuSkinCassette = document.getElementById('cmenuSkinCassette');

    if (cmenuSkinClassic) cmenuSkinClassic.addEventListener('click', () => { switchSkin('skin-classic'); if (cassetteContextMenu) cassetteContextMenu.classList.add('hidden'); });
    if (cmenuSkinModern) cmenuSkinModern.addEventListener('click', () => { switchSkin('skin-modern'); if (cassetteContextMenu) cassetteContextMenu.classList.add('hidden'); });
    if (cmenuSkinMidnight) cmenuSkinMidnight.addEventListener('click', () => { switchSkin('skin-midnight'); if (cassetteContextMenu) cassetteContextMenu.classList.add('hidden'); });
    if (cmenuSkinCassette) cmenuSkinCassette.addEventListener('click', () => { switchSkin('skin-cassette'); if (cassetteContextMenu) cassetteContextMenu.classList.add('hidden'); });

    const cmenuTapeClear = document.getElementById('cmenuTapeClear');
    const cmenuTapeOrange = document.getElementById('cmenuTapeOrange');
    const cmenuTapeFlip = document.getElementById('cmenuTapeFlip');
    const cmenuSoundFx = document.getElementById('cmenuSoundFx');
    const cmenuTogglePL = document.getElementById('cmenuTogglePL');
    const cmenuOpenWalkman = document.getElementById('cmenuOpenWalkman');
    const cmenuClose = document.getElementById('cmenuClose');

    if (cmenuTapeClear) cmenuTapeClear.addEventListener('click', () => { switchCassetteTape('clear'); if (cassetteContextMenu) cassetteContextMenu.classList.add('hidden'); });
    if (cmenuTapeOrange) cmenuTapeOrange.addEventListener('click', () => { switchCassetteTape('orange'); if (cassetteContextMenu) cassetteContextMenu.classList.add('hidden'); });
    if (cmenuTapeFlip) cmenuTapeFlip.addEventListener('click', () => { toggleTapeSide(); if (cassetteContextMenu) cassetteContextMenu.classList.add('hidden'); });
    if (cmenuSoundFx) cmenuSoundFx.addEventListener('click', () => { toggleCassetteSoundFx(); if (cassetteContextMenu) cassetteContextMenu.classList.add('hidden'); });
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
        cassetteState.counterOffset = -Math.floor((audioElement.currentTime || 0) * 0.6);
        updateCassetteUI();
        engine.playMechanicalSound('click');
        showToast('⟲ รีเซ็ตเทปเคาน์เตอร์: 000');
      });
    }
    if (wmCounterReset) {
      wmCounterReset.addEventListener('click', () => {
        cassetteState.counterOffset = -Math.floor((audioElement.currentTime || 0) * 0.6);
        updateCassetteUI();
        engine.playMechanicalSound('click');
        showToast('⟲ รีเซ็ตเทปเคาน์เตอร์: 000');
      });
    }

    // Tape switch buttons on deck window and Walkman modal (7 Colors)
    document.querySelectorAll('.tape-sel-btn, .wm-tape-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const color = btn.getAttribute('data-color');
        if (color) switchCassetteTape(color);
      });
    });
    if (btnOpenWalkmanModal) btnOpenWalkmanModal.addEventListener('click', openWalkmanModal);

    // Clicking the cassette front door triggers open/tilt mechanical animation
    const cassetteDoorLid = document.getElementById('cassetteDoorLid');
    const wmDoorLid = document.getElementById('wmDoorLid');
    if (cassetteDoorLid) cassetteDoorLid.addEventListener('click', triggerDoorEjectAnimation);
    if (wmDoorLid) wmDoorLid.addEventListener('click', triggerDoorEjectAnimation);

    // Deck mechanical buttons
    if (mechPlay) mechPlay.addEventListener('click', () => { engine.playMechanicalSound('play'); btnPlay.click(); });
    if (mechPause) mechPause.addEventListener('click', () => { engine.playMechanicalSound('pause'); btnPause.click(); });
    if (mechStop) mechStop.addEventListener('click', () => { engine.playMechanicalSound('stop'); btnStop.click(); });
    if (mechRew) {
      mechRew.addEventListener('click', () => {
        engine.playMechanicalSound('click');
        if (audioElement.duration) engine.seek(Math.max(0, audioElement.currentTime - 10));
      });
    }
    if (mechFF) {
      mechFF.addEventListener('click', () => {
        engine.playMechanicalSound('click');
        if (audioElement.duration) engine.seek(Math.min(audioElement.duration, audioElement.currentTime + 10));
      });
    }
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
    if (wmKeyRew) {
      wmKeyRew.addEventListener('click', () => {
        engine.playMechanicalSound('click');
        if (audioElement.duration) engine.seek(Math.max(0, audioElement.currentTime - 10));
      });
    }
    if (wmKeyFF) {
      wmKeyFF.addEventListener('click', () => {
        engine.playMechanicalSound('click');
        if (audioElement.duration) engine.seek(Math.min(audioElement.duration, audioElement.currentTime + 10));
      });
    }
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

  function updateBalanceUI(val) {
    state.balance = val;
    engine.setBalance(val);
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
    updateBalanceUI(panVal);
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
    if (!audioElement.duration) return;
    const rect = seekTrack.getBoundingClientRect();
    let ratio = (e.clientX - rect.left) / rect.width;
    ratio = Math.max(0, Math.min(1, ratio));
    const targetTime = ratio * audioElement.duration;
    seekThumb.style.left = `${ratio * 100}%`;
    updateTimerDisplay(targetTime, audioElement.duration);
    return targetTime;
  }

  seekTrack.addEventListener('mousedown', (e) => {
    if (!audioElement.duration) return;
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
    updateTimerDisplay(audioElement.currentTime, audioElement.duration);
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
  }

  audioElement.addEventListener('timeupdate', () => {
    if (!state.isDraggingSeek) {
      const cur = audioElement.currentTime;
      const dur = audioElement.duration;
      updateTimerDisplay(cur, dur);

      if (dur && isFinite(dur)) {
        const percent = (cur / dur) * 100;
        seekThumb.style.left = `${percent}%`;

        const curSec = Math.floor(cur);
        if (curSec !== state.lastReportedSec) {
          state.lastReportedSec = curSec;
          updateMediaSessionPosition();
        }
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
  });

  audioElement.addEventListener('pause', () => {
    if (audioElement.currentTime > 0 && !audioElement.ended) {
      state.isPlaying = false;
      state.isPaused = true;
      playStatusIcon.className = 'play-status-icon pause';
      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'paused';
        updateMediaSessionPosition();
      }
      updateCassetteUI();
    }
  });

  audioElement.addEventListener('error', (e) => {
    console.error('AudioElement error:', audioElement.error);
    state.isPlaying = false;
    state.isPaused = false;
    playStatusIcon.className = 'play-status-icon stop';
    if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'none';
    updateCassetteUI();
  });

  audioElement.addEventListener('ended', () => {
    handleTrackEnded();
  });

  function handleTrackEnded() {
    if (state.repeat === 'single') {
      audioElement.currentTime = 0;
      engine.play();
    } else if (state.shuffle) {
      playRandomTrack();
    } else if (state.currentIndex < state.playlist.length - 1) {
      playTrackIndex(state.currentIndex + 1);
    } else if (state.repeat === 'all' && state.playlist.length > 0) {
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
    updateCassetteUI();
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
  }

  function setupEQFaders() {
    function updateFader(track, clientY) {
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
        engine.setPreamp(dbVal);
        window.winampDB.setSetting('eq_preamp', dbVal);
      } else {
        const freq = parseInt(bandAttr, 10);
        const bandIdx = engine.eqFrequencies.indexOf(freq);
        if (bandIdx !== -1) {
          state.bands[bandIdx] = dbVal;
          engine.setBandGain(bandIdx, dbVal);
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
    engine.setEqEnabled(state.eqEnabled);
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
        applyPresetValues(engine.presets[presetKey]);
        showToast(`EQ Preset: ${item.textContent}`);
      }
      presetsMenu.classList.add('hidden');
    });
  });

  btnResetEQ.addEventListener('click', () => {
    applyPresetValues([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    showToast('EQ reset to Flat');
  });

  function applyPresetValues(vals) {
    state.bands = [...vals];
    vals.forEach((db, idx) => {
      engine.setBandGain(idx, db);
      const freq = engine.eqFrequencies[idx];
      const track = document.querySelector(`.eq-fader-track[data-band="${freq}"]`);
      if (track) {
        const thumb = track.querySelector('.eq-fader-thumb');
        const ratio = (db / 24) + 0.5;
        thumb.style.bottom = `${ratio * 100}%`;
      }
    });
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
        } else if (e.ctrlKey || e.metaKey) {
          if (state.selectedIndices.has(idx)) {
            state.selectedIndices.delete(idx);
          } else {
            state.selectedIndices.add(idx);
          }
        } else {
          state.selectedIndices.clear();
          state.selectedIndices.add(idx);
        }
        renderPlaylist();
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
  }

  function updateMediaSession(track) {
    if ('mediaSession' in navigator && track) {
      try {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: track.title || 'Unknown Title',
          artist: track.artist || 'Winamp Web Player',
          album: track.album || 'Winamp',
          artwork: [
            { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
            { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          ],
        });
        updateMediaSessionPosition();
      } catch (e) {}
    }
  }

  function updateMediaSessionPosition() {
    if ('mediaSession' in navigator && 'setPositionState' in navigator.mediaSession) {
      const dur = audioElement.duration;
      if (dur && isFinite(dur) && dur > 0) {
        try {
          navigator.mediaSession.setPositionState({
            duration: dur,
            playbackRate: audioElement.playbackRate || 1.0,
            position: Math.min(Math.max(0, audioElement.currentTime || 0), dur)
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
      await engine.loadTrack(track.blob);
      await engine.play();
      renderPlaylist();
      window.winampDB.setSetting('lastTrackIndex', idx);
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
    if (audioElement.currentTime > 3) {
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

  // Setup MediaSession API for lock-screen & background playback controls on iOS / Android / Desktop
  if ('mediaSession' in navigator) {
    try {
      navigator.mediaSession.setActionHandler('play', async () => {
        await engine.play();
      });
      navigator.mediaSession.setActionHandler('pause', () => {
        engine.pause();
      });
      navigator.mediaSession.setActionHandler('previoustrack', () => {
        btnPrev.click();
      });
      navigator.mediaSession.setActionHandler('nexttrack', () => {
        btnNext.click();
      });
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime !== undefined) {
          engine.seek(details.seekTime);
          updateMediaSessionPosition();
        }
      });
      navigator.mediaSession.setActionHandler('seekbackward', (details) => {
        const skip = details.seekOffset || 10;
        engine.seek(Math.max(0, audioElement.currentTime - skip));
        updateMediaSessionPosition();
      });
      navigator.mediaSession.setActionHandler('seekforward', (details) => {
        const skip = details.seekOffset || 10;
        engine.seek(Math.min(audioElement.duration || 0, audioElement.currentTime + skip));
        updateMediaSessionPosition();
      });
    } catch (e) {
      console.warn('MediaSession handler registration failed:', e);
    }
  }

  btnShuffle.addEventListener('click', () => {
    state.shuffle = !state.shuffle;
    btnShuffle.classList.toggle('active', state.shuffle);
    showToast(`Shuffle: ${state.shuffle ? 'ON' : 'OFF'}`);
    window.winampDB.setSetting('shuffle', state.shuffle);
  });

  btnRepeat.addEventListener('click', () => {
    if (state.repeat === 'all') {
      state.repeat = 'single';
      btnRepeat.classList.add('active');
      showToast('Repeat: Track');
    } else if (state.repeat === 'single') {
      state.repeat = 'off';
      btnRepeat.classList.remove('active');
      showToast('Repeat: OFF');
    } else {
      state.repeat = 'all';
      btnRepeat.classList.add('active');
      showToast('Repeat: ALL');
    }
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
    state.playlist.sort((a, b) => (a.blob.name || a.title).localeCompare(b.blob.name || b.title));
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

    const rep = await window.winampDB.getSetting('repeat', 'all');
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

    const savedSoundFx = await window.winampDB.getSetting('cassette_soundfx', true);
    engine.soundFxEnabled = savedSoundFx;
    const cmenuSoundFx = document.getElementById('cmenuSoundFx');
    if (cmenuSoundFx) cmenuSoundFx.textContent = `🔊 เสียงกลไกเทป (Sound FX: ${savedSoundFx ? 'เปิด' : 'ปิด'})`;
    if (wmSoundFxBtn) wmSoundFxBtn.textContent = `🔊 SFX: ${savedSoundFx ? 'ON' : 'OFF'}`;
  }

  if (btnKeyboardHelp) btnKeyboardHelp.addEventListener('click', () => helpModal.classList.remove('hidden'));
  if (btnAbout) btnAbout.addEventListener('click', () => helpModal.classList.remove('hidden'));
  modalCloseBtn.addEventListener('click', () => helpModal.classList.add('hidden'));
  helpModal.addEventListener('click', (e) => {
    if (e.target === helpModal) helpModal.classList.add('hidden');
  });

  window.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    switch (e.key.toUpperCase()) {
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
        if (audioElement.duration) {
          engine.seek(Math.max(0, audioElement.currentTime - 5));
        }
        break;
      case 'ARROWRIGHT':
        e.preventDefault();
        if (audioElement.duration) {
          engine.seek(Math.min(audioElement.duration, audioElement.currentTime + 5));
        }
        break;
      case 'DELETE':
        document.getElementById('menuRemSelected').click();
        break;
    }
  });

  // Init
  setupCassetteControls();
  await window.winampDB.init();
  await restoreSettings();
  await restoreWindowPositions();
  await loadStoredTracks();
});
