import { GoogleGenAI } from "@google/genai";

if (!process.env.API_KEY) {
  console.warn("API_KEY environment variable not set. AI features will not work.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export const humanizeTextWithAI = async (text: string): Promise<string> => {
  if (!process.env.API_KEY) {
    return "Error: API key is not configured.";
  }
  if (!text.trim()) {
    return "";
  }

  try {
    const prompt = `You are an expert communicator specializing in public announcements. 
    Rewrite the following text to sound more natural, human, and engaging for a campus audience.
    Maintain a friendly yet professional tone. The core message must remain the same.
    Avoid overly casual language or slang. The goal is clarity and a pleasant, non-robotic delivery.
    Return ONLY the rewritten text, without any additional comments, preamble, or markdown formatting.

    Original text: "${text}"`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text.trim();
  } catch (error) {
    console.error("Error humanizing text with AI:", error);
    return `Error: Could not humanize text. ${error instanceof Error ? error.message : String(error)}`;
  }
};
