
export enum RecitationType {
  FATIHA = 'Surah Al-Fatiha',
  ASTAGFIRULLAH = 'Astaghfirullah',
  KALMA_1 = '1st Kalma (Tayyab)',
  KALMA_2 = '2nd Kalma (Shahadat)',
  KALMA_3 = '3rd Kalma (Tamjeed)',
  AYAT_UL_KURSI = 'Ayat-ul-Kursi',
  DUROOD = 'Durood Shareef'
}

export interface RecitationInfo {
  id: RecitationType;
  title: string;
  arabic: string;
  icon: string;
}

export interface Contribution {
  id: string;
  contributorName: string;
  recitationType: RecitationType;
  count: number;
  timestamp: number;
}

export interface EsalData {
  deceasedName: string;
  passedDate: string;
  contributions: Contribution[];
}

// Added Goal interface to support GoalTracker component
export interface Goal {
  recitationType: RecitationType;
  target: number;
}
