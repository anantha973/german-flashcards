import json

deck_path = '/Users/ananth/study/German/german-flashcards/data/a2_decks/deck_08_medien.json'
with open(deck_path, 'r', encoding='utf-8') as f:
    cards = json.load(f)

card_111 = {
  "id": "a2-d08-111",
  "pos": "verb",
  "word": "verbringen",
  "lemma": "verbringen",
  "level": "A2",
  "type": "Verb · untrennbar / unregelmäßig",
  "ipa": "[fɛɐ̯ˈbʁɪŋən]",
  "meaning": "to spend, pass (time, vacation, weekend)",
  "gloss": "to spend (time)",
  "sep": False,
  "pre": "ver",
  "aux": "haben",
  "hilfsverb": "haben",
  "p2": "verbracht",
  "partizip2": "verbracht",
  "perfekt": "hat verbracht",
  "praeteritum": "verbrachte",
  "praesens": "verbringt",
  "reflexiv": False,
  "praes": ["verbringe", "verbringst", "verbringt", "verbringen", "verbringt", "verbringen"],
  "prat": ["verbrachte", "verbrachtest", "verbrachte", "verbrachten", "verbrachtet", "verbrachten"],
  "imp": ["Verbring!", "Verbringt!", "Verbringen Sie!"],
  "exT": {
    "praes": [
      "Er verbringt jeden Tag drei Stunden vor dem Computerbildschirm.",
      "He spends three hours every day in front of the computer screen."
    ],
    "prat": [
      "Im Sommer verbrachten wir zwei Wochen an der Ostsee.",
      "In summer we spent two weeks at the Baltic Sea."
    ],
    "perf": [
      "Wie hast du dein letztes Wochenende verbracht?",
      "How did you spend your last weekend?"
    ]
  },
  "ex": [
    "Jugendliche verbringen viel Freizeit in sozialen Medien.",
    "Young people spend a lot of leisure time on social media."
  ],
  "val": [
    ["Zeit (Akk) verbringen (mit + Dat)", "Wie lange / Womit?", "Sie verbringt den Nachmittag mit Lesen."]
  ],
  "family": ["bringen", "das Verbringen", "ausgeben"],
  "tip": "Wichtige Unterscheidung: 'verbringen' nutzt man NUR für Zeit ('Zeit verbringen')! Für Geld verwendet man 'ausgeben' ('Geld ausgeben'). Stammformen: verbringen – verbrachte – verbracht (mit haben).",
  "deckId": "a2-deck-08",
  "deckTitle": "Medien, Kultur & Digitale Welt",
  "sourceLessons": [3],
  "sourceRawIds": ["RAW-119"]
}

card_112 = {
  "id": "a2-d08-112",
  "pos": "noun",
  "word": "Durchschnitt",
  "lemma": "Durchschnitt",
  "art": "der",
  "level": "A2",
  "type": "Nomen · Maskulinum",
  "ipa": "[ˈdʊʁçˌʃnɪt]",
  "meaning": "average, mean",
  "gloss": "average, mean",
  "pl": "die Durchschnitte",
  "genS": "des Durchschnitts",
  "rule": "Substantivierung zum Verbstamm von schneiden (der Schnitt): Maskulinum.",
  "nvv": [
    ["im Durchschnitt", "on average"],
    ["über / unter dem Durchschnitt liegen", "to be above / below average"]
  ],
  "compounds": ["das Durchschnittsalter", "das Durchschnittseinkommen", "der Notendurchschnitt", "der Durchschnittswert"],
  "family": ["durchschnittlich", "schneiden", "der Schnitt"],
  "ex": [
    "Im Durchschnitt schauen die Bundesbürger täglich über drei Stunden fern.",
    "On average, German citizens watch TV for over three hours every day."
  ],
  "tip": "Sehr häufige Redewendung im Alltag und in Statistiken: 'im Durchschnitt' (+ Angabe). Adverbiale Form: 'durchschnittlich' (z. B. durchschnittlich 8 Stunden Schlaf).",
  "deckId": "a2-deck-08",
  "deckTitle": "Medien, Kultur & Digitale Welt",
  "sourceLessons": [3],
  "sourceRawIds": ["RAW-147"]
}

cards.append(card_111)
cards.append(card_112)

with open(deck_path, 'w', encoding='utf-8') as f:
    json.dump(cards, f, indent=2, ensure_ascii=False)

print(f"Deck 08 updated! Total cards: {len(cards)}")
