import React, { useEffect, useRef, useState, useCallback } from "react";
import { epsilonApi } from "../services/api";

interface ComparisonViewProps {
  onNotify: (msg: string, type?: "success" | "info") => void;
}

interface ComparisonResult {
  similarityScore: number;
  similarities: Array<{
    aspect: string;
    description: string;
    strength: string;
  }>;
  differences: Array<{
    aspect: string;
    brand1: string;
    brand2: string;
    impact: string;
  }>;
  recommendations: Array<{
    forBrand: string;
    suggestion: string;
    priority: string;
  }>;
  summary: string;
}

const ComparisonView: React.FC<ComparisonViewProps> = ({ onNotify }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [brandKit1, setBrandKit1] = useState<File | null>(null);
  const [brandKit2, setBrandKit2] = useState<File | null>(null);
  const [preview1, setPreview1] = useState<string | null>(null);
  const [preview2, setPreview2] = useState<string | null>(null);
  const [isComparing, setIsComparing] = useState(false);
  const [result, setResult] = useState<ComparisonResult | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal-visible");
          }
        });
      },
      { threshold: 0.1 },
    );

    const elements = containerRef.current?.querySelectorAll(".reveal-init");
    elements?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const handleFileUpload = useCallback((file: File, slot: 1 | 2) => {
    if (slot === 1) {
      setBrandKit1(file);
      if (file.type.startsWith("image/")) {
        setPreview1(URL.createObjectURL(file));
      } else {
        setPreview1(null);
      }
    } else {
      setBrandKit2(file);
      if (file.type.startsWith("image/")) {
        setPreview2(URL.createObjectURL(file));
      } else {
        setPreview2(null);
      }
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, slot: 1 | 2) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) handleFileUpload(file, slot);
    },
    [handleFileUpload],
  );

  const handleCompare = async () => {
    if (!brandKit1 || !brandKit2) {
      onNotify("UPLOAD BOTH BRAND KITS", "info");
      return;
    }

    setIsComparing(true);
    setResult(null);

    try {
      const response = await epsilonApi.compareBrandKitFiles(
        brandKit1,
        brandKit2,
      );

      if (response.success && response.data?.comparison) {
        setResult(response.data.comparison);
        onNotify("COMPARISON COMPLETE", "success");
      } else {
        throw new Error(response.error?.message || "Comparison failed");
      }
    } catch (err: any) {
      console.error(err);
      if (err.message?.includes("rate") || err.message?.includes("429")) {
        onNotify("API RATE LIMITED", "info");
      } else {
        onNotify("COMPARISON FAILED", "info");
      }
    } finally {
      setIsComparing(false);
    }
  };

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case "strong":
        return "bg-green-100 text-green-700";
      case "moderate":
        return "bg-amber-100 text-amber-700";
      case "weak":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "high":
        return "border-red-400 bg-red-50";
      case "medium":
        return "border-amber-400 bg-amber-50";
      case "low":
        return "border-green-400 bg-green-50";
      default:
        return "border-gray-300 bg-gray-50";
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500 text-white";
      case "medium":
        return "bg-amber-500 text-white";
      case "low":
        return "bg-green-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  return (
    <div ref={containerRef} className="scene max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-16 flex flex-col md:flex-row justify-between items-end gap-8 reveal-init">
        <div className="flex-1 w-full">
          <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-primary/40 mb-4 block">
            Brand Comparison
          </span>
          <h1 className="editorial-title text-[7vw] tracking-tight leading-none opacity-90">
            SYMMETRY
          </h1>
        </div>
        <button
          onClick={handleCompare}
          disabled={isComparing || !brandKit1 || !brandKit2}
          className="px-12 py-5 bg-neutral-black text-white font-display text-xl uppercase tracking-widest hover:bg-primary transition-all duration-500 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {isComparing ? "ANALYZING..." : "COMPARE"}
        </button>
      </div>

      {/* Upload Zones */}
      <div className="flex flex-col lg:flex-row gap-8 mb-16 reveal-init reveal-delay-1">
        {/* Brand Kit 1 */}
        <div
          className="flex-1 bg-white p-8 rounded-[1.5rem] border-2 border-dashed border-black/10 hover:border-primary/30 transition-all min-h-[300px] flex flex-col"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => handleDrop(e, 1)}
        >
          <span className="text-primary font-bold text-[9px] uppercase tracking-[0.3em] mb-6 opacity-60">
            BRAND KIT 01
          </span>

          {brandKit1 ? (
            <div className="flex-1 flex flex-col items-center justify-center">
              {preview1 ? (
                <img
                  src={preview1}
                  alt="Brand Kit 1"
                  className="max-h-40 object-contain mb-4 rounded-lg"
                />
              ) : (
                <div className="size-20 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-4xl text-primary">
                    description
                  </span>
                </div>
              )}
              <p className="font-display text-xl text-center truncate max-w-full">
                {brandKit1.name}
              </p>
              <p className="text-sm text-black/40 mt-2">
                {(brandKit1.size / 1024).toFixed(1)} KB
              </p>
              <button
                onClick={() => {
                  setBrandKit1(null);
                  setPreview1(null);
                }}
                className="mt-4 text-xs text-red-500 hover:text-red-700 uppercase tracking-wider"
              >
                Remove
              </button>
            </div>
          ) : (
            <label className="flex-1 flex flex-col items-center justify-center cursor-pointer">
              <div className="size-20 bg-base rounded-xl flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-4xl text-black/20">
                  upload_file
                </span>
              </div>
              <p className="text-black/40 text-center">
                Drop brand kit or click to upload
              </p>
              <p className="text-xs text-black/20 mt-2">
                PDF, PNG, JPG (max 4MB)
              </p>
              <input
                type="file"
                className="hidden"
                accept=".pdf,.png,.jpg,.jpeg,.webp"
                onChange={(e) =>
                  e.target.files?.[0] && handleFileUpload(e.target.files[0], 1)
                }
              />
            </label>
          )}
        </div>

        {/* VS Divider */}
        <div className="hidden lg:flex items-center justify-center px-6">
          <div className="size-16 bg-primary text-white rounded-full flex items-center justify-center font-display text-xl">
            VS
          </div>
        </div>

        {/* Brand Kit 2 */}
        <div
          className="flex-1 bg-base p-8 rounded-[1.5rem] border-2 border-dashed border-black/10 hover:border-primary/30 transition-all min-h-[300px] flex flex-col"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => handleDrop(e, 2)}
        >
          <span className="text-black font-bold text-[9px] uppercase tracking-[0.3em] mb-6 opacity-40">
            BRAND KIT 02
          </span>

          {brandKit2 ? (
            <div className="flex-1 flex flex-col items-center justify-center">
              {preview2 ? (
                <img
                  src={preview2}
                  alt="Brand Kit 2"
                  className="max-h-40 object-contain mb-4 rounded-lg"
                />
              ) : (
                <div className="size-20 bg-black/10 rounded-xl flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-4xl text-black/40">
                    description
                  </span>
                </div>
              )}
              <p className="font-display text-xl text-center truncate max-w-full">
                {brandKit2.name}
              </p>
              <p className="text-sm text-black/40 mt-2">
                {(brandKit2.size / 1024).toFixed(1)} KB
              </p>
              <button
                onClick={() => {
                  setBrandKit2(null);
                  setPreview2(null);
                }}
                className="mt-4 text-xs text-red-500 hover:text-red-700 uppercase tracking-wider"
              >
                Remove
              </button>
            </div>
          ) : (
            <label className="flex-1 flex flex-col items-center justify-center cursor-pointer">
              <div className="size-20 bg-white rounded-xl flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-4xl text-black/20">
                  upload_file
                </span>
              </div>
              <p className="text-black/40 text-center">
                Drop brand kit or click to upload
              </p>
              <p className="text-xs text-black/20 mt-2">
                PDF, PNG, JPG (max 4MB)
              </p>
              <input
                type="file"
                className="hidden"
                accept=".pdf,.png,.jpg,.jpeg,.webp"
                onChange={(e) =>
                  e.target.files?.[0] && handleFileUpload(e.target.files[0], 2)
                }
              />
            </label>
          )}
        </div>
      </div>

      {/* Loading State */}
      {isComparing && (
        <div className="bg-white p-12 rounded-[2rem] mb-16 text-center animate-pulse">
          <div className="size-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="font-display text-2xl text-primary uppercase tracking-widest">
            Analyzing Brand Symmetry...
          </p>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-8 reveal-init animate-reveal-slow">
          {/* Similarity Score */}
          <div className="bg-white p-8 rounded-[2rem] text-center">
            <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-black/30 block mb-4">
              Overall Similarity
            </span>
            <div className="editorial-title text-[12vw] md:text-[8vw] text-primary leading-none">
              {result.similarityScore}%
            </div>
            <p className="text-lg text-black/50 mt-4 max-w-2xl mx-auto">
              {result.summary}
            </p>
          </div>

          {/* Similarities & Differences */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Similarities */}
            <div className="bg-green-50 p-8 rounded-[2rem]">
              <h3 className="font-display text-xl uppercase tracking-widest text-green-700 mb-6 flex items-center gap-3">
                <span className="material-symbols-outlined">check_circle</span>
                Similarities
              </h3>
              <div className="space-y-4">
                {result.similarities.map((item, i) => (
                  <div key={i} className="bg-white p-4 rounded-xl">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-sm uppercase tracking-wider text-black/70">
                        {item.aspect}
                      </span>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${getStrengthColor(item.strength)}`}
                      >
                        {item.strength}
                      </span>
                    </div>
                    <p className="text-sm text-black/60">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Differences */}
            <div className="bg-red-50 p-8 rounded-[2rem]">
              <h3 className="font-display text-xl uppercase tracking-widest text-red-700 mb-6 flex items-center gap-3">
                <span className="material-symbols-outlined">
                  compare_arrows
                </span>
                Differences
              </h3>
              <div className="space-y-4">
                {result.differences.map((item, i) => (
                  <div
                    key={i}
                    className={`p-4 rounded-xl border-l-4 ${getImpactColor(item.impact)}`}
                  >
                    <span className="font-bold text-sm uppercase tracking-wider text-black/70 block mb-2">
                      {item.aspect}
                    </span>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-xs text-black/40 block">
                          Brand 1
                        </span>
                        <span className="text-black/70">{item.brand1}</span>
                      </div>
                      <div>
                        <span className="text-xs text-black/40 block">
                          Brand 2
                        </span>
                        <span className="text-black/70">{item.brand2}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-white p-8 rounded-[2rem]">
            <h3 className="font-display text-xl uppercase tracking-widest text-primary mb-6 flex items-center gap-3">
              <span className="material-symbols-outlined">lightbulb</span>
              Recommendations
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {result.recommendations.map((rec, i) => (
                <div key={i} className="bg-base p-5 rounded-xl">
                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className={`text-xs px-2 py-1 rounded ${getPriorityBadge(rec.priority)}`}
                    >
                      {rec.priority}
                    </span>
                    <span className="text-xs text-black/40 uppercase">
                      {rec.forBrand === "both"
                        ? "Both Brands"
                        : `Brand ${rec.forBrand}`}
                    </span>
                  </div>
                  <p className="text-sm text-black/70">{rec.suggestion}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComparisonView;
