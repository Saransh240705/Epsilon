import React from "react";
import { ViewType } from "../types";
import { useAuth } from "../context/AuthContext";

interface MenuOverlayProps {
  currentView: ViewType;
  onClose: () => void;
  onNavigate: (view: ViewType) => void;
}

const MenuOverlay: React.FC<MenuOverlayProps> = ({
  currentView,
  onClose,
  onNavigate,
}) => {
  const { user, logout } = useAuth();

  const menuItems = [
    { id: ViewType.WORKFLOW_SELECTOR, label: "01 HOME" },
    { id: ViewType.BRAND_COMPLIANCE, label: "02 AUDIT" },
    { id: ViewType.COMPARISON, label: "03 SYMMETRY" },
  ];

  const handleLogout = () => {
    logout();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#0d0d0d] text-white p-12 flex flex-col justify-between animate-fade-in-slow backdrop-blur-3xl select-none">
      {/* Background Decorative Element - matching the reference aesthetic */}
      <div className="absolute inset-0 pointer-events-none opacity-5 overflow-hidden">
        <div className="absolute -bottom-20 -right-20 size-[800px] bg-primary blur-[160px] animate-pulse-slow"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 flex justify-between items-start animate-reveal-slow">
        <div className="flex flex-col gap-2">
          <span className="font-display text-2xl tracking-[0.3em] text-primary uppercase">
            EPSILON FLOW // 2.5
          </span>
          {user && (
            <span className="text-white/30 text-sm">
              {user.name} ({user.email})
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="size-16 border border-white/10 rounded-full flex items-center justify-center hover:bg-white/5 hover:border-white/20 transition-all duration-[0.6s] active:scale-90"
        >
          <span className="material-symbols-outlined text-3xl font-light">
            close
          </span>
        </button>
      </div>

      {/* Main Navigation */}
      <nav className="relative z-10 flex flex-col gap-4 max-w-4xl py-12">
        {menuItems.map((item, i) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`editorial-title text-[10vw] sm:text-[8vw] text-left transition-all duration-[0.8s] group hover:pl-8 flex items-center gap-6 opacity-0 animate-reveal-slow`}
            style={{ animationDelay: `${i * 100 + 200}ms` }}
          >
            <span
              className={`${currentView === item.id ? "text-primary" : "text-white/20 group-hover:text-white/40"}`}
            >
              {item.label}
            </span>
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="relative z-10 flex justify-between items-end border-t border-white/5 pt-12 animate-fade-in-slow [animation-delay:0.8s]">
        <div className="flex flex-col gap-3">
          <p className="text-white/10 text-[9px] font-bold uppercase tracking-[0.4em]">
            Account
          </p>
          <div className="flex gap-12 text-lg font-display uppercase tracking-[0.2em] text-white/20">
            <button
              onClick={handleLogout}
              className="hover:text-red-500 transition-colors duration-[0.6s] flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-xl">logout</span>
              Logout
            </button>
          </div>
        </div>
        <div className="text-right">
          <p className="text-white/5 text-[8px] font-mono tracking-[0.2em] uppercase">
            Architecture v2.5.0-Stable
          </p>
          <p className="text-white/10 text-[8px] font-mono tracking-[0.2em] mt-1">
            © 2025 EPSILON CORE.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MenuOverlay;
