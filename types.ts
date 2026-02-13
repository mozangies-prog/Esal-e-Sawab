
export enum RecitationType {
  FATIHA = 'Surah Al-Fatiha',
  ASTAGFIRULLAH = 'Astaghfirullah',
  KALMA_1 = '1st Kalma (Tayyab)',
  KALMA_2 = '2nd Kalma (Shahadat)',
  KALMA_3 = '3rd Kalma (Tamjeed)',
  AYAT_UL_KURSI = 'Ayat-ul-Kursi',
  DUROOD = 'Durood Shareef',
  YASIN = 'Surah Yasin',
  MULK = 'Surah Al-Mulk',
  LA_ILAHA_ILLALLAH = 'La ilaha illallah',
  SUBHANALLAH = 'SubhanAllah',
  ALHAMDULILLAH = 'Alhamdulillah',
  ALLAHU_AKBAR = 'Allahu Akbar'
}

export interface Descent {
  id: string;
  name: string;
  location: string;
  passedDate?: string;
}

export interface RecitationInfo {
  id: RecitationType;
  title: string;
  arabic: string;
  icon: string;
}

export interface Contribution {
  id: string;
  family_id: string;
  contributorName: string;
  recitationType: RecitationType;
  count: number;
  timestamp: number;
}

export interface Goal {
  recitationType: RecitationType;
  target: number;
}

export interface EsalData {
  deceasedName: string;
  passedDate: string; // ISO format YYYY-MM-DD
  contributions: Contribution[];
}

export interface ChartPoint {
  label: string;
  value: number;
}
