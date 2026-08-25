import React from 'react';
import {
  Flame,
  Target,
  Calendar,
  Plus,
  BookOpen,
  CheckSquare,
  AlertCircle,
  FileEdit,
  Mic,
  BookmarkCheck,
  TrendingUp,
  User,
} from 'lucide-react';
import { ActiveTab, UserProfile } from '../types';

interface NavbarProps {
  activeTab: string | ActiveTab;
  setActiveTab?: (tab: any) => void;
  onSelectTab?: (tab: any) => void;
  profile: UserProfile;
  onOpenNewTask?: () => void;
  onOpenNewMistake?: () => void;
  mistakeCount?: number;
  taskCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onSelectTab,
  profile,
  onOpenNewTask,
  onOpenNewMistake,
  mistakeCount,
  taskCount,
}) => {
  const handleTabChange = (tab: string) => {
    if (onSelectTab) onSelectTab(tab);
    else if (setActiveTab) setActiveTab(tab as ActiveTab);
  };

  // Calculate days remaining to exam
  const daysLeft = Math.max(
    0,
    Math.ceil(
      (new Date(profile.examDate).getTime() - new Date().getTime()) /
        (1000 * 60 * 60 * 24)
    )
  );

  const navItems: Array<{
    id: string;
    label: string;
    icon: React.ElementType;
    badge?: string;
  }> = [
    { id: 'dashboard', label: 'Dashboard', icon: BookOpen },
    { id: 'tasks', label: 'Task Planner', icon: CheckSquare, badge: taskCount ? `${taskCount}` : undefined },
    { id: 'mistakes', label: 'Mistake Notebook', icon: AlertCircle, badge: mistakeCount ? `${mistakeCount}` : 'Key' },
    { id: 'writing', label: 'Writing Lab', icon: FileEdit },
    { id: 'speaking', label: 'Speaking Studio', icon: Mic },
    { id: 'vocab', label: 'Vocabulary Vault', icon: BookmarkCheck },
    { id: 'progress', label: 'Performance Analytics', icon: TrendingUp },
    { id: 'profile', label: 'Candidate Profile', icon: User },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#050505]/95 backdrop-blur border-b border-[#1a1a1a]">
      {/* Top Utility Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div
            id="brand-logo"
            onClick={() => handleTabChange('dashboard')}
            className="flex items-center gap-3.5 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1c1c1c] via-[#121212] to-[#0a0a0a] border border-[#2a2a2a] flex items-center justify-center text-[#d4af37] shadow-sm group-hover:border-[#d4af37]/50 transition-colors">
              <span className="font-serif italic font-bold text-lg tracking-tight">A</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif italic font-bold text-xl tracking-tight text-white group-hover:text-[#d4af37] transition-colors">
                  Aura IELTS
                </span>
                <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded border border-[#d4af37]/30 bg-[#1a1205] text-[#d4af37]">
                  Band {profile.targetBand} Target
                </span>
              </div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-[#888888] hidden sm:block">
                Personal Training System
              </p>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex items-center gap-2.5 sm:gap-4">
            {/* Streak */}
            <div
              id="streak-badge"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0e0e0e] border border-[#2a2010] text-[#e0e0e0] text-xs font-medium"
              title={`${profile.streakDays} consecutive study days`}
            >
              <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
              <span className="font-serif italic text-sm text-orange-400 font-bold">{profile.streakDays}</span>
              <span className="hidden sm:inline text-[10px] uppercase tracking-wider text-[#888888]">days</span>
            </div>

            {/* Target vs Estimated Band */}
            <div
              id="band-summary-badge"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0a0a0a] border border-[#1a1a1a] text-xs"
            >
              <Target className="w-3.5 h-3.5 text-[#d4af37]" />
              <span className="text-[#888888] text-[10px] uppercase tracking-wider hidden sm:inline">Band:</span>
              <span className="font-serif text-sm font-semibold text-[#e0e0e0]">{profile.currentBand || profile.estimatedBand}</span>
              <span className="text-[#444444] text-xs">/</span>
              <span className="font-serif text-sm font-bold text-[#d4af37]">{profile.targetBand}</span>
            </div>

            {/* Exam Countdown */}
            <div
              id="exam-countdown-badge"
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0a0a0a] border border-[#1a1a1a] text-[#e0e0e0] text-xs"
            >
              <Calendar className="w-3.5 h-3.5 text-[#a0a0a0]" />
              <span className="font-serif font-bold text-sm text-white">{daysLeft}</span>
              <span className="text-[10px] uppercase tracking-wider text-[#888888]">days left</span>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2">
              {onOpenNewMistake && (
                <button
                  id="btn-quick-log-mistake"
                  onClick={onOpenNewMistake}
                  className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-400 bg-[#160d0d] hover:bg-[#221212] border border-rose-950/60 rounded-lg transition-colors"
                >
                  <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                  <span>Log Error</span>
                </button>
              )}

              {onOpenNewTask && (
                <button
                  id="btn-quick-new-task"
                  onClick={onOpenNewTask}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-black bg-[#d4af37] hover:bg-[#e2be4a] rounded-lg shadow-sm transition-all tracking-tight"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>New Task</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="border-t border-[#1a1a1a] bg-[#070707] overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 sm:space-x-1.5 py-2 min-w-max">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id || (activeTab === 'vocabulary' && item.id === 'vocab');
              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  onClick={() => handleTabChange(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-[#141414] text-white border border-[#2e2e2e] shadow-sm'
                      : 'text-[#888888] hover:text-[#e0e0e0] hover:bg-[#0f0f0f] border border-transparent'
                  }`}
                >
                  {isActive && <div className="w-1.5 h-1.5 rounded-full bg-[#d4af37]"></div>}
                  <Icon
                    className={`w-3.5 h-3.5 ${
                      isActive ? 'text-[#d4af37]' : 'text-[#666666]'
                    }`}
                  />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className={`px-1.5 py-0.2 text-[9px] font-bold rounded ${
                      isActive
                        ? 'bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/30'
                        : 'bg-[#1a1a1a] text-[#888888] border border-[#2a2a2a]'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};

