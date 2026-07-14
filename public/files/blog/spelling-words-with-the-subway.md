---
title: "Spelling words with the Subway"
date: "2026-06-17"
subtitle: "We love creative coding"
slug: "spelling-words-with-the-subway"
---

This last week my friend [Maxime](https://maximeheckel.com/) and I were hanging out at [Betty’s](https://bettynewyork.com/) for a 1-hour fable hackathon. Fable got cancelled, the restaurant (which slaps) didn’t have good wifi and Maxime left feeling unsatisfied with his subway map re-rendering. I left with the idea to spell anagrams out of subway train lines.

The New York City subway has a wonderful coincidence baked into it: a bunch of its lines are named with single letters. There’s an A train, a C, an E, an F, a G, a J… sixteen lettered services in total. Which means you can *spell* things with them. To spell [FACE](https://andrewlidong.github.io/train-anagrams/?word=ILOVECREATIVECODING) you board the F, transfer to the A, and then the C, then the E - and because the subway is a real network, it’s an actual trip you could take, with real transfers at a real stations, for $3.00.

Thanks for reading! Subscribe for free to receive new posts and support my work.

I built [Subway Spell](https://andrewlidong.github.io/train-anagrams/) to do exactly that: type a word and it finds a ridable path whose line letters spell it, then animates a little train riding the route on a map of the real network. It’s a static site - no backend- running entirely against public open data. Here’s how it works, including a few problems that I found interesting.

![](/blog-images/spelling-words-with-the-subway-1.gif)

## The Data

Two datasets from New York State’s Socrata-powered open-data portal do almost all the work, and both are queryable directly from the browser with CORS:

-   **[MTA Subway Staations](https://data.ny.gov/resource/39hk-dx4f.json) -** one row per station, with `stop_name`, `daytime_routes` (a space separated list like `”N Q R W S 1 2 3 7”`), `complex_id`, `borough`, and `gtfs_latitude / gtfs_longitude`.
    
-   **[MTA Subway Service Lines](https://data.ny.gov/resource/s692-irgq.json)** \- one row per service with a `geometry` MultiLineString of the actual track alignment. This is what lets the highlighted route follow the real curves of the tracks instead of drawing straight lines between stations.
    

I fetch both once on load (?$limit=2000 pulls everything), cache them in `localStorage` for 30 days, and never touch a server of my own again. The whole app is approximately 500 lines of routing logic plus a React/Leaflet UI.

The single most important field is `complex_id`. A “station complex” is a group of physically-connected platforms you can transfer between without leaving the system. Times Sq-42 St is one complex spanning the N/Q/R/W, the 1/2/3, the 7, and the S shuttle. I group stations by `complex_id`, union their `daytime_routes`, and average their coordinates into a centroid. Two lines are connected if some complex serves both of them.

## Modeling transfers as a graph

```
class SubwayGraph {
  // line -> set of lines reachable by one transfer
  private adjacency = new Map<string, Set<string>>();
  // ...
}
```

I build a line-to-line adjacency in two passes:

1.  **In-system transfers**. For every complex, every pair of routes it serves gets an edge. (A complex serving A, C, E gives you A←→C, A←→ E, C←→E)
    
2.  **Out-of-system walking transfers**. For every pair of complexes within ~400m (haversine), I add edges between their routes too. This captures the real “exit here, walk a block, re-enter” transfers the MTA actually honors, plus a few it doesn’t but a human reasonably would.
    

The neat realization that makes the whole thing tractable is that each lettered train ies exactly one line. The A in your word can only be the A train, so a word doesn’t design a search over which lines to take - it defines the line sequence completely. For example, `MADAGASCAR` is unambiguously M-A-D-A-G-A-S-C-A-R. The only freedom left is *which station you transfer* *at* between each consecutive pair of lines.

## Path-finding as a layered shortest path

So the problem reduces to: for the fixed line sequence `L_0, L_1, … L_k` choose a transfer station for each adjacent pair (L\_t, L\_t+1) to minimize some cost.

Each transition t has a set of candidate “transfer options”:

```typescript
interface TransferOption {
  arrive: Complex; // station where you get off line L_t
  depart: Complex; // station where you board line L_t+1
  walk: number; // metres walked during the transfer (0 if in-system)
}
```

In-system transfers have `arrive === depart` and `walk === 0`. Walking transfers are pairs of nearby complexes. If a pair of lines genuinely shares no station and has no nearby pair, I fall back to the single closest pair of stations (a long walk, surfaced to the user).

Then it’s a textbook layered DP. The cost of riding line L\_(t+1) from one transition’s `depart` to the next transition’s `arrive` is the haversine between them; I sum ride costs plus walk costs across the chain and reconstruct the cheapest path with back-pointers. It’s small - a handful of transitions, each with at most a few dozen candidate stations - so it runs in well under a millisecond.

The interesting part wasn’t the algorithm. It was the cost function!

## The cost function went through three rewrites

v1 weighted ride meters and walk meters equally. The result technically spelled the word but was deeply unsatisfying: for `FACE`, every one of F, A, C, and E stops at W 4th street - Washington Square, so the “optimal” route was to stand at W 4 St and transfer four times without going anywhere. Minimal distance, zero riding, no fun.

v2 added two ideas: make rides cheap (so the planner doesn’t mind a longer trip), weight walking much higher (so it avoids out-of-system transfers), and add a penalty for “same-station” transfers - any ride shorter than 60m counts as not really riding and gets dinged. That fixed `FACE` (it now rides to four distinct stations) but I’d only applied the penalty to one of three routing “strategies” I’d added, so the others still produced the stand-still routes.

v3 (the one that’s live) makes the hierarchy explicit and applies it to every strategy:

```
walk cost >> same-station penalty >> ride cost
```

```
const STRATEGY_WEIGHTS = {
  scenic: { ride: 0.1, walk: 60, samePenalty: 6000 }, // long rides fine
  "least-walk: { ride: 0.5, walk: 120, samePenalty: 1500 }, // accept a boring transfer over a walk
  fastest: { ride: 1, walk: 60, samePenalty: 6000 }, // nearest distinct station
};
```

The magnitudes matter. With `samePenalty = 6000` and `ride = 0.1`, the planner will happily ride up to 60km to reach a different transfer station rather than stand still - but because `walk=60` per meter, even a 100m walk costs 6000, so it will *never walk* just to avoid a same-station transfer. That ordering - walking being worse than a boring transfer, which is worse than a long ride - is exactly the preference that a real rider (or at least me) has, and getting the constants to encode it took some fiddling. Verifying it meant running a few words against the live data and counting zero-length rides.

```
FACE: rides=4, sameStation=0 transferWalk=0m
MADAGACSCAR: rides=10 sameStation=1 transferWalk=0m
```

The one stubborn same-station hop in `MADAGASCAR` is genuinely unavoidable - some adjacent letter pairs share exactly one complex - so that’s the right answer.

## “Another route” and a deterministic jitter

I wanted an “🔀 Another Route” button. The honest way to do this is k-shortest paths. The cheap way is to perturb the costs and re-run. I went cheap lol, but with a twist: the perturbation has to be *deterministic* (so a given variant always yields the same route - important because the result feeds a URL you can share) and *bounded* (so it reshuffles which distinct station you use without ever crossing the threshold into “now walking is cheaper”).

```javascript
function jitter(seed: number): number {
  const x = Math.sin(seed) * 1000
  return x - Math.floor(x); // deterministic pseudo-random in [0,1)
}
```

The jitter is scaled to min(samePenalty \* 0.4, 1500) - enough to flip between near-equal in-system stations, never enough to make the planner walk or stand still. My first version used a fixed scale and it was useless for the high-magnitude strategies (1200 of jitter is nothing next to a 6km ride cost), which is why “another route” felt broken until I made it proportional.

## Drawing the route on the real tracks

The background map is Leaflet (which I used for [traceandpace.com](https://traceandpace.com/) my strava art run club) with a CARTO Positron basemap and the full subway network drawn from the geometry in official MTA colors (rendered on a canvas via `preferCanvas`, because there are *a lot* of polylines).

The highlighted route is the fun bit. For each ride leg I need the slice of the line’s real geometry between the two transfer stations. I project each endpoint onto the line’s polyline - closest point on each segment, planar approximation in lat/lng which is fine at city scale - find the segment that minimizes the sum of the two projection distances, then slice the polyline’s vertices between the two projected points and orient them in travel direction:

```
const between = path.filter((_, i) => cum[i] > lo && cum[i] < hi);
return [from, f.point, ...(ascending ? between : between.reverse()), t.point, to];
```

For a long leg this returns hundreds of points (the E train from Court Square to 7th Ave traces ~1300), so the route hugs the tracks instead of cutting across Queens.

## The animated train

A `requestAnimationFrame` loop walks a marker along the concatenated geometry of every leg, by cumulative distance so the speed is constant regardless of how the points are spaced. The marker recolors itself to the current line, the speed is adjustable 0.5x-4x, and as it crosses a leg boundary it fires an `onLegChange` callback that highlights the correponding cell in the “spelling strip” above the map and the matching row in the itinerary. Crucially, the per-frame updates go straight to the Leaflet marker via `setLatLng` - React never re-renders on a frame; only the once-per-leg highlight goes through state.

## Letters with no train

Even letters have no subway line: H, I, K, O, P, T, U, V, X, Y. Rather than giving up on words containing them, those become walking detours to real places that start with that letter - a bar, cafe, park or landmark, pulled live from OpenStreetMap’s [Overpass API](https://overpass-api.de/) near wherever you are on the route:

```
nwr["amenity"~"^(bar|pub|cafe)$"]["name"](around:1000,lat,lng);
nwr["leisure"="park"]["name"](around:1000,lat,lng);
nwr["tourism"~"^(attraction|museum|gallery)$"]["name"](around:1000,lat,lng);
```

I filter the results by first letter, pick the nearest, and chain each detour from the previous stop. Overpass can be slow or rate-limited, so every request has a 7-second timeout and falls back to a small curated list of known NYC spots (High Line, Katz’s, Veselka…). The walk legs themselves get real on-street geometry from the [OSRM foot router](https://project-osrm.org/), again with a timeout and a straight-line fallback.

## The stack

-   **React + TypeScript + Vite, Leaflet** for the map, **Vitest** for tests (covering pure routing/graph/dictionary logic)
    
-   Static deploy to **Github Pages** via a GitHub Actions workflow that runs the tests, builds, and publishes on every push to main.
    
-   A couple of one-off Node scripts (using @resvg, installed and removed) render the favicon SVG into PNG PWA icons and a 1200x630 Open Graph share care so only the generated PNGs live in the repo.
    
-   Shareable `?word=FACE` deep links, save\_the-route-as-PNG (via `html-to-image`, which meant setting `crossOrigin` on the tile layers so the canvas isn’t tainted), copy-itinerary-as-text, recents and favorites in `localStorage`.
    

## What I’d do differently (and still might)

-   The transfer model assumes any two lines sharing a complex can always transfer, but service varies by time of day - the W, Z,a and B don’t run nights or weekends. A route isn’t always ridable at 2AM…
    
-   Doubled letters (the ZZ in JAZZ) can’t really be ridden twice - you can’t transfer a line to itself - so they collapse to one ride that’s labeled as spelling both. Honest, but part of me wants an out and back.
    
-   Per-word Open Graph preview images would need a server (or an edge function); on GitHub Pages the share card is generic so I use Save-as-PNG as a workaround.
    

All of this is [open source](https://github.com/andrewlidong/train-anagrams) and live at [https://andrewlidong.github.io/train-anagrams/](https://andrewlidong.github.io/train-anagrams/). Type WHATSUP, hit play, and see what happens.

Thanks for reading! Subscribe for free to receive new posts and support my work.
