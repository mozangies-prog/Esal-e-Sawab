
import { GoogleGenAI } from "@google/genai";
import { logger } from "./logger";

/**
 * Fetches a spiritual insight using the Gemini API.
 * Adheres to the strictly defined structure: const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
 */
export const getSpiritualInsight = async (recitationTitle: string): Promise<string> => {
  // Verify API key exists before attempting to use it
  if (!process.env.API_KEY || process.env.API_KEY === 'undefined' || process.env.API_KEY === 'null' || process.env.API_KEY === '') {
    logger.warn("Gemini Service: API_KEY is missing. Using spiritual fallback.");
    return "The remembrance of Allah brings peace and tranquility to the believer's heart. Every letter recited for a loved one is a light in their journey.";
  }

  try {
    logger.network("POST", "Gemini API - GenerateContent");
    
    // Fix: Always use the exact initialization pattern as per guidelines
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Fix: Use the standard generateContent pattern with supported model
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Provide a single, powerful, 2-sentence spiritual virtue (Fazilah) or benefit of reciting ${recitationTitle} in Islam. Focus on rewards for the deceased and the reciter.`,
      config: { 
        temperature: 1,
        maxOutputTokens: 250,
        thinkingConfig: { thinkingBudget: 0 }
      }
    });

    // Fix: Access .text property directly (it is a property, not a method)
    const insight = response.text;
    
    if (!insight) {
      throw new Error("Empty response from AI");
    }

    return insight.trim();
  } catch (error: any) {
    logger.error("Gemini Insight Error:", error);
    return "The Prophet (ﷺ) said: 'The best of you are those who learn the Quran and teach it.' Reciting for others is a great act of mercy.";
  }
};
