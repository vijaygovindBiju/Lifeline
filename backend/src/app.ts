import express, { Request, Response } from 'express';
import cors from 'cors';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const app = express();

app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

app.get('/', (req: Request, res: Response) => {
  res.json({
    message: "LifeLine Backend Running"
  });
});

app.post('/api/assess', async (req: Request, res: Response) => {
  try {
    const { userMessage, history, caseState } = req.body;

    console.log("--- DEBUG: NEW ASSESSMENT REQUEST ---");
    console.log("User Message:", userMessage);
    console.log("Incoming Case State:", JSON.stringify(caseState, null, 2));
    console.log("History Length:", history?.length || 0);

    if (!userMessage && !caseState?.currentSituation) {
      return res.status(400).json({ error: "Message or existing situation is required" });
    }

    const prompt = `You are LifeLine AI, an AI Recovery Caseworker.

IMPORTANT:
You are NOT responding to a single message.
You are continuing an active case. You must remember everything provided previously.

REQUIRED BEHAVIOR:
1. FACT EXTRACTION: Review the "NEW USER MESSAGE" and "CONVERSATION HISTORY" to extract facts for the Assessment Domains.
2. MEMORY UPDATE: Update the "updatedCaseState.assessmentData" with these facts.
3. GAP ANALYSIS: Check which Critical Domains are still "Unknown".
4. NEXT STEP: If an urgent need (Food/Housing) is identified AND Location is known, IMMEDIATELY recommend "Show Nearby Resources".
5. QUESTIONING: If more info is needed, ask ONLY ONE question about the most urgent UNKNOWN domain. 
6. NO REPETITION: Never ask a question if you already have related info in the Assessment Domains or History.

---
CRITICAL ASSESSMENT DOMAINS (DO NOT RE-ASK IF KNOWN):
- Employment: ${caseState?.assessmentData?.employment || 'Unknown'}
- Food Security: ${caseState?.assessmentData?.foodSecurity || 'Unknown'}
- Housing Status: ${caseState?.assessmentData?.housing || 'Unknown'}
- Dependents: ${caseState?.assessmentData?.dependents || 'Unknown'}
- Medical Needs: ${caseState?.assessmentData?.medical || 'Unknown'}
- Location: ${caseState?.assessmentData?.location || 'Unknown'}
- Transportation: ${caseState?.assessmentData?.transportation || 'Unknown'}

---
CURRENT CASE STATE:
Primary Concern: ${caseState?.primaryConcern || 'Initial assessment'}
Risk Level: ${caseState?.riskLevel || 'medium'}
Identified Needs: ${(caseState?.identifiedNeeds || []).join(', ') || 'None'}
Previously Answered Questions: ${(caseState?.answeredQuestions || []).join(', ') || 'None'}

---
CONVERSATION HISTORY:
${(history || []).map((m: any) => `${m.role === 'user' ? 'User' : 'AI'}: ${m.content}`).join('\n')}

---
NEW USER MESSAGE:
"${userMessage}"

---
RULES:
* Keep responses under 100 words.
* If the user says "I live alone", "I'm homeless", "I stay with friends", etc. -> Housing Status is KNOWN. Do not ask about it again.
* If the user provides a ZIP code or City -> Location is KNOWN.
* Return valid JSON only.

OUTPUT FORMAT:
{
"acknowledgment": "Briefly acknowledge the new info",
"reasoning": {
"primaryConcern": "Most urgent issue found",
"riskLevel": "high | medium | low",
"identifiedNeeds": ["Need 1", "Need 2"],
"missingInformation": ["What is still Unknown"]
},
"response": "Your compassionate caseworker response",
"nextQuestions": ["Only one question about an UNKNOWN domain, or empty if moving to resources"],
"updatedCaseState": {
"currentSituation": "Comprehensive summary of all known facts so far",
"primaryConcern": "Most urgent issue",
"riskLevel": "high | medium | low",
"identifiedNeeds": ["Need 1", "Need 2"],
"answeredQuestions": ["List of all questions answered so far"],
"currentStep": 2,
"assessmentData": {
  "employment": "extracted or previous value",
  "foodSecurity": "extracted or previous value",
  "housing": "extracted or previous value",
  "dependents": "extracted or previous value",
  "medical": "extracted or previous value",
  "location": "extracted or previous value",
  "transportation": "extracted or previous value"
}
}
}`;

    console.log("--- DEBUG: FULL PROMPT SENT TO GEMINI ---");
    console.log(prompt);
    console.log("------------------------------------------");

    const assessmentModel = genAI.getGenerativeModel({ 
      model: process.env.GEMINI_MODEL || "gemini-3-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    try {
      const result = await assessmentModel.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      console.log("--- DEBUG: GEMINI RAW RESPONSE ---");
      console.log(text);
      
      const parsed = JSON.parse(text);

      console.log("--- DEBUG: GEMINI RESPONSE SUCCESS ---");
      console.log("Acknowledgment:", parsed.acknowledgment);
      console.log("Response:", parsed.response);
      console.log("Next Questions:", parsed.nextQuestions);
      console.log("Parsed Assessment Data:", JSON.stringify(parsed.updatedCaseState?.assessmentData, null, 2));

      res.json(parsed);
    } catch (apiError) {
      console.log("--- DEBUG: FALLBACK ACTIVATED ---");
      console.error("Gemini API Error:", apiError);
      
      res.json({
        "acknowledgment": "",
        "reasoning": null,
        "response": "LifeLine is temporarily unable to generate guidance. Your information has been saved. Please try again in a moment.",
        "nextQuestions": [],
        "updatedCaseState": {
          ...(caseState || {}),
          "currentSituation": (caseState?.currentSituation || "") + " " + userMessage,
          "currentStep": 2,
          "assessmentData": caseState?.assessmentData || {}
        }
      });
    }

  } catch (error) {
    console.error("Assessment Error:", error);
    res.status(500).json({ error: "Failed to perform assessment" });
  }
});

app.post('/api/programs', async (req: Request, res: Response) => {
  try {
    const { situation, answers } = req.body;

    if (!situation) {
      return res.status(400).json({ error: "Situation is required" });
    }

    const prompt = `You are LifeLine AI, an AI Recovery Caseworker.

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

RESPONSE RULES:
* Keep responses under 120 words.
* Never write long emotional speeches.
* Never provide legal advice.
* Never guarantee program eligibility.
* Focus on practical recovery.

Based on the user's situation and their answers to follow-up questions, recommend relevant support programs.
    
    User Situation: "${situation}"
    User Answers: ${JSON.stringify(answers)}
    
    Responsibilities:
    * Provide practical explanations of why a program helps.
    * Use match labels: "Strong Match", "Possible Match", or "Worth Exploring".
    * List common documents required for each program.
    * Never guarantee eligibility.
    * Keep explanations conversational and brief.
    
    Return ONLY valid JSON in the following format:
    {
      "programs": [
        {
          "name": "Program Name",
          "match": "Strong Match | Possible Match | Worth Exploring",
          "reason": "Practical explanation of why it helps",
          "documents": ["Document 1", "Document 2"]
        }
      ]
    }`;

    const programModel = genAI.getGenerativeModel({ 
      model: process.env.GEMINI_MODEL || "gemini-3-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    try {
      const result = await programModel.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      const parsed = JSON.parse(text);
      res.json(parsed);
    } catch (apiError) {
      console.error("Gemini API Error:", apiError);
      
      res.status(503).json({ 
        error: "LifeLine is temporarily unable to generate guidance. Your information has been saved. Please try again in a moment.",
        programs: [] 
      });
    }

  } catch (error) {
    console.error("Programs Error:", error);
    res.status(500).json({ error: "Failed to recommend programs" });
  }
});

app.post('/api/recovery-plan', async (req: Request, res: Response) => {
  try {
    const { situation } = req.body;

    if (!situation) {
      return res.status(400).json({ error: "Situation is required" });
    }

    const prompt = `You are LifeLine AI, an AI Recovery Caseworker.

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

RESPONSE RULES:
* Keep responses under 120 words.
* Never write long emotional speeches.
* Never provide legal advice.
* Focus on practical recovery.

Create a practical and realistic recovery plan for a user in the following situation:
    
    User Situation: "${situation}"
    
    Guidelines:
    * Break the plan into three timeframes: "today", "thisWeek", and "thisMonth".
    * Each timeframe should be an array of steps.
    * Each step should be a simple object with a "title" and "description".
    * Be realistic and focus on practical recovery steps.
    * Use compassionate and encouraging language.
    * Avoid overwhelming the user; keep steps manageable.
    
    Return ONLY valid JSON in the following format:
    {
      "today": [{ "title": "Step title", "description": "Brief description" }],
      "thisWeek": [{ "title": "Step title", "description": "Brief description" }],
      "thisMonth": [{ "title": "Step title", "description": "Brief description" }]
    }`;

    const planModel = genAI.getGenerativeModel({ 
      model: process.env.GEMINI_MODEL || "gemini-3-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    try {
      const result = await planModel.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      const parsed = JSON.parse(text);
      res.json(parsed);
    } catch (apiError) {
      console.error("Gemini API Error:", apiError);
      res.status(503).json({ 
        error: "LifeLine is temporarily unable to generate guidance. Your information has been saved. Please try again in a moment.",
        today: [], 
        thisWeek: [], 
        thisMonth: [] 
      });
    }

  } catch (error) {
    console.error("Recovery Plan Error:", error);
    res.status(500).json({ error: "Failed to generate recovery plan" });
  }
});

app.post('/api/document-insights', async (req: Request, res: Response) => {
  try {
    const { resumeText } = req.body;

    if (!resumeText) {
      return res.status(400).json({ error: "Resume text is required" });
    }

    const prompt = `You are LifeLine AI, an AI Recovery Caseworker.

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

RESPONSE RULES:
* Keep responses under 120 words.
* Never write long emotional speeches.
* Never provide legal advice.
* Focus on practical recovery.

Analyze the following resume text and extract key information to help the user find stability.
    
    Resume Text: "${resumeText}"
    
    Responsibilities:
    * Extract a list of core "skills".
    * Summarize the user's "experience" in 1-2 sentences.
    * Identify "temporaryOpportunities" for immediate income.
    * Suggest "growthOpportunities" for long-term career pathways.
    
    Return ONLY valid JSON in the following format:
    {
      "skills": ["Skill 1", "Skill 2"],
      "experience": "Brief summary of experience",
      "temporaryOpportunities": ["Opportunity 1", "Opportunity 2"],
      "growthOpportunities": ["Pathway 1", "Pathway 2"]
    }`;

    const insightsModel = genAI.getGenerativeModel({ 
      model: process.env.GEMINI_MODEL || "gemini-3-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    try {
      const result = await insightsModel.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      const parsed = JSON.parse(text);
      res.json(parsed);
    } catch (apiError) {
      console.error("Gemini API Error:", apiError);
      res.status(503).json({ 
        error: "LifeLine is temporarily unable to generate guidance. Your information has been saved. Please try again in a moment.",
        skills: [],
        experience: "",
        temporaryOpportunities: [],
        growthOpportunities: []
      });
    }

  } catch (error) {
    console.error("Document Insights Error:", error);
    res.status(500).json({ error: "Failed to generate document insights" });
  }
});

export default app;
