
import { GoogleGenAI } from "@google/genai";

export const getSpiritualInsight = async (recitationTitle: string): Promise<string> => {
  // Always use process.env.API_KEY directly as per guidelines
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Provide a short, 2-sentence spiritual virtue (Fazilah) or benefit of reciting ${recitationTitle}. Keep it encouraging for Esal-e-Sawab.`,
      config: { 
        temperature: 0.7 
      }
    });

    // Directly access .text property as it is a getter
    return response.text || "Reciting this brings immense rewards.";
  } catch (error) {
    console.error("Gemini Insight Error:", error);
    return "The remembrance of Allah brings tranquility to the hearts.";
  }
};
