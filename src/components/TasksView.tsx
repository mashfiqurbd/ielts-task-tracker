import React, { useState } from 'react';
import {
  CheckSquare,
  Sparkles,
  Plus,
  Clock,
  Filter,
  CheckCircle2,
  Play,
  Calendar,
  AlertTriangle,
  ChevronRight,
  Headphones,
  BookOpen,
  FileEdit,
  Mic,
  ListTodo,
  Tag,
} from 'lucide-react';
import { IELTSTask, Skill, TaskPriority, UserProfile } from '../types';

interface TasksViewProps {
  tasks: IELTSTask[];
  profile: UserProfile;
  onStartTask: (task: IELTSTask) => void;
  onToggleTaskStatus: (taskId: string) => void;
  onOpenNewTask: () => void;
  onRegeneratePlan: () => Promise<void>;
  isGeneratingPlan: boolean;
}

export const TasksView: React.FC<TasksViewProps> = ({
  tasks,
  profile,
  onStartTask,
  onToggleTaskStatus,
  onOpenNewTask,
  onRegeneratePlan,
  isGeneratingPlan,
}) => {
  const [selectedSkill, setSelectedSkill] = useState<Skill | 'all'>('all');
  const [activeViewMode, setActiveViewMode] = useState<'planner' | 'all' | 'completed'>('planner');

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const filteredTasks = tasks.filter((task) => {
    if (selectedSkill !== 'all' && task.skill !== selectedSkill) return false;
    if (activeViewMode === 'completed') return task.status === 'completed';
    return true;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 font-sans">
      {/* Top Header & Adaptive Planner Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-[#0a0a0a] p-6 sm:p-8 rounded-2xl border border-[#1a1a1a]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#d4af37]">
              Task-Based Training
            </span>
            <span className="text-[10px] text-[#666666]">• Target Band {profile.targetBand}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif italic text-white tracking-tight">
            IELTS Study Planner & Task System
          </h1>
          <p className="text-xs sm:text-sm text-[#888888] mt-1">
            Every practice session is broken into specific drills that address your actual mistakes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            id="btn-ai-regenerate-plan"
            onClick={onRegeneratePlan}
            disabled={isGeneratingPlan}
            className="px-4 py-2.5 rounded-lg bg-[#141414] hover:bg-[#1a1a1a] border border-[#d4af37]/40 text-[#d4af37] text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isGeneratingPlan ? 'animate-spin' : ''}`} />
            <span>{isGeneratingPlan ? 'Recalibrating...' : 'AI Recalibrate Plan'}</span>
          </button>

          <button
            id="btn-add-custom-task"
            onClick={onOpenNewTask}
            className="px-4 py-2.5 rounded-lg bg-[#d4af37] hover:bg-[#e2be4a] text-black font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Filter & View Mode Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1a1a1a] pb-4">
        {/* View Mode Tabs */}
        <div className="flex items-center gap-1 bg-[#0a0a0a] p-1 rounded-xl border border-[#1a1a1a]">
          <button
            onClick={() => setActiveViewMode('planner')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeViewMode === 'planner'
                ? 'bg-[#1a1a1a] text-white'
                : 'text-[#888888] hover:text-white'
            }`}
          >
            Weekly Schedule
          </button>
          <button
            onClick={() => setActiveViewMode('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeViewMode === 'all'
                ? 'bg-[#1a1a1a] text-white'
                : 'text-[#888888] hover:text-white'
            }`}
          >
            All Tasks ({tasks.length})
          </button>
          <button
            onClick={() => setActiveViewMode('completed')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeViewMode === 'completed'
                ? 'bg-[#1a1a1a] text-white'
                : 'text-[#888888] hover:text-white'
            }`}
          >
            Completed ({tasks.filter((t) => t.status === 'completed').length})
          </button>
        </div>

        {/* Skill Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
          <span className="text-[10px] uppercase tracking-wider text-[#666666] mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Skill:
          </span>
          {(['all', 'listening', 'reading', 'writing', 'speaking'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSelectedSkill(s)}
              className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition-all ${
                selectedSkill === s
                  ? 'bg-[#d4af37] text-black font-bold'
                  : 'bg-[#0a0a0a] border border-[#1a1a1a] text-[#888888] hover:text-white'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      {activeViewMode === 'planner' ? (
        /* Day-by-Day Adaptive Planner View */
        <div className="space-y-6">
          {daysOfWeek.map((day) => {
            const dayTasks = filteredTasks.filter(
              (t) => t.dayOfWeek === day || (day === 'Monday' && !t.dayOfWeek)
            );

            if (dayTasks.length === 0 && selectedSkill !== 'all') return null;

            const isToday = day === 'Monday'; // Default simulation today is Monday, 24 Aug
            const totalMins = dayTasks.reduce((acc, t) => acc + t.estimatedMinutes, 0);

            return (
              <div
                key={day}
                id={`day-section-${day.toLowerCase()}`}
                className={`rounded-2xl border transition-all ${
                  isToday
                    ? 'bg-[#0a0a0a] border-[#d4af37]/40 shadow-sm'
                    : 'bg-[#0a0a0a] border-[#1a1a1a]'
                }`}
              >
                {/* Day Header */}
                <div className="p-4 sm:p-5 border-b border-[#1a1a1a] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs ${
                        isToday ? 'bg-[#d4af37] text-black font-serif' : 'bg-[#141414] text-[#888888]'
                      }`}
                    >
                      {day.substring(0, 3)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-serif italic text-white text-base">{day}</h3>
                        {isToday && (
                          <span className="px-2 py-0.5 rounded bg-[#1f1a0a] border border-[#d4af37]/30 text-[#d4af37] text-[10px] font-bold uppercase tracking-wider">
                            Today&apos;s Focus
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#888888]">
                        {dayTasks.length} practice tasks • Total: {totalMins} minutes
                      </p>
                    </div>
                  </div>

                  <span className="text-xs text-[#888888] hidden sm:block">
                    {dayTasks.filter((t) => t.status === 'completed').length}/{dayTasks.length} Completed
                  </span>
                </div>

                {/* Day Task List */}
                <div className="p-4 sm:p-5 space-y-3">
                  {dayTasks.length === 0 ? (
                    <p className="text-xs text-[#666666] py-3 text-center italic">
                      No tasks scheduled for {day}. Use &ldquo;Add Task&rdquo; to add customized drills.
                    </p>
                  ) : (
                    dayTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onStartTask={onStartTask}
                        onToggleStatus={onToggleTaskStatus}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List / Completed View */
        <div className="space-y-3">
          {filteredTasks.length === 0 ? (
            <div className="p-12 text-center bg-[#0a0a0a] rounded-2xl border border-[#1a1a1a] text-[#888888]">
              <CheckSquare className="w-10 h-10 mx-auto text-[#444444] mb-2" />
              <p className="font-semibold text-white">No tasks found for this filter</p>
            </div>
          ) : (
            filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onStartTask={onStartTask}
                onToggleStatus={onToggleTaskStatus}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};

// Extracted Task Card Component
interface TaskCardProps {
  task: IELTSTask;
  onStartTask: (task: IELTSTask) => void;
  onToggleStatus: (taskId: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onStartTask, onToggleStatus }) => {
  const isCompleted = task.status === 'completed';

  const skillIcons = {
    listening: Headphones,
    reading: BookOpen,
    writing: FileEdit,
    speaking: Mic,
    general: CheckSquare,
  };

  const Icon = skillIcons[task.skill] || CheckSquare;

  return (
    <div
      id={`task-card-${task.id}`}
      className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
        isCompleted
          ? 'bg-[#080808] border-[#141414] opacity-50'
          : 'bg-[#0f0f0f] border-[#1a1a1a] hover:border-[#d4af37]/30'
      }`}
    >
      <div className="flex items-start gap-3.5">
        {/* Checkbox Toggle */}
        <button
          onClick={() => onToggleStatus(task.id)}
          className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-1 transition-colors border ${
            isCompleted
              ? 'bg-[#d4af37] border-[#d4af37] text-black'
              : 'border-[#333333] hover:border-[#d4af37] bg-[#141414] text-transparent'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
        </button>

        {/* Skill Icon */}
        <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 bg-[#141414] border border-[#222222] text-[#d4af37]">
          <Icon className="w-4 h-4" />
        </div>

        {/* Task Details */}
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`text-sm sm:text-base font-medium ${
                isCompleted ? 'line-through text-[#666666]' : 'text-white'
              }`}
            >
              {task.title}
            </span>

            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                task.priority === 'high'
                  ? 'bg-rose-950/60 border border-rose-800/50 text-rose-300'
                  : task.priority === 'medium'
                  ? 'bg-amber-950/60 border border-amber-800/50 text-amber-300'
                  : 'bg-[#141414] border border-[#2a2a2a] text-[#888888]'
              }`}
            >
              {task.priority}
            </span>

            <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-[#141414] text-[#888888]">
              {task.category.replace('_', ' ')}
            </span>
          </div>

          <p className="text-xs text-[#888888] line-clamp-2">{task.description}</p>

          {task.reason && (
            <p className="text-[11px] text-[#d4af37] font-medium flex items-center gap-1">
              <Sparkles className="w-3 h-3 shrink-0" />
              <span>Targeting: {task.reason}</span>
            </p>
          )}
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
        <div className="text-xs text-[#888888] flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          <span>{task.estimatedMinutes} min</span>
        </div>

        <button
          onClick={() => onStartTask(task)}
          className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors ${
            isCompleted
              ? 'bg-[#141414] hover:bg-[#1a1a1a] text-[#888888] border border-[#2a2a2a]'
              : 'bg-[#d4af37] hover:bg-[#e2be4a] text-black'
          }`}
        >
          <Play className="w-3 h-3 fill-current" />
          <span>{isCompleted ? 'Redo Task' : 'Start Task'}</span>
        </button>
      </div>
    </div>
  );
};

