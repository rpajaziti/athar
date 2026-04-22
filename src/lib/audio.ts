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

export function speechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

export function speakArabic(text: string, opts: { rate?: number } = {}): void {
  if (!speechSupported()) return
  const synth = window.speechSynthesis
  synth.cancel()
  const utter = new SpeechSynthesisUtterance(text)
  utter.lang = 'ar-SA'
  utter.rate = opts.rate ?? 0.85
  const voices = synth.getVoices()
  const arVoice = voices.find((v) => v.lang?.toLowerCase().startsWith('ar'))
  if (arVoice) utter.voice = arVoice
  synth.speak(utter)
}
