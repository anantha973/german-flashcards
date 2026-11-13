import json

cards = [
    {
        "id": "a2-d10-001",
        "pos": "phrase",
        "word": "das riecht",
        "lemma": "das riecht ...",
        "level": "A2",
        "type": "Redemittel · Sinneswahrnehmung",
        "ipa": "[das ʁiːçt]",
        "meaning": "that smells ... (good/bad/delicious)",
        "gloss": "that smells ...",
        "frame": "Das riecht + Adjektiv / nach + Dativ",
        "reg": [
            ["Umgangssprache", "Mmmh, das riecht aber lecker!", "Mmmh, that smells delicious!"],
            ["Standarddeutsch", "Das riecht sehr angenehm.", "That smells very pleasant."]
        ],
        "tenses": [
            ["Präsens", "Das riecht gut."],
            ["Präteritum", "Das roch wunderbar."],
            ["Perfekt", "Das hat fantastisch gerochen."]
        ],
        "dlg": [
            ["A", "Was kochst du denn da Feines?"],
            ["B", "Eine Kürbissuppe. Probier mal – das riecht schon super!"]
        ],
        "family": ["riechen", "der Geruch", "das Riechen"],
        "tip": "Typische Konstruktion: 'Das riecht gut' oder mit Präposition: 'Das riecht nach Knoblauch (Dativ)'.",
        "deckId": "a2-deck-10",
        "deckTitle": "Redemittel, Konnektoren & Satzbau",
        "sourceLessons": [1],
        "sourceRawIds": ["RAW-003"]
    },
    {
        "id": "a2-d10-002",
        "pos": "adj",
        "word": "echt",
        "lemma": "echt",
        "level": "A2",
        "type": "Adjektiv / Modalpartikel",
        "ipa": "[ɛçt]",
        "meaning": "real, genuine; really / totally (intensifier)",
        "gloss": "really, genuine",
        "comp": [["Positiv", "echt"], ["Komparativ", "echter"], ["Superlativ", "am echtesten"]],
        "opp": "falsch, künstlich",
        "family": ["die Echtheit", "in echt"],
        "ex": [
            "Das war ein echt schöner Abend mit dir!",
            "That was a really wonderful evening with you!"
        ],
        "tip": "Im gesprochenen Deutsch der beliebteste Verstärker: 'echt gut' (= really good), 'echt jetzt?' (= really now?).",
        "deckId": "a2-deck-10",
        "deckTitle": "Redemittel, Konnektoren & Satzbau",
        "sourceLessons": [1],
        "sourceRawIds": ["RAW-004"]
    },
    {
        "id": "a2-d10-003",
        "pos": "adj",
        "word": "egal",
        "lemma": "egal",
        "level": "A2",
        "type": "Adjektiv · prädikativ",
        "ipa": "[eˈɡaːl]",
        "meaning": "doesn't matter, all the same, whatever",
        "gloss": "all the same, immaterial",
        "comp": [["Positiv", "egal"], ["Komparativ", "—"], ["Superlativ", "—"]],
        "opp": "wichtig, entscheidend",
        "family": ["das ist mir egal", "ganz egal", "egal wie"],
        "ex": [
            "Es ist mir völlig egal, ob wir Pizza oder Pasta essen.",
            "I do not care at all whether we eat pizza or pasta."
        ],
        "tip": "Wird fast ausschließlich prädikativ mit Dativ benutzt: 'Das ist mir egal' (nicht flektierbar vor Nomen).",
        "deckId": "a2-deck-10",
        "deckTitle": "Redemittel, Konnektoren & Satzbau",
        "sourceLessons": [1],
        "sourceRawIds": ["RAW-007"]
    },
    {
        "id": "a2-d10-004",
        "pos": "adj",
        "word": "meistens",
        "lemma": "meistens",
        "level": "A2",
        "type": "Temporaladverb",
        "ipa": "[ˈmaɪ̯stn̩s]",
        "meaning": "mostly, usually, most of the time",
        "gloss": "usually, mostly",
        "comp": [["Positiv", "meistens"], ["Komparativ", "—"], ["Superlativ", "—"]],
        "opp": "selten, nie",
        "family": ["meist", "die meisten", "meistenteils"],
        "ex": [
            "Unter der Woche koche ich meistens selbst.",
            "During the week, I usually cook for myself."
        ],
        "tip": "Häufigkeitsadverb auf der Skala: immer (100%) > meistens (~80%) > oft (~60%) > manchmal (~30%) > selten (~10%) > nie (0%).",
        "deckId": "a2-deck-10",
        "deckTitle": "Redemittel, Konnektoren & Satzbau",
        "sourceLessons": [1, 4],
        "sourceRawIds": ["RAW-008", "RAW-206"]
    },
    {
        "id": "a2-d10-005",
        "pos": "adj",
        "word": "überhaupt",
        "lemma": "überhaupt (nicht / kein)",
        "level": "A2",
        "type": "Fokuspartikel / Modalpartikel",
        "ipa": "[yːbɐˈhaʊ̯pt]",
        "meaning": "at all, generally; (with negation) not at all",
        "gloss": "at all, generally",
        "comp": [["Positiv", "überhaupt"], ["Komparativ", "—"], ["Superlativ", "—"]],
        "opp": "vollständig, absolut",
        "family": ["überhaupt nicht", "überhaupt kein"],
        "ex": [
            "Ich habe heute überhaupt keine Zeit für Fernsehen.",
            "I have no time at all today for television."
        ],
        "tip": "Meistens in verneinten Sätzen zur absoluten Verstärkung: 'überhaupt nicht' (= not at all), 'überhaupt kein Problem' (= no problem at all).",
        "deckId": "a2-deck-10",
        "deckTitle": "Redemittel, Konnektoren & Satzbau",
        "sourceLessons": [1, 4],
        "sourceRawIds": ["RAW-040", "RAW-206"]
    },
    {
        "id": "a2-d10-006",
        "pos": "phrase",
        "word": "irgendwas",
        "lemma": "irgendwas",
        "level": "A2",
        "type": "Indefinitpronomen · Umgangssprache",
        "ipa": "[ˈɪʁɡəntvas]",
        "meaning": "something, anything (informal for irgendetwas)",
        "gloss": "something, anything",
        "frame": "irgendwas + Verb / Adjektiv",
        "reg": [
            ["Umgangssprache", "Hast du irgendwas Leckeres im Kühlschrank?", "Do you have anything tasty in the fridge?"],
            ["Standardsprache", "Haben Sie irgendetwas gefunden?", "Did you find anything?"]
        ],
        "tenses": [["Standard", "irgendetwas"], ["Umgangssprache", "irgendwas"]],
        "dlg": [
            ["A", "Brauchst du noch irgendwas aus dem Supermarkt?"],
            ["B", "Ja, bitte bring mir etwas Milch mit!"]
        ],
        "family": ["irgendetwas", "irgendwer", "irgendwo"],
        "tip": "Umgangssprachliche Kurzform von 'irgendetwas'. Signalisiert Unbestimmtheit.",
        "deckId": "a2-deck-10",
        "deckTitle": "Redemittel, Konnektoren & Satzbau",
        "sourceLessons": [2],
        "sourceRawIds": ["RAW-071"]
    },
    {
        "id": "a2-d10-007",
        "pos": "adj",
        "word": "irgendwo",
        "lemma": "irgendwo",
        "level": "A2",
        "type": "Lokaladverb · Indefinit",
        "ipa": "[ˈɪʁɡəntvoː]",
        "meaning": "somewhere, anywhere",
        "gloss": "somewhere",
        "comp": [["Positiv", "irgendwo"], ["Komparativ", "—"], ["Superlativ", "—"]],
        "opp": "nirgendwo, nirgends",
        "family": ["irgendwohin", "irgendwoher"],
        "ex": [
            "Ich habe meine Schlüssel irgendwo in der Wohnung verlegt.",
            "I misplaced my keys somewhere in the apartment."
        ],
        "tip": "Wo? → irgendwo. Wohin? → irgendwohin. Gegenteil: nirgendwo / nirgends.",
        "deckId": "a2-deck-10",
        "deckTitle": "Redemittel, Konnektoren & Satzbau",
        "sourceLessons": [2],
        "sourceRawIds": ["RAW-072"]
    },
    {
        "id": "a2-d10-008",
        "pos": "adj",
        "word": "unbedingt",
        "lemma": "unbedingt",
        "level": "A2",
        "type": "Modaladverb",
        "ipa": "[ˈʊnbəˌdɪŋt]",
        "meaning": "absolutely, definitely, at all costs",
        "gloss": "absolutely, without fail",
        "comp": [["Positiv", "unbedingt"], ["Komparativ", "—"], ["Superlativ", "—"]],
        "opp": "keinesfalls, keineswegs",
        "family": ["die Bedingung", "bedingt"],
        "ex": [
            "Du musst diesen Film unbedingt im Kino sehen!",
            "You absolutely must see this movie in the cinema!"
        ],
        "tip": "Dringende Empfehlung oder fester Wille: 'Ich will unbedingt...' (I really want to...).",
        "deckId": "a2-deck-10",
        "deckTitle": "Redemittel, Konnektoren & Satzbau",
        "sourceLessons": [2, 7, 8],
        "sourceRawIds": ["RAW-075", "RAW-403", "RAW-468"]
    },
    {
        "id": "a2-d10-009",
        "pos": "conn",
        "word": "außerdem",
        "lemma": "außerdem",
        "level": "A2",
        "type": "Konnektor · Konjunktionaladverb",
        "ipa": "[ˈaʊ̯sɐˌdeːm]",
        "meaning": "besides, moreover, in addition, furthermore",
        "gloss": "moreover, besides",
        "cls": "Konjunktionaladverb (Hauptsatz)",
        "orders": [
            ["Position 1 (Inversion)", "außerdem + Verb + Subjekt", "Er spricht Deutsch; außerdem lernt er Spanisch."],
            ["Mittelfeld", "Subjekt + Verb + ... + außerdem", "Er lernt außerdem auch Spanisch."]
        ],
        "cmp": [
            {"cls": "Konjunktion (Position 0)", "w": "und", "b": "Keine Inversion", "ex": "Er lernt Deutsch und er spricht Englisch."},
            {"cls": "Adverb", "w": "dazu", "b": "Aufzählung", "ex": "Dazu kommt noch ein Praktikum."}
        ],
        "ex": [
            "Die Wohnung ist sehr schön und außerdem ziemlich günstig.",
            "The apartment is very nice and, moreover, quite affordable."
        ],
        "family": ["zudem", "überdies", "zusätzlich"],
        "tip": "Auf Position 1 folgt Inversion (Verb auf Position 2!): 'Außerdem möchte ich sagen...'.",
        "deckId": "a2-deck-10",
        "deckTitle": "Redemittel, Konnektoren & Satzbau",
        "sourceLessons": [2],
        "sourceRawIds": ["RAW-077"]
    },
    {
        "id": "a2-d10-010",
        "pos": "adj",
        "word": "beiden",
        "lemma": "beide / beiden",
        "level": "A2",
        "type": "Indefinitpronomen / Zahladjektiv",
        "ipa": "[ˈbaɪ̯də]",
        "meaning": "both, the two",
        "gloss": "both",
        "comp": [["Nominativ", "beide"], ["Dativ", "beiden"], ["Akkusativ", "beide"]],
        "opp": "keiner von beiden",
        "family": ["alle beide", "die beiden"],
        "ex": [
            "Wir haben beide Optionen geprüft und beiden zugestimmt.",
            "We examined both options and agreed to both."
        ],
        "tip": "Nach Präpositionen mit Dativ (mit, von, zu): 'mit beiden' (with both). Als Subjekt: 'Wir beide sind müde'.",
        "deckId": "a2-deck-10",
        "deckTitle": "Redemittel, Konnektoren & Satzbau",
        "sourceLessons": [3],
        "sourceRawIds": ["RAW-092"]
    },
    {
        "id": "a2-d10-011",
        "pos": "adj",
        "word": "empfehlenswert",
        "lemma": "empfehlenswert",
        "level": "A2",
        "type": "Adjektiv",
        "ipa": "[ɛmˈpfeːlənsˌveːɐ̯t]",
        "meaning": "recommended, worth recommending",
        "gloss": "recommendable",
        "comp": [["Positiv", "empfehlenswert"], ["Komparativ", "empfehlenswerter"], ["Superlativ", "am empfehlenswertesten"]],
        "opp": "nicht zu empfehlen, abzuraten",
        "family": ["empfehlen", "die Empfehlung"],
        "ex": [
            "Das Restaurant am Marktplatz ist wirklich sehr empfehlenswert.",
            "The restaurant at the market square is truly highly recommended."
        ],
        "tip": "Zusammensetzung aus 'empfehlen' + '-swert'. Typisch für Bewertungen und Empfehlungen in B1-Prüfungen.",
        "deckId": "a2-deck-10",
        "deckTitle": "Redemittel, Konnektoren & Satzbau",
        "sourceLessons": [3],
        "sourceRawIds": ["RAW-146"]
    },
    {
        "id": "a2-d10-012",
        "pos": "phrase",
        "word": "einander",
        "lemma": "einander",
        "level": "A2",
        "type": "Reziprokpronomen",
        "ipa": "[aɪ̯ˈnandɐ]",
        "meaning": "each other, one another",
        "gloss": "one another, each other",
        "frame": "Verb + einander / Präposition + einander",
        "reg": [
            ["Standarddeutsch", "Sie helfen einander bei den Hausaufgaben.", "They help each other with homework."],
            ["Präpositional", "Wir sprechen oft miteinander.", "We often speak with each other."]
        ],
        "tenses": [["Unflektiert", "einander bleibt immer unverändert"]],
        "dlg": [
            ["A", "Kennt ihr euch eigentlich schon lange?"],
            ["B", "Ja, wir kennen einander seit der Schulzeit."]
        ],
        "family": ["miteinander", "voneinander", "zueinander"],
        "tip": "Wird häufig mit Präpositionen zu einem Wort verschmolzen: miteinander, voneinander, füreinander.",
        "deckId": "a2-deck-10",
        "deckTitle": "Redemittel, Konnektoren & Satzbau",
        "sourceLessons": [4],
        "sourceRawIds": ["RAW-162"]
    },
    {
        "id": "a2-d10-013",
        "pos": "conn",
        "word": "Wenn und dann",
        "lemma": "wenn ... (dann)",
        "level": "A2",
        "type": "Konnektoren-Paar · Konditional",
        "ipa": "[vɛn ... dan]",
        "meaning": "if / when ... then (conditional clause)",
        "gloss": "if ... then",
        "cls": "Konditionale Subjunktion",
        "orders": [
            ["Nebensatz zuerst", "Wenn + Subjekt + ... + Verb, (dann) + Verb + Subjekt", "Wenn es regnet, (dann) nehme ich ein Taxi."],
            ["Hauptsatz zuerst", "Hauptsatz + wenn + Nebensatz (Verb am Ende)", "Ich nehme ein Taxi, wenn es regnet."]
        ],
        "cmp": [
            {"cls": "Temporal", "w": "als", "b": "Einmalig in der Vergangenheit", "ex": "Als ich ein Kind war, wohnte ich in Berlin."},
            {"cls": "Konditional", "w": "falls", "b": "Reine Bedingung (im Falle, dass)", "ex": "Falls du Hilfe brauchst, melde dich."}
        ],
        "ex": [
            "Wenn du die Prüfung bestehst, dann feiern wir zusammen!",
            "If you pass the exam, then we will celebrate together!"
        ],
        "family": ["falls", "sofern", "im Falle dass"],
        "tip": "Klassischer 'Satzrahmen': Im Wenn-Satz steht das Verb ganz am Ende; im folgenden Hauptsatz steht das Verb direkt nach 'dann' (oder sofort an Position 1).",
        "deckId": "a2-deck-10",
        "deckTitle": "Redemittel, Konnektoren & Satzbau",
        "sourceLessons": [4],
        "sourceRawIds": ["RAW-171"]
    },
    {
        "id": "a2-d10-014",
        "pos": "adj",
        "word": "Nord und süd",
        "lemma": "nördlich / südlich (Himmelsrichtungen)",
        "level": "A2",
        "type": "Nomen / Adverb · Orientierung",
        "ipa": "[nɔʁt ʊnt zyːt]",
        "meaning": "north and south",
        "gloss": "north and south",
        "comp": [["Richtung", "der Norden, der Süden"], ["Adverb", "nördlich, südlich"], ["Präposition", "im Norden von ..."]],
        "opp": "Ost und West",
        "family": ["der Norden", "der Süden", "Norddeutschland", "Süddeutschland"],
        "ex": [
            "Hamburg liegt im Norden und München liegt im Süden.",
            "Hamburg is in the north and Munich is in the south."
        ],
        "tip": "Himmelsrichtungen sind alle Maskulinum: der Norden, der Süden, der Osten, der Westen.",
        "deckId": "a2-deck-10",
        "deckTitle": "Redemittel, Konnektoren & Satzbau",
        "sourceLessons": [4],
        "sourceRawIds": ["RAW-177"]
    },
    {
        "id": "a2-d10-015",
        "pos": "phrase",
        "word": "So ein Pech",
        "lemma": "So ein Pech!",
        "level": "A2",
        "type": "Ausruf · Redemittel",
        "ipa": "[zoː aɪ̯n pɛç]",
        "meaning": "What bad luck! / Such bad luck!",
        "gloss": "What bad luck!",
        "frame": "So ein Pech (+ dass ...)",
        "reg": [
            ["Alltagssprache", "So ein Pech! Der Zug ist gerade abgefahren.", "What bad luck! The train just left."],
            ["Standarddeutsch", "Das ist wirklich bedauerlich.", "That is truly unfortunate."]
        ],
        "tenses": [["Gegenteil", "So ein Glück! (What good fortune!)"]],
        "dlg": [
            ["A", "Ich habe meinen Geldbeutel im Bus vergessen."],
            ["B", "Oh nein, so ein Pech! Hast du schon bei der Hotline angerufen?"]
        ],
        "family": ["das Pech", "der Pechvogel", "Pech haben"],
        "tip": "Das Gegenteil ist: 'So ein Glück!'. Ausdrücke des Mitgefühls bei Missgeschicken.",
        "deckId": "a2-deck-10",
        "deckTitle": "Redemittel, Konnektoren & Satzbau",
        "sourceLessons": [4],
        "sourceRawIds": ["RAW-188"]
    },
    {
        "id": "a2-d10-016",
        "pos": "phrase",
        "word": "Nächsten Mal",
        "lemma": "beim nächsten Mal",
        "level": "A2",
        "type": "Temporalphrase",
        "ipa": "[baɪ̯m ˈnɛːçstn̩ maːl]",
        "meaning": "next time",
        "gloss": "next time",
        "frame": "beim nächsten Mal + Verb",
        "reg": [
            ["Gesprochen", "Nächstes Mal klappt es bestimmt!", "Next time it will definitely work out!"],
            ["Formell", "Beim nächsten Mal berücksichtigen wir das.", "We will take that into account next time."]
        ],
        "tenses": [["Gegenwart", "dieses Mal"], ["Vergangenheit", "letztes Mal"], ["Zukunft", "nächstes Mal"]],
        "dlg": [
            ["A", "Schade, wir haben das Spiel knapp verloren."],
            ["B", "Kopf hoch! Beim nächsten Mal gewinnen wir."]
        ],
        "family": ["das Mal", "diesmal", "nächstens"],
        "tip": "Entweder Akkusativ der Zeit: 'nächstes Mal' oder Dativ mit 'beim': 'beim nächsten Mal'.",
        "deckId": "a2-deck-10",
        "deckTitle": "Redemittel, Konnektoren & Satzbau",
        "sourceLessons": [5],
        "sourceRawIds": ["RAW-224"]
    },
    {
        "id": "a2-d10-017",
        "pos": "conn",
        "word": "denn und dann",
        "lemma": "denn vs. dann",
        "level": "A2",
        "type": "Konnektoren-Differenzierung",
        "ipa": "[dɛn ... dan]",
        "meaning": "denn (because - pos. 0) vs. dann (then - pos. 1 with inversion)",
        "gloss": "because vs. then",
        "cls": "Konjunktion (denn) vs. Adverb (dann)",
        "orders": [
            ["denn (Position 0)", "Hauptsatz, denn + Subjekt + Verb", "Ich gehe schlafen, denn ich bin müde."],
            ["dann (Position 1)", "Erst ..., dann + Verb + Subjekt", "Erst frühstücke ich, dann gehe ich zur Uni."]
        ],
        "cmp": [
            {"cls": "Grund (Kausal)", "w": "denn", "b": "Position 0 (keine Inversion)", "ex": "..., denn das Wetter ist schön."},
            {"cls": "Folge (Temporal)", "w": "dann", "b": "Position 1 (verlangt Inversion)", "ex": "..., dann gehe ich spazieren."}
        ],
        "ex": [
            "Ich lerne fleißig, denn morgen ist die Prüfung; dann habe ich Ferien.",
            "I study hard because tomorrow is the exam; then I have vacation."
        ],
        "family": ["denn", "dann", "weil", "danach"],
        "tip": "Wichtiger Satzbau-Unterschied: 'denn' ändert die Wortstellung nicht (Position 0). 'dann' verlangt sofort das Verb (Position 1 + Inversion).",
        "deckId": "a2-deck-10",
        "deckTitle": "Redemittel, Konnektoren & Satzbau",
        "sourceLessons": [5],
        "sourceRawIds": ["RAW-226"]
    },
    {
        "id": "a2-d10-018",
        "pos": "adj",
        "word": "hintereinander",
        "lemma": "hintereinander",
        "level": "A2",
        "type": "Lokal- / Modaladverb",
        "ipa": "[hɪntɐʔaɪ̯ˈnandɐ]",
        "meaning": "one after another, in a row, consecutively",
        "gloss": "in a row, consecutively",
        "comp": [["Positiv", "hintereinander"], ["Komparativ", "—"], ["Superlativ", "—"]],
        "opp": "nebeneinander, gleichzeitig",
        "family": ["hinter", "nacheinander", "aneinander"],
        "ex": [
            "Er hat drei Kaffees direkt hintereinander getrunken.",
            "He drank three coffees directly in a row."
        ],
        "tip": "Kann räumlich (in einer Schlange) oder zeitlich (drei Tage hintereinander) gemeint sein.",
        "deckId": "a2-deck-10",
        "deckTitle": "Redemittel, Konnektoren & Satzbau",
        "sourceLessons": [5],
        "sourceRawIds": ["RAW-281"]
    },
    {
        "id": "a2-d10-019",
        "pos": "phrase",
        "word": "Schaffe es locker!",
        "lemma": "Schaffe es locker!",
        "level": "A2",
        "type": "Wendung · Redemittel",
        "ipa": "[ˈʃafə ɛs ˈlɔkɐ]",
        "meaning": "I can easily manage it! / No problem at all!",
        "gloss": "I can easily do it!",
        "frame": "[Subjekt] schafft das locker",
        "reg": [
            ["Umgangssprache", "Keine Panik, das schaffe ich locker!", "No panic, I can do that easily!"],
            ["Formell", "Das bereitet mir keinerlei Schwierigkeiten.", "That causes me no difficulties whatsoever."]
        ],
        "tenses": [
            ["Präsens", "Ich schaffe das locker."],
            ["Präteritum", "Ich schaffte das locker."],
            ["Perfekt", "Ich habe das locker geschafft."]
        ],
        "dlg": [
            ["A", "Der Zug fährt in zehn Minuten ab. Erreichst du ihn noch?"],
            ["B", "Klar, ich renne zum Gleis – das schaffe ich locker!"]
        ],
        "family": ["schaffen", "locker", "leichtfallen"],
        "tip": "Sehr beliebte deutsche Alltagsredewendung. 'locker' bedeutet hier: stressfrei, ohne Mühe.",
        "deckId": "a2-deck-10",
        "deckTitle": "Redemittel, Konnektoren & Satzbau",
        "sourceLessons": [6],
        "sourceRawIds": ["RAW-318"]
    },
    {
        "id": "a2-d10-020",
        "pos": "phrase",
        "word": "voll sein",
        "lemma": "voll sein",
        "level": "A2",
        "type": "Prädikative Verbindung",
        "ipa": "[fɔl zaɪ̯n]",
        "meaning": "to be full / crowded (train, bus, room)",
        "gloss": "to be full, packed",
        "frame": "etwas / jemand ist voll (+ von / mit)",
        "reg": [
            ["Alltag", "Die Straßenbahn war heute Morgen brechend voll.", "The tram was bursting full this morning."],
            ["Standard", "Der Saal ist bereits voll besetzt.", "The hall is already completely occupied."]
        ],
        "tenses": [
            ["Präsens", "Der Bus ist voll."],
            ["Präteritum", "Der Bus war voll."],
            ["Perfekt", "Der Bus ist voll gewesen."]
        ],
        "dlg": [
            ["A", "Wollen wir mit dem Regionalexpress fahren?"],
            ["B", "Lieber nicht, der ist um diese Uhrzeit immer total voll."]
        ],
        "family": ["voll", "überfüllt", "die Fülle"],
        "tip": "Im Verkehrskontext extrem nützlich: 'Der Zug ist voll' (= the train is crowded).",
        "deckId": "a2-deck-10",
        "deckTitle": "Redemittel, Konnektoren & Satzbau",
        "sourceLessons": [6],
        "sourceRawIds": ["RAW-329"]
    },
    {
        "id": "a2-d10-021",
        "pos": "adj",
        "word": "besetzt",
        "lemma": "besetzt",
        "level": "A2",
        "type": "Partizipiales Adjektiv",
        "ipa": "[bəˈzɛtst]",
        "meaning": "occupied, taken, busy (seat, line, toilet)",
        "gloss": "occupied, taken",
        "comp": [["Positiv", "besetzt"], ["Komparativ", "—"], ["Superlativ", "—"]],
        "opp": "frei, unbesetzt",
        "family": ["besetzen", "die Besetzung", "der Platz"],
        "ex": [
            "Entschuldigung, ist dieser Platz hier noch frei oder schon besetzt?",
            "Excuse me, is this seat still free or already taken?"
        ],
        "tip": "Der absolute Standard-Satz im Zug oder Restaurant: 'Ist hier noch frei?' – 'Nein, leider besetzt.'",
        "deckId": "a2-deck-10",
        "deckTitle": "Redemittel, Konnektoren & Satzbau",
        "sourceLessons": [6],
        "sourceRawIds": ["RAW-330"]
    },
    {
        "id": "a2-d10-022",
        "pos": "phrase",
        "word": "so ein Chaos!",
        "lemma": "so ein Chaos!",
        "level": "A2",
        "type": "Ausruf · Redemittel",
        "ipa": "[zoː aɪ̯n ˈkaːɔs]",
        "meaning": "what a mess! / what chaos!",
        "gloss": "what a mess!",
        "frame": "So ein Chaos (+ an / auf / in ...)",
        "reg": [
            ["Umgangssprache", "Am Bahnhof ging gar nichts mehr – so ein Chaos!", "Nothing worked at the station anymore – what chaos!"],
            ["Standarddeutsch", "Hier herrscht große Unordnung.", "Great disorganization prevails here."]
        ],
        "tenses": [["Nomen", "das Chaos (immer Neutrum, kein Plural)"]],
        "dlg": [
            ["A", "Warum kommst du erst jetzt an?"],
            ["B", "Auf der Autobahn war ein schwerer Unfall – so ein Chaos!"]
        ],
        "family": ["das Chaos", "chaotisch"],
        "tip": "Aussprache: Das 'Ch' wird als [k] gesprochen: [ˈkaːɔs]. Nomen ist Neutrum: das Chaos.",
        "deckId": "a2-deck-10",
        "deckTitle": "Redemittel, Konnektoren & Satzbau",
        "sourceLessons": [6],
        "sourceRawIds": ["RAW-335"]
    },
    {
        "id": "a2-d10-023",
        "pos": "adj",
        "word": "rechtzeitig",
        "lemma": "rechtzeitig",
        "level": "A2",
        "type": "Adjektiv / Adverb",
        "ipa": "[ˈʁɛçtˌtsaɪ̯tɪç]",
        "meaning": "on time, in time, timely",
        "gloss": "on time, in time",
        "comp": [["Positiv", "rechtzeitig"], ["Komparativ", "rechtzeitiger"], ["Superlativ", "am rechtzeitigsten"]],
        "opp": "verspätet, zu spät",
        "family": ["die Zeit", "zur rechten Zeit"],
        "ex": [
            "Wir sind glücklicherweise noch rechtzeitig vor Abfahrt am Gleis angekommen.",
            "Fortunately, we arrived at the track in time before departure."
        ],
        "tip": "Unterschied: 'pünktlich' = genau zur verabredeten Minute; 'rechtzeitig' = früh genug, bevor etwas beginnt oder abfährt.",
        "deckId": "a2-deck-10",
        "deckTitle": "Redemittel, Konnektoren & Satzbau",
        "sourceLessons": [6],
        "sourceRawIds": ["RAW-347"]
    },
    {
        "id": "a2-d10-024",
        "pos": "prep",
        "word": "am ... vorbei",
        "lemma": "an ... vorbei (+ Dativ)",
        "level": "A2",
        "type": "Zirkumposition · Wegbeschreibung",
        "ipa": "[an ... foːɐ̯ˈbaɪ̯]",
        "meaning": "past (something), walking / driving past",
        "gloss": "past",
        "cls": "Feste Richtungsangabe",
        "cases": {
            "wo": {"cs": "Dativ", "q": "Woran vorbei?", "en": "Past the post office / station", "ex": "Fahren Sie an der Post vorbei."}
        },
        "ex": [
            "Gehen Sie am Rathaus vorbei und biegen Sie danach rechts ab.",
            "Walk past the town hall and turn right after that."
        ],
        "family": ["vorbeigehen", "vorbeifahren", "vorbeikommen"],
        "tip": "Umschließt das Nomen mit Dativ: 'an dem (am) Supermarkt vorbei'. Unverzichtbar für Wegbeschreibungen.",
        "deckId": "a2-deck-10",
        "deckTitle": "Redemittel, Konnektoren & Satzbau",
        "sourceLessons": [6],
        "sourceRawIds": ["RAW-354"]
    },
    {
        "id": "a2-d10-025",
        "pos": "phrase",
        "word": "es lohnt sich",
        "lemma": "es lohnt sich",
        "level": "A2",
        "type": "Unpersönliche Wendung",
        "ipa": "[ɛs ˈloːnt zɪç]",
        "meaning": "it is worth it, it pays off",
        "gloss": "it's worth it",
        "frame": "Es lohnt sich (+ zu + Infinitiv)",
        "reg": [
            ["Alltag", "Kauf dir das Deutschlandticket – es lohnt sich total!", "Buy the Deutschlandticket – it is totally worth it!"],
            ["Formell", "Diese Investition lohnt sich langfristig.", "This investment pays off in the long term."]
        ],
        "tenses": [
            ["Präsens", "Es lohnt sich."],
            ["Präteritum", "Es lohnte sich."],
            ["Perfekt", "Es hat sich gelohnt."]
        ],
        "dlg": [
            ["A", "Soll ich das Museum in Magdeburg besuchen?"],
            ["B", "Auf jeden Fall! Die Ausstellung lohnt sich wirklich."]
        ],
        "family": ["sich lohnen", "lohnend", "der Lohn"],
        "tip": "Häufig mit Infinitiv mit 'zu': 'Es lohnt sich, früh aufzustehen.' Perfekt: 'Es hat sich gelohnt.'",
        "deckId": "a2-deck-10",
        "deckTitle": "Redemittel, Konnektoren & Satzbau",
        "sourceLessons": [6],
        "sourceRawIds": ["RAW-366"]
    },
    {
        "id": "a2-d10-026",
        "pos": "conn",
        "word": "entweder",
        "lemma": "entweder ... oder",
        "level": "A2",
        "type": "Doppelkonjunktion",
        "ipa": "[ˈɛntveːdɐ ... ˈoːdɐ]",
        "meaning": "either ... or (two-part connector)",
        "gloss": "either ... or",
        "cls": "Mehrteiliger Konnektor",
        "orders": [
            ["Satzebene", "Entweder fahren wir mit dem Zug, oder wir nehmen den Bus.", "Either we go by train, or we take the bus."],
            ["Wortebene", "Ich nehme entweder Tee oder Kaffee.", "I take either tea or coffee."]
        ],
        "cmp": [
            {"cls": "Positiv doppelt", "w": "sowohl ... als auch", "b": "Beide Optionen treffen zu", "ex": "Er spricht sowohl Deutsch als auch Englisch."},
            {"cls": "Negativ doppelt", "w": "weder ... noch", "b": "Keine Option trifft zu", "ex": "Er trinkt weder Kaffee noch Tee."}
        ],
        "ex": [
            "Du musst dich entscheiden: Entweder du kommst mit, oder du bleibst hier.",
            "You have to decide: either you come along, or you stay here."
        ],
        "family": ["oder", "weder noch", "sowohl als auch"],
        "tip": "Nach 'oder' folgt ganz normale Hauptsatz-Wortstellung (Subjekt + Verb).",
        "deckId": "a2-deck-10",
        "deckTitle": "Redemittel, Konnektoren & Satzbau",
        "sourceLessons": [6],
        "sourceRawIds": ["RAW-375"]
    },
    {
        "id": "a2-d10-027",
        "pos": "adj",
        "word": "vorn und hinten",
        "lemma": "vorne und hinten",
        "level": "A2",
        "type": "Lokaladverbien-Paar",
        "ipa": "[ˈfɔʁnə ʊnt ˈhɪntn̩]",
        "meaning": "front and back, in front and behind",
        "gloss": "front and back",
        "comp": [["Vorderseite", "vorne / vorn"], ["Hinterseite", "hinten"], ["Mitte", "in der Mitte"]],
        "opp": "links und rechts",
        "family": ["vor", "hinter", "der Vorderteil", "der Hinterteil"],
        "ex": [
            "Im Bus kann man vorne beim Fahrer einsteigen oder hinten aussteigen.",
            "In the bus, one can get in at the front by the driver or get out at the back."
        ],
        "tip": "Wo? → vorne / hinten. Im Bus/Zug: 'Vorne ist noch ein Sitzplatz frei.'",
        "deckId": "a2-deck-10",
        "deckTitle": "Redemittel, Konnektoren & Satzbau",
        "sourceLessons": [6],
        "sourceRawIds": ["RAW-380"]
    },
    {
        "id": "a2-d10-028",
        "pos": "phrase",
        "word": "gar nicht so einfach",
        "lemma": "gar nicht so einfach",
        "level": "A2",
        "type": "Redemittel · Bewertung",
        "ipa": "[ɡaːɐ̯ nɪçt zoː ˈaɪ̯nfax]",
        "meaning": "not so easy at all, quite difficult",
        "gloss": "not so easy at all",
        "frame": "Das ist gar nicht so einfach (+ zu + Infinitiv)",
        "reg": [
            ["Gesprochen", "Deutsche Grammatik ist gar nicht so einfach!", "German grammar is not easy at all!"],
            ["Formell", "Diese Angelegenheit gestaltet sich komplex.", "This matter proves to be complex."]
        ],
        "tenses": [["Präsens", "Das ist gar nicht so einfach."], ["Perfekt", "Das ist gar nicht so einfach gewesen."]],
        "dlg": [
            ["A", "Hast du die Adjektivendungen schon alle verstanden?"],
            ["B", "Ehrlich gesagt nein, das ist gar nicht so einfach."]
        ],
        "family": ["einfach", "gar nicht", "schwierig"],
        "tip": "'gar nicht' verstärkt die Verneinung: not at all. 'gar nicht so einfach' ist die typische deutsche Untertreibung für 'ziemlich schwer'.",
        "deckId": "a2-deck-10",
        "deckTitle": "Redemittel, Konnektoren & Satzbau",
        "sourceLessons": [7],
        "sourceRawIds": ["RAW-406"]
    },
    {
        "id": "a2-d10-029",
        "pos": "adj",
        "word": "sowieso",
        "lemma": "sowieso",
        "level": "A2",
        "type": "Modalpartikel / Adverb",
        "ipa": "[zoːviˈzoː]",
        "meaning": "anyway, anyhow, in any case (matter of fact)",
        "gloss": "anyway, in any case",
        "comp": [["Positiv", "sowieso"], ["Komparativ", "—"], ["Superlativ", "—"]],
        "opp": "unter keinen Umständen",
        "family": ["ohnehin", "eh", "auf jeden Fall"],
        "ex": [
            "Du musst mich nicht fahren, ich gehe sowieso zu Fuß.",
            "You do not need to drive me, I am walking anyway."
        ],
        "tip": "Synonyme im Alltag: 'eh' (süddeutsch/umgangssprachlich) oder 'ohnehin' (formeller). Drückt aus, dass etwas ohnehin feststeht.",
        "deckId": "a2-deck-10",
        "deckTitle": "Redemittel, Konnektoren & Satzbau",
        "sourceLessons": [7],
        "sourceRawIds": ["RAW-408"]
    },
    {
        "id": "a2-d10-030",
        "pos": "conn",
        "word": "deshalb",
        "lemma": "deshalb",
        "level": "A2",
        "type": "Konnektor · Konjunktionaladverb",
        "ipa": "[dɛsˈhalp]",
        "meaning": "therefore, that is why",
        "gloss": "therefore, that's why",
        "cls": "Konjunktionaladverb (Hauptsatz)",
        "orders": [
            ["Position 1 (Inversion)", "deshalb + Verb + Subjekt", "Ich war krank, deshalb bin ich zu Hause geblieben."],
            ["Mittelfeld", "Subjekt + Verb + ... + deshalb", "Ich bin deshalb nicht mitgekommen."]
        ],
        "cmp": [
            {"cls": "Subjunktion", "w": "weil", "b": "Verb am Satzende", "ex": "..., weil ich krank war."},
            {"cls": "Konjunktion", "w": "denn", "b": "Position 0 (normale Wortfolge)", "ex": "..., denn ich war krank."}
        ],
        "ex": [
            "Der Zug hatte Verspätung, deshalb habe ich den Anschluss verpasst.",
            "The train was delayed, that is why I missed the connection."
        ],
        "family": ["deswegen", "daher", "aus diesem Grund"],
        "tip": "Einer der wichtigsten Konnektoren! Steht auf Position 1 und verlangt Inversion: 'deshalb + Verb + Subjekt'.",
        "deckId": "a2-deck-10",
        "deckTitle": "Redemittel, Konnektoren & Satzbau",
        "sourceLessons": [7, 8],
        "sourceRawIds": ["RAW-409", "RAW-480"]
    },
    {
        "id": "a2-d10-031",
        "pos": "adj",
        "word": "durcheinander",
        "lemma": "durcheinander",
        "level": "A2",
        "type": "Modaladverb / Zustand",
        "ipa": "[dʊʁçʔaɪ̯ˈnandɐ]",
        "meaning": "confused, muddled, mixed up",
        "gloss": "confused, mixed up",
        "comp": [["Positiv", "durcheinander"], ["Komparativ", "—"], ["Superlativ", "—"]],
        "opp": "geordnet, strukturiert",
        "family": ["das Durcheinander", "durcheinanderbringen"],
        "ex": [
            "Vor der mündlichen Prüfung war ich total durcheinander.",
            "Before the oral exam, I was totally confused/muddled."
        ],
        "tip": "Wird für Gedanken ('Ich bin durcheinander') oder für Dinge ('Die Papiere liegen durcheinander') verwendet.",
        "deckId": "a2-deck-10",
        "deckTitle": "Redemittel, Konnektoren & Satzbau",
        "sourceLessons": [7],
        "sourceRawIds": ["RAW-413"]
    },
    {
        "id": "a2-d10-032",
        "pos": "adj",
        "word": "mindestens",
        "lemma": "mindestens",
        "level": "A2",
        "type": "Gradadverb / Mengenangabe",
        "ipa": "[ˈmɪndəstn̩s]",
        "meaning": "at least (numbers/amounts)",
        "gloss": "at least",
        "comp": [["Positiv", "mindestens"], ["Komparativ", "—"], ["Superlativ", "—"]],
        "opp": "höchstens, maximal",
        "family": ["mindeste", "zumindest", "wenigstens"],
        "ex": [
            "Man sollte täglich mindestens zwei Liter Wasser trinken.",
            "One should drink at least two liters of water daily."
        ],
        "tip": "Unterschied: 'mindestens' bezieht sich auf messbare Zahlen/Mengen ('mindestens 3 Stunden'). 'wenigstens/zumindest' bezieht sich oft auf emotionale Mindestanforderungen.",
        "deckId": "a2-deck-10",
        "deckTitle": "Redemittel, Konnektoren & Satzbau",
        "sourceLessons": [7],
        "sourceRawIds": ["RAW-416"]
    },
    {
        "id": "a2-d10-033",
        "pos": "conn",
        "word": "trotzdem",
        "lemma": "trotzdem",
        "level": "A2",
        "type": "Konnektor · Konzessiv",
        "ipa": "[ˈtʁɔtsdəm]",
        "meaning": "nevertheless, nonetheless, still",
        "gloss": "nevertheless, still",
        "cls": "Konzessives Konjunktionaladverb",
        "orders": [
            ["Position 1 (Inversion)", "trotzdem + Verb + Subjekt", "Es regnete in Strömen, trotzdem gingen wir spazieren."],
            ["Mittelfeld", "Subjekt + Verb + trotzdem + ...", "Wir gingen trotzdem spazieren."]
        ],
        "cmp": [
            {"cls": "Subjunktion", "w": "obwohl", "b": "Verb am Satzende", "ex": "Obwohl es regnete, gingen wir spazieren."},
            {"cls": "Präposition (+ Gen/Dat)", "w": "trotz", "b": "Vor Nomen", "ex": "Trotz des Regens gingen wir spazieren."}
        ],
        "ex": [
            "Er hatte wenig geschlafen, trotzdem war er im Unterricht sehr aufmerksam.",
            "He had slept little, nevertheless he was very attentive in class."
        ],
        "family": ["dennoch", "trotz", "obwohl"],
        "tip": "Drückt einen Widerspruch/Unerwartetes aus. Auf Position 1 verlangt 'trotzdem' Inversion (Verb auf Position 2!).",
        "deckId": "a2-deck-10",
        "deckTitle": "Redemittel, Konnektoren & Satzbau",
        "sourceLessons": [7, 8],
        "sourceRawIds": ["RAW-419", "RAW-479"]
    },
    {
        "id": "a2-d10-034",
        "pos": "adj",
        "word": "gerecht",
        "lemma": "gerecht",
        "level": "A2",
        "type": "Adjektiv",
        "ipa": "[ɡəˈʁɛçt]",
        "meaning": "fair, just, equitable",
        "gloss": "fair, just",
        "comp": [["Positiv", "gerecht"], ["Komparativ", "gerechter"], ["Superlativ", "am gerechtesten"]],
        "opp": "ungerecht, unfair",
        "family": ["die Gerechtigkeit", "ungerecht", "Recht haben"],
        "ex": [
            "Der Lehrer hat die Noten sehr gerecht verteilt.",
            "The teacher distributed the grades very fairly."
        ],
        "tip": "Gegenteil: 'ungerecht'. Häufig verwendet bei Prüfungen, Noten und Regeln.",
        "deckId": "a2-deck-10",
        "deckTitle": "Redemittel, Konnektoren & Satzbau",
        "sourceLessons": [7],
        "sourceRawIds": ["RAW-428"]
    },
    {
        "id": "a2-d10-035",
        "pos": "adj",
        "word": "selbst",
        "lemma": "selbst / selber",
        "level": "A2",
        "type": "Fokuspartikel / Pronomen",
        "ipa": "[zɛlpst]",
        "meaning": "self, oneself; even (intensifier)",
        "gloss": "myself/himself, even",
        "comp": [["Selbständigkeit", "ich selbst / ich selber"], ["Verstärkung", "selbst ein Kind weiß das"]],
        "opp": "fremdgesteuert",
        "family": ["selber", "selbstständig", "das Selbst"],
        "ex": [
            "Ich habe den Kuchen für die Party ganz alleine selbst gebacken.",
            "I baked the cake for the party completely by myself."
        ],
        "tip": "'selbst' und 'selber' bedeuten das Gleiche; 'selbst' ist standardsprachlich, 'selber' umgangssprachlich.",
        "deckId": "a2-deck-10",
        "deckTitle": "Redemittel, Konnektoren & Satzbau",
        "sourceLessons": [8],
        "sourceRawIds": ["RAW-460"]
    },
    {
        "id": "a2-d10-036",
        "pos": "phrase",
        "word": "unbedingt und bestimmt",
        "lemma": "unbedingt vs. bestimmt",
        "level": "A2",
        "type": "Modaladverbien-Gegenüberstellung",
        "ipa": "[ˈʊnbəˌdɪŋt ʊnt bəˈʃtɪmt]",
        "meaning": "unbedingt (by all means, must) vs. bestimmt (certainly, surely)",
        "gloss": "definitely vs. certainly",
        "frame": "Wille (unbedingt) vs. Wahrscheinlichkeit (bestimmt)",
        "reg": [
            ["Wille/Dringlichkeit", "Ich will unbedingt nach Berlin fahren.", "I want to go to Berlin at all costs."],
            ["Sicherheit/Annahme", "Das Wetter wird morgen bestimmt schön.", "The weather will certainly be nice tomorrow."]
        ],
        "tenses": [["Modalität", "unbedingt = starker eigener Wille; bestimmt = hohe objektive Sicherheit"]],
        "dlg": [
            ["A", "Kommst du morgen zur Feier?"],
            ["B", "Ich versuche es unbedingt, und bestimmt schaffe ich es bis 20 Uhr."]
        ],
        "family": ["unbedingt", "bestimmt", "sicherlich"],
        "tip": "'unbedingt' = Notwendigkeit / unbedingter Wille; 'bestimmt' = Zuversicht / Gewissheit.",
        "deckId": "a2-deck-10",
        "deckTitle": "Redemittel, Konnektoren & Satzbau",
        "sourceLessons": [8],
        "sourceRawIds": ["RAW-468"]
    },
    {
        "id": "a2-d10-037",
        "pos": "adj",
        "word": "wohl",
        "lemma": "wohl",
        "level": "A2",
        "type": "Modalpartikel / Adverb",
        "ipa": "[voːl]",
        "meaning": "probably, presumably, well",
        "gloss": "probably, well",
        "comp": [["Positiv", "wohl"], ["Komparativ", "wohler"], ["Superlativ", "am wohlsten"]],
        "opp": "unwohl",
        "family": ["das Wohl", "wohlfühlen", "sich wohlfühlen"],
        "ex": [
            "Er kommt heute wohl nicht mehr, es ist schon nach 22 Uhr.",
            "He probably won't come anymore today, it is already past 10 PM."
        ],
        "tip": "Als Modalpartikel drückt 'wohl' eine Vermutung aus (= wahrscheinlich). Als Adjektiv: 'Ich fühle mich wohl' (= I feel good).",
        "deckId": "a2-deck-10",
        "deckTitle": "Redemittel, Konnektoren & Satzbau",
        "sourceLessons": [8],
        "sourceRawIds": ["RAW-470"]
    },
    {
        "id": "a2-d10-038",
        "pos": "phrase",
        "word": "mach weiter so!",
        "lemma": "Mach weiter so!",
        "level": "A2",
        "type": "Redemittel · Ermutigung",
        "ipa": "[max ˈvaɪ̯tɐ zoː]",
        "meaning": "Keep it up! / Keep going like that!",
        "gloss": "Keep it up!",
        "frame": "Mach / Macht / Machen Sie weiter so!",
        "reg": [
            ["Du-Form", "Super Fortschritte beim Deutschlernen, mach weiter so!", "Great progress learning German, keep it up!"],
            ["Sie-Form", "Sehr gute Arbeit, machen Sie bitte weiter so!", "Very good work, please continue like that!"]
        ],
        "tenses": [["Imperativ", "Mach weiter so!"]],
        "dlg": [
            ["A", "Ich habe heute schon 50 Vokabeln gelernt und wiederholt."],
            ["B", "Klasse, mach genau so weiter!"]
        ],
        "family": ["weitermachen", "fortfahren", "dranbleiben"],
        "tip": "Trennbares Verb 'weitermachen' im Imperativ. Perfekter Motivationsausruf bei Lernfortschritten.",
        "deckId": "a2-deck-10",
        "deckTitle": "Redemittel, Konnektoren & Satzbau",
        "sourceLessons": [8],
        "sourceRawIds": ["RAW-475"]
    },
    {
        "id": "a2-d10-039",
        "pos": "phrase",
        "word": "sehr wohl",
        "lemma": "sehr wohl",
        "level": "A2",
        "type": "Redemittel · Bekräftigung",
        "ipa": "[zeːɐ̯ voːl]",
        "meaning": "very well, certainly, indeed (contrary to assertion)",
        "gloss": "indeed, certainly",
        "frame": "Subjekt + weiß / kann das sehr wohl",
        "reg": [
            ["Betonung", "Ich weiß das sehr wohl!", "I know that perfectly well!"],
            ["Widerspruch", "Das stimmt sehr wohl!", "That is indeed true!"]
        ],
        "tenses": [["Feste Wendung", "sehr wohl"]],
        "dlg": [
            ["A", "Du weißt doch gar nicht, wie anstrengend das war."],
            ["B", "Doch, ich weiß das sehr wohl!"]
        ],
        "family": ["wohl", "doch", "tatsächlich"],
        "tip": "Wird oft nach 'doch' verwendet, um einen Einwand mit Nachdruck zurückzuweisen.",
        "deckId": "a2-deck-10",
        "deckTitle": "Redemittel, Konnektoren & Satzbau",
        "sourceLessons": [9],
        "sourceRawIds": ["RAW-551"]
    },
    {
        "id": "a2-d10-040",
        "pos": "adj",
        "word": "kaum",
        "lemma": "kaum",
        "level": "A2",
        "type": "Gradadverb / Negationspartikel",
        "ipa": "[kaʊ̯m]",
        "meaning": "hardly, barely, scarcely",
        "gloss": "hardly, barely",
        "comp": [["Positiv", "kaum"], ["Komparativ", "—"], ["Superlativ", "—"]],
        "opp": "häufig, reichlich, vollkommen",
        "family": ["kaum noch", "kaum zu glauben"],
        "ex": [
            "Wegen des starken Nebels konnte man kaum etwas sehen.",
            "Because of the thick fog, one could hardly see anything."
        ],
        "tip": "Bedeutet fast 'fast gar nicht'. Typische Wendung: 'Das ist kaum zu glauben!' (= That's hard to believe!).",
        "deckId": "a2-deck-10",
        "deckTitle": "Redemittel, Konnektoren & Satzbau",
        "sourceLessons": [9],
        "sourceRawIds": ["RAW-555"]
    },
    {
        "id": "a2-d10-041",
        "pos": "phrase",
        "word": "jemand ; niemand ; alles",
        "lemma": "jemand / niemand / alles",
        "level": "A2",
        "type": "Indefinitpronomen-Trio",
        "ipa": "[ˈjeːmant / ˈniːmant / ˈaləs]",
        "meaning": "someone (jemand) / nobody (niemand) / everything (alles)",
        "gloss": "someone / nobody / everything",
        "frame": "Indefinite Mengenangaben für Personen und Dinge",
        "reg": [
            ["Person positiv", "Ist da jemand?", "Is someone there?"],
            ["Person negativ", "Nein, hier ist niemand.", "No, nobody is here."],
            ["Sache allumfassend", "Alles ist gut vorbereitet.", "Everything is well prepared."]
        ],
        "tenses": [["Deklination", "jemand(en), niemand(em), alles"]],
        "dlg": [
            ["A", "Hat jemand meine Jacke gesehen?"],
            ["B", "Nein, hier hat niemand eine Jacke gesehen, aber alles andere liegt noch da."]
        ],
        "family": ["jemand", "niemand", "etwas", "nichts", "alles"],
        "tip": "Person: jemand ↔ niemand. Sache: etwas ↔ nichts / alles. Wichtige Pronomen für alltägliche Fragen.",
        "deckId": "a2-deck-10",
        "deckTitle": "Redemittel, Konnektoren & Satzbau",
        "sourceLessons": [10],
        "sourceRawIds": ["RAW-588"]
    },
    {
        "id": "a2-d10-042",
        "pos": "conn",
        "word": "sondern",
        "lemma": "sondern",
        "level": "A2",
        "type": "Konnektor · Korrektiv",
        "ipa": "[ˈzɔndɐn]",
        "meaning": "but rather, but instead (after negative)",
        "gloss": "but rather, but instead",
        "cls": "Beiordnende Konjunktion (Position 0)",
        "orders": [
            ["Position 0", "nicht ..., sondern + Subjekt + Verb", "Ich trinke keinen Kaffee, sondern ich bevorzuge Tee."],
            ["Elliptisch", "nicht A, sondern B", "Er kommt nicht heute, sondern morgen."]
        ],
        "cmp": [
            {"cls": "Adversativ", "w": "aber", "b": "Einschränkung ohne Ersatz", "ex": "Er ist müde, aber er arbeitet weiter."},
            {"cls": "Korrektiv", "w": "sondern", "b": "Ersetzt das verneinte Element", "ex": "Er lernt nicht Spanisch, sondern Deutsch."}
        ],
        "ex": [
            "Wir fahren im Urlaub nicht ans Meer, sondern in die Berge.",
            "We are not going to the sea on vacation, but rather into the mountains."
        ],
        "family": ["nicht nur ... sondern auch", "aber"],
        "tip": "WICHTIGSTE REGEL: 'sondern' darf NUR nach einer Verneinung (nicht, kein) stehen, wenn das Verneinte durch eine Alternative ersetzt wird!",
        "deckId": "a2-deck-10",
        "deckTitle": "Redemittel, Konnektoren & Satzbau",
        "sourceLessons": [10, 11],
        "sourceRawIds": ["RAW-614", "RAW-664"]
    },
    {
        "id": "a2-d10-043",
        "pos": "adj",
        "word": "allein",
        "lemma": "allein / alleine",
        "level": "A2",
        "type": "Modaladverb / Adjektiv",
        "ipa": "[aˈlaɪ̯n]",
        "meaning": "alone, by oneself, solely",
        "gloss": "alone",
        "comp": [["Positiv", "allein"], ["Komparativ", "—"], ["Superlativ", "—"]],
        "opp": "zusammen, gemeinsam",
        "family": ["einsam", "das Alleinsein", "alleinerziehend"],
        "ex": [
            "Er wohnt seit zwei Jahren ganz allein in einer kleinen Wohnung.",
            "He has been living completely alone in a small apartment for two years."
        ],
        "tip": "'allein' (ohne andere) unterscheidet sich von 'einsam' (einsam fühlen = feeling lonely). 'alleine' ist die umgangssprachliche Variante.",
        "deckId": "a2-deck-10",
        "deckTitle": "Redemittel, Konnektoren & Satzbau",
        "sourceLessons": [11],
        "sourceRawIds": ["RAW-630"]
    },
    {
        "id": "a2-d10-044",
        "pos": "adj",
        "word": "gegenseitig",
        "lemma": "gegenseitig",
        "level": "A2",
        "type": "Adjektiv / Adverb",
        "ipa": "[ˈɡeːɡn̩ˌzaɪ̯tɪç]",
        "meaning": "mutual, reciprocal, mutually",
        "gloss": "mutual, reciprocal",
        "comp": [["Positiv", "gegenseitig"], ["Komparativ", "—"], ["Superlativ", "—"]],
        "opp": "einseitig",
        "family": ["die Gegenseite", "einander"],
        "ex": [
            "In einer guten Beziehung unterstützt man sich gegenseitig.",
            "In a good relationship, one supports each other mutually."
        ],
        "tip": "Wird oft mit reflexiven Verben kombiniert: 'sich gegenseitig helfen / respektieren'.",
        "deckId": "a2-deck-10",
        "deckTitle": "Redemittel, Konnektoren & Satzbau",
        "sourceLessons": [11],
        "sourceRawIds": ["RAW-631"]
    },
    {
        "id": "a2-d10-045",
        "pos": "phrase",
        "word": "ein paar Mal",
        "lemma": "ein paar Mal",
        "level": "A2",
        "type": "Mengen- / Temporalphrase",
        "ipa": "[aɪ̯n paːɐ̯ maːl]",
        "meaning": "a few times, several times",
        "gloss": "a few times",
        "frame": "ein paar Mal + Perfekt / Präsens",
        "reg": [
            ["Standard", "Ich habe ihn schon ein paar Mal darauf hingewiesen.", "I pointed that out to him a few times already."],
            ["Umgangssprache", "Wir waren schon ein paar Mal da.", "We have been there a few times."]
        ],
        "tenses": [["Häufigkeit", "einmal < ein paar Mal < mehrmals < oft"]],
        "dlg": [
            ["A", "Warst du schon mal in Leipzig?"],
            ["B", "Ja, ich war schon ein paar Mal dort, es ist eine tolle Stadt."]
        ],
        "family": ["ein paarmal", "manchmal", "mehrmals"],
        "tip": "Kleingeschriebenes 'ein paar' = einige (a few). Großgeschriebenes 'ein Paar' = genau zwei / Paar Schuhe (a pair).",
        "deckId": "a2-deck-10",
        "deckTitle": "Redemittel, Konnektoren & Satzbau",
        "sourceLessons": [12],
        "sourceRawIds": ["RAW-683"]
    },
    {
        "id": "a2-d10-046",
        "pos": "phrase",
        "word": "auf keinen Fall tun",
        "lemma": "auf keinen Fall",
        "level": "A2",
        "type": "Redemittel · Absolute Verneinung",
        "ipa": "[aʊ̯f ˈkaɪ̯nən fal]",
        "meaning": "under no circumstances, on no account, definitely not",
        "gloss": "under no circumstances",
        "frame": "Das darfst du auf keinen Fall tun!",
        "reg": [
            ["Verbot / Warnung", "Das solltest du auf keinen Fall tun!", "You should definitely not do that!"],
            ["Zusage / Entschlossenheit", "Ich gebe auf keinen Fall auf.", "I will not give up under any circumstances."]
        ],
        "tenses": [["Gegenteil", "auf jeden Fall (definitely / in any case)"]],
        "dlg": [
            ["A", "Soll ich den Vertrag sofort unterschreiben, ohne ihn zu lesen?"],
            ["B", "Nein, tu das auf keinen Fall! Lass ihn erst prüfen."]
        ],
        "family": ["der Fall", "auf jeden Fall", "keinesfalls"],
        "tip": "Gegenteil: 'auf jeden Fall'. Unverzichtbar für Ratschläge und Warnungen in Prüfungen.",
        "deckId": "a2-deck-10",
        "deckTitle": "Redemittel, Konnektoren & Satzbau",
        "sourceLessons": [12],
        "sourceRawIds": ["RAW-710"]
    }
]

out_path = "/Users/ananth/study/German/german-flashcards/data/a2_decks/deck_10_redemittel.json"
with open(out_path, "w", encoding="utf-8") as f:
    json.dump(cards, f, ensure_ascii=False, indent=2)

print(f"Generated {len(cards)} rich cards for Deck 10 saved to {out_path}!")
