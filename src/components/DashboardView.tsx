import React from 'react';
import {
  Target,
  Flame,
  Clock,
  CheckCircle2,
  TrendingUp,
  Headphones,
  BookOpen,
  FileEdit,
  Mic,
  AlertTriangle,
  Play,
  ArrowRight,
  Sparkles,
  ChevronRight,
  PlusCircle,
  BarChart2,
  Calendar,
} from 'lucide-react';
import {
  UserProfile,
  IELTSTask,
  PracticeRecord,
  MistakeEntry,
  Skill,
  ActiveTab,
} from '../types';

interface DashboardViewProps {
  profile: UserProfile;
  tasks: IELTSTask[];
  records: PracticeRecord[];
  mistakes: MistakeEntry[];
  onStartTask: (task: IELTSTask) => void;
  onNavigateTab: (tab: any) => void;
  onOpenNewTask?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  profile,
  tasks,
  records,
  mistakes,
  onStartTask,
  onNavigateTab,
  onOpenNewTask,
}) => {
  // Format weekly study hours
  const hours = Math.floor(profile.studyTimeThisWeekMinutes / 60);
  const mins = profile.studyTimeThisWeekMinutes % 60;

  // Filter today's tasks
  const todayTasks = tasks.filter(
    (t) => t.scheduledDate === '2026-08-24' || t.dayOfWeek === 'Monday' || t.status === 'in_progress' || t.status === 'pending'
  );
  const completedToday = todayTasks.filter((t) => t.status === 'completed').length;

  // Mistake root cause analysis
  const readingMistakes = mistakes.filter((m) => m.skill === 'reading');
  const matchingHeadingMistakes = readingMistakes.filter(
    (m) => m.questionType.toLowerCase().includes('heading')
  ).length;
  const matchingHeadingPercentage = readingMistakes.length
    ? Math.round((matchingHeadingMistakes / readingMistakes.length) * 100)
    : 42;

  // Calculate distance to target
  const currentBandNum = profile.currentBand || profile.estimatedBand || 6.5;
  const bandDifference = Math.max(0, profile.targetBand - currentBandNum);

  // 4 Skill Card definitions
  const skillCards: Array<{
    skill: Skill;
    name: string;
    icon: React.ElementType;
    current: number;
    target: number;
    recentIssue: string;
  }> = [
    {
      skill: 'listening',
      name: 'Listening',
      icon: Headphones,
      current: profile.skills?.listening?.current || profile.skillBands?.listening?.current || 6.5,
      target: profile.skills?.listening?.target || profile.skillBands?.listening?.target || 7.5,
      recentIssue: 'Last: 7.0 (Cambridge 18)',
    },
    {
      skill: 'reading',
      name: 'Reading',
      icon: BookOpen,
      current: profile.skills?.reading?.current || profile.skillBands?.reading?.current || 6.0,
      target: profile.skills?.reading?.target || profile.skillBands?.reading?.target || 7.5,
      recentIssue: `Needs Focus: Matching Headings (${matchingHeadingPercentage}% err)`,
    },
    {
      skill: 'writing',
      name: 'Writing',
      icon: FileEdit,
      current: profile.skills?.writing?.current || profile.skillBands?.writing?.current || 6.0,
      target: profile.skills?.writing?.target || profile.skillBands?.writing?.target || 7.0,
      recentIssue: 'Last: Task 2 Opinion Essay',
    },
    {
      skill: 'speaking',
      name: 'Speaking',
      icon: Mic,
      current: profile.skills?.speaking?.current || profile.skillBands?.speaking?.current || 6.5,
      target: profile.skills?.speaking?.target || profile.skillBands?.speaking?.target || 7.5,
      recentIssue: 'Avg. Duration: 1:34 (Part 2)',
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 font-sans">
      {/* Header: Training Overview & Master Metrics */}
      <header className="flex flex-col lg:flex-row justify-between lg:items-end gap-6 border-b border-[#1a1a1a] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#d4af37]">
              {profile.moduleType} IELTS Personal Training
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif italic text-white tracking-tight mb-1">
            Training Overview
          </h2>
          <p className="text-xs sm:text-sm text-[#888888]">
            24 August 2026 — You are {bandDifference.toFixed(1)} band away from your target.
          </p>
        </div>

        {/* Master Score Metrics */}
        <div className="flex items-center gap-6 sm:gap-10 border-t lg:border-t-0 lg:border-l border-[#1a1a1a] pt-4 lg:pt-0 lg:pl-10">
          <div className="text-left sm:text-center">
            <p className="text-[10px] uppercase tracking-widest text-[#888888] mb-1">Target Band</p>
            <p className="text-3xl font-serif text-[#d4af37] font-semibold">{profile.targetBand}</p>
          </div>
          <div className="text-left sm:text-center">
            <p className="text-[10px] uppercase tracking-widest text-[#888888] mb-1">Estimated</p>
            <p className="text-3xl font-serif text-white font-semibold">{currentBandNum}</p>
          </div>
          <div className="text-left sm:text-center">
            <p className="text-[10px] uppercase tracking-widest text-[#888888] mb-1">Streak</p>
            <p className="text-3xl font-serif text-orange-500 font-semibold">
              {profile.streakDays}{' '}
              <span className="text-xs uppercase font-sans tracking-normal text-[#888888]">Days</span>
            </p>
          </div>
          <div className="hidden sm:block text-center">
            <p className="text-[10px] uppercase tracking-widest text-[#888888] mb-1">Weekly Time</p>
            <p className="text-3xl font-serif text-[#e0e0e0] font-semibold">
              {hours}h {mins}m
            </p>
          </div>
        </div>
      </header>

      {/* 1. Skill Diagnostic Progress Cards (4-Column Layout) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {skillCards.map((card) => {
          const progressPercent = Math.min(
            100,
            Math.max(15, Math.round(((card.current - 4.5) / (card.target - 4.5)) * 100))
          );

          return (
            <div
              key={card.skill}
              id={`skill-card-${card.skill}`}
              onClick={() => {
                if (card.skill === 'writing') onNavigateTab('writing');
                else if (card.skill === 'speaking') onNavigateTab('speaking');
                else onNavigateTab('tasks');
              }}
              className="bg-[#0a0a0a] border border-[#1a1a1a] p-5 rounded-2xl flex flex-col justify-between hover:border-[#d4af37]/40 transition-colors cursor-pointer group"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <p className="text-[10px] uppercase tracking-widest text-[#888888] group-hover:text-white transition-colors">
                    {card.name}
                  </p>
                  <span className="text-xs font-serif text-[#d4af37]">
                    {card.current} / {card.target}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-[#1a1a1a] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#d4af37] rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
              <p className="text-[10px] mt-4 text-[#888888] italic line-clamp-1">
                {card.recentIssue}
              </p>
            </div>
          );
        })}
      </section>

      {/* 2. Main Two-Column Workflow Section: Task Stack & Mistake Notebook */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (7 cols): Current Task Stack */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs uppercase tracking-widest text-[#888888] font-semibold">
              Current Task Stack
            </h3>
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-[#888888]">
                {completedToday}/{todayTasks.length} Completed
              </span>
              <button
                onClick={() => onNavigateTab('tasks')}
                className="text-xs text-[#d4af37] hover:underline flex items-center gap-1"
              >
                <span>Full Planner</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {todayTasks.length === 0 ? (
              <div className="p-8 text-center bg-[#0a0a0a] rounded-xl border border-[#1a1a1a] text-[#888888]">
                <CheckCircle2 className="w-8 h-8 mx-auto text-[#d4af37] mb-2" />
                <p className="font-semibold text-white">All scheduled tasks completed</p>
                <p className="text-xs text-[#888888] mt-1">Review your mistake notebook or generate new tasks.</p>
              </div>
            ) : (
              todayTasks.slice(0, 4).map((task, idx) => {
                const isCompleted = task.status === 'completed';
                const taskNumber = String(idx + 1).padStart(2, '0');

                return (
                  <div
                    key={task.id}
                    id={`task-item-${task.id}`}
                    onClick={() => onStartTask(task)}
                    className={`bg-[#0f0f0f] border p-4 rounded-xl flex items-center justify-between group cursor-pointer transition-all ${
                      isCompleted
                        ? 'border-[#1a1a1a] opacity-50 bg-[#0a0a0a]'
                        : 'border-[#1a1a1a] hover:border-[#d4af37]/40'
                    }`}
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-8 h-8 rounded-full border border-dashed border-[#333333] flex items-center justify-center text-[10px] text-[#888888] shrink-0">
                        {taskNumber}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white truncate group-hover:text-[#d4af37] transition-colors">
                          {task.title}
                        </p>
                        <p className="text-[10px] text-[#888888] truncate mt-0.5">
                          {task.skill.toUpperCase()} • {task.estimatedMinutes} minutes • {task.priority} priority
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 ml-3">
                      {isCompleted ? (
                        <span className="text-[10px] italic text-[#888888]">Completed</span>
                      ) : (
                        <button
                          id={`btn-start-${task.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onStartTask(task);
                          }}
                          className="px-4 py-1.5 bg-[#d4af37] hover:bg-[#e2be4a] text-black text-[10px] font-bold rounded uppercase tracking-tighter transition-all"
                        >
                          Start Task
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column (5 cols): Mistake Notebook & Vocab Spotlight */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs uppercase tracking-widest text-[#888888] font-semibold">
              Mistake Notebook 📝
            </h3>
            <span className="text-[10px] text-[#d4af37] uppercase tracking-wider">
              {mistakes.filter((m) => !m.resolved).length} Unresolved
            </span>
          </div>

          <div className="bg-gradient-to-b from-[#1a1205] to-[#0a0a0a] border border-[#302108] rounded-2xl p-6 space-y-4 shadow-sm">
            <div className="border-b border-[#302108] pb-4">
              <p className="text-[10px] text-[#d4af37] uppercase tracking-tighter mb-1">
                Key Recurring Problem
              </p>
              <h4 className="text-lg font-serif italic text-white leading-snug mb-2">
                Assumptive Reasoning in T/F/NG & Headings
              </h4>
              <p className="text-xs text-[#a0a0a0] leading-relaxed">
                You consistently answer &lsquo;False&rsquo; when the information is actually &lsquo;Not Given&rsquo;, accounting for {matchingHeadingPercentage}% of Reading errors. Focus on strictly factual paragraph main ideas.
              </p>
            </div>

            <div>
              <p className="text-[10px] text-[#888888] uppercase tracking-widest mb-2.5">
                Vocabulary Extracted to Review
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-2.5 py-1 bg-[#1a1a1a] border border-[#333333] rounded text-[10px] text-[#e0e0e0]">
                  inevitable
                </span>
                <span className="px-2.5 py-1 bg-[#1a1a1a] border border-[#333333] rounded text-[10px] text-[#e0e0e0]">
                  mitigate
                </span>
                <span className="px-2.5 py-1 bg-[#1a1a1a] border border-[#333333] rounded text-[10px] text-[#e0e0e0]">
                  prevalent
                </span>
                <span className="px-2.5 py-1 bg-[#1a1a1a] border border-[#333333] rounded text-[10px] text-[#e0e0e0]">
                  exacerbate
                </span>
              </div>
            </div>

            <div className="pt-2">
              <button
                id="btn-dash-open-notebook"
                onClick={() => onNavigateTab('mistakes')}
                className="w-full py-2.5 bg-transparent border border-[#d4af37]/30 text-[#d4af37] text-[10px] uppercase font-bold tracking-widest rounded-lg hover:bg-[#d4af37]/10 transition-colors text-center"
              >
                Open Mistake Notebook
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Recent Diagnostic Practice Log */}
      <section className="space-y-4 pt-4 border-t border-[#1a1a1a]">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs uppercase tracking-widest text-[#888888] font-semibold">
              Recent Practice Records
            </h3>
            <p className="text-xs text-[#888888] mt-0.5">
              Score, estimated band, and mistake root causes from recent test drills
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('progress')}
            className="text-xs text-[#d4af37] hover:underline flex items-center gap-1"
          >
            <span>View All Records ({records.length})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {records.slice(0, 4).map((rec) => (
            <div
              key={rec.id}
              id={`practice-card-${rec.id}`}
              className="p-4 rounded-xl bg-[#0a0a0a] border border-[#1a1a1a] space-y-3 hover:border-[#d4af37]/30 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#141414] border border-[#2a2a2a] text-[#d4af37]">
                  {rec.skill}
                </span>
                <span className="text-[10px] text-[#666666]">{rec.date}</span>
              </div>

              <div>
                <h4 className="font-medium text-white text-sm line-clamp-1">{rec.taskTitle}</h4>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-base font-serif font-bold text-[#d4af37]">Band {rec.estimatedBand}</span>
                  {rec.rawScore !== undefined && rec.totalQuestions && (
                    <span className="text-xs text-[#888888]">
                      ({rec.rawScore}/{rec.totalQuestions} Qs)
                    </span>
                  )}
                  <span className="text-[10px] text-[#666666]">• {rec.timeSpentMinutes}m</span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-[#0f0f0f] border border-[#1a1a1a] space-y-1 text-[11px]">
                <div className="flex justify-between text-[#888888]">
                  <span>Main problem:</span>
                  <span className="text-rose-400 truncate max-w-[120px]">{rec.mainProblem}</span>
                </div>
                <div className="flex justify-between text-[#888888]">
                  <span>Mistakes:</span>
                  <span className="text-[#e0e0e0] font-medium">{rec.mistakesCount} logged</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer Meta */}
      <footer className="flex items-center justify-between border-t border-[#1a1a1a] pt-4 text-[#888888] text-[10px]">
        <div className="flex gap-6 uppercase tracking-[0.2em]">
          <span>Tasks: {profile.tasksCompletedTotal || 47} / {profile.tasksTargetTotal || 60}</span>
          <span>Time: {hours}h {mins}m</span>
        </div>
        <div className="italic text-[#666666]">
          Next diagnostic review scheduled for Sunday
        </div>
      </footer>
    </div>
  );
};

