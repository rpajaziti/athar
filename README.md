# Athar (أثر)

> *The trace that memorization leaves.*

Athar is a precision-testing companion for Qurʾān memorization (hifdh). Most apps ask if you *know* a surah — Athar asks how *precisely*: letter by letter, ḥaraka by ḥaraka, ending by ending.

## The lane

- **Foundations** — confusable letters (ص / س / ض), Names of Allah (ٱلرَّحْمَٰن vs ٱلرَّحِيم) — for beginners and refreshers
- **Easy · Flow** — fill whole-word blanks in context, test sequence and fluency
- **Medium · Disambiguation** — mixed word + letter blanks with *similar-looking* traps
- **Hard · Proofread** — full ayat shown with a mix of blanks and pre-filled *incorrect* tokens; spot and fix them
- **Expert · Construction** — build the word letter-by-letter from a pool
- **Master · Musābaqah** *(planned v4)* — continue-from-here, what-comes-next, head-to-head competition

See [`ROADMAP.md`](./ROADMAP.md) for the full vision, [`PEDAGOGY.md`](./PEDAGOGY.md) for the pedagogical model.

## Stack

- **Vite + React + TypeScript** — static SPA
- **Tailwind CSS v4** — design tokens via `@theme`
- **React Router v7** — client-side routing
- **Zustand + localStorage** — progress, streak, weak-spots (no backend in v1)
- **Fonts**: Amiri Quran (ayat), Plus Jakarta Sans (UI), Noto Naskh Arabic (Arabic UI chrome), JetBrains Mono (labels)

No backend, no paid APIs, no signup in v1. Everything runs in the browser.

## Quick start

```bash
npm install
npm run dev      # dev server at http://localhost:5173
npm run build    # production build to dist/
npm run preview  # serve the production build locally
```

## Project structure

```
src/
  components/   UI primitives (Screen, Button, Icon, MushafGrid…)
  pages/        Route components (landing, onboarding, test modes, results)
  data/         Qurʾān text, confusables, Names of Allah
  store/        Zustand stores (progress, settings)
  lib/          Utilities (cn, storage, etc.)
  router.tsx    Route definitions
  main.tsx      Entry point
```

## Docs

- [`ROADMAP.md`](./ROADMAP.md) — version milestones (v1 → v4 Musābaqah)
- [`DESIGN.md`](./DESIGN.md) — tokens, typography, component patterns
- [`PEDAGOGY.md`](./PEDAGOGY.md) — difficulty tiers, confusables theory, trust disclaimer
- [`DEPLOY.md`](./DEPLOY.md) — Docker + Hetzner deployment
