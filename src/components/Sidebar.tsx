import React from 'react';
import {
  Brain,
  LayoutDashboard,
  UploadCloud,
  Play,
  History,
  Compass,
  User,
  LogOut,
  Award
} from 'lucide-react';
import { User as UserType } from '../types.js';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: UserType | null;
  onLogout: () => void;
  hasResume: boolean;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  user,
  onLogout,
  hasResume
}: SidebarProps) {
  if (!user) return null;

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, requiredResume: false },
    { id: 'upload', label: 'Resume Analyzer', icon: UploadCloud, requiredResume: false },
    { id: 'interview', label: 'Start Interview', icon: Play, requiredResume: true },
    { id: 'history', label: 'Interview Logs', icon: History, requiredResume: false },
    { id: 'learning', label: 'Learning Center', icon: Compass, requiredResume: false },
  ];

  return (
    <aside id="sidebar-nav" className="fixed top-0 left-0 z-40 w-64 h-screen transition-transform -translate-x-full md:translate-x-0 bg-[#0f1424] border-r border-[#1e293b] flex flex-col justify-between">
      {/* Brand Header */}
      <div className="p-5">
        <div className="flex items-center space-x-3 text-blue-500">
          <Brain className="w-8 h-8 stroke-[2]" />
          <div>
            <h2 className="font-sans font-bold text-lg text-white leading-tight tracking-tight">Smart Interview</h2>
            <span className="text-[10px] font-mono font-medium text-blue-400/80 bg-blue-950/40 px-1.5 py-0.5 rounded border border-blue-900/30">AI COACH AGENT</span>
          </div>
        </div>

        {/* User Identity Info */}
        <div className="mt-8 p-3 rounded-lg bg-slate-900/40 border border-slate-800/40">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-sm text-white">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-slate-200 truncate">{user.name}</p>
              <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation Menus */}
        <nav className="mt-8 space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isSelected = activeTab === item.id;
            const isDisabled = item.requiredResume && !hasResume;

            return (
              <button
                key={item.id}
                onClick={() => !isDisabled && setActiveTab(item.id)}
                disabled={isDisabled}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-lg text-xs font-medium transition-all group ${
                  isSelected
                    ? 'bg-blue-600/10 text-blue-400 border border-blue-500/30 font-semibold'
                    : isDisabled
                    ? 'opacity-40 cursor-not-allowed text-slate-500'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200 border border-transparent'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-300'}`} />
                  <span>{item.label}</span>
                </div>
                {item.requiredResume && isDisabled && (
                  <span className="text-[9px] font-mono bg-amber-950/40 text-amber-500 px-1.5 py-0.5 rounded border border-amber-900/30">
                    Upload Resume
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer logout */}
      <div className="p-4 border-t border-[#1e293b] bg-slate-950/20">
        <button
          onClick={onLogout}
          className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-xs font-medium text-red-400 hover:bg-red-950/10 hover:text-red-300 border border-transparent hover:border-red-950/30 transition-all"
        >
          <LogOut className="w-4 h-4 text-red-400" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
