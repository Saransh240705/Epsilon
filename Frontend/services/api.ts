/**
 * Epsilon API Client
 * Use this in the frontend instead of direct Gemini calls
 */

// Production backend URL on Render
const API_BASE = "https://epsilon-1.onrender.com/api";
const BACKEND_URL = "https://epsilon-1.onrender.com/api";

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    message: string;
    code: string;
    details?: unknown;
  };
}

class EpsilonAPI {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
      });

      const data = await response.json();
      return data;
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : "Network error",
          code: "NETWORK_ERROR",
        },
      };
    }
  }

  // Health
  async checkHealth() {
    return this.request("/health");
  }

  // Brand Audit
  async performBrandAudit(brandDna: string) {
    return this.request<{
      score: number;
      drifts: string[];
      violations: number;
      timestamp: string;
    }>("/brand/audit", {
      method: "POST",
      body: JSON.stringify({ brandDna }),
    });
  }

  // Drift Analysis
  async analyzeDrifts(brandDna: string, drifts: string[]) {
    return this.request<{
      analysis: string;
      driftsAnalyzed: string[];
      timestamp: string;
    }>("/brand/analyze-drifts", {
      method: "POST",
      body: JSON.stringify({ brandDna, drifts }),
    });
  }

  // Brand Comparison (text-based - legacy)
  async compareBrands(subject1: string, subject2: string) {
    return this.request<{
      subjects: { subject1: string; subject2: string };
      metrics: {
        similarity: string;
        uniqueness: string;
        sync: string;
      };
      evolutionaryPath: string | null;
      timestamp: string;
    }>("/comparison/brands", {
      method: "POST",
      body: JSON.stringify({ subject1, subject2 }),
    });
  }

  // Brand Kit Comparison (file-based)
  async compareBrandKitFiles(brandKit1: File, brandKit2: File) {
    const formData = new FormData();
    formData.append("brandKit1", brandKit1);
    formData.append("brandKit2", brandKit2);

    try {
      const response = await fetch(`${this.baseUrl}/comparison/documents`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || "Comparison failed");
      }

      return data;
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : "Comparison failed",
          code: "COMPARISON_ERROR",
        },
      };
    }
  }

  // Reel Prompt Enhancement
  async enhanceReelPrompt(prompt: string) {
    return this.request<{
      original: string;
      enhanced: string;
      timestamp: string;
    }>("/reel/enhance-prompt", {
      method: "POST",
      body: JSON.stringify({ prompt }),
    });
  }

  // Reel Generation
  async generateReel(
    prompt: string,
    options: {
      aspectRatio?: "9:16" | "1:1" | "16:9";
      resolution?: "720p" | "1080p";
    } = {},
  ) {
    return this.request<{
      status: string;
      operationId: string;
      message: string;
      config: {
        prompt: string;
        aspectRatio: string;
        resolution: string;
      };
      originalPrompt: string;
      enhancedPrompt: string;
    }>("/reel/generate", {
      method: "POST",
      body: JSON.stringify({
        prompt,
        aspectRatio: options.aspectRatio || "9:16",
        resolution: options.resolution || "720p",
      }),
    });
  }

  // Check Reel Status
  async checkReelStatus(operationId: string) {
    return this.request<{
      operationId: string;
      status: string;
      progress: number;
      message: string;
    }>(`/reel/status/${operationId}`);
  }

  // Comprehensive Analysis
  async runComprehensiveAnalysis(
    brandDna: string,
    options: { includeComparison?: boolean; comparisonSubject?: string } = {},
  ) {
    return this.request<{
      audit: {
        score: number;
        drifts: string[];
        violations: number;
      };
      analysis: {
        executiveSummary: string;
        driftsAnalyzed: string[];
      };
      comparison?: {
        similarity: string;
        uniqueness: string;
        sync: string;
        evolutionaryPath: string | null;
      };
      meta: {
        timestamp: string;
        processingTime: string;
      };
    }>("/analysis/comprehensive", {
      method: "POST",
      body: JSON.stringify({
        brandDna,
        includeComparison: options.includeComparison || false,
        comparisonSubject: options.comparisonSubject,
      }),
    });
  }

  // Analysis Status
  async getAnalysisStatus() {
    return this.request<{
      available: boolean;
      features: {
        brandAudit: boolean;
        driftAnalysis: boolean;
        comparison: boolean;
        reelGeneration: boolean;
      };
      timestamp: string;
    }>("/analysis/status");
  }

  // Brand Compliance Analysis - File Upload
  async analyzeBrandCompliance(designFile: File, brandKitFile: File) {
    const formData = new FormData();
    formData.append("designFile", designFile);
    formData.append("brandKitFile", brandKitFile);

    try {
      const response = await fetch(`${BACKEND_URL}/brand-analysis/analyze`, {
        method: "POST",
        body: formData,
        // Don't set Content-Type header - browser will set it with boundary for FormData
      });

      const data = await response.json();
      return data as ApiResponse<{
        analysis: {
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
        };
        files: {
          design: { name: string; type: string; size: number };
          brandKit: { name: string; type: string; size: number };
        };
        timestamp: string;
      }>;
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : "Upload failed",
          code: "UPLOAD_ERROR",
        },
      };
    }
  }

  // Extract Brand Kit Info
  async extractBrandKit(brandKitFile: File) {
    const formData = new FormData();
    formData.append("brandKitFile", brandKitFile);

    try {
      const response = await fetch(
        `${BACKEND_URL}/brand-analysis/extract-brandkit`,
        {
          method: "POST",
          body: formData,
        },
      );

      const data = await response.json();
      return data as ApiResponse<{
        brandInfo: {
          brandName?: string;
          primaryColors?: string[];
          secondaryColors?: string[];
          fonts?: {
            primary?: string;
            secondary?: string;
            body?: string;
          };
          logoGuidelines?: string;
          voiceTone?: string;
          keyPrinciples?: string[];
        };
        file: { name: string; type: string; size: number };
        timestamp: string;
      }>;
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : "Extraction failed",
          code: "EXTRACTION_ERROR",
        },
      };
    }
  }

  // Get Brand Analysis Service Status
  async getBrandAnalysisStatus() {
    return this.request<{
      available: boolean;
      supportedDesignFormats: string[];
      supportedBrandKitFormats: string[];
      maxFileSize: string;
      timestamp: string;
    }>("/brand-analysis/status");
  }
}

// Category Analysis Type
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

// Export singleton instance
export const epsilonApi = new EpsilonAPI();

// Export class for custom instances
export { EpsilonAPI };
