export type Tier = 'easy' | 'medium' | 'hard' | 'expert' | 'foundations'

export interface TierRecord {
  attempts: number
  bestScore: number
  lastScore: number
  lastAt: number
}

export interface SurahRecord {
  easy?: TierRecord
  medium?: TierRecord
  hard?: TierRecord
  expert?: TierRecord
}

export type ReviewTier = 'easy' | 'medium' | 'hard' | 'expert'

export type ReciterPref = 'Husary_128kbps' | 'Alafasy_128kbps' | 'Minshawy_Murattal_128kbps'

export interface Bookmark {
  surahId: number
  ayahNumber: number
  addedAt: number
}

export interface ProgressData {
  version: 1
  streak: number
  lastActiveDay: string | null
  totalCorrect: number
  totalAttempts: number
  surahs: Record<string, SurahRecord>
  foundations?: TierRecord
  known: number[]
  reviewTiers: ReviewTier[]
  rasmOnly: boolean
  reciter: ReciterPref
  autoplay: boolean
  bookmarks: Bookmark[]
}

const DEFAULT_REVIEW_TIERS: ReviewTier[] = ['easy', 'medium', 'hard', 'expert']

const STORAGE_KEY = 'athar:progress:v1'

function emptyData(): ProgressData {
  return {
    version: 1,
    streak: 0,
    lastActiveDay: null,
    totalCorrect: 0,
    totalAttempts: 0,
    surahs: {},
    known: [],
    reviewTiers: [...DEFAULT_REVIEW_TIERS],
    rasmOnly: false,
    reciter: 'Husary_128kbps',
    autoplay: true,
    bookmarks: [],
  }
}

function todayKey(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function daysBetween(a: string, b: string): number {
  const pa = new Date(a + 'T00:00:00').getTime()
  const pb = new Date(b + 'T00:00:00').getTime()
  return Math.round((pb - pa) / 86400000)
}

function read(): ProgressData {
  if (typeof window === 'undefined') return emptyData()
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyData()
    const parsed = JSON.parse(raw) as Partial<ProgressData>
    if (parsed.version !== 1) return emptyData()
    return {
      ...emptyData(),
      ...parsed,
      known: parsed.known ?? [],
      reviewTiers:
        parsed.reviewTiers && parsed.reviewTiers.length > 0
          ? parsed.reviewTiers
          : [...DEFAULT_REVIEW_TIERS],
      rasmOnly: parsed.rasmOnly ?? false,
      reciter: parsed.reciter ?? 'Husary_128kbps',
      autoplay: parsed.autoplay ?? true,
      bookmarks: parsed.bookmarks ?? [],
    }
  } catch {
    return emptyData()
  }
}

function write(data: ProgressData): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    /* quota or private mode — silently ignore */
  }
}

function updateStreak(data: ProgressData): void {
  const today = todayKey()
  if (data.lastActiveDay === today) return
  if (data.lastActiveDay === null) {
    data.streak = 1
  } else {
    const gap = daysBetween(data.lastActiveDay, today)
    data.streak = gap === 1 ? data.streak + 1 : 1
  }
  data.lastActiveDay = today
}

function mergeTier(prev: TierRecord | undefined, score: number): TierRecord {
  return {
    attempts: (prev?.attempts ?? 0) + 1,
    bestScore: Math.max(prev?.bestScore ?? 0, score),
    lastScore: score,
    lastAt: Date.now(),
  }
}

export interface AttemptInput {
  tier: Tier
  surahId?: number
  correct: number
  total: number
}

export function recordAttempt(input: AttemptInput): ProgressData {
  const data = read()
  const score = input.total > 0 ? Math.round((input.correct / input.total) * 100) : 0

  data.totalAttempts += 1
  data.totalCorrect += input.correct
  updateStreak(data)

  if (input.tier === 'foundations') {
    data.foundations = mergeTier(data.foundations, score)
  } else if (input.surahId !== undefined) {
    const key = String(input.surahId)
    const entry = data.surahs[key] ?? {}
    entry[input.tier] = mergeTier(entry[input.tier], score)
    data.surahs[key] = entry
  }

  write(data)
  return data
}

export function getProgress(): ProgressData {
  const data = read()
  if (data.lastActiveDay) {
    const gap = daysBetween(data.lastActiveDay, todayKey())
    if (gap > 1 && data.streak > 0) {
      data.streak = 0
    }
  }
  return data
}

export function getSurahMastery(surahId: number): SurahRecord {
  return getProgress().surahs[String(surahId)] ?? {}
}

export function resetProgress(): void {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(STORAGE_KEY)
}

export function recordMixedAttempt(correct: number, total: number): ProgressData {
  const data = read()
  data.totalAttempts += 1
  data.totalCorrect += correct
  void total
  updateStreak(data)
  write(data)
  return data
}

export function getKnown(): number[] {
  return read().known
}

export function setKnown(surahIds: number[]): void {
  const data = read()
  data.known = Array.from(new Set(surahIds)).sort((a, b) => a - b)
  write(data)
}

export function getReviewTiers(): ReviewTier[] {
  return read().reviewTiers
}

export function setReviewTiers(tiers: ReviewTier[]): void {
  const data = read()
  data.reviewTiers = tiers.length > 0 ? tiers : [...DEFAULT_REVIEW_TIERS]
  write(data)
}

export function getRasmOnly(): boolean {
  return read().rasmOnly
}

export function setRasmOnly(v: boolean): void {
  const data = read()
  data.rasmOnly = v
  write(data)
}

export function getReciter(): ReciterPref {
  return read().reciter
}

export function setReciter(r: ReciterPref): void {
  const data = read()
  data.reciter = r
  write(data)
}

export function getAutoplay(): boolean {
  return read().autoplay
}

export function setAutoplay(v: boolean): void {
  const data = read()
  data.autoplay = v
  write(data)
}

export function getBookmarks(): Bookmark[] {
  return read().bookmarks.slice().sort((a, b) => b.addedAt - a.addedAt)
}

export function isBookmarked(surahId: number, ayahNumber: number): boolean {
  return read().bookmarks.some(
    (b) => b.surahId === surahId && b.ayahNumber === ayahNumber,
  )
}

export function toggleBookmark(surahId: number, ayahNumber: number): boolean {
  const data = read()
  const existing = data.bookmarks.findIndex(
    (b) => b.surahId === surahId && b.ayahNumber === ayahNumber,
  )
  if (existing >= 0) {
    data.bookmarks.splice(existing, 1)
    write(data)
    return false
  }
  data.bookmarks.push({ surahId, ayahNumber, addedAt: Date.now() })
  write(data)
  return true
}

export interface WeakSlot {
  surahId: number
  tier: ReviewTier
  bestScore: number
  attempts: number
}

export function getWeakSlots(): WeakSlot[] {
  const data = read()
  const tiers: ReviewTier[] = ['easy', 'medium', 'hard', 'expert']
  const out: WeakSlot[] = []
  for (const [sid, rec] of Object.entries(data.surahs)) {
    const surahId = Number(sid)
    for (const tier of tiers) {
      const t = rec[tier]
      if (!t) continue
      if (t.bestScore < 100) {
        out.push({ surahId, tier, bestScore: t.bestScore, attempts: t.attempts })
      }
    }
  }
  return out.sort((a, b) => a.bestScore - b.bestScore)
}

export interface TodaysDrill {
  surahId: number
  tier: ReviewTier
  bestScore: number | null
}

export function pickTodaysDrill(): TodaysDrill | null {
  const weak = getWeakSlots()
  if (weak.length > 0) {
    const top = weak[0]
    return { surahId: top.surahId, tier: top.tier, bestScore: top.bestScore }
  }
  return null
}
