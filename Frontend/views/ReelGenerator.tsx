
import React, { useState, useEffect, useRef } from 'react';
import { epsilonApi } from '../services/api';
import { GoogleGenAI } from '@google/genai';

interface ReelGeneratorProps {
  onNotify: (msg: string, type?: 'success' | 'info') => void;
}

const ReelGenerator: React.FC<ReelGeneratorProps> = ({ onNotify }) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
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

  const generateReel = async () => {
    if (!prompt.trim()) return onNotify('Awaiting prompt', 'info');

    try {
      // Check for API key availability through aistudio if available
      if ((window as any).aistudio?.hasSelectedApiKey) {
        const hasKey = await (window as any).aistudio.hasSelectedApiKey();
        if (!hasKey) {
          onNotify('Connect API Key', 'info');
          await (window as any).aistudio.openSelectKey();
        }
      }

      setIsGenerating(true);
      setLoadingStep('COMPOSING...');
      
      // First enhance the prompt through our backend
      const enhanceResult = await epsilonApi.enhanceReelPrompt(prompt);
      const optimizedPrompt = enhanceResult.success && enhanceResult.data 
        ? enhanceResult.data.enhanced 
        : prompt;

      setLoadingStep('INITIALIZING...');
      
      // Use Gemini for video generation (requires client-side for video API)
      const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || '' });
      
      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: optimizedPrompt,
        config: { 
          numberOfVideos: 1, 
          resolution: '720p', 
          aspectRatio: '9:16' 
        }
      });

      while (!operation.done) {
        setLoadingStep('RENDERING...');
        await new Promise(resolve => setTimeout(resolve, 8000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }

      const downloadLink = (operation as any).response?.generatedVideos?.[0]?.video?.uri;
      if (downloadLink) {
        setLoadingStep('FETCHING...');
        const response = await fetch(`${downloadLink}&key=${import.meta.env.VITE_GEMINI_API_KEY}`);
        if (!response.ok) throw new Error('Download failed');
        const blob = await response.blob();
        setGeneratedVideoUrl(URL.createObjectURL(blob));
        onNotify('HARMONY ACHIEVED', 'success');
      }

    } catch (err: any) {
      console.error(err);
      if (err.message?.includes("Requested entity was not found")) {
        onNotify('RECONNECT API KEY', 'info');
        if ((window as any).aistudio?.openSelectKey) {
          await (window as any).aistudio.openSelectKey();
        }
      } else {
        onNotify('PROCESS DRIFT', 'info');
      }
    } finally {
      setIsGenerating(false);
      setLoadingStep('');
    }
  };

  const handlePublish = () => {
    setIsPublishing(true);
    setTimeout(() => {
      onNotify('CONTENT DEPLOYED', 'success');
      setIsPublishing(false);
      setGeneratedVideoUrl(null);
      setPrompt('');
    }, 1500);
  };

  return (
    <div ref={containerRef} className="scene max-w-7xl mx-auto">
      <div className="mb-24 reveal-init">
        <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-primary/40 mb-6 block">Motion Narrative</span>
        <h1 className="editorial-title text-[7vw] opacity-90 leading-none">GENERATOR</h1>
      </div>

      <div className="bg-neutral-black text-white p-16 sm:p-24 rounded-[2.5rem] relative overflow-hidden mb-32 shadow-2xl transition-all duration-[1s] reveal-init reveal-delay-1">
        <div className="absolute top-0 right-0 size-80 bg-primary/5 blur-[120px] animate-pulse-slow"></div>

        {isGenerating && (
          <div className="absolute inset-0 z-50 bg-neutral-black/95 backdrop-blur-xl flex flex-col items-center justify-center text-center p-16 animate-fade-in-slow">
            <h3 className="editorial-title text-[7vw] mb-6 animate-pulse text-primary/80">{loadingStep}</h3>
            <p className="font-display text-xl uppercase tracking-[0.2em] text-white/20">The creative process is organic.</p>
            <div className="mt-12 w-48 h-[1px] bg-white/5 relative overflow-hidden">
                <div className="absolute inset-0 bg-primary/40 animate-[reveal_2s_ease-in-out_infinite]"></div>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-16 max-w-4xl mx-auto">
          <label className="text-[9px] font-bold uppercase tracking-[0.4em] text-primary/40">Cinematic Brief</label>
          <textarea 
            className="w-full bg-transparent border-none text-4xl sm:text-5xl editorial-title p-0 focus:ring-0 placeholder:text-white/5 resize-none min-h-[300px] transition-all duration-[0.8s] hover:placeholder:text-white/10"
            placeholder="DEFINE NARRATIVE..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          
          <div className="flex flex-col md:flex-row justify-between items-center gap-16 pt-16 border-t border-white/5">
            <div className="flex gap-12 font-display text-lg uppercase tracking-[0.2em] opacity-30">
              <span className="text-primary opacity-100">9:16 VERTICAL</span>
              <span className="hover:opacity-100 cursor-pointer transition-opacity duration-[0.8s]">1:1 SQUARE</span>
              <span className="hover:opacity-100 cursor-pointer transition-opacity duration-[0.8s]">16:9 CINEMA</span>
            </div>
            <button 
              onClick={generateReel}
              disabled={isGenerating}
              className="px-12 py-6 bg-primary/10 border border-primary/20 text-primary font-display text-2xl uppercase tracking-[0.3em] hover:bg-primary hover:text-white transition-all duration-[1s] active:scale-95 shadow-xl disabled:opacity-50"
            >
              IGNITE
            </button>
          </div>
        </div>
      </div>

      {generatedVideoUrl && (
        <div className="flex flex-col items-center gap-16 mb-32 reveal-init">
          <h2 className="editorial-title text-6xl opacity-40">OUTPUT</h2>
          <div className="max-w-xs w-full aspect-[9/16] bg-neutral-black rounded-[3rem] border border-white/5 overflow-hidden shadow-2xl scale-105 transition-transform duration-[1.5s] hover:scale-100">
            <video src={generatedVideoUrl} autoPlay loop controls className="w-full h-full object-cover" />
          </div>
          <div className="flex gap-6 mt-8">
             <button 
              onClick={handlePublish}
              disabled={isPublishing}
              className="px-10 py-5 bg-neutral-black text-white font-display text-lg uppercase tracking-[0.2em] hover:bg-primary transition-all duration-[0.8s] disabled:opacity-50"
             >
               {isPublishing ? 'PUBLISHING...' : 'Publish'}
             </button>
             <button onClick={() => {
               URL.revokeObjectURL(generatedVideoUrl);
               setGeneratedVideoUrl(null);
             }} className="px-10 py-5 border border-black/5 font-display text-lg uppercase tracking-[0.2em] hover:bg-black/5 transition-all duration-[0.8s]">Discard</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 opacity-20 hover:opacity-100 transition-opacity duration-[2s] reveal-init reveal-delay-2">
        {[1,2,3,4].map((v) => (
          <div key={v} className="aspect-[9/16] bg-black/20 rounded-[1.5rem] border border-black/[0.02] grayscale overflow-hidden group hover:grayscale-0 transition-all duration-[1s] cursor-pointer">
            <img src={`https://picsum.photos/400/711?random=${v+20}`} className="w-full h-full object-cover opacity-30 group-hover:opacity-100 transition-opacity duration-[1s]" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReelGenerator;
