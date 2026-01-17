import { GoogleGenerativeAI } from '@google/generative-ai';
import { logger } from '../utils/logger.js';

class GeminiService {
  constructor() {
    this.client = null;
    this.model = null;
    this.initialize();
  }

  initialize() {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      logger.warn('GEMINI_API_KEY not configured. AI features will be disabled.');
      return;
    }

    try {
      this.client = new GoogleGenerativeAI(apiKey);
      this.model = this.client.getGenerativeModel({ model: 'gemini-2.0-flash' });
      logger.info('✓ Gemini AI service initialized');
    } catch (error) {
      logger.error('Failed to initialize Gemini:', error.message);
    }
  }

  isAvailable() {
    return this.model !== null;
  }

  async generateContent(prompt, options = {}) {
    if (!this.isAvailable()) {
      throw new Error('AI service not available. Please configure GEMINI_API_KEY.');
    }

    const { 
      temperature = 0.7,
      maxOutputTokens = 2048,
      safetySettings = []
    } = options;

    try {
      const generationConfig = {
        temperature,
        maxOutputTokens,
        topK: 40,
        topP: 0.95
      };

      const result = await this.model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig,
        safetySettings
      });

      const response = result.response;
      const text = response.text();
      
      logger.debug('AI Generation successful', { promptLength: prompt.length, responseLength: text.length });
      
      return text;
    } catch (error) {
      logger.error('Gemini generation error:', error.message);
      throw error;
    }
  }

  async performBrandAudit(brandDna) {
    const prompt = `You are a world-class brand strategist. Perform a comprehensive brand audit on these guidelines: "${brandDna}". 

Return exactly 4 critical drift categories (single word each) that need attention and a predicted integrity score (1-100).

Format your response EXACTLY as: 
SCORE: [number]
DRIFTS: [word1, word2, word3, word4]

Be precise and professional.`;

    const response = await this.generateContent(prompt, { temperature: 0.6 });
    
    // Parse the response
    const scoreMatch = response.match(/SCORE:\s*(\d+)/i);
    const driftsMatch = response.match(/DRIFTS:\s*\[(.*?)\]/i);

    const score = scoreMatch ? parseInt(scoreMatch[1]) : 75;
    const drifts = driftsMatch 
      ? driftsMatch[1].split(',').map(s => s.trim().toUpperCase())
      : ['TYPOGRAPHY', 'COLORSPACE', 'SYMBOLICS', 'UX DESIGN'];

    // Calculate violations based on score
    const violations = Math.max(1, Math.floor((100 - score) / 5));

    return { score, drifts, violations };
  }

  async analyzeDrifts(brandDna, drifts) {
    const prompt = `You are an elite brand consultant. Given the brand DNA: "${brandDna}" and identified drifts: ${drifts.join(', ')}.

Write a 3-sentence high-level executive summary on how to stabilize the brand identity. Be professional, punchy, and use sophisticated agency terminology.

Return ONLY the summary, no formatting or labels.`;

    const response = await this.generateContent(prompt, { temperature: 0.7 });
    return response.trim();
  }

  async compareBrands(subject1, subject2) {
    const prompt = `You are a brand comparison expert. Compare these two brand subjects:
Subject 1: "${subject1}"
Subject 2: "${subject2}"

Provide exactly 3 metrics and a strategic "Evolutionary Path" (2-sentence strategic outlook).
1. Similarity percentage (e.g., 60%)
2. Uniqueness factor (01-10, zero-padded)
3. Sync status (One word: "ZEN", "DRIFT", or "CHAOS")

Format EXACTLY as:
SIMILARITY: [value]
UNIQUENESS: [value]
SYNC: [value]
PATH: [2-sentence strategic description]`;

    const response = await this.generateContent(prompt, { temperature: 0.6 });

    // Parse the response
    const sim = response.match(/SIMILARITY:\s*([\d]+%?)/i)?.[1] || '50%';
    const uniq = response.match(/UNIQUENESS:\s*([\d]+)/i)?.[1]?.padStart(2, '0') || '05';
    const sync = response.match(/SYNC:\s*(\w+)/i)?.[1]?.toUpperCase() || 'NEUTRAL';
    const path = response.match(/PATH:\s*(.+)/i)?.[1] || null;

    return {
      similarity: sim.includes('%') ? sim : `${sim}%`,
      uniqueness: uniq,
      sync,
      evolutionaryPath: path
    };
  }

  async enhanceReelPrompt(prompt) {
    const enhancePrompt = `Transform this into a high-end cinematic video prompt optimized for AI video generation: "${prompt}"

Focus on:
- Dramatic lighting and atmosphere
- Rich textures and materials
- Elite camera movements and angles
- Professional color grading references

Return ONLY the optimized prompt, nothing else. Keep it under 500 characters.`;

    const response = await this.generateContent(enhancePrompt, { 
      temperature: 0.8,
      maxOutputTokens: 1024 
    });
    
    return response.trim();
  }
}

// Singleton export
export const geminiService = new GeminiService();
