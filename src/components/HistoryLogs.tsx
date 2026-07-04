import React, { useState } from 'react';
import {
  History,
  TrendingUp,
  FileText,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  AlertCircle,
  Award,
  BookOpen,
  Calendar,
  Sparkles,
  ClipboardList
} from 'lucide-react';

interface HistoryLogsProps {
  history: any[];
  loading: boolean;
}

export default function HistoryLogs({ history, loading }: HistoryLogsProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const token = localStorage.getItem('coach_token');

  const handleDownloadReport = (interviewId: string) => {
    // Open printable standalone report rendered by the server in a new window
    window.open(`/api/report/download/${interviewId}?authorization=Bearer ${token}`, '_blank');
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-500 text-xs flex flex-col items-center justify-center min-h-[300px]">
        <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4"></div>
        <span>Retrieving historic evaluations...</span>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-fadeIn">
      {/* Title */}
      <div>
        <div className="flex items-center space-x-2 text-blue-400 mb-1">
          <History className="w-4 h-4" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider">Evaluation Archives</span>
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Interview Logs & Reports</h2>
        <p className="text-xs text-slate-400 mt-1">
          Browse previous interview iterations, review question details, track ratings, and export professional matching certificates.
        </p>
      </div>

      {history.length === 0 ? (
        <div className="bg-[#0f1424] border border-[#1e293b] rounded-2xl p-12 text-center text-slate-500 py-16">
          <ClipboardList className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-sm font-semibold text-slate-300">No Interview Logs Found</h3>
          <p className="text-xs max-w-md mx-auto mt-2 text-slate-500 leading-relaxed">
            Configure your target profile and start a mock interview. Your questions and AI evaluations will accumulate in this workspace.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((item) => {
            const isExpanded = expandedId === item.id;
            const scoreColor = item.avgScore >= 80 ? 'text-green-400 border-green-950 bg-green-950/20' : item.avgScore >= 60 ? 'text-amber-400 border-amber-950 bg-amber-950/20' : 'text-red-400 border-red-950 bg-red-950/20';

            return (
              <div key={item.id} className="bg-[#0f1424] border border-[#1e293b] rounded-2xl overflow-hidden shadow-lg transition-all">
                {/* Header Row */}
                <div
                  onClick={() => toggleExpand(item.id)}
                  className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 cursor-pointer hover:bg-slate-900/10 transition-all select-none"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-bold text-slate-200">{item.jobRole}</h4>
                      <span className="text-[10px] font-mono font-semibold bg-slate-900 text-slate-400 px-2 py-0.5 rounded border border-slate-800">
                        {item.experienceLevel}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3 text-[10px] text-slate-500">
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                      </span>
                      <span>•</span>
                      <span>Difficulty: <strong className="text-slate-400">{item.difficultyLevel}</strong></span>
                      <span>•</span>
                      <span>Answered: <strong className="text-slate-400">{item.answeredCount}/{item.questionsCount}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 shrink-0 self-end md:self-auto">
                    {item.answeredCount > 0 && (
                      <div className={`border px-3 py-1.5 rounded-xl text-xs font-bold font-mono text-center min-w-[55px] ${scoreColor}`}>
                        {item.avgScore}%
                      </div>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownloadReport(item.id);
                      }}
                      className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-slate-100 rounded-xl transition-all"
                      title="Download Evaluation Report"
                    >
                      <FileText className="w-4 h-4" />
                    </button>

                    {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-[#1e293b] bg-slate-950/20 p-6 space-y-6 animate-slideDown">
                    {item.evaluations.length === 0 ? (
                      <p className="text-xs text-slate-500 text-center py-4">Questions generated, but no evaluations were compiled for this session.</p>
                    ) : (
                      <div className="space-y-5">
                        <div className="flex items-center space-x-2 text-xs font-bold text-slate-300 border-b border-slate-800/60 pb-2">
                          <ClipboardList className="w-4 h-4 text-blue-400" />
                          <span>Question by Question Evaluations</span>
                        </div>
                        {item.evaluations.map((evalRecord: any, idx: number) => (
                          <div key={evalRecord.id} className="bg-slate-900/30 p-4 rounded-xl border border-slate-800/40 space-y-4">
                            <div className="flex justify-between items-start gap-4 text-xs">
                              <h5 className="font-semibold text-slate-300 leading-relaxed">
                                <span className="font-mono text-blue-500 mr-1">Q{idx + 1}:</span>
                                {evalRecord.questionText}
                              </h5>
                              <div className="text-xs font-bold font-mono text-blue-400 bg-blue-950/40 px-2 py-1 rounded border border-blue-900/30 shrink-0">
                                {evalRecord.evaluation.overallScore}%
                              </div>
                            </div>

                            <div className="text-xs p-3 bg-[#13192e] rounded-lg border border-[#1e293b] italic text-slate-400">
                              " {evalRecord.answerText} "
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                              {/* Strengths */}
                              <div className="space-y-1">
                                <span className="text-[10px] font-mono text-slate-500 font-bold block uppercase">STRENGTHS</span>
                                <ul className="list-disc list-inside space-y-0.5 text-slate-400">
                                  {evalRecord.evaluation.strengths.slice(0, 3).map((s: string, sIdx: number) => (
                                    <li key={sIdx} className="truncate">{s}</li>
                                  ))}
                                </ul>
                              </div>

                              {/* Improvement */}
                              <div className="space-y-1">
                                <span className="text-[10px] font-mono text-slate-500 font-bold block uppercase">IMPROVEMENT TIPS</span>
                                <ul className="list-disc list-inside space-y-0.5 text-slate-400">
                                  {evalRecord.evaluation.improvementSuggestions.slice(0, 3).map((s: string, sIdx: number) => (
                                    <li key={sIdx} className="truncate">{s}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
