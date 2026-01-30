
export interface InterviewMetadata {
  interviewId: string;
  interviewDate: string;
  interviewPlace: string;
  intervieweeName: string;
  intervieweeRin: string;
  totalNames: number;
}

export interface Individual {
  id: string; // Internal UUID
  rin: number;
  relation: string; // C/F/P etc
  sex: 'M' | 'F' | 'Other' | '';
  fullName: string;
  birthDate: string;
  birthPlace: string;
  deathDate: string;
  deathPlace: string;
  page: number;
  row: number;
  confidence: number;
  isDitto?: boolean; // If "//" was detected
}

export type AppState = 'IDLE' | 'PROCESSING' | 'REVIEW' | 'EXPORT';

export interface ProcessedData {
  metadata: InterviewMetadata;
  individuals: Individual[];
}
