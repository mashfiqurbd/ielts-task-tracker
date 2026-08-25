import {
  UserProfile,
  IELTSTask,
  PracticeRecord,
  MistakeEntry,
  WritingSubmission,
  SpeakingRecording,
  VocabItem,
  WeeklyReport,
} from '../types';
import {
  initialProfile,
  initialTasks,
  initialPracticeRecords,
  initialMistakes,
  initialWritingSubmissions,
  initialSpeakingRecordings,
  initialVocabItems,
  initialWeeklyReport,
} from '../data/mockData';

const KEYS = {
  PROFILE: 'ielts_tracker_profile',
  TASKS: 'ielts_tracker_tasks',
  RECORDS: 'ielts_tracker_records',
  MISTAKES: 'ielts_tracker_mistakes',
  WRITING: 'ielts_tracker_writing',
  SPEAKING: 'ielts_tracker_speaking',
  VOCAB: 'ielts_tracker_vocab',
  REPORT: 'ielts_tracker_report',
};

export function loadProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(KEYS.PROFILE);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse profile from storage', e);
  }
  return initialProfile;
}

export function saveProfile(profile: UserProfile): void {
  localStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
}

export function loadTasks(): IELTSTask[] {
  try {
    const raw = localStorage.getItem(KEYS.TASKS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse tasks', e);
  }
  return initialTasks;
}

export function saveTasks(tasks: IELTSTask[]): void {
  localStorage.setItem(KEYS.TASKS, JSON.stringify(tasks));
}

export function loadRecords(): PracticeRecord[] {
  try {
    const raw = localStorage.getItem(KEYS.RECORDS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse records', e);
  }
  return initialPracticeRecords;
}

export function saveRecords(records: PracticeRecord[]): void {
  localStorage.setItem(KEYS.RECORDS, JSON.stringify(records));
}

export function loadMistakes(): MistakeEntry[] {
  try {
    const raw = localStorage.getItem(KEYS.MISTAKES);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse mistakes', e);
  }
  return initialMistakes;
}

export function saveMistakes(mistakes: MistakeEntry[]): void {
  localStorage.setItem(KEYS.MISTAKES, JSON.stringify(mistakes));
}

export function loadWritingSubmissions(): WritingSubmission[] {
  try {
    const raw = localStorage.getItem(KEYS.WRITING);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse writing', e);
  }
  return initialWritingSubmissions;
}

export function saveWritingSubmissions(writing: WritingSubmission[]): void {
  localStorage.setItem(KEYS.WRITING, JSON.stringify(writing));
}

export function loadSpeakingRecordings(): SpeakingRecording[] {
  try {
    const raw = localStorage.getItem(KEYS.SPEAKING);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse speaking', e);
  }
  return initialSpeakingRecordings;
}

export function saveSpeakingRecordings(speaking: SpeakingRecording[]): void {
  localStorage.setItem(KEYS.SPEAKING, JSON.stringify(speaking));
}

export function loadVocab(): VocabItem[] {
  try {
    const raw = localStorage.getItem(KEYS.VOCAB);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse vocab', e);
  }
  return initialVocabItems;
}

export function saveVocab(vocab: VocabItem[]): void {
  localStorage.setItem(KEYS.VOCAB, JSON.stringify(vocab));
}

export function loadWeeklyReport(): WeeklyReport {
  try {
    const raw = localStorage.getItem(KEYS.REPORT);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse report', e);
  }
  return initialWeeklyReport;
}

export function saveWeeklyReport(report: WeeklyReport): void {
  localStorage.setItem(KEYS.REPORT, JSON.stringify(report));
}

export function resetAllToDefault(): void {
  localStorage.removeItem(KEYS.PROFILE);
  localStorage.removeItem(KEYS.TASKS);
  localStorage.removeItem(KEYS.RECORDS);
  localStorage.removeItem(KEYS.MISTAKES);
  localStorage.removeItem(KEYS.WRITING);
  localStorage.removeItem(KEYS.SPEAKING);
  localStorage.removeItem(KEYS.VOCAB);
  localStorage.removeItem(KEYS.REPORT);
}

export function calculateOverallBand(
  listening: number,
  reading: number,
  writing: number,
  speaking: number
): number {
  const avg = (listening + reading + writing + speaking) / 4;
  const decimal = avg - Math.floor(avg);
  if (decimal < 0.25) return Math.floor(avg);
  if (decimal < 0.75) return Math.floor(avg) + 0.5;
  return Math.ceil(avg);
}

// Aliases for unified imports
export const getUserProfile = loadProfile;
export const saveUserProfile = saveProfile;
export const getTasks = loadTasks;
export const getPracticeRecords = loadRecords;
export const savePracticeRecords = saveRecords;
export const getMistakes = loadMistakes;
export const getWritingSubmissions = loadWritingSubmissions;
export const getSpeakingRecordings = loadSpeakingRecordings;
export const getVocabList = loadVocab;
export const saveVocabList = saveVocab;

export function resetToInitialData() {
  resetAllToDefault();
  return {
    profile: initialProfile,
    tasks: initialTasks,
    records: initialPracticeRecords,
    mistakes: initialMistakes,
    writings: initialWritingSubmissions,
    speakings: initialSpeakingRecordings,
    vocab: initialVocabItems,
  };
}

// Convert raw score to estimated IELTS Academic reading/listening band
export function calculateAcademicBand(rawScore: number, skill: 'reading' | 'listening'): number {
  if (skill === 'reading') {
    if (rawScore >= 39) return 9.0;
    if (rawScore >= 37) return 8.5;
    if (rawScore >= 35) return 8.0;
    if (rawScore >= 33) return 7.5;
    if (rawScore >= 30) return 7.0;
    if (rawScore >= 27) return 6.5;
    if (rawScore >= 23) return 6.0;
    if (rawScore >= 19) return 5.5;
    if (rawScore >= 15) return 5.0;
    if (rawScore >= 13) return 4.5;
    return 4.0;
  } else {
    // Listening
    if (rawScore >= 39) return 9.0;
    if (rawScore >= 37) return 8.5;
    if (rawScore >= 35) return 8.0;
    if (rawScore >= 32) return 7.5;
    if (rawScore >= 30) return 7.0;
    if (rawScore >= 26) return 6.5;
    if (rawScore >= 23) return 6.0;
    if (rawScore >= 18) return 5.5;
    if (rawScore >= 16) return 5.0;
    if (rawScore >= 13) return 4.5;
    return 4.0;
  }
}
