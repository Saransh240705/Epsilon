
import React from 'react';
import { ViewType } from '../types';

interface SidebarProps {
  currentView: ViewType;
  onNavigate: (view: ViewType) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate }) => {
  const items = [
    { id: ViewType.DASHBOARD, label: 'Overview', icon: 'dashboard' },
    { id: ViewType.COMPARISON, label: 'Comparison', icon: 'compare_arrows' },
    { id: ViewType.REEL_GENERATOR, label: 'Reel Generator', icon: 'movie_edit' },
    { id: 'assets', label: 'Assets', icon: 'folder_shared' },
    { id: 'settings', label: 'Team Settings', icon: 'settings' },
  ];

  return (
    <aside className="w-64 border-r border-[#f3ece7] dark:border-[#3a2a1d] bg-background-light dark:bg-background-dark p-4 flex flex-col justify-between hidden lg:flex">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col px-3 py-2">
          <h1 className="text-base font-medium">EPSILON AI</h1>
          <p className="text-[#9a6c4c] text-sm font-normal">Enterprise Brand Kit v2.0</p>
        </div>
        <div className="flex flex-col gap-2">
          {items.map(item => (
            <div 
              key={item.id}
              onClick={() => typeof item.id === 'string' ? null : onNavigate(item.id as ViewType)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors cursor-pointer ${currentView === item.id ? 'bg-primary/10 text-primary' : 'hover:bg-[#f3ece7] dark:hover:bg-[#3a2a1d] text-[#1b130d] dark:text-[#fcfaf8]'}`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <p className="text-sm font-semibold">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="p-4 bg-primary/5 rounded-xl border border-primary/20">
        <p className="text-xs font-bold text-primary uppercase tracking-wider mb-2">Pro Plan</p>
        <p className="text-xs text-[#9a6c4c] mb-3 leading-relaxed">AI Auto-fix enabled. 423 fixes this month.</p>
        <button className="w-full py-2 bg-primary/10 text-primary text-xs font-bold rounded-lg hover:bg-primary/20 transition-all uppercase tracking-widest">
          View Usage
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
