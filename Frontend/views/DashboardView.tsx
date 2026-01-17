
import React, { useState, useEffect, useRef } from 'react';
import { ViewType } from '../types';
import { epsilonApi } from '../services/api';

interface DashboardViewProps {
  onNavigate: (view: ViewType) => void;
  onNotify: (msg: string, type?: 'success' | 'info') => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate, onNotify }) => {
  const [score, setScore] = useState(84);
  const [isScanning, setIsScanning] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [violations, setViolations] = useState(12);
  const [brandDna, setBrandDna] = useState('Minimalist, aggressive red palette, bold typography.');
  const [auditReport, setAuditReport] = useState<string[]>(['TYPOGRAPHY', 'COLORSPACE', 'SYMBOLICS', 'UX DESIGN']);
  const [detailedReport, setDetailedReport] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-visible');
        }
      });
    }, { threshold: 0.1 });

    const elements = containerRef.current?.querySelectorAll('.reveal-init');
    elements?.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const handleAudit = async () => {
    if (!brandDna.trim()) {
      onNotify('DNA REQUIRED', 'info');
      return;
    }

    setIsScanning(true);
    setDetailedReport(null);
    onNotify('CALIBRATING DNA', 'info');

    try {
      const result = await epsilonApi.performBrandAudit(brandDna);

      if (result.success && result.data) {
        setScore(result.data.score);
        setAuditReport(result.data.drifts);
        setViolations(result.data.violations);
        onNotify('HARMONY RESTORED', 'success');
      } else {
        throw new Error(result.error?.message || 'Audit failed');
      }
    } catch (err) {
      console.error(err);
      onNotify('SYSTEM DRIFT', 'info');
    } finally {
      setIsScanning(false);
    }
  };

  const handleAnalyzeDrifts = async () => {
    setIsAnalyzing(true);
    onNotify('DEEP ANALYSIS...', 'info');
    try {
      const result = await epsilonApi.analyzeDrifts(brandDna, auditReport);

      if (result.success && result.data) {
        setDetailedReport(result.data.analysis);
        onNotify('ANALYSIS COMPLETE', 'success');
      } else {
        throw new Error(result.error?.message || 'Analysis failed');
      }
    } catch (err) {
      onNotify('ANALYSIS FAILED', 'info');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div ref={containerRef} className="scene max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 mb-24 border-b border-black/[0.04] pb-16 reveal-init">
        <div className="flex flex-col flex-1 w-full max-w-2xl">
          <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-primary/40 mb-4">Real-time Stability</span>
          <h1 className="editorial-title text-[7vw] tracking-tight leading-none opacity-90 mb-8">SYSTEM INTEGRITY</h1>
          <textarea 
            value={brandDna}
            onChange={(e) => setBrandDna(e.target.value)}
            className="w-full bg-black/5 border-none p-6 font-display text-xl uppercase tracking-wider focus:ring-1 focus:ring-primary/20 rounded-xl placeholder:text-black/10 transition-all duration-500 resize-none"
            placeholder="Input Brand DNA..."
            rows={2}
          />
        </div>
        <div className="flex gap-6">
          <button 
            onClick={handleAudit}
            disabled={isScanning}
            className="px-10 py-5 bg-neutral-black text-white font-display text-lg uppercase tracking-[0.2em] hover:bg-primary transition-all duration-[0.8s] active:scale-95 shadow-xl shadow-black/10 disabled:opacity-50"
          >
            {isScanning ? 'AUDITING...' : 'RE-SYNC'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch mb-24">
        <div className="lg:col-span-8 bg-white p-12 rounded-[2rem] border border-black/[0.02] relative overflow-hidden group shadow-[0_10px_30px_rgba(0,0,0,0.02)] hover:shadow-xl transition-all duration-[1s] reveal-init reveal-delay-1">
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-16">
            <div className="flex flex-col text-center md:text-left">
               <h2 className="editorial-title text-[9vw] text-primary/80 leading-none group-hover:text-primary transition-colors duration-[0.8s]">{score}%</h2>
               <p className="font-display text-xl uppercase tracking-[0.2em] mt-2 opacity-20">Balanced</p>
            </div>
            <div className="flex-1 w-full">
               <div className="h-[1.5px] w-full bg-base overflow-hidden">
                 <div className="h-full bg-primary transition-all duration-[2s] ease-in-out" style={{ width: `${score}%` }}></div>
               </div>
               <div className="flex justify-between mt-6 text-[9px] font-bold uppercase tracking-[0.3em] text-black/15">
                 <span>ZERO</span>
                 <span className="text-primary/40 italic">TARGET 95.0+</span>
               </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 p-12 text-neutral-black opacity-[0.01] pointer-events-none group-hover:opacity-[0.03] transition-opacity duration-[1s]">
            <span className="material-symbols-outlined text-[12vw]">verified</span>
          </div>
        </div>

        <div className="lg:col-span-4 bg-primary text-white p-12 rounded-[2rem] flex flex-col justify-between shadow-xl hover:scale-[1.01] transition-all duration-[0.8s] reveal-init reveal-delay-2">
          <span className="material-symbols-outlined text-4xl mb-12 font-light opacity-50">bubble_chart</span>
          <div>
            <h3 className="editorial-title text-7xl leading-none">{violations}</h3>
            <p className="font-display text-lg uppercase tracking-[0.2em] opacity-40">Active Drifts</p>
          </div>
          <button 
            onClick={handleAnalyzeDrifts}
            disabled={isAnalyzing}
            className="mt-16 bg-white/5 hover:bg-white hover:text-primary border border-white/10 py-4 rounded-full font-display text-base uppercase tracking-[0.2em] transition-all duration-[0.8s] disabled:opacity-50"
          >
            {isAnalyzing ? 'Deep Analysis...' : 'Analyze Drifts'}
          </button>
        </div>
      </div>

      {detailedReport && (
        <div className="mb-24 bg-white p-12 rounded-[2rem] border-l-4 border-primary shadow-lg animate-reveal-slow reveal-init reveal-visible">
          <h3 className="font-display text-xl uppercase tracking-widest text-primary mb-6">Actionable Insights</h3>
          <p className="text-xl font-light leading-relaxed text-black/70 italic">"{detailedReport}"</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {auditReport.map((cat, i) => (
          <div key={i} className={`bg-white p-10 border border-black/[0.01] rounded-[1.5rem] hover:border-primary/10 group transition-all duration-[0.8s] shadow-sm hover:shadow-lg reveal-init reveal-delay-${(i % 4) + 1}`}>
            <div className="flex justify-between items-start mb-16">
              <span className="font-display text-2xl text-black/5 group-hover:text-primary transition-all duration-[0.8s]">0{i+1}</span>
              <div className="size-1.5 rounded-full bg-primary/10 group-hover:bg-primary transition-all duration-[0.8s] group-hover:scale-125"></div>
            </div>
            <h4 className="editorial-title text-4xl mb-4 opacity-70 group-hover:opacity-100 transition-opacity duration-[0.8s]">{cat}</h4>
            <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-black/10 group-hover:text-black/30 leading-relaxed transition-all duration-[0.8s]">V2.5.0-STABLE</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardView;
