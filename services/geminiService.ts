import { GoogleGenAI } from "@google/genai";
import { TimerMode } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const MODEL_NAME = "gemini-2.5-flash";

export const generateTip = async (mode: TimerMode): Promise<string> => {
  let prompt = "";

  switch (mode) {
    case TimerMode.FOCUS:
      prompt = "Give me a short, punchy, 1-sentence motivational quote to help me focus on studying right now. Do not use quotes from famous people, just direct encouragement.";
      break;
    case TimerMode.SHORT_BREAK:
      prompt = "Give me a short, fun 1-sentence suggestion for a 5-minute phone break (e.g., check a specific app, stretch, look at a meme). Keep it lighthearted.";
      break;
    case TimerMode.LONG_BREAK:
      prompt = "Give me a short 1-sentence suggestion for a 10-minute relaxing break to recharge before the next study session.";
      break;
    default:
      prompt = "Say hello.";
  }

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });
    return response.text || "Keep going!";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Stay focused and do your best!";
  }
};
