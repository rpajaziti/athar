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

## v3 — Depth & polish (in progress)

**Scope**: Make the current corpus (Juzʾ ʿAmma + Fātiḥa) exhaustively drillable, with listening and settings pulling their weight.

**Shipped**:
- [x] Tap-to-hear on every ayah card (Listen button, wired into all round components)
- [x] Juzʾ grouping on home page with collapsible sections
- [x] Continuous sūrah listen (`/listen/:surahId`) — auto-advance, scroll-follow, reciter switch, text/translation toggles
- [x] Continuous juzʾ listen (`/listen/juz/:juz`) — all ayat in a juzʾ back-to-back, grouped by sūrah
- [x] Draw-the-letter drill (`/drill/write`) — canvas with ghost trace + self-judge
- [x] Murājaʿah simulator (`/drill/:surahId/recite`) — reveal-then-self-judge, solid/shaky/missed
- [x] Endings drill (`/drill/:surahId/endings`) — fāṣila / rhyme-word match
- [x] Meaning-match review (`/review/meaning`) — Arabic → translation picker
- [x] Settings page (`/settings`) — default reciter, rasm-only default, audio autoplay, reset progress

**Skipped by desire for now** (per user: no DB/API/backend changes):
- Supabase backend (auth, cross-device sync)
- Full Tanzil Qurʾān corpus import (stays seeded on Juzʾ ʿAmma + Fātiḥa)
- Mushaf-page visual layout (604 pages, needs layout engine)
- Waqf / Ibtidāʾ pause-point overlay (no curated data)

---

## v4 — Musābaqah: the competition engine (in progress — frontend-only slice)

**Scope**: Real-competition drills. Backend-dependent items (Realtime multiplayer, tournaments) deferred.

**Shipped**:
- [x] **Continue-from-here** — `/drill/:surahId/continue`, chain through a whole sūrah from ayah 1
- [x] **Juzʾ endings sprint** — `/review/juz/:juz/endings`, fāṣila drill pooled across every sūrah in the juzʾ
- [x] **What comes next / before** — `/review/next[?dir=prev]`, picks the next/previous ayah for any prompt in the seeded corpus
- [x] **Locate** — `/review/locate`, middle-phrase → sūrah + ayah identification across the corpus
- [x] **Connect the ayat** — `/review/connect`, end of sūrah X → opener of sūrah X+1 picker
- [x] **Marathon mode** — `/review/mixed?juz=N&timed=300`, full-juzʾ mixed-round chain against the clock
- [x] **Judge mode (offline)** — `/judge/:surahId`, single-device solid/shaky/missed tap per ayah with optional hidden-mushaf mode

**Skipped by desire for now** (needs backend / API):
- Head-to-head multiplayer (Supabase Realtime)
- Tournament brackets (accounts, scheduling)
- Audio verification via Whisper / Tarteel (speech-to-text)
- Anti-cheat in competitions

---

## v5 — Supabase social (in progress)

**Phase 1 — auth + progress sync ✅ shipped**
- [x] Supabase project + RLS on `profiles`, `user_progress` (JSONB data blob)
- [x] Google OAuth + magic link (implicit flow — cross-device magic links work)
- [x] Local→cloud merge on first login, replace-on-login after that
- [x] Signout clears local progress + merge marker
- [x] Settings (reciter / rasm / autoplay / review tiers) ride inside the progress JSON — already synced

**Phase 2a — handles + friends (in progress)**
- [ ] Migration: `handle citext unique` on `profiles` + `friendships` table
- [ ] Friendship model `(requester_id, addressee_id, status)` with RLS so only the two parties can see the row
- [ ] Security-definer RPC `search_users(query)` returning only public fields (no profile enumeration)
- [ ] Handle picker banner on HomePage when signed-in user has no handle yet
- [ ] `/friends` page — Friends / Requests in / Sent out tabs; search by handle; accept / decline / remove
- [ ] Friends count chip on HomePage header

**Phase 2b — leaderboard (after 2a lands)**
- [ ] SQL view `friend_stats` deriving streak / drills_7d / accuracy_7d from `user_progress.data`
- [ ] `/leaderboard` page — weekly board of you + friends, sortable
- [ ] Leaderboard link on HomePage header

**Phase 3 — realtime Musābaqah (later, after 2b)**
- [ ] Challenge a friend → both get the same seeded rounds via Supabase Realtime
- [ ] Live score updates; winner by accuracy then speed
- [ ] Shared weak-spot review targeting a friend's worst sūrahs

**Deferred / maybe**
- Global leaderboard (moderation burden)
- Avatar upload (currently Google OAuth only)
- Profile editing / handle rename with cooldown
- Chat / comments
- Export-import progress JSON
- Group study rooms

---

## v6+ — Beyond

- **Native iOS + Android via Capacitor** — bootstrapped ✅ (`ios/` + `android/` projects, status bar + splash + back-button handlers, safe-area insets). Run `npm run mobile:ios` / `npm run mobile:android` to open in Xcode / Android Studio.
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
