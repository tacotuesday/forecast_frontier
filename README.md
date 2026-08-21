# Forecast Frontier

Forecast Frontier is a low-poly browser game for learning time-series analysis
and forecasting. Its 13 missions follow the practical progression of
[Forecasting: Principles and Practice, the Pythonic Way](https://otexts.com/fpppy/),
from exploratory graphics and decomposition through ARIMA, neural networks, and
foundation models.

After every mastered mission, the game explains in two focused paragraphs why
the selected settings fit that series, how to transfer the reasoning to a new
dataset, and which exact FPPPy sections corroborate the lesson.

Before tuning begins, every mission also includes a two-paragraph “chapter in
90 seconds” briefing. It summarizes the chapter’s wider concepts and connects
them to the controls so players can make an informed first forecast.

The game is a standalone static React application. It has no database, API,
account system, server-side runtime, or hosting-platform dependency.

## Requirements

- Node.js 22.13 or newer
- npm

## Run locally

```bash
npm install
npm run dev
```

Open the local URL printed in the terminal.

## Build for deployment

```bash
npm install
npm test
npm run build
```

The deployable site will be in `dist/`. Upload the contents of that folder to
any static web host.

## Common hosting settings

| Provider | Build command | Publish directory |
| --- | --- | --- |
| Netlify | `npm run build` | `dist` |
| Vercel | `npm run build` | `dist` |
| Cloudflare Pages | `npm run build` | `dist` |
| GitHub Pages | `npm run build` | `dist` |
| AWS S3 / conventional server | Build locally, then upload | contents of `dist` |

The Vite configuration uses relative asset paths, so the build can be hosted at
a domain root or inside a subdirectory.

For correct social-preview images after choosing a domain, replace the relative
`og:image` and `twitter:image` values in `index.html` with the final absolute
URL to `og.png`.

## Project structure

```text
src/App.tsx          Game interface and interactions
src/game-model.ts    Curriculum, simulations, scoring, and mastery calibration
src/styles.css       Low-poly visual system and responsive layout
src/main.tsx         Browser entry point
public/              Favicon and social-preview artwork
tests/               Curriculum and scoring-gate checks
```

## Scoring model

Each mission evaluates a configuration on eight hidden holdout observations.
Players see:

- RMSE on the holdout set;
- improvement relative to seasonal naïve; and
- a model score calibrated against the best setting available in that mission.

The mastery gate is 80/100. The automated tests enumerate every available
setting to verify that every mission has an achievable passing score, and also
check that all 13 missions include a substantive chapter briefing and cited
mastery debrief.

## Content note

The game is an independent educational simulation inspired by the structure of
the freely available FPPPy textbook. It is not affiliated with or endorsed by
the textbook authors or publishers, and its simulated models should not be used
as production forecasts.
