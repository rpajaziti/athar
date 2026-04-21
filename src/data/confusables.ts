import type { LetterConfusable, NamePairTrap } from './types'

export const LETTER_CONFUSABLES: LetterConfusable[] = [
  {
    id: 'sad-sin-tha',
    letters: ['ص', 'س', 'ث'],
    latin: 'ṣād · sīn · thāʾ',
    note: 'ص is emphatic, س is plain, ث is a soft th. The shape of ص has a tail; سـ has three teeth; ث has three dots above.',
  },
  {
    id: 'dad-dha-dhal-zay',
    letters: ['ض', 'ظ', 'ذ', 'ز'],
    latin: 'ḍād · ẓāʾ · dhāl · zāy',
    note: 'ض and ظ are emphatic; ذ and ز are not. Dots distinguish ذ (one dot) from د (none); ز (one dot above rāʾ) from ر.',
  },
  {
    id: 'ha-haa-ta-marbuta',
    letters: ['ح', 'ه', 'ة'],
    latin: 'ḥāʾ · hāʾ · tāʾ marbūṭa',
    note: 'ح is a pharyngeal; ه is a soft h; ة is a feminine-ending form of t that reads as h in waqf.',
  },
  {
    id: 'ta-ta',
    letters: ['ت', 'ط'],
    latin: 'tāʾ · ṭāʾ',
    note: 'ط is emphatic with a distinctive vertical stroke. ت has two dots above.',
  },
  {
    id: 'qaf-kaf',
    letters: ['ق', 'ك'],
    latin: 'qāf · kāf',
    note: 'ق is a uvular stop with two dots above; ك is velar.',
  },
  {
    id: 'dal-dad',
    letters: ['د', 'ض'],
    latin: 'dāl · ḍād',
    note: 'ض is emphatic and has a dot; د has neither.',
  },
  {
    id: 'ra-zay',
    letters: ['ر', 'ز'],
    latin: 'rāʾ · zāy',
    note: 'One dot above turns ر into ز.',
  },
  {
    id: 'ain-ghain',
    letters: ['ع', 'غ'],
    latin: 'ʿayn · ghayn',
    note: 'A dot above ع gives غ. ʿAyn is pharyngeal, ghayn is velar-fricative.',
  },
  {
    id: 'nun-ta-tha-ya',
    letters: ['ن', 'ت', 'ث', 'ي'],
    latin: 'nūn · tāʾ · thāʾ · yāʾ',
    note: 'In medial form these look near-identical; only the dots differ: ن (one above), ت (two above), ث (three above), ي (two below).',
  },
  {
    id: 'ba-ta-tha-nun-ya',
    letters: ['ب', 'ت', 'ث', 'ن', 'ي'],
    latin: 'bāʾ · tāʾ · thāʾ · nūn · yāʾ',
    note: 'Initial-form confusable family. Dot position and count are the only distinguishers.',
  },
  {
    id: 'ha-variants',
    letters: ['ج', 'ح', 'خ'],
    latin: 'jīm · ḥāʾ · khāʾ',
    note: 'Same skeleton — dot below (ج), no dot (ح), dot above (خ).',
  },
]

export const NAME_PAIR_TRAPS: NamePairTrap[] = [
  {
    id: 'malik-maalik',
    canonical: 'مَـٰلِكِ',
    confusable: 'مَلِكِ',
    note: 'Al-Fātiḥa has مَـٰلِكِ يَوْمِ ٱلدِّينِ (the Master/Owner). An-Nās opens with مَلِكِ ٱلنَّاسِ (the King). One alif changes the name.',
    appearsAt: ['1:4', '114:2'],
  },
  {
    id: 'rahman-rahim',
    canonical: 'ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ',
    confusable: 'ٱلرَّحِيمِ ٱلرَّحْمَـٰنِ',
    note: 'Paired names — order matters. In the Basmala and Al-Fātiḥa the order is ٱلرَّحْمَـٰنِ then ٱلرَّحِيمِ.',
    appearsAt: ['1:1', '1:3'],
  },
  {
    id: 'ghafoor-rahim',
    canonical: 'ٱلْغَفُورُ ٱلرَّحِيمُ',
    confusable: 'ٱلرَّحْمَـٰنُ ٱلرَّحِيمُ',
    note: 'Both are valid paired endings in the Qurʾān — but which appears where matters. Training against this fixes the most common Musābaqah slip.',
    appearsAt: [],
  },
  {
    id: 'azeez-hakeem',
    canonical: 'ٱلْعَزِيزُ ٱلْحَكِيمُ',
    confusable: 'ٱلْعَلِيمُ ٱلْحَكِيمُ',
    note: 'Two name-pairs that end with ٱلْحَكِيمُ. Reciters often substitute one for the other. Context (the ayah before) settles which is correct.',
    appearsAt: [],
  },
  {
    id: 'samee-baseer',
    canonical: 'ٱلسَّمِيعُ ٱلْبَصِيرُ',
    confusable: 'ٱلسَّمِيعُ ٱلْعَلِيمُ',
    note: 'Both closing names begin with ٱلسَّمِيعُ. The difference is the second half.',
    appearsAt: [],
  },
]
