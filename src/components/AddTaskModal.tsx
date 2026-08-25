import React, { useState } from 'react';
import { Plus, X, Sparkles, Clock, Target } from 'lucide-react';
import { IELTSTask, Skill, TaskPriority, TaskCategory } from '../types';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTask: (task: IELTSTask) => void;
}

export const AddTaskModal: React.FC<AddTaskModalProps> = ({ isOpen, onClose, onAddTask }) => {
  if (!isOpen) return null;

  const [title, setTitle] = useState<string>('');
  const [skill, setSkill] = useState<Skill>('reading');
  const [category, setCategory] = useState<TaskCategory>('targeted_drill');
  const [estimatedMinutes, setEstimatedMinutes] = useState<number>(30);
  const [priority, setPriority] = useState<TaskPriority>('high');
  const [dayOfWeek, setDayOfWeek] = useState<string>('Monday');
  const [description, setDescription] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [instructions, setInstructions] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newTask: IELTSTask = {
      id: `task-${Date.now()}`,
      title: title.trim(),
      skill,
      category,
      estimatedMinutes,
      priority,
      status: 'pending',
      dayOfWeek,
      description: description.trim() || `Complete the ${title} IELTS practice task.`,
      reason: reason.trim() || undefined,
      instructions: instructions.trim() || undefined,
    };

    onAddTask(newTask);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 font-sans">
      <div className="bg-[#0a0a0a] w-full max-w-xl rounded-2xl shadow-2xl border border-[#1a1a1a] p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-[#1a1a1a] pb-3">
          <div>
            <h3 className="font-serif italic text-white text-base">Add New IELTS Practice Task</h3>
            <p className="text-xs text-[#888888]">Design a targeted session for your planner</p>
          </div>
          <button onClick={onClose} className="text-[#666666] hover:text-white font-bold p-1">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-[10px] uppercase font-bold text-[#888888] mb-1">Task Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Cambridge 18 Test 2 Reading Passage 3"
              className="w-full px-3 py-2 text-xs sm:text-sm bg-[#141414] border border-[#222222] rounded-lg text-[#e0e0e0] focus:outline-none focus:border-[#d4af37]"
            />
          </div>

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
                <option value="general">General / Mixed</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-[#888888] mb-1">Task Type</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TaskCategory)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-[#141414] border border-[#222222] rounded-lg text-[#e0e0e0] focus:outline-none focus:border-[#d4af37]"
              >
                <option value="full_test">Full Simulation Test</option>
                <option value="section_practice">Section Practice</option>
                <option value="targeted_drill">Targeted Weak-Point Drill</option>
                <option value="mistake_review">Mistake Review</option>
                <option value="vocab_study">Vocabulary Study</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] uppercase font-bold text-[#888888] mb-1">Duration (Min)</label>
              <input
                type="number"
                min={5}
                max={180}
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-[#141414] border border-[#222222] rounded-lg text-[#e0e0e0] focus:outline-none focus:border-[#d4af37]"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-[#888888] mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-[#141414] border border-[#222222] rounded-lg text-[#e0e0e0] capitalize focus:outline-none focus:border-[#d4af37]"
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-[#888888] mb-1">Scheduled Day</label>
              <select
                value={dayOfWeek}
                onChange={(e) => setDayOfWeek(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-[#141414] border border-[#222222] rounded-lg text-[#e0e0e0] focus:outline-none focus:border-[#d4af37]"
              >
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(
                  (d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  )
                )}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-[#888888] mb-1">Targeting Weak Area (Reason)</label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Focus on eliminating Matching Headings errors"
              className="w-full px-3 py-2 text-xs sm:text-sm bg-[#141414] border border-[#222222] rounded-lg text-[#e0e0e0] focus:outline-none focus:border-[#d4af37]"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-[#888888] mb-1">Specific Instructions / Tips</label>
            <textarea
              rows={2}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="e.g. Underline keywords first; strictly limit to 18 minutes."
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
              Add Task to Schedule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

