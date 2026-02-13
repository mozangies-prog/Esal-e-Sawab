
import { RecitationType, RecitationInfo } from './types';

export const RECITATIONS: RecitationInfo[] = [
  {
    id: RecitationType.FATIHA,
    title: 'Surah Al-Fatiha',
    arabic: 'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ. الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
    icon: 'fa-book-open'
  },
  {
    id: RecitationType.YASIN,
    title: 'Surah Yasin',
    arabic: 'يسٓ ۞ وَالْقُرْآنِ الْحَكِيمِ',
    icon: 'fa-book'
  },
  {
    id: RecitationType.MULK,
    title: 'Surah Al-Mulk',
    arabic: 'تَبَارَكَ الَّذِي بِيَدِهِ الْمُلْكُ',
    icon: 'fa-shield-halved'
  },
  {
    id: RecitationType.AYAT_UL_KURSI,
    title: 'Ayat-ul-Kursi',
    arabic: 'اللَّهُ لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ',
    icon: 'fa-crown'
  },
  {
    id: RecitationType.DUROOD,
    title: 'Durood Shareef',
    arabic: 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ',
    icon: 'fa-dove'
  },
  {
    id: RecitationType.ASTAGFIRULLAH,
    title: 'Astaghfirullah',
    arabic: 'أَسْتَغْفِرُ اللَّهَ',
    icon: 'fa-heart'
  },
  {
    id: RecitationType.LA_ILAHA_ILLALLAH,
    title: 'La ilaha illallah',
    arabic: 'لَا إِلَهَ إِلَّا اللهُ',
    icon: 'fa-fingerprint'
  },
  {
    id: RecitationType.SUBHANALLAH,
    title: 'SubhanAllah',
    arabic: 'سُبْحَانَ اللهِ',
    icon: 'fa-sun'
  },
  {
    id: RecitationType.ALHAMDULILLAH,
    title: 'Alhamdulillah',
    arabic: 'الْحَمْدُ لِلَّهِ',
    icon: 'fa-cloud'
  },
  {
    id: RecitationType.ALLAHU_AKBAR,
    title: 'Allahu Akbar',
    arabic: 'اللهُ أَكْبَرُ',
    icon: 'fa-mountain'
  },
  {
    id: RecitationType.KALMA_1,
    title: '1st Kalma (Tayyab)',
    arabic: 'لَا إِلَهَ إِلَّا اللهُ مُحَمَّدٌ رَسُولُ اللهِ',
    icon: 'fa-star'
  },
  {
    id: RecitationType.KALMA_2,
    title: '2nd Kalma (Shahadat)',
    arabic: 'أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللهُ',
    icon: 'fa-shield-heart'
  },
  {
    id: RecitationType.KALMA_3,
    title: '3rd Kalma (Tamjeed)',
    arabic: 'سُبْحَانَ اللهِ وَالْحَمْدُ لِلَّهِ',
    icon: 'fa-diamond'
  }
];
