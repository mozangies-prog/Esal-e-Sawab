
import { GoogleGenAI } from "@google/genai";

export const getSpiritualInsight = async (recitationTitle: string): Promise<string> => {
  // Defensive check for process.env to prevent blank screens in environments without proper polyfills
  const apiKey = (typeof process !== 'undefined' && process.env) ? process.env.API_KEY : null;
  
  if (!apiKey) {
    console.warn("API Key missing. AI features disabled.");
    return "The remembrance of Allah brings tranquility to the hearts.";
  }

  const ai = new GoogleGenAI({ apiKey: apiKey as string });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Provide a short, 2-sentence spiritual virtue (Fazilah) or benefit of reciting ${recitationTitle} from an Islamic perspective. Keep it encouraging and respectful for someone performing Esal-e-Sawab.`,
      config: {
        temperature: 0.7,
      }
    });
    return response.text || "Reciting this brings immense peace and mercy from Allah.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "The remembrance of Allah brings tranquility to the hearts.";
  }
};
