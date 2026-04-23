import { supabase } from './supabase'

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
  totalQuestions: number
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
    totalQuestions: 0,
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
  schedulePush(data)
}

let pushTimer: number | null = null
let lastPushed: string | null = null
function schedulePush(data: ProgressData): void {
  if (!supabase) return
  if (typeof window === 'undefined') return
  if (pushTimer !== null) window.clearTimeout(pushTimer)
  pushTimer = window.setTimeout(() => {
    pushTimer = null
    void pushNow(data)
  }, 1200)
}

async function logAttempt(input: {
  tier: string
  surahId?: number
  correct: number
  total: number
}): Promise<void> {
  if (!supabase) return
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('attempts').insert({
      user_id: user.id,
      tier: input.tier,
      surah_id: input.surahId ?? null,
      correct: input.correct,
      total: input.total,
    })
  } catch {
    /* best-effort */
  }
}

async function pushNow(data: ProgressData): Promise<void> {
  if (!supabase) return
  const serialized = JSON.stringify(data)
  if (serialized === lastPushed) return
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return
  const { error } = await supabase
    .from('user_progress')
    .upsert(
      { user_id: user.id, data, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' },
    )
  if (!error) lastPushed = serialized
}

function mergeProgress(cloud: ProgressData, local: ProgressData): ProgressData {
  const out: ProgressData = { ...cloud }
  out.streak = Math.max(cloud.streak, local.streak)
  const cloudDay = cloud.lastActiveDay ?? ''
  const localDay = local.lastActiveDay ?? ''
  out.lastActiveDay = cloudDay >= localDay ? cloud.lastActiveDay : local.lastActiveDay
  out.totalAttempts = Math.max(cloud.totalAttempts, local.totalAttempts)
  out.totalCorrect = Math.max(cloud.totalCorrect, local.totalCorrect)
  out.totalQuestions = Math.max(cloud.totalQuestions ?? 0, local.totalQuestions ?? 0)

  const surahIds = new Set([
    ...Object.keys(cloud.surahs ?? {}),
    ...Object.keys(local.surahs ?? {}),
  ])
  const mergedSurahs: Record<string, SurahRecord> = {}
  const tiers: ReviewTier[] = ['easy', 'medium', 'hard', 'expert']
  for (const id of surahIds) {
    const c = cloud.surahs[id] ?? {}
    const l = local.surahs[id] ?? {}
    const rec: SurahRecord = {}
    for (const t of tiers) {
      rec[t] = mergeTierRecord(c[t], l[t])
    }
    mergedSurahs[id] = stripUndefined(rec)
  }
  out.surahs = mergedSurahs
  out.foundations = mergeTierRecord(cloud.foundations, local.foundations)

  out.known = Array.from(new Set([...(cloud.known ?? []), ...(local.known ?? [])])).sort(
    (a, b) => a - b,
  )
  out.reviewTiers =
    cloud.reviewTiers && cloud.reviewTiers.length > 0 ? cloud.reviewTiers : local.reviewTiers
  out.rasmOnly = cloud.rasmOnly || local.rasmOnly
  out.reciter = cloud.reciter ?? local.reciter
  out.autoplay = cloud.autoplay ?? local.autoplay

  const bookmarkKey = (b: Bookmark) => `${b.surahId}:${b.ayahNumber}`
  const bookmarkMap = new Map<string, Bookmark>()
  for (const b of [...(cloud.bookmarks ?? []), ...(local.bookmarks ?? [])]) {
    const k = bookmarkKey(b)
    const existing = bookmarkMap.get(k)
    if (!existing || b.addedAt < existing.addedAt) bookmarkMap.set(k, b)
  }
  out.bookmarks = Array.from(bookmarkMap.values()).sort((a, b) => b.addedAt - a.addedAt)

  return out
}

function mergeTierRecord(
  a: TierRecord | undefined,
  b: TierRecord | undefined,
): TierRecord | undefined {
  if (!a) return b
  if (!b) return a
  return {
    attempts: Math.max(a.attempts, b.attempts),
    bestScore: Math.max(a.bestScore, b.bestScore),
    lastScore: a.lastAt >= b.lastAt ? a.lastScore : b.lastScore,
    lastAt: Math.max(a.lastAt, b.lastAt),
  }
}

function stripUndefined(rec: SurahRecord): SurahRecord {
  const out: SurahRecord = {}
  if (rec.easy) out.easy = rec.easy
  if (rec.medium) out.medium = rec.medium
  if (rec.hard) out.hard = rec.hard
  if (rec.expert) out.expert = rec.expert
  return out
}

export async function syncOnLogin(userId: string): Promise<void> {
  if (!supabase) return
  if (typeof window === 'undefined') return
  const mergeKey = `athar:merged:${userId}`
  const alreadyMerged = window.localStorage.getItem(mergeKey)

  const { data, error } = await supabase
    .from('user_progress')
    .select('data')
    .eq('user_id', userId)
    .maybeSingle()
  if (error) return

  const cloud = (data?.data ?? null) as ProgressData | null
  const local = read()

  if (!alreadyMerged && cloud) {
    const merged = mergeProgress(cloud, local)
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(merged))
    lastPushed = null
    await pushNow(merged)
    window.localStorage.setItem(mergeKey, '1')
  } else if (cloud) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cloud))
    lastPushed = JSON.stringify(cloud)
  } else {
    lastPushed = null
    await pushNow(local)
    window.localStorage.setItem(mergeKey, '1')
  }
}

export function clearSyncMarker(userId: string): void {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(`athar:merged:${userId}`)
}

export function clearLocalOnSignOut(userId: string | null): void {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(STORAGE_KEY)
  if (userId) window.localStorage.removeItem(`athar:merged:${userId}`)
  lastPushed = null
  if (pushTimer !== null) {
    window.clearTimeout(pushTimer)
    pushTimer = null
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
  data.totalQuestions += input.total
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
  void logAttempt({
    tier: input.tier,
    surahId: input.surahId,
    correct: input.correct,
    total: input.total,
  })
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
  data.totalQuestions += total
  updateStreak(data)
  write(data)
  void logAttempt({ tier: 'mixed', correct, total })
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
