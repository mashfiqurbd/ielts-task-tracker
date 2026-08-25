import React, { useState } from 'react';
import { MistakeEntry, MistakeReasonCategory, Skill } from '../types';

interface AddMistakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMistake: (mistake: MistakeEntry) => void;
}

export const AddMistakeModal: React.FC<AddMistakeModalProps> = ({
  isOpen,
  onClose,
  onAddMistake,
}) => {
  if (!isOpen) return null;

  const [skill, setSkill] = useState<Skill>('reading');
  const [questionNumber, setQuestionNumber] = useState<string>('Q14');
  const [questionType, setQuestionType] = useState<string>('Matching Headings');
  const [yourAnswer, setYourAnswer] = useState<string>('');
  const [correctAnswer, setCorrectAnswer] = useState<string>('');
  const [reasonCategory, setReasonCategory] = useState<MistakeReasonCategory>('comprehension');
  const [details, setDetails] = useState<string>('');
  const [source, setSource] = useState<string>('Cambridge IELTS 18 Test 2');
  const [linkedVocabWord, setLinkedVocabWord] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionNumber.trim() || !details.trim()) return;

    const newMistake: MistakeEntry = {
      id: `mis-${Date.now()}`,
      skill,
      questionNumber: questionNumber.trim(),
      questionType: questionType.trim() || 'General',
      yourAnswer: yourAnswer.trim() || 'Incorrect choice',
      correctAnswer: correctAnswer.trim() || 'Correct choice',
      reasonCategory,
      details: details.trim(),
      source: source.trim() || 'Practice Session',
      date: '24 Aug 2026',
      resolved: false,
      linkedVocabWord: linkedVocabWord.trim() || undefined,
    };

    onAddMistake(newMistake);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 font-sans">
      <div className="bg-[#0a0a0a] w-full max-w-xl rounded-2xl shadow-2xl border border-[#1a1a1a] p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-[#1a1a1a] pb-3">
          <div>
            <h3 className="font-serif italic text-white text-base">Log Error into Mistake Notebook</h3>
            <p className="text-xs text-[#888888]">
              Categorize the root cause to track error trends
            </p>
          </div>
          <button onClick={onClose} className="text-[#666666] hover:text-white font-bold p-1">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] uppercase font-bold text-[#888888] mb-1">Skill</label>
              <select
                value={skill}
                onChange={(e) => setSkill(e.target.value as Skill)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-[#141414] border border-[#222222] rounded-lg text-[#e0e0e0] capitalize focus:outline-none focus:border-[#d4af37]"
              >
                <option value="reading">Reading</option>
                <option value="listening">Listening</option>
                <option value="writing">Writing</option>
                <option value="speaking">Speaking</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-[#888888] mb-1">Question # / Reference *</label>
              <input
                type="text"
                required
                value={questionNumber}
                onChange={(e) => setQuestionNumber(e.target.value)}
                placeholder="e.g. Q14, Part 2 Topic"
                className="w-full px-3 py-2 text-xs sm:text-sm bg-[#141414] border border-[#222222] rounded-lg text-[#e0e0e0] focus:outline-none focus:border-[#d4af37]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] uppercase font-bold text-[#888888] mb-1">Question Type</label>
              <input
                type="text"
                value={questionType}
                onChange={(e) => setQuestionType(e.target.value)}
                placeholder="e.g. T/F/NG, Matching Headings"
                className="w-full px-3 py-2 text-xs sm:text-sm bg-[#141414] border border-[#222222] rounded-lg text-[#e0e0e0] focus:outline-none focus:border-[#d4af37]"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-[#888888] mb-1">Source / Test</label>
              <input
                type="text"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="e.g. Cambridge 18 Test 2"
                className="w-full px-3 py-2 text-xs sm:text-sm bg-[#141414] border border-[#222222] rounded-lg text-[#e0e0e0] focus:outline-none focus:border-[#d4af37]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] uppercase font-bold text-rose-400 mb-1">Your Answer</label>
              <input
                type="text"
                value={yourAnswer}
                onChange={(e) => setYourAnswer(e.target.value)}
                placeholder="e.g. False"
                className="w-full px-3 py-2 text-xs sm:text-sm bg-[#141414] border border-[#222222] rounded-lg text-rose-300 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-emerald-400 mb-1">Correct Answer</label>
              <input
                type="text"
                value={correctAnswer}
                onChange={(e) => setCorrectAnswer(e.target.value)}
                placeholder="e.g. Not Given"
                className="w-full px-3 py-2 text-xs sm:text-sm bg-[#141414] border border-[#222222] rounded-lg font-semibold text-emerald-400 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-[#888888] mb-1">Root Cause Category</label>
            <select
              value={reasonCategory}
              onChange={(e) => setReasonCategory(e.target.value as MistakeReasonCategory)}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-[#141414] border border-[#222222] rounded-lg text-[#e0e0e0] focus:outline-none focus:border-[#d4af37]"
            >
              <option value="vocabulary">Vocabulary (Unknown word / paraphrasing gap)</option>
              <option value="comprehension">Comprehension (Misunderstood context or logic)</option>
              <option value="careless_mistake">Careless Mistake (Jumped to conclusion)</option>
              <option value="time_management">Time Management (Rushed through)</option>
              <option value="grammar">Grammar Error (Syntax / Tenses)</option>
              <option value="idea_development">Idea Development (Under-elaborated)</option>
              <option value="coherence_cohesion">Coherence & Cohesion</option>
              <option value="pronunciation">Pronunciation / Speech pacing</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-[#d4af37] mb-1">
              Extract Unknown Word to Mistake Vocab (Optional)
            </label>
            <input
              type="text"
              value={linkedVocabWord}
              onChange={(e) => setLinkedVocabWord(e.target.value)}
              placeholder="e.g. empirical, inadvertent"
              className="w-full px-3 py-2 text-xs sm:text-sm bg-[#141414] border border-[#222222] rounded-lg text-[#d4af37] focus:outline-none focus:border-[#d4af37]"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-[#888888] mb-1">
              Why did you make this mistake? (Diagnostic Analysis) *
            </label>
            <textarea
              required
              rows={2}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="e.g. Matched the word 'finance' in paragraph 2 instead of looking for the overall central theme of the paragraph."
              className="w-full px-3 py-2 text-xs sm:text-sm bg-[#141414] border border-[#222222] rounded-lg text-[#e0e0e0] focus:outline-none focus:border-[#d4af37]"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#1a1a1a]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-medium text-[#888888] hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#d4af37] hover:bg-[#e2be4a] text-black rounded-lg font-bold text-xs uppercase tracking-wider transition-colors"
            >
              Save to Mistake Notebook
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

