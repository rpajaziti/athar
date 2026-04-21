export interface DistractorSet {
  surahId: number
  ayahNumber: number
  wordIndex: number
  target: string
  options: string[]
  note: string
}

export const DISTRACTORS: DistractorSet[] = [
  // ──────────────────────────────────────────────────────────
  // Al-Fātiḥa (1)
  // ──────────────────────────────────────────────────────────
  {
    surahId: 1,
    ayahNumber: 2,
    wordIndex: 3,
    target: 'ٱلْعَـٰلَمِينَ',
    options: ['ٱلْعَـٰلَمِينَ', 'ٱلْعَـٰلِمِينَ', 'ٱلْعَـٰلَمُونَ'],
    note: 'ٱلْعَـٰلَمِينَ (the worlds) carries a fatḥa on lām. ٱلْعَـٰلِمِينَ with kasra means "the knowers" — completely different word.',
  },
  {
    surahId: 1,
    ayahNumber: 4,
    wordIndex: 0,
    target: 'مَـٰلِكِ',
    options: ['مَـٰلِكِ', 'مَلِكِ', 'مَـٰلِكَ'],
    note: 'Ḥafṣ recites مَـٰلِكِ (Owner) with the long ā. مَلِكِ (King) is a different qirāʾa — valid in ʿĀṣim from Shuʿba, not from Ḥafṣ.',
  },
  {
    surahId: 1,
    ayahNumber: 7,
    wordIndex: 5,
    target: 'ٱلْمَغْضُوبِ',
    options: ['ٱلْمَغْضُوبِ', 'ٱلْمَعْضُوبِ', 'ٱلْمَغْظُوبِ'],
    note: 'غ (dotted ʿayn, ghayn) vs ع (undotted) is the single dot that flips "angered upon" into a non-word. ض and ظ share the same body — only the dot-placement differs.',
  },

  // ──────────────────────────────────────────────────────────
  // Al-Fīl (105)
  // ──────────────────────────────────────────────────────────
  {
    surahId: 105,
    ayahNumber: 1,
    wordIndex: 5,
    target: 'بِأَصْحَـٰبِ',
    options: ['بِأَصْحَـٰبِ', 'بِأَسْحَـٰبِ', 'بِأَصْحَـٰبُ'],
    note: 'ص vs س — same body, different dot-count. بِ forces jarr (kasra ending), so بِأَصْحَـٰبُ with ḍamma is ungrammatical.',
  },
  {
    surahId: 105,
    ayahNumber: 4,
    wordIndex: 3,
    target: 'سِجِّيلٍ',
    options: ['سِجِّيلٍ', 'سِجِّينٍ', 'سِجِيلٍ'],
    note: 'سِجِّينٍ appears in sūrah 83 and refers to a register. Here it is سِجِّيلٍ — baked clay. The shadda on jīm is essential.',
  },

  // ──────────────────────────────────────────────────────────
  // Quraysh (106)
  // ──────────────────────────────────────────────────────────
  {
    surahId: 106,
    ayahNumber: 2,
    wordIndex: 2,
    target: 'ٱلشِّتَآءِ',
    options: ['ٱلشِّتَآءِ', 'ٱلسِّتَآءِ', 'ٱلشِّتَاءِ'],
    note: 'ش (three dots) vs س (no dots). The madda آ over the alif marks the lengthened vowel — without it the word shortens and the weight shifts.',
  },
  {
    surahId: 106,
    ayahNumber: 4,
    wordIndex: 3,
    target: 'جُوعٍ',
    options: ['جُوعٍ', 'حُوعٍ', 'جُوعِ'],
    note: 'ج and ح share the same body — ج has one dot inside the bowl. Tanwīn-kasra (ٍ) marks indefinite genitive after مِّن; without tanwīn the word would need a definite article.',
  },

  // ──────────────────────────────────────────────────────────
  // Al-Māʿūn (107)
  // ──────────────────────────────────────────────────────────
  {
    surahId: 107,
    ayahNumber: 2,
    wordIndex: 2,
    target: 'يَدُعُّ',
    options: ['يَدُعُّ', 'يَدَعُ', 'يَدْعُو'],
    note: 'يَدُعُّ (with shadda) means "drives away harshly". يَدَعُ means "leaves". يَدْعُو means "calls". Three different verbs share the same root — the shadda and vowels pick the meaning.',
  },
  {
    surahId: 107,
    ayahNumber: 3,
    wordIndex: 1,
    target: 'يَحُضُّ',
    options: ['يَحُضُّ', 'يَحُظُّ', 'يَحُصُّ'],
    note: 'ض, ظ, and ص share a similar footprint but diverge in articulation and meaning. يَحُضُّ is "urges on" — the ḍād is what keeps the word Qurʾānic.',
  },

  // ──────────────────────────────────────────────────────────
  // Al-Kawthar (108)
  // ──────────────────────────────────────────────────────────
  {
    surahId: 108,
    ayahNumber: 1,
    wordIndex: 2,
    target: 'ٱلْكَوْثَرَ',
    options: ['ٱلْكَوْثَرَ', 'ٱلْكَوْثَرِ', 'ٱلْكَوْسَرَ'],
    note: 'ث (three dots) vs س (no dots) — ٱلْكَوْسَرَ is not a word. The fatḥa ending marks manṣūb as the direct object of أَعْطَيْنَـٰكَ.',
  },
  {
    surahId: 108,
    ayahNumber: 3,
    wordIndex: 1,
    target: 'شَانِئَكَ',
    options: ['شَانِئَكَ', 'شَانِيَكَ', 'شَائِنَكَ'],
    note: 'The hamza sits on a nabra (ئ), not a yāʾ. شَائِنَكَ with the letters reshuffled gives a word from a different root — order of letters matters.',
  },

  // ──────────────────────────────────────────────────────────
  // Al-Kāfirūn (109)
  // ──────────────────────────────────────────────────────────
  {
    surahId: 109,
    ayahNumber: 1,
    wordIndex: 2,
    target: 'ٱلْكَـٰفِرُونَ',
    options: ['ٱلْكَـٰفِرُونَ', 'ٱلْكَـٰفِرِينَ', 'ٱلْكَـٰفِرُونِ'],
    note: 'Vocative after يَـٰٓأَيُّهَا takes rafʿ (ـُونَ), not naṣb (ـِينَ). ٱلْكَـٰفِرُونِ with kasra is ungrammatical.',
  },
  {
    surahId: 109,
    ayahNumber: 4,
    wordIndex: 4,
    target: 'عَبَدتُّمْ',
    options: ['عَبَدتُّمْ', 'عَبَدْتُمْ', 'تَعْبُدُونَ'],
    note: 'The Uthmani form shows the dāl assimilating into the tāʾ (shadda on tāʾ, no sukūn on dāl). تَعْبُدُونَ is the imperfect — same root, wrong tense.',
  },

  // ──────────────────────────────────────────────────────────
  // An-Naṣr (110)
  // ──────────────────────────────────────────────────────────
  {
    surahId: 110,
    ayahNumber: 1,
    wordIndex: 4,
    target: 'وَٱلْفَتْحُ',
    options: ['وَٱلْفَتْحُ', 'وَٱلْفَتْحَ', 'وَٱلْفَتْهُ'],
    note: 'Conjoined to نَصْرُ (rafʿ), so وَٱلْفَتْحُ matches the case. ح vs ه — bowl shape differs; ه has an open loop on top.',
  },
  {
    surahId: 110,
    ayahNumber: 3,
    wordIndex: 7,
    target: 'تَوَّابًۢا',
    options: ['تَوَّابًۢا', 'تَوَّابٌ', 'ثَوَّابًا'],
    note: 'Predicate of كَانَ takes naṣb (tanwīn-fatḥa). ث (three dots) vs ت (two) flips meaning — ثَوَّاب is "rewarder", not "accepter of repentance".',
  },

  // ──────────────────────────────────────────────────────────
  // Al-Masad (111)
  // ──────────────────────────────────────────────────────────
  {
    surahId: 111,
    ayahNumber: 1,
    wordIndex: 0,
    target: 'تَبَّتْ',
    options: ['تَبَّتْ', 'تَبَتْ', 'ثَبَّتْ'],
    note: 'تَبَّتْ (shadda on bāʾ) is "perished". ثَبَّتْ with ثَ is from a different root entirely — "established". The shadda is the pronouncement of the curse.',
  },
  {
    surahId: 111,
    ayahNumber: 4,
    wordIndex: 1,
    target: 'حَمَّالَةَ',
    options: ['حَمَّالَةَ', 'حَمَّالَةُ', 'خَمَّالَةَ'],
    note: 'Accusative (fatḥa) by the reading of naṣb on dhamm — "as one who carries". ح vs خ differ by a single dot above the bowl.',
  },
  {
    surahId: 111,
    ayahNumber: 5,
    wordIndex: 2,
    target: 'حَبْلٌ',
    options: ['حَبْلٌ', 'حَبْلٍ', 'خَبْلٌ'],
    note: 'Subject of the nominal sentence → rafʿ (tanwīn-ḍamma ٌ). خَبْل with خ means "confusion/madness" — a real word, wrong one.',
  },

  // ──────────────────────────────────────────────────────────
  // Al-Ikhlāṣ (112)  — original four
  // ──────────────────────────────────────────────────────────
  {
    surahId: 112,
    ayahNumber: 1,
    wordIndex: 3,
    target: 'أَحَدٌ',
    options: ['أَحَدٌ', 'أَحَدٍ', 'أَحَدُ'],
    note: 'The tanwīn-ḍamma (dual-ḍamma on dāl, ــٌ) marks the nominative with indefinite ending — not kasra and not a bare ḍamma.',
  },
  {
    surahId: 112,
    ayahNumber: 2,
    wordIndex: 1,
    target: 'ٱلصَّمَدُ',
    options: ['ٱلصَّمَدُ', 'ٱلسَّمَدُ', 'ٱلضَّمَدُ'],
    note: 'ص / س / ض share the same body. Only the dots (or their absence) differ — and only ٱلصَّمَدُ is a Name of Allah.',
  },
  {
    surahId: 112,
    ayahNumber: 3,
    wordIndex: 3,
    target: 'يُولَدْ',
    options: ['يُولَدْ', 'يَلِدْ', 'يَوْلَدْ'],
    note: 'يُولَدْ is passive — "is [not] born". يَلِدْ (active "begets") appears earlier in the same ayah; the surah contrasts the two.',
  },
  {
    surahId: 112,
    ayahNumber: 4,
    wordIndex: 3,
    target: 'كُفُوًا',
    options: ['كُفُوًا', 'كَفُوًا', 'قُفُوًا'],
    note: 'The kāf carries a ḍamma, not a fatḥa — and it is a kāf (ك), not a qāf (ق). The word means "comparable, equivalent".',
  },

  // ──────────────────────────────────────────────────────────
  // Al-Falaq (113)
  // ──────────────────────────────────────────────────────────
  {
    surahId: 113,
    ayahNumber: 1,
    wordIndex: 3,
    target: 'ٱلْفَلَقِ',
    options: ['ٱلْفَلَقِ', 'ٱلْخَلْقِ', 'ٱلْفَلَكِ'],
    note: 'ٱلْفَلَقِ is "the daybreak" — the crack of dawn. ٱلْخَلْقِ is "creation"; ٱلْفَلَكِ is "the orbit". All three are Qurʾānic — only one opens this sūrah.',
  },
  {
    surahId: 113,
    ayahNumber: 3,
    wordIndex: 2,
    target: 'غَاسِقٍ',
    options: ['غَاسِقٍ', 'عَاسِقٍ', 'غَاشِقٍ'],
    note: 'غ (dotted) vs ع. س (undotted) vs ش (three dots). Two single-dot flips, both plausible to a tired ḥāfiẓ — only غَاسِقٍ is the muṣḥaf form.',
  },
  {
    surahId: 113,
    ayahNumber: 5,
    wordIndex: 2,
    target: 'حَاسِدٍ',
    options: ['حَاسِدٍ', 'خَاسِدٍ', 'حَاشِدٍ'],
    note: 'ح vs خ (one dot). س vs ش (three dots). The same phonetic root drift that traps the reciter in ayah 3 resurfaces here.',
  },

  // ──────────────────────────────────────────────────────────
  // An-Nās (114)
  // ──────────────────────────────────────────────────────────
  {
    surahId: 114,
    ayahNumber: 2,
    wordIndex: 0,
    target: 'مَلِكِ',
    options: ['مَلِكِ', 'مَـٰلِكِ', 'مَلِكُ'],
    note: 'مَلِكِ (King) — short, no long ā. مَـٰلِكِ (Owner) appears in Sūrah al-Fātiḥa. They share the root but not the scan — crossing them is a classic ḥāfiẓ slip.',
  },
  {
    surahId: 114,
    ayahNumber: 3,
    wordIndex: 0,
    target: 'إِلَـٰهِ',
    options: ['إِلَـٰهِ', 'إِلَـٰهُ', 'ٱللَّهِ'],
    note: 'Genitive (kasra) as the next term in the chain of rabb → malik → ilāh. ٱللَّهِ is a Name, إِلَـٰهِ is the common noun "god/deity" — both grammatical here, only one is in the muṣḥaf.',
  },
  {
    surahId: 114,
    ayahNumber: 4,
    wordIndex: 3,
    target: 'ٱلْخَنَّاسِ',
    options: ['ٱلْخَنَّاسِ', 'ٱلْحَنَّاسِ', 'ٱلْخَنَّاشِ'],
    note: 'خ (one dot above) vs ح (no dot). س (smooth) vs ش (three dots). "The one who retreats" — خ and س both have to land right.',
  },
]

export function distractorsFor(surahId: number): DistractorSet[] {
  return DISTRACTORS.filter((d) => d.surahId === surahId)
}

export function hasMediumData(surahId: number): boolean {
  return DISTRACTORS.some((d) => d.surahId === surahId)
}
