# Pedagogical model

## The thesis

Most Qurʾān memorization apps ask: *"Do you know this surah?"*
Athar asks: *"Do you know it **precisely** — to the letter, to the ḥaraka, to the ending?"*

This is the gap a real hafidh knows well. You can recite a surah "fluently" but swap a ṣād for a sīn, miss a shadda, or substitute ٱلرَّحْمَٰن for ٱلرَّحِيم. That isn't hifdh — that's memory of the *shape*, not the text.

Athar trains the precision layer. The classical term is **ḍabṭ** (ضبط) — firmness and accuracy — distinct from *ḥifẓ* (retention) itself.

## Difficulty tiers

### Foundations
**Audience**: beginners, non-hufadh, and hufadh refreshing letter precision.

**Tests**:
- **Confusable letters** — pairs/triads that people routinely mix:
  - ص / س / ث (ṣād, sīn, thāʾ)
  - ض / ظ / ذ / ز (ḍād, ẓāʾ, dhāl, zāy)
  - ح / ه / ة (ḥāʾ, hāʾ, tāʾ marbūṭa)
  - ت / ط (tāʾ, ṭāʾ)
  - ق / ك (qāf, kāf)
  - د / ض (dāl, ḍād)
  - ر / ز (rāʾ, zāy)
- **Names of Allah** — paired names where order matters:
  - ٱلرَّحْمَٰن vs ٱلرَّحِيم (which comes first where?)
  - ٱلْمَلِك vs ٱلْمَالِك (Fātiḥa has ٱلْمَالِكِ, An-Nās has ٱلْمَلِكِ)
  - ٱلْعَزِيزُ ٱلْحَكِيمُ / ٱلسَّمِيعُ ٱلْبَصِيرُ / ٱلْعَلِيمُ ٱلْحَكِيمُ — paired names, order-sensitive
  - ٱلْغَفُورُ ٱلرَّحِيمُ vs ٱلرَّحْمَٰنُ ٱلرَّحِيمُ

**Format**: flashcard, multiple-choice, optional audio.

### Easy · Flow
**Audience**: early hufadh, or anyone new to a surah.

**Tests**: sequence and fluency. Fill whole-word blanks from a bank. **No trap distractors** — the bank contains exactly the correct words, shuffled.

**Why this is separate from Medium**: warm-up. Builds the flow of the surah without overwhelming with precision traps.

### Medium · Disambiguation
**Audience**: hufadh drilling precision.

**Tests**: mixed word + letter blanks with **confusable distractors**.

Example (word-level):
- Ayah: ٱهْدِنَا ___ ٱلْمُسْتَقِيمَ
- Options: **ٱلصِّرَٰطَ**, ٱلسِّرَٰطَ, ٱلضِّرَٰطَ

Example (letter-level):
- Word: ٱلْمَغْ__وبِ
- Options: ضُ (correct), ظُ, ذُ, ضَ (wrong ḥaraka)

All letter options carry their ḥaraka — we test letter AND vowel together, as they appear in the muṣḥaf.

### Hard · Proofread
**Audience**: serious hufadh testing final-mile precision.

**Format** (the user's own idea — the pedagogical heart of the app):

Display the full ayah(s) with a mix of:
1. **Empty blanks** — word, single letter, or ḥaraka
2. **Pre-filled correct tokens** — these are right, leave them
3. **Pre-filled *incorrect* tokens** — these look plausible but are wrong (confusables). Spot them and fix.

User action: scan the displayed ayah, tap any "suspect" token, confirm or correct. They don't know in advance which tokens are tampered — only that some are.

**Why this is *the* precision test**: it mirrors what happens during real recitation — the mind sometimes substitutes the wrong letter, and the hafidh must *catch it mid-flight*. No other app tests this self-monitoring skill.

**Parameters**:
- Density: 10% / 30% / 50% of tokens tampered
- Time pressure toggle
- No-reveal mode: you don't know which tokens are wrong until you submit

### Expert · Construction
**Audience**: hardcore precision-obsessed hufadh.

**Tests**: letter-by-letter build of a single word from a scrambled pool. Ported from the prototype's original "hard" mode.

Kept as an **optional** tier, not mandatory — it's an artificial puzzle, not how hifdh actually works. But some users will love it.

### Master · Musābaqah *(v4)*
**Audience**: finished hufadh.

**Tests**: the real Qurʾān-competition format.
- Continue-from-here
- What comes next / before
- Locate
- Head-to-head

See [`ROADMAP.md`](./ROADMAP.md) v4 for details.

---

## Confusables dictionary

The **heart of the content**. Per surah, we maintain:

```ts
type Confusables = {
  [wordInAyah: string]: string[]  // array of near-spelling alternatives
}

// Example:
{
  "ٱلصِّرَٰطَ":    ["ٱلسِّرَٰطَ", "ٱلضِّرَٰطَ"],
  "ٱلضَّآلِّينَ": ["ٱلظَّآلِّينَ", "ٱلذَّآلِّينَ"],
  "ٱلرَّحْمَٰنِ":  ["ٱلرَّحِيمِ", "ٱلرَّحَمَٰنِ"],
}
```

In v1 this is hand-curated for the 11 Juz ʿAmma core surahs. v2 onward, Claude API generates per-word confusables (once we have revenue).

---

## Trust disclaimer (non-negotiable)

Athar deliberately shows **incorrect** letters, ḥarakāt, and words as test traps. This is spiritually sensitive — a user could internalize a wrong form of the Qurʾān if we're sloppy. **Three guardrails**:

1. **Every correct answer is revealed** — no question closes without showing the verified correct text.
2. **Source transparency** — all Qurʾānic text sourced from Tanzil.net Ḥafṣ ʿan ʿĀṣim Uthmani script, verified against King Saud University's muṣḥaf.
3. **Explicit disclaimer** — landing page, onboarding, and footer link make clear: incorrect forms shown are *only* traps. Trust the muṣḥaf over Athar.

### Disclaimer copy (landing page, onboarding, footer)

> **A note on the "wrong" answers you'll see.**
> Athar sometimes shows incorrect letters, vowels, or words — but only as traps, to train your eye. Every Qurʾānic text here comes from the verified Ḥafṣ ʿan ʿĀṣim Uthmani muṣḥaf (Tanzil / King Saud University). The correct answer is always revealed. If anything looks uncertain, trust your muṣḥaf over this app.

Revise copy with ʿulamāʾ review before public launch.

---

## No lives, no shame

One rule we never break: **a mistake never ends a session**. Mistakes are *captured* — they become weak-spot cards that resurface later. No "try again" pop-ups, no health bars, no red game-over screens.

The emotional tone is poetic and patient, not punishing. Hifdh is a lifelong act of devotion; the app reflects that.
