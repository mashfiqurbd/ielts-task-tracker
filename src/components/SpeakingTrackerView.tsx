import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Play,
  Square,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Volume2,
  BookOpen,
  Send,
  Plus,
} from 'lucide-react';
import { SpeakingRecording } from '../types';

interface SpeakingTrackerViewProps {
  recordings: SpeakingRecording[];
  onSaveRecording: (recording: SpeakingRecording) => void;
}

export const SpeakingTrackerView: React.FC<SpeakingTrackerViewProps> = ({
  recordings,
  onSaveRecording,
}) => {
  const [activeTab, setActiveTab] = useState<'record' | 'history'>('record');
  const [part, setPart] = useState<'part_1' | 'part_2' | 'part_3'>('part_2');
  const [topic, setTopic] = useState<string>('Describe a memorable journey you have taken');
  const [prompt, setPrompt] = useState<string>(
    'You should say:\n- Where you went\n- How you travelled there\n- Who you went with\n- And explain why this journey was particularly memorable for you'
  );
  const [prepNotes, setPrepNotes] = useState<string>('');

  // Prep timer (1 minute for Part 2)
  const [prepSecondsLeft, setPrepSecondsLeft] = useState<number>(60);
  const [isPrepActive, setIsPrepActive] = useState<boolean>(false);

  // Speaking Recording timer
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  const [selectedRecording, setSelectedRecording] = useState<SpeakingRecording | null>(
    recordings[0] || null
  );

  const timerIntervalRef = useRef<number | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Prep countdown timer
  useEffect(() => {
    let prepInterval: number | null = null;
    if (isPrepActive && prepSecondsLeft > 0) {
      prepInterval = window.setInterval(() => {
        setPrepSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (prepSecondsLeft === 0 && isPrepActive) {
      setIsPrepActive(false);
    }
    return () => {
      if (prepInterval) clearInterval(prepInterval);
    };
  }, [isPrepActive, prepSecondsLeft]);

  // Speaking timer
  useEffect(() => {
    if (isRecording) {
      timerIntervalRef.current = window.setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isRecording]);

  const startMediaRecording = async () => {
    setAudioUrl(null);
    setRecordingSeconds(0);
    audioChunksRef.current = [];

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            audioChunksRef.current.push(e.data);
          }
        };

        recorder.onstop = () => {
          const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const url = URL.createObjectURL(blob);
          setAudioUrl(url);
          stream.getTracks().forEach((t) => t.stop());
        };

        recorder.start();
        setMediaRecorder(recorder);
      }
    } catch (e) {
      console.warn('Microphone permission not granted or unavailable in iframe, using timer mode', e);
    }

    setIsRecording(true);
  };

  const stopMediaRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
    setIsRecording(false);
  };

  const handleAnalyzeAndSave = async () => {
    setIsAnalyzing(true);
    const targetDuration = part === 'part_2' ? 120 : 60;

    try {
      const res = await fetch('/api/ai/analyze-speaking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          part,
          topic,
          transcript: transcript || 'Recorded audio response practicing IELTS speaking fluency.',
          durationSeconds: recordingSeconds || 94,
        }),
      });

      const data = await res.json();

      const newRec: SpeakingRecording = {
        id: `spk-${Date.now()}`,
        part,
        topic,
        prompt,
        cueCardPoints: prompt.split('\n').filter((p) => p.startsWith('-')),
        audioBlobUrl: audioUrl || undefined,
        durationSeconds: recordingSeconds || 94,
        targetDurationSeconds: targetDuration,
        date: '24 Aug 2026',
        scores: {
          estimatedBand: data.estimatedBand || 6.5,
          fluencyCoherence: data.fluencyCoherence || 6.5,
          lexicalResource: data.lexicalResource || 6.5,
          grammaticalRange: data.grammaticalRange || 6.0,
          pronunciation: data.pronunciation || 7.0,
        },
        transcript:
          transcript ||
          `I would like to speak about this topic. The experience was remarkable and left a profound impression on me...`,
        feedback: data.feedback || {
          general:
            recordingSeconds < 90 && part === 'part_2'
              ? `Target is 2:00 minutes. Your time was ${Math.floor(
                  recordingSeconds / 60
                )}:${String(recordingSeconds % 60).padStart(
                  2,
                  '0'
                )}. You need to elaborate more on your final point.`
              : 'Well-paced response with good lexical range.',
          strengths: ['Clear delivery', 'Good descriptive language'],
          areasToImprove: ['Use more discourse markers', 'Expand personal reflections'],
          sampleExpansion: 'Band 8.5 Model: "To put things into perspective..."',
        },
      };

      onSaveRecording(newRec);
      setSelectedRecording(newRec);
      setActiveTab('history');
    } catch (e) {
      console.error('Speaking analysis error', e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const formatSecs = (total: number) => {
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 font-sans">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-[#0a0a0a] p-6 sm:p-8 rounded-2xl border border-[#1a1a1a]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#d4af37]">
              Interactive Speech Studio
            </span>
            <span className="text-[10px] text-[#666666]">• Strict 2:00 Minute Pace Tracking</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif italic text-white tracking-tight">
            IELTS Speaking Tracker 🎙️
          </h1>
          <p className="text-xs sm:text-sm text-[#888888] mt-1">
            Record answers, monitor Part 2 time thresholds, and receive 4-criteria examiner diagnostics.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#0a0a0a] p-1 rounded-xl border border-[#1a1a1a]">
          <button
            onClick={() => setActiveTab('record')}
            className={`px-4 py-2 text-xs font-medium rounded-lg transition-all ${
              activeTab === 'record'
                ? 'bg-[#1a1a1a] text-white'
                : 'text-[#888888] hover:text-white'
            }`}
          >
            Speaking Recorder
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 text-xs font-medium rounded-lg transition-all ${
              activeTab === 'history'
                ? 'bg-[#1a1a1a] text-white'
                : 'text-[#888888] hover:text-white'
            }`}
          >
            Recordings History ({recordings.length})
          </button>
        </div>
      </div>

      {activeTab === 'record' ? (
        /* Recording Studio View */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2 Cols: Cue Card & Audio Recorder */}
          <div className="lg:col-span-2 space-y-6">
            {/* Part Switcher */}
            <div className="bg-[#0a0a0a] p-6 rounded-2xl border border-[#1a1a1a] space-y-4">
              <div className="flex flex-wrap items-center gap-2 border-b border-[#1a1a1a] pb-4">
                <button
                  onClick={() => {
                    setPart('part_1');
                    setTopic('Hometown & Daily Routine');
                    setPrompt('Where is your hometown? What is the most interesting part of it?');
                  }}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    part === 'part_1'
                      ? 'bg-[#d4af37] text-black font-bold'
                      : 'bg-[#141414] text-[#888888] hover:text-white border border-[#222222]'
                  }`}
                >
                  Part 1 (Short Q&A)
                </button>
                <button
                  onClick={() => {
                    setPart('part_2');
                    setTopic('Describe a Memorable Journey');
                    setPrompt(
                      'You should say:\n- Where you went\n- How you travelled there\n- Who you went with\n- And explain why this journey was particularly memorable'
                    );
                  }}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    part === 'part_2'
                      ? 'bg-[#d4af37] text-black font-bold'
                      : 'bg-[#141414] text-[#888888] hover:text-white border border-[#222222]'
                  }`}
                >
                  Part 2 (Cue Card - 2:00 Drill)
                </button>
                <button
                  onClick={() => {
                    setPart('part_3');
                    setTopic('Tourism & Environmental Impact');
                    setPrompt(
                      'How has international tourism affected historical landmarks? What measures should governments implement?'
                    );
                  }}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    part === 'part_3'
                      ? 'bg-[#d4af37] text-black font-bold'
                      : 'bg-[#141414] text-[#888888] hover:text-white border border-[#222222]'
                  }`}
                >
                  Part 3 (Abstract Debate)
                </button>
              </div>

              {/* Cue Card Prompt Box */}
              <div className="p-4 rounded-xl bg-[#0f0f0f] border border-[#1a1a1a] space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#d4af37] block">
                  IELTS Speaking {part.replace('_', ' ').toUpperCase()} Topic Card:
                </span>
                <h3 className="font-serif italic text-white text-base">{topic}</h3>
                <div className="text-xs text-[#a0a0a0] whitespace-pre-line leading-relaxed italic bg-[#141414] p-3 rounded-lg border border-[#222222]">
                  {prompt}
                </div>
              </div>

              {/* Part 2: 1-Minute Prep Countdown & Scratchpad */}
              {part === 'part_2' && (
                <div className="p-4 rounded-xl bg-[#0f0f0f] border border-[#1a1a1a] space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#d4af37]" />
                      <span className="text-xs font-bold text-white">
                        1-Minute Preparation Timer
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-[#d4af37]">
                        {prepSecondsLeft}s
                      </span>
                      <button
                        onClick={() => {
                          setPrepSecondsLeft(60);
                          setIsPrepActive(!isPrepActive);
                        }}
                        className="px-2.5 py-1 rounded bg-[#1f1a0a] text-[#d4af37] border border-[#d4af37]/30 text-[11px] font-bold"
                      >
                        {isPrepActive ? 'Pause' : 'Start Prep (1m)'}
                      </button>
                    </div>
                  </div>
                  <textarea
                    rows={2}
                    value={prepNotes}
                    onChange={(e) => setPrepNotes(e.target.value)}
                    placeholder="Scratchpad notes (e.g. 1. Kyoto trip 2. Bullet train 3. With sister 4. Autumn foliage festival)..."
                    className="w-full px-3 py-2 text-xs border border-[#222222] rounded-lg focus:outline-none focus:border-[#d4af37] bg-[#141414] text-[#e0e0e0]"
                  />
                </div>
              )}

              {/* Live Audio Recorder Card */}
              <div className="p-6 rounded-2xl bg-gradient-to-b from-[#141005] to-[#0a0a0a] border border-[#302108] text-white text-center space-y-4">
                <div className="flex items-center justify-between text-xs text-[#a0a0a0] border-b border-[#222222] pb-2">
                  <span>
                    Target Duration: <strong className="text-[#d4af37]">{part === 'part_2' ? '2:00 minutes' : '1:00 minute'}</strong>
                  </span>
                  <span>{isRecording ? '🔴 Recording live' : 'Ready to record'}</span>
                </div>

                <div className="text-5xl sm:text-6xl font-mono font-bold tracking-tight text-white">
                  {formatSecs(recordingSeconds)}
                </div>

                {/* Pace Warning Banner for Part 2 */}
                {part === 'part_2' && recordingSeconds > 0 && !isRecording && (
                  <div
                    className={`p-2.5 rounded-lg text-xs font-semibold ${
                      recordingSeconds < 90
                        ? 'bg-rose-950/40 border border-rose-900/60 text-rose-300'
                        : recordingSeconds > 130
                        ? 'bg-amber-950/40 border border-amber-900/60 text-amber-300'
                        : 'bg-emerald-950/40 border border-emerald-900/60 text-emerald-300'
                    }`}
                  >
                    {recordingSeconds < 90 ? (
                      <span>
                        ⚠️ Your time: {formatSecs(recordingSeconds)}. Target: 2:00. Under-developed answer penalty!
                      </span>
                    ) : (
                      <span>
                        ✓ Excellent timing ({formatSecs(recordingSeconds)}). Fully developed Band 7.5+ length.
                      </span>
                    )}
                  </div>
                )}

                {/* Recorder Control Buttons */}
                <div className="flex items-center justify-center gap-3 pt-2">
                  {!isRecording ? (
                    <button
                      id="btn-start-speech-record"
                      onClick={startMediaRecording}
                      className="px-6 py-2.5 rounded-lg bg-[#d4af37] hover:bg-[#e2be4a] text-black font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all"
                    >
                      <Mic className="w-4 h-4" />
                      <span>Start Speaking Recording</span>
                    </button>
                  ) : (
                    <button
                      id="btn-stop-speech-record"
                      onClick={stopMediaRecording}
                      className="px-6 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all animate-pulse"
                    >
                      <Square className="w-4 h-4 fill-white" />
                      <span>Stop Recording ({formatSecs(recordingSeconds)})</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setIsRecording(false);
                      setRecordingSeconds(0);
                      setAudioUrl(null);
                    }}
                    className="px-3.5 py-2.5 rounded-lg bg-[#141414] hover:bg-[#202020] text-[#888888] hover:text-white border border-[#222222] text-xs font-semibold"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>

                {audioUrl && (
                  <div className="pt-2">
                    <audio controls src={audioUrl} className="w-full max-w-md mx-auto h-10" />
                  </div>
                )}
              </div>

              {/* Transcript / Answer Notes */}
              <div className="space-y-1.5">
                <label className="block text-[11px] uppercase tracking-wider text-[#888888] font-bold">
                  Transcript / Spoken Content Summary:
                </label>
                <textarea
                  rows={4}
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  placeholder="Paste or edit your spoken response transcript for deep Lexical and Grammar analysis..."
                  className="w-full p-3 text-xs sm:text-sm bg-[#0f0f0f] border border-[#222222] rounded-xl focus:outline-none focus:border-[#d4af37] text-[#e0e0e0]"
                />
              </div>

              {/* Submit for AI Examiner Analysis */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() =>
                    setTranscript(
                      `I'd like to share an unforgettable journey I took to the ancient city of Kyoto two years ago. I travelled there by the Shinkansen bullet train from Tokyo, accompanied by my younger sister. What made the journey particularly memorable was witnessing the autumn foliage illuminations around the historic Kiyomizu-dera temple. The vibrant maple leaves reflecting against the temple pagodas created a mesmerizing scenery that permanently reshaped my appreciation for traditional architecture.`
                    )
                  }
                  className="text-xs text-[#d4af37] hover:underline"
                >
                  Load Sample Speaking Transcript
                </button>

                <button
                  id="btn-analyze-speaking"
                  onClick={handleAnalyzeAndSave}
                  disabled={isAnalyzing}
                  className="px-6 py-2.5 rounded-lg bg-[#d4af37] hover:bg-[#e2be4a] text-black font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
                  <span>{isAnalyzing ? 'Evaluating Speech...' : 'Analyze & Save Recording'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right 1 Col: Strategy & Target Time Gauge */}
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-[#0a0a0a] border border-[#1a1a1a] space-y-3">
              <h3 className="font-serif italic text-white text-base">Part 2 Golden Time Rule</h3>
              <div className="p-3.5 rounded-xl bg-[#0f0f0f] border border-[#1a1a1a] text-xs text-[#a0a0a0] space-y-2">
                <p className="font-bold text-[#d4af37]">Target: 2:00 Minutes</p>
                <p>
                  Stopping early triggers a Fluency penalty because you fail to demonstrate sustained complex speech.
                </p>
                <p className="text-[#888888] italic">
                  Tip: 4-step elaboration rule (Context → Narrative → Highlight → Personal Reflection).
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#0a0a0a] border border-[#1a1a1a] space-y-3">
              <h3 className="font-serif italic text-white text-base">Assessment Criteria</h3>
              <div className="space-y-2 text-xs text-[#888888]">
                <div className="p-2.5 rounded-lg bg-[#0f0f0f] border border-[#1a1a1a]">
                  <strong className="text-white">Fluency & Coherence:</strong> Natural flow without unnatural pauses; discourse connectors.
                </div>
                <div className="p-2.5 rounded-lg bg-[#0f0f0f] border border-[#1a1a1a]">
                  <strong className="text-white">Lexical Resource:</strong> Idiomatic collocations, precise adjectives.
                </div>
                <div className="p-2.5 rounded-lg bg-[#0f0f0f] border border-[#1a1a1a]">
                  <strong className="text-white">Grammar Range:</strong> Complex sentence structures, conditional clauses.
                </div>
                <div className="p-2.5 rounded-lg bg-[#0f0f0f] border border-[#1a1a1a]">
                  <strong className="text-white">Pronunciation:</strong> Intonation, rhythm, word and sentence stress.
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Recording History View */
        <div className="space-y-6">
          {recordings.length === 0 ? (
            <div className="p-12 text-center bg-[#0a0a0a] rounded-2xl border border-[#1a1a1a] text-[#888888]">
              <Mic className="w-10 h-10 mx-auto text-[#444444] mb-2" />
              <p className="font-semibold text-white">No speaking recordings yet</p>
              <button
                onClick={() => setActiveTab('record')}
                className="mt-3 px-4 py-2 bg-[#d4af37] text-black rounded-lg text-xs font-bold uppercase tracking-wider"
              >
                Record Your First Answer
              </button>
            </div>
          ) : selectedRecording ? (
            <div className="space-y-6">
              {/* Selector Pills */}
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
                {recordings.map((rec) => (
                  <button
                    key={rec.id}
                    onClick={() => setSelectedRecording(rec)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
                      selectedRecording.id === rec.id
                        ? 'bg-[#1a1a1a] text-white border border-[#d4af37]/40'
                        : 'bg-[#0a0a0a] border border-[#1a1a1a] text-[#888888] hover:text-white'
                    }`}
                  >
                    <span>{rec.part.toUpperCase()}</span>
                    <span className="px-1.5 py-0.5 rounded bg-[#141414] text-[#d4af37] text-[10px] font-bold">
                      Band {rec.scores.estimatedBand}
                    </span>
                  </button>
                ))}
              </div>

              {/* Selected Recording Card */}
              <div className="bg-[#0a0a0a] p-6 rounded-2xl border border-[#1a1a1a] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1a1a1a] pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#d4af37]">
                        {selectedRecording.part.replace('_', ' ').toUpperCase()} • {selectedRecording.topic}
                      </span>
                      <span className="text-xs text-[#666666]">• {selectedRecording.date}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs">
                      <span className="font-bold text-white">
                        Duration: {formatSecs(selectedRecording.durationSeconds)}
                      </span>
                      <span className="text-[#666666]">
                        (Target: {formatSecs(selectedRecording.targetDurationSeconds)})
                      </span>
                      {selectedRecording.durationSeconds < 90 && selectedRecording.part === 'part_2' && (
                        <span className="px-2 py-0.5 rounded bg-rose-950/60 text-rose-400 border border-rose-900/60 font-bold text-[10px]">
                          Under-Time Warning
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-baseline gap-2 bg-[#141414] px-4 py-2 rounded-xl border border-[#2a2a2a] shrink-0">
                    <span className="text-xs text-[#888888] font-medium">Overall Band:</span>
                    <span className="text-2xl font-serif font-bold text-[#d4af37]">
                      {selectedRecording.scores.estimatedBand}
                    </span>
                  </div>
                </div>

                {/* 4 Criteria Scores */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-[#0f0f0f] border border-[#1a1a1a]">
                    <span className="text-[10px] font-bold uppercase text-[#666666] block">
                      Fluency & Coherence
                    </span>
                    <span className="text-xl font-serif font-bold text-white">
                      {selectedRecording.scores.fluencyCoherence}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#0f0f0f] border border-[#1a1a1a]">
                    <span className="text-[10px] font-bold uppercase text-[#666666] block">
                      Lexical Resource
                    </span>
                    <span className="text-xl font-serif font-bold text-white">
                      {selectedRecording.scores.lexicalResource}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#0f0f0f] border border-[#1a1a1a]">
                    <span className="text-[10px] font-bold uppercase text-[#666666] block">
                      Grammar Accuracy
                    </span>
                    <span className="text-xl font-serif font-bold text-white">
                      {selectedRecording.scores.grammaticalRange}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#0f0f0f] border border-[#1a1a1a]">
                    <span className="text-[10px] font-bold uppercase text-[#666666] block">
                      Pronunciation
                    </span>
                    <span className="text-xl font-serif font-bold text-white">
                      {selectedRecording.scores.pronunciation}
                    </span>
                  </div>
                </div>

                {/* Feedback Strengths & Areas to Improve */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-xl bg-[#0c140c] border border-emerald-950/60 space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Strengths
                    </span>
                    <ul className="text-xs text-[#a0c0a0] space-y-1">
                      {selectedRecording.feedback.strengths.map((str, i) => (
                        <li key={i}>• {str}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 rounded-xl bg-[#140c0c] border border-rose-950/60 space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> Areas to Improve
                    </span>
                    <ul className="text-xs text-[#c0a0a0] space-y-1">
                      {selectedRecording.feedback.areasToImprove.map((w, i) => (
                        <li key={i}>• {w}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Transcript */}
                {selectedRecording.transcript && (
                  <div className="space-y-1.5 pt-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#888888]">
                      Transcript / Spoken Notes:
                    </span>
                    <p className="text-xs sm:text-sm text-[#e0e0e0] bg-[#0f0f0f] p-4 rounded-xl border border-[#1a1a1a] font-mono leading-relaxed">
                      {selectedRecording.transcript}
                    </p>
                  </div>
                )}

                {/* Model Expansion */}
                {selectedRecording.feedback.sampleExpansion && (
                  <div className="p-4 rounded-xl bg-[#0f0f0f] border border-[#d4af37]/40 space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#d4af37] flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" /> Band 8.5 Model Elaboration
                    </span>
                    <p className="text-xs sm:text-sm text-white whitespace-pre-line font-mono leading-relaxed">
                      {selectedRecording.feedback.sampleExpansion}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

