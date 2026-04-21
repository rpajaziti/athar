# Roadmap

## North star

Teach **letter-precise** hifdh through testing — not just "do you know the surah?" but "do you know it to the letter, to the ḥaraka, to the ending?"

Build toward **Musābaqah mode** — a real Qurʾān-competition format where hufadh are tested on any ayah from any surah, including "continue from here," "what comes next," and head-to-head play.

---

## v1 — MVP: Juz ʿAmma core (current)

**Scope**: Last 10 surahs (105–114) + Al-Fātiḥa. Eleven short surahs, hand-curated data.

**Modes shipping**:
- **Foundations** — confusable letter drills, Names-of-Allah pairs
- **Easy** — word-bank fill-in-the-blank, order-only (no traps)
- **Medium** — mixed word + letter blanks with confusable distractors
- **Hard (Proofread)** — full ayat with blanks + pre-filled incorrect tokens; user catches and corrects
- **Expert (Construction)** — letter-by-letter build from a pool

**Features**:
- Interactive 4-step onboarding (Welcome → Easy → Medium → Hard demos)
- Landing page with trust disclaimer (see [`PEDAGOGY.md`](./PEDAGOGY.md))
- Heatmap results screen — every word tinted by accuracy
- localStorage persistence — streak, weak-spots, mastery per surah
- PWA installable on phones

**Ship checklist**:
- [ ] All 11 surahs have: Uthmani text, translation, confusables dictionary, Names-of-Allah tags
- [ ] All 5 modes work end-to-end for Al-Ikhlāṣ first, then rest of 11
- [ ] Deploy to Hetzner via Docker
- [ ] Feels premium — Amiri Quran typography, warm parchment aesthetic preserved from prototype

---

## v2 — Full Juz ʿAmma ✅ DONE

**Scope**: Every surah in Juz ʿAmma (78–114), 37 surahs.

**Shipped**:
- [x] "Today's drill" hero — picks weakest surah+tier from progress
- [x] Weak-spot review drill — `/review/weak`, surfaces sub-100% combos
- [x] Multi-ayat passages — `/drill/:surahId/passage`, 2–3 consecutive ayat with multi-blank fill
- [x] Word-order drag — `/drill/:surahId/wordorder`, tap words in recitation order
- [x] Mixed review of "what you know" — `/review/mixed` with tier filter + rasm toggle
- [x] **Audio cue** — `/drill/:surahId/audio`, everyayah.com MP3, 3 reciters (Ḥuṣarī / Mishary / Minshāwī)
- [x] **Last → Next** — transition round integrated into Mixed
- [x] **Scrambled ayat** — `/drill/:surahId/scramble`, tap-to-sequence
- [x] **Timed 60-second round** — `/review/mixed?timed=60` countdown sprint
- [x] **Rasm only** — ḥarakāt-stripped ayah display toggle in mixed
- [x] **Which surah?** — `/review/which-surah` reverse-lookup drill

**Skipped by desire for now**:
- Auto-generated confusables via Claude API — deferred. Data layer stays hand-curated in `src/data/distractors.ts` (Fātiḥa + 105–114 seeded).

---

## v3 — Full muṣḥaf access

**Scope**: Every surah in the Qurʾān, not just Juz ʿAmma.

**New**:
- Backend introduced: **Supabase** for cross-device sync, auth (email + Google)
- Juz / ḥizb / rubʿ browsing
- Mushaf-page layout — drill within the visual page structure
- Waqf / Ibtidāʾ mode — legal pause points
- Draw-the-letter input on Hard (finger tracing)
- Long-press to hear recitation (Easy/Medium chips)

**Content**:
- Import full Tanzil.net Hafs ʿan ʿĀṣim Uthmani corpus
- Multiple reciters (al-Husary, Mishary, Sudais, Minshawi) via everyayah.com

---

## v4 — Musābaqah: the competition engine

**Scope**: The endgame. Real-time competition + judge mode.

**Features**:
- **Continue-from-here** — given ayat 1–3, continue through ayat 4–N
- **What comes next / before** — free-form, any ayah
- **Locate** — paste any phrase, which surah + ayah?
- **Connect the ayat** — surah-to-surah transitions (end of X → start of Y)
- **Head-to-head multiplayer** — real-time via Supabase Realtime (WebSockets)
- **Judge mode** — one user reads, other judges, toggle muṣḥaf display
- **Tournament brackets** — schedule group competitions (masjid / madrasah use)
- **Marathon mode** — drill a full juz against the clock

**Scale concerns**:
- Audio verification via Whisper or Tarteel API (speech-to-text for self-recitation checking)
- Anti-cheat in competitions (tab focus detection, time tracking)

---

## v5+ — Beyond

- **Native iOS + Android via Capacitor** — wraps the same React code, zero UI rewrite
- Multiple qirāʾāt (Warsh, Qālūn, etc.) — not just Hafs
- Tafsīr-aware feedback via Claude API ("you mixed up X and Y, which means…")
- School/madrasah admin dashboard — teacher assigns drills, tracks class progress
- Spaced-repetition scheduler (SM-2 / FSRS) per weak-spot
- Ramadan mode — daily juz, tarawih timing
- Arabic UI translation (full localization)

---

## Intentionally excluded from v1

These are good ideas but **not MVP**. Don't let scope drift:
- User accounts / auth
- Leaderboards
- Real-time features
- Audio recording / STT
- Draw-the-letter (touch canvas)
- Long-press to hear
- Novel modes (audio cue, scrambled, etc.)
- **Word-order drag-and-drop** (v2 — see above)
- Full Qurʾān corpus
- Multiple reciters
- Claude API integration
- Capacitor mobile wrap

Each deserves its own design pass. Not now.
