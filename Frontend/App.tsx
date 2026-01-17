import React, { useState, useEffect } from "react";
import { ViewType } from "./types";
import ComparisonView from "./views/ComparisonView";
import WorkflowSelector from "./views/WorkflowSelector";
import BrandComplianceView from "./views/BrandComplianceView";
import FloatingNav from "./components/FloatingNav";
import MenuOverlay from "./components/MenuOverlay";
import HeroScene from "./views/HeroScene";
import AnalyticsDashboard from "./components/AnalyticsDashboard";
import LoginView from "./views/LoginView";
import { AuthProvider, useAuth } from "./context/AuthContext";

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [currentView, setCurrentView] = useState<ViewType>(
    ViewType.WORKFLOW_SELECTOR,
  );
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "info";
  } | null>(null);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(timer);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [notification, currentView]);

  const showNotification = (
    message: string,
    type: "success" | "info" = "success",
  ) => {
    setNotification({ message, type });
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-black flex items-center justify-center">
        <div className="text-center">
          <div className="size-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-white/40 uppercase tracking-widest">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login if not authenticated
  if (!isAuthenticated) {
    return <LoginView />;
  }

  const renderView = () => {
    switch (currentView) {
      case ViewType.WORKFLOW_SELECTOR:
        return (
          <>
            <HeroScene
              onNext={() => {
                const el = document.getElementById("workflow-scene");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
            />
            <div id="workflow-scene">
              <WorkflowSelector onSelect={setCurrentView} />
            </div>
            <AnalyticsDashboard />
          </>
        );
      case ViewType.COMPARISON:
        return <ComparisonView onNotify={showNotification} />;
      case ViewType.BRAND_COMPLIANCE:
        return <BrandComplianceView onNotify={showNotification} />;
      default:
        return <WorkflowSelector onSelect={setCurrentView} />;
    }
  };

  return (
    <div className="relative min-h-screen bg-base">
      <main className="pb-32">{renderView()}</main>

      {/* Floating Bottom Navigation */}
      <FloatingNav
        currentView={currentView}
        onMenuClick={() => setIsMenuOpen(true)}
        onNavigate={setCurrentView}
      />

      {/* Fullscreen Menu Overlay */}
      {isMenuOpen && (
        <MenuOverlay
          currentView={currentView}
          onClose={() => setIsMenuOpen(false)}
          onNavigate={(view) => {
            setCurrentView(view);
            setIsMenuOpen(false);
          }}
        />
      )}

      {/* Editorial Notifications */}
      {notification && (
        <div className="fixed top-10 right-10 z-[100] animate-reveal-slow">
          <div className="bg-primary px-8 py-5 text-white flex items-center gap-4 shadow-2xl">
            <span className="material-symbols-outlined">bolt</span>
            <span className="font-display text-2xl uppercase tracking-widest">
              {notification.message}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
