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
  window.allWords = allWords;
  let currentDeck = [];
  window.getCurrentDeck = function() { return currentDeck; };
  let currentDeckId = 'universal-all';
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
  const SRS_STORAGE_KEY = 'wortschatz_srs_v2';
  const DAILY_GOAL_TARGET = 20;

  // In-memory study log: { "YYYY-MM-DD": { count: number, correct: number } }
  let studyLog = loadStudyLog();
  let deckProgress = loadDeckProgress();
  let srsData = loadSrsData();

  // Session stats for currently active run
  let sessionReviewedCount = 0;
  let sessionCorrectCount = 0;
  let sessionAgainCount = 0;
  let sessionHardCount = 0;
  let sessionGoodCount = 0;
  let sessionEasyCount = 0;

  // ================= Universal Archetype Engine (v3 Bento System) =================
  const TYPES = {
    noun: "Nomen",
    verb: "Verb",
    adj: "Adjektiv",
    conn: "Konnektor",
    prep: "Präposition",
    phrase: "Wendung"
  };

  const gc = a => ({ der: "m", die: "f", das: "n" }[a] || "m");
  const PRO = ["ich", "du", "er/sie/es", "wir", "ihr", "sie/Sie"];
  const AUX = {
    sein: ["bin", "bist", "ist", "sind", "seid", "sind"],
    haben: ["habe", "hast", "hat", "haben", "habt", "haben"]
  };

  const prx = e => e.pre ? `<span class="pre">${e.pre}</span>` : "";
  const hl = s => (s || "").replace(/\[\[(.+?)\]\]/g, "<mark>$1</mark>");
  const flow = a => `<div class="flow">${(a || []).map(b => {
    const i = b.lastIndexOf(":");
    const t = i > 0 ? b.slice(0, i) : b;
    return `<span class="fb ${i > 0 ? b.slice(i + 1) : ""}">${t}</span>`;
  }).join("")}</div>`;

  const exB = x => (x && x[0]) ? `<div class="ex"><p class="de">${hl(x[0])}</p><p class="en">${x[1] || ""}</p></div>` : "";

  // Segmented Slider System
  const PANE = {};
  let ST = {};
  const seg = (k, o, fn) => {
    PANE[k] = fn;
    const cur = ST[k] || o[0][0];
    return `<div class="seg" data-k="${k}"><i class="ind"></i>${o.map(([v, t]) => `<button type="button" data-v="${v}" class="${v === cur ? "on" : ""}">${t}</button>`).join("")}</div><div id="p-${k}">${fn(cur)}</div>`;
  };

  // Verb Conjugation Panes
  const vf = (e, t) => {
    const auxName = e.aux || "haben";
    const auxForms = AUX[auxName] || AUX.haben;
    if (t === "perf") return auxForms.map(x => `<span class="pre">${x}</span> ${e.p2 || ""}`);
    if (t === "imp") return null;
    const list = e[t === "praes" ? "praes" : "prat"] || [];
    return list.map(x => {
      if (!x) return '';
      if (!e.sep || !e.pre) return x;
      const trimmed = x.trim();
      const preRegex = new RegExp(`\\s+${e.pre}$`);
      if (preRegex.test(trimmed)) {
        return trimmed.replace(preRegex, ` ${prx(e)}`);
      }
      return `${trimmed} ${prx(e)}`;
    });
  };

  const vpane = (e, t) => {
    if (t === "imp") {
      const du = e.imp && e.imp[0] ? e.imp[0].replace(/\{(.+?)\}/g, '<span class="pre">$1</span>') : `${e.lemma}!`;
      const ihr = e.imp && e.imp[1] ? e.imp[1].replace(/\{(.+?)\}/g, '<span class="pre">$1</span>') : `${e.lemma}!`;
      const sie = e.imp && e.imp[2] ? e.imp[2].replace(/\{(.+?)\}/g, '<span class="pre">$1</span>') : `${e.lemma} Sie!`;
      return `<div class="chart" style="grid-template-columns:repeat(3,1fr)">
        <div><small>du</small><b>${du}</b></div>
        <div><small>ihr</small><b>${ihr}</b></div>
        <div><small>Sie</small><b>${sie}</b></div>
      </div>` + (e.exT && e.exT.praes ? exB(e.exT.praes) : "");
    }
    if (t === "perf") {
      const f = vf(e, "perf");
      return `<div class="chart" style="grid-template-columns:repeat(3,1fr)">
        ${f.slice(0, 3).map((h, i) => `<div><small>${PRO[i]}</small><b>${h}</b></div>`).join("")}
      </div>
      <div class="chart" style="grid-template-columns:repeat(3,1fr)">
        ${f.slice(3).map((h, i) => `<div><small>${PRO[i+3]}</small><b>${h}</b></div>`).join("")}
      </div>` + (e.exT && e.exT.perf ? exB(e.exT.perf) : "");
    }
    const forms = vf(e, t);
    const ex = (e.exT && (e.exT[t] || e.exT.praes)) || (e.ex ? e.ex : null);
    return `<div class="chart" style="grid-template-columns:repeat(3,1fr)">
      ${forms.slice(0, 3).map((h, i) => `<div><small>${PRO[i]}</small><b>${h}</b></div>`).join("")}
    </div>
    <div class="chart" style="grid-template-columns:repeat(3,1fr)">
      ${forms.slice(3).map((h, i) => `<div><small>${PRO[i+3]}</small><b>${h}</b></div>`).join("")}
    </div>` + (ex ? exB(ex) : "");
  };

  // Adjective Declension Panes
  const DA = {
    w: [["der","die","das","die"],["den","die","das","die"],["dem","der","dem","den"],["des","der","des","der"]],
    g: [["ein","eine","ein","keine"],["einen","eine","ein","keine"],["einem","einer","einem","keinen"],["eines","einer","eines","keiner"]],
    s: null
  };
  const DE = {
    w: [["e","e","e","en"],["en","e","e","en"],["en","en","en","en"],["en","en","en","en"]],
    g: [["er","e","es","en"],["en","e","es","en"],["en","en","en","en"],["en","en","en","en"]],
    s: [["er","e","es","e"],["en","e","es","e"],["em","er","em","en"],["en","er","en","er"]]
  };
  const apane = (e, t) => {
    const labs = ["maskulin","feminin","neutral","Plural"];
    const cases = ["Nominativ","Akkusativ","Dativ","Genitiv"];
    let h = `<div class="chart" style="grid-template-columns:5.5rem repeat(4,1fr)"><div class="lab"></div>${labs.map(l => `<div class="lab">${l}</div>`).join("")}`;
    cases.forEach((c, r) => {
      h += `<div class="lab">${c}</div>`;
      [0, 1, 2, 3].forEach(g => {
        const art = DA[t] ? DA[t][r][g] + " " : "";
        h += `<div>${art}${e.lemma}<span class="pre">${DE[t][r][g]}</span></div>`;
      });
    });
    return h + "</div>";
  };

  const S = (t, h, v, half) => ({ t, h, v, half });
  const sec = s => `<section class="sec">${s.t ? `<h3>${s.t}</h3>` : ""}${s.h}</section>`;

  // 6 Template Renderers
  const R = {
    noun(e) {
      const g = gc(e.art || "die");
      const A = { m: ["der", "den", "dem", "des"], f: ["die", "die", "der", "der"], n: ["das", "das", "dem", "des"] }[g] || ["die", "die", "der", "der"];
      const P = ["die", "die", "den", "der"];
      const s = e.lemma;
      const plStr = (e.pl || (s + "en")).replace(/^die\s+/i, '').trim();
      const dp = plStr.endsWith("n") || plStr.endsWith("s") ? plStr : plStr + "n";
      const gs = (e.genS || (g === "f" ? s : s + "s")).replace(/^(des|der)\s+/i, '').trim();
      const pl = [plStr, plStr, dp, plStr];
      const sg = [s, s, s, gs];
      const sufDisplay = e.suf || (s.endsWith("ung") ? "-ung" : (s.endsWith("heit") ? "-heit" : (s.endsWith("keit") ? "-keit" : "")));
      const ruleDisplay = e.rule || (e.art === "die" ? "Nomen auf -ung, -heit, -keit, -schaft, -tion → immer feminin." : (e.art === "der" ? "Maskuline Nomen mit der-Artikel." : "Neutrale Nomen mit das-Artikel."));

      return [
        S("", "<div class='pair'>" +
          `<section class="sec"><h3>Plural</h3><div class="big">die <span class="pre">${plStr}</span></div></section>` +
          `<section class="sec"><h3>Genus-Regel</h3><div class="big"><span class="pre">${sufDisplay}</span> → <span class="${g}">${e.art || "die"}</span></div><p class="en">${ruleDisplay}</p></section>` +
        "</div>"),
        S("Deklination", `<div class="chart" style="grid-template-columns:6rem 1fr 1fr"><div class="lab"></div><div class="lab">Singular</div><div class="lab">Plural</div>${["Nominativ","Akkusativ","Dativ","Genitiv"].map((c, i) => `<div class="lab">${c}</div><div><span class="${g}">${A[i]}</span> ${sg[i]}</div><div>${P[i]} ${pl[i]}</div>`).join("")}</div>`),
        ...(e.nvv && e.nvv.length ? [S("Nomen-Verb-Verbindung", `<div class="tiles">${e.nvv.map(([a, b]) => `<div><b>${a}</b><p class="en">${b}</p></div>`).join("")}</div>`)] : []),
        ...(e.compounds && e.compounds.length ? [S("Zusammensetzung", `<div class="chips">${e.compounds.map(x => `<span class="chip">${x}</span>`).join("")}</div>`)] : []),
        ...(e.ex ? [S("Beispiel", exB(e.ex), "b")] : []),
        ...(e.family && e.family.length ? [S("Wortfamilie", `<div class="chips">${e.family.map(x => `<span class="chip">${x}</span>`).join("")}</div>`, "d")] : [])
      ];
    },

    verb(e) {
      const auxName = e.aux || e.hilfsverb || "haben";
      const auxForms = AUX[auxName] || AUX.haben;
      const stammPerf = `<span class="pre">${auxForms[2]}</span> ${e.p2 || ""}`;
      let rawPrat3 = (e.prat && e.prat[2]) ? e.prat[2] : (e.praeteritum || e.lemma);
      let prat3Html = rawPrat3;
      if (e.sep && e.pre) {
        const trimmed = rawPrat3.trim();
        const preRegex = new RegExp(`\\s+${e.pre}$`);
        if (preRegex.test(trimmed)) {
          prat3Html = trimmed.replace(preRegex, ` ${prx(e)}`);
        } else {
          prat3Html = `${trimmed} ${prx(e)}`;
        }
      }
      return [
        S("Stammformen", `<div class="stamm-hero">
          <div><small>Infinitiv</small><b>${e.lemma}</b></div>
          <div><small>Präteritum</small><b>${prat3Html}</b></div>
          <div class="perfekt-cell"><small>Perfekt</small><b>${stammPerf}</b></div>
        </div>`),
        S("Konjugation", seg("tense", [["praes","Präsens"], ["prat","Präteritum"], ["perf","Perfekt"], ["imp","Imperativ"]], t => vpane(e, t)), "b"),
        ...(e.val && e.val.length ? [S("Valenz", `<div class="tiles">${e.val.map(v => `<div><span class="cl">${v[0]}</span><b></b><small>${v[1]}</small><p>${v[2]}</p></div>`).join("")}</div>`)] : []),
        ...(e.family && e.family.length ? [S("Wortfamilie", `<div class="chips">${e.family.map(x => `<span class="chip">${x}</span>`).join("")}</div>`, "d")] : [])
      ];
    },

    adj(e) {
      let komp = e.compStr || (typeof e.comp === 'string' ? e.comp : null);
      let sup = e.supStr || (typeof e.sup === 'string' ? e.sup : null);
      if (Array.isArray(e.comp)) {
        const k = e.comp.find(p => p[0] === 'Komparativ');
        const s = e.comp.find(p => p[0] === 'Superlativ');
        if (k && !komp) komp = k[1];
        if (s && !sup) sup = s[1];
      }
      if (!komp) komp = e.lemma + "er";
      if (!sup) sup = "am " + e.lemma + "sten";
      const ant = e.ant || e.opp || "";
      return [
        S("Steigerung", `<div class="ladder">${[["Positiv", e.lemma, 33], ["Komparativ", komp, 66], ["Superlativ", sup, 100]].map(([a, b, w]) => `<div><small>${a}</small><b>${b}</b><i class="bar2" style="width:${w}%"></i></div>`).join("")}</div>`),
        S("", "<div class='pair'>" +
          (ant ? `<section class="sec"><h3>Gegenteil</h3><div class="big">↔ ${ant}</div></section>` : "") +
          (e.syn && e.syn.length ? `<section class="sec"><h3>Synonym</h3><div class="chips">${e.syn.map(x => `<span class="chip">${x}</span>`).join("")}</div></section>` : "") +
        "</div>"),
        ...(e.anchors ? [S("Endungen (Anker-Muster: ein-)", `<div class="anchor-row">${e.anchors.map(([form, noun]) => {
          const parts = form.split("·");
          return `<div><b>${parts[0]}<span class="ending">${parts[1] || ""}</span></b><small>${noun}</small></div>`;
        }).join("")}</div>`)] : []),
        ...(e.ex ? [S("Beispiel", exB(e.ex), "b")] : []),
        S("Endungen vor dem Nomen", seg("decl", [["w", "nach der/die/das"], ["g", "nach ein-/kein-"], ["s", "ohne Artikel"]], t => apane(e, t)), "d"),
        ...(e.family && e.family.length ? [S("Wortfamilie", `<div class="chips">${e.family.map(x => `<span class="chip">${x}</span>`).join("")}</div>`, "d")] : [])
      ];
    },

    conn(e) {
      return [
        S("Klasse", `<div class="chips"><span class="chip">${e.cls || "Konnektor"}</span></div>`),
        ...(e.orders ? [S("Satzbau", seg("ord", e.orders.map((o, i) => [i, o[0]]), i => flow(e.orders[i][1]) + exB([e.orders[i][2], ""])))] : []),
        ...(e.cmp ? [S("Vergleich", `<div class="tiles">${e.cmp.map(t => `<div><span class="cl">${t.cls}</span><b>${t.w}</b>${t.b ? flow(t.b) : ""}<p>${hl(t.ex)}</p></div>`).join("")}</div>`)] : [])
      ];
    },

    prep(e) {
      if (e.wechsel) {
        return [
          S("Wechselpräposition", seg("wowohin", [["wo", "Wo? → Dativ"], ["wohin", "Wohin? → Akkusativ"]], t => {
            const c = e.cases[t];
            return `<div class="chart" style="grid-template-columns:1fr 1fr">
              <div><small>Frage</small><b class="hero">${c.q}</b></div>
              <div><small>Kasus</small><b class="hero"><span class="pre">+ ${c.cs}</span></b></div>
            </div>` + exB([c.ex, c.en]);
          })),
          ...(e.cmp ? [S("Vergleich", `<div class="tiles">${e.cmp.map(t => `<div><span class="cl">${t.cls}</span><b>${t.w}</b><small>${t.q}</small><p>${t.ex}</p></div>`).join("")}</div>`)] : []),
          ...(e.ex ? [S("Beispiel", exB(e.ex), "b")] : []),
          ...(e.family && e.family.length ? [S("Typische Verbindungen", `<div class="chips">${e.family.map(x => `<span class="chip">${x}</span>`).join("")}</div>`, "d")] : [])
        ];
      }
      const cs = (e.cases && e.cases.wo && e.cases.wo.cs) || "Akkusativ";
      const q = (e.cases && e.cases.wo && e.cases.wo.q) || "Kasus";
      const en = (e.cases && e.cases.wo && e.cases.wo.en) || "";
      return [
        S("", "<div class='pair'>" +
          `<section class="sec"><h3>Kasus</h3><div class="big"><span class="pre">+ ${cs}</span></div></section>` +
          `<section class="sec"><h3>${q}</h3><p>${en}</p></section>` +
        "</div>"),
        ...(e.ex ? [S("Beispiel", exB(e.ex), "b")] : [])
      ];
    },

    phrase(e) {
      return [
        S("Muster", (e.frame ? flow(e.frame) : "") + `<p class="en">${e.type || "Redewendung"} · ${e.cap || ""}</p>` + (e.examTag ? `<span class="tag hilfs" style="margin-top:6px;display:inline-block">${e.examTag}</span>` : "")),
        ...(e.reg ? [S("Register", Array.isArray(e.reg) && typeof e.reg[0] === 'object' ? seg("reg", e.reg.map((r, i) => [i, r[0]]), i => `<div class="ex"><p class="de">${hl(e.reg[i][1])}</p><p class="en">${e.reg[i][2]}</p></div>`) : `<p class="en">${e.reg}</p>`)] : []),
        ...(e.tenses ? [S("Zeitformen", `<div class="chart" style="grid-template-columns:repeat(3,1fr)">${e.tenses.map(t => `<div><small>${t[0]}</small><b style="font-size:13px;font-weight:500">${t[1]}</b></div>`).join("")}</div>`)] : []),
        ...(e.dlg && e.dlg.length ? [S("Mini-Dialog", `<div class="dlg">${e.dlg.map((d, i) => {
          const isRight = d[0] === "B" || i % 2 === 1;
          const label = (d[0] && d[0] !== 'A' && d[0] !== 'B') ? `<b>${d[0]}:</b> ` : '';
          return `<p class="bub ${isRight ? "r" : ""}">${label}${d[1] || d[0]}</p>`;
        }).join("")}</div>`)] : []),
        ...(e.ex ? [S("Beispiel", exB(e.ex), "b")] : [])
      ];
    }
  };

  const lemmaH = e => {
    if (e.pos === "noun") {
      const art = e.art || "die";
      return `<span class="${gc(art)}">${art}</span> ${e.lemma}`;
    }
    if (e.sep && e.pre) {
      if (e.lemma.startsWith(e.pre)) {
        return `<span class="pre">${e.pre}</span>${e.lemma.slice(e.pre.length)}`;
      }
      return e.lemma.replace(e.pre, `<span class="pre">${e.pre}</span>`);
    }
    return e.lemma || e.word || "";
  };

  function normalizeWordItem(item) {
    if (!item) return item;
    const pos = item.pos || (item.art ? 'noun' : (item.cases ? 'prep' : (item.orders ? 'conn' : (item.comp ? 'adj' : (item.reg ? 'phrase' : 'verb')))));
    const lemma = item.lemma || item.word || '';
    const gloss = item.gloss || item.meaning || '';
    const tip = item.tip || item.note || '';
    const level = item.level || 'B1';
    const ipa = item.ipa || '';
    const family = item.family || (item.wordFamily ? item.wordFamily : [lemma]);

    const norm = {
      ...item,
      id: item.id || (pos + '-' + lemma.replace(/\s+/g, '-')),
      pos,
      lemma,
      word: lemma,
      gloss,
      meaning: gloss,
      tip,
      note: tip,
      level,
      ipa,
      family
    };

    if (pos === 'verb') {
      norm.sep = item.sep !== undefined ? item.sep : (item.type ? item.type.toLowerCase().includes('trennbar') : false);
      norm.aux = item.aux || item.hilfsverb || (item.perfekt && item.perfekt.startsWith('ist') ? 'sein' : 'haben');
      norm.p2 = item.p2 || item.partizip2 || (item.perfekt ? item.perfekt.replace(/^(ist|hat)\s+/, '') : '');
      norm.reflexiv = item.reflexiv !== undefined ? item.reflexiv : (lemma.startsWith('sich ') ? 'sich (Akk)' : false);
      norm.pre = item.pre !== undefined ? item.pre : (norm.sep ? (item.prefix || (lemma.match(/^(auf|an|aus|ab|bei|ein|mit|nach|vor|zu|weg|zurück)/) || [''])[0]) : '');

      if (!norm.praes && item.praesensAll) {
        norm.praes = [
          item.praesensAll.ich || '',
          item.praesensAll.du || '',
          item.praesensAll.er_sie_es || item.praesens || '',
          item.praesensAll.wir_Sie || '',
          item.praesensAll.ihr || '',
          item.praesensAll.wir_Sie || ''
        ];
      } else if (!norm.praes) {
        norm.praes = [lemma, lemma, item.praesens || lemma, lemma, lemma, lemma];
      }

      if (!norm.prat) {
        const pr = item.praeteritum || '';
        norm.prat = [pr, pr, pr, pr, pr, pr];
      }

      if (!norm.imp) {
        const base = lemma.replace(/en$/, '');
        norm.imp = [
          `${base} {${norm.pre}}!`,
          `${base}t {${norm.pre}}!`,
          `${lemma} Sie {${norm.pre}}!`
        ];
      }

      if (!norm.exT) {
        norm.exT = {
          praes: [item.examples?.praesens?.de || item.exampleDe || '', item.examples?.praesens?.en || item.exampleEn || ''],
          prat: [item.examples?.praeteritum?.de || item.exampleDe || '', item.examples?.praeteritum?.en || item.exampleEn || ''],
          perf: [item.examples?.perfekt?.de || item.exampleDe || '', item.examples?.perfekt?.en || item.exampleEn || '']
        };
      }

      if (!norm.val) {
        norm.val = [
          [norm.aux === 'sein' ? 'Ortswechsel' : 'Transitiv', 'Kasus/Funktion', norm.exT.praes[0] || '']
        ];
      }
    }

    return norm;
  }

  function renderUniversalCardBack(item, isDict = false) {
    const e = normalizeWordItem(item);
    const renderer = R[e.pos] || R.verb;
    const list = renderer(e).filter(s => isDict ? true : (!s.v || s.v === "b"));
    let o = "";
    for (const s of list) {
      if (s.t === "" && s.h.startsWith("<div class='pair'>")) {
        o += s.h;
        continue;
      }
      o += sec(s);
    }

    let tags = `<span class="tag">${e.level || 'B1'}</span><span class="tag">${TYPES[e.pos] || 'Wort'}${e.sep ? ' · trennbar' : ''}</span>`;
    if (e.reflexiv) tags += `<span class="tag reflex">reflexiv · ${e.reflexiv}</span>`;
    if (e.aux) tags += `<span class="tag hilfs">Hilfsverb: ${e.aux}</span>`;
    if (e.wechsel) tags += `<span class="tag hilfs">Wechselpräposition</span>`;
    if (e.examTag) tags += `<span class="tag hilfs">${e.examTag}</span>`;

    const audioSpkBtn = `
      <button class="audio-button audio-button-sm btn-speak-current" title="Aussprache anhören (Taste A)" aria-label="Aussprache anhören">
        <svg class="icon-speaker" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
        </svg>
        <span class="audio-btn-text">Audio</span>
      </button>
    `;

    return `
      <div class="card-head-row" style="display:flex; justify-content:space-between; align-items:center; padding:18px 24px 0;">
        <div class="tag-group" style="display:flex; gap:6px; flex-wrap:wrap; align-items:center;">
          ${tags}
        </div>
        ${audioSpkBtn}
      </div>

      <div class="card-lemma-hero" style="padding:14px 24px 2px;">
        <div class="card-lemma-title">${lemmaH(e)}</div>
        ${e.ipa ? `<p class="card-ipa">${e.ipa}</p>` : ''}
        <p class="card-gloss">${e.gloss || e.meaning || ''}</p>
      </div>

      ${formatSrsCardStrip(e)}

      <div class="card-body-sections">
        ${o}
      </div>

      ${e.tip ? `<div class="tip">💡 ${e.tip}</div>` : ''}

      ${isDict ? '' : `
        <div class="dict-trigger-row" style="padding: 10px 24px 16px; text-align: right;">
          <a class="btn-dict-trigger" style="cursor:pointer; color:var(--text-muted); font-size:13px; font-weight:600; display:inline-flex; align-items:center; gap:6px;">
            <span>Anatomie &amp; Wörterbuch öffnen</span>
            <kbd style="font-size:11px; padding:1px 5px; border:1px solid var(--border-subtle); border-radius:4px; background:var(--bg-surface-subtle);">D</kbd>
          </a>
        </div>
      `}
    `;
  }

  function placeIndicator(s) {
    if (!s) return;
    const b = s.querySelector('.on');
    const ind = s.querySelector('.ind');
    if (!b || !ind) return;
    ind.style.width = b.offsetWidth + 'px';
    ind.style.transform = `translateX(${b.offsetLeft}px)`;
  }

  function initSegmentedSliders(container) {
    if (!container) return;
    requestAnimationFrame(() => {
      container.querySelectorAll('.seg').forEach(placeIndicator);
    });
  }

  function speakCurrentWord(targetButton = null) {
    const item = window.currentWordData || (currentDeck && currentDeck[currentIndex]);
    if (!item) return;
    const norm = normalizeWordItem(item);
    let textToSpeak = norm.lemma;
    if (norm.pos === 'noun') {
      textToSpeak = `${norm.art || 'die'} ${norm.lemma}`;
    }
    speakText(textToSpeak, null, targetButton);
  }

  // Expose globally for IIFE 2 and other modules
  window.normalizeWordItem = normalizeWordItem;
  window.renderUniversalCardBack = renderUniversalCardBack;
  window.initSegmentedSliders = initSegmentedSliders;
  window.speakCurrentWord = speakCurrentWord;

  // Hierarchical Folder & Deck Architecture
  const FOLDERS_CONFIG = [
    {
      id: 'folder-netzwerk-a2',
      title: 'Netzwerk A2 · Thematischer Wortschatz',
      badge: 'Netzwerk A2 · 10 Decks',
      icon: 'goethe',
      desc: 'Der vollständige Wortschatz des Lehrwerks Netzwerk A2 (Lektionen 1–12, 751 Originalkarten) strukturiert in 10 thematische Bento-Decks: Mobilität, Wohnen, Essen, Beruf, Bildung, Gesundheit, Feste, Medien, Freizeit & Redemittel.',
      decks: [
        {
          id: 'a2-deck-all',
          title: 'Netzwerk A2 (Alle 10 Themen)',
          desc: 'Der gesamte Netzwerk A2 Wortschatz (727 Karten, 751 Lektionsvokabeln) im direkten thematischen Wechsel trainieren.',
          tag: 'A2 Gesamt',
          level: 'A2',
          filter: (w) => w.deckId && w.deckId.startsWith('a2-deck-')
        },
        {
          id: 'a2-deck-01',
          title: '1. Mobilität, Verkehr & Reisen',
          desc: 'Fahrzeuge, Bahn, Flughafen, Orientierung, Richtungsangaben und Wegbeschreibungen.',
          tag: 'Mobilität',
          level: 'A2',
          filter: (w) => w.deckId === 'a2-deck-01'
        },
        {
          id: 'a2-deck-02',
          title: '2. Wohnen, Haushalt & Stadtleben',
          desc: 'Wohnungssuche, Zimmer, Möbel, Elektrogeräte, Miete, Nachbarschaft und Reparaturen.',
          tag: 'Wohnen',
          level: 'A2',
          filter: (w) => w.deckId === 'a2-deck-02'
        },
        {
          id: 'a2-deck-03',
          title: '3. Essen, Trinken & Kochen',
          desc: 'Lebensmittel, Küche, Zubereitung, Mahlzeiten, Restaurant und Mengenangaben.',
          tag: 'Essen',
          level: 'A2',
          filter: (w) => w.deckId === 'a2-deck-03'
        },
        {
          id: 'a2-deck-04',
          title: '4. Arbeit, Beruf & Büroalltag',
          desc: 'Berufe, Vorstellungsgespräch, Arbeitsvertrag, Arbeitszeiten, Kollegen und Büroalltag.',
          tag: 'Beruf',
          level: 'A2',
          filter: (w) => w.deckId === 'a2-deck-04'
        },
        {
          id: 'a2-deck-05',
          title: '5. Bildung, Schule & Lernen',
          desc: 'Schule, Ausbildung, Universität, Sprachenlernen, Prüfungen und Noten.',
          tag: 'Bildung',
          level: 'A2',
          filter: (w) => w.deckId === 'a2-deck-05'
        },
        {
          id: 'a2-deck-06',
          title: '6. Körper, Gesundheit & Gefühle',
          desc: 'Körperteile, Symptome, Arztbesuch, Medikamente, Wohlbefinden und Emotionen.',
          tag: 'Gesundheit',
          level: 'A2',
          filter: (w) => w.deckId === 'a2-deck-06'
        },
        {
          id: 'a2-deck-07',
          title: '7. Feste, Bräuche & Beziehungen',
          desc: 'Feiertage, Geburtstag, Einladungen, Traditionen, Familie und Freundschaft.',
          tag: 'Feste',
          level: 'A2',
          filter: (w) => w.deckId === 'a2-deck-07'
        },
        {
          id: 'a2-deck-08',
          title: '8. Medien, Kultur & Digitale Welt',
          desc: 'Computer, Internet, Fernsehen, Presse, Film, Musik und soziale Netzwerke.',
          tag: 'Medien',
          level: 'A2',
          filter: (w) => w.deckId === 'a2-deck-08'
        },
        {
          id: 'a2-deck-09',
          title: '9. Freizeit, Sport & Natur',
          desc: 'Sportarten, Hobbys, Wandern, Geocaching, Tiere, Landschaft und Naturphänomene.',
          tag: 'Freizeit',
          level: 'A2',
          filter: (w) => w.deckId === 'a2-deck-09'
        },
        {
          id: 'a2-deck-10',
          title: '10. Redemittel & Kommunikation',
          desc: 'Meinungsäußerung, Zustimmung/Widerspruch, Vorschläge machen und Alltagsdialoge.',
          tag: 'Redemittel',
          level: 'A2',
          filter: (w) => w.deckId === 'a2-deck-10'
        }
      ]
    },
    {
      id: 'folder-universal-b1',
      title: 'B1 Universal Wortschatz (6 Wortarten)',
      badge: 'Universal · Bento',
      icon: 'goethe',
      desc: 'Das neue B1 Universal-System nach CEFR B1: Nomen mit Genus-Regeln, Verben mit Stammformen & Reflexiv, Adjektive mit Steigerung & Deklination, Konnektoren mit Satzbau-Syntax, Wechselpräpositionen und Wendungen.',
      decks: [
        {
          id: 'universal-all',
          title: 'Universal B1 (Alle 6 Wortarten)',
          desc: 'Alle 6 B1-Archetypen im direkten Wechsel trainieren: Nomen, Verben, Adjektive, Konnektoren, Präpositionen und Wendungen.',
          tag: 'Gesamtsammlung',
          level: 'B1',
          filter: (w) => true
        },
        {
          id: 'deck-nomen',
          title: 'B1 Nomen & Genus-Regeln',
          desc: 'Substantive mit Pluralbildung, Deklinationsraster, festen Nomen-Verb-Verbindungen und Genus-Endungsregeln (-ung, -heit, etc.).',
          tag: 'Nomen',
          level: 'B1',
          filter: (w) => w.pos === 'noun' || (w.type && w.type.toLowerCase().includes('nomen'))
        },
        {
          id: 'deck-verben',
          title: 'B1 Verben & Stammformen',
          desc: 'Verben mit Stammformen (Infinitiv, Präteritum, Perfekt), trennbaren Präfixen, Reflexivpronomen (sich Akk/Dat) und Valenz.',
          tag: 'Verben',
          level: 'A2 / B1',
          filter: (w) => w.pos === 'verb' || (!w.pos && (w.praeteritum || w.perfekt))
        },
        {
          id: 'deck-adjektive',
          title: 'B1 Adjektive & Deklinations-Anker',
          desc: 'Adjektive mit Steigerungsleiter (Positiv, Komparativ, Superlativ), Gegenteilen und Deklinationsendungen (der/ein/ohne Artikel).',
          tag: 'Adjektive',
          level: 'B1',
          filter: (w) => w.pos === 'adj' || (w.type && w.type.toLowerCase().includes('adjektiv'))
        },
        {
          id: 'deck-konnektoren',
          title: 'B1 Konnektoren & Satzbau',
          desc: 'Subjunktionen, Konjunktionen und Adverbien mit visueller Satzbau-Syntax (Hauptsatz vs. Nebensatz, Verb-Endstellung).',
          tag: 'Satzbau',
          level: 'B1',
          filter: (w) => w.pos === 'conn' || (w.type && w.type.toLowerCase().includes('konnektor'))
        },
        {
          id: 'deck-praepositionen',
          title: 'B1 Wechselpräpositionen',
          desc: 'Präpositionen mit dynamischem Wo? (Dativ / Lage) vs. Wohin? (Akkusativ / Richtung) Umschalter und typischen Wendungen.',
          tag: 'Kasus',
          level: 'A2 / B1',
          filter: (w) => w.pos === 'prep' || (w.type && w.type.toLowerCase().includes('präposition'))
        },
        {
          id: 'deck-wendungen',
          title: 'B1 Wendungen & Redemittel',
          desc: 'Feste Redewendungen, Nomen-Verb-Verbindungen und dialogorientierte Redemittel für Goethe B1 Schreiben & Sprechen.',
          tag: 'Prüfung',
          level: 'B1',
          filter: (w) => w.pos === 'phrase' || (w.type && (w.type.toLowerCase().includes('wendung') || w.type.toLowerCase().includes('redemittel')))
        }
      ]
    },
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
    ALL_DECKS_MAP['universal-all'],
    ALL_DECKS_MAP['deck-nomen'],
    ALL_DECKS_MAP['deck-verben'],
    ALL_DECKS_MAP['deck-konnektoren']
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
  const navItemStats = document.getElementById('nav-item-stats');
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
  const frontTags = document.getElementById('front-tags');
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

  // ================= Spaced Repetition System (SRS / SM-2 Engine) =================
  function loadSrsData() {
    try {
      const data = localStorage.getItem(SRS_STORAGE_KEY);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }

  function saveSrsData() {
    try {
      localStorage.setItem(SRS_STORAGE_KEY, JSON.stringify(srsData));
    } catch {}
  }

  function getCardKey(item) {
    if (!item) return '';
    const id = item.id || '';
    const word = (item.word || item.lemma || '').trim();
    return id ? `${id}::${word}` : word;
  }

  function getCardSrs(item) {
    if (!item) return null;
    const key = getCardKey(item);
    if (!srsData[key]) {
      srsData[key] = {
        key: key,
        id: item.id || '',
        word: item.word || item.lemma || '',
        state: 'new', // 'new' | 'learning' | 'review' | 'mastered'
        reps: 0,
        interval: 0, // in days
        easeFactor: 2.5, // SM-2 default ease
        dueDate: 0, // timestamp in ms
        lastReviewed: null,
        lastGrade: null,
        againCount: 0,
        hardCount: 0,
        goodCount: 0,
        easyCount: 0,
        totalReviews: 0,
        lapses: 0
      };
    }
    return srsData[key];
  }

  function previewNextIntervals(item) {
    const srs = getCardSrs(item);
    if (!srs) {
      return {
        again: { label: '< 1 Min', days: 0 },
        hard: { label: '1 Tag', days: 1 },
        good: { label: '1 Tag', days: 1 },
        easy: { label: '4 Tage', days: 4 }
      };
    }

    // 1. Button 1: Again (re-queue immediately in current session)
    const againLabel = '< 1 Min';

    // 2. Button 2: Hard
    let hardDays = 1;
    if (srs.state === 'new' || srs.state === 'learning') {
      hardDays = 1;
    } else {
      hardDays = Math.max(1, Math.round((srs.interval || 1) * 1.2));
    }
    const hardLabel = hardDays === 1 ? '1 Tag' : `${hardDays} Tage`;

    // 3. Button 3: Good
    let goodDays = 1;
    if (srs.state === 'new' || srs.state === 'learning') {
      goodDays = 1;
    } else if (srs.reps === 1) {
      goodDays = 6;
    } else {
      goodDays = Math.max(2, Math.round((srs.interval || 1) * (srs.easeFactor || 2.5)));
    }
    const goodLabel = goodDays === 1 ? '1 Tag' : `${goodDays} Tage`;

    // 4. Button 4: Easy
    let easyDays = 4;
    if (srs.state === 'new' || srs.state === 'learning') {
      easyDays = 4;
    } else {
      easyDays = Math.max(4, Math.round((srs.interval || 1) * (srs.easeFactor || 2.5) * 1.3));
    }
    const easyLabel = `${easyDays} Tage`;

    return {
      again: { label: againLabel, days: 0 },
      hard: { label: hardLabel, days: hardDays },
      good: { label: goodLabel, days: goodDays },
      easy: { label: easyLabel, days: easyDays }
    };
  }

  function processCardGrade(item, grade) {
    if (!item) return null;
    const srs = getCardSrs(item);
    const now = Date.now();
    const ONE_DAY_MS = 24 * 60 * 60 * 1000;

    srs.lastReviewed = now;
    srs.lastGrade = grade;
    srs.totalReviews = (srs.totalReviews || 0) + 1;

    if (grade === 'again') {
      srs.againCount = (srs.againCount || 0) + 1;
      if (srs.state === 'review' || srs.state === 'mastered') {
        srs.lapses = (srs.lapses || 0) + 1;
      }
      srs.reps = 0;
      srs.interval = 0;
      srs.easeFactor = Math.max(1.3, Number(((srs.easeFactor || 2.5) - 0.20).toFixed(2)));
      srs.state = 'learning';
      srs.dueDate = now + 60 * 1000; // due in 1 min
    } else if (grade === 'hard') {
      srs.hardCount = (srs.hardCount || 0) + 1;
      srs.easeFactor = Math.max(1.3, Number(((srs.easeFactor || 2.5) - 0.15).toFixed(2)));
      if (srs.state === 'new' || srs.state === 'learning') {
        srs.reps = 1;
        srs.interval = 1;
        srs.state = 'learning';
      } else {
        srs.reps = (srs.reps || 0) + 1;
        srs.interval = Math.max(1, Math.round((srs.interval || 1) * 1.2));
        srs.state = srs.interval >= 21 ? 'mastered' : 'review';
      }
      srs.dueDate = now + srs.interval * ONE_DAY_MS;
    } else if (grade === 'good') {
      srs.goodCount = (srs.goodCount || 0) + 1;
      if (srs.state === 'new' || srs.state === 'learning') {
        srs.reps = 1;
        srs.interval = 1;
        srs.state = 'review';
      } else {
        srs.reps = (srs.reps || 0) + 1;
        if (srs.reps === 2) {
          srs.interval = 6;
        } else {
          srs.interval = Math.max(2, Math.round((srs.interval || 1) * (srs.easeFactor || 2.5)));
        }
        srs.state = srs.interval >= 21 ? 'mastered' : 'review';
      }
      srs.dueDate = now + srs.interval * ONE_DAY_MS;
    } else if (grade === 'easy') {
      srs.easyCount = (srs.easyCount || 0) + 1;
      srs.easeFactor = Math.min(3.0, Number(((srs.easeFactor || 2.5) + 0.15).toFixed(2)));
      if (srs.state === 'new' || srs.state === 'learning') {
        srs.reps = 1;
        srs.interval = 4;
        srs.state = 'review';
      } else {
        srs.reps = (srs.reps || 0) + 1;
        srs.interval = Math.max(4, Math.round((srs.interval || 1) * (srs.easeFactor || 2.5) * 1.3));
        srs.state = srs.interval >= 21 ? 'mastered' : 'review';
      }
      srs.dueDate = now + srs.interval * ONE_DAY_MS;
    }

    srsData[srs.key] = srs;
    saveSrsData();
    return srs;
  }

  function getDeckSrsStats(deckFilter) {
    const filtered = allWords.filter(deckFilter || (() => true));
    const total = filtered.length;
    let learned = 0;
    let due = 0;
    const now = Date.now();

    filtered.forEach(w => {
      const s = srsData[getCardKey(w)];
      if (s && s.state && s.state !== 'new') {
        learned++;
        if (s.dueDate && s.dueDate <= now) {
          due++;
        }
      }
    });

    const pct = total > 0 ? Math.round((learned / total) * 100) : 0;
    return { total, learned, due, pct };
  }

  function prepareDeckQueue(rawCards) {
    const now = Date.now();
    const dueCards = [];
    const learningCards = [];
    const newCards = [];
    const futureCards = [];

    rawCards.forEach(c => {
      const s = getCardSrs(c);
      if (s.state === 'new') {
        newCards.push(c);
      } else if (s.state === 'learning' || (s.dueDate && s.dueDate <= now)) {
        if (s.state === 'learning') {
          learningCards.push(c);
        } else {
          dueCards.push(c);
        }
      } else {
        futureCards.push(c);
      }
    });

    dueCards.sort((a, b) => (getCardSrs(a).dueDate || 0) - (getCardSrs(b).dueDate || 0));
    futureCards.sort((a, b) => (getCardSrs(a).dueDate || 0) - (getCardSrs(b).dueDate || 0));

    const queue = [...dueCards, ...learningCards, ...newCards, ...futureCards];
    return {
      queue: queue.length > 0 ? queue : rawCards,
      dueCount: dueCards.length,
      learningCount: learningCards.length,
      newCount: newCards.length
    };
  }

  function formatSrsCardStrip(item) {
    const srs = getCardSrs(item);
    if (!srs) return '';

    let stateTitle = 'Neu';
    let stateColor = '#2563eb';
    let stateBg = 'rgba(59,130,246,0.10)';

    if (srs.state === 'new') {
      stateTitle = 'Neu';
      stateColor = '#2563eb';
      stateBg = 'rgba(59,130,246,0.10)';
    } else if (srs.dueDate && srs.dueDate <= Date.now()) {
      stateTitle = '⚡ Fällig';
      stateColor = '#dc2626';
      stateBg = 'rgba(239,68,68,0.12)';
    } else if (srs.state === 'learning') {
      stateTitle = 'Im Lernprozess';
      stateColor = '#d97706';
      stateBg = 'rgba(245,158,11,0.12)';
    } else if (srs.state === 'mastered') {
      stateTitle = '★ Gemeistert';
      stateColor = '#059669';
      stateBg = 'rgba(16,185,129,0.16)';
    } else {
      stateTitle = 'Gelernt';
      stateColor = '#059669';
      stateBg = 'rgba(16,185,129,0.10)';
    }

    const gradeNames = {
      again: 'Nochmal',
      hard: 'Schwer',
      good: 'Gut',
      easy: 'Leicht'
    };
    const lastRatingText = srs.lastGrade ? (gradeNames[srs.lastGrade] || srs.lastGrade) : '–';

    return `
      <div class="srs-card-bar" style="margin: 12px 24px 6px; padding: 10px 14px; background: var(--bg-surface-subtle); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: var(--text-secondary); flex-wrap: wrap; gap: 8px;">
        <div style="display:flex; align-items:center; gap:8px;">
          <span style="font-weight:700; color:var(--text-primary); font-size:11px; text-transform:uppercase; letter-spacing:0.5px;">SRS-Status:</span>
          <span style="padding:2px 8px; border-radius:999px; font-weight:700; font-size:11px; background:${stateBg}; color:${stateColor};">${stateTitle}</span>
        </div>
        <div style="display:flex; gap:12px; font-size:11px; align-items:center; flex-wrap:wrap;">
          <span>Intervall: <strong style="color:var(--text-primary);">${srs.interval || 0}d</strong></span>
          <span>Faktor: <strong style="color:var(--text-primary);">${(srs.easeFactor || 2.5).toFixed(2)}</strong></span>
          <span>Wdh: <strong style="color:var(--text-primary);">${srs.reps || 0}</strong></span>
          <span>Zuletzt: <strong style="color:var(--text-primary);">${lastRatingText}</strong></span>
        </div>
      </div>
    `;
  }

  function updateGradeDockButtons(item) {
    const preview = previewNextIntervals(item);
    const timeAgain = document.querySelector('#btn-grade-1 .grade-time');
    const timeHard = document.querySelector('#btn-grade-2 .grade-time');
    const timeGood = document.querySelector('#btn-grade-3 .grade-time');
    const timeEasy = document.querySelector('#btn-grade-4 .grade-time');

    if (timeAgain) timeAgain.textContent = preview.again.label;
    if (timeHard) timeHard.textContent = preview.hard.label;
    if (timeGood) timeGood.textContent = preview.good.label;
    if (timeEasy) timeEasy.textContent = preview.easy.label;
  }

  // Expose Spaced Repetition engine synchronously on window
  window.getCardKey = getCardKey;
  window.getCardSrs = getCardSrs;
  window.previewNextIntervals = previewNextIntervals;
  window.processCardGrade = processCardGrade;
  window.getDeckSrsStats = getDeckSrsStats;
  window.srsData = srsData;
  window.recordGrade = recordGrade;
  window.startDeckStudy = startDeckStudy;

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

    // Cleanly hide all view containers so no overlapping or stuck views occur
    document.querySelectorAll('.view-container').forEach(v => v.classList.add('hidden'));

    if (viewName === 'study') {
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
      if (navItemStats) navItemStats.classList.remove('active');

      renderDecksLibraryView();
    } else if (viewName === 'stats') {
      const vStats = document.getElementById('view-stats');
      if (vStats) {
        vStats.classList.remove('hidden');
      }

      btnBackHome.classList.remove('hidden');
      if (btnBackHomeText) {
        btnBackHomeText.textContent = 'Übersicht';
      }
      headerBrandGroup.classList.add('hidden');

      if (navItemHome) navItemHome.classList.remove('active');
      if (navItemDecks) navItemDecks.classList.remove('active');
      if (navItemStats) navItemStats.classList.add('active');

      if (typeof window.renderStatsOverview === 'function') {
        window.renderStatsOverview();
      }
    } else {
      // Default: 'home'
      viewHome.classList.remove('hidden');
      viewHome.classList.remove('view-slide-in-right');
      viewHome.classList.add('view-slide-in-left');

      btnBackHome.classList.add('hidden');
      headerBrandGroup.classList.remove('hidden');

      // Update sidebar nav active classes
      if (navItemHome) navItemHome.classList.add('active');
      if (navItemDecks) navItemDecks.classList.remove('active');
      if (navItemStats) navItemStats.classList.remove('active');

      updateDashboardStats();
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  window.switchView = switchView;

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

    // Global Stats & SRS totals
    let totalRev = 0;
    let totalCor = 0;
    Object.values(studyLog).forEach(entry => {
      totalRev += entry.count || 0;
      totalCor += entry.correct || 0;
    });

    let srsLearned = 0;
    let srsDue = 0;
    const now = Date.now();
    Object.values(srsData).forEach(s => {
      if (s && s.state && s.state !== 'new') {
        srsLearned++;
        if (s.dueDate && s.dueDate <= now) srsDue++;
      }
    });

    statTotalReviewed.textContent = srsLearned;
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

    const trennbarWords = allWords.filter(w => w.type && w.type.toLowerCase().includes('trennbar'));
    const seinWords = allWords.filter(w => w.hilfsverb === 'sein');
    const strongWords = allWords.filter(w => w.praeteritum && !w.praeteritum.endsWith('te'));

    const totalTrennbar = trennbarWords.length || 11;
    const totalSein = seinWords.length || 14;
    const totalStrong = strongWords.length || 36;

    let learnedTrennbar = 0, learnedSein = 0, learnedStrong = 0;
    trennbarWords.forEach(w => { const s = srsData[getCardKey(w)]; if (s && s.state && s.state !== 'new') learnedTrennbar++; });
    seinWords.forEach(w => { const s = srsData[getCardKey(w)]; if (s && s.state && s.state !== 'new') learnedSein++; });
    strongWords.forEach(w => { const s = srsData[getCardKey(w)]; if (s && s.state && s.state !== 'new') learnedStrong++; });

    if (countTrennbar) countTrennbar.textContent = `${learnedTrennbar} / ${totalTrennbar}`;
    if (barTrennbar) barTrennbar.style.width = `${Math.round((learnedTrennbar / totalTrennbar) * 100)}%`;

    if (countSein) countSein.textContent = `${learnedSein} / ${totalSein}`;
    if (barSein) barSein.style.width = `${Math.round((learnedSein / totalSein) * 100)}%`;

    if (countUnregelmaessig) countUnregelmaessig.textContent = `${learnedStrong} / ${totalStrong}`;
    if (barStrong) barStrong.style.width = `${Math.round((learnedStrong / totalStrong) * 100)}%`;
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
      ALL_DECKS_MAP['a2-deck-all'] || ALL_DECKS_MAP['universal-all'] || DECKS_CONFIG[0],
      ALL_DECKS_MAP['a2-deck-01'] || ALL_DECKS_MAP['deck-nomen'] || DECKS_CONFIG[1],
      ALL_DECKS_MAP['a2-deck-02'] || ALL_DECKS_MAP['deck-verben'] || DECKS_CONFIG[2],
      ALL_DECKS_MAP['universal-all'] || ALL_DECKS_MAP['deck-konnektoren'] || DECKS_CONFIG[3]
    ].filter(Boolean);

    featuredDecks.forEach(cfg => {
      const stats = getDeckSrsStats(cfg.filter);
      const deckCount = stats.total;
      const masteryPct = stats.pct;

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
            ${stats.due > 0 ? `<span class="chip-due" style="background:#fee2e2; color:#dc2626; font-size:11px; font-weight:700; padding:2px 8px; border-radius:12px;">⚡ ${stats.due} fällig</span>` : ''}
          </div>
          <h3 class="deck-title">${cfg.title}</h3>
          <p class="deck-desc">${cfg.desc}</p>
        </div>
        <div class="deck-card-bottom">
          <span class="deck-mastery-text">${masteryPct}% gelernt (${stats.learned}/${deckCount})</span>
          <span class="deck-learn-btn">${stats.due > 0 ? `Wiederholen (${stats.due})` : 'Lernen'}</span>
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
        const stats = getDeckSrsStats(deck.filter);
        const deckCount = stats.total;
        const masteryPct = stats.pct;

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
              ${stats.due > 0 ? `<span class="chip-due" style="background:#fee2e2; color:#dc2626; font-size:11px; font-weight:700; padding:2px 8px; border-radius:12px;">⚡ ${stats.due} fällig</span>` : ''}
            </div>
            <h3 class="deck-title">${deck.title}</h3>
            <p class="deck-desc">${deck.desc}</p>
          </div>
          <div class="deck-card-bottom">
            <span class="deck-mastery-text">${masteryPct}% gelernt (${stats.learned}/${deckCount})</span>
            <span class="deck-learn-btn">${stats.due > 0 ? `Wiederholen (${stats.due})` : 'Lernen →'}</span>
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
    const filtered = allWords.filter(config.filter);
    const sourceCards = (filtered && filtered.length > 0) ? filtered : allWords;

    // Queue smartly using Spaced Repetition (Due cards first, then learning, then new)
    const prep = prepareDeckQueue(sourceCards);
    currentDeck = prep.queue;

    let subTitle = config.title;
    if (prep.dueCount > 0) {
      subTitle += ` · ⚡ ${prep.dueCount} fällig`;
    }
    deckIndicator.textContent = subTitle;

    currentIndex = 0;
    sessionReviewedCount = 0;
    sessionCorrectCount = 0;
    sessionAgainCount = 0;
    sessionHardCount = 0;
    sessionGoodCount = 0;
    sessionEasyCount = 0;

    renderCurrentCard();
  }

  function renderCurrentCard() {
    if (!currentDeck || currentDeck.length === 0) return;
    const rawItem = currentDeck[currentIndex];
    const item = normalizeWordItem(rawItem);

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

    // Front Side (German word & tags)
    if (frontTags) {
      let tagsHtml = `<span class="chip chip-secondary">${item.level || 'B1'}</span>`;
      tagsHtml += `<span class="chip chip-neutral">${TYPES[item.pos] || item.type || 'Wort'}${item.sep ? ' · trennbar' : ''}</span>`;
      if (item.reflexiv) tagsHtml += `<span class="tag reflex" style="margin-left:4px">reflexiv · ${item.reflexiv}</span>`;
      if (item.aux) tagsHtml += `<span class="tag hilfs" style="margin-left:4px">Hilfsverb: ${item.aux}</span>`;
      if (item.wechsel) tagsHtml += `<span class="tag hilfs" style="margin-left:4px">Wechselpräposition</span>`;
      if (item.examTag) tagsHtml += `<span class="tag hilfs" style="margin-left:4px">${item.examTag}</span>`;

      // Spaced Repetition status badge on front
      const srs = getCardSrs(item);
      if (srs.state === 'new') {
        tagsHtml += `<span class="chip" style="margin-left:4px; background:rgba(59,130,246,0.12); color:#2563eb; font-weight:600;">Neu</span>`;
      } else if (srs.dueDate && srs.dueDate <= Date.now()) {
        tagsHtml += `<span class="chip" style="margin-left:4px; background:rgba(239,68,68,0.14); color:#dc2626; font-weight:700;">⚡ Fällig</span>`;
      } else if (srs.state === 'learning') {
        tagsHtml += `<span class="chip" style="margin-left:4px; background:rgba(245,158,11,0.14); color:#d97706; font-weight:600;">Lernen</span>`;
      } else if (srs.state === 'mastered') {
        tagsHtml += `<span class="chip" style="margin-left:4px; background:rgba(16,185,129,0.16); color:#059669; font-weight:700;">★ Gemeistert (${srs.interval}d)</span>`;
      } else {
        tagsHtml += `<span class="chip" style="margin-left:4px; background:rgba(16,185,129,0.12); color:#059669; font-weight:600;">Gelernt (${srs.interval}d)</span>`;
      }

      frontTags.innerHTML = tagsHtml;
    }
    if (frontWord) {
      frontWord.innerHTML = lemmaH(item);
    }
    if (frontLevel) frontLevel.textContent = item.level || 'B1';
    if (frontType) frontType.textContent = TYPES[item.pos] || item.type || 'Wort';

    // Back Side (Universal Archetype Bento Renderer)
    if (cardBackScroll) {
      cardBackScroll.innerHTML = renderUniversalCardBack(item, false);
      initSegmentedSliders(cardBackScroll);
    }

    // Update Counter & Progress
    if (cardCounter) {
      cardCounter.textContent = `Karte ${currentIndex + 1} von ${currentDeck.length}`;
    }
    if (progressBar) {
      const pct = Math.round(((currentIndex + 1) / currentDeck.length) * 100);
      progressBar.style.width = `${pct}%`;
      progressBar.parentElement.setAttribute('aria-valuenow', pct);
    }

    // Dynamic Interval labels on dock grade buttons
    updateGradeDockButtons(item);
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
    const now = Date.now();
    // Prioritize due cards, learning cards, or cards with lower ease factor / lapses
    const dueOrWeak = allWords.filter(w => {
      const s = getCardSrs(w);
      return s && s.state !== 'new' && (s.dueDate <= now || s.easeFactor < 2.3 || s.lapses > 0);
    });
    let pool = dueOrWeak.length >= 10 ? dueOrWeak : allWords;
    const shuffled = [...pool].sort(() => 0.5 - Math.random()).slice(0, 10);
    currentDeckId = 'quick-drill';
    currentDeck = shuffled;
    deckIndicator.textContent = '⚡ Schnelltraining (10 Wörter)';
    currentIndex = 0;
    sessionReviewedCount = 0;
    sessionCorrectCount = 0;
    sessionAgainCount = 0;
    sessionHardCount = 0;
    sessionGoodCount = 0;
    sessionEasyCount = 0;
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
    if (!currentDeck || !currentDeck[currentIndex]) return;
    const currentCard = currentDeck[currentIndex];

    // 1. Spaced Repetition Algorithm & Storage update
    processCardGrade(currentCard, grade);

    // Track session rating distribution
    if (grade === 'again') sessionAgainCount++;
    else if (grade === 'hard') sessionHardCount++;
    else if (grade === 'good') sessionGoodCount++;
    else if (grade === 'easy') sessionEasyCount++;

    // 2. Track daily participation & session counts
    const isCorrect = grade === 'good' || grade === 'easy';
    recordStudyParticipation(isCorrect);

    // 3. Spaced Repetition In-Session Re-queueing on "Again":
    // Failed card is placed back in queue (in 3 cards, or at the end if fewer remain)
    if (grade === 'again') {
      const remaining = currentDeck.length - 1 - currentIndex;
      let offset = 3;
      if (remaining <= 1) {
        offset = 1;
      } else if (remaining === 2) {
        offset = 2;
      }
      const insertIdx = currentIndex + offset + 1;
      currentDeck.splice(insertIdx, 0, currentCard);
    }

    // Expose current word for vocab detail view
    window.currentWordData = currentCard;

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

    let breakdownEl = document.getElementById('summary-grade-breakdown');
    if (!breakdownEl) {
      breakdownEl = document.createElement('div');
      breakdownEl.id = 'summary-grade-breakdown';
      breakdownEl.style.cssText = 'display:flex; justify-content:center; gap:8px; margin-top:14px; flex-wrap:wrap;';
      const statsRow = modalSessionComplete.querySelector('.modal-stats-row');
      if (statsRow && statsRow.parentNode) {
        statsRow.parentNode.insertBefore(breakdownEl, statsRow.nextSibling);
      }
    }
    if (breakdownEl) {
      breakdownEl.innerHTML = `
        <span style="font-size:11px; padding:3px 8px; border-radius:12px; background:#fee2e2; color:#dc2626; font-weight:700;">Nochmal: ${sessionAgainCount}</span>
        <span style="font-size:11px; padding:3px 8px; border-radius:12px; background:#fef3c7; color:#d97706; font-weight:700;">Schwer: ${sessionHardCount}</span>
        <span style="font-size:11px; padding:3px 8px; border-radius:12px; background:#e0e7ff; color:#4338ca; font-weight:700;">Gut: ${sessionGoodCount}</span>
        <span style="font-size:11px; padding:3px 8px; border-radius:12px; background:#d1fae5; color:#059669; font-weight:700;">Leicht: ${sessionEasyCount}</span>
      `;
    }

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
  if (navItemHome) {
    navItemHome.addEventListener('click', () => {
      closeSidebar();
      switchView('home');
    });
  }

  if (navItemDecks) {
    navItemDecks.addEventListener('click', () => {
      closeSidebar();
      switchView('decks');
    });
  }

  if (navItemStats) {
    navItemStats.addEventListener('click', () => {
      closeSidebar();
      if (typeof window.openStatsView === 'function') {
        window.openStatsView();
      } else {
        switchView('stats');
      }
    });
  }

  // Back to Home Button in Header
  if (btnBackHome) {
    btnBackHome.addEventListener('click', () => {
      if (currentActiveView === 'study') {
        if (previousView === 'decks') {
          switchView('decks');
        } else {
          switchView('home');
        }
      } else if (currentActiveView === 'decks' || currentActiveView === 'stats') {
        switchView('home');
      } else {
        switchView('home');
      }
    });
  }

  // Library View Back Button
  if (btnLibraryBackHome) {
    btnLibraryBackHome.addEventListener('click', () => {
      switchView('home');
    });
  }

  // Calendar Month Nav
  if (btnCalPrev) {
    btnCalPrev.addEventListener('click', () => {
      displayedCalDate.setMonth(displayedCalDate.getMonth() - 1);
      renderMonthCalendar(displayedCalDate);
    });
  }

  if (btnCalNext) {
    btnCalNext.addEventListener('click', () => {
      displayedCalDate.setMonth(displayedCalDate.getMonth() + 1);
      renderMonthCalendar(displayedCalDate);
    });
  }

  // Summary Modal Buttons
  if (btnSummaryRestart) {
    btnSummaryRestart.addEventListener('click', () => {
      if (modalSessionComplete) modalSessionComplete.classList.add('hidden');
      startDeckStudy(currentDeckId);
    });
  }

  if (btnSummaryHome) {
    btnSummaryHome.addEventListener('click', () => {
      if (modalSessionComplete) modalSessionComplete.classList.add('hidden');
      switchView('decks');
    });
  }

  // Card Flip on Click (excluding buttons or if swiped)
  if (flashcard) {
    flashcard.addEventListener('click', (e) => {
      if (wasSwiped) {
        wasSwiped = false;
        return;
      }
      if (e.target.closest('button')) return;
      toggleFlip();
    });
  }

  // Audio Buttons
  if (btnAudioFront) {
    btnAudioFront.addEventListener('click', (e) => {
      e.stopPropagation();
      const item = currentDeck[currentIndex];
      if (item) speakText(item.word, null, btnAudioFront);
    });
  }

  const btnAudioCenter = document.getElementById('btn-audio-center');
  if (btnAudioCenter) {
    btnAudioCenter.addEventListener('click', (e) => {
      e.stopPropagation();
      const item = currentDeck[currentIndex];
      if (item) speakText(item.word, null, btnAudioCenter);
    });
  }

  if (btnAudioBack) {
    btnAudioBack.addEventListener('click', (e) => {
      e.stopPropagation();
      const item = currentDeck[currentIndex];
      if (item) speakText(item.word, null, btnAudioBack);
    });
  }

  const btnAudioBackInline = document.getElementById('btn-audio-back-inline');
  if (btnAudioBackInline) {
    btnAudioBackInline.addEventListener('click', (e) => {
      e.stopPropagation();
      const item = currentDeck[currentIndex];
      if (item) speakText(item.word, null, btnAudioBackInline);
    });
  }

  if (btnAudioSentence) {
    btnAudioSentence.addEventListener('click', (e) => {
      e.stopPropagation();
      const textToSpeak = exampleDe ? exampleDe.textContent : '';
      if (textToSpeak) speakText(textToSpeak, null, btnAudioSentence);
    });
  }

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
  if (btnGrade1) btnGrade1.addEventListener('click', () => recordGrade('again'));
  if (btnGrade2) btnGrade2.addEventListener('click', () => recordGrade('hard'));
  if (btnGrade3) btnGrade3.addEventListener('click', () => recordGrade('good'));
  if (btnGrade4) btnGrade4.addEventListener('click', () => recordGrade('easy'));

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

  // Delegated Clicks for Universal Bento Cards & Anatomy View
  document.addEventListener('click', (ev) => {
    // 1. Segmented Slider toggle button
    const btn = ev.target.closest('.seg button');
    if (btn) {
      const segEl = btn.closest('.seg');
      if (!segEl) return;
      const k = segEl.dataset.k;
      const val = btn.dataset.v;
      ST[k] = val;
      segEl.querySelectorAll('button').forEach(b => b.classList.toggle('on', b === btn));
      placeIndicator(segEl);
      const paneTarget = document.getElementById('p-' + k);
      if (paneTarget && PANE[k]) {
        paneTarget.innerHTML = PANE[k](isNaN(val) ? val : +val);
        paneTarget.querySelectorAll('.seg').forEach(placeIndicator);
      }
      return;
    }

    // 2. Open Dictionary Anatomy Trigger
    const dictTrigger = ev.target.closest('.btn-dict-trigger, [data-action="open-dict"]');
    if (dictTrigger) {
      ev.preventDefault();
      if (typeof window.openVocabDetail === 'function' && window.currentWordData) {
        window.openVocabDetail(window.currentWordData, 'study');
      }
      return;
    }

    // 3. Audio speaker button in cards
    const speakBtn = ev.target.closest('.btn-speak-current');
    if (speakBtn) {
      ev.preventDefault();
      ev.stopPropagation();
      speakCurrentWord(speakBtn);
      return;
    }
  });

  // Keyboard Shortcuts (Space, 1-4, A, D, T, Arrow Keys, Escape)
  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    if (e.key === 'Escape') {
      const detailView = document.getElementById('view-vocab-detail');
      if (detailView && !detailView.classList.contains('hidden')) {
        const btnBack = document.getElementById('btn-vocab-detail-back');
        if (btnBack) {
          btnBack.click();
          return;
        }
      }
      closeSidebar();
      closeAppearanceModal();
      modalSessionComplete.classList.add('hidden');
      return;
    }

    // D or Enter: Open Dictionary Anatomy
    if (e.key === 'd' || e.key === 'D') {
      const studyView = document.getElementById('view-study');
      if (studyView && !studyView.classList.contains('hidden') && window.currentWordData && typeof window.openVocabDetail === 'function') {
        e.preventDefault();
        window.openVocabDetail(window.currentWordData, 'study');
        return;
      }
    }

    // T: Cycle Segmented Slider Tabs on active card/view
    if (e.key === 't' || e.key === 'T') {
      const segEl = document.querySelector('.card-back-scroll .seg, #vocab-detail-content .seg');
      if (segEl) {
        e.preventDefault();
        const btns = [...segEl.querySelectorAll('button')];
        if (btns.length > 0) {
          const curIdx = btns.findIndex(b => b.classList.contains('on'));
          const nextBtn = btns[(curIdx + 1) % btns.length];
          if (nextBtn) nextBtn.click();
        }
        return;
      }
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
      speakCurrentWord();
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

  if (flashcard) {
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
  }

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
      const res = await fetch('data/vocabulary.json?v=20261113-a2-v1');
      if (!res.ok) throw new Error('Network error');
      const rawData = await res.json();
      allWords = rawData.map(normalizeWordItem);
    } catch (err) {
      console.warn('Loading fallback deck:', err);
      allWords = getFallbackDeck().map(normalizeWordItem);
    }
    window.allWords = allWords;
    window.srsData = srsData;
    window.getCardKey = getCardKey;
    window.getCardSrs = getCardSrs;
    window.processCardGrade = processCardGrade;
    window.previewNextIntervals = previewNextIntervals;
    window.recordGrade = recordGrade;
    window.startDeckStudy = startDeckStudy;
    window.getAllFolders = getAllFolders;
    window.getDeckSrsStats = getDeckSrsStats;

    updateDashboardStats();
    renderSidebarDeckShortcuts();
    if (typeof renderDecksLibraryView === 'function') {
      renderDecksLibraryView();
    }
    document.dispatchEvent(new CustomEvent('wortschatz:dashboardUpdated'));
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
    let studyLog = {}, deckProgress = {}, srsData = {};
    try {
      const sl = localStorage.getItem('wortschatz_study_log_v2');
      if (sl) studyLog = JSON.parse(sl);
      const dp = localStorage.getItem('wortschatz_deck_progress_v2');
      if (dp) deckProgress = JSON.parse(dp);
      const srs = localStorage.getItem('wortschatz_srs_v2');
      if (srs) srsData = JSON.parse(srs);
    } catch(e) {}
    return { studyLog, deckProgress, srsData };
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
    const { studyLog, deckProgress, srsData } = getStoredData();
    const todayKey = getTodayKeyLocal();
    const todayEntry = studyLog[todayKey] || { count: 0, correct: 0 };
    let totalRev = 0, totalCor = 0;
    Object.values(studyLog).forEach(e => { totalRev += e.count||0; totalCor += e.correct||0; });
    const streak = calcStreakLocal(studyLog);

    const totalWords = (window.allWords && window.allWords.length) ? window.allWords.length : 793;
    let learnedCount = 0;
    let dueCount = 0;
    const now = Date.now();
    Object.values(srsData).forEach(s => {
      if (s && s.state && s.state !== 'new') {
        learnedCount++;
        if (s.dueDate && s.dueDate <= now) dueCount++;
      }
    });

    const pct = Math.round((learnedCount / totalWords) * 100);
    const retention = totalRev > 0 ? Math.round((totalCor / totalRev) * 100) : 100;

    if (ribbonProgressPct) ribbonProgressPct.textContent = pct + '%';
    if (ribbonProgressSub) ribbonProgressSub.textContent = `${learnedCount} von ${totalWords} gelernt` + (dueCount > 0 ? ` · ⚡ ${dueCount} fällig` : '');
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
    const { deckProgress, srsData } = getStoredData();
    const folders = (typeof window.getAllFolders === 'function') ? window.getAllFolders() : [];
    let allDecks = [];
    folders.forEach(f => {
      f.decks.forEach(d => {
        allDecks.push({ ...d, folderTitle: f.title });
      });
    });

    if (allDecks.length === 0) {
      allDecks = [
        { id: 'a2-deck-all', title: 'Alle A2 Netzwerk-Themen', count: 751 },
        { id: 'universal-all', title: 'Universal B1 (Alle 6 Wortarten)', count: 42 }
      ];
    }

    const now = Date.now();
    let bestDeck = allDecks[0];
    let maxPriority = -1;

    allDecks.forEach(d => {
      const filtered = window.allWords ? window.allWords.filter(d.filter || (() => true)) : [];
      const total = filtered.length || d.count || 1;
      let learned = 0, due = 0;
      filtered.forEach(w => {
        const key = (w.id ? `${w.id}::${w.word || w.lemma}` : (w.word || w.lemma || '')).trim();
        const s = srsData[key];
        if (s && s.state && s.state !== 'new') {
          learned++;
          if (s.dueDate && s.dueDate <= now) due++;
        }
      });

      // Priority: Decks with due reviews come first!
      let priority = 0;
      if (due > 0) priority = 1000 + due;
      else if (learned > 0 && learned < total) priority = 500 + learned;
      else if (learned === 0) priority = 10;

      if (priority > maxPriority) {
        maxPriority = priority;
        bestDeck = { ...d, total, learned, due };
      }
    });

    if (continueDeckTitle) continueDeckTitle.textContent = bestDeck.title;
    if (continueDeckSub) {
      if (bestDeck.due > 0) {
        continueDeckSub.textContent = `⚡ ${bestDeck.due} Karten fällig zur Wiederholung · Tippe zum Starten`;
      } else if (bestDeck.learned > 0) {
        const pct = Math.round((bestDeck.learned / bestDeck.total) * 100);
        continueDeckSub.textContent = `${pct}% abgeschlossen (${bestDeck.learned}/${bestDeck.total}) · Tippe zum Starten`;
      } else {
        continueDeckSub.textContent = `${bestDeck.total} Wörter bereit · Tippe zum Starten`;
      }
    }
    if (continueCard) {
      continueCard.setAttribute('data-deck-id', bestDeck.id);
      if (continueCard.dataset) continueCard.dataset.deckId = bestDeck.id;
    }
  }

  const btnContinueDeck = document.getElementById('btn-continue-deck');
  if (btnContinueDeck) {
    btnContinueDeck.addEventListener('click', (e) => {
      e.stopPropagation();
      const deckId = (continueCard && (continueCard.getAttribute('data-deck-id') || (continueCard.dataset && continueCard.dataset.deckId))) || 'universal-all';
      document.dispatchEvent(new CustomEvent('wortschatz:startDeck', { detail: { deckId } }));
    });
  }

  if (continueCard) {
    continueCard.addEventListener('click', () => {
      const deckId = (continueCard.getAttribute('data-deck-id') || (continueCard.dataset && continueCard.dataset.deckId)) || 'universal-all';
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
    const item = typeof normalizeWordItem === 'function' ? normalizeWordItem(wordData) : (window.normalizeWordItem ? window.normalizeWordItem(wordData) : wordData);
    detailCurrentWord  = item;
    detailCurrentTense = 'praesens';
    previousViewId     = fromViewId || 'study';

    const detailContainer = document.getElementById('vocab-detail-content');
    if (detailContainer) {
      const renderFn = typeof renderUniversalCardBack === 'function' ? renderUniversalCardBack : window.renderUniversalCardBack;
      if (renderFn) {
        detailContainer.innerHTML = renderFn(item, true);
        const initFn = typeof initSegmentedSliders === 'function' ? initSegmentedSliders : window.initSegmentedSliders;
        if (initFn) initFn(detailContainer);
      }
    }

    if (detailWord)    detailWord.textContent    = item.lemma    || item.word || '';
    if (detailIpa)     detailIpa.textContent     = item.ipa      || '';
    if (detailMeaning) detailMeaning.textContent = item.gloss    || item.meaning || '';

    document.querySelectorAll('.view-container').forEach(v => v.classList.add('hidden'));
    viewVocabDetail.classList.remove('hidden');
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
    if (headerBrand) headerBrand.classList.add('hidden');

    const navH = document.getElementById('nav-item-home');
    const navD = document.getElementById('nav-item-decks');
    const navS = document.getElementById('nav-item-stats');
    if (navH) navH.classList.remove('active');
    if (navD) navD.classList.remove('active');
    if (navS) navS.classList.add('active');
  }

  window.openStatsView = openStatsView;
  window.renderStatsOverview = renderStatsOverview;

  function renderStatsOverview() {
    const { studyLog, deckProgress, srsData } = getStoredData();
    let totalRev = 0, totalCor = 0;
    Object.values(studyLog).forEach(e => { totalRev += e.count||0; totalCor += e.correct||0; });
    const streak = calcStreakLocal(studyLog);

    let learnedCount = 0, learningCount = 0, masteredCount = 0, dueCount = 0;
    const now = Date.now();
    Object.values(srsData).forEach(s => {
      if (s && s.state && s.state !== 'new') {
        learnedCount++;
        if (s.state === 'learning') learningCount++;
        if (s.state === 'mastered') masteredCount++;
        if (s.dueDate && s.dueDate <= now) dueCount++;
      }
    });

    if (statsTotalLearned) statsTotalLearned.textContent = learnedCount;
    if (statsStreakBig)    statsStreakBig.textContent    = streak;
    if (statsLernzeit) {
      const mins = Math.round(totalRev * 0.75);
      const h = Math.floor(mins / 60), m = mins % 60;
      statsLernzeit.textContent = h > 0 ? h + 'h ' + m + 'm' : m + 'm';
    }

    drawActivityChart(studyLog);

    if (grammarDistBars) {
      const dists = [
        { label: 'Gemeistert (★)',  color: '#10B981', count: masteredCount },
        { label: 'Gelernt (Review)',color: '#6366F1', count: Math.max(0, learnedCount - masteredCount - learningCount) },
        { label: 'Im Lernprozess',  color: '#F59E0B', count: learningCount },
        { label: '⚡ Heute fällig',  color: '#FF5A5F', count: dueCount },
      ];
      const maxC = Math.max(1, ...dists.map(d => d.count));
      grammarDistBars.innerHTML = dists.map(d => {
        const pct = Math.round((d.count / maxC) * 100);
        return `
        <div class="grammar-dist-row">
          <span class="grammar-dist-label">${d.label}</span>
          <div class="grammar-dist-bar-track">
            <div class="grammar-dist-bar-fill" style="width:${pct}%;background:${d.color};"></div>
          </div>
          <span class="grammar-dist-pct" style="font-weight:700;">${d.count}</span>
        </div>`;
      }).join('');
    }

    if (statsDecksList && typeof window.getAllFolders === 'function' && window.allWords) {
      const folders = window.getAllFolders();
      let allDecksList = [];
      folders.forEach(f => {
        f.decks.forEach(d => {
          allDecksList.push({ ...d, folderTitle: f.title });
        });
      });
      statsDecksList.innerHTML = allDecksList.map(d => {
        const filtered = window.allWords.filter(d.filter || (() => true));
        const total = filtered.length;
        let learned = 0, due = 0;
        filtered.forEach(w => {
          const key = (w.id ? `${w.id}::${w.word || w.lemma}` : (w.word || w.lemma || '')).trim();
          const s = srsData[key];
          if (s && s.state && s.state !== 'new') {
            learned++;
            if (s.dueDate && s.dueDate <= now) due++;
          }
        });
        const pct = total > 0 ? Math.round((learned / total) * 100) : 0;
        return `<div class="vocab-detail-section" style="margin-bottom:12px; padding:12px 16px; background:var(--bg-surface); border:1px solid var(--border-card); border-radius:var(--radius-md);">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
            <div>
              <span style="font-weight:700; font-size:14px; color:var(--text-primary);">${d.title}</span>
              <span style="font-size:11px; color:var(--text-muted); margin-left:6px;">(${d.folderTitle})</span>
            </div>
            <div style="font-size:12px; color:var(--text-secondary); font-weight:600;">
              ${due > 0 ? `<span style="color:#DC2626; margin-right:8px;">⚡ ${due} fällig</span>` : ''}
              ${learned} / ${total}
            </div>
          </div>
          <div style="height:6px; background:var(--bg-surface-subtle); border-radius:999px; overflow:hidden;">
            <div style="height:100%; width:${pct}%; background:var(--accent-terracotta); border-radius:999px; transition:width 0.6s cubic-bezier(0.23,1,0.32,1);"></div>
          </div>
          <div style="display:flex; justify-content:space-between; margin-top:4px; font-size:11px; color:var(--text-muted);">
            <span>${pct}% gelernt</span>
            <span>${total - learned} neu</span>
          </div>
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
