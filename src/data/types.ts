export type RevelationPlace = 'makkah' | 'madinah'

export interface Word {
  text: string
  index: number
}

export interface Ayah {
  number: number
  text: string
  words: Word[]
  translation: string
}

export interface Surah {
  id: number
  nameSimple: string
  nameComplex: string
  nameArabic: string
  meaning: string
  revelationPlace: RevelationPlace
  revelationOrder: number
  versesCount: number
  bismillahPre: boolean
  ayat: Ayah[]
}

export interface LetterConfusable {
  id: string
  letters: string[]
  latin: string
  note: string
}

export interface NamePairTrap {
  id: string
  canonical: string
  confusable: string
  note: string
  appearsAt: string[]
}
