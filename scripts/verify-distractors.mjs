// Checks that every distractor target matches the Uthmani word at the given
// (surahId, ayahNumber, wordIndex) in src/data/quran.ts. Exits non-zero on any mismatch.

import { SURAH_BY_ID } from '../src/data/quran.ts'
import { DISTRACTORS } from '../src/data/distractors.ts'

let fail = 0
for (const d of DISTRACTORS) {
  const surah = SURAH_BY_ID.get(d.surahId)
  if (!surah) {
    console.error(`[FAIL] surah ${d.surahId} not found`)
    fail++
    continue
  }
  const ayah = surah.ayat.find((a) => a.number === d.ayahNumber)
  if (!ayah) {
    console.error(`[FAIL] ${d.surahId}:${d.ayahNumber} not found`)
    fail++
    continue
  }
  const actual = ayah.words[d.wordIndex]?.text
  if (!actual) {
    console.error(`[FAIL] ${d.surahId}:${d.ayahNumber}[${d.wordIndex}] — word index out of range (ayah has ${ayah.words.length} words)`)
    fail++
    continue
  }
  if (actual !== d.target) {
    console.error(`[FAIL] ${d.surahId}:${d.ayahNumber}[${d.wordIndex}]`)
    console.error(`       expected: ${d.target}`)
    console.error(`       actual:   ${actual}`)
    fail++
    continue
  }
  if (!d.options.includes(d.target)) {
    console.error(`[FAIL] ${d.surahId}:${d.ayahNumber}[${d.wordIndex}] — target missing from options`)
    fail++
    continue
  }
  console.log(`[ok]   ${d.surahId}:${d.ayahNumber}[${d.wordIndex}]  ${d.target}`)
}

if (fail > 0) {
  console.error(`\n${fail} distractor(s) do not match the muṣḥaf.`)
  process.exit(1)
}
console.log(`\nAll ${DISTRACTORS.length} distractors verified.`)
