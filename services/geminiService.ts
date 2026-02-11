
import { GoogleGenAI } from "@google/genai";

export const getSpiritualInsight = async (recitationTitle: string): Promise<string> => {
  // Creating a new GoogleGenAI instance inside the function to ensure it uses the most up-to-date API key
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Provide a short, 2-sentence spiritual virtue (Fazilah) or benefit of reciting ${recitationTitle} from an Islamic perspective. Keep it encouraging and respectful for someone performing Esal-e-Sawab.`,
      config: {
        temperature: 0.7,
        // Removed maxOutputTokens to follow guidelines and ensure the model has full flexibility for its response.
      }
    });
    // Accessing .text property directly as it is a getter, not a method
    return response.text || "Reciting this brings immense peace and mercy from Allah.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "The remembrance of Allah brings tranquility to the hearts.";
  }
};
