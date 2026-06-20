# dateee

## A little single-page site for asking someone on a date

dateee is a four-step invitation, built as a single static file with no framework, no build step, and no backend.

### Technologies Used
- HTML
- Vanilla JavaScript
- Web Audio API

### The Four Steps
1. **a date?** — a yes / no question, except the "no" button eases away from your cursor so it can be chased but never clicked.
2. **when?** — quick chips for the next few days, or a free date + time picker.
3. **the plan?** — a curated list of date ideas (walks, climbing, dinners around NYC, Metrograph, a show, dancing, surprise me, etc.), each with its own natural time of day.
4. **it's a date** — a summary plus a prefilled Google Calendar link, a copy-link button, and a downloadable `.ics`.

### Little Extras
- A soft synthesized chime and a haptic buzz on "yes".
- Falling ASCII confetti.
- A rust heart favicon and an Open Graph preview card so the link unfurls nicely when shared.
- Personalize the headline per person with a query param, e.g. `?to=alex` renders "alex, a date?".

### Development Process
Everything — markup, styles, and logic — lives in `index.html`. Vanilla JS drives the step flow, the fleeing button (bounded so it never leaves the screen), the calendar link and `.ics` generation, and the Web Audio chime. Type is Fraunces (display) and Newsreader (body) with JetBrains Mono for small labels. Hosting is GitHub Pages served from `main` at the repo root, so any push redeploys in about a minute.

### Live Demo
See it at [andrewlidong.github.io/dateee](https://andrewlidong.github.io/dateee/).

### GitHub Repository
For more details and to view the source code, visit the [GitHub repository](https://github.com/andrewlidong/dateee).
