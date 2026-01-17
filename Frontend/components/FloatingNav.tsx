import React from "react";
import { ViewType } from "../types";
import { useAuth } from "../context/AuthContext";

interface FloatingNavProps {
  currentView: ViewType;
  onMenuClick: () => void;
  onNavigate: (view: ViewType) => void;
}

const FloatingNav: React.FC<FloatingNavProps> = ({
  currentView,
  onMenuClick,
  onNavigate,
}) => {
  const { logout } = useAuth();

  return (
    <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[90] w-full max-w-lg px-8">
      <div className="floating-nav rounded-[1.5rem] h-16 px-6 flex items-center justify-between border border-white/[0.05] shadow-2xl transition-all duration-[0.8s] hover:scale-105">
        <button
          onClick={onMenuClick}
          className="group flex items-center gap-3 text-white/40 hover:text-primary transition-all duration-[0.8s]"
        >
          <div className="flex flex-col gap-1 w-4">
            <div className="h-[1px] w-full bg-current"></div>
            <div className="h-[1px] w-full bg-current opacity-30 group-hover:opacity-100 transition-opacity duration-[0.8s]"></div>
          </div>
          <span className="font-display text-lg uppercase tracking-[0.2em] hidden sm:inline opacity-70 group-hover:opacity-100 transition-opacity duration-[0.8s]">
            Menu
          </span>
        </button>

        <div
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => onNavigate(ViewType.WORKFLOW_SELECTOR)}
        >
          <div className="size-1 bg-primary rounded-full group-hover:scale-[2] transition-all duration-[0.8s]"></div>
          <span className="font-display text-xl text-white tracking-[0.2em] uppercase opacity-80 group-hover:opacity-100 transition-all duration-[0.8s]">
            EPSILON
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate(ViewType.BRAND_COMPLIANCE)}
            className="bg-primary/5 border border-primary/20 text-primary/80 px-4 py-2 rounded-lg font-display text-sm uppercase tracking-[0.15em] hover:bg-primary hover:text-white transition-all duration-[0.8s] active:scale-90"
          >
            Audit
          </button>
          <button
            onClick={logout}
            className="text-white/30 hover:text-red-500 transition-colors duration-300"
            title="Sign Out"
          >
            <span className="material-symbols-outlined text-xl">logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default FloatingNav;
