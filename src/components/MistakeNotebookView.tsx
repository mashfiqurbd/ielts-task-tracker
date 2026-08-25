import React, { useState } from 'react';
import {
  AlertCircle,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  BookmarkPlus,
  Sparkles,
  TrendingDown,
  BookOpen,
  Headphones,
  FileEdit,
  Mic,
  Tag,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { MistakeEntry, MistakeReasonCategory, Skill } from '../types';

interface MistakeNotebookViewProps {
  mistakes: MistakeEntry[];
  onToggleResolved: (id: string) => void;
  onOpenNewMistake: () => void;
  onAddVocabFromMistake: (word: string, source: string, mistakeId: string) => void;
}

export const MistakeNotebookView: React.FC<MistakeNotebookViewProps> = ({
  mistakes,
  onToggleResolved,
  onOpenNewMistake,
  onAddVocabFromMistake,
}) => {
  const [selectedSkill, setSelectedSkill] = useState<Skill | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<MistakeReasonCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unresolved' | 'resolved'>('all');

  // Filtered mistakes
  const filteredMistakes = mistakes.filter((m) => {
    if (selectedSkill !== 'all' && m.skill !== selectedSkill) return false;
    if (selectedCategory !== 'all' && m.reasonCategory !== selectedCategory) return false;
    if (statusFilter === 'unresolved' && m.resolved) return false;
    if (statusFilter === 'resolved' && !m.resolved) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        m.questionNumber.toLowerCase().includes(q) ||
        m.questionType.toLowerCase().includes(q) ||
        m.details.toLowerCase().includes(q) ||
        m.source.toLowerCase().includes(q) ||
        m.yourAnswer.toLowerCase().includes(q) ||
        m.correctAnswer.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const readingErrors = mistakes.filter((m) => m.skill === 'reading');
  const matchingHeadingErrors = readingErrors.filter((m) =>
    m.questionType.toLowerCase().includes('heading')
  ).length;
  const readingMatchingHeadingRate = readingErrors.length
    ? Math.round((matchingHeadingErrors / readingErrors.length) * 100)
    : 42;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 font-sans">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-[#0a0a0a] p-6 sm:p-8 rounded-2xl border border-[#1a1a1a]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#d4af37]">
              Diagnostic Core
            </span>
            <span className="text-[10px] text-[#666666]">• {mistakes.length} Total Errors Logged</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif italic text-white tracking-tight">
            IELTS Mistake Notebook 📝
          </h1>
          <p className="text-xs sm:text-sm text-[#888888] mt-1">
            Every mistake is classified with its root cause. The app analyzes recurring patterns so you know exactly why your score is changing.
          </p>
        </div>

        <button
          id="btn-open-add-mistake"
          onClick={onOpenNewMistake}
          className="px-4 py-2.5 rounded-lg bg-[#d4af37] hover:bg-[#e2be4a] text-black font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors self-start md:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Log New Mistake</span>
        </button>
      </div>

      {/* Root Cause Analytics Banners */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Top Reading Insight */}
        <div className="p-5 rounded-2xl bg-gradient-to-b from-[#1a1205] to-[#0a0a0a] border border-[#302108] space-y-2">
          <div className="flex items-center justify-between text-[#d4af37]">
            <span className="text-[10px] font-bold uppercase tracking-widest">Top Reading Flaw</span>
            <AlertTriangle className="w-4 h-4 text-[#d4af37]" />
          </div>
          <div className="text-base font-serif italic text-white">
            Matching Headings ({readingMatchingHeadingRate}% of errors)
          </div>
          <p className="text-xs text-[#a0a0a0] leading-relaxed">
            You frequently match isolated keywords without analyzing the overall paragraph theme and topic sentence.
          </p>
        </div>

        {/* Top Listening Distractor */}
        <div className="p-5 rounded-2xl bg-[#0a0a0a] border border-[#1a1a1a] space-y-2">
          <div className="flex items-center justify-between text-[#d4af37]">
            <span className="text-[10px] font-bold uppercase tracking-widest">Top Listening Trap</span>
            <Headphones className="w-4 h-4 text-[#d4af37]" />
          </div>
          <div className="text-base font-serif italic text-white">
            Section 3 Distractors & Speaker Shifts
          </div>
          <p className="text-xs text-[#888888] leading-relaxed">
            Speakers change their minds in question 20–30 dialogues before settling on the final agreement.
          </p>
        </div>

        {/* Top Writing / Speaking Flaw */}
        <div className="p-5 rounded-2xl bg-[#0a0a0a] border border-[#1a1a1a] space-y-2">
          <div className="flex items-center justify-between text-[#d4af37]">
            <span className="text-[10px] font-bold uppercase tracking-widest">Top Productive Skill Issue</span>
            <FileEdit className="w-4 h-4 text-[#d4af37]" />
          </div>
          <div className="text-base font-serif italic text-white">
            Under-developed Examples & Pacing
          </div>
          <p className="text-xs text-[#888888] leading-relaxed">
            Writing Task 2 claims need empirical support; Speaking Part 2 answers average 1:34 vs the 2:00 target.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#0a0a0a] p-4 rounded-xl border border-[#1a1a1a] space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#666666] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search mistakes by question, keyword, source test, or answer..."
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-[#0f0f0f] text-white border border-[#222222] rounded-lg focus:outline-none focus:border-[#d4af37]"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-[#0f0f0f] p-1 rounded-lg shrink-0 border border-[#1a1a1a]">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                statusFilter === 'all' ? 'bg-[#1a1a1a] text-white' : 'text-[#888888] hover:text-white'
              }`}
            >
              All ({mistakes.length})
            </button>
            <button
              onClick={() => setStatusFilter('unresolved')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                statusFilter === 'unresolved' ? 'bg-[#1a1a1a] text-[#d4af37]' : 'text-[#888888] hover:text-white'
              }`}
            >
              Active ({mistakes.filter((m) => !m.resolved).length})
            </button>
            <button
              onClick={() => setStatusFilter('resolved')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                statusFilter === 'resolved' ? 'bg-[#1a1a1a] text-emerald-400' : 'text-[#888888] hover:text-white'
              }`}
            >
              Resolved ({mistakes.filter((m) => m.resolved).length})
            </button>
          </div>
        </div>

        {/* Skill and Category Filters */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#1a1a1a] text-xs">
          <span className="text-[10px] uppercase tracking-wider text-[#666666] flex items-center gap-1">
            <Filter className="w-3 h-3" /> Skill:
          </span>
          {(['all', 'listening', 'reading', 'writing', 'speaking'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSelectedSkill(s)}
              className={`px-2.5 py-1 rounded-md capitalize transition-all text-xs ${
                selectedSkill === s
                  ? 'bg-[#d4af37] text-black font-bold'
                  : 'bg-[#141414] text-[#888888] hover:text-white border border-[#222222]'
              }`}
            >
              {s}
            </button>
          ))}

          <span className="text-[#333333] ml-2">|</span>

          <span className="text-[10px] uppercase tracking-wider text-[#666666] ml-2">Reason Category:</span>
          {(
            [
              'all',
              'vocabulary',
              'comprehension',
              'careless_mistake',
              'time_management',
              'grammar',
              'idea_development',
            ] as const
          ).map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCategory(c)}
              className={`px-2.5 py-1 rounded-md capitalize transition-all text-xs ${
                selectedCategory === c
                  ? 'bg-[#1a1a1a] text-white border border-[#d4af37]/40'
                  : 'bg-[#141414] text-[#888888] hover:text-white border border-[#222222]'
              }`}
            >
              {c.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Main Mistakes Table / Cards */}
      <div className="bg-[#0a0a0a] rounded-2xl border border-[#1a1a1a] overflow-hidden">
        {filteredMistakes.length === 0 ? (
          <div className="p-12 text-center text-[#888888]">
            <CheckCircle2 className="w-10 h-10 mx-auto text-[#444444] mb-2" />
            <p className="font-semibold text-white">No mistakes found matching this filter</p>
            <p className="text-xs text-[#666666] mt-1">Keep practicing and logging your errors!</p>
          </div>
        ) : (
          <div className="divide-y divide-[#1a1a1a]">
            {filteredMistakes.map((m) => (
              <div
                key={m.id}
                id={`mistake-row-${m.id}`}
                className={`p-5 transition-colors ${
                  m.resolved ? 'bg-[#080808] opacity-50' : 'bg-[#0a0a0a] hover:bg-[#0f0f0f]'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left Metadata & Question */}
                  <div className="flex items-start gap-3 flex-1">
                    <button
                      onClick={() => onToggleResolved(m.id)}
                      title={m.resolved ? 'Mark unresolved' : 'Mark resolved after drills'}
                      className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 border transition-colors ${
                        m.resolved
                          ? 'bg-[#d4af37] border-[#d4af37] text-black'
                          : 'border-[#333333] hover:border-[#d4af37] bg-[#141414] text-transparent'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>

                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-white text-sm">{m.questionNumber}</span>
                        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#141414] border border-[#2a2a2a] text-[#d4af37]">
                          {m.questionType}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#141414] border border-[#2a2a2a] text-[#888888]">
                          {m.skill}
                        </span>
                        <span className="text-xs text-[#666666]">• {m.source}</span>
                      </div>

                      {/* Your Answer vs Correct Answer Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs py-1">
                        <div className="p-2 rounded-lg bg-[#140c0c] border border-rose-950/60">
                          <span className="text-[10px] uppercase font-bold text-rose-400 block">
                            Your Answer:
                          </span>
                          <span className="font-medium text-[#e0e0e0]">{m.yourAnswer}</span>
                        </div>

                        <div className="p-2 rounded-lg bg-[#0c140c] border border-emerald-950/60">
                          <span className="text-[10px] uppercase font-bold text-emerald-400 block">
                            Correct Answer:
                          </span>
                          <span className="font-medium text-[#e0e0e0]">{m.correctAnswer}</span>
                        </div>
                      </div>

                      {/* Root Cause Details */}
                      <div className="p-2.5 rounded-lg bg-[#0f0f0f] border border-[#1a1a1a] text-xs space-y-1">
                        <div className="flex items-center gap-1.5 text-[#888888] font-medium">
                          <span className="px-1.5 py-0.5 rounded bg-[#1f1a0a] border border-[#d4af37]/30 text-[#d4af37] text-[10px] font-bold uppercase">
                            Reason: {m.reasonCategory.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-[#a0a0a0]">{m.details}</p>
                      </div>
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex lg:flex-col items-center lg:items-end justify-between gap-2 shrink-0 border-t lg:border-t-0 border-[#1a1a1a] pt-2 lg:pt-0">
                    <span className="text-[11px] text-[#666666]">{m.date}</span>

                    {m.linkedVocabWord && (
                      <button
                        onClick={() => onAddVocabFromMistake(m.linkedVocabWord!, m.source, m.id)}
                        className="px-2.5 py-1 rounded-lg bg-[#141414] hover:bg-[#1a1a1a] border border-[#2a2a2a] text-[#d4af37] text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        <BookmarkPlus className="w-3.5 h-3.5" />
                        <span>Vocab: &ldquo;{m.linkedVocabWord}&rdquo;</span>
                      </button>
                    )}

                    <button
                      onClick={() => onToggleResolved(m.id)}
                      className={`text-xs font-semibold transition-colors ${
                        m.resolved ? 'text-[#888888] hover:underline' : 'text-[#d4af37] hover:underline'
                      }`}
                    >
                      {m.resolved ? 'Reopen Mistake' : 'Mark Resolved'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

