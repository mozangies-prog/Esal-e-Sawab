import { GoogleGenAI } from "@google/genai";
import { logger } from "./logger";

/**
 * Fetches a spiritual insight using the Gemini API.
 * Adheres to the strictly defined structure: const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
 */
export const getSpiritualInsight = async (recitationTitle: string): Promise<string> => {
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    logger.warn("Gemini Service: process.env.API_KEY is missing. Falling back to local content.");
    return "The remembrance of Allah brings peace and tranquility to the believer's heart.";
  }

  try {
    logger.network("POST", "Gemini API - GenerateContent");
    const ai = new GoogleGenAI({ apiKey });
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Provide a single, powerful, 2-sentence spiritual virtue (Fazilah) or benefit of reciting ${recitationTitle} in Islam. Focus on rewards for the deceased and the reciter.`,
      config: { 
        temperature: 0.7,
        maxOutputTokens: 200, // Safe limit for small snippets
        thinkingConfig: { thinkingBudget: 0 } // Disable thinking for latency
      }
    });

    // Accessing .text as a property as per latest SDK guidelines
    const insight = response.text;
    
    if (!insight) {
      throw new Error("Empty response from AI");
    }

    return insight.trim();
  } catch (error) {
    logger.error("Gemini Insight Error:", error);
    return "The Prophet (ﷺ) said: 'The best of you are those who learn the Quran and teach it.' Reciting for others is a great act of mercy.";
  }
};