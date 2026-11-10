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

  // Pre-configured Decks Definition
  const DECKS_CONFIG = [
    {
      id: 'b1-all',
      title: 'Alle Decks (50 Verben)',
      desc: 'Vollständiger Wortschatz aller unregelmäßigen und trennbaren B1-Stammformen mit Präsens, Präteritum und Perfekt.',
      tag: 'Alle Decks',
      level: 'B1 / B2',
      filter: (w) => true
    },
    {
      id: 'sein-verbs',
      title: "Perfekt mit 'sein'",
      desc: "Verben der Orts- und Zustandsveränderung, die zwingend das Hilfsverb 'sein' verlangen.",
      tag: 'Grammatik-Fokus',
      level: 'A2 / B1',
      filter: (w) => w.hilfsverb === 'sein'
    },
    {
      id: 'trennbar',
      title: 'Trennbare Verben',
      desc: 'Präfixe wandern im Hauptsatz ans Satzende: aufstehen, anrufen, einladen, einschlafen.',
      tag: 'Morphologie',
      level: 'A1 – B1',
      filter: (w) => w.type && w.type.toLowerCase().includes('trennbar')
    },
    {
      id: 'a1-a2',
      title: 'A1/A2 Grundwortschatz',
      desc: 'Elementare Basisverben des Alltags für den sicheren Einstieg in die Konjugation.',
      tag: 'Fundament',
      level: 'A1 / A2',
      filter: (w) => w.level && (w.level.includes('A1') || w.level === 'A2')
    }
  ];

  // ================= DOM Elements =================
  // Views
  const viewHome = document.getElementById('view-home');
  const viewStudy = document.getElementById('view-study');

  // Sidebar
  const sidebarDrawer = document.getElementById('sidebar-drawer');
  const sidebarBackdrop = document.getElementById('sidebar-backdrop');
  const btnSidebarOpen = document.getElementById('btn-sidebar-open');
  const btnSidebarClose = document.getElementById('btn-sidebar-close');
  const navItemHome = document.getElementById('nav-item-home');
  const navItemDecks = document.getElementById('nav-item-decks');
  const navItemCalendar = document.getElementById('nav-item-calendar');
  const navItemAppearance = document.getElementById('nav-item-appearance');
  const sidebarDeckShortcuts = document.getElementById('sidebar-deck-shortcuts');

  // Header
  const headerBrandGroup = document.getElementById('header-brand-group');
  const btnBackHome = document.getElementById('btn-back-home');
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
  const frontIpa = document.getElementById('front-ipa');
  const frontMeaning = document.getElementById('front-meaning');
  const frontLevel = document.getElementById('front-level');
  const frontType = document.getElementById('front-type');
  const btnAudioFront = document.getElementById('btn-audio-front');

  // Back Elements
  const backWord = document.getElementById('back-word');
  const backMeaning = document.getElementById('back-meaning');
  const backLevel = document.getElementById('back-level');
  const backType = document.getElementById('back-type');
  const btnAudioBack = document.getElementById('btn-audio-back');
  const conjPraesens = document.getElementById('conj-praesens');
  const conjPraeteritum = document.getElementById('conj-praeteritum');
  const conjPerfekt = document.getElementById('conj-perfekt');
  const cellPerfekt = document.getElementById('cell-perfekt');
  const exampleDe = document.getElementById('example-de');
  const exampleEn = document.getElementById('example-en');
  const noteText = document.getElementById('note-text');
  const btnAudioSentence = document.getElementById('btn-audio-sentence');

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
  function openAppearanceModal() {
    closeSidebar();
    if (modalAppearance) {
      modalAppearance.classList.remove('hidden');
    }
  }

  function closeAppearanceModal() {
    if (modalAppearance) {
      modalAppearance.classList.add('hidden');
    }
  }

  // ================= View Routing with Fluid Sliding Transitions =================
  function switchView(viewName, deckId = null) {
    if (viewName === 'study') {
      viewHome.classList.add('hidden');
      viewStudy.classList.remove('hidden');
      viewStudy.classList.remove('view-slide-in-left');
      viewStudy.classList.add('view-slide-in-right');
      btnBackHome.classList.remove('hidden');
      headerBrandGroup.classList.add('hidden');

      if (deckId) {
        startDeckStudy(deckId);
      }
    } else {
      viewHome.classList.remove('hidden');
      viewHome.classList.remove('view-slide-in-right');
      viewHome.classList.add('view-slide-in-left');
      viewStudy.classList.add('hidden');
      btnBackHome.classList.add('hidden');
      headerBrandGroup.classList.remove('hidden');
      modalSessionComplete.classList.add('hidden');

      updateDashboardStats();
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ================= Sidebar Drawer Management =================
  function openSidebar() {
    sidebarDrawer.classList.add('is-open');
    sidebarBackdrop.classList.add('is-open');
    sidebarDrawer.setAttribute('aria-hidden', 'false');
  }

  function closeSidebar() {
    sidebarDrawer.classList.remove('is-open');
    sidebarBackdrop.classList.remove('is-open');
    sidebarDrawer.setAttribute('aria-hidden', 'true');
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

  // Decks Grid Renderer
  function renderDecksGrid() {
    decksGrid.innerHTML = '';
    sidebarDeckShortcuts.innerHTML = '';

    DECKS_CONFIG.forEach(cfg => {
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

      // Entire card tile is clickable
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

      // Sidebar Shortcut Item
      const shortcutBtn = document.createElement('button');
      shortcutBtn.className = 'sidebar-deck-item';
      shortcutBtn.innerHTML = `
        <span>${cfg.title}</span>
        <span class="deck-pill-count">${deckCount}</span>
      `;
      shortcutBtn.addEventListener('click', () => {
        closeSidebar();
        switchView('study', cfg.id);
      });
      sidebarDeckShortcuts.appendChild(shortcutBtn);
    });
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
    const config = DECKS_CONFIG.find(c => c.id === deckId) || DECKS_CONFIG[0];
    currentDeck = allWords.filter(config.filter);

    deckIndicator.textContent = config.title;
    currentIndex = 0;
    sessionReviewedCount = 0;
    sessionCorrectCount = 0;

    renderCurrentCard();
  }

  function renderCurrentCard() {
    if (!currentDeck || currentDeck.length === 0) return;
    const item = currentDeck[currentIndex];

    // Reset card flip
    if (isFlipped) {
      flashcard.classList.remove('is-flipped');
      isFlipped = false;
    }

    // Front Side
    frontWord.textContent = item.word;
    frontIpa.textContent = item.ipa || '';
    frontMeaning.textContent = item.meaning;
    frontLevel.textContent = item.level || 'B1';
    frontType.textContent = item.type || 'Verb';

    // Back Side
    backWord.textContent = item.word;
    backMeaning.textContent = item.meaning;
    backLevel.textContent = item.level || 'B1';
    backType.textContent = item.type || 'Stammformen';

    // Separable prefixes formatted strictly for trennbare Verben
    const isTrennbar = item.type && item.type.toLowerCase().includes('trennbar');
    conjPraesens.innerHTML = formatSeparableVerb(item.praesens, isTrennbar);
    conjPraeteritum.innerHTML = formatSeparableVerb(item.praeteritum, isTrennbar);

    // Perfekt with auxiliary badge
    const aux = item.hilfsverb || (item.perfekt && item.perfekt.startsWith('ist') ? 'ist' : 'hat');
    const isSein = aux === 'sein' || aux === 'ist';
    const auxClass = isSein ? 'auxiliary-badge' : 'auxiliary-badge aux-hat';
    const verbFormOnly = item.partizip2 || item.perfekt.replace(/^(ist|hat)\s+/, '');

    if (isSein) {
      cellPerfekt.classList.add('highlight-cell');
    } else {
      cellPerfekt.classList.remove('highlight-cell');
    }

    conjPerfekt.innerHTML = `<span class="${auxClass}">${isSein ? 'ist' : aux}</span> ${verbFormOnly}`;

    // Context Sentence
    exampleDe.textContent = item.exampleDe || '';
    exampleEn.textContent = item.exampleEn || '';

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
        }, 260);
      }, 190);
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
        }, 260);
      }, 190);
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
  }

  function recordGrade(grade) {
    const isCorrect = grade === 'good' || grade === 'easy';
    recordStudyParticipation(isCorrect);

    // Smooth advance to next card
    setTimeout(() => {
      nextCard();
    }, 180);
  }

  // ================= Session Complete Summary =================
  function showSessionCompleteSummary() {
    const config = DECKS_CONFIG.find(c => c.id === currentDeckId) || DECKS_CONFIG[0];
    summaryDeckTitle.textContent = config.title;
    summaryCount.textContent = sessionReviewedCount;

    const rate = sessionReviewedCount > 0
      ? Math.round((sessionCorrectCount / sessionReviewedCount) * 100)
      : 100;
    summaryRate.textContent = `${rate}%`;

    modalSessionComplete.classList.remove('hidden');
  }

  // ================= Event Listeners =================
  // Sidebar open/close
  btnSidebarOpen.addEventListener('click', openSidebar);
  btnSidebarClose.addEventListener('click', closeSidebar);
  sidebarBackdrop.addEventListener('click', closeSidebar);

  // Sidebar navigation links
  navItemHome.addEventListener('click', () => {
    closeSidebar();
    switchView('home');
  });

  navItemDecks.addEventListener('click', () => {
    closeSidebar();
    switchView('home');
    document.getElementById('section-decks').scrollIntoView({ behavior: 'smooth' });
  });

  navItemCalendar.addEventListener('click', () => {
    closeSidebar();
    switchView('home');
    document.getElementById('section-calendar').scrollIntoView({ behavior: 'smooth' });
  });

  // Back to Home Button in Header
  btnBackHome.addEventListener('click', () => {
    switchView('home');
  });

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
    switchView('home');
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

  btnAudioBack.addEventListener('click', (e) => {
    e.stopPropagation();
    const item = currentDeck[currentIndex];
    if (item) speakText(item.word, null, btnAudioBack);
  });

  btnAudioSentence.addEventListener('click', (e) => {
    e.stopPropagation();
    const item = currentDeck[currentIndex];
    if (item && item.exampleDe) speakText(item.exampleDe, null, btnAudioSentence);
  });

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

  // All Decks Header Quick Start Button
  if (btnLearnAllDecks) {
    btnLearnAllDecks.addEventListener('click', () => {
      switchView('study', 'b1-all');
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
      recordGrade('again');
    } else if (e.key === '2') {
      recordGrade('hard');
    } else if (e.key === '3') {
      recordGrade('good');
    } else if (e.key === '4') {
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
