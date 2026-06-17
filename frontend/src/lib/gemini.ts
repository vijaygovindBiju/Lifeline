import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

// We'll use gemini-1.5-flash as the primary, but provide a robust fallback
export const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

const fallbackResponses: Record<string, string> = {
  "initial": "I'm sorry you're going through this. Please know that you're not alone, and we're here to help you find your next step. Let's start with a few quick questions to prioritize your immediate needs.",
  "food_yes": "I'm glad to hear you've been able to eat today. Let's look at your housing situation next.",
  "food_no": "I understand. That's our top priority right now. We'll make sure to find you food resources immediately. Do you have a safe place to stay tonight?",
  "housing_yes": "That's good to know. Having a safe place is critical. One more question: do you have any dependents you're caring for?",
  "housing_no": "I'm sorry to hear that. We'll prioritize finding emergency shelter options for you. Do you have any dependents with you?",
  "dependents_yes": "Thank you for sharing that. Caring for others adds another layer of urgency. I've gathered what I need to start finding you immediate help.",
  "dependents_no": "Thank you. I've gathered enough information to identify some immediate resources that can help you through today.",
  "generic": "Thank you for sharing that. I'm processing your information to find the best support resources for your situation."
};

export async function getGeminiResponse(prompt: string, fallbackKey?: string) {
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    
    // If it's a quota error (429) or model error, use the fallback
    if (fallbackKey && fallbackResponses[fallbackKey]) {
      return fallbackResponses[fallbackKey];
    }
    
    return fallbackResponses.generic;
  }
}
