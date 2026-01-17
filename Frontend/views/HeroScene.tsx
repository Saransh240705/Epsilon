
import React, { useEffect, useState } from 'react';

interface HeroSceneProps {
  onNext: () => void;
}

const HeroScene: React.FC<HeroSceneProps> = ({ onNext }) => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section className="scene relative overflow-hidden bg-neutral-black text-base justify-center">
      {/* Parallax background elements */}
      <div 
        className="absolute top-1/4 -left-20 size-[600px] rounded-full bg-primary/5 blur-[120px] animate-pulse-slow pointer-events-none"
        style={{ transform: `translateY(${scrollY * 0.2}px)` }}
      ></div>
      <div 
        className="absolute -bottom-20 -right-20 size-[400px] rounded-full bg-white/5 blur-[100px] animate-pulse-slow [animation-delay:1s] pointer-events-none"
        style={{ transform: `translateY(${scrollY * -0.15}px)` }}
      ></div>

      <div className="absolute top-0 right-0 p-20 opacity-5 pointer-events-none">
        <div 
          className="size-96 rounded-full border border-primary/40 animate-drift"
          style={{ transform: `scale(${1 + scrollY * 0.0005}) rotate(${scrollY * 0.05}deg)` }}
        ></div>
      </div>
      
      <div className="z-10 flex flex-col items-start gap-12 max-w-7xl mx-auto w-full">
        <div 
          className="flex flex-col select-none"
          style={{ transform: `translateY(${scrollY * 0.1}px)`, opacity: 1 - scrollY * 0.002 }}
        >
          <div className="overflow-hidden title-mask">
            <h1 className="editorial-title text-[12vw] sm:text-[10vw] text-primary tracking-tighter opacity-0 animate-text-slide-up [animation-delay:200ms]">
              EPSILON
            </h1>
          </div>
          <div className="overflow-hidden title-mask -mt-[0.3em]">
            <h1 className="editorial-title text-[12vw] sm:text-[10vw] dark-outline-text tracking-tighter opacity-0 animate-text-slide-up [animation-delay:400ms]">
              INTELLIGENCE
            </h1>
          </div>
        </div>
        
        <div 
          className="flex flex-col md:flex-row gap-20 md:items-end justify-between w-full"
          style={{ transform: `translateY(${scrollY * 0.05}px)`, opacity: (1 - scrollY * 0.002) }}
        >
          <div className="max-w-md opacity-0 animate-text-blur-in [animation-delay:800ms]">
            <p className="text-lg sm:text-xl font-light uppercase tracking-tight leading-[1.6] text-white/50">
              <span className="inline-block hover:text-white transition-colors duration-500">Designing</span> a 
              <span className="text-white/80 font-normal mx-2 group relative cursor-help">
                smooth, interactive
                <span className="absolute -bottom-1 left-0 w-full h-[1px] bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></span>
              </span> 
              interface for brand compliance and cinematic engineering.
            </p>
          </div>
          
          <button 
            onClick={onNext}
            className="group flex items-center gap-6 text-white/40 hover:text-primary transition-all duration-[0.6s] opacity-0 animate-fade-in-slow [animation-delay:1200ms]"
          >
            <div className="flex flex-col items-start overflow-hidden h-8">
              <span className="font-display text-lg sm:text-xl uppercase tracking-[0.2em] group-hover:-translate-y-full transition-transform duration-500">Start Integration</span>
              <span className="font-display text-lg sm:text-xl uppercase tracking-[0.2em] text-primary translate-y-0 group-hover:-translate-y-full transition-transform duration-500">Initiate Nexus</span>
            </div>
            <div className="size-14 sm:size-16 rounded-full border border-white/10 flex items-center justify-center overflow-hidden group-hover:border-primary/40 group-hover:bg-primary/5 transition-all duration-[0.6s]">
              <span className="material-symbols-outlined text-3xl font-light group-hover:translate-y-1 transition-transform duration-[0.8s]">arrow_downward</span>
            </div>
          </button>
        </div>
      </div>

      <div className="absolute bottom-12 left-12 flex gap-12 text-[9px] font-medium uppercase tracking-[0.4em] text-white/10 opacity-0 animate-fade-in-slow [animation-delay:1.5s]">
        <div className="overflow-hidden flex gap-2 items-center">
            <span className="animate-reveal-slow [animation-delay:1.6s]">AUDIT-PROTOCOL // V2.5.0</span>
        </div>
        <div className="flex items-center gap-3">
            <div className="size-1 bg-primary rounded-full animate-pulse"></div>
            <span className="animate-reveal-slow [animation-delay:1.8s]">NODE_ACTIVE</span>
        </div>
      </div>
    </section>
  );
};

export default HeroScene;
