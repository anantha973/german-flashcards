# -*- coding: utf-8 -*-
"""
Script to update app.js with the Netzwerk A2 folder, 10 decks, and renderer enhancements.
"""
import re

app_js_path = '/Users/ananth/study/German/german-flashcards/app.js'

with open(app_js_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update R.noun
old_noun = """    noun(e) {
      const g = gc(e.art || "die");
      const A = { m: ["der", "den", "dem", "des"], f: ["die", "die", "der", "der"], n: ["das", "das", "dem", "des"] }[g] || ["die", "die", "der", "der"];
      const P = ["die", "die", "den", "der"];
      const s = e.lemma;
      const plStr = e.pl || (s + "en");
      const dp = plStr.endsWith("n") ? plStr : plStr + "n";
      const gs = e.genS || (g === "f" ? s : s + "s");
      const pl = [plStr, plStr, dp, plStr];
      const sg = [s, s, s, gs];
      const sufDisplay = e.suf || (s.endsWith("ung") ? "-ung" : (s.endsWith("heit") ? "-heit" : (s.endsWith("keit") ? "-keit" : "")));
      const ruleDisplay = e.rule || (e.art === "die" ? "Nomen auf -ung, -heit, -keit, -schaft, -tion → immer feminin." : (e.art === "der" ? "Maskuline Nomen mit der-Artikel." : "Neutrale Nomen mit das-Artikel."));

      return [
        S("", "<div class='pair'>" +
          `<section class="sec"><h3>Plural</h3><div class="big">die ${s}<span class="pre">${plStr.slice(s.length)}</span></div></section>` +
          `<section class="sec"><h3>Genus-Regel</h3><div class="big"><span class="pre">${sufDisplay}</span> → <span class="${g}">${e.art || "die"}</span></div><p class="en">${ruleDisplay}</p></section>` +
        "</div>"),"""

new_noun = """    noun(e) {
      const g = gc(e.art || "die");
      const A = { m: ["der", "den", "dem", "des"], f: ["die", "die", "der", "der"], n: ["das", "das", "dem", "des"] }[g] || ["die", "die", "der", "der"];
      const P = ["die", "die", "den", "der"];
      const s = e.lemma;
      const plStr = (e.pl || (s + "en")).replace(/^die\\s+/i, '').trim();
      const dp = plStr.endsWith("n") || plStr.endsWith("s") ? plStr : plStr + "n";
      const gs = (e.genS || (g === "f" ? s : s + "s")).replace(/^(des|der)\\s+/i, '').trim();
      const pl = [plStr, plStr, dp, plStr];
      const sg = [s, s, s, gs];
      const sufDisplay = e.suf || (s.endsWith("ung") ? "-ung" : (s.endsWith("heit") ? "-heit" : (s.endsWith("keit") ? "-keit" : "")));
      const ruleDisplay = e.rule || (e.art === "die" ? "Nomen auf -ung, -heit, -keit, -schaft, -tion → immer feminin." : (e.art === "der" ? "Maskuline Nomen mit der-Artikel." : "Neutrale Nomen mit das-Artikel."));

      return [
        S("", "<div class='pair'>" +
          `<section class="sec"><h3>Plural</h3><div class="big">die <span class="pre">${plStr}</span></div></section>` +
          `<section class="sec"><h3>Genus-Regel</h3><div class="big"><span class="pre">${sufDisplay}</span> → <span class="${g}">${e.art || "die"}</span></div><p class="en">${ruleDisplay}</p></section>` +
        "</div>"),"""

assert old_noun in content, "old_noun target string not found!"
content = content.replace(old_noun, new_noun)

# 2. Update R.adj
old_adj = """    adj(e) {
      return [
        S("Steigerung", `<div class="ladder">${[["Positiv", e.lemma, 33], ["Komparativ", e.comp || (e.lemma + "er"), 66], ["Superlativ", e.sup || ("am " + e.lemma + "sten"), 100]].map(([a, b, w]) => `<div><small>${a}</small><b>${b}</b><i class="bar2" style="width:${w}%"></i></div>`).join("")}</div>`),
        S("", "<div class='pair'>" +
          (e.ant ? `<section class="sec"><h3>Gegenteil</h3><div class="big">↔ ${e.ant}</div></section>` : "") +
          (e.syn && e.syn.length ? `<section class="sec"><h3>Synonym</h3><div class="chips">${e.syn.map(x => `<span class="chip">${x}</span>`).join("")}</div></section>` : "") +
        "</div>"),"""

new_adj = """    adj(e) {
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
        "</div>"),"""

assert old_adj in content, "old_adj target string not found!"
content = content.replace(old_adj, new_adj)

# 3. Update R.phrase
old_phrase = """    phrase(e) {
      return [
        S("Muster", (e.frame ? flow(e.frame) : "") + `<p class="en">${e.type || "Redewendung"} · ${e.cap || ""}</p>` + (e.examTag ? `<span class="tag hilfs" style="margin-top:6px;display:inline-block">${e.examTag}</span>` : "")),
        ...(e.reg ? [S("Register", seg("reg", e.reg.map((r, i) => [i, r[0]]), i => `<div class="ex"><p class="de">${hl(e.reg[i][1])}</p><p class="en">${e.reg[i][2]}</p></div>`))] : []),
        ...(e.tenses ? [S("Zeitformen", `<div class="chart" style="grid-template-columns:repeat(3,1fr)">${e.tenses.map(t => `<div><small>${t[0]}</small><b style="font-size:13px;font-weight:500">${t[1]}</b></div>`).join("")}</div>`)] : []),
        ...(e.dlg ? [S("Mini-Dialog", `<div class="dlg">${e.dlg.map(d => `<p class="bub ${d[0] === "B" ? "r" : ""}">${d[1]}</p>`).join("")}</div>`)] : [])
      ];
    }"""

new_phrase = """    phrase(e) {
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
    }"""

assert old_phrase in content, "old_phrase target string not found!"
content = content.replace(old_phrase, new_phrase)

# 4. Update FOLDERS_CONFIG to prepend the Netzwerk A2 Folder
old_folders = """  // Hierarchical Folder & Deck Architecture
  const FOLDERS_CONFIG = [
    {
      id: 'folder-universal-b1',"""

netzwerk_a2_folder = """  // Hierarchical Folder & Deck Architecture
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
      id: 'folder-universal-b1',"""

assert old_folders in content, "old_folders target string not found!"
content = content.replace(old_folders, netzwerk_a2_folder)

# 5. Update featuredDecks on homepage
old_featured = """    // Homepage featured decks (4 primary decks)
    const featuredDecks = [
      ALL_DECKS_MAP['universal-all'] || DECKS_CONFIG[0],
      ALL_DECKS_MAP['deck-nomen'] || DECKS_CONFIG[1],
      ALL_DECKS_MAP['deck-verben'] || DECKS_CONFIG[2],
      ALL_DECKS_MAP['deck-konnektoren'] || DECKS_CONFIG[3]
    ].filter(Boolean);"""

new_featured = """    // Homepage featured decks (4 primary decks)
    const featuredDecks = [
      ALL_DECKS_MAP['a2-deck-all'] || ALL_DECKS_MAP['universal-all'] || DECKS_CONFIG[0],
      ALL_DECKS_MAP['a2-deck-01'] || ALL_DECKS_MAP['deck-nomen'] || DECKS_CONFIG[1],
      ALL_DECKS_MAP['a2-deck-02'] || ALL_DECKS_MAP['deck-verben'] || DECKS_CONFIG[2],
      ALL_DECKS_MAP['universal-all'] || ALL_DECKS_MAP['deck-konnektoren'] || DECKS_CONFIG[3]
    ].filter(Boolean);"""

assert old_featured in content, "old_featured target string not found!"
content = content.replace(old_featured, new_featured)

# 6. Update cache-busting version on fetch
content = re.sub(
    r"fetch\('data/vocabulary\.json\?v=[^']+'\)",
    "fetch('data/vocabulary.json?v=20261113-a2-v1')",
    content
)

with open(app_js_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("app.js successfully updated with Netzwerk A2 folder and renderer enhancements!")
