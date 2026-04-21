// Rewrites src/data/distractors.ts so every Arabic string uses the same
// combining-mark ordering as the Quran.com source in src/data/quran.ts.
//
// Two fixes:
//   1. vowel (U+064B..U+0650) immediately followed by shadda (U+0651)
//      → shadda first, then vowel (non-canonical, but Quran.com's convention)
//   2. precomposed alif-with-madda (U+0622) → alif (U+0627) + standalone
//      madda (U+0653), matching the decomposed form in the muṣḥaf data.

import { readFileSync, writeFileSync } from 'node:fs'

const path = 'src/data/distractors.ts'
let src = readFileSync(path, 'utf8')

const before = src

src = src.replace(/([\u064B-\u064E\u064F\u0650])\u0651/g, '\u0651$1')
src = src.replace(/\u0622/g, '\u0627\u0653')

if (src === before) {
  console.log('no changes')
  process.exit(0)
}

writeFileSync(path, src)
console.log('normalized', path)
