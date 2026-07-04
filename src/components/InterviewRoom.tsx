import React, { useState } from 'react';
import {
  Play,
  Brain,
  HelpCircle,
  Lightbulb,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Award,
  ChevronRight,
  ArrowRight,
  Send,
  Sparkles,
  Volume2,
  RefreshCw,
  Clock,
  Mic,
  MicOff,
  Database
} from 'lucide-react';
import { Question, Interview, EvaluationRecord } from '../types.js';

interface InterviewRoomProps {
  currentResume: any;
  setActiveTab: (tab: string) => void;
  onNewHistoryItem: () => void;
}

export default function InterviewRoom({ currentResume, setActiveTab, onNewHistoryItem }: InterviewRoomProps) {
  // Config state
  const [jobRole, setJobRole] = useState('Full Stack Software Engineer');
  const [experienceLevel, setExperienceLevel] = useState('Mid-Level');
  const [difficultyLevel, setDifficultyLevel] = useState('Medium');
  const [generating, setGenerating] = useState(false);

  // Active Interview state
  const [interview, setInterview] = useState<Interview | null>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const [answerText, setAnswerText] = useState('');
  const [evaluating, setEvaluating] = useState(false);
  const [currentEvaluation, setCurrentEvaluation] = useState<any | null>(null);
  const [error, setError] = useState('');
  const [showHint, setShowHint] = useState(false);

  // Dictation emulation state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTimer, setRecordingTimer] = useState(0);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);

  const startDictation = () => {
    setIsRecording(true);
    setRecordingTimer(0);
    setError('');

    // Simulated dictation increments text slightly over time as a mock
    const prompts = [
      "In my previous experience, I focused on optimizing render speeds. ",
      "We leveraged modern React memoization hooks like useMemo and useCallback. ",
      "Additionally, we implemented asynchronous bundling and database index optimizations ",
      "which successfully dropped page load times by approximately forty percent, boosting retention."
    ];
    let idx = 0;

    timerRef.current = setInterval(() => {
      setRecordingTimer((prev) => {
        if (prev >= 12) {
          stopDictation();
          return prev;
        }
        if (prev % 3 === 0 && idx < prompts.length) {
          setAnswerText((prevText) => prevText + prompts[idx++]);
        }
        return prev + 1;
      });
    }, 1000);
  };

  const stopDictation = () => {
    setIsRecording(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleStartInterview = async () => {
    setError('');
    setGenerating(true);

    const token = localStorage.getItem('coach_token');
    if (!token) {
      setError('Session expired. Please sign in again.');
      setGenerating(false);
      return;
    }

    try {
      const res = await fetch('/api/interview/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          jobRole,
          experienceLevel,
          difficultyLevel
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate interview');
      }

      setInterview(data);
      setActiveIdx(0);
      setAnswerText('');
      setCurrentEvaluation(null);
      setShowHint(false);
    } catch (err: any) {
      setError(err.message || 'Failed to start interview');
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!answerText.trim()) {
      setError('Please type or dictate your response first.');
      return;
    }
    setError('');
    setEvaluating(true);

    const token = localStorage.getItem('coach_token');
    const currentQuestion = interview?.questions[activeIdx];

    try {
      const res = await fetch('/api/interview/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          interviewId: interview?.id,
          questionId: currentQuestion?.id,
          questionText: currentQuestion?.question,
          answerText
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to evaluate answer');
      }

      setCurrentEvaluation(data.evaluation);
    } catch (err: any) {
      setError(err.message || 'Failed to submit answer');
    } finally {
      setEvaluating(false);
    }
  };

  const handleNextQuestion = () => {
    if (!interview) return;
    setError('');
    setAnswerText('');
    setCurrentEvaluation(null);
    setShowHint(false);

    if (activeIdx + 1 < interview.questions.length) {
      setActiveIdx((prev) => prev + 1);
    } else {
      // Completed full session!
      onNewHistoryItem();
      handleMarkCompleted();
    }
  };

  const handleMarkCompleted = async () => {
    const token = localStorage.getItem('coach_token');
    try {
      await fetch(`/api/interview/${interview?.id}/complete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (err) {
      console.error(err);
    }
    // Clean states and redirect user to logs or dashboard
    setInterview(null);
    setActiveTab('history');
  };

  if (generating) {
    return (
      <div className="p-12 max-w-2xl mx-auto text-center bg-[#0f1424] border border-[#1e293b] rounded-2xl shadow-xl min-h-[350px] flex flex-col items-center justify-center animate-fadeIn">
        <div className="p-4 bg-blue-950/20 border border-blue-500/20 text-blue-400 rounded-2xl mb-6 animate-spin">
          <RefreshCw className="w-8 h-8" />
        </div>
        <h3 className="text-sm font-semibold text-slate-200">Generating Personalized Questions</h3>
        <p className="text-xs text-blue-400 font-mono mt-3 animate-pulse">
          Sifting resume attributes and formulating optimized interview prompts...
        </p>
        <p className="text-[10px] text-slate-500 mt-6 max-w-xs">
          Google Gemini is tailoring HR, Technical, behavioral, design, and algorithmic coding challenges.
        </p>
      </div>
    );
  }

  // Configuration View
  if (!interview) {
    return (
      <div className="p-8 max-w-4xl mx-auto space-y-8 animate-fadeIn">
        {/* Title */}
        <div>
          <div className="flex items-center space-x-2 text-blue-400 mb-1">
            <Brain className="w-4 h-4" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider">Interview Calibration</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Configure Interview Profile</h2>
          <p className="text-xs text-slate-400 mt-1">
            Build custom-tailored questions synced with your resume, skills, and weakness history.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/20 text-red-400 flex items-start space-x-3 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main profile form */}
          <div className="md:col-span-2 bg-[#0f1424] border border-[#1e293b] p-6 rounded-2xl shadow-lg space-y-6">
            <div className="grid grid-cols-1 gap-5">
              {/* Job Role input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-400">Target Job Title</label>
                <input
                  type="text"
                  required
                  value={jobRole}
                  onChange={(e) => setJobRole(e.target.value)}
                  placeholder="e.g. Senior Frontend Architect"
                  className="w-full bg-[#13192e] border border-[#1e293b] rounded-xl py-2.5 px-4 text-xs text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all font-sans"
                />
              </div>

              {/* Experience and difficulty levels */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Experience Tier */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-400">Target Seniority Tier</label>
                  <select
                    value={experienceLevel}
                    onChange={(e) => setExperienceLevel(e.target.value)}
                    className="w-full bg-[#13192e] border border-[#1e293b] rounded-xl py-2.5 px-3.5 text-xs text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all font-sans"
                  >
                    <option value="Entry-Level">Entry-Level (Associate)</option>
                    <option value="Mid-Level">Mid-Level Engineer</option>
                    <option value="Senior">Senior Technical Staff</option>
                    <option value="Lead">Lead Architect / Staff</option>
                  </select>
                </div>

                {/* Difficulty */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-400">Gemini Prompt Rigorous Mode</label>
                  <select
                    value={difficultyLevel}
                    onChange={(e) => setDifficultyLevel(e.target.value)}
                    className="w-full bg-[#13192e] border border-[#1e293b] rounded-xl py-2.5 px-3.5 text-xs text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all font-sans"
                  >
                    <option value="Easy">Easy (Conceptual screening)</option>
                    <option value="Medium">Medium (Pragmatic design questions)</option>
                    <option value="Hard">Hard (Severe engineering puzzles)</option>
                  </select>
                </div>
              </div>
            </div>

            <button
              onClick={handleStartInterview}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold py-2.5 px-4 rounded-xl transition-all shadow-lg shadow-blue-600/10 flex items-center justify-center space-x-2 border border-blue-500/20"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Calibrate and Generate Session</span>
            </button>
          </div>

          {/* Quick instructions sidebar */}
          <div className="bg-[#0f1424] border border-[#1e293b] p-6 rounded-2xl shadow-lg space-y-4 text-xs text-slate-400">
            <div className="flex items-center space-x-2 text-blue-400 border-b border-[#1e293b] pb-2">
              <Sparkles className="w-4 h-4" />
              <span className="font-bold text-slate-300">Calibration Rules</span>
            </div>
            <p>Our agent generates exactly 5 questions across 5 target categories:</p>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>HR Screening</strong> (Culture, goals)</li>
              <li><strong>Technical Foundations</strong> (Core runtimes)</li>
              <li><strong>Behavioral Scenario</strong> (Conflict resolving)</li>
              <li><strong>Project Architecture</strong> (Microservice design)</li>
              <li><strong>Coding Challenge</strong> (Algorithmic reasoning)</li>
            </ul>
            <p className="mt-4 pt-4 border-t border-[#1e293b]">
              Your resume analysis data is synced automatically into the prompt generation pipeline to avoid boilerplate generic templates.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Active Interview Room View
  const currentQuestion = interview.questions[activeIdx];

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-fadeIn">
      {/* Question Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-950/40 p-4 rounded-xl border border-slate-800/60 text-xs">
        <div className="flex items-center space-x-3">
          <span className="font-mono bg-blue-950 text-blue-400 px-2 py-1 rounded font-bold border border-blue-900/40">
            Question {activeIdx + 1} of {interview.questions.length}
          </span>
          <span className="font-mono bg-indigo-950 text-indigo-400 px-2 py-1 rounded font-bold border border-indigo-900/40 uppercase">
            {currentQuestion.category}
          </span>
        </div>
        <div className="flex items-center space-x-2 text-slate-500">
          <Clock className="w-4 h-4" />
          <span>Evaluation Session: {interview.jobRole}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main Q&A Field */}
        <div className="md:col-span-2 space-y-6">
          {/* Question Text Box */}
          <div className="bg-[#0f1424] border border-[#1e293b] p-6 rounded-2xl shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl"></div>
            <h3 className="text-lg font-bold text-slate-200 leading-relaxed font-sans">{currentQuestion.question}</h3>

            {/* Hint toggler */}
            {currentQuestion.hint && (
              <div className="mt-5 border-t border-slate-800/60 pt-4">
                <button
                  onClick={() => setShowHint(!showHint)}
                  className="flex items-center space-x-1.5 text-xs text-amber-400 hover:text-amber-300 transition-all font-semibold"
                >
                  <Lightbulb className="w-4 h-4" />
                  <span>{showHint ? 'Hide Assistant Hint' : 'Disclose Assistant Hint'}</span>
                </button>
                {showHint && (
                  <p className="mt-2.5 text-xs text-slate-400 leading-relaxed bg-amber-950/10 border border-amber-900/30 p-3 rounded-xl">
                    {currentQuestion.hint}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Answer Editor / Dictation Module */}
          <div className="bg-[#0f1424] border border-[#1e293b] p-6 rounded-2xl shadow-lg space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-300">Formulate Answer Response</span>

              {/* Speech Emulator button */}
              <button
                onClick={isRecording ? stopDictation : startDictation}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-[10px] font-semibold transition-all border ${isRecording ? 'bg-red-950/20 text-red-400 border-red-500/30 animate-pulse' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'}`}
              >
                {isRecording ? (
                  <>
                    <MicOff className="w-3.5 h-3.5 text-red-400" />
                    <span>Stop Dictating ({recordingTimer}s)</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-3.5 h-3.5 text-blue-400" />
                    <span>Emulate Voice Dictate</span>
                  </>
                )}
              </button>
            </div>

            <textarea
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              disabled={evaluating || currentEvaluation}
              placeholder="Structure your thoughts logically. For behavioral, use STAR methodology. For code/technical, outline components, trade-offs, and scaling complexity..."
              rows={8}
              className="w-full bg-[#13192e] border border-[#1e293b] rounded-xl p-4 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all leading-relaxed"
            />

            {error && (
              <div className="p-3.5 rounded-lg bg-red-950/20 border border-red-500/20 text-red-400 flex items-start space-x-2 text-xs">
                <AlertCircle className="w-4 h-4 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {!currentEvaluation && (
              <button
                onClick={handleSubmitAnswer}
                disabled={evaluating || !answerText.trim()}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold py-2.5 px-4 rounded-xl transition-all shadow-lg shadow-blue-600/10 flex items-center justify-center space-x-2"
              >
                {evaluating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Gemini Running AI Grade Analysis...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Answer for AI Grading</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* AI Evaluation Side Display */}
        <div className="space-y-6">
          {currentEvaluation ? (
            <div className="bg-[#0f1424] border border-[#1e293b] p-6 rounded-2xl shadow-lg space-y-5 animate-slideIn">
              <div className="flex items-center justify-between border-b border-[#1e293b] pb-3 text-xs">
                <div className="flex items-center space-x-1.5 text-green-400 font-bold">
                  <CheckCircle className="w-4 h-4" />
                  <span>AI Grade Dispatched</span>
                </div>
                <div className="text-xl font-extrabold font-mono text-blue-400">{currentEvaluation.overallScore}%</div>
              </div>

              {/* Multi-attribute scores */}
              <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                <div className="bg-slate-900/40 p-2 rounded-lg border border-slate-800/40">
                  <span className="text-slate-500 block font-semibold mb-0.5">Technical</span>
                  <span className="text-slate-200 font-bold font-mono text-xs">{currentEvaluation.technicalScore}%</span>
                </div>
                <div className="bg-slate-900/40 p-2 rounded-lg border border-slate-800/40">
                  <span className="text-slate-500 block font-semibold mb-0.5">Delivery</span>
                  <span className="text-slate-200 font-bold font-mono text-xs">{currentEvaluation.confidenceScore}%</span>
                </div>
                <div className="bg-slate-900/40 p-2 rounded-lg border border-slate-800/40">
                  <span className="text-slate-500 block font-semibold mb-0.5">Pacing</span>
                  <span className="text-slate-200 font-bold font-mono text-xs">{currentEvaluation.communicationScore}%</span>
                </div>
              </div>

              {/* Strengths */}
              <div>
                <span className="text-[9px] font-mono text-slate-500 block uppercase font-bold mb-1.5">STRENGTHS</span>
                <ul className="list-disc list-inside space-y-1 text-xs text-slate-400">
                  {currentEvaluation.strengths.slice(0, 3).map((s: string, idx: number) => (
                    <li key={idx} className="truncate">{s}</li>
                  ))}
                </ul>
              </div>

              {/* Gaps */}
              <div>
                <span className="text-[9px] font-mono text-slate-500 block uppercase font-bold mb-1.5">AREAS TO IMPROVE</span>
                <ul className="list-disc list-inside space-y-1 text-xs text-slate-400">
                  {currentEvaluation.weaknesses.slice(0, 3).map((w: string, idx: number) => (
                    <li key={idx} className="truncate">{w}</li>
                  ))}
                </ul>
              </div>

              {/* Recommended Ideal Response */}
              <div className="bg-slate-900/40 border border-slate-800/60 p-3 rounded-xl text-xs text-slate-400">
                <span className="font-semibold text-slate-300 block mb-1">Exemplary Answer Draft</span>
                <p className="line-clamp-4 leading-relaxed">{currentEvaluation.correctAnswer}</p>
              </div>

              <button
                onClick={handleNextQuestion}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold py-2.5 px-4 rounded-xl transition-all flex items-center justify-center space-x-1.5 border border-blue-500/20"
              >
                <span>{activeIdx + 1 < interview.questions.length ? 'Next Question' : 'Complete Interview'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="bg-[#0f1424] border border-[#1e293b] p-6 rounded-2xl shadow-lg text-center py-12 text-slate-500 text-xs">
              <Sparkles className="w-8 h-8 text-slate-600 mx-auto mb-3" />
              <p>Type your answer in the text field and click submit.</p>
              <p className="text-[10px] text-slate-600 mt-2">Our model will evaluate accuracy, grammar, delivery, and compile structural improvement recommendations.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
