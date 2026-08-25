export type Skill = 'listening' | 'reading' | 'writing' | 'speaking' | 'general';

export type TaskPriority = 'high' | 'medium' | 'low';

export type TaskStatus = 'todo' | 'in_progress' | 'completed' | 'pending';

export type TaskCategory =
  | 'cambridge_test'
  | 'full_test'
  | 'section_practice'
  | 'targeted_drill'
  | 'dictation'
  | 'map_plan'
  | 'matching_headings'
  | 'tfng'
  | 'passage_drill'
  | 'vocab_review'
  | 'vocab_study'
  | 'mistake_drill'
  | 'mistake_review'
  | 'writing_task_1'
  | 'writing_task_2'
  | 'intro_drill'
  | 'overview_drill'
  | 'grammar_rewrite'
  | 'speaking_part_1'
  | 'speaking_part_2'
  | 'speaking_part_3'
  | 'mock_speaking'
  | 'weekly_review';

export interface IELTSTask {
  id: string;
  title: string;
  skill: Skill;
  category: TaskCategory;
  estimatedMinutes: number;
  priority: TaskPriority;
  status: TaskStatus;
  scheduledDate?: string; // YYYY-MM-DD
  dayOfWeek?: string; // Monday, Tuesday, etc.
  description: string;
  reason?: string; // e.g., "Identified weakness from Mistake Notebook (42% error rate in Matching Headings)"
  instructions?: string;
  samplePrompt?: string; // Prompt for writing/speaking or passage text
  targetBand?: number;
  completedAt?: string;
  resultId?: string;
}

export interface PracticeRecord {
  id: string;
  taskId?: string;
  taskTitle: string;
  skill: Skill;
  date: string; // e.g. "24 Aug 2026"
  timeSpentMinutes: number;
  rawScore?: number; // e.g., 31
  totalQuestions?: number; // e.g., 40
  estimatedBand: number; // e.g. 7.0
  mistakesCount: number;
  mainProblem: string; // e.g. "Matching Headings", "Task Response", "Time Management"
  difficulty: number; // 1 to 5 stars
  notes: string;
  mistakeIds?: string[];
}

export type MistakeReasonCategory =
  | 'vocabulary'
  | 'grammar'
  | 'comprehension'
  | 'careless_mistake'
  | 'time_management'
  | 'pronunciation'
  | 'idea_development'
  | 'coherence_cohesion';

export interface MistakeEntry {
  id: string;
  practiceRecordId?: string;
  skill: Skill;
  questionNumber: string; // e.g. "Q12", "Q18", "Task 2 Body 1", "Part 2 Cue 3"
  questionType: string; // e.g. "T/F/NG", "Matching Headings", "Summary Completion", "Multiple Choice", "Map Labelling", "Task Response"
  yourAnswer: string;
  correctAnswer: string;
  reasonCategory: MistakeReasonCategory;
  details: string; // e.g. "Assumed information not stated in passage; confused 'inevitable' with 'desirable'"
  source: string; // e.g. "Cambridge 18 Test 1", "Reading Passage 2", "Mock Speaking 3"
  date: string;
  resolved: boolean;
  linkedVocabWord?: string;
}

export interface WritingCorrection {
  original: string;
  corrected: string;
  explanation: string;
}

export interface WritingSubmission {
  id: string;
  taskId?: string;
  taskType: 'task_1' | 'task_2';
  prompt: string;
  essayType?: string; // "Opinion", "Discussion", "Problem-Solution", "Bar Chart", "Line Graph", "Map"
  originalText: string;
  wordCount: number;
  timeTakenMinutes: number;
  date: string;
  scores: {
    overallBand: number;
    taskResponse: number; // or Task Achievement
    coherenceCohesion: number;
    lexicalResource: number;
    grammaticalRange: number;
  };
  feedback: {
    general: string;
    strengths: string[];
    weaknesses: string[];
    corrections: WritingCorrection[];
  };
  revisedVersion: string;
  revisedWordCount?: number;
}

export interface SpeakingRecording {
  id: string;
  taskId?: string;
  part: 'part_1' | 'part_2' | 'part_3' | 'full_mock';
  topic: string;
  prompt: string;
  cueCardPoints?: string[];
  audioBlobUrl?: string;
  durationSeconds: number;
  targetDurationSeconds: number;
  date: string;
  scores: {
    estimatedBand: number;
    fluencyCoherence: number;
    lexicalResource: number;
    grammaticalRange: number;
    pronunciation: number;
  };
  transcript?: string;
  feedback: {
    general: string;
    strengths: string[];
    areasToImprove: string[];
    sampleExpansion: string;
  };
}

export interface VocabItem {
  id: string;
  word: string;
  phonetic: string;
  partOfSpeech: string;
  meaning: string;
  synonyms: string[];
  collocations: string[];
  example: string;
  source: string; // e.g. "Reading Cambridge 18 Test 3", "Writing Task 2 Essay"
  mistakeId?: string;
  status: 'learning' | 'reviewing' | 'mastered';
  addedDate: string;
  lastReviewed?: string;
  reviewCount: number;
  masteryScore: number; // 0 - 100
}

export interface UserProfile {
  name: string;
  targetBand: number;
  estimatedBand: number;
  skillBands: {
    listening: { current: number; target: number };
    reading: { current: number; target: number };
    writing: { current: number; target: number };
    speaking: { current: number; target: number };
  };
  examDate: string; // YYYY-MM-DD
  moduleType: 'Academic' | 'General Training';
  dailyStudyMinutes: number;
  streakDays: number;
  tasksCompletedTotal: number;
  tasksTargetTotal: number;
  studyTimeThisWeekMinutes: number;
  lastActiveDate: string;
}

export interface WeeklyReport {
  id: string;
  weekRange: string; // e.g. "24–30 August 2026"
  studyTimeMinutes: number;
  tasksCompleted: number;
  skillProgression: {
    listening: { previous: number; current: number };
    reading: { previous: number; current: number };
    writing: { previous: number; current: number };
    speaking: { previous: number; current: number };
  };
  strengths: string[];
  needsImprovement: string[];
  nextWeekPriorities: Array<{
    id: string;
    skill: Skill;
    title: string;
    description: string;
    actionType: string;
  }>;
}

export type ActiveTab =
  | 'dashboard'
  | 'tasks'
  | 'practice'
  | 'mistakes'
  | 'writing'
  | 'speaking'
  | 'vocabulary'
  | 'progress'
  | 'profile';
