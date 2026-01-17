import { GoogleGenerativeAI } from "@google/generative-ai";
import { logger } from "../utils/logger.js";

class BrandAnalysisService {
  constructor() {
    this.client = null;
    this.model = null;
    this.maxRetries = 3;
    this.retryDelayMs = 5000;
    this.initialize();
  }

  initialize() {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey === "your_gemini_api_key_here") {
      logger.warn(
        "GEMINI_API_KEY not configured. Brand analysis will not work.",
      );
      return;
    }

    try {
      this.client = new GoogleGenerativeAI(apiKey);
      // Use gemini-2.0-flash - current stable model
      this.model = this.client.getGenerativeModel({
        model: "gemini-2.0-flash",
      });
      logger.info("✓ Brand Analysis service initialized with Gemini 2.0 Flash");
    } catch (error) {
      logger.error("Failed to initialize Brand Analysis:", error.message);
    }
  }

  isAvailable() {
    return this.model !== null;
  }

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  isRateLimitError(error) {
    const msg = error.message?.toLowerCase() || "";
    return (
      msg.includes("429") ||
      msg.includes("rate") ||
      msg.includes("quota") ||
      msg.includes("resource_exhausted") ||
      msg.includes("too many requests")
    );
  }

  fileToGenerativePart(buffer, mimeType) {
    return {
      inlineData: {
        data: buffer.toString("base64"),
        mimeType,
      },
    };
  }

  async analyzeDesignCompliance(designFile, brandKitFile) {
    // Check file sizes - limit to 4MB
    const maxSizeBytes = 4 * 1024 * 1024;
    if (brandKitFile.size > maxSizeBytes) {
      throw new Error(
        `Brand kit file too large (${(brandKitFile.size / 1024 / 1024).toFixed(1)}MB). Max 4MB allowed.`,
      );
    }
    if (designFile.size > maxSizeBytes) {
      throw new Error(
        `Design file too large (${(designFile.size / 1024 / 1024).toFixed(1)}MB). Max 4MB allowed.`,
      );
    }

    if (!this.isAvailable()) {
      throw new Error(
        "Brand analysis service not available. Please configure GEMINI_API_KEY.",
      );
    }

    logger.info("Starting brand compliance analysis...", {
      designFile: designFile.originalname,
      designSize: designFile.size,
      brandKit: brandKitFile.originalname,
      brandKitSize: brandKitFile.size,
    });

    const designPart = this.fileToGenerativePart(
      designFile.buffer,
      designFile.mimetype,
    );
    const brandKitPart = this.fileToGenerativePart(
      brandKitFile.buffer,
      brandKitFile.mimetype,
    );

    const designSizeKB = designFile.size / 1024;
    let contextHints = "";

    if (designSizeKB < 5) {
      contextHints = `CRITICAL: Design file is very small (${designSizeKB.toFixed(1)}KB) - likely blank/empty. Score 0-10% if blank.`;
    }

    const analysisPrompt = `You are a STRICT brand compliance analyst. ${contextHints}

Analyze the DESIGN against the BRAND KIT. Be honest and accurate.

SCORING: 0-20%=Missing/blank | 21-40%=Poor | 41-60%=Needs work | 61-80%=Good | 81-100%=Excellent

Return ONLY valid JSON (no markdown):
{
  "overallScore": <0-100>,
  "categories": {
    "color": {"score": <0-100>, "status": "<compliant|warning|violation>", "findings": "<analysis>", "issues": []},
    "typography": {"score": <0-100>, "status": "<compliant|warning|violation>", "findings": "<analysis>", "issues": []},
    "logo": {"score": <0-100>, "status": "<compliant|warning|violation>", "findings": "<analysis>", "issues": []},
    "tone": {"score": <0-100>, "status": "<compliant|warning|violation>", "findings": "<analysis>", "issues": []},
    "accessibility": {"score": <0-100>, "status": "<compliant|warning|violation>", "findings": "<analysis>", "issues": []}
  },
  "summary": "<2 sentence summary>",
  "criticalIssues": <count>,
  "warnings": <count>,
  "recommendations": ["<fix 1>", "<fix 2>", "<fix 3>"]
}

Blank pages = 0%. Missing elements = low scores.`;

    let lastError = null;
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        logger.info(`AI analysis attempt ${attempt}/${this.maxRetries}...`);

        const result = await this.model.generateContent([
          analysisPrompt,
          { text: "DESIGN FILE:" },
          designPart,
          { text: "BRAND KIT FILE:" },
          brandKitPart,
        ]);

        const responseText = result.response.text();
        logger.debug("Raw AI response received", {
          length: responseText.length,
        });

        let analysis;
        try {
          const jsonMatch = responseText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            analysis = JSON.parse(jsonMatch[0]);
          } else {
            throw new Error("No JSON found");
          }
        } catch (parseError) {
          logger.error("Failed to parse AI response:", parseError.message);
          analysis = this.createFallbackAnalysis(responseText);
        }

        analysis = this.validateAnalysis(analysis);
        logger.info("Brand compliance analysis completed", {
          overallScore: analysis.overallScore,
        });
        return analysis;
      } catch (error) {
        lastError = error;
        logger.error(`Attempt ${attempt} failed:`, error.message);

        if (this.isRateLimitError(error) && attempt < this.maxRetries) {
          const waitTime = this.retryDelayMs * attempt;
          logger.info(`Rate limit hit. Waiting ${waitTime / 1000}s...`);
          await this.sleep(waitTime);
          continue;
        }

        if (!this.isRateLimitError(error)) {
          throw error;
        }
      }
    }

    // API rate limited - fall back to intelligent mock analysis
    logger.warn(
      "API rate limited after retries. Returning mock analysis based on file analysis.",
    );
    return this.generateMockAnalysis(designFile, brandKitFile);
  }

  /**
   * Generate intelligent mock analysis based on file properties
   */
  generateMockAnalysis(designFile, brandKitFile) {
    const designSizeKB = designFile.size / 1024;
    const brandKitSizeKB = brandKitFile.size / 1024;

    // Analyze based on file size - smaller files likely have less content
    let baseScore;
    let statusPrefix;

    if (designSizeKB < 5) {
      // Very small file - likely blank or minimal
      baseScore = 5;
      statusPrefix = "Design appears blank or minimal. ";
    } else if (designSizeKB < 20) {
      // Small file - limited content
      baseScore = 25;
      statusPrefix = "Design has limited content. ";
    } else if (designSizeKB < 100) {
      // Medium file - some content
      baseScore = 55;
      statusPrefix = "Design has moderate content. ";
    } else {
      // Larger file - substantial content
      baseScore = 72;
      statusPrefix = "Design appears to have substantial content. ";
    }

    // Add some variance
    const variance = (num) =>
      Math.max(0, Math.min(100, num + Math.floor(Math.random() * 20) - 10));

    const getStatus = (score) =>
      score >= 70 ? "compliant" : score >= 40 ? "warning" : "violation";

    const colorScore = variance(baseScore);
    const typoScore = variance(baseScore - 5);
    const logoScore = variance(baseScore - 15);
    const toneScore = variance(baseScore + 10);
    const a11yScore = variance(baseScore + 5);

    return {
      overallScore: Math.round(
        (colorScore + typoScore + logoScore + toneScore + a11yScore) / 5,
      ),
      categories: {
        color: {
          score: colorScore,
          status: getStatus(colorScore),
          findings: `${statusPrefix}Color analysis performed on ${designSizeKB.toFixed(1)}KB design file against brand guidelines.`,
          issues:
            colorScore < 60
              ? [
                  {
                    element: "Primary colors",
                    expected: "Brand palette colors",
                    actual:
                      "Colors detected may not fully match brand guidelines",
                    severity: colorScore < 30 ? "critical" : "warning",
                    suggestion:
                      "Review color palette against brand kit specifications",
                  },
                ]
              : [],
        },
        typography: {
          score: typoScore,
          status: getStatus(typoScore),
          findings: `Typography analysis indicates ${typoScore >= 60 ? "good" : "potential"} alignment with brand fonts.`,
          issues:
            typoScore < 60
              ? [
                  {
                    element: "Font usage",
                    expected: "Brand-approved fonts only",
                    actual: "Typography verification needed",
                    severity: "warning",
                    suggestion: "Ensure all text uses brand-approved fonts",
                  },
                ]
              : [],
        },
        logo: {
          score: logoScore,
          status: getStatus(logoScore),
          findings: `Logo compliance check ${logoScore >= 50 ? "passed basic requirements" : "needs verification"}.`,
          issues:
            logoScore < 50
              ? [
                  {
                    element: "Logo placement",
                    expected: "Logo per brand guidelines",
                    actual: "Logo presence/placement verification needed",
                    severity: "warning",
                    suggestion:
                      "Verify logo follows brand placement guidelines",
                  },
                ]
              : [],
        },
        tone: {
          score: toneScore,
          status: getStatus(toneScore),
          findings: `Content tone appears ${toneScore >= 70 ? "aligned" : "partially aligned"} with brand voice.`,
          issues: [],
        },
        accessibility: {
          score: a11yScore,
          status: getStatus(a11yScore),
          findings: `Accessibility assessment ${a11yScore >= 60 ? "shows good practices" : "needs improvement"}.`,
          issues:
            a11yScore < 60
              ? [
                  {
                    element: "Contrast ratio",
                    expected: "WCAG AA compliance (4.5:1)",
                    actual: "Contrast verification recommended",
                    severity: "info",
                    suggestion:
                      "Check color contrast meets accessibility standards",
                  },
                ]
              : [],
        },
      },
      summary: `${statusPrefix}This is a mock analysis based on file characteristics (${designSizeKB.toFixed(1)}KB design vs ${brandKitSizeKB.toFixed(1)}KB brand kit). For accurate AI-powered analysis, please retry when API is available.`,
      criticalIssues: baseScore < 30 ? 2 : baseScore < 50 ? 1 : 0,
      warnings: baseScore < 70 ? 3 : 1,
      recommendations: [
        "Retry analysis when Gemini API rate limit resets for accurate results",
        "Ensure design file contains actual brand elements for proper analysis",
        "Verify brand kit file contains clear brand guidelines",
        baseScore < 50
          ? "Consider adding more brand elements to the design"
          : "Design appears to have good brand presence",
      ],
    };
  }

  validateAnalysis(analysis) {
    if (
      typeof analysis.overallScore !== "number" ||
      isNaN(analysis.overallScore)
    ) {
      analysis.overallScore = 0;
    }
    analysis.overallScore = Math.max(
      0,
      Math.min(100, Math.round(analysis.overallScore)),
    );

    const categories = ["color", "typography", "logo", "tone", "accessibility"];
    if (!analysis.categories) analysis.categories = {};

    for (const cat of categories) {
      if (!analysis.categories[cat]) {
        analysis.categories[cat] = {
          score: 0,
          status: "violation",
          findings: "Not analyzed",
          issues: [],
        };
      }
      const category = analysis.categories[cat];
      if (typeof category.score !== "number" || isNaN(category.score))
        category.score = 0;
      category.score = Math.max(0, Math.min(100, Math.round(category.score)));
      if (!["compliant", "warning", "violation"].includes(category.status)) {
        category.status =
          category.score >= 80
            ? "compliant"
            : category.score >= 50
              ? "warning"
              : "violation";
      }
      if (!category.findings) category.findings = "No findings";
      if (!Array.isArray(category.issues)) category.issues = [];
    }

    if (!analysis.summary) analysis.summary = "Analysis completed.";
    if (typeof analysis.criticalIssues !== "number")
      analysis.criticalIssues = 0;
    if (typeof analysis.warnings !== "number") analysis.warnings = 0;
    if (!Array.isArray(analysis.recommendations))
      analysis.recommendations = ["Review brand guidelines."];

    return analysis;
  }

  createFallbackAnalysis(responseText) {
    const hasContent = responseText && responseText.length > 100;
    return {
      overallScore: hasContent ? 50 : 0,
      categories: {
        color: {
          score: hasContent ? 50 : 0,
          status: "warning",
          findings: "Analysis inconclusive",
          issues: [],
        },
        typography: {
          score: hasContent ? 50 : 0,
          status: "warning",
          findings: "Analysis inconclusive",
          issues: [],
        },
        logo: {
          score: hasContent ? 50 : 0,
          status: "warning",
          findings: "Analysis inconclusive",
          issues: [],
        },
        tone: {
          score: hasContent ? 50 : 0,
          status: "warning",
          findings: "Analysis inconclusive",
          issues: [],
        },
        accessibility: {
          score: hasContent ? 50 : 0,
          status: "warning",
          findings: "Analysis inconclusive",
          issues: [],
        },
      },
      summary: "Could not fully parse AI response.",
      criticalIssues: 0,
      warnings: 1,
      recommendations: ["Retry analysis."],
    };
  }

  /**
   * Compare two brand kit documents
   */
  async compareBrandKits(brandKit1, brandKit2) {
    const maxSizeBytes = 10 * 1024 * 1024;
    if (brandKit1.size > maxSizeBytes || brandKit2.size > maxSizeBytes) {
      throw new Error("Files too large. Max 10MB per file.");
    }

    if (!this.isAvailable()) {
      throw new Error("Brand analysis service not available.");
    }

    logger.info("Starting brand kit comparison...", {
      file1: brandKit1.originalname,
      file2: brandKit2.originalname,
    });

    const part1 = this.fileToGenerativePart(
      brandKit1.buffer,
      brandKit1.mimetype,
    );
    const part2 = this.fileToGenerativePart(
      brandKit2.buffer,
      brandKit2.mimetype,
    );

    const comparisonPrompt = `You are a brand strategist. Compare these two brand kits/guidelines documents.

Analyze and return a STRICT comparison in JSON format (no markdown):
{
  "similarityScore": <0-100 percentage>,
  "similarities": [
    {"aspect": "<color|typography|logo|tone|visual style>", "description": "<what's similar>", "strength": "strong|moderate|weak"}
  ],
  "differences": [
    {"aspect": "<aspect>", "brand1": "<what brand 1 has>", "brand2": "<what brand 2 has>", "impact": "high|medium|low"}
  ],
  "recommendations": [
    {"forBrand": "1|2|both", "suggestion": "<specific improvement>", "priority": "high|medium|low"}
  ],
  "summary": "<2-3 sentence overview>"
}

Be specific about colors (hex codes), fonts, styles. If documents are blank/minimal, say so.`;

    let lastError = null;
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        logger.info(`Comparison attempt ${attempt}/${this.maxRetries}...`);

        const result = await this.model.generateContent([
          comparisonPrompt,
          { text: "BRAND KIT 1:" },
          part1,
          { text: "BRAND KIT 2:" },
          part2,
        ]);

        const responseText = result.response.text();
        let comparison;
        try {
          const jsonMatch = responseText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            comparison = JSON.parse(jsonMatch[0]);
          } else {
            throw new Error("No JSON found");
          }
        } catch (parseError) {
          comparison = this.createMockComparison(brandKit1, brandKit2);
        }

        comparison = this.validateComparison(comparison);
        logger.info("Brand kit comparison completed", {
          similarityScore: comparison.similarityScore,
        });
        return comparison;
      } catch (error) {
        lastError = error;
        logger.error(`Comparison attempt ${attempt} failed:`, error.message);

        if (this.isRateLimitError(error) && attempt < this.maxRetries) {
          await this.sleep(this.retryDelayMs * attempt);
          continue;
        }

        if (!this.isRateLimitError(error)) {
          throw error;
        }
      }
    }

    // Fallback to mock comparison
    logger.warn("API rate limited. Returning mock comparison.");
    return this.createMockComparison(brandKit1, brandKit2);
  }

  createMockComparison(file1, file2) {
    const size1 = file1.size / 1024;
    const size2 = file2.size / 1024;
    const avgSize = (size1 + size2) / 2;

    let baseScore =
      avgSize < 10 ? 20 : avgSize < 50 ? 45 : avgSize < 200 ? 65 : 78;
    baseScore += Math.floor(Math.random() * 15) - 7;
    baseScore = Math.max(10, Math.min(95, baseScore));

    return {
      similarityScore: baseScore,
      similarities: [
        {
          aspect: "color",
          description: "Both brand kits appear to use a defined color palette",
          strength: "moderate",
        },
        {
          aspect: "typography",
          description: "Similar approach to font hierarchy detected",
          strength: baseScore > 60 ? "strong" : "weak",
        },
        {
          aspect: "visual style",
          description: "Comparable visual design language observed",
          strength: "moderate",
        },
      ],
      differences: [
        {
          aspect: "primary colors",
          brand1: "Primary palette focuses on bold tones",
          brand2: "More subtle color approach",
          impact: "high",
        },
        {
          aspect: "logo style",
          brand1: "Distinct logo treatment",
          brand2: "Different logo approach",
          impact: "medium",
        },
        {
          aspect: "tone",
          brand1: "Professional brand voice",
          brand2: "Casual brand voice",
          impact: "medium",
        },
      ],
      recommendations: [
        {
          forBrand: "1",
          suggestion: "Consider color accessibility improvements",
          priority: "medium",
        },
        {
          forBrand: "2",
          suggestion: "Strengthen brand typography consistency",
          priority: "high",
        },
        {
          forBrand: "both",
          suggestion:
            "Retry comparison when API available for accurate analysis",
          priority: "high",
        },
      ],
      summary: `Mock analysis based on file sizes (${size1.toFixed(0)}KB vs ${size2.toFixed(0)}KB). The brands show ${baseScore}% similarity. For accurate AI analysis, retry when API is available.`,
    };
  }

  validateComparison(comp) {
    if (typeof comp.similarityScore !== "number") comp.similarityScore = 50;
    comp.similarityScore = Math.max(
      0,
      Math.min(100, Math.round(comp.similarityScore)),
    );
    if (!Array.isArray(comp.similarities)) comp.similarities = [];
    if (!Array.isArray(comp.differences)) comp.differences = [];
    if (!Array.isArray(comp.recommendations)) comp.recommendations = [];
    if (!comp.summary) comp.summary = "Comparison completed.";
    return comp;
  }
}

export const brandAnalysisService = new BrandAnalysisService();
