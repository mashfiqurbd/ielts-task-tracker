/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { TasksView } from './components/TasksView';
import { MistakeNotebookView } from './components/MistakeNotebookView';
import { WritingTrackerView } from './components/WritingTrackerView';
import { SpeakingTrackerView } from './components/SpeakingTrackerView';
import { VocabularyView } from './components/VocabularyView';
import { ProgressAnalyticsView } from './components/ProgressAnalyticsView';
import { ProfileView } from './components/ProfileView';
import { ActiveTaskModal } from './components/ActiveTaskModal';
import { AddTaskModal } from './components/AddTaskModal';
import { AddMistakeModal } from './components/AddMistakeModal';

import {
  UserProfile,
  IELTSTask,
  PracticeRecord,
  MistakeEntry,
  WritingSubmission,
  SpeakingRecording,
  VocabItem,
} from './types';

import {
  getUserProfile,
  saveUserProfile,
  getTasks,
  saveTasks,
  getPracticeRecords,
  savePracticeRecords,
  getMistakes,
  saveMistakes,
  getWritingSubmissions,
  saveWritingSubmissions,
  getSpeakingRecordings,
  saveSpeakingRecordings,
  getVocabList,
  saveVocabList,
  resetToInitialData,
  calculateOverallBand,
} from './utils/storage';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Application Data States
  const [profile, setProfile] = useState<UserProfile>(getUserProfile());
  const [tasks, setTasks] = useState<IELTSTask[]>(getTasks());
  const [records, setRecords] = useState<PracticeRecord[]>(getPracticeRecords());
  const [mistakes, setMistakes] = useState<MistakeEntry[]>(getMistakes());
  const [writings, setWritings] = useState<WritingSubmission[]>(getWritingSubmissions());
  const [speakings, setSpeakings] = useState<SpeakingRecording[]>(getSpeakingRecordings());
  const [vocabList, setVocabList] = useState<VocabItem[]>(getVocabList());

  // Modal States
  const [activePracticeTask, setActivePracticeTask] = useState<IELTSTask | null>(null);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState<boolean>(false);
  const [isAddMistakeOpen, setIsAddMistakeOpen] = useState<boolean>(false);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState<boolean>(false);

  // Sync to local storage
  useEffect(() => {
    saveUserProfile(profile);
  }, [profile]);

  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  useEffect(() => {
    savePracticeRecords(records);
  }, [records]);

  useEffect(() => {
    saveMistakes(mistakes);
  }, [mistakes]);

  useEffect(() => {
    saveWritingSubmissions(writings);
  }, [writings]);

  useEffect(() => {
    saveSpeakingRecordings(speakings);
  }, [speakings]);

  useEffect(() => {
    saveVocabList(vocabList);
  }, [vocabList]);

  // Recalculate Band when practice records or skill scores update
  const refreshEstimatedBand = () => {
    const updatedBand = calculateOverallBand(
      profile.skills.listening.current,
      profile.skills.reading.current,
      profile.skills.writing.current,
      profile.skills.speaking.current
    );
    setProfile((prev) => ({ ...prev, currentBand: updatedBand }));
  };

  // Handlers for Practice Session Completion
  const handleSaveRecordAndComplete = (
    completedTask: IELTSTask,
    newRecord: PracticeRecord,
    newMistakes: MistakeEntry[],
    newVocabs?: VocabItem[]
  ) => {
    // 1. Mark task completed
    const updatedTasks = tasks.map((t) =>
      t.id === completedTask.id ? { ...t, status: 'completed' as const } : t
    );
    setTasks(updatedTasks);

    // 2. Add practice record
    setRecords((prev) => [newRecord, ...prev]);

    // 3. Add any logged mistakes
    if (newMistakes.length > 0) {
      setMistakes((prev) => [...newMistakes, ...prev]);
    }

    // 4. Add any new vocabulary extracted from mistakes
    if (newVocabs && newVocabs.length > 0) {
      setVocabList((prev) => [...newVocabs, ...prev]);
    }

    // 5. Update skill score if estimatedBand improved
    if (newRecord.estimatedBand) {
      setProfile((prev) => {
        const skillKey = completedTask.skill;
        if (skillKey === 'listening' || skillKey === 'reading' || skillKey === 'writing' || skillKey === 'speaking') {
          const currentSkillScore = prev.skills[skillKey].current;
          // Weighted moving average
          const updatedScore = Math.round(((currentSkillScore * 0.7 + newRecord.estimatedBand! * 0.3) * 2)) / 2;
          return {
            ...prev,
            skills: {
              ...prev.skills,
              [skillKey]: {
                ...prev.skills[skillKey],
                current: Math.min(9.0, Math.max(4.0, updatedScore)),
              },
            },
          };
        }
        return prev;
      });
      refreshEstimatedBand();
    }
  };

  // Task Status Toggle
  const handleToggleTaskStatus = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const nextStatus = t.status === 'completed' ? 'pending' : 'completed';
          return { ...t, status: nextStatus };
        }
        return t;
      })
    );
  };

  // Mistake Resolved Toggle
  const handleToggleMistakeResolved = (mistakeId: string) => {
    setMistakes((prev) =>
      prev.map((m) => {
        if (m.id === mistakeId) {
          return { ...m, resolved: !m.resolved };
        }
        return m;
      })
    );
  };

  // Extract Vocab from Mistake Notebook
  const handleAddVocabFromMistake = (word: string, source: string, mistakeId: string) => {
    const existing = vocabList.find((v) => v.word.toLowerCase() === word.toLowerCase());
    if (existing) {
      setActiveTab('vocab');
      return;
    }

    const newVocab: VocabItem = {
      id: `voc-${Date.now()}`,
      word: word.trim().toLowerCase(),
      phonetic: '/.../',
      partOfSpeech: 'academic vocabulary',
      meaning: `Encountered in mistake question from ${source}.`,
      synonyms: ['crucial', 'essential'],
      collocations: ['academic collocation'],
      example: `The word "${word}" appeared in IELTS practice test.`,
      source,
      status: 'learning',
      addedDate: '2026-08-24',
      reviewCount: 0,
      masteryScore: 15,
    };

    setVocabList((prev) => [newVocab, ...prev]);
    setActiveTab('vocab');
  };

  // AI Adaptive Study Plan Generation
  const handleRegenerateStudyPlan = async () => {
    setIsGeneratingPlan(true);
    try {
      const topWeaknesses = [
        'Reading Matching Headings',
        'Listening Section 3 Distractors',
        'Writing Task 2 Argument Development',
        'Speaking Part 2 2-Minute Time Pacing',
      ];

      const res = await fetch('/api/ai/generate-study-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentBand: profile.currentBand,
          targetBand: profile.targetBand,
          daysUntilExam: 42,
          weakAreas: topWeaknesses,
        }),
      });

      const data = await res.json();
      if (data.tasks && Array.isArray(data.tasks) && data.tasks.length > 0) {
        setTasks(data.tasks);
      }
    } catch (e) {
      console.error('Plan generation failed', e);
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  // Reset demo data handler
  const handleResetToDemo = () => {
    if (window.confirm('Reset all IELTS tasks, mistakes, and essays to default demonstration dataset?')) {
      const initial = resetToInitialData();
      setProfile(initial.profile);
      setTasks(initial.tasks);
      setRecords(initial.records);
      setMistakes(initial.mistakes);
      setWritings(initial.writings);
      setSpeakings(initial.speakings);
      setVocabList(initial.vocab);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#e0e0e0] flex flex-col font-sans selection:bg-[#d4af37]/30 selection:text-[#d4af37]">
      {/* Top Main Navigation */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        profile={profile}
        mistakeCount={mistakes.filter((m) => !m.resolved).length}
        taskCount={tasks.filter((t) => t.status !== 'completed').length}
        onOpenNewTask={() => setIsAddTaskOpen(true)}
        onOpenNewMistake={() => setIsAddMistakeOpen(true)}
      />

      {/* Main View Router */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'dashboard' && (
          <DashboardView
            profile={profile}
            tasks={tasks}
            records={records}
            mistakes={mistakes}
            onStartTask={(task) => setActivePracticeTask(task)}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'tasks' && (
          <TasksView
            tasks={tasks}
            profile={profile}
            onStartTask={(task) => setActivePracticeTask(task)}
            onToggleTaskStatus={handleToggleTaskStatus}
            onOpenNewTask={() => setIsAddTaskOpen(true)}
            onRegeneratePlan={handleRegenerateStudyPlan}
            isGeneratingPlan={isGeneratingPlan}
          />
        )}

        {activeTab === 'mistakes' && (
          <MistakeNotebookView
            mistakes={mistakes}
            onToggleResolved={handleToggleMistakeResolved}
            onOpenNewMistake={() => setIsAddMistakeOpen(true)}
            onAddVocabFromMistake={handleAddVocabFromMistake}
          />
        )}

        {activeTab === 'writing' && (
          <WritingTrackerView
            submissions={writings}
            onGradeAndSaveEssay={(sub) => {
              setWritings((prev) => [sub, ...prev]);
            }}
          />
        )}

        {activeTab === 'speaking' && (
          <SpeakingTrackerView
            recordings={speakings}
            onSaveRecording={(rec) => {
              setSpeakings((prev) => [rec, ...prev]);
            }}
          />
        )}

        {activeTab === 'vocab' && (
          <VocabularyView
            vocabList={vocabList}
            onAddVocab={(item) => setVocabList((prev) => [item, ...prev])}
            onUpdateVocabStatus={(id, status) => {
              setVocabList((prev) =>
                prev.map((v) => (v.id === id ? { ...v, status } : v))
              );
            }}
            onDeleteVocab={(id) => {
              setVocabList((prev) => prev.filter((v) => v.id !== id));
            }}
          />
        )}

        {activeTab === 'progress' && (
          <ProgressAnalyticsView
            profile={profile}
            records={records}
            mistakes={mistakes}
            tasks={tasks}
            writings={writings}
            speakings={speakings}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileView
            profile={profile}
            onUpdateProfile={setProfile}
            onResetToDemoData={handleResetToDemo}
          />
        )}
      </main>

      {/* Interactive Active Practice Session Modal with Live Stopwatch & Mistake Logger */}
      <ActiveTaskModal
        task={activePracticeTask}
        isOpen={Boolean(activePracticeTask)}
        onClose={() => setActivePracticeTask(null)}
        onSaveRecordAndComplete={handleSaveRecordAndComplete}
        onJumpToTask={(title, skill) => {
          const matching = tasks.find((t) => t.title.toLowerCase().includes(title.toLowerCase()));
          if (matching) {
            setActivePracticeTask(matching);
          } else {
            const tempTask: IELTSTask = {
              id: `task-rec-${Date.now()}`,
              title,
              skill,
              category: 'targeted_drill',
              estimatedMinutes: 30,
              priority: 'high',
              status: 'pending',
              description: `Targeted practice session generated from diagnostic analysis.`,
            };
            setTasks((prev) => [tempTask, ...prev]);
            setActivePracticeTask(tempTask);
          }
        }}
      />

      {/* Add New Custom Practice Task Modal */}
      <AddTaskModal
        isOpen={isAddTaskOpen}
        onClose={() => setIsAddTaskOpen(false)}
        onAddTask={(task) => setTasks((prev) => [task, ...prev])}
      />

      {/* Add New Mistake Modal */}
      <AddMistakeModal
        isOpen={isAddMistakeOpen}
        onClose={() => setIsAddMistakeOpen(false)}
        onAddMistake={(mistake) => setMistakes((prev) => [mistake, ...prev])}
      />
    </div>
  );
}

