import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

// We'll use gemini-1.5-flash as the primary, but provide a robust fallback
export const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

const fallbackResponses: Record<string, string> = {
  "initial": "I'm here to help you navigate this moment. Could you share a bit more about what's happening so I can provide the best guidance?",
  "food_yes": "I've noted that. Let's look at your housing situation next to ensure you have a safe place to stay.",
  "food_no": "Thank you for letting me know. We'll prioritize finding immediate support for that. Do you have a safe place to stay tonight?",
  "housing_yes": "That's helpful to know. Stability in your living situation is a key first step. Do you have any dependents you're caring for?",
  "housing_no": "I've noted the urgency regarding your housing. We'll look for emergency options. Do you have any dependents with you?",
  "dependents_yes": "Thank you for sharing. Caring for others is an important factor in our planning. I've gathered enough to start identifying resources for you.",
  "dependents_no": "Thank you. I have the information I need to begin matching you with relevant support resources.",
  "generic": "Thank you for sharing that. I'm processing your information to find the best paths forward for your specific situation."
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
