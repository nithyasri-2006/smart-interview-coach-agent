import React, { useState, useRef, useEffect } from 'react';
import {
  UploadCloud,
  FileText,
  AlertCircle,
  CheckCircle,
  Brain,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Cpu
} from 'lucide-react';
import { Resume } from '../types.js';

interface ResumeUploadProps {
  onUploadSuccess: (resume: Resume) => void;
  currentResume: Resume | null;
}

export default function ResumeUpload({ onUploadSuccess, currentResume }: ResumeUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState('');
  const [useTextMode, setUseTextMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMessageIdx, setLoadingMessageIdx] = useState(0);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadingMessages = [
    "Ingesting resume stream buffer...",
    "Analyzing PDF bounding boxes and document layout...",
    "Sending structural data streams to Google Gemini...",
    "Extracting specialized technical and soft skills...",
    "Evaluating executive strengths and identifying skill deficiencies...",
    "Compiling personalized interview preparation recommendations...",
    "Finalizing structural parsing indices..."
  ];

  // Rotate loading messages
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      interval = setInterval(() => {
        setLoadingMessageIdx((prev) => (prev + 1) % loadingMessages.length);
      }, 2500);
    } else {
      setLoadingMessageIdx(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setError('');

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      validateAndSetFile(droppedFile);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    if (selectedFile.type !== 'application/pdf' && !selectedFile.name.endsWith('.pdf')) {
      setError('Please upload a valid PDF document. Direct PDF parsing is optimized.');
      return;
    }
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('File size exceeds the 5MB limit.');
      return;
    }
    setFile(selectedFile);
  };

  const handleAnalyze = async () => {
    setError('');
    setLoading(true);

    const token = localStorage.getItem('coach_token');
    if (!token) {
      setError('Session expired. Please sign in again.');
      setLoading(false);
      return;
    }

    const formData = new FormData();
    if (useTextMode) {
      if (!resumeText.trim()) {
        setError('Please paste your resume text first.');
        setLoading(false);
        return;
      }
      formData.append('resumeText', resumeText);
    } else {
      if (!file) {
        setError('Please drag and drop or upload a resume PDF.');
        setLoading(false);
        return;
      }
      formData.append('resume', file);
    }

    try {
      const res = await fetch('/api/resume/analyze', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to analyze resume');
      }

      onUploadSuccess(data);
    } catch (err: any) {
      setError(err.message || 'An error occurred during parsing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 text-blue-400 mb-1">
          <Brain className="w-4 h-4" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider">Semantic Ingestion Engine</span>
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Resume Parsing & AI Analysis</h2>
        <p className="text-xs text-slate-400 mt-1">
          Upload your resume. Google Gemini will extract structured attributes, map professional strengths, and calibrate questions to your background.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/20 text-red-400 flex items-start space-x-3 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        /* Immersive Loading Screen */
        <div className="bg-[#0f1424] border border-[#1e293b] rounded-2xl p-12 flex flex-col items-center justify-center text-center shadow-xl min-h-[350px]">
          <div className="relative w-16 h-16 mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-blue-500/10 border-t-blue-500 animate-spin"></div>
            <div className="absolute inset-2 bg-slate-900 rounded-full flex items-center justify-center">
              <Cpu className="w-6 h-6 text-blue-400 animate-pulse" />
            </div>
          </div>
          <h3 className="text-sm font-semibold text-slate-200">Analyzing Your Credentials</h3>
          <p className="text-xs text-blue-400 font-mono mt-3 h-5 animate-pulse">
            {loadingMessages[loadingMessageIdx]}
          </p>
          <p className="text-[10px] text-slate-500 mt-8 max-w-sm">
            Our agent is generating model prompts to construct standard JSON. This may take a moment.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Form Side */}
          <div className="md:col-span-2 bg-[#0f1424] border border-[#1e293b] p-6 rounded-2xl shadow-lg space-y-6">
            <div className="flex justify-between items-center border-b border-[#1e293b] pb-3">
              <span className="text-xs font-bold text-slate-300">Ingestion Method</span>
              <div className="flex space-x-2">
                <button
                  onClick={() => { setUseTextMode(false); setError(''); }}
                  className={`px-3 py-1 text-[10px] rounded-lg font-semibold transition-all border ${!useTextMode ? 'bg-blue-600/10 text-blue-400 border-blue-500/30' : 'text-slate-400 border-transparent hover:text-slate-200'}`}
                >
                  Direct PDF Upload
                </button>
                <button
                  onClick={() => { setUseTextMode(true); setError(''); }}
                  className={`px-3 py-1 text-[10px] rounded-lg font-semibold transition-all border ${useTextMode ? 'bg-blue-600/10 text-blue-400 border-blue-500/30' : 'text-slate-400 border-transparent hover:text-slate-200'}`}
                >
                  Paste Text
                </button>
              </div>
            </div>

            {useTextMode ? (
              /* Text mode text-area */
              <div className="space-y-2">
                <label className="block text-xs text-slate-400">Paste Plain Text Resume Content</label>
                <textarea
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste work experience, education, skills..."
                  rows={10}
                  className="w-full bg-[#13192e] border border-[#1e293b] rounded-xl p-4 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all font-mono"
                />
              </div>
            ) : (
              /* Drag Drop Zone */
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${dragActive ? 'border-blue-500 bg-blue-950/10' : file ? 'border-green-500/40 bg-green-950/5' : 'border-[#1e293b] hover:border-slate-700/60'}`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                {file ? (
                  <>
                    <div className="p-3 bg-green-950/20 border border-green-500/20 text-green-400 rounded-xl mb-3">
                      <FileText className="w-8 h-8" />
                    </div>
                    <span className="text-xs font-semibold text-slate-200">{file.name}</span>
                    <span className="text-[10px] text-slate-500 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB • Ready to analyze</span>
                  </>
                ) : (
                  <>
                    <div className="p-3 bg-blue-950/20 border border-blue-500/20 text-blue-400 rounded-xl mb-3">
                      <UploadCloud className="w-8 h-8" />
                    </div>
                    <span className="text-xs font-semibold text-slate-200">Drag & Drop Resume PDF here</span>
                    <span className="text-[10px] text-slate-500 mt-1">or click to browse local files (PDF only, max 5MB)</span>
                  </>
                )}
              </div>
            )}

            <button
              onClick={handleAnalyze}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold py-2.5 px-4 rounded-xl transition-all shadow-lg shadow-blue-600/10 flex items-center justify-center space-x-2"
            >
              <span>Trigger AI Deep Analysis</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Current Status Sidebar */}
          <div className="space-y-6">
            {currentResume ? (
              <div className="bg-[#0f1424] border border-[#1e293b] p-6 rounded-2xl shadow-lg space-y-5">
                <div className="flex items-center space-x-2 text-green-400 border-b border-[#1e293b] pb-3">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-xs font-bold text-slate-300">Resume Synced</span>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-slate-500 block uppercase font-semibold">CANDIDATE</span>
                  <span className="text-sm font-bold text-slate-200">{currentResume.analysis.candidateName}</span>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-slate-500 block uppercase font-semibold">SKILLS EXTRACTED</span>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {currentResume.analysis.technicalSkills.slice(0, 8).map((s, idx) => (
                      <span key={idx} className="text-[10px] bg-slate-900 border border-slate-800 text-slate-300 px-2 py-0.5 rounded">
                        {s}
                      </span>
                    ))}
                    {currentResume.analysis.technicalSkills.length > 8 && (
                      <span className="text-[10px] text-slate-500 px-1 mt-0.5">+{currentResume.analysis.technicalSkills.length - 8} more</span>
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-slate-500 block uppercase font-semibold">RECOMMENDED TOPICS</span>
                  <ul className="list-disc list-inside space-y-1 mt-2 text-xs text-slate-400">
                    {currentResume.analysis.recommendedTopics.slice(0, 3).map((t, idx) => (
                      <li key={idx} className="truncate">{t}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="bg-[#0f1424] border border-[#1e293b] p-6 rounded-2xl shadow-lg text-center py-12 text-slate-500">
                <Sparkles className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                <p className="text-xs">No active resume analyzed for this account yet.</p>
                <p className="text-[10px] text-slate-600 mt-2">Analysis data is persisted securely inside our file-based database schema.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
