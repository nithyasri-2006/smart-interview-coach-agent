import React, { useState } from 'react';
import {
  TrendingUp,
  Award,
  AlertCircle,
  FileText,
  ExternalLink,
  BookOpen,
  ArrowRight,
  Sparkles,
  Volume2,
  Cpu
} from 'lucide-react';
import { DashboardStats } from '../types.js';

interface DashboardProps {
  stats: DashboardStats;
  setActiveTab: (tab: string) => void;
  hasResume: boolean;
}

export default function Dashboard({ stats, setActiveTab, hasResume }: DashboardProps) {
  const [hoveredHistoryIndex, setHoveredHistoryIndex] = useState<number | null>(null);

  // Fallback if empty state
  const isEmpty = !stats || stats.totalQuestionsAnswered === 0;

  // Custom SVG Line Chart Calculations
  const renderLineChart = () => {
    if (isEmpty || !stats.scoreHistory || stats.scoreHistory.length < 2) {
      return (
        <div className="h-48 flex flex-col items-center justify-center border border-dashed border-slate-800 rounded-xl bg-slate-900/10">
          <TrendingUp className="w-8 h-8 text-slate-600 mb-2" />
          <p className="text-xs text-slate-500">History will populate after multiple evaluations</p>
        </div>
      );
    }

    const width = 500;
    const height = 180;
    const padding = 30;

    const scores = stats.scoreHistory.map(h => h.score);
    const minScore = Math.max(0, Math.min(...scores) - 10);
    const maxScore = Math.min(100, Math.max(...scores) + 10);

    const getX = (index: number) => {
      return padding + (index / (scores.length - 1)) * (width - 2 * padding);
    };

    const getY = (score: number) => {
      return height - padding - ((score - minScore) / (maxScore - minScore)) * (height - 2 * padding);
    };

    // Build the SVG path points
    const points = scores.map((score, idx) => `${getX(idx)},${getY(score)}`).join(' ');
    // Area path closing coordinates for elegant under-gradient
    const areaPoints = `${getX(0)},${height - padding} ${points} ${getX(scores.length - 1)},${height - padding}`;

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
        <defs>
          <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((p, idx) => {
          const y = padding + p * (height - 2 * padding);
          const scoreVal = Math.round(maxScore - p * (maxScore - minScore));
          return (
            <g key={idx}>
              <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#1e293b" strokeWidth="1" strokeDasharray="3,3" />
              <text x={padding - 8} y={y + 4} fill="#64748b" fontSize="9" textAnchor="end" fontFamily="monospace">
                {scoreVal}
              </text>
            </g>
          );
        })}

        {/* Gradient fill */}
        <polygon points={areaPoints} fill="url(#chartGlow)" />

        {/* Core Line */}
        <polyline points={points} fill="none" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

        {/* Interactive Dots */}
        {stats.scoreHistory.map((pt, idx) => {
          const cx = getX(idx);
          const cy = getY(pt.score);
          const isHovered = hoveredHistoryIndex === idx;

          return (
            <g
              key={idx}
              onMouseEnter={() => setHoveredHistoryIndex(idx)}
              onMouseLeave={() => setHoveredHistoryIndex(null)}
              className="cursor-pointer"
            >
              <circle cx={cx} cy={cy} r={isHovered ? 8 : 5} fill="#1d4ed8" stroke="#60a5fa" strokeWidth={isHovered ? 3 : 2} className="transition-all duration-150" />
              {isHovered && (
                <g>
                  <rect x={cx - 30} y={cy - 35} width="60" height="24" rx="4" fill="#0f172a" stroke="#1e293b" strokeWidth="1" />
                  <text x={cx} y={cy - 19} fill="#fff" fontSize="9" fontWeight="bold" textAnchor="middle">
                    {pt.score}%
                  </text>
                  <text x={cx} y={height - 8} fill="#94a3b8" fontSize="8" textAnchor="middle">
                    {pt.date}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
    );
  };

  // Custom Category Breakdown bar chart helper
  const renderCategoryBars = () => {
    const categories = Object.keys(stats.categoryPerformance) as Array<keyof typeof stats.categoryPerformance>;

    return (
      <div className="space-y-4">
        {categories.map((cat) => {
          const score = stats.categoryPerformance[cat];
          return (
            <div key={cat} className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-medium text-slate-300">{cat}</span>
                <span className="font-mono font-bold text-blue-400">{score}%</span>
              </div>
              <div className="w-full bg-[#13192e] rounded-full h-2 overflow-hidden border border-slate-800/60">
                <div
                  className="bg-gradient-to-r from-blue-600 to-indigo-500 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${isEmpty ? 0 : score}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fadeIn">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-slate-950 via-[#0e1428] to-slate-950 p-6 rounded-2xl border border-blue-900/30 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div>
          <div className="flex items-center space-x-2 text-blue-400 mb-1.5">
            <Sparkles className="w-4 h-4" />
            <span className="text-[10px] font-mono font-bold tracking-wider uppercase">Active Preparation Terminal</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Smart Interview Coaching Dashboard</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Evaluate your skills dynamically with Google Gemini. Upload a resume, trigger customized mock interviews, and receive executive feedback.
          </p>
        </div>
        <div className="shrink-0 flex space-x-3">
          {!hasResume ? (
            <button
              onClick={() => setActiveTab('upload')}
              className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-600/10 flex items-center space-x-2"
            >
              <FileText className="w-4 h-4" />
              <span>Analyze Resume first</span>
            </button>
          ) : (
            <button
              onClick={() => setActiveTab('interview')}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-600/15 flex items-center space-x-2 border border-blue-500/20"
            >
              <Cpu className="w-4 h-4" />
              <span>Launch Mock Interview</span>
            </button>
          )}
        </div>
      </div>

      {/* Stats Summary Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Card 1: Overall Rating Ring */}
        <div className="md:col-span-1 bg-[#0f1424] border border-[#1e293b] p-6 rounded-2xl flex flex-col items-center justify-center text-center shadow-lg relative overflow-hidden">
          <span className="text-xs font-semibold text-slate-400 self-start mb-4">Overall Evaluation</span>
          <div className="relative flex items-center justify-center w-32 h-32">
            {/* SVG Circle Track */}
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="64" cy="64" r="50" stroke="#13192e" strokeWidth="8" fill="transparent" />
              <circle
                cx="64"
                cy="64"
                r="50"
                stroke="url(#blueIndigo)"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray="314"
                strokeDashoffset={314 - (314 * (isEmpty ? 0 : stats.overallScore)) / 100}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="blueIndigo" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#6366f1" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute text-center">
              <span className="text-3xl font-extrabold text-white font-mono leading-none">{isEmpty ? '--' : `${stats.overallScore}%`}</span>
              <p className="text-[9px] text-slate-500 uppercase font-bold tracking-wider mt-1">Overall</p>
            </div>
          </div>
          <div className="mt-4 flex items-center space-x-1 bg-blue-950/20 border border-blue-900/30 px-2 py-1 rounded-lg text-[10px] text-blue-400">
            <Award className="w-3.5 h-3.5" />
            <span>AI Verified Score</span>
          </div>
        </div>

        {/* Card 2: Core Attribute Sliders */}
        <div className="md:col-span-2 bg-[#0f1424] border border-[#1e293b] p-6 rounded-2xl shadow-lg">
          <span className="text-xs font-semibold text-slate-400 block mb-5">AI Behavioral Metrics</span>
          <div className="space-y-4">
            {/* Tech Score */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Technical Accuracy</span>
                <span className="font-mono font-bold text-slate-200">{isEmpty ? 0 : stats.technicalScore}%</span>
              </div>
              <div className="w-full bg-[#13192e] rounded-full h-2 border border-slate-800/40">
                <div className="bg-blue-500 h-2 rounded-full transition-all duration-1000" style={{ width: `${isEmpty ? 0 : stats.technicalScore}%` }} />
              </div>
            </div>

            {/* Comm Score */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Communication & Structure</span>
                <span className="font-mono font-bold text-slate-200">{isEmpty ? 0 : stats.communicationScore}%</span>
              </div>
              <div className="w-full bg-[#13192e] rounded-full h-2 border border-slate-800/40">
                <div className="bg-indigo-500 h-2 rounded-full transition-all duration-1000" style={{ width: `${isEmpty ? 0 : stats.communicationScore}%` }} />
              </div>
            </div>

            {/* Confidence Score */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Delivery & Confidence</span>
                <span className="font-mono font-bold text-slate-200">{isEmpty ? 0 : stats.confidenceScore}%</span>
              </div>
              <div className="w-full bg-[#13192e] rounded-full h-2 border border-slate-800/40">
                <div className="bg-teal-500 h-2 rounded-full transition-all duration-1000" style={{ width: `${isEmpty ? 0 : stats.confidenceScore}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Summary Analytics stats */}
        <div className="md:col-span-1 bg-[#0f1424] border border-[#1e293b] p-6 rounded-2xl flex flex-col justify-between shadow-lg">
          <div>
            <span className="text-xs font-semibold text-slate-400 block mb-4">Activity Logs</span>
            <div className="space-y-4">
              <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-800/60 flex items-center justify-between">
                <span className="text-xs text-slate-400">Total Interviews</span>
                <span className="text-lg font-bold font-mono text-white">{stats.totalInterviews}</span>
              </div>
              <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-800/60 flex items-center justify-between">
                <span className="text-xs text-slate-400">Answer Evaluations</span>
                <span className="text-lg font-bold font-mono text-white">{stats.totalQuestionsAnswered}</span>
              </div>
            </div>
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-4">
            System: Connected via REST to local persistent store.
          </div>
        </div>
      </div>

      {/* Main Charts area */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Line Chart: Score Over Time */}
        <div className="md:col-span-2 bg-[#0f1424] border border-[#1e293b] p-6 rounded-2xl shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <span className="text-xs font-semibold text-slate-400">Performance Over Time (Overall Score %)</span>
            <span className="text-[10px] font-mono text-blue-400 bg-blue-950/40 px-2 py-0.5 rounded border border-blue-900/30">LATEST 10 MOCKS</span>
          </div>
          <div className="h-48 flex items-end">
            {renderLineChart()}
          </div>
        </div>

        {/* Category Breakdown Bar Chart */}
        <div className="bg-[#0f1424] border border-[#1e293b] p-6 rounded-2xl shadow-lg">
          <span className="text-xs font-semibold text-slate-400 block mb-6">Performance by Category</span>
          {renderCategoryBars()}
        </div>
      </div>

      {/* Gaps and Weak areas & recommended Learning */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Weak Areas List */}
        <div className="bg-[#0f1424] border border-[#1e293b] p-6 rounded-2xl shadow-lg">
          <div className="flex items-center space-x-2 text-slate-400 mb-4">
            <AlertCircle className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-semibold">Identified Skill Deficiencies</span>
          </div>
          {isEmpty && stats.weakAreas.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              Once you complete evaluations, specific gaps and weak areas will load here.
            </div>
          ) : (
            <div className="space-y-2">
              {stats.weakAreas.map((area, idx) => (
                <div key={idx} className="flex items-center space-x-3 bg-slate-900/40 p-3 rounded-xl border border-slate-800/40 text-xs">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                  <span className="text-slate-200">{area}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Instant tips & course list */}
        <div className="bg-[#0f1424] border border-[#1e293b] p-6 rounded-2xl shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-slate-400 mb-4">
              <BookOpen className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-semibold">Recommended Courses</span>
            </div>
            {isEmpty && stats.recommendedLearning.courses.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                Courses matching your weak areas will display once an evaluation finishes.
              </div>
            ) : (
              <div className="space-y-3">
                {stats.recommendedLearning.courses.map((course, idx) => (
                  <a
                    href={course.url}
                    target="_blank"
                    rel="noreferrer"
                    key={idx}
                    className="flex items-start justify-between bg-slate-900/40 p-3 rounded-xl border border-slate-800/40 hover:border-slate-700/60 transition-all text-xs group"
                  >
                    <div>
                      <h4 className="font-semibold text-slate-200 group-hover:text-blue-400 transition-all">{course.title}</h4>
                      <p className="text-[10px] text-slate-500 mt-1">{course.provider}</p>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300" />
                  </a>
                ))}
              </div>
            )}
          </div>
          {stats.recommendedLearning.courses.length > 0 && (
            <button
              onClick={() => setActiveTab('learning')}
              className="mt-4 text-xs font-semibold text-blue-400 hover:text-blue-300 self-end flex items-center space-x-1 transition-all"
            >
              <span>Explore full Recommendations</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
