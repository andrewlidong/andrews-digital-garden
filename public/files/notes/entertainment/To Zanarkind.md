# 📘 [Zanarkind]

## 🗓 Date
`2025-04-10`

## 🏷 Tags
#music #piano #finalfantasy

---

## 📚 Fleeting Notes
Quick observations, half-baked thoughts, questions, or ideas you had while reading.

- Written in E Minor from Final Fantasy X
- One sharp F#
- Tempo: Allegro, quarter note = ~95bpm (though its often interpreted more slowly and reflectively)
- A gentle, repeating motif in the right hand accompanies simplex, expressive harmonies in the left, gradually building emotional intensity without ever losings its calm, introspective tone.  

---

## 🧠 Literature Notes
Summarize what the source actually said in **your own words**. Pull in any code, math, or diagrams.

**Topic**: Context in Final Fantasy X
- To Zanarkind serves as the main theme and is first heard during the opening cutscene
- It plays again when the characters finally reach Zanarkand
- Underscores themes of memory, loss, sacrifice, and the passage of time.  
- Minimalistic: Uses repetition effectively
- Melancholic beauty: Sparse voicing evoke longing and introspection
- Stepwise motion (mostly moving by seconds, very few leaps)
- A narrow range that makes it feel intimate
- Frequent use of repeated notes and long tones
- Call and repsonse phrasing
- B-D-E-G-E-D-B-A
- D-B-A motif is a signature of the piece.  
- The left hand often arpeggiates the chords or plays broken intervals (open fifths or octaves)
- Modal interchanges
- Use of Cmaj7 adds warmth and emotional depth right after the opening Em

Other similar songs: 
- Aerith's Theme Final Fantasy VII
- Dearly Beloved - Kingdom Hearts
- Far Away - NieR
- Song of the Ancients - NieR Replicant / Automata
- Main Theme - The Last Guardian
- Merry Christmas Mr. Lawrence - Ryuichi Sakamoto
- The Promise / The Meadow - Twilight: New Moon
- Light of Nibel - Ori and the Blind Forest (Gareth Coker)
- Comptine d'un autre ete: Lapres-midi (Amelie)
- River Flows in You - Yiruma
- Spiegel im Spiegel - Arvo Part
- Opening - Philip Glass from Glassworks
- Max Richter - On the Nature of Daylight
- Olafur Arnalds - Near Light
- Joe Hisaishi - One Summer's Day


```python
# Example BST insert
def insert(node, val):
    if not node:
        return TreeNode(val)
    if val < node.val:
        node.left = insert(node.left, val)
    else:
        node.right = insert(node.right, val)
    return node
