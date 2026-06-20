# Subway Spell

## Spell words by riding the NYC subway

Subway Spell (a.k.a. train-anagrams) turns the NYC subway map into an alphabet. The lettered trains — A, C, E, F, J, L, M, N, Q, R, W, Z, B, D, G, S — are literally letters, so to spell **FACE** you ride the **F**, transfer to the **A**, then the **C**, then the **E**. Every transfer is a real one you could actually make, and the whole trip is drawn on a geographic NYC map with an animated train that rides it.

### Technologies Used
- React
- TypeScript
- Vite
- Leaflet
- Vitest

### Three Modes
- **Spell a word** (finder) — type a word and the app finds a ridable path whose line letters spell it, with a step-by-step itinerary drawn on the map. Letters with no train (H I K O P T U V X Y) become a short walk to a real bar, café, park, or landmark starting with that letter, pulled live from OpenStreetMap with a curated fallback.
- **Explore** — start on any line and follow real transfers one stop at a time, watching the string you're spelling grow, with a "real word ✓" badge.
- **What can I spell?** (reverse) — pick the lines you'll ride and see every common word you can spell with just those letters; tap one to route it.

### Features
- Routing options — *More stops*, *Least walking*, or *Fastest*, plus 🔀 Another route to cycle alternate transfer stations.
- Animated train rides the route, recoloring per line, with play/pause and 0.5×–4× speed.
- Real walking directions follow actual streets via OSRM foot routing.
- Shareable links (`?word=FACE`), save the route as a PNG, copy the itinerary as text, plus recent searches and favorites.
- Installable PWA that works offline after first load.

### How It Works
Live MTA data (stations, routes, transfers, and line geometry) is fetched once from NY State open data and cached in localStorage. Stations are grouped into complexes to build a transfer graph, and because each lettered train is a single line, a word fixes the exact line sequence — so finding a trip becomes a small layered shortest-path that picks the best transfer station between each pair of lines. The route is traced along real track geometry in official MTA colors. No backend — everything runs in the browser against public open-data APIs.

### Live Demo
Try it at [andrewlidong.github.io/train-anagrams](https://andrewlidong.github.io/train-anagrams/).

### GitHub Repository
For more details and to view the source code, visit the [GitHub repository](https://github.com/andrewlidong/train-anagrams).
