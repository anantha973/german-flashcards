import json

with open("/Users/ananth/study/German/german-flashcards/data/a2_decks/deck_06_gefuehle.json") as f:
    cards = json.load(f)

# Ensure no duplicate raw IDs
existing_rids = set()
for c in cards:
    for r in c.get("sourceRawIds", []):
        existing_rids.add(r)

new_cards = [
    {
        "id": "a2-d06-041",
        "pos": "adj",
        "word": "akkurat",
        "lemma": "akkurat",
        "level": "A2",
        "type": "Adjektiv",
        "ipa": "[ˈakuˌʁaːt]",
        "meaning": "accurate, neat, meticulous, exact",
        "gloss": "accurate, neat",
        "comp": [["Positiv", "akkurat"], ["Komparativ", "akkurater"], ["Superlativ", "am akkuratesten"]],
        "opp": "chaotisch, unordentlich, schlampig",
        "family": ["die Akkuratesse", "die Genauigkeit"],
        "ex": ["Sie arbeitet immer sehr akkurat und achtet auf jedes Detail.", "She always works very accurately and pays attention to every detail."],
        "tip": "Wird oft für sorgfältige Arbeit oder gepflegtes Aussehen benutzt: 'Er ist sehr akkurat gekleidet.'",
        "deckId": "a2-deck-06",
        "deckTitle": "Gefühle, Charakter & Reaktionen",
        "sourceLessons": [4],
        "sourceRawIds": ["RAW-212"]
    },
    {
        "id": "a2-d06-042",
        "pos": "noun",
        "word": "Segelregatta",
        "lemma": "Segelregatta",
        "art": "die",
        "level": "A2",
        "type": "Nomen · Femininum",
        "ipa": "[ˈzeːɡl̩ʁeˌɡata]",
        "meaning": "sailing regatta, boat race",
        "gloss": "sailing regatta",
        "pl": "die Segelregatten",
        "genS": "der Segelregatta",
        "rule": "Zusammensetzung mit Regatta (die Regatta, aus dem Italienischen): feminin.",
        "nvv": [["an einer Regatta teilnehmen", "to participate in a regatta"]],
        "compounds": ["das Segelboot", "die Segelschule"],
        "family": ["segeln", "das Segel"],
        "ex": ["Bei der Kieler Woche findet jedes Jahr eine weltberühmte Segelregatta statt.", "A world-famous sailing regatta takes place every year at Kiel Week."],
        "tip": "Typisch für den Norden Deutschlands (Kiel, Warnemünde). Plural: die Regatten.",
        "deckId": "a2-deck-06",
        "deckTitle": "Gefühle, Charakter & Reaktionen",
        "sourceLessons": [4],
        "sourceRawIds": ["RAW-179"]
    },
    {
        "id": "a2-d06-043",
        "pos": "noun",
        "word": "Segelschiff",
        "lemma": "Segelschiff",
        "art": "das",
        "level": "A2",
        "type": "Nomen · Neutrum",
        "ipa": "[ˈzeːɡl̩ˌʃɪf]",
        "meaning": "sailing ship, sailboat",
        "gloss": "sailing ship",
        "pl": "die Segelschiffe",
        "genS": "des Segelschiffs / Segelschiffes",
        "rule": "Zusammensetzung mit Schiff (das Schiff): immer Neutrum.",
        "nvv": [["mit dem Segelschiff fahren", "to sail on a sailing ship"]],
        "compounds": ["das Kreuzfahrtschiff", "das Frachtschiff"],
        "family": ["der Schiffer", "die Schifffahrt"],
        "ex": ["Auf der Ostsee kreuzen im Sommer viele majestätische Segelschiffe.", "Many majestic sailing ships cruise on the Baltic Sea in summer."],
        "tip": "Das Schiff hat drei 'f' in Schifffahrt (nach neuer Rechtschreibung). Plural: die Segelschiffe.",
        "deckId": "a2-deck-06",
        "deckTitle": "Gefühle, Charakter & Reaktionen",
        "sourceLessons": [4],
        "sourceRawIds": ["RAW-181"]
    },
    {
        "id": "a2-d06-044",
        "pos": "verb",
        "word": "stellen",
        "lemma": "stellen",
        "level": "A2",
        "type": "Verb · regelmäßig",
        "ipa": "[ˈʃtɛlən]",
        "meaning": "to place (upright), to put, to set",
        "gloss": "to put, place upright",
        "sep": False,
        "pre": "",
        "aux": "haben",
        "hilfsverb": "haben",
        "p2": "gestellt",
        "partizip2": "gestellt",
        "perfekt": "hat gestellt",
        "praeteritum": "stellte",
        "praesens": "stellt",
        "reflexiv": False,
        "praes": ["stelle", "stellst", "stellt", "stellen", "stellt", "stellen"],
        "prat": ["stellte", "stelltest", "stellte", "stellten", "stelltet", "stellten"],
        "imp": ["Stell!", "Stellt!", "Stellen Sie!"],
        "exT": {
            "praes": ["Ich stelle die Blumen in eine schöne Vase.", "I put the flowers in a beautiful vase."],
            "prat": ["Er stellte den Wecker auf sieben Uhr morgens.", "He set the alarm for seven in the morning."],
            "perf": ["Wohin hast du den Mülleimer gestellt?", "Where did you put the trash can?"]
        },
        "ex": ["Stell bitte die Gläser in den Schrank!", "Please put the glasses into the cupboard!"],
        "val": [["auf / in / neben + Akk stellen", "Wohin? (Akkusativ)", "Er stellt das Buch ins Regal."]],
        "family": ["stehen", "die Stellung", "abstellen", "einstellen"],
        "tip": "Wechselpräpositionen-Paar: 'stellen' verlangt AKKUSATIV (Aktion/Richtung: Wohin?), 'stehen' verlangt DATIV (Position: Wo?).",
        "deckId": "a2-deck-06",
        "deckTitle": "Gefühle, Charakter & Reaktionen",
        "sourceLessons": [4],
        "sourceRawIds": ["RAW-182"]
    },
    {
        "id": "a2-d06-045",
        "pos": "noun",
        "word": "Substantiv",
        "lemma": "Substantiv",
        "art": "das",
        "level": "A2",
        "type": "Nomen · Neutrum",
        "ipa": "[ˈzʊpstantif]",
        "meaning": "noun, substantive",
        "gloss": "noun",
        "pl": "die Substantive",
        "genS": "des Substantivs",
        "rule": "Grammatische Fachbegriffe aus dem Lateinischen auf -iv sind meist Neutrum (das Substantiv, das Adjektiv, das Pronomen).",
        "nvv": [["ein Substantiv großschreiben", "to capitalize a noun"]],
        "compounds": ["das Hauptwort", "die Substantivgruppe"],
        "family": ["substantivieren", "substantiell"],
        "ex": ["Im Deutschen werden alle Substantive immer mit großem Anfangsbuchstaben geschrieben.", "In German, all nouns are always written with a capital initial letter."],
        "tip": "Synonym: das Nomen / das Namenwort. Merkhilfe: das Substantiv, das Adjektiv, das Verb (alle Neutrum).",
        "deckId": "a2-deck-06",
        "deckTitle": "Gefühle, Charakter & Reaktionen",
        "sourceLessons": [4],
        "sourceRawIds": ["RAW-184"]
    },
    {
        "id": "a2-d06-046",
        "pos": "noun",
        "word": "Veranstaltung",
        "lemma": "Veranstaltung",
        "art": "die",
        "level": "A2",
        "type": "Nomen · Femininum",
        "ipa": "[fɛɐ̯ˈʔanʃtaltʊŋ]",
        "meaning": "event, function, organized gathering",
        "gloss": "event, gathering",
        "pl": "die Veranstaltungen",
        "genS": "der Veranstaltung",
        "rule": "Endung -ung: immer zu 100 % feminin (die Veranstaltung, die Einladung, die Prüfung).",
        "nvv": [
            ["eine Veranstaltung organisieren / planen", "to organize / plan an event"],
            ["an einer Veranstaltung teilnehmen", "to attend / take part in an event"]
        ],
        "compounds": ["der Veranstaltungskalender", "der Veranstaltungsort", "die Großveranstaltung"],
        "family": ["veranstalten", "der Veranstalter"],
        "ex": ["Der Eintritt zu dieser kulturellen Veranstaltung ist für Studenten kostenlos.", "Admission to this cultural event is free for students."],
        "tip": "Wichtiges A2-Wort für Freizeit- und Kulturpläne. Merke: die Endung '-ung' ist immer die!",
        "deckId": "a2-deck-06",
        "deckTitle": "Gefühle, Charakter & Reaktionen",
        "sourceLessons": [4],
        "sourceRawIds": ["RAW-185"]
    },
    {
        "id": "a2-d06-047",
        "pos": "verb",
        "word": "haben",
        "lemma": "haben",
        "level": "A2",
        "type": "Verb · unregelmäßig / Hilfsverb",
        "ipa": "[ˈhaːbn̩]",
        "meaning": "to have, possess; (auxiliary) have",
        "gloss": "to have",
        "sep": False,
        "pre": "",
        "aux": "haben",
        "hilfsverb": "haben",
        "p2": "gehabt",
        "partizip2": "gehabt",
        "perfekt": "hat gehabt",
        "praeteritum": "hatte",
        "praesens": "hat",
        "reflexiv": False,
        "praes": ["habe", "hast", "hat", "haben", "habt", "haben"],
        "prat": ["hatte", "hattest", "hatte", "hatten", "hattet", "hatten"],
        "imp": ["Hab!", "Habt!", "Haben Sie!"],
        "exT": {
            "praes": ["Ich habe heute leider keine Zeit für einen Kaffee.", "Unfortunately, I don't have time for a coffee today."],
            "prat": ["Als Kind hatte sie einen kleinen Hund.", "As a child, she had a little dog."],
            "perf": ["Wir haben bei der Prüfung großes Glück gehabt!", "We had great luck on the exam!"]
        },
        "ex": ["Hast du Lust, am Wochenende ins Kino zu gehen?", "Do you feel like going to the cinema at the weekend?"],
        "val": [["haben + Akkusativ", "Wen oder was?", "Ich habe einen Bruder und eine Schwester."]],
        "family": ["das Hab und Gut", "inhaber", "vorhaben"],
        "tip": "Grundverb: Im Perfekt bildet 'haben' sein eigenes Perfekt mit 'hat gehabt'. Im Präteritum bevorzugt man 'hatte'.",
        "deckId": "a2-deck-06",
        "deckTitle": "Gefühle, Charakter & Reaktionen",
        "sourceLessons": [4],
        "sourceRawIds": ["RAW-189"]
    },
    {
        "id": "a2-d06-048",
        "pos": "noun",
        "word": "Teppich",
        "lemma": "Teppich",
        "art": "der",
        "level": "A2",
        "type": "Nomen · Maskulinum",
        "ipa": "[ˈtɛpɪç]",
        "meaning": "carpet, rug",
        "gloss": "carpet, rug",
        "pl": "die Teppiche",
        "genS": "des Teppichs",
        "rule": "Endung -ich ist fast immer maskulin: der Teppich, der Kranich, der Bottich.",
        "nvv": [
            ["den Teppich saugen", "to vacuum the carpet"],
            ["einen Teppich auslegen", "to lay a carpet"]
        ],
        "compounds": ["der Teppichboden", "der Orientteppich", "der Läufer"],
        "family": ["teppichartig"],
        "ex": ["Auf dem Holzfußboden im Wohnzimmer liegt ein bunter Teppich.", "On the wooden floor in the living room lies a colorful rug."],
        "tip": "Endungsregel: Wörter auf '-ich' sind maskulin (der Teppich). Plural mit -e: die Teppiche.",
        "deckId": "a2-deck-06",
        "deckTitle": "Gefühle, Charakter & Reaktionen",
        "sourceLessons": [4],
        "sourceRawIds": ["RAW-190"]
    },
    {
        "id": "a2-d06-049",
        "pos": "phrase",
        "word": "eine Lehre ziehen",
        "lemma": "eine Lehre ziehen (aus + Dat)",
        "level": "A2",
        "type": "Nomen-Verb-Verbindung / Redewendung",
        "ipa": "[ˈaɪ̯nə ˈleːʁə ˈtsiːən]",
        "meaning": "to draw a lesson, to learn from an experience",
        "gloss": "to draw a lesson / conclusion",
        "frame": "eine Lehre ziehen aus [Dativ]",
        "reg": [
            ["formal", "Aus diesem Vorfall müssen wir eine Lehre ziehen.", "We must learn a lesson from this incident."],
            ["idiomatic", "Er zog seine Lehre daraus und machte den Fehler nie wieder.", "He learned his lesson from it and never made the mistake again."]
        ],
        "tenses": {
            "praes": "zieht eine Lehre",
            "prat": "zog eine Lehre",
            "perf": "hat eine Lehre gezogen"
        },
        "dlg": [
            ["A", "Das Projekt ist leider gescheitert."],
            ["B", "Kopf hoch! Das Wichtigste ist, dass wir eine wertvolle Lehre daraus ziehen."]
        ],
        "tip": "Reconciles raw flashcard note 'ein les ziehen' (Brainscape typo for 'eine Lehre ziehen' = to draw a conclusion / learn a lesson).",
        "deckId": "a2-deck-06",
        "deckTitle": "Gefühle, Charakter & Reaktionen",
        "sourceLessons": [4],
        "sourceRawIds": ["RAW-193"]
    },
    {
        "id": "a2-d06-050",
        "pos": "adj",
        "word": "klassisch",
        "lemma": "klassisch",
        "level": "A2",
        "type": "Adjektiv",
        "ipa": "[ˈklasɪʃ]",
        "meaning": "classic, classical, traditional",
        "gloss": "classical, classic",
        "comp": [["Positiv", "klassisch"], ["Komparativ", "klassischer"], ["Superlativ", "am klassischsten"]],
        "opp": "modern, unkonventionell, avantgardistisch",
        "family": ["die Klassik", "der Klassiker"],
        "ex": ["Sie trägt gern klassische Kleidung, die nie aus der Mode kommt.", "She likes to wear classic clothing that never goes out of style."],
        "tip": "Häufige Wendungen: 'klassische Musik' (classical music), 'ein klassisches Beispiel' (a classic example).",
        "deckId": "a2-deck-06",
        "deckTitle": "Gefühle, Charakter & Reaktionen",
        "sourceLessons": [4],
        "sourceRawIds": ["RAW-196"]
    },
    {
        "id": "a2-d06-051",
        "pos": "conn",
        "word": "dabei",
        "lemma": "dabei",
        "level": "A2",
        "type": "Pronominaladverb / Adverb",
        "ipa": "[daˈbaɪ̯]",
        "meaning": "present, in the process, at the same time, thereby",
        "gloss": "present / in the process",
        "cls": "Pronominaladverb / Partikel",
        "orders": [
            ["Präsenz (dabei sein)", "Subjekt + sein + dabei", "Bist du bei dem Ausflug morgen auch dabei?"],
            ["Aktivität (dabei sein zu + Inf)", "Subjekt + sein + dabei, zu...", "Ich bin gerade dabei, meine Koffer zu packen."]
        ],
        "cmp": [
            {"cls": "dabei", "w": "dabei", "b": "present / in the act of doing", "ex": "Ich bin gerade dabei, das Abendessen zu kochen."},
            {"cls": "obwohl", "w": "und dabei", "b": "concessive nuance: and yet", "ex": "Er klagt über Geldnot, und dabei hat er gerade ein neues Auto gekauft."}
        ],
        "tip": "Sehr häufiges Alltagsadverb: 'dabei sein' = mitmachen / anwesend sein ('Ich bin dabei!' = Count me in!).",
        "deckId": "a2-deck-06",
        "deckTitle": "Gefühle, Charakter & Reaktionen",
        "sourceLessons": [4],
        "sourceRawIds": ["RAW-198"]
    },
    {
        "id": "a2-d06-052",
        "pos": "verb",
        "word": "ausprobieren",
        "lemma": "ausprobieren",
        "level": "A2",
        "type": "Verb · trennbar / regelmäßig",
        "ipa": "[ˈaʊ̯spʁoˌbiːʁən]",
        "meaning": "to try out, test, give something a go",
        "gloss": "to try out, test",
        "sep": True,
        "pre": "aus",
        "aux": "haben",
        "hilfsverb": "haben",
        "p2": "ausprobiert",
        "partizip2": "ausprobiert",
        "perfekt": "hat ausprobiert",
        "praeteritum": "probierte aus",
        "praesens": "probiert aus",
        "reflexiv": False,
        "praes": ["probiere aus", "probierst aus", "probiert aus", "probieren aus", "probiert aus", "probieren aus"],
        "prat": ["probierte aus", "probiertest aus", "probierte aus", "probierten aus", "probiertet aus", "probierten aus"],
        "imp": ["Probier aus!", "Probiert aus!", "Probieren Sie aus!"],
        "exT": {
            "praes": ["Sie probiert heute ein neues Backrezept aus.", "She is trying out a new baking recipe today."],
            "prat": ["Im Urlaub probierten wir Kitesurfen aus.", "On vacation we tried out kite surfing."],
            "perf": ["Hast du diese App schon einmal ausprobiert?", "Have you ever tried out this app?"]
        },
        "ex": ["Man muss neue Ideen einfach mutig ausprobieren.", "One simply has to try out new ideas courageously."],
        "val": [["etwas (Akk) ausprobieren", "Wen oder was?", "Ich möchte das neue Fahrrad ausprobieren."]],
        "family": ["probieren", "die Probe", "das Experiment"],
        "tip": "Verben auf '-ieren' bilden das Partizip II ohne 'ge-': 'aus' + 'probiert' = 'ausprobiert' (nicht ausgeprobiert).",
        "deckId": "a2-deck-06",
        "deckTitle": "Gefühle, Charakter & Reaktionen",
        "sourceLessons": [4],
        "sourceRawIds": ["RAW-199"]
    },
    {
        "id": "a2-d06-053",
        "pos": "conn",
        "word": "längst",
        "lemma": "längst",
        "level": "A2",
        "type": "Temporales Adverb",
        "ipa": "[lɛŋst]",
        "meaning": "long ago, already for a long time, far from",
        "gloss": "long ago, already",
        "cls": "Adverb der Zeit",
        "orders": [
            ["Zeitangabe (schon lange)", "Subjekt + Verb + längst...", "Sie hätte längst zu Hause sein müssen."],
            ["Verneinung (längst nicht)", "längst nicht + Adjektiv", "Die Arbeit ist längst noch nicht fertig."]
        ],
        "cmp": [
            {"cls": "längst", "w": "längst", "b": "long since / already completed in past", "ex": "Das Problem haben wir längst gelöst."},
            {"cls": "schon", "w": "schon", "b": "already (general)", "ex": "Bist du schon fertig?"}
        ],
        "tip": "Steigerung von lang (Superlativform als Adverb): drückt aus, dass etwas schon vor viel längerer Zeit passiert ist als erwartet.",
        "deckId": "a2-deck-06",
        "deckTitle": "Gefühle, Charakter & Reaktionen",
        "sourceLessons": [4],
        "sourceRawIds": ["RAW-200"]
    },
    {
        "id": "a2-d06-054",
        "pos": "noun",
        "word": "Variante",
        "lemma": "Variante",
        "art": "die",
        "level": "A2",
        "type": "Nomen · Femininum",
        "ipa": "[vaˈʁi̯antə]",
        "meaning": "variant, variation, alternative version",
        "gloss": "variant, version",
        "pl": "die Varianten",
        "genS": "der Variante",
        "rule": "Wörter auf -e sind zu 90 % feminin (die Variante, die Sprache, die Reise).",
        "nvv": [
            ["eine Variante wählen", "to choose an option/variant"],
            ["verschiedene Varianten ausprobieren", "to try out different variations"]
        ],
        "compounds": ["die Sprachvariante", "die Farbvariante"],
        "family": ["variieren", "variabel", "die Variation"],
        "ex": ["Für die Reiseroute gibt es zwei günstige Varianten: mit dem Zug oder mit dem Bus.", "There are two affordable options for the travel itinerary: by train or by bus."],
        "tip": "Fremdwort aus dem Lateinischen. Plural immer mit -n: die Varianten.",
        "deckId": "a2-deck-06",
        "deckTitle": "Gefühle, Charakter & Reaktionen",
        "sourceLessons": [4],
        "sourceRawIds": ["RAW-203"]
    },
    {
        "id": "a2-d06-055",
        "pos": "conn",
        "word": "außer",
        "lemma": "außer (+ Dat)",
        "level": "A2",
        "type": "Präposition mit Dativ",
        "ipa": "[ˈaʊ̯sɐ]",
        "meaning": "except, apart from, besides, out of",
        "gloss": "except, besides",
        "cls": "Präposition (Dativ)",
        "orders": [
            ["Dativ-Rektion", "außer + Dativ", "Niemand wusste die Antwort außer ihm (Dat)."],
            ["Feste Redewendung", "außer Betrieb / außer Gefahr", "Der Aufzug ist momentan leider außer Betrieb."]
        ],
        "cmp": [
            {"cls": "außer", "w": "außer (+ Dat)", "b": "exception: excluding", "ex": "Alle waren pünktlich, außer dem Lehrer."},
            {"cls": "außerdem", "w": "außerdem", "b": "in addition / moreover", "ex": "Er spricht Deutsch und außerdem Spanisch."}
        ],
        "tip": "Feste Dativpräposition! Merke den Reim: 'Aus, bei, mit, nach, seit, von, zu – außer, gegenüber gehören auch dazu!'",
        "deckId": "a2-deck-06",
        "deckTitle": "Gefühle, Charakter & Reaktionen",
        "sourceLessons": [4],
        "sourceRawIds": ["RAW-205"]
    },
    {
        "id": "a2-d06-056",
        "pos": "conn",
        "word": "sogar",
        "lemma": "sogar",
        "level": "A2",
        "type": "Fokuspartikel / Gradpartikel",
        "ipa": "[zoˈɡaːɐ̯]",
        "meaning": "even (emphasizing something surprising or unexpected)",
        "gloss": "even",
        "cls": "Fokuspartikel",
        "orders": [
            ["Vor dem betonten Wort", "sogar + Nomen/Adjektiv/Verb", "Er spricht vier Sprachen, sogar fließend Japanisch."],
            ["Satzanfang zur Betonung", "Sogar im Winter...", "Sogar im tiefsten Winter geht mein Opa jeden Morgen schwimmen."]
        ],
        "cmp": [
            {"cls": "sogar", "w": "sogar", "b": "even (surprising addition)", "ex": "Gestern hat es sogar geschneit."},
            {"cls": "selbst", "w": "selbst", "b": "even (synonym to sogar)", "ex": "Selbst die Experten wussten es nicht."}
        ],
        "tip": "Sehr wichtiges A2-Wort für Überraschung oder Steigerung. Verändert nie die Satzstellung (Position 0 vor dem Bezugswort).",
        "deckId": "a2-deck-06",
        "deckTitle": "Gefühle, Charakter & Reaktionen",
        "sourceLessons": [4],
        "sourceRawIds": ["RAW-208"]
    },
    {
        "id": "a2-d06-057",
        "pos": "noun",
        "word": "Anmeldung",
        "lemma": "Anmeldung",
        "art": "die",
        "level": "A2",
        "type": "Nomen · Femininum",
        "ipa": "[ˈanˌmɛldʊŋ]",
        "meaning": "registration, enrollment, sign-up, check-in desk",
        "gloss": "registration, sign-up",
        "pl": "die Anmeldungen",
        "genS": "der Anmeldung",
        "rule": "Endung -ung: immer zu 100 % feminin (die Anmeldung).",
        "nvv": [
            ["die Anmeldung ausfüllen / abschicken", "to fill out / submit the registration"],
            ["eine Bestätigung der Anmeldung erhalten", "to receive confirmation of registration"]
        ],
        "compounds": ["das Anmeldeformular", "die Anmeldefrist", "die Online-Anmeldung"],
        "family": ["anmelden", "abmelden", "die Meldebescheinigung"],
        "ex": ["Bitte bringen Sie zur Anmeldung Ihren Personalausweis und den Mietvertrag mit.", "Please bring your ID card and rental agreement to registration."],
        "tip": "In Deutschland unverzichtbar: Die Anmeldung beim Bürgeramt/Einwohnermeldeamt innerhalb von zwei Wochen nach dem Umzug.",
        "deckId": "a2-deck-06",
        "deckTitle": "Gefühle, Charakter & Reaktionen",
        "sourceLessons": [4],
        "sourceRawIds": ["RAW-210"]
    },
    {
        "id": "a2-d06-058",
        "pos": "conn",
        "word": "dafür",
        "lemma": "dafür",
        "level": "A2",
        "type": "Pronominaladverb",
        "ipa": "[daˈfyːɐ̯]",
        "meaning": "for it, in favor of that, in exchange for it, on the other hand",
        "gloss": "for that, in favor",
        "cls": "Pronominaladverb",
        "orders": [
            ["Meinung / Zustimmung (dafür sein)", "Subjekt + sein + dafür", "Wer ist für das Projekt? Fast alle sind dafür."],
            ["Kompensation / Ausgleich", "Dafür + Verb + Subjekt...", "Das Hotel war klein, dafür lag es direkt am Strand."]
        ],
        "cmp": [
            {"cls": "dafür", "w": "dafür sein", "b": "to be in favor of", "ex": "Ich bin absolut dafür."},
            {"cls": "dagegen", "w": "dagegen sein", "b": "to be against (opposite)", "ex": "Mein Kollege ist aber dagegen."}
        ],
        "tip": "Ersetzt 'für + Sache' (Ich danke dir für die Hilfe → Ich danke dir dafür). Gegenteil bei Abstimmungen: dagegen.",
        "deckId": "a2-deck-06",
        "deckTitle": "Gefühle, Charakter & Reaktionen",
        "sourceLessons": [4],
        "sourceRawIds": ["RAW-215"]
    },
    {
        "id": "a2-d06-059",
        "pos": "noun",
        "word": "Aufenthalt",
        "lemma": "Aufenthalt",
        "art": "der",
        "level": "A2",
        "type": "Nomen · Maskulinum",
        "ipa": "[ˈaʊ̯fʔɛntˌhalt]",
        "meaning": "stay, residence, stopover (train)",
        "gloss": "stay, stopover",
        "pl": "die Aufenthalte",
        "genS": "des Aufenthalts / Aufenthaltes",
        "rule": "Zusammensetzung mit Halt (der Halt): maskulin.",
        "nvv": [
            ["einen angenehmen Aufenthalt wünschen", "to wish a pleasant stay"],
            ["einen Aufenthalt haben", "to have a stopover / layover"]
        ],
        "compounds": ["der Auslandsaufenthalt", "der Aufenthaltsort", "die Aufenthaltserlaubnis"],
        "family": ["sich aufhalten", "anhalten"],
        "ex": ["Der ICE hat in Hannover fünf Minuten Aufenthalt.", "The ICE train has a five-minute stopover in Hanover."],
        "tip": "Bahn-Ansage: 'Dieser Zug hat etwa zehn Minuten Aufenthalt.' Auf Reisen: 'Wir wünschen Ihnen einen angenehmen Aufenthalt!'",
        "deckId": "a2-deck-06",
        "deckTitle": "Gefühle, Charakter & Reaktionen",
        "sourceLessons": [4],
        "sourceRawIds": ["RAW-223"]
    }
]

# Only add cards whose raw IDs are not yet in cards
added = 0
for nc in new_cards:
    rids = nc.get("sourceRawIds", [])
    if not any(r in existing_rids for r in rids):
        cards.append(nc)
        existing_rids.update(rids)
        added += 1

with open("/Users/ananth/study/German/german-flashcards/data/a2_decks/deck_06_gefuehle.json", "w", encoding="utf-8") as f:
    json.dump(cards, f, ensure_ascii=False, indent=2)

print(f"Added {added} cards. Total cards in Deck 06: {len(cards)}")
