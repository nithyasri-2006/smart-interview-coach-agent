import React from 'react';
import {
  Compass,
  BookOpen,
  Code2,
  Bookmark,
  ExternalLink,
  Award,
  Sparkles,
  ChevronRight,
  TrendingUp,
  HelpCircle,
  Database,
  Cpu
} from 'lucide-react';
import { LearningRecommendation } from '../types.js';

interface LearningCenterProps {
  recommendation: LearningRecommendation | null;
  loading: boolean;
}

export default function LearningCenter({ recommendation, loading }: LearningCenterProps) {
  if (loading) {
    return (
      <div className="p-12 text-center text-slate-500 text-xs flex flex-col items-center justify-center min-h-[300px]">
        <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4"></div>
        <span>Compiling learning recommendation records...</span>
      </div>
    );
  }

  // Fallback empty view if none generated
  if (!recommendation) {
    return (
      <div className="p-12 max-w-2xl mx-auto text-center bg-[#0f1424] border border-[#1e293b] rounded-2xl shadow-xl py-16 animate-fadeIn">
        <Compass className="w-12 h-12 text-slate-600 mx-auto mb-4" />
        <h3 className="text-sm font-semibold text-slate-300">No Learning Recommendation Synthesized</h3>
        <p className="text-xs max-w-sm mx-auto mt-2 text-slate-500 leading-relaxed">
          Upload your resume or complete at least one answer evaluation. Our agent will analyze weak points and auto-generate specialized study tracks here.
        </p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-fadeIn">
      {/* Title */}
      <div>
        <div className="flex items-center space-x-2 text-blue-400 mb-1">
          <Compass className="w-4 h-4" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider">AI Skill Recommender</span>
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Adaptive Learning Center</h2>
        <p className="text-xs text-slate-400 mt-1">
          Gemini-designed study tracks matching your profile gaps. Brush up on algorithms, systems design, and behavioral frameworks.
        </p>
      </div>

      {/* Target weakness topics */}
      <div className="flex flex-wrap gap-2 items-center bg-slate-950/40 p-4 rounded-xl border border-slate-800/40">
        <span className="text-xs font-semibold text-slate-400 mr-2">Study Track Calibrated For:</span>
        {recommendation.weakAreas.map((area, idx) => (
          <span key={idx} className="text-[10px] bg-blue-950/40 border border-blue-900/30 text-blue-400 px-2.5 py-1 rounded-lg font-semibold font-mono">
            {area}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Course recommendations list */}
        <div className="md:col-span-2 space-y-6">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-300 border-b border-slate-800/60 pb-2">
            <BookOpen className="w-4 h-4 text-blue-400" />
            <span>Structured Interactive Courses</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {recommendation.courses.map((course, idx) => (
              <a
                href={course.url}
                target="_blank"
                rel="noreferrer"
                key={idx}
                className="bg-[#0f1424] border border-[#1e293b] hover:border-slate-700/60 p-5 rounded-2xl flex flex-col justify-between transition-all group shadow-md"
              >
                <div className="space-y-2">
                  <span className="text-[9px] font-mono font-bold text-blue-400 bg-blue-950/40 px-2 py-0.5 rounded border border-blue-900/30">
                    {course.provider}
                  </span>
                  <h4 className="text-xs font-bold text-slate-200 group-hover:text-blue-400 transition-all leading-snug">
                    {course.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-3">
                    {course.description}
                  </p>
                </div>
                <div className="mt-4 flex items-center space-x-1 text-[10px] text-slate-500 group-hover:text-slate-300 transition-all self-end font-semibold">
                  <span>Explore Course</span>
                  <ExternalLink className="w-3 h-3" />
                </div>
              </a>
            ))}
          </div>

          {/* Reference Books Section */}
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-300 border-b border-slate-800/60 pb-2 pt-4">
            <Bookmark className="w-4 h-4 text-indigo-400" />
            <span>Recommended Reading & Architecture Standards</span>
          </div>

          <div className="space-y-4">
            {recommendation.books.map((book, idx) => (
              <div key={idx} className="bg-[#0f1424] border border-[#1e293b] p-4 rounded-xl flex items-start space-x-4 shadow-md">
                <div className="p-2.5 bg-indigo-950/20 border border-indigo-900/30 rounded-xl text-indigo-400 shrink-0">
                  <Bookmark className="w-5 h-5" />
                </div>
                <div className="space-y-1 text-xs">
                  <h4 className="font-bold text-slate-200">{book.title}</h4>
                  <p className="text-[10px] text-slate-500">By {book.author}</p>
                  <p className="text-[11px] text-slate-400 leading-relaxed pt-1">{book.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Practice and Tips Sidebar */}
        <div className="space-y-6">
          {/* Coding / System Design practice items */}
          <div className="bg-[#0f1424] border border-[#1e293b] p-6 rounded-2xl shadow-lg space-y-4">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-300 border-b border-slate-800/60 pb-2">
              <Code2 className="w-4 h-4 text-teal-400" />
              <span>Recommended Practice Challenges</span>
            </div>

            <div className="space-y-3 text-xs">
              {recommendation.practiceProblems.map((prob, idx) => {
                const diffColor = prob.difficulty === 'Hard' ? 'text-red-400 border-red-950 bg-red-950/20' : prob.difficulty === 'Medium' ? 'text-amber-400 border-amber-950 bg-amber-950/20' : 'text-green-400 border-green-950 bg-green-950/20';

                return (
                  <a
                    href={prob.url}
                    target="_blank"
                    rel="noreferrer"
                    key={idx}
                    className="flex items-center justify-between bg-slate-900/40 p-3 rounded-xl border border-slate-800/40 hover:border-slate-700/60 transition-all group"
                  >
                    <div>
                      <h5 className="font-semibold text-slate-200 group-hover:text-blue-400 transition-all truncate max-w-[140px]">
                        {prob.title}
                      </h5>
                      <span className="text-[9px] text-slate-500">{prob.platform}</span>
                    </div>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${diffColor}`}>
                      {prob.difficulty}
                    </span>
                  </a>
                );
              })}
            </div>
          </div>

          {/* Expert coach interview hacks */}
          <div className="bg-[#0f1424] border border-[#1e293b] p-6 rounded-2xl shadow-lg space-y-4 text-xs text-slate-400 leading-relaxed">
            <div className="flex items-center space-x-2 text-blue-400 border-b border-[#1e293b] pb-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span className="font-bold text-slate-300">Executive Interview Hacks</span>
            </div>
            {recommendation.tips.map((tip, idx) => (
              <div key={idx} className="flex items-start space-x-2 bg-slate-900/40 p-3 rounded-xl border border-slate-800/40">
                <span className="text-blue-500 font-bold font-mono shrink-0">0{idx + 1}.</span>
                <p className="text-[11px] text-slate-300">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
