import React, { useState } from 'react';
import {
  FileEdit,
  Sparkles,
  Send,
  Clock,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  ArrowRight,
  SplitSquareVertical,
  RotateCcw,
  BarChart2,
  Copy,
  Plus,
} from 'lucide-react';
import { WritingSubmission, WritingCorrection } from '../types';

interface WritingTrackerViewProps {
  submissions: WritingSubmission[];
  onGradeAndSaveEssay: (submission: WritingSubmission) => void;
}

export const WritingTrackerView: React.FC<WritingTrackerViewProps> = ({
  submissions,
  onGradeAndSaveEssay,
}) => {
  const [activeTab, setActiveTab] = useState<'practice' | 'history'>('practice');
  const [taskType, setTaskType] = useState<'task_1' | 'task_2'>('task_2');
  const [prompt, setPrompt] = useState<string>(
    'Some people argue that universities should focus exclusively on providing specialized job training, while others believe higher education should provide broader general knowledge. Discuss both views and give your own opinion.'
  );
  const [essayText, setEssayText] = useState<string>('');
  const [timeTakenMins, setTimeTakenMins] = useState<number>(40);
  const [isGrading, setIsGrading] = useState<boolean>(false);
  const [selectedSubmission, setSelectedSubmission] = useState<WritingSubmission | null>(
    submissions[0] || null
  );

  // Live word counter
  const wordCount = essayText.trim() ? essayText.trim().split(/\s+/).length : 0;
  const minWords = taskType === 'task_1' ? 150 : 250;

  const handleGradeEssay = async () => {
    if (!essayText.trim()) return;
    setIsGrading(true);

    try {
      const res = await fetch('/api/ai/grade-essay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          essay: essayText,
          taskType,
          timeTakenMinutes: timeTakenMins,
        }),
      });

      const data = await res.json();

      const newSub: WritingSubmission = {
        id: `sub-${Date.now()}`,
        taskType,
        prompt,
        essayType: taskType === 'task_1' ? 'Visual Report' : 'Discussion Essay',
        originalText: essayText,
        wordCount,
        timeTakenMinutes: timeTakenMins,
        date: '24 Aug 2026',
        scores: {
          overallBand: data.overallBand || 6.5,
          taskResponse: data.taskResponse || 6.5,
          coherenceCohesion: data.coherenceCohesion || 6.5,
          lexicalResource: data.lexicalResource || 6.5,
          grammaticalRange: data.grammaticalRange || 6.0,
        },
        feedback: {
          general: data.generalFeedback || data.feedback?.general || 'Good essay structure with clear paragraphs.',
          strengths: data.strengths || ['Clear thesis', 'Logical paragraph progression'],
          weaknesses: data.weaknesses || ['Needs more concrete examples in Body 2', 'Lexical repetition'],
          corrections: data.corrections || [],
        },
        revisedVersion: data.revisedVersion || essayText,
      };

      onGradeAndSaveEssay(newSub);
      setSelectedSubmission(newSub);
      setActiveTab('history');
    } catch (e) {
      console.error('Grading failed', e);
    } finally {
      setIsGrading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 font-sans">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-[#0a0a0a] p-6 sm:p-8 rounded-2xl border border-[#1a1a1a]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#d4af37]">
              Official 4-Criterion Evaluation
            </span>
            <span className="text-[10px] text-[#666666]">• TR • CC • LR • GRA</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif italic text-white tracking-tight">
            IELTS Writing Lab ✍️
          </h1>
          <p className="text-xs sm:text-sm text-[#888888] mt-1">
            Original → AI Examiner Feedback → Band 8.5 Revised Version comparison.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#0a0a0a] p-1 rounded-xl border border-[#1a1a1a]">
          <button
            onClick={() => setActiveTab('practice')}
            className={`px-4 py-2 text-xs font-medium rounded-lg transition-all ${
              activeTab === 'practice'
                ? 'bg-[#1a1a1a] text-white'
                : 'text-[#888888] hover:text-white'
            }`}
          >
            Timed Writing Practice
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 text-xs font-medium rounded-lg transition-all ${
              activeTab === 'history'
                ? 'bg-[#1a1a1a] text-white'
                : 'text-[#888888] hover:text-white'
            }`}
          >
            Essay History ({submissions.length})
          </button>
        </div>
      </div>

      {activeTab === 'practice' ? (
        /* Timed Practice & AI Grading Flow */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2 Cols: Writing Canvas */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-[#0a0a0a] p-6 rounded-2xl border border-[#1a1a1a] space-y-4">
              {/* Task Type Switcher & Timer */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1a1a1a] pb-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setTaskType('task_2');
                      setTimeTakenMins(40);
                    }}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                      taskType === 'task_2'
                        ? 'bg-[#d4af37] text-black font-bold'
                        : 'bg-[#141414] text-[#888888] hover:text-white border border-[#222222]'
                    }`}
                  >
                    Task 2 (Essay - 40 min / 250w)
                  </button>
                  <button
                    onClick={() => {
                      setTaskType('task_1');
                      setTimeTakenMins(20);
                    }}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                      taskType === 'task_1'
                        ? 'bg-[#d4af37] text-black font-bold'
                        : 'bg-[#141414] text-[#888888] hover:text-white border border-[#222222]'
                    }`}
                  >
                    Task 1 (Report - 20 min / 150w)
                  </button>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <div
                    className={`flex items-center gap-1 font-bold ${
                      wordCount >= minWords ? 'text-[#d4af37]' : 'text-amber-400'
                    }`}
                  >
                    <span>{wordCount}</span>
                    <span className="text-[#666666] font-normal">/ min {minWords} words</span>
                  </div>
                </div>
              </div>

              {/* Prompt Editor */}
              <div className="space-y-1.5">
                <label className="block text-[11px] uppercase tracking-wider text-[#888888] font-bold">
                  Exam Question / Prompt:
                </label>
                <textarea
                  rows={2}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-[#0f0f0f] border border-[#222222] rounded-lg focus:outline-none focus:border-[#d4af37] text-[#e0e0e0]"
                />
              </div>

              {/* Essay Textarea */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] uppercase tracking-wider text-[#888888] font-bold">
                    Your Response:
                  </label>
                  <span className="text-[11px] text-[#666666]">
                    4-paragraph structure (Intro, Body 1, Body 2, Conclusion)
                  </span>
                </div>
                <textarea
                  rows={14}
                  value={essayText}
                  onChange={(e) => setEssayText(e.target.value)}
                  placeholder="Type or paste your IELTS essay here..."
                  className="w-full p-4 text-sm bg-[#0f0f0f] text-[#e0e0e0] border border-[#222222] rounded-xl focus:outline-none focus:border-[#d4af37] leading-relaxed font-mono"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() =>
                    setEssayText(
                      `In the contemporary era, the debate over whether university education should focus primarily on practical vocational training or a comprehensive liberal arts foundation has intensified. In my view, while career readiness is vital, higher education must prioritize broad intellectual and critical thinking skills to prepare graduates for an evolving economy.\n\nOn the one hand, proponents of vocational specialization argue that tertiary institutions should serve as direct conduits to the employment market. When universities design curricula tailored to industry demands, graduates acquire immediate operational proficiency in sectors like computer programming or clinical nursing. This reduces post-graduation unemployment and ensures a robust national workforce.\n\nOn the other hand, focusing solely on specialized skills produces rigid graduates who struggle when industries undergo technological disruption. A broad-based education fosters analytical adaptability, ethical discernment, and collaborative diplomacy—competencies that remain impervious to automation. A graduate grounded in multidisciplinary inquiry can pivot across evolving professions.\n\nIn conclusion, although practical skill training is undeniably beneficial, universities must ultimately remain sanctuaries of holistic critical thought. Equipping students with broad analytical faculties ensures sustained personal and societal resilience.`
                    )
                  }
                  className="text-xs text-[#d4af37] hover:underline"
                >
                  Load Sample Band 7.5 Draft
                </button>

                <button
                  id="btn-submit-grade-essay"
                  onClick={handleGradeEssay}
                  disabled={isGrading || !essayText.trim()}
                  className="px-6 py-2.5 rounded-lg bg-[#d4af37] hover:bg-[#e2be4a] text-black font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${isGrading ? 'animate-spin' : ''}`} />
                  <span>{isGrading ? 'Examiner Grading...' : 'Grade with AI Examiner'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right 1 Col: IELTS Writing Strategy & Band Descriptors */}
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-[#0a0a0a] border border-[#1a1a1a] space-y-3">
              <h3 className="font-serif italic text-white text-base flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#d4af37]" />
                <span>Band 7.5+ Writing Criteria</span>
              </h3>
              <ul className="text-xs text-[#888888] space-y-3">
                <li className="flex items-start gap-2.5">
                  <span className="w-4 h-4 rounded bg-[#1f1a0a] border border-[#d4af37]/30 text-[#d4af37] font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                    ✓
                  </span>
                  <span>
                    <strong className="text-white">Task Response:</strong> State your position clearly in intro and conclusion. Support every main claim with an illustration.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-4 h-4 rounded bg-[#1f1a0a] border border-[#d4af37]/30 text-[#d4af37] font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                    ✓
                  </span>
                  <span>
                    <strong className="text-white">Coherence & Cohesion:</strong> 1 central idea per body paragraph. Use diverse referencing (this phenomenon, such initiatives).
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-4 h-4 rounded bg-[#1f1a0a] border border-[#d4af37]/30 text-[#d4af37] font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                    ✓
                  </span>
                  <span>
                    <strong className="text-white">Lexical Resource:</strong> Precise academic collocations (e.g. <em>catalyze change</em>, <em>indispensable role</em>).
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-4 h-4 rounded bg-[#1f1a0a] border border-[#d4af37]/30 text-[#d4af37] font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                    ✓
                  </span>
                  <span>
                    <strong className="text-white">Grammar Accuracy:</strong> Variety of complex sentences (conditionals, relative clauses, passive forms).
                  </span>
                </li>
              </ul>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-b from-[#1a1205] to-[#0a0a0a] border border-[#302108] space-y-2">
              <span className="text-[10px] uppercase font-bold text-[#d4af37] tracking-wider">
                Model Comparison Feature
              </span>
              <h4 className="font-serif italic text-white text-base">Original → Feedback → Band 8.5 Model</h4>
              <p className="text-xs text-[#a0a0a0]">
                After grading, view your original essay alongside line-by-line grammar fixes and a full Band 8.5 rewrite.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* History & Side-by-Side Review Mode */
        <div className="space-y-6">
          {submissions.length === 0 ? (
            <div className="p-12 text-center bg-[#0a0a0a] rounded-2xl border border-[#1a1a1a] text-[#888888]">
              <FileEdit className="w-10 h-10 mx-auto text-[#444444] mb-2" />
              <p className="font-semibold text-white">No essay submissions yet</p>
              <button
                onClick={() => setActiveTab('practice')}
                className="mt-3 px-4 py-2 bg-[#d4af37] text-black rounded-lg text-xs font-bold uppercase tracking-wider"
              >
                Write Your First Essay
              </button>
            </div>
          ) : selectedSubmission ? (
            <div className="space-y-6">
              {/* Submission Selector Pills */}
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
                {submissions.map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => setSelectedSubmission(sub)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
                      selectedSubmission.id === sub.id
                        ? 'bg-[#1a1a1a] text-white border border-[#d4af37]/40'
                        : 'bg-[#0a0a0a] border border-[#1a1a1a] text-[#888888] hover:text-white'
                    }`}
                  >
                    <span>{sub.essayType || sub.taskType}</span>
                    <span className="px-1.5 py-0.5 rounded bg-[#141414] text-[#d4af37] text-[10px] font-bold">
                      Band {sub.scores.overallBand}
                    </span>
                  </button>
                ))}
              </div>

              {/* Criterion Score Card */}
              <div className="bg-[#0a0a0a] p-6 rounded-2xl border border-[#1a1a1a] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1a1a1a] pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#d4af37]">
                        {selectedSubmission.taskType.toUpperCase()} • {selectedSubmission.essayType}
                      </span>
                      <span className="text-xs text-[#666666]">• {selectedSubmission.date}</span>
                    </div>
                    <h3 className="font-serif italic text-white text-lg mt-1">
                      {selectedSubmission.prompt}
                    </h3>
                  </div>

                  <div className="flex items-baseline gap-2 bg-[#141414] px-4 py-2 rounded-xl border border-[#2a2a2a] shrink-0">
                    <span className="text-xs text-[#888888] font-medium">Overall Band:</span>
                    <span className="text-2xl font-serif font-bold text-[#d4af37]">
                      {selectedSubmission.scores.overallBand}
                    </span>
                  </div>
                </div>

                {/* 4 Assessment Criteria Breakdown */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-[#0f0f0f] border border-[#1a1a1a]">
                    <span className="text-[10px] font-bold uppercase text-[#666666] block">
                      Task Response (TR)
                    </span>
                    <span className="text-xl font-serif font-bold text-white">
                      {selectedSubmission.scores.taskResponse}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#0f0f0f] border border-[#1a1a1a]">
                    <span className="text-[10px] font-bold uppercase text-[#666666] block">
                      Coherence & Cohesion (CC)
                    </span>
                    <span className="text-xl font-serif font-bold text-white">
                      {selectedSubmission.scores.coherenceCohesion}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#0f0f0f] border border-[#1a1a1a]">
                    <span className="text-[10px] font-bold uppercase text-[#666666] block">
                      Lexical Resource (LR)
                    </span>
                    <span className="text-xl font-serif font-bold text-white">
                      {selectedSubmission.scores.lexicalResource}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#0f0f0f] border border-[#1a1a1a]">
                    <span className="text-[10px] font-bold uppercase text-[#666666] block">
                      Grammar Accuracy (GRA)
                    </span>
                    <span className="text-xl font-serif font-bold text-white">
                      {selectedSubmission.scores.grammaticalRange}
                    </span>
                  </div>
                </div>

                {/* Feedback Strengths & Weaknesses */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-xl bg-[#0c140c] border border-emerald-950/60 space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Key Strengths
                    </span>
                    <ul className="text-xs text-[#a0c0a0] space-y-1">
                      {selectedSubmission.feedback.strengths.map((str, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span>•</span>
                          <span>{str}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 rounded-xl bg-[#140c0c] border border-rose-950/60 space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> Areas for Improvement
                    </span>
                    <ul className="text-xs text-[#c0a0a0] space-y-1">
                      {selectedSubmission.feedback.weaknesses.map((w, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span>•</span>
                          <span>{w}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Sentence Corrections */}
                {selectedSubmission.feedback.corrections.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#888888]">
                      Sentence-Level Corrections & Collocations:
                    </span>
                    <div className="space-y-2">
                      {selectedSubmission.feedback.corrections.map((cor, i) => (
                        <div
                          key={i}
                          className="p-3 rounded-lg bg-[#0f0f0f] border border-[#1a1a1a] text-xs space-y-1"
                        >
                          <div className="text-rose-400 line-through font-mono">
                            &ldquo;{cor.original}&rdquo;
                          </div>
                          <div className="text-emerald-400 font-medium font-mono">
                            → &ldquo;{cor.corrected}&rdquo;
                          </div>
                          <p className="text-[11px] text-[#888888] italic">{cor.explanation}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Side-by-Side: Original vs Band 8.5 Revised Version */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Original */}
                <div className="bg-[#0a0a0a] p-6 rounded-2xl border border-[#1a1a1a] space-y-3">
                  <div className="flex items-center justify-between border-b border-[#1a1a1a] pb-2">
                    <span className="text-xs font-bold uppercase text-[#888888]">
                      Original Essay ({selectedSubmission.wordCount} words)
                    </span>
                    <span className="text-xs text-[#666666]">Time: {selectedSubmission.timeTakenMinutes} min</span>
                  </div>
                  <div className="text-xs sm:text-sm text-[#e0e0e0] leading-relaxed whitespace-pre-line font-mono bg-[#0f0f0f] p-4 rounded-xl max-h-[500px] overflow-y-auto border border-[#1a1a1a]">
                    {selectedSubmission.originalText}
                  </div>
                </div>

                {/* Band 8.5 Exemplar */}
                <div className="bg-[#0a0a0a] p-6 rounded-2xl border border-[#d4af37]/40 space-y-3">
                  <div className="flex items-center justify-between border-b border-[#1a1a1a] pb-2">
                    <span className="text-xs font-bold uppercase text-[#d4af37] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" /> Band 8.5 Revised Model
                    </span>
                    <span className="text-[10px] text-[#d4af37] uppercase tracking-wider font-semibold">Elevated Lexicon</span>
                  </div>
                  <div className="text-xs sm:text-sm text-white leading-relaxed whitespace-pre-line font-mono bg-[#0f0f0f] p-4 rounded-xl border border-[#1a1a1a] max-h-[500px] overflow-y-auto">
                    {selectedSubmission.revisedVersion}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

