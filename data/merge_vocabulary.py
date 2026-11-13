import json
import glob
import os

vocab_orig_path = '/Users/ananth/study/German/german-flashcards/data/vocabulary.json.bak'
vocab_out_path = '/Users/ananth/study/German/german-flashcards/data/vocabulary.json'
deck_dir = '/Users/ananth/study/German/german-flashcards/data/a2_decks'

with open(vocab_orig_path, 'r', encoding='utf-8') as f:
    b1_cards = json.load(f)

print(f"Loaded {len(b1_cards)} existing B1 starter cards.")

deck_files = sorted(glob.glob(os.path.join(deck_dir, 'deck_*.json')))
a2_cards = []
raw_id_set = set()

for df in deck_files:
    with open(df, 'r', encoding='utf-8') as f:
        cards = json.load(f)
    print(f"  {os.path.basename(df)}: {len(cards)} cards")
    for c in cards:
        # Normalization enhancements
        if c.get('pos') == 'adj':
            if 'opp' in c and 'ant' not in c:
                c['ant'] = c['opp']
            if isinstance(c.get('comp'), list):
                # Extract Komparativ and Superlativ strings if structured as list of tuples
                k = next((p[1] for p in c['comp'] if p[0] == 'Komparativ'), None)
                s = next((p[1] for p in c['comp'] if p[0] == 'Superlativ'), None)
                if k:
                    c['compStr'] = k
                if s:
                    c['supStr'] = s
        
        # Ensure raw IDs are tracked
        for rid in c.get('sourceRawIds', []):
            raw_id_set.add(rid)
            
        a2_cards.append(c)

print(f"Loaded {len(a2_cards)} total A2 cards across 10 decks.")
print(f"Total raw IDs tracked: {len(raw_id_set)} / 751")

merged_vocabulary = b1_cards + a2_cards
print(f"Grand total vocabulary cards: {len(merged_vocabulary)}")

with open(vocab_out_path, 'w', encoding='utf-8') as f:
    json.dump(merged_vocabulary, f, indent=2, ensure_ascii=False)

print(f"Successfully written merged vocabulary to {vocab_out_path}!")
