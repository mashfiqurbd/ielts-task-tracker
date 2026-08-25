import React, { useState } from 'react';
import { User, Target, Calendar, Award, RefreshCw, CheckCircle2, BookOpen } from 'lucide-react';
import { UserProfile } from '../types';

interface ProfileViewProps {
  profile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
  onResetToDemoData: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  profile,
  onUpdateProfile,
  onResetToDemoData,
}) => {
  const [name, setName] = useState<string>(profile.name);
  const [targetBand, setTargetBand] = useState<number>(profile.targetBand);
  const [examDate, setExamDate] = useState<string>(profile.examDate);
  const [testType, setTestType] = useState<'academic' | 'general'>(profile.testType);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  // Skill target bands
  const [listeningTarget, setListeningTarget] = useState<number>(profile.skills.listening.target);
  const [readingTarget, setReadingTarget] = useState<number>(profile.skills.reading.target);
  const [writingTarget, setWritingTarget] = useState<number>(profile.skills.writing.target);
  const [speakingTarget, setSpeakingTarget] = useState<number>(profile.skills.speaking.target);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserProfile = {
      ...profile,
      name,
      targetBand,
      examDate,
      testType,
      skills: {
        listening: { ...profile.skills.listening, target: listeningTarget },
        reading: { ...profile.skills.reading, target: readingTarget },
        writing: { ...profile.skills.writing, target: writingTarget },
        speaking: { ...profile.skills.speaking, target: speakingTarget },
      },
    };
    onUpdateProfile(updated);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-[#0a0a0a] p-6 sm:p-8 rounded-2xl border border-[#1a1a1a]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#d4af37]">
              Candidate Profile
            </span>
            <span className="text-[10px] text-[#666666]">• Personalized Calibration</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif italic text-white tracking-tight">
            Target Band & Profile Settings
          </h1>
          <p className="text-xs sm:text-sm text-[#888888] mt-1">
            Configure your exam timeline, target skill bands, and study goals.
          </p>
        </div>

        <button
          type="button"
          onClick={onResetToDemoData}
          className="px-4 py-2 rounded-lg bg-[#141414] hover:bg-[#1f1f1f] text-[#a0a0a0] hover:text-white border border-[#222222] text-xs font-medium flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset Demo Data</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Core Profile Card */}
        <div className="bg-[#0a0a0a] p-6 sm:p-8 rounded-2xl border border-[#1a1a1a] space-y-6">
          <h3 className="font-serif italic text-white text-lg flex items-center gap-2 border-b border-[#1a1a1a] pb-3">
            <User className="w-4 h-4 text-[#d4af37]" />
            <span>Candidate Information</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] uppercase tracking-wider font-bold text-[#888888] mb-1">Candidate Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-[#141414] border border-[#222222] rounded-lg focus:outline-none focus:border-[#d4af37] text-[#e0e0e0]"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider font-bold text-[#888888] mb-1">Target IELTS Exam Date</label>
              <input
                type="text"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-[#141414] border border-[#222222] rounded-lg focus:outline-none focus:border-[#d4af37] text-[#e0e0e0]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            <div>
              <label className="block text-[11px] uppercase tracking-wider font-bold text-[#888888] mb-2">IELTS Module Format</label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-medium text-[#e0e0e0] cursor-pointer">
                  <input
                    type="radio"
                    name="testType"
                    checked={testType === 'academic'}
                    onChange={() => setTestType('academic')}
                    className="text-[#d4af37] focus:ring-[#d4af37] accent-[#d4af37]"
                  />
                  <span>IELTS Academic (University / Professional)</span>
                </label>
                <label className="flex items-center gap-2 text-xs font-medium text-[#e0e0e0] cursor-pointer">
                  <input
                    type="radio"
                    name="testType"
                    checked={testType === 'general'}
                    onChange={() => setTestType('general')}
                    className="text-[#d4af37] focus:ring-[#d4af37] accent-[#d4af37]"
                  />
                  <span>IELTS General Training</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider font-bold text-[#888888] mb-1">Overall Target Band</label>
              <input
                type="number"
                step="0.5"
                min="5.0"
                max="9.0"
                value={targetBand}
                onChange={(e) => setTargetBand(Number(e.target.value))}
                className="w-full px-3.5 py-2 text-sm font-serif font-bold text-[#d4af37] bg-[#141414] border border-[#222222] rounded-lg focus:outline-none focus:border-[#d4af37]"
              />
            </div>
          </div>
        </div>

        {/* Skill-Specific Target Bands */}
        <div className="bg-[#0a0a0a] p-6 sm:p-8 rounded-2xl border border-[#1a1a1a] space-y-6">
          <h3 className="font-serif italic text-white text-lg flex items-center gap-2 border-b border-[#1a1a1a] pb-3">
            <Target className="w-4 h-4 text-[#d4af37]" />
            <span>Target Bands by Skill</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-[11px] uppercase tracking-wider font-bold text-[#888888] mb-1">Listening Target</label>
              <input
                type="number"
                step="0.5"
                min="5.0"
                max="9.0"
                value={listeningTarget}
                onChange={(e) => setListeningTarget(Number(e.target.value))}
                className="w-full px-3.5 py-2 text-sm font-serif font-bold text-white bg-[#141414] border border-[#222222] rounded-lg focus:outline-none focus:border-[#d4af37]"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider font-bold text-[#888888] mb-1">Reading Target</label>
              <input
                type="number"
                step="0.5"
                min="5.0"
                max="9.0"
                value={readingTarget}
                onChange={(e) => setReadingTarget(Number(e.target.value))}
                className="w-full px-3.5 py-2 text-sm font-serif font-bold text-white bg-[#141414] border border-[#222222] rounded-lg focus:outline-none focus:border-[#d4af37]"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider font-bold text-[#888888] mb-1">Writing Target</label>
              <input
                type="number"
                step="0.5"
                min="5.0"
                max="9.0"
                value={writingTarget}
                onChange={(e) => setWritingTarget(Number(e.target.value))}
                className="w-full px-3.5 py-2 text-sm font-serif font-bold text-white bg-[#141414] border border-[#222222] rounded-lg focus:outline-none focus:border-[#d4af37]"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider font-bold text-[#888888] mb-1">Speaking Target</label>
              <input
                type="number"
                step="0.5"
                min="5.0"
                max="9.0"
                value={speakingTarget}
                onChange={(e) => setSpeakingTarget(Number(e.target.value))}
                className="w-full px-3.5 py-2 text-sm font-serif font-bold text-white bg-[#141414] border border-[#222222] rounded-lg focus:outline-none focus:border-[#d4af37]"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {isSaved && (
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Profile Updated!
            </span>
          )}

          <button
            type="submit"
            className="px-6 py-2.5 rounded-lg bg-[#d4af37] hover:bg-[#e2be4a] text-black font-bold text-xs uppercase tracking-wider transition-colors"
          >
            Save Target Profile
          </button>
        </div>
      </form>
    </div>
  );
};

