import { SURAH_BY_ID } from '../src/data/quran.ts'
import { DISTRACTORS } from '../src/data/distractors.ts'

const hex = (s) => Array.from(s).map((c) => 'U+' + c.codePointAt(0).toString(16).padStart(4, '0')).join(' ')

for (const d of DISTRACTORS) {
  const actual = SURAH_BY_ID.get(d.surahId)?.ayat.find((a) => a.number === d.ayahNumber)?.words[d.wordIndex]?.text
  if (actual && actual !== d.target) {
    console.log(`${d.surahId}:${d.ayahNumber}[${d.wordIndex}]`)
    console.log(`  expected: ${hex(d.target)}`)
    console.log(`  actual:   ${hex(actual)}`)
  }
}
