import React, { useState } from 'react';
import {
  BookMarked,
  Sparkles,
  Plus,
  Search,
  CheckCircle2,
  RotateCcw,
  Volume2,
  Layers,
  Award,
  BookOpen,
  Filter,
  ArrowRight,
  Trash2,
} from 'lucide-react';
import { VocabItem } from '../types';

interface VocabularyViewProps {
  vocabList: VocabItem[];
  onAddVocab: (item: VocabItem) => void;
  onUpdateVocabStatus: (id: string, status: VocabItem['status']) => void;
  onDeleteVocab: (id: string) => void;
}

export const VocabularyView: React.FC<VocabularyViewProps> = ({
  vocabList,
  onAddVocab,
  onUpdateVocabStatus,
  onDeleteVocab,
}) => {
  const [activeTab, setActiveTab] = useState<'list' | 'flashcards'>('list');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'learning' | 'reviewing' | 'mastered'>('all');

  // Flashcard mode state
  const [currentCardIndex, setCurrentCardIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);

  // New word form state & AI lookup
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [newWord, setNewWord] = useState<string>('');
  const [newSource, setNewSource] = useState<string>('Cambridge IELTS 18');
  const [isLookingUpAI, setIsLookingUpAI] = useState<boolean>(false);
  const [aiData, setAiData] = useState<{
    phonetic?: string;
    partOfSpeech?: string;
    meaning?: string;
    synonyms?: string[];
    collocations?: string[];
    example?: string;
  } | null>(null);

  const filteredVocab = vocabList.filter((item) => {
    if (statusFilter !== 'all' && item.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.word.toLowerCase().includes(q) ||
        item.meaning.toLowerCase().includes(q) ||
        item.source.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleAiLookup = async () => {
    if (!newWord.trim()) return;
    setIsLookingUpAI(true);

    try {
      const res = await fetch('/api/ai/vocab-details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word: newWord.trim(), context: newSource }),
      });
      const data = await res.json();
      setAiData(data);
    } catch (e) {
      console.error('AI vocab lookup error', e);
    } finally {
      setIsLookingUpAI(false);
    }
  };

  const handleSaveNewWord = () => {
    if (!newWord.trim()) return;

    const item: VocabItem = {
      id: `voc-${Date.now()}`,
      word: newWord.trim().toLowerCase(),
      phonetic: aiData?.phonetic || '/.../',
      partOfSpeech: aiData?.partOfSpeech || 'academic noun/adjective',
      meaning: aiData?.meaning || 'Academic vocabulary term extracted from mistake analysis.',
      synonyms: aiData?.synonyms || ['essential', 'paramount'],
      collocations: aiData?.collocations || ['academic collocation'],
      example: aiData?.example || `The term "${newWord}" is common in IELTS academic reading passages.`,
      source: newSource || 'Mistake Notebook',
      status: 'learning',
      addedDate: '2026-08-24',
      reviewCount: 0,
      masteryScore: 10,
    };

    onAddVocab(item);
    setIsAddModalOpen(false);
    setNewWord('');
    setAiData(null);
  };

  const currentFlashcard = filteredVocab[currentCardIndex] || filteredVocab[0];

  const handleRateFlashcard = (status: VocabItem['status']) => {
    if (currentFlashcard) {
      onUpdateVocabStatus(currentFlashcard.id, status);
    }
    setIsFlipped(false);
    if (currentCardIndex < filteredVocab.length - 1) {
      setCurrentCardIndex((prev) => prev + 1);
    } else {
      setCurrentCardIndex(0);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 font-sans">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-[#0a0a0a] p-6 sm:p-8 rounded-2xl border border-[#1a1a1a]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#d4af37]">
              Vocabulary from My Mistakes
            </span>
            <span className="text-[10px] text-[#666666]">• {vocabList.length} High-Yield Words</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif italic text-white tracking-tight">
            IELTS Vocabulary Vault 🧠
          </h1>
          <p className="text-xs sm:text-sm text-[#888888] mt-1">
            Words you missed in real tests with academic collocations and spaced-repetition flashcards.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#0a0a0a] p-1 rounded-xl border border-[#1a1a1a]">
          <button
            onClick={() => setActiveTab('list')}
            className={`px-4 py-2 text-xs font-medium rounded-lg transition-all ${
              activeTab === 'list'
                ? 'bg-[#1a1a1a] text-white'
                : 'text-[#888888] hover:text-white'
            }`}
          >
            Word List ({vocabList.length})
          </button>
          <button
            onClick={() => {
              setActiveTab('flashcards');
              setCurrentCardIndex(0);
              setIsFlipped(false);
            }}
            className={`px-4 py-2 text-xs font-medium rounded-lg transition-all ${
              activeTab === 'flashcards'
                ? 'bg-[#1a1a1a] text-white'
                : 'text-[#888888] hover:text-white'
            }`}
          >
            Spaced Flashcards
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-[#d4af37] hover:bg-[#e2be4a] text-black text-xs font-bold uppercase tracking-wider rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Word</span>
          </button>
        </div>
      </div>

      {activeTab === 'list' ? (
        /* List Mode */
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="bg-[#0a0a0a] p-4 rounded-xl border border-[#1a1a1a] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#666666] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search vocabulary words, collocations, or test sources..."
                className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-[#141414] border border-[#222222] rounded-lg focus:outline-none focus:border-[#d4af37] text-[#e0e0e0]"
              />
            </div>

            <div className="flex items-center gap-1 bg-[#141414] p-1 rounded-lg border border-[#222222] shrink-0">
              {(['all', 'learning', 'reviewing', 'mastered'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 text-xs font-medium capitalize rounded-md transition-all ${
                    statusFilter === st ? 'bg-[#1a1a1a] text-white font-bold' : 'text-[#888888] hover:text-white'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredVocab.length === 0 ? (
              <div className="col-span-full p-12 text-center bg-[#0a0a0a] rounded-2xl border border-[#1a1a1a] text-[#888888]">
                <BookOpen className="w-10 h-10 mx-auto text-[#444444] mb-2" />
                <p className="font-semibold text-white">No vocabulary items match this filter</p>
              </div>
            ) : (
              filteredVocab.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#0a0a0a] p-5 rounded-2xl border border-[#1a1a1a] hover:border-[#333333] transition-all space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-serif italic text-white">{item.word}</h3>
                          <span className="text-xs text-[#666666] font-mono">{item.phonetic}</span>
                        </div>
                        <span className="text-[11px] font-medium text-[#d4af37] italic block">
                          {item.partOfSpeech}
                        </span>
                      </div>

                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          item.status === 'mastered'
                            ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-900/60'
                            : item.status === 'reviewing'
                            ? 'bg-amber-950/60 text-amber-400 border border-amber-900/60'
                            : 'bg-[#141414] text-[#a0a0a0] border border-[#222222]'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>

                    <p className="text-xs text-[#a0a0a0] font-medium leading-relaxed">{item.meaning}</p>

                    {/* Collocations */}
                    {item.collocations && item.collocations.length > 0 && (
                      <div className="p-2.5 rounded-lg bg-[#0f0f0f] border border-[#1a1a1a] space-y-1">
                        <span className="text-[10px] uppercase font-bold text-[#d4af37] block">
                          Band 8 Collocations:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {item.collocations.map((col, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded bg-[#141414] text-[11px] text-[#e0e0e0] font-medium border border-[#222222]"
                            >
                              {col}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Example sentence */}
                    <div className="p-2.5 rounded-lg bg-[#0f0f0f] border border-[#1a1a1a] text-xs italic text-[#888888]">
                      &ldquo;{item.example}&rdquo;
                    </div>
                  </div>

                  {/* Footer metadata & actions */}
                  <div className="pt-2 border-t border-[#1a1a1a] flex items-center justify-between text-xs">
                    <span className="text-[#666666] text-[11px]">Source: {item.source}</span>
                    <div className="flex items-center gap-2">
                      <select
                        value={item.status}
                        onChange={(e) =>
                          onUpdateVocabStatus(item.id, e.target.value as VocabItem['status'])
                        }
                        className="text-[11px] font-medium bg-[#141414] text-[#e0e0e0] border border-[#222222] rounded px-2 py-1 focus:outline-none focus:border-[#d4af37]"
                      >
                        <option value="learning">Learning</option>
                        <option value="reviewing">Reviewing</option>
                        <option value="mastered">Mastered</option>
                      </select>
                      <button
                        onClick={() => onDeleteVocab(item.id)}
                        className="text-[#555555] hover:text-rose-400 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        /* Spaced Repetition Flashcard Mode */
        <div className="max-w-xl mx-auto space-y-6">
          {filteredVocab.length === 0 ? (
            <div className="p-12 text-center bg-[#0a0a0a] rounded-2xl border border-[#1a1a1a] text-[#888888]">
              <BookOpen className="w-10 h-10 mx-auto text-[#444444] mb-2" />
              <p className="font-semibold text-white">No flashcards available</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-[#888888]">
                <span>
                  Card {currentCardIndex + 1} of {filteredVocab.length}
                </span>
                <span className="font-medium text-[#d4af37]">
                  Status: {currentFlashcard.status.toUpperCase()}
                </span>
              </div>

              {/* Interactive Flip Card */}
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className={`min-h-[300px] p-8 rounded-2xl cursor-pointer transition-all duration-300 flex flex-col justify-between shadow-lg text-center ${
                  isFlipped
                    ? 'bg-gradient-to-b from-[#141005] to-[#0a0a0a] border border-[#302108] text-white'
                    : 'bg-[#0a0a0a] border border-[#1a1a1a] text-white hover:border-[#d4af37]/40'
                }`}
              >
                {!isFlipped ? (
                  /* Front of Card */
                  <div className="my-auto space-y-3">
                    <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#d4af37] bg-[#1f1a0a] px-3 py-1 rounded-full border border-[#d4af37]/30">
                      Tap to Reveal Meaning & Collocations
                    </span>
                    <h2 className="text-4xl font-serif italic tracking-tight mt-4 text-white">
                      {currentFlashcard.word}
                    </h2>
                    <p className="text-sm font-mono text-[#888888]">{currentFlashcard.phonetic}</p>
                    <p className="text-xs text-[#666666] pt-2">Learned from: {currentFlashcard.source}</p>
                  </div>
                ) : (
                  /* Back of Card */
                  <div className="my-auto space-y-4 text-left">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[#d4af37] block">Meaning:</span>
                      <p className="text-base font-serif italic text-white mt-1 leading-snug">
                        {currentFlashcard.meaning}
                      </p>
                    </div>

                    {currentFlashcard.collocations && (
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-[#d4af37] block">
                          Academic Collocations:
                        </span>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {currentFlashcard.collocations.map((c, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded bg-[#141414] text-xs font-medium text-[#e0e0e0] border border-[#222222]"
                            >
                              {c}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[#d4af37] block">Example:</span>
                      <p className="text-xs italic text-[#a0a0a0] mt-1">
                        &ldquo;{currentFlashcard.example}&rdquo;
                      </p>
                    </div>
                  </div>
                )}

                <div className="text-[11px] text-[#666666] font-medium">
                  {isFlipped ? 'Select your confidence rating below ↓' : 'Click anywhere on card to flip'}
                </div>
              </div>

              {/* Spaced Repetition Rating Buttons */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <button
                  onClick={() => handleRateFlashcard('learning')}
                  className="py-3 px-4 rounded-xl bg-[#140c0c] hover:bg-[#1a1010] text-rose-400 border border-rose-950/80 text-xs font-bold transition-colors"
                >
                  Hard (Keep Learning)
                </button>
                <button
                  onClick={() => handleRateFlashcard('reviewing')}
                  className="py-3 px-4 rounded-xl bg-[#14120a] hover:bg-[#1a160c] text-amber-400 border border-amber-950/80 text-xs font-bold transition-colors"
                >
                  Good (Review Soon)
                </button>
                <button
                  onClick={() => handleRateFlashcard('mastered')}
                  className="py-3 px-4 rounded-xl bg-[#0c140c] hover:bg-[#101a10] text-emerald-400 border border-emerald-950/80 text-xs font-bold transition-colors"
                >
                  Mastered (Band 8+)
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add New Word Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0a0a0a] w-full max-w-lg rounded-2xl shadow-2xl border border-[#1a1a1a] p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#1a1a1a] pb-3">
              <h3 className="font-serif italic text-white text-lg">Add Word to Mistake Vocabulary</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-[#666666] hover:text-white text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-bold text-[#888888] mb-1">Vocabulary Word</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newWord}
                    onChange={(e) => setNewWord(e.target.value)}
                    placeholder="e.g. ubiquitous, corroborate, exacerbate"
                    className="flex-1 px-3 py-2 text-xs sm:text-sm bg-[#141414] border border-[#222222] rounded-lg focus:outline-none focus:border-[#d4af37] text-[#e0e0e0]"
                  />
                  <button
                    onClick={handleAiLookup}
                    disabled={isLookingUpAI || !newWord.trim()}
                    className="px-3.5 py-2 bg-[#d4af37] text-black rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1 hover:bg-[#e2be4a] disabled:opacity-50"
                  >
                    <Sparkles className={`w-3.5 h-3.5 ${isLookingUpAI ? 'animate-spin' : ''}`} />
                    <span>AI Lookup</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider font-bold text-[#888888] mb-1">
                  Encountered Source Test
                </label>
                <input
                  type="text"
                  value={newSource}
                  onChange={(e) => setNewSource(e.target.value)}
                  placeholder="e.g. Cambridge IELTS 18 Test 2 Reading Passage 3"
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-[#141414] border border-[#222222] rounded-lg focus:outline-none focus:border-[#d4af37] text-[#e0e0e0]"
                />
              </div>

              {aiData && (
                <div className="p-3 rounded-xl bg-[#0f0f0f] border border-[#1a1a1a] text-xs space-y-2">
                  <div>
                    <span className="font-bold text-[#d4af37]">Definition:</span>
                    <p className="text-[#e0e0e0]">{aiData.meaning}</p>
                  </div>
                  <div>
                    <span className="font-bold text-[#d4af37]">Band 8 Collocations:</span>
                    <p className="text-[#e0e0e0] font-semibold">{aiData.collocations?.join(', ')}</p>
                  </div>
                  <div>
                    <span className="font-bold text-[#d4af37]">Example:</span>
                    <p className="text-[#a0a0a0] italic">{aiData.example}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#1a1a1a]">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-[#888888] hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNewWord}
                disabled={!newWord.trim()}
                className="px-5 py-2 bg-[#d4af37] hover:bg-[#e2be4a] text-black rounded-lg text-xs font-bold uppercase tracking-wider disabled:opacity-50"
              >
                Save Vocabulary Card
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

