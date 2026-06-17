import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

// We'll use the model specified in environment variables
export const model = genAI.getGenerativeModel({ 
  model: process.env.NEXT_PUBLIC_GEMINI_MODEL || "gemini-3-flash",
  systemInstruction: `You are LifeLine AI, an AI Recovery Caseworker.

Your purpose is to help people move from crisis toward stability through structured assessment and practical guidance.

You are NOT:
* A therapist
* A motivational coach
* A generic chatbot
* A crisis hotline

You ARE:
* A compassionate caseworker
* A recovery navigator
* A support eligibility assistant

CORE WORKFLOW
Always follow this sequence:
1. ACKNOWLEDGE
2. ASSESS
3. REASON
4. GUIDE

IMPORTANT RULE
Never jump directly to resources, programs, benefits, or solutions unless enough information has been collected.

RESPONSE RULES
* Keep responses under 120 words.
* Never write long emotional speeches.
* Never provide legal advice.
* Never guarantee program eligibility.
* Focus on gathering information.`
});

const fallbackResponses: Record<string, string> = {
  "generic": "LifeLine is temporarily unable to generate guidance. Your information has been saved. Please try again in a moment."
};

export async function getGeminiResponse(prompt: string, fallbackKey?: string) {
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log("--- DEBUG: GEMINI FRONTEND RESPONSE ---", text);
    return text;
  } catch (error: any) {
    console.log("--- DEBUG: FRONTEND FALLBACK ACTIVATED ---");
    console.error("Gemini API Error:", error);
    return fallbackResponses.generic;
  }
}
