const BASE = 'https://everyayah.com/data'

export type Reciter = 'Husary_128kbps' | 'Alafasy_128kbps' | 'Minshawy_Murattal_128kbps'

export const DEFAULT_RECITER: Reciter = 'Husary_128kbps'

export function ayahAudioUrl(
  surahId: number,
  ayahNumber: number,
  reciter: Reciter = DEFAULT_RECITER,
): string {
  const s = String(surahId).padStart(3, '0')
  const a = String(ayahNumber).padStart(3, '0')
  return `${BASE}/${reciter}/${s}${a}.mp3`
}
