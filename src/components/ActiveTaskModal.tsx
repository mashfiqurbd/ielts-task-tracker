import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Plus,
  Trash2,
  ChevronRight,
  BookOpen,
  Headphones,
  FileEdit,
  Mic,
  Star,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  IELTSTask,
  PracticeRecord,
  MistakeEntry,
  MistakeReasonCategory,
  VocabItem,
} from '../types';
import { calculateAcademicBand } from '../utils/storage';

interface ActiveTaskModalProps {
  task: IELTSTask | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveRecordAndComplete: (
    task: IELTSTask,
    record: PracticeRecord,
    mistakes: MistakeEntry[],
    newVocab?: VocabItem[]
  ) => void;
  onJumpToTask: (taskTitle: string, skill: IELTSTask['skill']) => void;
}

export const ActiveTaskModal: React.FC<ActiveTaskModalProps> = ({
  task,
  isOpen,
  onClose,
  onSaveRecordAndComplete,
  onJumpToTask,
}) => {
  if (!isOpen || !task) return null;

  const [step, setStep] = useState<'practice' | 'record' | 'review'>('practice');

  // Timer state
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const timerRef = useRef<number | null>(null);

  // Result Form state
  const [timeSpentMins, setTimeSpentMins] = useState<number>(task.estimatedMinutes || 30);
  const [rawScore, setRawScore] = useState<number>(31);
  const [totalQuestions, setTotalQuestions] = useState<number>(40);
  const [estimatedBand, setEstimatedBand] = useState<number>(7.0);
  const [mistakesCount, setMistakesCount] = useState<number>(9);
  const [mainProblem, setMainProblem] = useState<string>(
    task.skill === 'reading'
      ? 'Matching Headings'
      : task.skill === 'listening'
      ? 'Section 3 Distractors'
      : task.skill === 'writing'
      ? 'Task Response & Examples'
      : 'Part 2 Time Pacing'
  );
  const [difficulty, setDifficulty] = useState<number>(4);
  const [notes, setNotes] = useState<string>(
    `Completed ${task.title}. Rushed through the last section due to time budgeting.`
  );

  // Mistakes logging list
  const [sessionMistakes, setSessionMistakes] = useState<
    Array<{
      questionNumber: string;
      questionType: string;
      yourAnswer: string;
      correctAnswer: string;
      reasonCategory: MistakeReasonCategory;
      details: string;
      vocabWord?: string;
    }>
  >([
    {
      questionNumber: 'Q12',
      questionType: task.skill === 'reading' ? 'T/F/NG' : 'Multiple Choice',
      yourAnswer: 'False',
      correctAnswer: 'Not Given',
      reasonCategory: 'comprehension',
      details: 'Assumed information not explicitly stated in passage.',
      vocabWord: '',
    },
  ]);

  // Suggested next task after completion
  const nextRecommended = {
    title:
      mainProblem.toLowerCase().includes('heading')
        ? 'Matching Headings 20-Question Sprint Drill'
        : mainProblem.toLowerCase().includes('distractor')
        ? 'Listening Section 3 Distractor Analysis'
        : mainProblem.toLowerCase().includes('time')
        ? 'Strict 55-Minute Simulation Drill'
        : 'Vocabulary from Mistakes Review',
    skill: task.skill,
  };

  // Timer effect
  useEffect(() => {
    if (isRunning) {
      timerRef.current = window.setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);

  // Reset when opening new task
  useEffect(() => {
    setTimerSeconds(0);
    setIsRunning(false);
    setStep('practice');
    setTimeSpentMins(task.estimatedMinutes || 30);
  }, [task.id]);

  // Auto calculate band on raw score change for reading/listening
  useEffect(() => {
    if (task.skill === 'reading' || task.skill === 'listening') {
      const band = calculateAcademicBand(rawScore, task.skill);
      setEstimatedBand(band);
      setMistakesCount(Math.max(0, totalQuestions - rawScore));
    }
  }, [rawScore, totalQuestions, task.skill]);

  const formatTimer = (totalSecs: number) => {
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleFinishPractice = () => {
    setIsRunning(false);
    const elapsedMinutes = Math.max(1, Math.round(timerSeconds / 60));
    setTimeSpentMins(elapsedMinutes || task.estimatedMinutes);
    setStep('record');
  };

  const handleAddMistakeRow = () => {
    setSessionMistakes((prev) => [
      ...prev,
      {
        questionNumber: `Q${prev.length + 14}`,
        questionType: task.skill === 'reading' ? 'Matching Headings' : 'Multiple Choice',
        yourAnswer: '',
        correctAnswer: '',
        reasonCategory: 'careless_mistake',
        details: '',
        vocabWord: '',
      },
    ]);
  };

  const handleRemoveMistakeRow = (index: number) => {
    setSessionMistakes((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFinalSubmit = () => {
    const recordId = `rec-${Date.now()}`;
    const newRecord: PracticeRecord = {
      id: recordId,
      taskId: task.id,
      taskTitle: task.title,
      skill: task.skill,
      date: '24 Aug 2026',
      timeSpentMinutes: timeSpentMins,
      rawScore: task.skill === 'reading' || task.skill === 'listening' ? rawScore : undefined,
      totalQuestions: task.skill === 'reading' || task.skill === 'listening' ? totalQuestions : undefined,
      estimatedBand,
      mistakesCount: sessionMistakes.length || mistakesCount,
      mainProblem,
      difficulty,
      notes,
    };

    // Format mistakes
    const generatedMistakes: MistakeEntry[] = sessionMistakes.map((m, idx) => ({
      id: `mis-${Date.now()}-${idx}`,
      practiceRecordId: recordId,
      skill: task.skill,
      questionNumber: m.questionNumber || `Q${idx + 1}`,
      questionType: m.questionType || 'General',
      yourAnswer: m.yourAnswer || 'N/A',
      correctAnswer: m.correctAnswer || 'N/A',
      reasonCategory: m.reasonCategory,
      details: m.details || `Logged from ${task.title}`,
      source: task.title,
      date: '24 Aug 2026',
      resolved: false,
      linkedVocabWord: m.vocabWord,
    }));

    // Extract any new vocab items
    const newVocabs: VocabItem[] = sessionMistakes
      .filter((m) => m.vocabWord && m.vocabWord.trim().length > 1)
      .map((m, idx) => ({
        id: `voc-${Date.now()}-${idx}`,
        word: m.vocabWord!.trim().toLowerCase(),
        phonetic: '/.../',
        partOfSpeech: 'academic vocabulary',
        meaning: `Learned from mistake on ${m.questionNumber} (${task.title}).`,
        synonyms: ['crucial', 'essential'],
        collocations: ['academic collocation'],
        example: `The word "${m.vocabWord}" appeared in ${task.title}.`,
        source: task.title,
        status: 'learning',
        addedDate: '2026-08-24',
        reviewCount: 0,
        masteryScore: 20,
      }));

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }

    onSaveRecordAndComplete(task, newRecord, generatedMistakes, newVocabs);
    setStep('review');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto font-sans">
      <div className="bg-[#0a0a0a] w-full max-w-3xl rounded-2xl shadow-2xl border border-[#1a1a1a] overflow-hidden my-6">
        {/* Header Bar */}
        <div className="p-5 border-b border-[#1a1a1a] bg-[#0d0d0d] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold bg-[#141414] border border-[#222222] ${
                task.skill === 'listening'
                  ? 'text-[#d4af37]'
                  : task.skill === 'reading'
                  ? 'text-emerald-400'
                  : task.skill === 'writing'
                  ? 'text-amber-400'
                  : 'text-indigo-400'
              }`}
            >
              {task.skill === 'listening' && <Headphones className="w-4 h-4" />}
              {task.skill === 'reading' && <BookOpen className="w-4 h-4" />}
              {task.skill === 'writing' && <FileEdit className="w-4 h-4" />}
              {task.skill === 'speaking' && <Mic className="w-4 h-4" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#141414] text-[#d4af37] border border-[#222222]">
                  {task.skill} • {task.category.replace('_', ' ')}
                </span>
                <span className="text-xs text-[#666666]">Target: Band 7.5</span>
              </div>
              <h2 className="text-base sm:text-lg font-serif italic text-white leading-snug">
                {task.title}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-[#666666] hover:text-white hover:bg-[#1a1a1a] flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="grid grid-cols-3 text-center border-b border-[#1a1a1a] bg-[#0a0a0a] text-xs font-medium py-3">
          <div
            className={`flex items-center justify-center gap-1.5 ${
              step === 'practice' ? 'text-[#d4af37] font-bold' : 'text-[#666666]'
            }`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
              step === 'practice' ? 'bg-[#d4af37] text-black font-bold' : 'bg-[#141414] text-[#888888]'
            }`}>
              1
            </span>
            <span>Active Practice</span>
          </div>
          <div
            className={`flex items-center justify-center gap-1.5 ${
              step === 'record' ? 'text-[#d4af37] font-bold' : 'text-[#666666]'
            }`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
              step === 'record' ? 'bg-[#d4af37] text-black font-bold' : 'bg-[#141414] text-[#888888]'
            }`}>
              2
            </span>
            <span>Record Result & Mistakes</span>
          </div>
          <div
            className={`flex items-center justify-center gap-1.5 ${
              step === 'review' ? 'text-[#d4af37] font-bold' : 'text-[#666666]'
            }`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
              step === 'review' ? 'bg-[#d4af37] text-black font-bold' : 'bg-[#141414] text-[#888888]'
            }`}>
              3
            </span>
            <span>Review & Next Task</span>
          </div>
        </div>

        {/* Step 1: Active Practice */}
        {step === 'practice' && (
          <div className="p-6 space-y-6">
            {/* Live Stopwatch / Countdown */}
            <div className="p-8 rounded-2xl bg-gradient-to-b from-[#141005] to-[#0a0a0a] border border-[#302108] text-white text-center space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#d4af37]">
                Session Timer
              </span>
              <div className="text-5xl sm:text-6xl font-mono font-bold tracking-tight text-[#d4af37]">
                {formatTimer(timerSeconds)}
              </div>
              <p className="text-xs text-[#888888]">
                Target Allocation: {task.estimatedMinutes} minutes
              </p>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setIsRunning(!isRunning)}
                  className={`px-5 py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all ${
                    isRunning
                      ? 'bg-amber-500 hover:bg-amber-400 text-black'
                      : 'bg-[#d4af37] hover:bg-[#e2be4a] text-black'
                  }`}
                >
                  {isRunning ? (
                    <>
                      <Pause className="w-4 h-4" /> Pause Timer
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-black" /> Start Practice
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    setIsRunning(false);
                    setTimerSeconds(0);
                  }}
                  className="px-4 py-2.5 rounded-lg bg-[#141414] hover:bg-[#1f1f1f] text-[#a0a0a0] hover:text-white border border-[#222222] text-xs font-medium flex items-center gap-1 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset
                </button>
              </div>
            </div>

            {/* Task Instructions & Diagnostic Context */}
            <div className="space-y-3">
              <h3 className="font-serif italic text-white text-base">Practice Briefing & Focus</h3>
              <div className="p-4 rounded-xl bg-[#0f0f0f] border border-[#1a1a1a] text-xs text-[#a0a0a0] space-y-2">
                <p className="font-medium text-[#e0e0e0]">{task.description}</p>
                {task.reason && (
                  <div className="p-2.5 rounded-lg bg-[#141005] border border-[#302108] text-[#d4af37] flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-[#d4af37] shrink-0 mt-0.5" />
                    <span>
                      <strong>Diagnostic Focus:</strong> {task.reason}
                    </span>
                  </div>
                )}
                {task.instructions && (
                  <div className="mt-2 whitespace-pre-line text-[#888888] border-t border-[#1a1a1a] pt-2">
                    {task.instructions}
                  </div>
                )}
                {task.samplePrompt && (
                  <div className="p-3 rounded-lg bg-[#141414] border border-[#222222] mt-2">
                    <span className="font-bold text-white block mb-1">Topic / Prompt:</span>
                    <p className="italic text-[#d4af37] font-serif">&ldquo;{task.samplePrompt}&rdquo;</p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-4 border-t border-[#1a1a1a]">
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-[#888888] hover:text-white"
              >
                Cancel / Return Later
              </button>

              <button
                onClick={handleFinishPractice}
                className="px-5 py-2.5 rounded-lg bg-[#d4af37] hover:bg-[#e2be4a] text-black font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-colors"
              >
                <span>Finish & Record Diagnostic Result</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Record Result & Log Mistakes */}
        {step === 'record' && (
          <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
            <div className="p-4 rounded-xl bg-[#141005] border border-[#302108] flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-[#d4af37] shrink-0 mt-0.5" />
              <div className="text-xs text-[#d4af37]">
                <p className="font-bold">Record what you practiced and why mistakes occurred</p>
                <p className="mt-0.5 text-[#a08a40]">
                  Logging mistakes with root cause reasons generates your targeted drills and mistake vocabulary cards.
                </p>
              </div>
            </div>

            {/* Core Metrics Form */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-bold text-[#888888] mb-1">
                  Time Spent (Minutes)
                </label>
                <input
                  type="number"
                  value={timeSpentMins}
                  onChange={(e) => setTimeSpentMins(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-[#141414] border border-[#222222] rounded-lg focus:outline-none focus:border-[#d4af37] text-[#e0e0e0]"
                />
              </div>

              {(task.skill === 'reading' || task.skill === 'listening') && (
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-bold text-[#888888] mb-1">
                    Raw Score (Questions Correct)
                  </label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      max={40}
                      min={0}
                      value={rawScore}
                      onChange={(e) => setRawScore(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs sm:text-sm bg-[#141414] border border-[#222222] rounded-lg focus:outline-none focus:border-[#d4af37] text-[#e0e0e0]"
                    />
                    <span className="text-xs text-[#666666] font-mono">/40</span>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] uppercase tracking-wider font-bold text-[#888888] mb-1">
                  Estimated IELTS Band
                </label>
                <input
                  type="number"
                  step="0.5"
                  max="9.0"
                  min="4.0"
                  value={estimatedBand}
                  onChange={(e) => setEstimatedBand(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm font-serif font-bold text-[#d4af37] bg-[#141414] border border-[#222222] rounded-lg focus:outline-none focus:border-[#d4af37]"
                />
              </div>
            </div>

            {/* Main Problem & Difficulty */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-bold text-[#888888] mb-1">
                  Main Problem / Trap Area
                </label>
                <input
                  type="text"
                  value={mainProblem}
                  onChange={(e) => setMainProblem(e.target.value)}
                  placeholder="e.g. Matching Headings, Section 3 distractor"
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-[#141414] border border-[#222222] rounded-lg focus:outline-none focus:border-[#d4af37] text-[#e0e0e0]"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider font-bold text-[#888888] mb-1">
                  Perceived Difficulty Rating
                </label>
                <div className="flex items-center gap-2 py-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setDifficulty(star)}
                      className={`p-1 rounded transition-colors ${
                        star <= difficulty ? 'text-[#d4af37]' : 'text-[#333333] hover:text-[#d4af37]/60'
                      }`}
                    >
                      <Star className="w-4 h-4 fill-current" />
                    </button>
                  ))}
                  <span className="text-xs text-[#888888] font-medium ml-2">
                    {difficulty === 5
                      ? 'Extremely Hard'
                      : difficulty === 4
                      ? 'Challenging'
                      : difficulty === 3
                      ? 'Standard'
                      : 'Easy'}
                  </span>
                </div>
              </div>
            </div>

            {/* Session Notes */}
            <div>
              <label className="block text-[11px] uppercase tracking-wider font-bold text-[#888888] mb-1">
                Diagnostic Reflections & Notes
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="What slowed you down? What will you do differently next time?"
                className="w-full px-3 py-2 text-xs sm:text-sm bg-[#141414] border border-[#222222] rounded-lg focus:outline-none focus:border-[#d4af37] text-[#e0e0e0]"
              />
            </div>

            {/* Mistake Notebook Integration Table */}
            <div className="space-y-3 border-t border-[#1a1a1a] pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-serif italic text-white text-sm">
                    Mistake Notebook Entries ({sessionMistakes.length})
                  </h4>
                  <p className="text-xs text-[#888888]">
                    Log the questions you missed to update your weak area radar
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddMistakeRow}
                  className="px-3 py-1.5 rounded-lg bg-[#141414] text-[#d4af37] border border-[#222222] text-xs font-bold uppercase tracking-wider flex items-center gap-1 hover:bg-[#1f1f1f]"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Mistake</span>
                </button>
              </div>

              <div className="space-y-3">
                {sessionMistakes.map((m, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-[#0f0f0f] border border-[#1a1a1a] space-y-3 text-xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="text"
                          value={m.questionNumber}
                          onChange={(e) => {
                            const updated = [...sessionMistakes];
                            updated[idx].questionNumber = e.target.value;
                            setSessionMistakes(updated);
                          }}
                          placeholder="Q#"
                          className="w-16 px-2 py-1 bg-[#141414] border border-[#222222] rounded font-bold text-white focus:outline-none focus:border-[#d4af37]"
                        />
                        <input
                          type="text"
                          value={m.questionType}
                          onChange={(e) => {
                            const updated = [...sessionMistakes];
                            updated[idx].questionType = e.target.value;
                            setSessionMistakes(updated);
                          }}
                          placeholder="Type (e.g. T/F/NG, Matching Headings)"
                          className="flex-1 px-2 py-1 bg-[#141414] border border-[#222222] rounded text-[#e0e0e0] focus:outline-none focus:border-[#d4af37]"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveMistakeRow(idx)}
                        className="text-[#555555] hover:text-rose-400 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-[#666666] font-medium block text-[10px] uppercase">Your Answer:</span>
                        <input
                          type="text"
                          value={m.yourAnswer}
                          onChange={(e) => {
                            const updated = [...sessionMistakes];
                            updated[idx].yourAnswer = e.target.value;
                            setSessionMistakes(updated);
                          }}
                          className="w-full px-2 py-1 bg-[#141414] border border-[#222222] rounded text-[#e0e0e0]"
                        />
                      </div>
                      <div>
                        <span className="text-emerald-400 font-medium block text-[10px] uppercase">Correct Answer:</span>
                        <input
                          type="text"
                          value={m.correctAnswer}
                          onChange={(e) => {
                            const updated = [...sessionMistakes];
                            updated[idx].correctAnswer = e.target.value;
                            setSessionMistakes(updated);
                          }}
                          className="w-full px-2 py-1 bg-[#141414] border border-[#222222] rounded font-semibold text-emerald-400"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <span className="text-[#666666] font-medium block text-[10px] uppercase">Root Cause Reason:</span>
                        <select
                          value={m.reasonCategory}
                          onChange={(e) => {
                            const updated = [...sessionMistakes];
                            updated[idx].reasonCategory = e.target.value as MistakeReasonCategory;
                            setSessionMistakes(updated);
                          }}
                          className="w-full px-2 py-1 bg-[#141414] border border-[#222222] rounded text-[#e0e0e0] focus:outline-none focus:border-[#d4af37]"
                        >
                          <option value="vocabulary">Vocabulary (Unknown word)</option>
                          <option value="comprehension">Comprehension (Misunderstood text)</option>
                          <option value="careless_mistake">Careless Mistake (Jumped to conclusion)</option>
                          <option value="time_management">Time Management (Rushed)</option>
                          <option value="grammar">Grammar Error</option>
                          <option value="idea_development">Idea Development (Under-developed)</option>
                          <option value="coherence_cohesion">Coherence & Cohesion</option>
                          <option value="pronunciation">Pronunciation / Pacing</option>
                        </select>
                      </div>

                      <div>
                        <span className="text-[#d4af37] font-medium block text-[10px] uppercase">
                          Save Word to Mistake Vocab (Optional):
                        </span>
                        <input
                          type="text"
                          value={m.vocabWord || ''}
                          onChange={(e) => {
                            const updated = [...sessionMistakes];
                            updated[idx].vocabWord = e.target.value;
                            setSessionMistakes(updated);
                          }}
                          placeholder="e.g. inevitable"
                          className="w-full px-2 py-1 bg-[#141414] border border-[#222222] rounded text-[#d4af37] font-semibold focus:outline-none focus:border-[#d4af37]"
                        />
                      </div>
                    </div>

                    <input
                      type="text"
                      value={m.details}
                      onChange={(e) => {
                        const updated = [...sessionMistakes];
                        updated[idx].details = e.target.value;
                        setSessionMistakes(updated);
                      }}
                      placeholder="Why did you miss this? (e.g. Assumed info from prior knowledge)"
                      className="w-full px-2 py-1 bg-[#141414] border border-[#222222] rounded text-[#888888] text-xs focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-[#1a1a1a]">
              <button
                onClick={() => setStep('practice')}
                className="px-4 py-2 text-xs font-medium text-[#888888] hover:text-white"
              >
                Back to Timer
              </button>

              <button
                onClick={handleFinalSubmit}
                className="px-6 py-2.5 rounded-lg bg-[#d4af37] hover:bg-[#e2be4a] text-black font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Save Record & Complete Task</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Review & Next Task Recommendation */}
        {step === 'review' && (
          <div className="p-8 space-y-6 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-950/80 border border-emerald-800 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-serif italic text-white">Task Completed & Recorded!</h3>
              <p className="text-xs text-[#888888]">
                Your progress metrics, mistake notebook, and planner have been updated.
              </p>
            </div>

            {/* Summary Pill Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
              <div className="p-3.5 rounded-xl bg-[#0f0f0f] border border-[#1a1a1a]">
                <span className="text-[10px] uppercase font-bold text-[#666666] block">Est. Band</span>
                <span className="text-xl font-serif font-bold text-[#d4af37]">{estimatedBand}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#0f0f0f] border border-[#1a1a1a]">
                <span className="text-[10px] uppercase font-bold text-[#666666] block">Time Spent</span>
                <span className="text-xl font-serif font-bold text-white">{timeSpentMins} min</span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#0f0f0f] border border-[#1a1a1a]">
                <span className="text-[10px] uppercase font-bold text-[#666666] block">Mistakes Logged</span>
                <span className="text-xl font-serif font-bold text-rose-400">{sessionMistakes.length}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#0f0f0f] border border-[#1a1a1a]">
                <span className="text-[10px] uppercase font-bold text-[#666666] block">Top Issue</span>
                <span className="text-xs font-medium text-white line-clamp-1 mt-1">{mainProblem}</span>
              </div>
            </div>

            {/* Next Task Recommendation Card */}
            <div className="p-6 rounded-2xl bg-gradient-to-b from-[#141005] to-[#0a0a0a] border border-[#302108] text-left space-y-3">
              <div className="flex items-center gap-2 text-[#d4af37]">
                <Sparkles className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest">
                  Adaptive Next Step Recommendation
                </span>
              </div>

              <div className="space-y-1">
                <h4 className="font-serif italic text-white text-base">{nextRecommended.title}</h4>
                <p className="text-xs text-[#a0a0a0]">
                  Based on your problem area (<strong className="text-white">{mainProblem}</strong>), practicing this targeted drill now will yield maximum band gain.
                </p>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => {
                    onClose();
                    onJumpToTask(nextRecommended.title, nextRecommended.skill);
                  }}
                  className="px-4 py-2 rounded-lg bg-[#d4af37] hover:bg-[#e2be4a] text-black font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors"
                >
                  <span>Start Recommended Task</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-lg bg-[#141414] hover:bg-[#1f1f1f] border border-[#222222] text-[#e0e0e0] font-medium text-xs transition-colors"
              >
                Close & Return to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

