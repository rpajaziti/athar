const HARAKAT_RE = /[\u064B-\u0652\u0670\u06D6-\u06ED\u08D4-\u08E1\u08E3-\u08FF]/g

export function stripHarakat(text: string): string {
  return text.replace(HARAKAT_RE, '')
}
