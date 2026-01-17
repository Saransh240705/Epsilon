import React, { useState, useEffect, useRef, useCallback } from "react";
import { epsilonApi } from "../services/api";

interface BrandComplianceProps {
  onNotify: (msg: string, type?: "success" | "info") => void;
}

interface CategoryAnalysis {
  score: number;
  status: "compliant" | "warning" | "violation";
  findings: string;
  issues: Array<{
    element: string;
    expected: string;
    actual: string;
    severity: "critical" | "warning" | "info";
    suggestion: string;
  }>;
}

interface AnalysisResult {
  overallScore: number;
  categories: {
    color: CategoryAnalysis;
    typography: CategoryAnalysis;
    logo: CategoryAnalysis;
    tone: CategoryAnalysis;
    accessibility: CategoryAnalysis;
  };
  summary: string;
  criticalIssues: number;
  warnings: number;
  recommendations: string[];
}

const BrandComplianceView: React.FC<BrandComplianceProps> = ({ onNotify }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [designFile, setDesignFile] = useState<File | null>(null);
  const [brandKitFile, setBrandKitFile] = useState<File | null>(null);
  const [designPreview, setDesignPreview] = useState<string | null>(null);
  const [brandKitPreview, setBrandKitPreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null,
  );
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<"design" | "brandkit" | null>(null);

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
  }, [analysisResult]);

  const handleDesignUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setDesignFile(file);
        setAnalysisResult(null);

        // Create preview
        if (file.type.startsWith("image/")) {
          const reader = new FileReader();
          reader.onload = () => setDesignPreview(reader.result as string);
          reader.readAsDataURL(file);
        } else {
          setDesignPreview(null);
        }
        onNotify("DESIGN LOADED", "success");
      }
    },
    [onNotify],
  );

  const handleBrandKitUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setBrandKitFile(file);
        setAnalysisResult(null);

        // Create preview for images
        if (file.type.startsWith("image/")) {
          const reader = new FileReader();
          reader.onload = () => setBrandKitPreview(reader.result as string);
          reader.readAsDataURL(file);
        } else {
          setBrandKitPreview(null);
        }
        onNotify("BRAND KIT LOADED", "success");
      }
    },
    [onNotify],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent, type: "design" | "brandkit") => {
      e.preventDefault();
      setDragOver(null);

      const file = e.dataTransfer.files?.[0];
      if (file) {
        if (type === "design") {
          setDesignFile(file);
          setAnalysisResult(null);
          if (file.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onload = () => setDesignPreview(reader.result as string);
            reader.readAsDataURL(file);
          } else {
            setDesignPreview(null);
          }
          onNotify("DESIGN LOADED", "success");
        } else {
          setBrandKitFile(file);
          setAnalysisResult(null);
          if (file.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onload = () => setBrandKitPreview(reader.result as string);
            reader.readAsDataURL(file);
          } else {
            setBrandKitPreview(null);
          }
          onNotify("BRAND KIT LOADED", "success");
        }
      }
    },
    [onNotify],
  );

  const handleAnalyze = async () => {
    if (!designFile || !brandKitFile) {
      onNotify("UPLOAD BOTH FILES", "info");
      return;
    }

    setIsAnalyzing(true);
    setLoadingStep("INITIALIZING...");
    setAnalysisResult(null);

    try {
      setLoadingStep("SCANNING DESIGN...");
      await new Promise((r) => setTimeout(r, 500));

      setLoadingStep("PARSING BRAND KIT...");
      await new Promise((r) => setTimeout(r, 500));

      setLoadingStep("ANALYZING COMPLIANCE...");

      const result = await epsilonApi.analyzeBrandCompliance(
        designFile,
        brandKitFile,
      );

      if (result.success && result.data) {
        setAnalysisResult(result.data.analysis);
        onNotify("ANALYSIS COMPLETE", "success");
      } else {
        throw new Error(result.error?.message || "Analysis failed");
      }
    } catch (err: any) {
      console.error(err);
      const errorMsg = err.message || "";

      // Check for rate limit errors
      if (
        errorMsg.includes("429") ||
        errorMsg.includes("rate") ||
        errorMsg.includes("quota")
      ) {
        onNotify("API RATE LIMITED - WAIT 2 MIN", "info");
      } else if (errorMsg.includes("file too large")) {
        onNotify("FILE TOO LARGE - MAX 4MB", "info");
      } else {
        onNotify("ANALYSIS FAILED", "info");
      }
    } finally {
      setIsAnalyzing(false);
      setLoadingStep("");
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-amber-500";
    if (score >= 40) return "text-orange-500";
    return "text-red-500";
  };

  const getScoreStrokeColor = (score: number) => {
    if (score >= 80) return "#22c55e";
    if (score >= 60) return "#f59e0b";
    if (score >= 40) return "#f97316";
    return "#bb0027";
  };

  const getStatusBadge = (score: number) => {
    if (score >= 90)
      return { text: "EXCELLENT", bg: "bg-green-100 text-green-700" };
    if (score >= 75) return { text: "GOOD", bg: "bg-green-50 text-green-600" };
    if (score >= 60)
      return { text: "NEEDS WORK", bg: "bg-amber-100 text-amber-700" };
    if (score >= 40)
      return { text: "POOR", bg: "bg-orange-100 text-orange-700" };
    return { text: "CRITICAL", bg: "bg-red-100 text-red-700" };
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-500/10 text-red-600 border-red-500/20";
      case "warning":
        return "bg-amber-500/10 text-amber-600 border-amber-500/20";
      default:
        return "bg-blue-500/10 text-blue-600 border-blue-500/20";
    }
  };

  const categoryIcons: Record<string, string> = {
    color: "palette",
    typography: "text_fields",
    logo: "verified",
    tone: "record_voice_over",
    accessibility: "accessibility_new",
  };

  const categoryLabels: Record<string, string> = {
    color: "COLOR",
    typography: "TYPE",
    logo: "LOGO",
    tone: "TONE",
    accessibility: "A11Y",
  };

  // Circular progress component
  const CircularProgress = ({
    score,
    size = 220,
  }: {
    score: number;
    size?: number;
  }) => {
    const strokeWidth = 14;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (score / 100) * circumference;

    return (
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="transform -rotate-90" width={size} height={size}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#e5e5e5"
            strokeWidth={strokeWidth}
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={getScoreStrokeColor(score)}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="editorial-title text-6xl text-neutral-black">
            {score}
          </span>
          <span className="text-sm text-black/40">/ 100</span>
        </div>
      </div>
    );
  };

  return (
    <div ref={containerRef} className="scene max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-16 reveal-init">
        <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-primary/40 mb-6 block">
          Design Audit
        </span>
        <h1 className="editorial-title text-[7vw] opacity-90 leading-none">
          ANALYZE DESIGN
        </h1>
      </div>

      {/* Upload Section */}
      {!analysisResult && (
        <div className="space-y-8 reveal-init reveal-delay-1">
          {/* Brand Kit Upload */}
          <div className="bg-white p-8 rounded-[2rem] border border-black/[0.02] shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="size-10 bg-neutral-black/5 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-neutral-black/60">
                  menu_book
                </span>
              </div>
              <div>
                <h3 className="font-display text-lg uppercase tracking-widest">
                  Brand Kit
                </h3>
                <p className="text-[10px] uppercase tracking-[0.2em] text-black/30">
                  PDF or Image of guidelines
                </p>
              </div>
              {brandKitFile && (
                <span className="ml-auto px-3 py-1 bg-green-100 text-green-700 text-[10px] font-bold uppercase tracking-wider rounded-full">
                  Uploaded
                </span>
              )}
            </div>

            <label className="block cursor-pointer">
              <input
                type="file"
                accept="application/pdf,image/png,image/jpeg"
                onChange={handleBrandKitUpload}
                className="hidden"
              />
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver("brandkit");
                }}
                onDragLeave={() => setDragOver(null)}
                onDrop={(e) => handleDrop(e, "brandkit")}
                className={`aspect-[3/1] rounded-xl border-2 border-dashed transition-all duration-300 flex items-center justify-center gap-6 ${
                  dragOver === "brandkit"
                    ? "border-primary bg-primary/5"
                    : brandKitFile
                      ? "border-green-300 bg-green-50"
                      : "border-black/10 hover:border-primary/30"
                }`}
              >
                {brandKitPreview ? (
                  <img
                    src={brandKitPreview}
                    alt="Brand kit"
                    className="h-full max-h-24 object-contain"
                  />
                ) : brandKitFile ? (
                  <div className="flex items-center gap-4">
                    <span className="material-symbols-outlined text-3xl text-green-500">
                      check_circle
                    </span>
                    <div>
                      <p className="font-display text-lg uppercase tracking-wider">
                        {brandKitFile.name}
                      </p>
                      <p className="text-[10px] text-black/40">
                        {(brandKitFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-4 text-black/30">
                    <span className="material-symbols-outlined text-3xl">
                      upload_file
                    </span>
                    <div>
                      <p className="font-display text-base uppercase tracking-wider">
                        Drag & drop brand kit
                      </p>
                      <p className="text-[10px] uppercase tracking-[0.2em]">
                        PDF, PNG, JPG
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </label>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-black/5"></div>
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-black/20">
              Then upload design
            </span>
            <div className="flex-1 h-px bg-black/5"></div>
          </div>

          {/* Design Upload */}
          <div className="bg-white p-8 rounded-[2rem] border border-black/[0.02] shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="size-10 bg-primary/5 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-primary/60">
                  image
                </span>
              </div>
              <div>
                <h3 className="font-display text-lg uppercase tracking-widest">
                  Design File
                </h3>
                <p className="text-[10px] uppercase tracking-[0.2em] text-black/30">
                  PNG, JPG, SVG, PDF
                </p>
              </div>
              {designFile && (
                <span className="ml-auto px-3 py-1 bg-green-100 text-green-700 text-[10px] font-bold uppercase tracking-wider rounded-full">
                  Uploaded
                </span>
              )}
            </div>

            <label className="block cursor-pointer">
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml,application/pdf"
                onChange={handleDesignUpload}
                className="hidden"
              />
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver("design");
                }}
                onDragLeave={() => setDragOver(null)}
                onDrop={(e) => handleDrop(e, "design")}
                className={`aspect-[2/1] rounded-xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center overflow-hidden ${
                  dragOver === "design"
                    ? "border-primary bg-primary/5"
                    : designFile
                      ? "border-green-300 bg-green-50"
                      : "border-black/10 hover:border-primary/30"
                }`}
              >
                {designPreview ? (
                  <img
                    src={designPreview}
                    alt="Design preview"
                    className="max-h-48 object-contain"
                  />
                ) : designFile ? (
                  <div className="flex items-center gap-4">
                    <span className="material-symbols-outlined text-3xl text-green-500">
                      check_circle
                    </span>
                    <div>
                      <p className="font-display text-lg uppercase tracking-wider">
                        {designFile.name}
                      </p>
                      <p className="text-[10px] text-black/40">
                        {(designFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-8">
                    <div className="size-16 mx-auto mb-4 bg-primary/5 rounded-full flex items-center justify-center">
                      <span className="material-symbols-outlined text-3xl text-primary/30">
                        cloud_upload
                      </span>
                    </div>
                    <p className="font-display text-lg uppercase tracking-wider text-black/40 mb-2">
                      Drag & drop design file
                    </p>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-black/20">
                      PNG, JPG, SVG, PDF
                    </p>
                  </div>
                )}
              </div>
            </label>
          </div>

          {/* Analyze Button */}
          <button
            onClick={handleAnalyze}
            disabled={!designFile || !brandKitFile || isAnalyzing}
            className="w-full py-5 bg-primary text-white font-display text-xl uppercase tracking-[0.3em] rounded-xl hover:bg-primary-hover transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            <span className="material-symbols-outlined">bolt</span>
            {isAnalyzing ? loadingStep : "ANALYZE DESIGN"}
          </button>
        </div>
      )}

      {/* Loading Overlay */}
      {isAnalyzing && (
        <div className="fixed inset-0 z-50 bg-neutral-black/95 backdrop-blur-xl flex flex-col items-center justify-center">
          <div className="relative">
            <div className="size-32 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl text-primary animate-pulse">
                auto_awesome
              </span>
            </div>
          </div>
          <h3 className="editorial-title text-4xl text-white mt-8 animate-pulse">
            {loadingStep}
          </h3>
          <p className="text-white/40 mt-2 font-display uppercase tracking-widest">
            Powered by Gemini AI
          </p>
        </div>
      )}

      {/* Results Section */}
      {analysisResult && (
        <div className="space-y-12 animate-fade-in-slow">
          {/* Score Card */}
          <div className="bg-white p-12 rounded-[2rem] shadow-lg border border-black/[0.02]">
            {/* Header */}
            <div className="flex items-start justify-between mb-12">
              <div>
                <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-black/30">
                  Compliance Score
                </span>
              </div>
              <div
                className={`px-4 py-2 rounded-lg font-display text-sm uppercase tracking-widest ${getStatusBadge(analysisResult.overallScore).bg}`}
              >
                {getStatusBadge(analysisResult.overallScore).text}
              </div>
            </div>

            {/* Circular Score */}
            <div className="flex justify-center mb-12">
              <CircularProgress
                score={analysisResult.overallScore}
                size={220}
              />
            </div>

            {/* Category Scores */}
            <div className="grid grid-cols-5 gap-4 pt-8 border-t border-black/5">
              {(
                [
                  "color",
                  "typography",
                  "logo",
                  "accessibility",
                  "tone",
                ] as const
              ).map((key) => {
                const category = analysisResult.categories[key];
                const score = category?.score || 0;
                return (
                  <button
                    key={key}
                    onClick={() =>
                      setActiveCategory(activeCategory === key ? null : key)
                    }
                    className={`text-center p-4 rounded-xl transition-all duration-300 ${
                      activeCategory === key
                        ? "bg-primary/5 ring-2 ring-primary/20"
                        : "hover:bg-black/[0.02]"
                    }`}
                  >
                    <span
                      className={`editorial-title text-4xl block ${getScoreColor(score)}`}
                    >
                      {score}
                    </span>
                    <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-black/40">
                      {categoryLabels[key]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Summary */}
          <div className="bg-white p-8 rounded-[2rem] border border-black/[0.02]">
            <h3 className="font-display text-lg uppercase tracking-widest text-black/40 mb-4">
              Summary
            </h3>
            <p className="text-lg font-light leading-relaxed text-black/70">
              "{analysisResult.summary}"
            </p>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-red-50 p-6 rounded-xl text-center">
              <span className="editorial-title text-4xl text-red-500">
                {analysisResult.criticalIssues}
              </span>
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-red-500/60 mt-1">
                Critical Issues
              </p>
            </div>
            <div className="bg-amber-50 p-6 rounded-xl text-center">
              <span className="editorial-title text-4xl text-amber-500">
                {analysisResult.warnings}
              </span>
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-amber-500/60 mt-1">
                Warnings
              </p>
            </div>
            <div className="bg-green-50 p-6 rounded-xl text-center">
              <span className="editorial-title text-4xl text-green-500">
                {
                  Object.values(analysisResult.categories).filter(
                    (c: CategoryAnalysis) => c.status === "compliant",
                  ).length
                }
              </span>
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-green-500/60 mt-1">
                Compliant
              </p>
            </div>
          </div>

          {/* Category Details */}
          {activeCategory &&
            analysisResult.categories[
              activeCategory as keyof typeof analysisResult.categories
            ] && (
              <div className="bg-white p-8 rounded-[2rem] border-2 border-primary/10 animate-reveal-slow">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <span
                      className={`material-symbols-outlined text-2xl ${getScoreColor(analysisResult.categories[activeCategory as keyof typeof analysisResult.categories].score)}`}
                    >
                      {categoryIcons[activeCategory]}
                    </span>
                    <h3 className="font-display text-xl uppercase tracking-widest">
                      {categoryLabels[activeCategory]} Analysis
                    </h3>
                  </div>
                  <button
                    onClick={() => setActiveCategory(null)}
                    className="size-8 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center"
                  >
                    <span className="material-symbols-outlined text-lg">
                      close
                    </span>
                  </button>
                </div>

                <div className="p-4 bg-base rounded-xl mb-6">
                  <p className="text-base font-light text-black/70">
                    {
                      analysisResult.categories[
                        activeCategory as keyof typeof analysisResult.categories
                      ].findings
                    }
                  </p>
                </div>

                {analysisResult.categories[
                  activeCategory as keyof typeof analysisResult.categories
                ].issues.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/30">
                      Issues Found
                    </h4>
                    {analysisResult.categories[
                      activeCategory as keyof typeof analysisResult.categories
                    ].issues.map((issue, i) => (
                      <div key={i} className="p-4 bg-base rounded-xl">
                        <div className="flex items-start justify-between mb-2">
                          <span className="font-display uppercase tracking-wider">
                            {issue.element}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${getSeverityBadge(issue.severity)}`}
                          >
                            {issue.severity}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                          <div>
                            <span className="text-[9px] text-black/30 uppercase">
                              Expected:
                            </span>
                            <p className="text-black/60">{issue.expected}</p>
                          </div>
                          <div>
                            <span className="text-[9px] text-black/30 uppercase">
                              Found:
                            </span>
                            <p className="text-black/60">{issue.actual}</p>
                          </div>
                        </div>
                        <div className="pt-3 border-t border-black/5">
                          <span className="text-[9px] text-primary/60 uppercase">
                            Fix:
                          </span>
                          <p className="text-sm text-black/80">
                            {issue.suggestion}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          {/* Recommendations */}
          <div className="bg-neutral-black p-8 rounded-[2rem] text-white">
            <h3 className="font-display text-lg uppercase tracking-widest text-white/40 mb-6">
              Recommendations
            </h3>
            <div className="space-y-4">
              {analysisResult.recommendations.map((rec, i) => (
                <div key={i} className="flex gap-4 items-start group">
                  <span className="font-display text-2xl text-primary/50 group-hover:text-primary transition-colors">
                    0{i + 1}
                  </span>
                  <p className="text-base font-light text-white/70 group-hover:text-white transition-colors pt-1">
                    {rec}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* New Analysis Button */}
          <div className="flex justify-center">
            <button
              onClick={() => {
                setAnalysisResult(null);
                setDesignFile(null);
                setBrandKitFile(null);
                setDesignPreview(null);
                setBrandKitPreview(null);
                setActiveCategory(null);
              }}
              className="px-12 py-4 border border-black/10 font-display text-base uppercase tracking-[0.2em] hover:bg-black/5 rounded-xl transition-all"
            >
              New Analysis
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrandComplianceView;
