/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Brain, Sparkles, Cpu, ShieldAlert } from 'lucide-react';
import { User, Resume, DashboardStats, LearningRecommendation } from './types.js';

import Sidebar from './components/Sidebar.js';
import Auth from './components/Auth.js';
import Dashboard from './components/Dashboard.js';
import ResumeUpload from './components/ResumeUpload.js';
import InterviewRoom from './components/InterviewRoom.js';
import HistoryLogs from './components/HistoryLogs.js';
import LearningCenter from './components/LearningCenter.js';

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('coach_token'));
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Core synchronized full-stack states
  const [resume, setResume] = useState<Resume | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [recommendation, setRecommendation] = useState<LearningRecommendation | null>(null);

  // Loaders
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingResume, setLoadingResume] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loadingRecommendation, setLoadingRecommendation] = useState(false);

  // Check auth and verify user profile
  useEffect(() => {
    const verifyUser = async () => {
      if (!token) {
        setLoadingUser(false);
        return;
      }

      try {
        const res = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!res.ok) {
          throw new Error('Session invalid');
        }

        const data = await res.json();
        setUser(data);
      } catch {
        handleLogout();
      } finally {
        setLoadingUser(false);
      }
    };

    verifyUser();
  }, [token]);

  // Boot queries after user verification
  useEffect(() => {
    if (user && token) {
      fetchCoreData();
    }
  }, [user, token]);

  const fetchCoreData = () => {
    fetchLatestResume();
    fetchStats();
    fetchHistory();
    fetchRecommendations();
  };

  const fetchLatestResume = async () => {
    setLoadingResume(true);
    try {
      const res = await fetch('/api/resume/latest', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setResume(data);
      } else {
        setResume(null);
      }
    } catch (err) {
      console.error('Failed to fetch resume:', err);
    } finally {
      setLoadingResume(false);
    }
  };

  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const res = await fetch('/api/dashboard', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard stats:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await fetch('/api/history', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (err) {
      console.error('Failed to fetch history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const fetchRecommendations = async () => {
    setLoadingRecommendation(true);
    try {
      const res = await fetch('/api/recommendations', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setRecommendation(data);
      }
    } catch (err) {
      console.error('Failed to fetch recommendations:', err);
    } finally {
      setLoadingRecommendation(false);
    }
  };

  const handleAuthSuccess = (newToken: string, authenticatedUser: any) => {
    localStorage.setItem('coach_token', newToken);
    setToken(newToken);
    setUser(authenticatedUser);
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('coach_token');
    setToken(null);
    setUser(null);
    setResume(null);
    setStats(null);
    setHistory([]);
    setRecommendation(null);
  };

  const handleResumeSuccess = (newResume: Resume) => {
    setResume(newResume);
    // Refresh recommendations and stats after a fresh resume upload
    fetchCoreData();
    setActiveTab('dashboard');
  };

  if (loadingUser) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#070913] text-slate-400">
        <div className="relative w-12 h-12 mb-4">
          <div className="absolute inset-0 rounded-full border-4 border-blue-500/10 border-t-blue-500 animate-spin"></div>
          <div className="absolute inset-2 bg-slate-950 rounded-full flex items-center justify-center">
            <Cpu className="w-5 h-5 text-blue-500 animate-pulse" />
          </div>
        </div>
        <span className="text-xs font-semibold tracking-wider font-sans">Booting Smart Interview Terminal...</span>
      </div>
    );
  }

  if (!user) {
    return <Auth onAuthSuccess={handleAuthSuccess} />;
  }

  // Render current mounted module
  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            stats={stats || {
              overallScore: 0,
              technicalScore: 0,
              communicationScore: 0,
              confidenceScore: 0,
              totalInterviews: 0,
              totalQuestionsAnswered: 0,
              categoryPerformance: { HR: 0, Technical: 0, Behavioral: 0, 'Project-Based': 0, Coding: 0 },
              scoreHistory: [],
              weakAreas: [],
              recommendedLearning: { courses: [], tips: [] }
            }}
            setActiveTab={setActiveTab}
            hasResume={!!resume}
          />
        );
      case 'upload':
        return (
          <ResumeUpload
            onUploadSuccess={handleResumeSuccess}
            currentResume={resume}
          />
        );
      case 'interview':
        return (
          <InterviewRoom
            currentResume={resume}
            setActiveTab={setActiveTab}
            onNewHistoryItem={fetchCoreData}
          />
        );
      case 'history':
        return (
          <HistoryLogs
            history={history}
            loading={loadingHistory}
          />
        );
      case 'learning':
        return (
          <LearningCenter
            recommendation={recommendation}
            loading={loadingRecommendation}
          />
        );
      default:
        return (
          <div className="p-8 text-center text-slate-500 text-xs">
            Module under active development.
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-[#f1f5f9] flex">
      {/* Sidebar navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onLogout={handleLogout}
        hasResume={!!resume}
      />

      {/* Main viewport */}
      <main id="main-content" className="flex-1 md:pl-64 min-h-screen relative">
        {/* Top glowing ambient accent */}
        <div className="absolute top-0 left-1/4 w-[400px] h-[300px] bg-blue-500/[0.03] rounded-full blur-[100px] pointer-events-none"></div>

        <div className="min-h-screen flex flex-col justify-between">
          <div className="pb-12">
            {renderTabContent()}
          </div>

          {/* Footer bar */}
          <footer className="py-4 border-t border-slate-900/60 text-center text-[10px] text-slate-500 font-mono flex flex-col sm:flex-row justify-between items-center px-8 gap-2 bg-[#0b0f19]/80 backdrop-blur-sm">
            <span>🧠 Smart Interview Coach Agent • Port 3000 Active</span>
            <div className="flex items-center space-x-2 text-slate-600">
              <span>Security Hash Verification</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}
