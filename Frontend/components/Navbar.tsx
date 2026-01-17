
import React from 'react';
import { ViewType } from '../types';

interface NavbarProps {
  currentView: ViewType;
  onNavigate: (view: ViewType) => void;
  toggleDarkMode: () => void;
  isDarkMode: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate, toggleDarkMode, isDarkMode }) => {
  return (
    <header className="flex items-center justify-between border-b border-[#f3ece7] dark:border-[#3d2e24] px-10 py-4 bg-white dark:bg-[#1b130d] sticky top-0 z-50">
      <div className="flex items-center gap-12">
        <div 
          className="flex items-center gap-3 text-primary cursor-pointer" 
          onClick={() => onNavigate(ViewType.WORKFLOW_SELECTOR)}
        >
          <div className="size-7">
            <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path d="M36.7273 44C33.9891 44 31.6043 39.8386 30.3636 33.69C29.123 39.8386 26.7382 44 24 44C21.2618 44 18.877 39.8386 17.6364 33.69C16.3957 39.8386 14.0109 44 11.2727 44C7.25611 44 4 35.0457 4 24C4 12.9543 7.25611 4 11.2727 4C14.0109 4 16.3957 8.16144 17.6364 14.31C18.877 8.16144 21.2618 4 24 4C26.7382 4 29.123 8.16144 30.3636 14.31C31.6043 8.16144 33.9891 4 36.7273 4C40.7439 4 44 12.9543 44 24C44 35.0457 40.7439 44 36.7273 44Z" fill="currentColor"></path>
            </svg>
          </div>
          <h2 className="text-[#1b130d] dark:text-white text-xl font-black leading-tight tracking-[-0.02em]">EPSILON</h2>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          <button 
            className={`text-sm font-semibold transition-colors ${currentView === ViewType.DASHBOARD ? 'text-primary' : 'text-[#1b130d] dark:text-white hover:text-primary'}`}
            onClick={() => onNavigate(ViewType.DASHBOARD)}
          >
            Dashboard
          </button>
          <button 
            className={`text-sm font-semibold transition-colors ${currentView === ViewType.COMPARISON ? 'text-primary' : 'text-[#1b130d] dark:text-white hover:text-primary'}`}
            onClick={() => onNavigate(ViewType.COMPARISON)}
          >
            Compare
          </button>
          <button 
            className={`text-sm font-semibold transition-colors ${currentView === ViewType.REEL_GENERATOR ? 'text-primary' : 'text-[#1b130d] dark:text-white hover:text-primary'}`}
            onClick={() => onNavigate(ViewType.REEL_GENERATOR)}
          >
            Reels
          </button>
        </nav>
      </div>
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3 border-r border-[#f3ece7] dark:border-[#3d2e24] pr-6">
          <button onClick={toggleDarkMode} className="text-[#1b130d] dark:text-white hover:text-primary transition-colors">
            <span className="material-symbols-outlined">{isDarkMode ? 'light_mode' : 'dark_mode'}</span>
          </button>
          <button className="text-[#1b130d] dark:text-white hover:text-primary transition-colors relative">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-0 right-0 size-2 bg-primary rounded-full border-2 border-white dark:border-[#1b130d]"></span>
          </button>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="text-sm font-bold text-[#1b130d] dark:text-white">Alex Rivera</span>
            <span className="text-[10px] font-bold text-[#9a6c4c] uppercase tracking-widest">Enterprise Plan</span>
          </div>
          <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 ring-2 ring-primary/10 border-2 border-white dark:border-[#1b130d]" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDrrNsglKmHKc73mgWZBlnehIZMNod-xCuA3NGjkDezoYbnTCLRKwt7Phr_F1Sivn5eSzCsiUmzpOQ-9bbReCQa0V3b5G-YMM1XkvEB18c0dC2UZ36xc7j2N-YW3IUEmlfibgz1NE8PqwqQPqTlkABuhNsdFMJ1rSW6AM2qWUUy12UXAU5JsjJciwmq0tK2S7TeO2F4kvRd9xDgKe3_7bouElcBTaHMt6rn9KrhyrbK3rcpzO6YjPwe417p1CeXoAZqQwLxMd1lrJw")'}}></div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
