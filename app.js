/**
 * Wortschatz Studio · Nordic Frost Engine
 * Comprehensive study operating system with:
 * - Homepage Dashboard & 7-day Activity Ribbon
 * - Decks Library (B1 Alle, Perfekt mit sein, Trennbar, A1/A2)
 * - Scroll-down Monthly Calendar & Basic Statistics
 * - Left Collapsible Frosted Sidebar Drawer
 * - Session Complete Summary Modal
 * - Neutral Rating Dock (fixed) & Speech Synthesis (de-DE)
 */

(function () {
  'use strict';

  // ================= State =================
  let allWords = [];
  let currentDeck = [];
  let currentDeckId = 'b1-all';
  let currentIndex = 0;
  let isFlipped = false;
  let isSpeaking = false;
  let wasSwiped = false;
  let currentUtterance = null; // GC protection for WebKit

  // Calendar View State
  let displayedCalDate = new Date();

  // Storage Keys
  const STUDY_LOG_KEY = 'wortschatz_study_log_v2';
  const DECK_PROGRESS_KEY = 'wortschatz_deck_progress_v2';
  const DAILY_GOAL_TARGET = 20;

  // In-memory study log: { "YYYY-MM-DD": { count: number, correct: number } }
  let studyLog = loadStudyLog();
  let deckProgress = loadDeckProgress();

  // Session stats for currently active run
  let sessionReviewedCount = 0;
  let sessionCorrectCount = 0;

  // Hierarchical Folder & Deck Architecture
  const FOLDERS_CONFIG = [
    {
      id: 'folder-nicos-weg',
      title: 'Nicos Weg (Deutsche Welle)',
      badge: 'DW Lehrwerk',
      icon: 'dw',
      desc: 'Begleitender Wortschatz zur DW-Telenovela – Lektionen, Dialoge und Alltagssituationen von A1 bis B1.',
      decks: [
        {
          id: 'nw-lek-1-10',
          title: 'Lektionen 1–10: Ankommen & Alltag',
          desc: 'Basisverben für Begrüßung, Zimmer suchen, Herkunft und Tagesablauf: aufstehen, ankommen, anfangen, heißen, kommen, sein, trinken, schlafen.',
          tag: 'DW A1',
          level: 'A1',
          filter: (w) => ['aufstehen', 'ankommen', 'anfangen', 'heißen', 'kommen', 'sein', 'trinken', 'schlafen', 'gehen', 'sehen', 'finden', 'bleiben'].includes(w.word) || (w.level && w.level.includes('A1') && !w.type?.includes('untrennbar'))
        },
        {
          id: 'nw-lek-11-20',
          title: 'Lektionen 11–20: Stadt, Freizeit & Einkaufen',
          desc: 'Verben für Verabredungen, Einkaufen, Verkehr und Orientierung: einladen, treffen, finden, fahren, nehmen, sprechen, lesen, schwimmen.',
          tag: 'DW A1/A2',
          level: 'A1 / A2',
          filter: (w) => ['einladen', 'treffen', 'finden', 'fahren', 'kaufen', 'nehmen', 'sprechen', 'lesen', 'schwimmen', 'fallen', 'tragen'].includes(w.word) || (w.level && (w.level === 'A2' || w.level === 'A1/A2') && w.hilfsverb !== 'sein')
        },
        {
          id: 'nw-lek-21-30',
          title: 'Lektionen 21–30: Arbeit, Beruf & Termine',
          desc: 'Wortschatz für Vorstellungsgespräche, Büroarbeit, Krankmeldung, Verträge und Behördengänge.',
          tag: 'DW A2/B1',
          level: 'A2 / B1',
          filter: (w) => ['anrufen', 'anziehen', 'denken', 'bringen', 'entscheiden', 'erkennen', 'helfen', 'wissen', 'senden', 'verstehen'].includes(w.word) || (w.level && (w.level.includes('B1') || w.level === 'A2/B1'))
        }
      ]
    },
    {
      id: 'folder-goethe-b1',
      title: 'B1 Goethe-Zertifikat Vorbereitung',
      badge: 'Prüfungswortschatz',
      icon: 'goethe',
      desc: 'Zertifikatsrelevante Kernstammformen, unregelmäßige Verben und morphologische Schwerpunkte.',
      decks: [
        {
          id: 'b1-all',
          title: 'B1 Stammformen (Alle 50 Verben)',
          desc: 'Vollständiger Wortschatz aller unregelmäßigen und trennbaren B1-Stammformen mit Präsens, Präteritum und Perfekt.',
          tag: 'Gesamtsammlung',
          level: 'B1 / B2',
          filter: (w) => true
        },
        {
          id: 'sein-verbs',
          title: "Perfekt mit 'sein'",
          desc: "Verben der Orts- und Zustandsveränderung, die zwingend das Hilfsverb 'sein' verlangen.",
          tag: 'Grammatik-Fokus',
          level: 'A2 / B1',
          filter: (w) => w.hilfsverb === 'sein' || (w.perfekt && w.perfekt.startsWith('ist'))
        },
        {
          id: 'trennbar',
          title: 'Trennbare Verben',
          desc: 'Präfixe wandern im Hauptsatz ans Satzende: aufstehen, anrufen, anfangen, einladen, einschlafen.',
          tag: 'Morphologie',
          level: 'A1 – B1',
          filter: (w) => w.type && w.type.toLowerCase().includes('trennbar')
        },
        {
          id: 'vokalwechsel',
          title: 'Starke Verben mit Vokalwechsel',
          desc: 'Ablautreihen und Vokalwechsel im Stamm (e → i/ie, a → ä: sprechen, brechen, helfen, geben, laufen).',
          tag: 'Ablautreihen',
          level: 'A2 / B1',
          filter: (w) => (w.praesens && (w.praesens.includes('ä') || w.praesens.includes('i'))) || (w.type && w.type.includes('unregelmäßig') && w.hilfsverb !== 'sein')
        }
      ]
    },
    {
      id: 'folder-grammatik-spezial',
      title: 'Grammatik & Spezialgruppen',
      badge: 'Spezialthemen',
      icon: 'grammar',
      desc: 'Gemischte Verben, feste Konstruktionen und untrennbare Vorsilben (be-, ent-, er-, ver-, ge-).',
      decks: [
        {
          id: 'gemischt',
          title: 'Gemischte & unregelmäßige Verben',
          desc: 'Verben mit Vokalwechsel wie starke Verben, aber dentalem Suffix (-te) im Präteritum: denken, bringen, wissen, kennen, nennen, tun.',
          tag: 'Mischverben',
          level: 'A2 / B1',
          filter: (w) => (w.type && w.type.includes('gemischt')) || ['wissen', 'kennen', 'nennen', 'denken', 'bringen', 'tun'].includes(w.word)
        },
        {
          id: 'untrennbar',
          title: 'Untrennbare Verben (be-, ent-, er-, ver-)',
          desc: "Feste Präfixe ohne 'ge-' im Partizip II: entscheiden, erkennen, geschehen, gewinnen, vergessen, verstehen.",
          tag: 'Präfixe',
          level: 'B1',
          filter: (w) => (w.type && w.type.includes('untrennbar')) || ['entscheiden', 'erkennen', 'geschehen', 'gewinnen', 'vergessen', 'verstehen'].includes(w.word)
        }
      ]
    }
  ];

  // Flat lookup map for O(1) deck retrieval
  const ALL_DECKS_MAP = {};
  FOLDERS_CONFIG.forEach(folder => {
    folder.decks.forEach(deck => {
      ALL_DECKS_MAP[deck.id] = { ...deck, folderTitle: folder.title, folderBadge: folder.badge };
    });
  });

  // Backward compatibility alias for homepage default selection
  const DECKS_CONFIG = [
    ALL_DECKS_MAP['b1-all'],
    ALL_DECKS_MAP['nw-lek-1-10'],
    ALL_DECKS_MAP['sein-verbs'],
    ALL_DECKS_MAP['trennbar']
  ].filter(Boolean);

  // ================= DOM Elements =================
  // Views
  const viewHome = document.getElementById('view-home');
  const viewDecks = document.getElementById('view-decks');
  const viewStudy = document.getElementById('view-study');

  // Decks & Folders Library View Elements
  const libraryFoldersContainer = document.getElementById('library-folders-container');
  const btnLibraryBackHome = document.getElementById('btn-library-back-home');
  const libraryTotalPill = document.getElementById('library-total-pill');

  // Sidebar
  const sidebar = document.getElementById('sidebar');
  const sidebarBackdrop = document.getElementById('sidebar-backdrop');
  const btnSidebarToggle = document.getElementById('btn-sidebar-toggle');
  const navItemHome = document.getElementById('nav-item-home');
  const navItemDecks = document.getElementById('nav-item-decks');
  const navItemCalendar = document.getElementById('nav-item-calendar');
  const navItemAppearance = document.getElementById('nav-item-appearance');
  const sidebarDeckShortcuts = document.getElementById('sidebar-deck-shortcuts');
  // Legacy aliases so existing code that uses these variables still works
  const sidebarDrawer = sidebar;
  const sidebarBackdropEl = sidebarBackdrop;
  const btnSidebarOpen = btnSidebarToggle;
  const btnSidebarClose = null; // no longer exists

  // Header
  const headerBrandGroup = document.getElementById('header-brand-group');
  const btnBackHome = document.getElementById('btn-back-home');
  const btnBackHomeText = document.getElementById('btn-back-home-text');
  const streakCounter = document.getElementById('streak-counter');
  const btnQuickTheme = document.getElementById('btn-quick-theme');

  // Homepage Elements
  const horizontalWeekStrip = document.getElementById('horizontal-week-strip');
  const goalStatusText = document.getElementById('goal-status-text');
  const goalBarFill = document.getElementById('goal-bar-fill');
  const goalPercent = document.getElementById('goal-percent');
  const decksGrid = document.getElementById('decks-grid');
  const btnLearnAllDecks = document.getElementById('btn-learn-all-decks');

  // Appearance Customization Modal Elements
  const modalAppearance = document.getElementById('modal-appearance');
  const btnAppearanceClose = document.getElementById('btn-appearance-close');
  const btnAppearanceDone = document.getElementById('btn-appearance-done');
  const themeCardOptions = document.querySelectorAll('.theme-card-option');
  const fontCardOptions = document.querySelectorAll('.font-card-option');

  // Stats Tiles
  const statTotalReviewed = document.getElementById('stat-total-reviewed');
  const statCurrentStreak = document.getElementById('stat-current-streak');
  const statRecallRate = document.getElementById('stat-recall-rate');

  // Month Calendar & Bento Elements
  const calendarMonthTitle = document.getElementById('calendar-month-title');
  const calendarDaysGrid = document.getElementById('calendar-days-grid');
  const btnCalPrev = document.getElementById('btn-cal-prev');
  const btnCalNext = document.getElementById('btn-cal-next');

  // Bento Grammar Mastery Elements
  const countTrennbar = document.getElementById('count-trennbar');
  const barTrennbar = document.getElementById('bar-trennbar');
  const countSein = document.getElementById('count-sein');
  const barSein = document.getElementById('bar-sein');
  const countUnregelmaessig = document.getElementById('count-unregelmaessig');
  const barStrong = document.getElementById('bar-strong');
  const btnQuickDrill = document.getElementById('btn-quick-drill');

  // Study Mode Elements
  const progressBar = document.getElementById('progress-bar');
  const cardCounter = document.getElementById('card-counter');
  const deckIndicator = document.getElementById('deck-indicator');
  const flashcard = document.getElementById('flashcard');

  // Front Elements
  const frontWord = document.getElementById('front-word');
  const frontLevel = document.getElementById('front-level');
  const frontType = document.getElementById('front-type');
  const btnAudioFront = document.getElementById('btn-audio-front');

  // Back Elements
  const cardBackScroll = document.getElementById('card-back-scroll');
  const backWord = document.getElementById('back-word');
  const backMeaning = document.getElementById('back-meaning');
  const backLevel = document.getElementById('back-level');
  const backType = document.getElementById('back-type');
  const btnAudioBack = document.getElementById('btn-audio-back');

  // Full Präsens Conjugation Elements
  const conjPraesensIch = document.getElementById('conj-praesens-ich');
  const conjPraesensDu = document.getElementById('conj-praesens-du');
  const conjPraesensEr = document.getElementById('conj-praesens-er');
  const conjPraesensWir = document.getElementById('conj-praesens-wir');
  const conjPraesensIhr = document.getElementById('conj-praesens-ihr');

  // Stammformen Elements
  const conjPraeteritum = document.getElementById('conj-praeteritum');
  const cellPraeteritum = document.getElementById('cell-praeteritum');
  const cellPerfekt = document.getElementById('cell-perfekt');
  const perfektAuxPill = document.getElementById('perfekt-aux-pill');
  const conjAuxText = document.getElementById('conj-aux-text');
  const conjPartizip2 = document.getElementById('conj-partizip2');

  // Example Sentences with 3-Tense Switcher
  const tenseTabs = document.querySelectorAll('.tense-tab');
  const exampleDe = document.getElementById('example-de');
  const exampleEn = document.getElementById('example-en');
  const noteText = document.getElementById('note-text');
  const btnAudioSentence = document.getElementById('btn-audio-sentence');
  let currentExampleTense = 'praesens';

  // Rating Buttons
  const btnGrade1 = document.getElementById('btn-grade-1');
  const btnGrade2 = document.getElementById('btn-grade-2');
  const btnGrade3 = document.getElementById('btn-grade-3');
  const btnGrade4 = document.getElementById('btn-grade-4');

  // Session Summary Modal
  const modalSessionComplete = document.getElementById('modal-session-complete');
  const summaryDeckTitle = document.getElementById('summary-deck-title');
  const summaryCount = document.getElementById('summary-count');
  const summaryRate = document.getElementById('summary-rate');
  const btnSummaryRestart = document.getElementById('btn-summary-restart');
  const btnSummaryHome = document.getElementById('btn-summary-home');

  // ================= Speech Synthesis =================
  let germanVoice = null;

  function initVoices() {
    if (!('speechSynthesis' in window)) return;
    const voices = window.speechSynthesis.getVoices();
    germanVoice = voices.find(v => v.lang === 'de-DE' || v.lang === 'de_DE') ||
                  voices.find(v => v.lang.startsWith('de'));
  }

  if ('speechSynthesis' in window) {
    initVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = initVoices;
    }
  }

  function speakText(text, onComplete, targetButton = null) {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    currentUtterance = new SpeechSynthesisUtterance(text);
    currentUtterance.lang = 'de-DE';
    currentUtterance.rate = 0.90;
    if (germanVoice) currentUtterance.voice = germanVoice;

    setSpeakingState(true, targetButton);

    currentUtterance.onend = () => {
      setSpeakingState(false, targetButton);
      currentUtterance = null;
      if (onComplete) onComplete();
    };

    currentUtterance.onerror = () => {
      setSpeakingState(false, targetButton);
      currentUtterance = null;
    };

    window.speechSynthesis.speak(currentUtterance);
  }

  function setSpeakingState(speaking, targetButton = null) {
    isSpeaking = speaking;
    if (targetButton) {
      if (speaking) targetButton.classList.add('is-speaking');
      else targetButton.classList.remove('is-speaking');
      return;
    }

    if (speaking) {
      btnAudioFront.classList.add('is-speaking');
      btnAudioBack.classList.add('is-speaking');
    } else {
      btnAudioFront.classList.remove('is-speaking');
      btnAudioBack.classList.remove('is-speaking');
    }
  }

  // ================= Date & Streak Helpers =================
  function formatDateKey(d) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function getTodayKey() {
    return formatDateKey(new Date());
  }

  function calculateStreak() {
    let streak = 0;
    const checkDate = new Date();
    const todayKey = formatDateKey(checkDate);

    // If studied today, start streak counting from today
    if (studyLog[todayKey] && studyLog[todayKey].count > 0) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      // Check if yesterday was studied
      checkDate.setDate(checkDate.getDate() - 1);
      const yesterdayKey = formatDateKey(checkDate);
      if (!studyLog[yesterdayKey] || studyLog[yesterdayKey].count === 0) {
        return 0; // Streak broken
      }
    }

    // Count backwards continuous days
    while (true) {
      const key = formatDateKey(checkDate);
      if (studyLog[key] && studyLog[key].count > 0) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  }

  // ================= Storage Helpers =================
  function loadStudyLog() {
    try {
      const data = localStorage.getItem(STUDY_LOG_KEY);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }

  function saveStudyLog() {
    try {
      localStorage.setItem(STUDY_LOG_KEY, JSON.stringify(studyLog));
    } catch {}
  }

  function loadDeckProgress() {
    try {
      const data = localStorage.getItem(DECK_PROGRESS_KEY);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }

  function saveDeckProgress() {
    try {
      localStorage.setItem(DECK_PROGRESS_KEY, JSON.stringify(deckProgress));
    } catch {}
  }

  function recordStudyParticipation(isCorrect) {
    const today = getTodayKey();
    if (!studyLog[today]) {
      studyLog[today] = { count: 0, correct: 0 };
    }
    studyLog[today].count++;
    if (isCorrect) {
      studyLog[today].correct++;
    }
    saveStudyLog();

    // Session stats
    sessionReviewedCount++;
    if (isCorrect) sessionCorrectCount++;

    // Track deck progress
    if (!deckProgress[currentDeckId]) {
      deckProgress[currentDeckId] = { reviewed: 0 };
    }
    deckProgress[currentDeckId].reviewed = Math.min(
      currentDeck.length,
      (deckProgress[currentDeckId].reviewed || 0) + 1
    );
    saveDeckProgress();

    updateDashboardStats();
  }

  // ================= Appearance & Theme Management =================
  const THEME_KEY = 'wortschatz_theme_v2';
  const THEMES = ['porcelain', 'nordic', 'chalk'];

  function initTheme() {
    const saved = localStorage.getItem(THEME_KEY) || 'porcelain';
    setTheme(saved);
  }

  function setTheme(theme) {
    if (!THEMES.includes(theme)) theme = 'porcelain';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);

    // Update meta theme-color for browser chrome / iOS Safari
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      if (theme === 'porcelain') metaTheme.setAttribute('content', '#F1F4F8');
      else if (theme === 'nordic') metaTheme.setAttribute('content', '#FAF8F5');
      else metaTheme.setAttribute('content', '#FFFFFF');
    }

    // Update active state in appearance modal cards
    if (themeCardOptions && themeCardOptions.length > 0) {
      themeCardOptions.forEach(btn => {
        const btnTheme = btn.getAttribute('data-theme-set');
        const isMatch = btnTheme === theme;
        btn.classList.toggle('active', isMatch);
        const checkSpan = btn.querySelector('.option-check');
        if (checkSpan) {
          checkSpan.textContent = isMatch ? '✓' : '';
        }
      });
    }
  }

  function toggleNextTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'porcelain';
    const nextIdx = (THEMES.indexOf(current) + 1) % THEMES.length;
    setTheme(THEMES[nextIdx]);
  }

  // ================= Typography & Font Management =================
  const FONT_KEY = 'wortschatz_font_v2';
  const FONTS = ['inter', 'lexend', 'system'];

  function initFont() {
    const saved = localStorage.getItem(FONT_KEY) || 'inter';
    setFont(saved);
  }

  function setFont(fontName) {
    if (!FONTS.includes(fontName)) fontName = 'inter';
    document.documentElement.setAttribute('data-font', fontName);
    localStorage.setItem(FONT_KEY, fontName);

    if (fontCardOptions && fontCardOptions.length > 0) {
      fontCardOptions.forEach(btn => {
        const btnFont = btn.getAttribute('data-font-set');
        const isMatch = btnFont === fontName;
        btn.classList.toggle('active', isMatch);
        const checkSpan = btn.querySelector('.option-check');
        if (checkSpan) {
          checkSpan.textContent = isMatch ? '✓' : '';
        }
      });
    }
  }

  // ================= Appearance Customization Modal Controller =================
  function closeAppearanceModal() {
    if (modalAppearance) {
      modalAppearance.classList.add('hidden');
    }
  }

  function openAppearanceModal() {
    closeSidebar();
    if (modalAppearance) {
      modalAppearance.classList.remove('hidden');
    }
  }

  // ================= Create Folder Modal Controller =================
  const modalCreateFolder   = document.getElementById('modal-create-folder');
  const btnCreateFolder      = document.getElementById('btn-create-folder');
  const btnFolderModalClose  = document.getElementById('btn-folder-modal-close');
  const btnFolderCancel      = document.getElementById('btn-folder-cancel');
  const btnFolderSave        = document.getElementById('btn-folder-save');
  const inputFolderTitle     = document.getElementById('input-folder-title');
  const inputFolderDesc      = document.getElementById('input-folder-desc');
  const inputFolderBadge     = document.getElementById('input-folder-badge');
  const folderDeckSelector   = document.getElementById('folder-deck-selector');

  function openCreateFolderModal() {
    if (!modalCreateFolder) return;
    if (inputFolderTitle) inputFolderTitle.value = '';
    if (inputFolderDesc) inputFolderDesc.value = '';
    if (inputFolderBadge) inputFolderBadge.value = 'MEINE SAMMLUNG';

    if (folderDeckSelector) {
      folderDeckSelector.innerHTML = '';
      const renderedDecks = new Set();
      Object.values(ALL_DECKS_MAP).forEach(deck => {
        if (!deck || renderedDecks.has(deck.id)) return;
        renderedDecks.add(deck.id);
        const item = document.createElement('label');
        item.className = 'deck-checkbox-item';
        item.innerHTML = `
          <input type="checkbox" value="${deck.id}">
          <span><strong>${deck.title}</strong> (${deck.level || 'B1'})</span>
        `;
        folderDeckSelector.appendChild(item);
      });
    }

    modalCreateFolder.classList.remove('hidden');
    if (inputFolderTitle) setTimeout(() => inputFolderTitle.focus(), 80);
  }

  function closeCreateFolderModal() {
    if (modalCreateFolder) modalCreateFolder.classList.add('hidden');
  }

  function saveNewFolder() {
    const title = (inputFolderTitle && inputFolderTitle.value || '').trim();
    if (!title) {
      alert('Bitte gib einen Ordnernamen ein.');
      if (inputFolderTitle) inputFolderTitle.focus();
      return;
    }
    const desc = (inputFolderDesc && inputFolderDesc.value || '').trim() || 'Benutzerdefinierte Sammlung';
    const badge = (inputFolderBadge && inputFolderBadge.value || '').trim() || 'MEINE SAMMLUNG';

    const selectedDeckIds = [];
    if (folderDeckSelector) {
      const checked = folderDeckSelector.querySelectorAll('input[type="checkbox"]:checked');
      checked.forEach(cb => selectedDeckIds.push(cb.value));
    }

    const newFolder = {
      id: 'folder-custom-' + Date.now(),
      title,
      desc,
      badge,
      icon: 'custom',
      isCustom: true,
      deckIds: selectedDeckIds
    };

    const custom = loadCustomFolders();
    custom.push(newFolder);
    saveCustomFolders(custom);

    closeCreateFolderModal();
    renderDecksLibraryView();
    renderSidebarDeckShortcuts();
  }

  // ================= View Routing with Fluid Sliding Transitions =================
  let currentActiveView = 'home';
  let previousView = 'home';

  function switchView(viewName, deckId = null) {
    if (viewName !== currentActiveView) {
      previousView = currentActiveView;
      currentActiveView = viewName;
    }

    if (modalSessionComplete) modalSessionComplete.classList.add('hidden');

    if (viewName === 'study') {
      viewHome.classList.add('hidden');
      if (viewDecks) viewDecks.classList.add('hidden');
      viewStudy.classList.remove('hidden');
      viewStudy.classList.remove('view-slide-in-left');
      viewStudy.classList.add('view-slide-in-right');

      btnBackHome.classList.remove('hidden');
      if (btnBackHomeText) {
        btnBackHomeText.textContent = (previousView === 'decks') ? 'Alle Decks' : 'Übersicht';
      }
      headerBrandGroup.classList.add('hidden');

      if (deckId) {
        startDeckStudy(deckId);
      }
    } else if (viewName === 'decks') {
      viewHome.classList.add('hidden');
      viewStudy.classList.add('hidden');
      if (viewDecks) {
        viewDecks.classList.remove('hidden');
        viewDecks.classList.remove('view-slide-in-left');
        viewDecks.classList.add('view-slide-in-right');
      }

      btnBackHome.classList.remove('hidden');
      if (btnBackHomeText) {
        btnBackHomeText.textContent = 'Übersicht';
      }
      headerBrandGroup.classList.remove('hidden');

      // Update sidebar nav active classes
      if (navItemHome) navItemHome.classList.remove('active');
      if (navItemDecks) navItemDecks.classList.add('active');

      renderDecksLibraryView();
    } else {
      // Default: 'home'
      viewStudy.classList.add('hidden');
      if (viewDecks) viewDecks.classList.add('hidden');
      viewHome.classList.remove('hidden');
      viewHome.classList.remove('view-slide-in-right');
      viewHome.classList.add('view-slide-in-left');

      btnBackHome.classList.add('hidden');
      headerBrandGroup.classList.remove('hidden');

      // Update sidebar nav active classes
      if (navItemHome) navItemHome.classList.add('active');
      if (navItemDecks) navItemDecks.classList.remove('active');

      updateDashboardStats();
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ================= Sidebar Management =================
  const isMobile = () => window.innerWidth <= 768;

  function openSidebar() {
    if (!sidebar) return;
    sidebar.setAttribute('data-expanded', 'true');
    if (isMobile() && sidebarBackdrop) {
      sidebarBackdrop.classList.add('is-open');
    }
  }

  function closeSidebar() {
    if (!sidebar) return;
    sidebar.setAttribute('data-expanded', 'false');
    if (sidebarBackdrop) sidebarBackdrop.classList.remove('is-open');
  }

  function toggleSidebar() {
    if (!sidebar) return;
    const isExpanded = sidebar.getAttribute('data-expanded') === 'true';
    if (isExpanded) {
      closeSidebar();
    } else {
      openSidebar();
    }
  }

  // ================= Dashboard Renderers =================
  function updateDashboardStats() {
    const streak = calculateStreak();
    streakCounter.textContent = `${streak} ${streak === 1 ? 'Tag' : 'Tage'}`;
    statCurrentStreak.textContent = `${streak} ${streak === 1 ? 'Tag' : 'Tage'}`;

    // Daily Goal
    const today = getTodayKey();
    const todayCount = (studyLog[today] && studyLog[today].count) || 0;
    const goalPercentVal = Math.min(100, Math.round((todayCount / DAILY_GOAL_TARGET) * 100));

    goalStatusText.textContent = `Ziel: ${todayCount} / ${DAILY_GOAL_TARGET} Wörter heute`;
    goalBarFill.style.width = `${goalPercentVal}%`;
    goalPercent.textContent = `${goalPercentVal}%`;

    // Global Stats
    let totalRev = 0;
    let totalCor = 0;
    Object.values(studyLog).forEach(entry => {
      totalRev += entry.count || 0;
      totalCor += entry.correct || 0;
    });

    statTotalReviewed.textContent = totalRev;
    if (totalRev > 0) {
      const overallRate = Math.round((totalCor / totalRev) * 100);
      statRecallRate.textContent = `${overallRate}%`;
    } else {
      statRecallRate.textContent = '100%';
    }

    renderHorizontalCalendar();
    renderMonthCalendar(displayedCalDate);
    renderDecksGrid();
    updateGrammarMastery();
  }

  // Grammar & Morphology Bento Breakdown Renderer
  function updateGrammarMastery() {
    if (!allWords || allWords.length === 0) return;

    const totalTrennbar = allWords.filter(w => w.type && w.type.toLowerCase().includes('trennbar')).length || 11;
    const totalSein = allWords.filter(w => w.hilfsverb === 'sein').length || 14;
    const totalStrong = allWords.filter(w => w.praeteritum && !w.praeteritum.endsWith('te')).length || 36;

    // Track progression via deckProgress
    const reviewedTrennbar = (deckProgress['trennbar'] && deckProgress['trennbar'].reviewed) || 0;
    const reviewedSein = (deckProgress['sein-verbs'] && deckProgress['sein-verbs'].reviewed) || 0;
    const reviewedAll = (deckProgress['b1-all'] && deckProgress['b1-all'].reviewed) || 0;
    const reviewedStrong = Math.min(totalStrong, Math.round(reviewedAll * (totalStrong / (allWords.length || 50))));

    if (countTrennbar) countTrennbar.textContent = `${reviewedTrennbar} / ${totalTrennbar}`;
    if (barTrennbar) barTrennbar.style.width = `${Math.round((reviewedTrennbar / totalTrennbar) * 100)}%`;

    if (countSein) countSein.textContent = `${reviewedSein} / ${totalSein}`;
    if (barSein) barSein.style.width = `${Math.round((reviewedSein / totalSein) * 100)}%`;

    if (countUnregelmaessig) countUnregelmaessig.textContent = `${reviewedStrong} / ${totalStrong}`;
    if (barStrong) barStrong.style.width = `${Math.round((reviewedStrong / totalStrong) * 100)}%`;
  }

  // Top Horizontal 7-Day Activity Strip
  function renderHorizontalCalendar() {
    horizontalWeekStrip.innerHTML = '';
    const dayNames = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
    const today = new Date();

    // Past 6 days + Today
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateKey = formatDateKey(d);
      const isToday = i === 0;
      const entry = studyLog[dateKey];
      const hasParticipated = entry && entry.count > 0;

      const pill = document.createElement('div');
      pill.className = `day-pill ${isToday ? 'is-today' : ''}`;
      pill.innerHTML = `
        <span class="day-name">${dayNames[d.getDay()]}</span>
        <span class="day-number">${d.getDate()}</span>
        <span class="day-dot ${hasParticipated ? 'participated' : ''}" title="${hasParticipated ? entry.count + ' Wörter gelernt' : 'Keine Aktivität'}"></span>
      `;
      horizontalWeekStrip.appendChild(pill);
    }
  }

  // Decks Grid Renderer (Homepage)
  function renderDecksGrid() {
    decksGrid.innerHTML = '';
    sidebarDeckShortcuts.innerHTML = '';

    // Homepage featured decks (4 primary decks)
    const featuredDecks = [
      ALL_DECKS_MAP['b1-all'] || DECKS_CONFIG[0],
      ALL_DECKS_MAP['nw-lek-1-10'] || DECKS_CONFIG[1],
      ALL_DECKS_MAP['sein-verbs'] || DECKS_CONFIG[2],
      ALL_DECKS_MAP['trennbar'] || DECKS_CONFIG[3]
    ].filter(Boolean);

    featuredDecks.forEach(cfg => {
      const filtered = allWords.filter(cfg.filter);
      const deckCount = filtered.length;
      const reviewed = (deckProgress[cfg.id] && deckProgress[cfg.id].reviewed) || 0;
      const masteryPct = deckCount > 0 ? Math.round((reviewed / deckCount) * 100) : 0;

      // Homepage Deck Card (Whole Tile Clickable)
      const card = document.createElement('div');
      card.className = 'deck-card';
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.setAttribute('aria-label', `${cfg.title} lernen (${deckCount} Wörter)`);
      card.innerHTML = `
        <div class="deck-card-top">
          <div class="deck-tags-row">
            <span class="chip chip-secondary">${cfg.level}</span>
            <span class="deck-count-pill">${deckCount} Wörter</span>
          </div>
          <h3 class="deck-title">${cfg.title}</h3>
          <p class="deck-desc">${cfg.desc}</p>
        </div>
        <div class="deck-card-bottom">
          <span class="deck-mastery-text">${masteryPct}% gelernt</span>
          <span class="deck-learn-btn">Lernen</span>
        </div>
      `;

      card.addEventListener('click', () => {
        switchView('study', cfg.id);
      });
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          switchView('study', cfg.id);
        }
      });

      decksGrid.appendChild(card);
    });

    // Special 5th Tile: Browse All Decks & Folders
    const browseAllCard = document.createElement('div');
    browseAllCard.className = 'deck-card-browse-more';
    browseAllCard.setAttribute('role', 'button');
    browseAllCard.setAttribute('tabindex', '0');
    browseAllCard.setAttribute('aria-label', 'Alle Decks und Ordner anzeigen');
    browseAllCard.innerHTML = `
      <div class="browse-more-icon">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
          <line x1="12" y1="11" x2="12" y2="17"></line>
          <line x1="9" y1="14" x2="15" y2="14"></line>
        </svg>
      </div>
      <h3 class="browse-more-title">Alle Ordner &amp; Decks</h3>
      <p class="browse-more-desc">Nicos Weg, Goethe B1 &amp; Grammatik (3 Ordner, 9 Decks)</p>
    `;
    browseAllCard.addEventListener('click', () => {
      switchView('decks');
    });
    browseAllCard.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        switchView('decks');
      }
    });
    decksGrid.appendChild(browseAllCard);
  }

  // ================= Custom Folders Storage & Management =================
  const CUSTOM_FOLDERS_KEY = 'wortschatz_custom_folders_v2';

  function loadCustomFolders() {
    try {
      const data = localStorage.getItem(CUSTOM_FOLDERS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  function saveCustomFolders(folders) {
    try {
      localStorage.setItem(CUSTOM_FOLDERS_KEY, JSON.stringify(folders));
    } catch {}
  }

  function getAllFolders() {
    const custom = loadCustomFolders();
    const reconstructedCustom = custom.map(folder => ({
      ...folder,
      decks: (folder.deckIds || []).map(id => ALL_DECKS_MAP[id]).filter(Boolean)
    }));
    return [...FOLDERS_CONFIG, ...reconstructedCustom];
  }

  function renderSidebarDeckShortcuts() {
    if (!sidebarDeckShortcuts) return;
    sidebarDeckShortcuts.innerHTML = '';
    const allFoldersList = getAllFolders();

    allFoldersList.forEach(folder => {
      const folderHeader = document.createElement('div');
      folderHeader.className = 'sidebar-section-title nav-label';
      folderHeader.style.padding = '8px 12px 2px';
      folderHeader.textContent = folder.title;
      sidebarDeckShortcuts.appendChild(folderHeader);

      folder.decks.forEach(deck => {
        const filtered = allWords.filter(deck.filter || (() => true));
        const deckCount = filtered.length;

        const shortcutBtn = document.createElement('button');
        shortcutBtn.className = 'sidebar-deck-item';
        shortcutBtn.innerHTML = `
          <span class="nav-label">${deck.title}</span>
          <span class="deck-pill-count nav-label">${deckCount}</span>
        `;
        shortcutBtn.addEventListener('click', () => {
          if (isMobile()) closeSidebar();
          switchView('study', deck.id);
        });
        sidebarDeckShortcuts.appendChild(shortcutBtn);
      });
    });
  }

  // Sidebar Shortcuts: Organized by Folders (Initial call)
  renderSidebarDeckShortcuts();

  // ================= Dedicated Decks & Folders Library View Renderer =================
  function renderDecksLibraryView() {
    if (!libraryFoldersContainer) return;
    libraryFoldersContainer.innerHTML = '';

    const allFoldersList = getAllFolders();
    let totalFolders = allFoldersList.length;
    let totalDecks = 0;
    let totalCards = allWords.length;

    allFoldersList.forEach(folder => {
      totalDecks += folder.decks.length;

      const folderCard = document.createElement('section');
      folderCard.className = 'folder-card';
      folderCard.setAttribute('aria-label', `Ordner: ${folder.title}`);

      // Folder icon selection
      let iconSvg = '';
      if (folder.icon === 'dw') {
        iconSvg = `
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="6 4 20 12 6 20"></polygon>
          </svg>
        `;
      } else if (folder.icon === 'goethe') {
        iconSvg = `
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="8" r="6"></circle>
            <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
          </svg>
        `;
      } else if (folder.icon === 'custom') {
        iconSvg = `
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
          </svg>
        `;
      } else {
        iconSvg = `
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
          </svg>
        `;
      }

      // Folder Header
      const headerEl = document.createElement('div');
      headerEl.className = 'folder-header';
      headerEl.innerHTML = `
        <div class="folder-header-left">
          <div class="folder-icon-box" aria-hidden="true">${iconSvg}</div>
          <div class="folder-info">
            <div class="folder-title-row">
              <h2 class="folder-title">${folder.title}</h2>
              <span class="folder-badge">${folder.badge}</span>
              ${folder.isCustom ? `<button class="btn-delete-folder" data-folder-id="${folder.id}" title="Diesen Ordner löschen" style="background:none; border:none; cursor:pointer; color:var(--text-muted); font-size:13px; margin-left:6px; padding:2px 6px;">✕</button>` : ''}
            </div>
            <p class="folder-desc">${folder.desc}</p>
          </div>
        </div>
        <div class="folder-meta-pill">${folder.decks.length} Decks</div>
      `;
      folderCard.appendChild(headerEl);

      // Child Decks Grid
      const decksGridEl = document.createElement('div');
      decksGridEl.className = 'folder-decks-grid';

      folder.decks.forEach(deck => {
        const filtered = allWords.filter(deck.filter || (() => true));
        const deckCount = filtered.length;
        const reviewed = (deckProgress[deck.id] && deckProgress[deck.id].reviewed) || 0;
        const masteryPct = deckCount > 0 ? Math.round((reviewed / deckCount) * 100) : 0;

        const deckCard = document.createElement('div');
        deckCard.className = 'deck-card';
        deckCard.setAttribute('role', 'button');
        deckCard.setAttribute('tabindex', '0');
        deckCard.setAttribute('aria-label', `${deck.title} starten (${deckCount} Wörter)`);
        deckCard.innerHTML = `
          <div class="deck-card-top">
            <div class="deck-tags-row">
              <span class="chip-secondary">${deck.level || 'B1'}</span>
              <span class="deck-count-pill">${deckCount} Wörter</span>
            </div>
            <h3 class="deck-title">${deck.title}</h3>
            <p class="deck-desc">${deck.desc}</p>
          </div>
          <div class="deck-card-bottom">
            <span class="deck-mastery-text">${masteryPct}% gelernt</span>
            <span class="deck-learn-btn">Lernen →</span>
          </div>
        `;

        deckCard.addEventListener('click', () => {
          switchView('study', deck.id);
        });
        deckCard.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            switchView('study', deck.id);
          }
        });

        decksGridEl.appendChild(deckCard);
      });

      // If odd number of decks, render empty 4th slot matching reference media_1794403818339_0f24ff7f.jpg
      if (folder.decks.length % 2 !== 0) {
        const emptySlot = document.createElement('div');
        emptySlot.className = 'deck-card-empty-slot';
        emptySlot.innerHTML = `
          <button class="add-deck-slot-btn" title="Weiteres Deck zu diesem Ordner hinzufügen">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span>Deck hinzufügen</span>
          </button>
        `;
        const addBtn = emptySlot.querySelector('.add-deck-slot-btn');
        if (addBtn) {
          addBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            openCreateFolderModal();
          });
        }
        decksGridEl.appendChild(emptySlot);
      }

      folderCard.appendChild(decksGridEl);
      libraryFoldersContainer.appendChild(folderCard);
    });

    // Delete custom folder handler
    const deleteBtns = libraryFoldersContainer.querySelectorAll('.btn-delete-folder');
    deleteBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const fId = btn.getAttribute('data-folder-id');
        if (confirm('Möchtest du diesen Ordner wirklich löschen?')) {
          const custom = loadCustomFolders().filter(f => f.id !== fId);
          saveCustomFolders(custom);
          renderDecksLibraryView();
          renderSidebarDeckShortcuts();
        }
      });
    });

    if (libraryTotalPill) {
      libraryTotalPill.textContent = `${totalFolders} Ordner · ${totalDecks} Decks · ${totalCards} Wörter`;
    }
  }

  // Monthly Calendar Grid Renderer (Scroll-down)
  function renderMonthCalendar(date) {
    const year = date.getFullYear();
    const month = date.getMonth();

    const monthNames = [
      'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
      'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
    ];
    calendarMonthTitle.textContent = `${monthNames[month]} ${year}`;

    calendarDaysGrid.innerHTML = '';

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Adjust for Monday start (0 = Sunday in JS, so 1 = Monday)
    let startDayIndex = firstDay.getDay() - 1;
    if (startDayIndex === -1) startDayIndex = 6;

    const totalDays = lastDay.getDate();
    const todayKey = getTodayKey();

    // Previous month padding
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayIndex - 1; i >= 0; i--) {
      const cell = document.createElement('div');
      cell.className = 'cal-day-cell other-month';
      cell.textContent = prevMonthLastDay - i;
      calendarDaysGrid.appendChild(cell);
    }

    // Current month days
    for (let day = 1; day <= totalDays; day++) {
      const thisDate = new Date(year, month, day);
      const dateKey = formatDateKey(thisDate);
      const isToday = dateKey === todayKey;
      const entry = studyLog[dateKey];
      const hasParticipated = entry && entry.count > 0;

      const cell = document.createElement('div');
      cell.className = `cal-day-cell ${isToday ? 'is-today' : ''} ${hasParticipated ? 'is-participated' : ''}`;
      cell.innerHTML = `<span class="cal-day-num">${day}</span>`;

      if (hasParticipated) {
        cell.title = `${dateKey}: ${entry.count} Wörter wiederholt (${entry.correct || 0} richtig)`;
      } else if (isToday) {
        cell.title = 'Heute (noch nicht geübt)';
      }

      calendarDaysGrid.appendChild(cell);
    }
  }

  // ================= Study Mode Engine =================
  function startDeckStudy(deckId) {
    currentDeckId = deckId;
    const config = ALL_DECKS_MAP[deckId] || DECKS_CONFIG.find(c => c.id === deckId) || DECKS_CONFIG[0];
    currentDeck = allWords.filter(config.filter);
    if (!currentDeck || currentDeck.length === 0) {
      currentDeck = allWords;
    }

    deckIndicator.textContent = config.title;
    currentIndex = 0;
    sessionReviewedCount = 0;
    sessionCorrectCount = 0;

    renderCurrentCard();
  }

  function renderCurrentCard() {
    if (!currentDeck || currentDeck.length === 0) return;
    const item = currentDeck[currentIndex];

    // Expose for vocab detail view
    window.currentWordData = item;

    // Reset card flip & scroll position
    if (isFlipped) {
      flashcard.classList.remove('is-flipped');
      isFlipped = false;
    }
    if (cardBackScroll) {
      cardBackScroll.scrollTop = 0;
    }

    // Front Side (German word & tags only)
    frontWord.textContent = item.word;
    frontLevel.textContent = item.level || 'B1';
    frontType.textContent = item.type || 'Verb';

    // Back Side (Revealed lemma and meaning)
    backWord.textContent = item.word;
    backMeaning.textContent = item.meaning;
    backLevel.textContent = item.level || 'B1';
    backType.textContent = item.type || 'Verb';

    // Separable prefixes formatted strictly for trennbare Verben
    const isTrennbar = item.type && item.type.toLowerCase().includes('trennbar');

    // Full Present Tense (All unique forms: ich, du, er/sie/es, wir/Sie, ihr)
    if (item.praesensAll) {
      if (conjPraesensIch) conjPraesensIch.innerHTML = formatSeparableVerb(item.praesensAll.ich, isTrennbar);
      if (conjPraesensDu) conjPraesensDu.innerHTML = formatSeparableVerb(item.praesensAll.du, isTrennbar);
      if (conjPraesensEr) conjPraesensEr.innerHTML = formatSeparableVerb(item.praesensAll.er_sie_es, isTrennbar);
      if (conjPraesensWir) conjPraesensWir.innerHTML = formatSeparableVerb(item.praesensAll.wir_Sie, isTrennbar);
      if (conjPraesensIhr) conjPraesensIhr.innerHTML = formatSeparableVerb(item.praesensAll.ihr, isTrennbar);
    } else {
      if (conjPraesensEr) conjPraesensEr.innerHTML = formatSeparableVerb(item.praesens, isTrennbar);
    }

    // Präteritum
    if (conjPraeteritum) {
      conjPraeteritum.innerHTML = formatSeparableVerb(item.praeteritum, isTrennbar);
    }

    // Perfekt (Textbook Standard: Clean, calm styling with auxiliary pill)
    const aux = item.hilfsverb || (item.perfekt && item.perfekt.startsWith('ist') ? 'sein' : 'haben');
    const isSein = aux === 'sein' || aux === 'ist';
    const auxVerbWord = isSein ? 'ist' : 'hat';
    const verbFormOnly = item.partizip2 || (item.perfekt ? item.perfekt.replace(/^(ist|hat)\s+/, '') : '');

    if (perfektAuxPill) {
      perfektAuxPill.textContent = `Hilfsverb: ${isSein ? 'sein' : 'haben'}`;
      perfektAuxPill.style.color = isSein ? 'var(--accent-terracotta)' : 'var(--accent-sage)';
    }
    if (conjAuxText) {
      conjAuxText.textContent = auxVerbWord;
    }
    if (conjPartizip2) {
      conjPartizip2.textContent = verbFormOnly;
    }

    // Interactive Context Sentence for the active tense
    renderExampleSentence();

    // Grammar Note
    if (item.note) {
      noteText.textContent = item.note;
      noteText.parentElement.style.display = 'flex';
    } else {
      noteText.parentElement.style.display = 'none';
    }

    // Update Counter & Progress
    cardCounter.textContent = `Karte ${currentIndex + 1} von ${currentDeck.length}`;
    const pct = Math.round(((currentIndex + 1) / currentDeck.length) * 100);
    progressBar.style.width = `${pct}%`;
    progressBar.parentElement.setAttribute('aria-valuenow', pct);
  }

  function renderExampleSentence() {
    if (!currentDeck || currentDeck.length === 0) return;
    const item = currentDeck[currentIndex];

    // Update active tab buttons
    if (tenseTabs && tenseTabs.length > 0) {
      tenseTabs.forEach(tab => {
        const tense = tab.getAttribute('data-tense');
        tab.classList.toggle('is-active', tense === currentExampleTense);
      });
    }

    if (item.examples && item.examples[currentExampleTense]) {
      exampleDe.textContent = item.examples[currentExampleTense].de;
      exampleEn.textContent = item.examples[currentExampleTense].en;
    } else {
      exampleDe.textContent = item.exampleDe || '';
      exampleEn.textContent = item.exampleEn || '';
    }
  }

  function setExampleTense(tense) {
    if (currentExampleTense === tense) return;
    currentExampleTense = tense;

    // Immediately toggle active class on tabs so the orange underline indicator slides smoothly
    if (tenseTabs && tenseTabs.length > 0) {
      tenseTabs.forEach(tab => {
        tab.classList.toggle('is-active', tab.getAttribute('data-tense') === tense);
      });
    }
    updateTenseIndicator();

    const body = document.querySelector('.example-body');
    if (body) {
      body.classList.add('is-switching');
      setTimeout(() => {
        renderExampleSentence();
        body.classList.remove('is-switching');
        updateTenseIndicator();
      }, 70);
    } else {
      renderExampleSentence();
    }
  }

  function updateTenseIndicator() {
    const indicator = document.getElementById('tense-indicator');
    if (!indicator) return;
    const activeTab = document.querySelector('.tense-tab.is-active');
    if (!activeTab) return;
    const parent = activeTab.parentElement;
    if (!parent) return;
    const pRect = parent.getBoundingClientRect();
    const tRect = activeTab.getBoundingClientRect();
    if (tRect.width === 0) return;
    const left = tRect.left - pRect.left;
    indicator.style.width = `${tRect.width}px`;
    indicator.style.transform = `translateX(${left}px)`;
  }

  function formatSeparableVerb(phrase, isTrennbar = false) {
    if (!phrase) return '';
    if (!isTrennbar) return phrase;
    const parts = phrase.trim().split(/\s+/);
    if (parts.length > 1) {
      const prefix = parts.pop();
      return `${parts.join(' ')} <span class="highlight-prefix">${prefix}</span>`;
    }
    return phrase;
  }

  function toggleFlip() {
    isFlipped = !isFlipped;
    flashcard.classList.toggle('is-flipped', isFlipped);
    if (isFlipped) {
      setTimeout(updateTenseIndicator, 80);
    }
  }

  let isCardAnimating = false;

  function nextCard() {
    if (isCardAnimating) return;
    if (currentIndex < currentDeck.length - 1) {
      isCardAnimating = true;
      flashcard.classList.remove('card-slide-in-right', 'card-slide-in-left', 'card-slide-out-right');
      flashcard.classList.add('card-slide-out-left');

      setTimeout(() => {
        currentIndex++;
        renderCurrentCard();
        flashcard.classList.remove('card-slide-out-left');
        flashcard.classList.add('card-slide-in-right');

        setTimeout(() => {
          flashcard.classList.remove('card-slide-in-right');
          isCardAnimating = false;
        }, 200);
      }, 150);
    } else {
      showSessionCompleteSummary();
    }
  }

  function prevCard() {
    if (isCardAnimating) return;
    if (currentIndex > 0) {
      isCardAnimating = true;
      flashcard.classList.remove('card-slide-in-right', 'card-slide-in-left', 'card-slide-out-left');
      flashcard.classList.add('card-slide-out-right');

      setTimeout(() => {
        currentIndex--;
        renderCurrentCard();
        flashcard.classList.remove('card-slide-out-right');
        flashcard.classList.add('card-slide-in-left');

        setTimeout(() => {
          flashcard.classList.remove('card-slide-in-left');
          isCardAnimating = false;
        }, 200);
      }, 150);
    }
  }

  function startQuickDrill() {
    if (!allWords || allWords.length === 0) return;
    const shuffled = [...allWords].sort(() => 0.5 - Math.random()).slice(0, 10);
    currentDeckId = 'quick-drill';
    currentDeck = shuffled;
    deckIndicator.textContent = '⚡ Schnelltraining (10 Wörter)';
    currentIndex = 0;
    sessionReviewedCount = 0;
    sessionCorrectCount = 0;
    switchView('study');
    renderCurrentCard();
  }

  function flashGradeButton(gradeClass) {
    const btn = document.querySelector(`.grade-${gradeClass}`);
    if (btn) {
      btn.classList.add('is-pressed');
      setTimeout(() => btn.classList.remove('is-pressed'), 140);
    }
  }

  function recordGrade(grade) {
    const isCorrect = grade === 'good' || grade === 'easy';
    recordStudyParticipation(isCorrect);

    // Expose current word for vocab detail view
    if (currentDeck && currentDeck[currentIndex]) {
      window.currentWordData = currentDeck[currentIndex];
    }
    // Notify extension modules
    document.dispatchEvent(new CustomEvent('wortschatz:dashboardUpdated'));

    // Smooth advance to next card
    setTimeout(() => {
      nextCard();
    }, 140);
  }

  // ================= Session Complete Summary =================
  function showSessionCompleteSummary() {
    const config = ALL_DECKS_MAP[currentDeckId] || DECKS_CONFIG.find(c => c.id === currentDeckId) || DECKS_CONFIG[0];
    summaryDeckTitle.textContent = config.title;
    summaryCount.textContent = sessionReviewedCount;

    const rate = sessionReviewedCount > 0
      ? Math.round((sessionCorrectCount / sessionReviewedCount) * 100)
      : 100;
    summaryRate.textContent = `${rate}%`;

    modalSessionComplete.classList.remove('hidden');
  }

  // ================= Event Listeners =================
  // Sidebar toggle (both the icon button in sidebar and the header button)
  if (btnSidebarToggle) btnSidebarToggle.addEventListener('click', toggleSidebar);
  const btnSidebarOpenHeader = document.getElementById('btn-sidebar-open');
  if (btnSidebarOpenHeader) btnSidebarOpenHeader.addEventListener('click', toggleSidebar);
  if (sidebarBackdrop) sidebarBackdrop.addEventListener('click', closeSidebar);

  // Folder creation modal events
  if (btnCreateFolder) btnCreateFolder.addEventListener('click', openCreateFolderModal);
  if (btnFolderModalClose) btnFolderModalClose.addEventListener('click', closeCreateFolderModal);
  if (btnFolderCancel) btnFolderCancel.addEventListener('click', closeCreateFolderModal);
  if (btnFolderSave) btnFolderSave.addEventListener('click', saveNewFolder);
  if (modalCreateFolder) {
    modalCreateFolder.addEventListener('click', (e) => {
      if (e.target === modalCreateFolder) closeCreateFolderModal();
    });
  }

  // Sidebar navigation links
  navItemHome.addEventListener('click', () => {
    closeSidebar();
    switchView('home');
  });

  navItemDecks.addEventListener('click', () => {
    closeSidebar();
    switchView('decks');
  });

  navItemCalendar.addEventListener('click', () => {
    closeSidebar();
    switchView('home');
    document.getElementById('section-calendar').scrollIntoView({ behavior: 'smooth' });
  });

  // Back to Home Button in Header
  btnBackHome.addEventListener('click', () => {
    if (currentActiveView === 'study') {
      if (previousView === 'decks') {
        switchView('decks');
      } else {
        switchView('home');
      }
    } else if (currentActiveView === 'decks') {
      switchView('home');
    } else {
      switchView('home');
    }
  });

  // Library View Back Button
  if (btnLibraryBackHome) {
    btnLibraryBackHome.addEventListener('click', () => {
      switchView('home');
    });
  }

  // Calendar Month Nav
  btnCalPrev.addEventListener('click', () => {
    displayedCalDate.setMonth(displayedCalDate.getMonth() - 1);
    renderMonthCalendar(displayedCalDate);
  });

  btnCalNext.addEventListener('click', () => {
    displayedCalDate.setMonth(displayedCalDate.getMonth() + 1);
    renderMonthCalendar(displayedCalDate);
  });

  // Summary Modal Buttons
  btnSummaryRestart.addEventListener('click', () => {
    modalSessionComplete.classList.add('hidden');
    startDeckStudy(currentDeckId);
  });

  btnSummaryHome.addEventListener('click', () => {
    modalSessionComplete.classList.add('hidden');
    switchView('decks');
  });

  // Card Flip on Click (excluding buttons or if swiped)
  flashcard.addEventListener('click', (e) => {
    if (wasSwiped) {
      wasSwiped = false;
      return;
    }
    if (e.target.closest('button')) return;
    toggleFlip();
  });

  // Audio Buttons
  btnAudioFront.addEventListener('click', (e) => {
    e.stopPropagation();
    const item = currentDeck[currentIndex];
    if (item) speakText(item.word, null, btnAudioFront);
  });

  const btnAudioCenter = document.getElementById('btn-audio-center');
  if (btnAudioCenter) {
    btnAudioCenter.addEventListener('click', (e) => {
      e.stopPropagation();
      const item = currentDeck[currentIndex];
      if (item) speakText(item.word, null, btnAudioCenter);
    });
  }

  btnAudioBack.addEventListener('click', (e) => {
    e.stopPropagation();
    const item = currentDeck[currentIndex];
    if (item) speakText(item.word, null, btnAudioBack);
  });

  const btnAudioBackInline = document.getElementById('btn-audio-back-inline');
  if (btnAudioBackInline) {
    btnAudioBackInline.addEventListener('click', (e) => {
      e.stopPropagation();
      const item = currentDeck[currentIndex];
      if (item) speakText(item.word, null, btnAudioBackInline);
    });
  }

  btnAudioSentence.addEventListener('click', (e) => {
    e.stopPropagation();
    const textToSpeak = exampleDe.textContent;
    if (textToSpeak) speakText(textToSpeak, null, btnAudioSentence);
  });

  // Tense Switcher Tabs & Cell Clicks
  if (tenseTabs && tenseTabs.length > 0) {
    tenseTabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        e.stopPropagation();
        const tense = tab.getAttribute('data-tense');
        if (tense) setExampleTense(tense);
      });
    });
  }
  // Initialize tense indicator position after first render
  requestAnimationFrame(() => updateTenseIndicator());
  window.addEventListener('resize', updateTenseIndicator);

  if (cellPraeteritum) {
    cellPraeteritum.addEventListener('click', (e) => {
      e.stopPropagation();
      setExampleTense('praeteritum');
    });
  }

  if (cellPerfekt) {
    cellPerfekt.addEventListener('click', (e) => {
      e.stopPropagation();
      setExampleTense('perfekt');
    });
  }

  // Grade Buttons
  btnGrade1.addEventListener('click', () => recordGrade('again'));
  btnGrade2.addEventListener('click', () => recordGrade('hard'));
  btnGrade3.addEventListener('click', () => recordGrade('good'));
  btnGrade4.addEventListener('click', () => recordGrade('easy'));

  // Quick Drill Trigger Button in Bento Grid
  if (btnQuickDrill) {
    btnQuickDrill.addEventListener('click', () => {
      startQuickDrill();
    });
  }

  // All Decks Header Action: Open Library View
  if (btnLearnAllDecks) {
    btnLearnAllDecks.addEventListener('click', () => {
      switchView('decks');
    });
  }

  // Appearance Modal Open Triggers (Sidebar Item & Header Icon)
  if (navItemAppearance) {
    navItemAppearance.addEventListener('click', openAppearanceModal);
  }
  if (btnQuickTheme) {
    btnQuickTheme.addEventListener('click', openAppearanceModal);
  }

  // Appearance Modal Close Triggers
  if (btnAppearanceClose) {
    btnAppearanceClose.addEventListener('click', closeAppearanceModal);
  }
  if (btnAppearanceDone) {
    btnAppearanceDone.addEventListener('click', closeAppearanceModal);
  }
  if (modalAppearance) {
    modalAppearance.addEventListener('click', (e) => {
      if (e.target === modalAppearance) {
        closeAppearanceModal();
      }
    });
  }

  // Appearance Modal Theme Card Options
  if (themeCardOptions && themeCardOptions.length > 0) {
    themeCardOptions.forEach(btn => {
      btn.addEventListener('click', () => {
        const selectedTheme = btn.getAttribute('data-theme-set');
        if (selectedTheme) {
          setTheme(selectedTheme);
        }
      });
    });
  }

  // Appearance Modal Font Card Options
  if (fontCardOptions && fontCardOptions.length > 0) {
    fontCardOptions.forEach(btn => {
      btn.addEventListener('click', () => {
        const selectedFont = btn.getAttribute('data-font-set');
        if (selectedFont) {
          setFont(selectedFont);
        }
      });
    });
  }

  // Keyboard Shortcuts (Space, 1-4, A, Arrow Keys, Escape)
  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    if (e.key === 'Escape') {
      closeSidebar();
      closeAppearanceModal();
      modalSessionComplete.classList.add('hidden');
      return;
    }

    // Only active in study mode
    if (viewStudy.classList.contains('hidden')) return;

    if (e.code === 'Space') {
      e.preventDefault();
      toggleFlip();
    } else if (e.key === '1') {
      flashGradeButton('again');
      recordGrade('again');
    } else if (e.key === '2') {
      flashGradeButton('hard');
      recordGrade('hard');
    } else if (e.key === '3') {
      flashGradeButton('good');
      recordGrade('good');
    } else if (e.key === '4') {
      flashGradeButton('easy');
      recordGrade('easy');
    } else if (e.key === 'a' || e.key === 'A') {
      e.preventDefault();
      const item = currentDeck[currentIndex];
      if (item) speakText(item.word);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      nextCard();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      prevCard();
    }
  });

  // Touch Swipe for Mobile & iPad
  let touchStartX = 0;
  let touchStartY = 0;

  flashcard.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
    wasSwiped = false;
  }, { passive: true });

  flashcard.addEventListener('touchend', (e) => {
    const diffX = e.changedTouches[0].screenX - touchStartX;
    const diffY = e.changedTouches[0].screenY - touchStartY;
    if (Math.abs(diffX) > 60 && Math.abs(diffY) < 50) {
      wasSwiped = true;
      if (diffX < 0) {
        nextCard();
      } else {
        prevCard();
      }
      setTimeout(() => { wasSwiped = false; }, 350);
    }
  }, { passive: true });

  // Listen for continue card event from extension module
  document.addEventListener('wortschatz:startDeck', (e) => {
    if (e.detail && e.detail.deckId) {
      switchView('study', e.detail.deckId);
    }
  });

  // Initial Data Fetch & Load
  async function initApp() {
    initTheme();
    initFont();
    try {
      const res = await fetch('data/vocabulary.json');
      if (!res.ok) throw new Error('Network error');
      allWords = await res.json();
    } catch (err) {
      console.warn('Loading fallback deck:', err);
      allWords = getFallbackDeck();
    }
    updateDashboardStats();
  }

  initApp();

  // Fallback Deck (minimal)
  function getFallbackDeck() {
    return [
      {
        id: "v01",
        word: "aufstehen",
        ipa: "[ˈaʊ̯fˌʃteːən]",
        meaning: "to get up, arise (from bed or chair)",
        level: "A1/A2",
        type: "Verb · trennbar",
        praesens: "er steht auf",
        praeteritum: "stand auf",
        hilfsverb: "sein",
        partizip2: "aufgestanden",
        perfekt: "ist aufgestanden",
        exampleDe: "Er steht jeden Morgen pünktlich um 7 Uhr auf.",
        exampleEn: "He gets up punctually at 7 o'clock every morning.",
        note: "Orts- und Zustandswechsel → Perfekt immer mit 'sein'."
      }
    ];
  }
})();


// ============================================================
// WORTSCHATZ REVAMP — Extension Module v2
// Dashboard ribbon, Continue card, Vocab Detail, Stats page,
// Deck search/filter, Dark mode, Level chips
// ============================================================

(function () {
  'use strict';

  // ── 1. Dashboard Stats Ribbon ─────────────────────────────
  const ribbonProgressPct = document.getElementById('ribbon-progress-pct');
  const ribbonProgressSub = document.getElementById('ribbon-progress-sub');
  const ribbonTodayCount  = document.getElementById('ribbon-today-count');
  const ribbonRetention   = document.getElementById('ribbon-retention');
  const ribbonStreak      = document.getElementById('ribbon-streak');
  const streakCounterHero = document.getElementById('streak-counter-hero');

  function getStoredData() {
    let studyLog = {}, deckProgress = {};
    try {
      const sl = localStorage.getItem('wortschatz_study_log_v2');
      if (sl) studyLog = JSON.parse(sl);
      const dp = localStorage.getItem('wortschatz_deck_progress_v2');
      if (dp) deckProgress = JSON.parse(dp);
    } catch(e) {}
    return { studyLog, deckProgress };
  }

  function getTodayKeyLocal() {
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
  }

  function calcStreakLocal(studyLog) {
    let streak = 0;
    const checkDate = new Date();
    const todayKey = getTodayKeyLocal();
    if (studyLog[todayKey] && studyLog[todayKey].count > 0) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      checkDate.setDate(checkDate.getDate() - 1);
    }
    while (true) {
      const k = checkDate.getFullYear() + '-' + String(checkDate.getMonth()+1).padStart(2,'0') + '-' + String(checkDate.getDate()).padStart(2,'0');
      if (studyLog[k] && studyLog[k].count > 0) { streak++; checkDate.setDate(checkDate.getDate()-1); } else break;
    }
    return streak;
  }

  function updateRibbonStats() {
    const { studyLog, deckProgress } = getStoredData();
    const todayKey = getTodayKeyLocal();
    const todayEntry = studyLog[todayKey] || { count: 0, correct: 0 };
    let totalRev = 0, totalCor = 0;
    Object.values(studyLog).forEach(e => { totalRev += e.count||0; totalCor += e.correct||0; });
    const streak = calcStreakLocal(studyLog);
    const totalWords = 50;
    const reviewed = (deckProgress['b1-all'] && deckProgress['b1-all'].reviewed) || 0;
    const pct = Math.round((reviewed / totalWords) * 100);
    const retention = totalRev > 0 ? Math.round((totalCor / totalRev) * 100) : 100;

    if (ribbonProgressPct) ribbonProgressPct.textContent = pct + '%';
    if (ribbonProgressSub) ribbonProgressSub.textContent = reviewed + ' von ' + totalWords;
    if (ribbonTodayCount)  ribbonTodayCount.textContent  = todayEntry.count;
    if (ribbonRetention)   ribbonRetention.textContent   = retention + '%';
    if (ribbonStreak)      ribbonStreak.textContent      = streak;
    if (streakCounterHero) streakCounterHero.textContent = streak + (streak === 1 ? ' Tag' : ' Tage');
  }

  // ── 2. Continue Card ──────────────────────────────────────
  const continueCard      = document.getElementById('continue-card');
  const continueDeckTitle = document.getElementById('continue-deck-title');
  const continueDeckSub   = document.getElementById('continue-deck-sub');

  function updateContinueCard() {
    const { deckProgress } = getStoredData();
    const deckDefs = [
      { id: 'b1-all', title: 'B1 Stammformen', count: 50 },
      { id: 'sein-verbs', title: "Perfekt mit 'sein'", count: 14 },
      { id: 'trennbar', title: 'Trennbare Verben', count: 11 },
    ];
    let bestDeck = deckDefs[0], bestReviewed = 0;
    deckDefs.forEach(d => {
      const rev = (deckProgress[d.id] && deckProgress[d.id].reviewed) || 0;
      const pct = Math.round((rev / d.count) * 100);
      if (rev > 0 && pct < 100 && rev >= bestReviewed) { bestDeck = d; bestReviewed = rev; }
    });
    const rev = (deckProgress[bestDeck.id] && deckProgress[bestDeck.id].reviewed) || 0;
    const pct = Math.round((rev / bestDeck.count) * 100);
    if (continueDeckTitle) continueDeckTitle.textContent = bestDeck.title;
    if (continueDeckSub)   continueDeckSub.textContent   = pct + '% abgeschlossen · Tippe zum Starten';
    if (continueCard) {
      continueCard.setAttribute('data-deck-id', bestDeck.id);
      if (continueCard.dataset) continueCard.dataset.deckId = bestDeck.id;
    }
  }

  const btnContinueDeck = document.getElementById('btn-continue-deck');
  if (btnContinueDeck) {
    btnContinueDeck.addEventListener('click', (e) => {
      e.stopPropagation();
      const deckId = (continueCard && (continueCard.getAttribute('data-deck-id') || (continueCard.dataset && continueCard.dataset.deckId))) || 'b1-all';
      document.dispatchEvent(new CustomEvent('wortschatz:startDeck', { detail: { deckId } }));
    });
  }

  if (continueCard) {
    continueCard.addEventListener('click', () => {
      const deckId = (continueCard.getAttribute('data-deck-id') || (continueCard.dataset && continueCard.dataset.deckId)) || 'b1-all';
      document.dispatchEvent(new CustomEvent('wortschatz:startDeck', { detail: { deckId } }));
    });
    continueCard.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); continueCard.click(); }
    });
  }

  // ── 3. Vocabulary Detail View ─────────────────────────────
  const viewVocabDetail   = document.getElementById('view-vocab-detail');
  const btnVocabBack      = document.getElementById('btn-vocab-detail-back');
  const detailWord        = document.getElementById('detail-word');
  const detailIpa         = document.getElementById('detail-ipa');
  const detailMeaning     = document.getElementById('detail-meaning');
  const detailTags        = document.getElementById('detail-tags');
  const detailConjTable   = document.getElementById('detail-conj-table');
  const detailExampleDe   = document.getElementById('detail-example-de');
  const detailExampleEn   = document.getElementById('detail-example-en');
  const detailGrammarNote = document.getElementById('detail-grammar-note');
  const detailNoteText    = document.getElementById('detail-note-text');
  const btnDetailAudio    = document.getElementById('btn-detail-audio');
  const conjTabBtns       = document.querySelectorAll('.conj-tab');

  let detailCurrentWord  = null;
  let detailCurrentTense = 'praesens';
  let previousViewId     = 'study';

  function openVocabDetail(wordData, fromViewId) {
    if (!viewVocabDetail || !wordData) return;
    detailCurrentWord  = wordData;
    detailCurrentTense = 'praesens';
    previousViewId     = fromViewId || 'study';

    if (detailWord)    detailWord.textContent    = wordData.word    || '';
    if (detailIpa)     detailIpa.textContent     = wordData.ipa     || '';
    if (detailMeaning) detailMeaning.textContent = wordData.meaning || '';

    if (detailTags) {
      detailTags.innerHTML = '';
      if (wordData.level) {
        const lc = document.createElement('span'); lc.className = 'chip chip-secondary'; lc.textContent = wordData.level;
        detailTags.appendChild(lc);
      }
      if (wordData.type) {
        const tc = document.createElement('span'); tc.className = 'chip chip-neutral'; tc.textContent = wordData.type;
        detailTags.appendChild(tc);
      }
    }

    conjTabBtns.forEach(t => t.classList.toggle('is-active', t.dataset.conjTense === 'praesens'));
    renderConjTable('praesens');

    document.querySelectorAll('.view-container').forEach(v => v.classList.add('hidden'));
    viewVocabDetail.classList.remove('hidden');
    setTimeout(updateConjIndicator, 80);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function formatSep(phrase, isTrennbar) {
    if (!phrase || !isTrennbar) return phrase || '';
    const parts = phrase.trim().split(/\s+/);
    if (parts.length > 1) {
      const prefix = parts.pop();
      return parts.join(' ') + ' <strong style="color:var(--accent-terracotta)">' + prefix + '</strong>';
    }
    return phrase;
  }

  function renderConjTable(tense) {
    if (!detailConjTable || !detailCurrentWord) return;
    const w = detailCurrentWord;
    const isTrennbar = w.type && w.type.toLowerCase().includes('trennbar');
    let rows = [];

    if (tense === 'praesens' && w.praesensAll) {
      rows = [
        ['ich', formatSep(w.praesensAll.ich, isTrennbar)],
        ['du', formatSep(w.praesensAll.du, isTrennbar)],
        ['er/sie/es', formatSep(w.praesensAll.er_sie_es, isTrennbar)],
        ['wir / Sie', formatSep(w.praesensAll.wir_Sie, isTrennbar)],
        ['ihr', formatSep(w.praesensAll.ihr, isTrennbar)],
      ];
    } else if (tense === 'praeteritum') {
      rows = [['er/sie/es (Stamm)', formatSep(w.praeteritum, isTrennbar)]];
    } else if (tense === 'perfekt') {
      const aux = w.hilfsverb || 'haben';
      const isSein = aux === 'sein';
      const color = isSein ? 'var(--accent-terracotta)' : 'var(--accent-sage)';
      rows = [
        ['Hilfsverb', '<span style="font-weight:800; color:' + color + '">' + aux + '</span>'],
        ['Partizip II', '<strong>' + (w.partizip2 || '') + '</strong>'],
        ['Vollform', (isSein ? 'ist' : 'hat') + ' ' + formatSep(w.partizip2, isTrennbar)],
      ];
    }

    detailConjTable.innerHTML = rows.map(([label, val]) =>
      `<tr><td>${label}</td><td>${val}</td></tr>`
    ).join('');

    // Update example
    const ex = (w.examples && w.examples[tense]) || null;
    if (detailExampleDe) detailExampleDe.textContent = ex ? ex.de : (w.exampleDe || '');
    if (detailExampleEn) detailExampleEn.textContent = ex ? ex.en : (w.exampleEn || '');

    // Grammar note
    if (detailNoteText) detailNoteText.textContent = w.note || '';
    if (detailGrammarNote) detailGrammarNote.style.display = w.note ? 'flex' : 'none';
  }

  function updateConjIndicator() {
    const indicator = document.getElementById('conj-indicator');
    if (!indicator) return;
    const activeTab = document.querySelector('.conj-tab.is-active');
    if (!activeTab) return;
    const parent = activeTab.parentElement;
    if (!parent) return;
    const pRect = parent.getBoundingClientRect();
    const tRect = activeTab.getBoundingClientRect();
    if (tRect.width === 0) return;
    indicator.style.width = `${tRect.width}px`;
    indicator.style.transform = `translateX(${tRect.left - pRect.left}px)`;
  }

  conjTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tense = btn.dataset.conjTense;
      if (!tense) return;
      conjTabBtns.forEach(t => t.classList.remove('is-active'));
      btn.classList.add('is-active');
      detailCurrentTense = tense;
      renderConjTable(tense);
      updateConjIndicator();
    });
  });

  if (btnVocabBack) {
    btnVocabBack.addEventListener('click', () => {
      if (viewVocabDetail) viewVocabDetail.classList.add('hidden');
      const prevView = document.getElementById('view-' + previousViewId);
      if (prevView) prevView.classList.remove('hidden');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  function speakWordLocal(text) {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = 'de-DE'; utt.rate = 0.88;
    window.speechSynthesis.speak(utt);
  }

  if (btnDetailAudio) {
    btnDetailAudio.addEventListener('click', () => {
      if (detailCurrentWord) speakWordLocal(detailCurrentWord.word);
    });
  }

  // Expose globally so back-lemma click works
  window.openVocabDetail = openVocabDetail;

  // Click on back-lemma opens detail
  const backLemmaEl = document.getElementById('back-word');
  if (backLemmaEl) {
    backLemmaEl.style.cursor = 'pointer';
    backLemmaEl.setAttribute('title', 'Detail-Ansicht öffnen');
    backLemmaEl.addEventListener('click', () => {
      if (window.currentWordData) openVocabDetail(window.currentWordData, 'study');
    });
  }

  // ── 4. Statistics View ────────────────────────────────────
  const viewStats         = document.getElementById('view-stats');
  const navItemStats      = document.getElementById('nav-item-stats');
  const statsTabBtns      = document.querySelectorAll('.stats-tab');
  const statsTotalLearned = document.getElementById('stats-total-learned');
  const statsLernzeit     = document.getElementById('stats-lernzeit');
  const statsStreakBig    = document.getElementById('stats-streak-big');
  const activityChart     = document.getElementById('activity-chart');
  const grammarDistBars   = document.getElementById('grammar-dist-bars');
  const statsDecksList    = document.getElementById('stats-decks-list');

  function openStatsView() {
    document.querySelectorAll('.view-container').forEach(v => v.classList.add('hidden'));
    if (viewStats) viewStats.classList.remove('hidden');
    renderStatsOverview();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Update header
    const btnBackHome = document.getElementById('btn-back-home');
    const btnBackText = document.getElementById('btn-back-home-text');
    const headerBrand = document.getElementById('header-brand-group');
    if (btnBackHome) btnBackHome.classList.remove('hidden');
    if (btnBackText) btnBackText.textContent = 'Übersicht';
    if (headerBrand) headerBrand.classList.remove('hidden');
  }

  function renderStatsOverview() {
    const { studyLog, deckProgress } = getStoredData();
    let totalRev = 0, totalCor = 0;
    Object.values(studyLog).forEach(e => { totalRev += e.count||0; totalCor += e.correct||0; });
    const streak = calcStreakLocal(studyLog);

    if (statsTotalLearned) statsTotalLearned.textContent = totalRev;
    if (statsStreakBig)    statsStreakBig.textContent    = streak;
    if (statsLernzeit) {
      const mins = Math.round(totalRev * 0.75);
      const h = Math.floor(mins / 60), m = mins % 60;
      statsLernzeit.textContent = h > 0 ? h + 'h ' + m + 'm' : m + 'm';
    }

    drawActivityChart(studyLog);

    if (grammarDistBars) {
      const dists = [
        { label: 'Präsens',         color: '#FF5A5F', pct: 42 },
        { label: 'Präteritum',      color: '#6366F1', pct: 28 },
        { label: 'Perfekt',         color: '#F59E0B', pct: 16 },
        { label: 'Trennb. Verben',  color: '#10B981', pct: 7  },
        { label: 'Sonstiges',       color: '#94A3B8', pct: 5  },
      ];
      grammarDistBars.innerHTML = dists.map(d => `
        <div class="grammar-dist-row">
          <span class="grammar-dist-label">${d.label}</span>
          <div class="grammar-dist-bar-track">
            <div class="grammar-dist-bar-fill" style="width:${d.pct}%;background:${d.color};"></div>
          </div>
          <span class="grammar-dist-pct">${d.pct}%</span>
        </div>`).join('');
    }

    if (statsDecksList) {
      const deckDefs = [
        { id: 'b1-all',      title: 'B1 Stammformen',     count: 50 },
        { id: 'sein-verbs',  title: "Perfekt mit 'sein'",  count: 14 },
        { id: 'trennbar',    title: 'Trennbare Verben',    count: 11 },
        { id: 'vokalwechsel',title: 'Starke Verben',       count: 20 },
      ];
      statsDecksList.innerHTML = deckDefs.map(d => {
        const rev = (deckProgress[d.id] && deckProgress[d.id].reviewed) || 0;
        const pct = Math.round((rev / d.count) * 100);
        return `<div class="vocab-detail-section" style="margin-bottom:10px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
            <span style="font-weight:700;font-size:14px;">${d.title}</span>
            <span style="font-size:12px;color:var(--text-muted);">${rev} / ${d.count}</span>
          </div>
          <div style="height:6px;background:var(--bg-surface-subtle);border-radius:999px;overflow:hidden;">
            <div style="height:100%;width:${pct}%;background:var(--accent-terracotta);border-radius:999px;transition:width 0.6s cubic-bezier(0.23,1,0.32,1);"></div>
          </div>
          <span style="font-size:12px;color:var(--text-secondary);display:block;margin-top:4px;">${pct}% abgeschlossen</span>
        </div>`;
      }).join('');
    }
  }

  function drawActivityChart(studyLog) {
    if (!activityChart) return;
    const ctx = activityChart.getContext('2d');
    if (!ctx) return;
    const W = activityChart.parentElement.offsetWidth - 40 || 660;
    const H = 140;
    activityChart.width  = W;
    activityChart.height = H;

    const dayNames = ['So','Mo','Di','Mi','Do','Fr','Sa'];
    const days = [], counts = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const k = d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
      days.push(dayNames[d.getDay()]);
      counts.push((studyLog[k] && studyLog[k].count) || 0);
    }

    const maxCount = Math.max(...counts, 1);
    const pad = { top: 20, right: 20, bottom: 30, left: 36 };
    const cW = W - pad.left - pad.right;
    const cH = H - pad.top  - pad.bottom;

    ctx.clearRect(0, 0, W, H);

    // Grid lines
    ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--border-subtle').trim() || '#E5E3DC';
    ctx.lineWidth = 1;
    for (let g = 0; g <= 4; g++) {
      const y = pad.top + cH - (g / 4) * cH;
      ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(W - pad.right, y); ctx.stroke();
    }

    const pts = counts.map((c, i) => ({
      x: pad.left + (i / (counts.length - 1)) * cW,
      y: pad.top  + cH - (c / maxCount) * cH,
    }));

    // Gradient fill
    const grad = ctx.createLinearGradient(0, pad.top, 0, H - pad.bottom);
    grad.addColorStop(0, 'rgba(255,90,95,0.18)');
    grad.addColorStop(1, 'rgba(255,90,95,0)');
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) {
      const cpx = (pts[i-1].x + pts[i].x) / 2;
      ctx.bezierCurveTo(cpx, pts[i-1].y, cpx, pts[i].y, pts[i].x, pts[i].y);
    }
    ctx.lineTo(pts[pts.length-1].x, H - pad.bottom);
    ctx.lineTo(pts[0].x, H - pad.bottom);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Line
    ctx.beginPath(); ctx.strokeStyle = '#FF5A5F'; ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) {
      const cpx = (pts[i-1].x + pts[i].x) / 2;
      ctx.bezierCurveTo(cpx, pts[i-1].y, cpx, pts[i].y, pts[i].x, pts[i].y);
    }
    ctx.stroke();

    // Dots + labels
    pts.forEach((pt, i) => {
      ctx.beginPath(); ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF'; ctx.fill();
      ctx.strokeStyle = '#FF5A5F'; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-muted').trim() || '#9CA3AF';
      ctx.font = '11px Inter, sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(days[i], pt.x, H - 6);
    });
  }

  // Stats tab switching
  statsTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.statsTab;
      statsTabBtns.forEach(t => t.classList.remove('is-active'));
      btn.classList.add('is-active');
      const panels = { overview: 'stats-panel-overview', decks: 'stats-panel-decks', grammar: 'stats-panel-grammar' };
      Object.values(panels).forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
      });
      const active = document.getElementById(panels[tab]);
      if (active) active.style.display = '';
      if (tab === 'overview') drawActivityChart(getStoredData().studyLog);
    });
  });

  if (navItemStats) {
    navItemStats.addEventListener('click', () => {
      // Close sidebar on mobile
      const sB = document.getElementById('sidebar-backdrop');
      const sS = document.getElementById('sidebar');
      if (sS) sS.setAttribute('data-expanded', 'false');
      if (sB) sB.classList.remove('is-open');
      openStatsView();
    });
  }

  // ── 5. Deck search + level filter ─────────────────────────
  const levelFilterRow  = document.getElementById('level-filter-row');
  const deckSearchInput = document.getElementById('deck-search-input');
  let activeLevel = 'all';
  let searchQuery = '';

  function applyDeckFilters() {
    const container = document.getElementById('library-folders-container');
    if (!container) return;
    container.querySelectorAll('.deck-card').forEach(card => {
      const title = (card.querySelector('.deck-title') || {}).textContent || '';
      const desc  = (card.querySelector('.deck-desc')  || {}).textContent || '';
      const level = (card.querySelector('.chip-secondary') || {}).textContent || '';
      const matchSearch = !searchQuery || title.toLowerCase().includes(searchQuery) || desc.toLowerCase().includes(searchQuery);
      const matchLevel  = activeLevel === 'all' || level.toLowerCase().includes(activeLevel.toLowerCase());
      card.style.display = (matchSearch && matchLevel) ? '' : 'none';
    });
  }

  if (levelFilterRow) {
    levelFilterRow.addEventListener('click', e => {
      const chip = e.target.closest('.level-filter-chip');
      if (!chip) return;
      activeLevel = chip.dataset.level || 'all';
      levelFilterRow.querySelectorAll('.level-filter-chip').forEach(c => c.classList.toggle('is-active', c.dataset.level === activeLevel));
      applyDeckFilters();
    });
  }

  if (deckSearchInput) {
    deckSearchInput.addEventListener('input', e => {
      searchQuery = e.target.value.toLowerCase().trim();
      applyDeckFilters();
    });
  }

  // ── 6. Dark/extended theme support ───────────────────────
  // Extend setTheme to also handle 'dark' and 'light'
  const EXTENDED_THEMES = ['light', 'dark', 'porcelain', 'nordic', 'chalk'];
  document.querySelectorAll('[data-theme-set]').forEach(btn => {
    btn.addEventListener('click', () => {
      const theme = btn.dataset.themeSet;
      if (!EXTENDED_THEMES.includes(theme)) return;
      document.documentElement.setAttribute('data-theme', theme);
      try { localStorage.setItem('wortschatz_theme_v2', theme); } catch(e) {}
      document.querySelectorAll('[data-theme-set]').forEach(b => {
        const isActive = b.dataset.themeSet === theme;
        b.classList.toggle('active', isActive);
        const ck = b.querySelector('.option-check');
        if (ck) ck.textContent = isActive ? '✓' : '';
      });
    });
  });

  // Restore extended theme on load
  try {
    const saved = localStorage.getItem('wortschatz_theme_v2');
    if (saved && EXTENDED_THEMES.includes(saved)) {
      document.documentElement.setAttribute('data-theme', saved);
    }
  } catch(e) {}

  // ── 7. Reactive updates ───────────────────────────────────
  document.addEventListener('wortschatz:dashboardUpdated', () => {
    updateRibbonStats();
    updateContinueCard();
  });

  // Watch home view becoming visible
  const homeView = document.getElementById('view-home');
  if (homeView) {
    new MutationObserver(() => {
      if (!homeView.classList.contains('hidden')) {
        updateRibbonStats();
        updateContinueCard();
      }
    }).observe(homeView, { attributes: true, attributeFilter: ['class'] });
  }

  // ── 8. Init ───────────────────────────────────────────────
  setTimeout(() => {
    updateRibbonStats();
    updateContinueCard();
  }, 300);

})();
