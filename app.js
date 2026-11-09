/**
 * Wortschatz Studio · Nordic Frost Engine
 * Clean, modern vanilla JavaScript with zero dependencies.
 */

(function () {
  'use strict';

  // State
  let allWords = [];
  let currentDeck = [];
  let currentIndex = 0;
  let isFlipped = false;
  let isSpeaking = false;
  let activeFilter = 'all';

  // Stats in localStorage
  const STATS_KEY = 'wortschatz_nordic_stats';
  let stats = loadStats();

  // DOM Elements
  const flashcard = document.getElementById('flashcard');
  const progressBar = document.getElementById('progress-bar');
  const cardCounter = document.getElementById('card-counter');
  const deckIndicator = document.getElementById('deck-indicator');
  const statReviewed = document.getElementById('stat-reviewed');
  const statRate = document.getElementById('stat-rate');

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

  // Filter Chips
  const filterChips = document.querySelectorAll('.filter-chip');

  // Rating Buttons
  const btnGrade1 = document.getElementById('btn-grade-1');
  const btnGrade2 = document.getElementById('btn-grade-2');
  const btnGrade3 = document.getElementById('btn-grade-3');
  const btnGrade4 = document.getElementById('btn-grade-4');

  // Speech Synthesis setup
  let germanVoice = null;
  let activeUtterance = null; // Prevent WebKit GC from prematurely garbage collecting active audio

  function initVoices() {
    if (!('speechSynthesis' in window)) return;
    const voices = window.speechSynthesis.getVoices();
    // Prioritize high-quality German voices (Apple Anna, Martin, Google Deutsch)
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
    window.speechSynthesis.cancel(); // Stop any pending speech

    activeUtterance = new SpeechSynthesisUtterance(text);
    activeUtterance.lang = 'de-DE';
    activeUtterance.rate = 0.90; // Natural, clear pedagogical pace
    if (germanVoice) activeUtterance.voice = germanVoice;

    setSpeakingState(true, targetButton);

    activeUtterance.onend = () => {
      setSpeakingState(false, targetButton);
      activeUtterance = null;
      if (onComplete) onComplete();
    };

    activeUtterance.onerror = () => {
      setSpeakingState(false, targetButton);
      activeUtterance = null;
    };

    window.speechSynthesis.speak(activeUtterance);
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

  // Fetch vocabulary data (or fallback)
  async function loadVocabulary() {
    try {
      const res = await fetch('data/vocabulary.json');
      if (!res.ok) throw new Error('Network error');
      allWords = await res.json();
    } catch (err) {
      console.warn('Loading fallback deck:', err);
      allWords = getFallbackDeck();
    }
    applyFilter('all');
  }

  function applyFilter(filterKey) {
    activeFilter = filterKey;

    filterChips.forEach(chip => {
      if (chip.getAttribute('data-filter') === filterKey) {
        chip.classList.add('active');
      } else {
        chip.classList.remove('active');
      }
    });

    if (filterKey === 'sein') {
      currentDeck = allWords.filter(w => w.hilfsverb === 'sein');
      deckIndicator.textContent = 'Deck: Perfekt mit »sein«';
    } else if (filterKey === 'trennbar') {
      currentDeck = allWords.filter(w => w.type && w.type.toLowerCase().includes('trennbar'));
      deckIndicator.textContent = 'Deck: Trennbare Verben';
    } else if (filterKey === 'unregelmaessig') {
      currentDeck = allWords.filter(w => w.type && (w.type.includes('unregelmäßig') || w.type.includes('gemischt')));
      deckIndicator.textContent = 'Deck: Unregelmäßige Verben';
    } else {
      currentDeck = [...allWords];
      deckIndicator.textContent = 'B1 Stammformen (Alle)';
    }

    currentIndex = 0;
    renderCurrentCard();
    updateProgress();
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

    // Highlight separable prefixes cleanly (only for trennbare Verben)
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
    exampleDe.textContent = item.exampleDe ? `»${item.exampleDe}«` : '';
    exampleEn.textContent = item.exampleEn || '';

    // Grammar Note
    if (item.note) {
      noteText.textContent = item.note;
      noteText.parentElement.style.display = 'flex';
    } else {
      noteText.parentElement.style.display = 'none';
    }

    // Update Counter
    cardCounter.textContent = `Karte ${currentIndex + 1} von ${currentDeck.length}`;
    updateProgress();
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

  function nextCard() {
    if (currentIndex < currentDeck.length - 1) {
      currentIndex++;
    } else {
      currentIndex = 0; // Loop or finish deck
    }
    renderCurrentCard();
  }

  function prevCard() {
    if (currentIndex > 0) {
      currentIndex--;
    } else {
      currentIndex = currentDeck.length - 1;
    }
    renderCurrentCard();
  }

  function updateProgress() {
    if (currentDeck.length === 0) return;
    const pct = Math.round(((currentIndex + 1) / currentDeck.length) * 100);
    progressBar.style.width = `${pct}%`;
    progressBar.parentElement.setAttribute('aria-valuenow', pct);
  }

  // Spaced Repetition Grading
  function recordGrade(grade) {
    stats.totalReviewed = (stats.totalReviewed || 0) + 1;
    if (grade === 'good' || grade === 'easy') {
      stats.correctCount = (stats.correctCount || 0) + 1;
    }
    saveStats(stats);
    updateStatsDisplay();

    // Smooth advance to next card after a brief visual cue
    setTimeout(() => {
      nextCard();
    }, 180);
  }

  function loadStats() {
    try {
      const data = localStorage.getItem(STATS_KEY);
      return data ? JSON.parse(data) : { totalReviewed: 0, correctCount: 0 };
    } catch {
      return { totalReviewed: 0, correctCount: 0 };
    }
  }

  function saveStats(s) {
    try {
      localStorage.setItem(STATS_KEY, JSON.stringify(s));
    } catch {}
  }

  function updateStatsDisplay() {
    statReviewed.textContent = stats.totalReviewed;
    if (stats.totalReviewed > 0) {
      const rate = Math.round((stats.correctCount / stats.totalReviewed) * 100);
      statRate.textContent = `${rate}%`;
    } else {
      statRate.textContent = '100%';
    }
  }

  // ================= Event Listeners =================

  let wasSwiped = false;

  // Card Flip on Click (excluding buttons inside or if just swiped)
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

  // Filter Chips
  filterChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const filter = chip.getAttribute('data-filter');
      applyFilter(filter);
    });
  });

  // Grade Buttons
  btnGrade1.addEventListener('click', () => recordGrade('again'));
  btnGrade2.addEventListener('click', () => recordGrade('hard'));
  btnGrade3.addEventListener('click', () => recordGrade('good'));
  btnGrade4.addEventListener('click', () => recordGrade('easy'));

  // Keyboard Shortcuts (Space, 1-4, A, Arrow Keys)
  document.addEventListener('keydown', (e) => {
    // Avoid interfering if focus is in an input
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

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
  }, { passive: true });

  flashcard.addEventListener('touchend', (e) => {
    const diffX = e.changedTouches[0].screenX - touchStartX;
    const diffY = e.changedTouches[0].screenY - touchStartY;
    // Horizontal swipe threshold: 60px with minimal vertical drift
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

  // Initial Load
  updateStatsDisplay();
  loadVocabulary();

  // Fallback deck embedded in case fetch fails
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
        note: "Orts- und Zustandswechsel → Perfekt immer mit »sein«."
      },
      {
        id: "v02",
        word: "anfangen",
        ipa: "[ˈanˌfaŋən]",
        meaning: "to begin, start",
        level: "A1/A2",
        type: "Verb · trennbar",
        praesens: "er fängt an",
        praeteritum: "fing an",
        hilfsverb: "haben",
        partizip2: "angefangen",
        perfekt: "hat angefangen",
        exampleDe: "Der Deutschkurs fängt nächsten Montag an.",
        exampleEn: "The German course starts next Monday.",
        note: "Vokalwechsel im Präsens: a → ä (du fängst an, er fängt an)."
      },
      {
        id: "v03",
        word: "bleiben",
        ipa: "[ˈblaɪ̯bn̩]",
        meaning: "to stay, remain",
        level: "A1",
        type: "Verb · unregelmäßig",
        praesens: "er bleibt",
        praeteritum: "blieb",
        hilfsverb: "sein",
        partizip2: "geblieben",
        perfekt: "ist geblieben",
        exampleDe: "Am Wochenende bin ich wegen des Regens zu Hause geblieben.",
        exampleEn: "At the weekend I stayed at home because of the rain.",
        note: "Zustandsverharren → eine der seltenen Ausnahmen: Perfekt mit »sein«."
      }
    ];
  }
})();
