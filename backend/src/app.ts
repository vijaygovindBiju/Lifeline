import express, { Request, Response } from 'express';
import cors from 'cors';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

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

    if (!userMessage && !caseState?.currentSituation) {
      return res.status(400).json({ error: "Message or existing situation is required" });
    }

    const prompt = `You are LifeLine AI, an AI Recovery Caseworker.

IMPORTANT:
You are NOT responding to a single message.
You are continuing an active case.

You must remember and build upon:
1. Previous conversation history
2. Previously identified needs
3. Previously answered questions
4. Current risk assessment
5. Current stage of the Recovery Journey

Never restart the assessment unless the user starts a completely new conversation.

---
CURRENT CASE STATE

Current Situation:
${caseState?.currentSituation || 'Not yet fully defined'}

Primary Concern:
${caseState?.primaryConcern || 'Initial assessment'}

Risk Level:
${caseState?.riskLevel || 'medium'}

Identified Needs:
${(caseState?.identifiedNeeds || []).join(', ') || 'None identified yet'}

Previously Answered Questions:
${(caseState?.answeredQuestions || []).join('\n') || 'None yet'}

Recovery Journey Step:
${caseState?.currentStep || '1'}

---
CONVERSATION HISTORY
${(history || []).map((m: any) => `${m.role === 'user' ? 'User' : 'AI'}: ${m.content}`).join('\n')}

---
NEW USER MESSAGE
${userMessage}

---
REASONING PROCESS
Before responding:
1. Review the conversation history.
2. Review the current case state.
3. Determine what information is already known.
4. Determine what information is still missing.
5. Avoid asking questions that have already been answered.
6. Continue the assessment naturally.
7. Update the case understanding.
8. Move the user toward recovery.

---
RULES
DO NOT:
* Restart the conversation.
* Say "I've received your message."
* Repeat generic introductions.
* Forget previously provided information.
* Ask the same question twice.
* Jump directly to recommendations if assessment is incomplete.

DO:
* Reference information already provided.
* Continue naturally from the previous exchange.
* Ask only the next most important question.
* Act like a professional caseworker managing an ongoing case.

OUTPUT FORMAT
Return valid JSON only:
{
"acknowledgment": "",
"reasoning": {
"primaryConcern": "",
"riskLevel": "low | medium | high",
"identifiedNeeds": [],
"missingInformation": []
},
"response": "",
"nextQuestions": [],
"updatedCaseState": {
"currentSituation": "",
"primaryConcern": "",
"riskLevel": "low | medium | high",
"identifiedNeeds": [],
"answeredQuestions": [],
"currentStep": 2
}
}`;

    const assessmentModel = genAI.getGenerativeModel({ 
      model: "gemini-3-flash-preview",
      generationConfig: { responseMimeType: "application/json" }
    });

    try {
      const result = await assessmentModel.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      const parsed = JSON.parse(text);
      res.json(parsed);
    } catch (apiError) {
      console.error("Gemini API Error:", apiError);
      res.json({
        "acknowledgment": "I'm continuing to review your situation.",
        "reasoning": {
          "primaryConcern": caseState?.primaryConcern || "ongoing assessment",
          "riskLevel": caseState?.riskLevel || "medium",
          "identifiedNeeds": caseState?.identifiedNeeds || [],
          "missingInformation": ["further context"]
        },
        "response": "I've noted that. To make sure we're covering everything, could you tell me more about your current housing situation?",
        "nextQuestions": ["Do you have a safe place to stay tonight?"],
        "updatedCaseState": caseState || {
          "currentSituation": userMessage,
          "primaryConcern": "initial assessment",
          "riskLevel": "medium",
          "identifiedNeeds": [],
          "answeredQuestions": [],
          "currentStep": 2
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
      model: "gemini-3-flash-preview",
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
      
      // General fallbacks
      res.json({
        "programs": [
          {
            "name": "Local Community Assistance",
            "match": "Strong Match",
            "reason": "Based on your current needs, local community programs often provide the fastest path to immediate support.",
            "documents": ["Photo ID", "Proof of address"]
          },
          {
            "name": "Emergency Relief Services",
            "match": "Possible Match",
            "reason": "This can help bridge the gap while we explore more permanent program eligibility.",
            "documents": ["Identification", "Statement of need"]
          }
        ]
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
      model: "gemini-3-flash-preview",
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
      res.json({
        "today": [
          { "title": "Identify immediate resources", "description": "Focus on locating local centers that can provide same-day assistance." },
          { "title": "Organize your documents", "description": "Keep your ID and any relevant letters in one place for easy access." }
        ],
        "thisWeek": [
          { "title": "Contact support agencies", "description": "Reach out to the programs we identified to discuss your eligibility." },
          { "title": "Create a simple budget", "description": "Map out your essential expenses for the coming days." }
        ],
        "thisMonth": [
          { "title": "Follow up on applications", "description": "Keep track of your requests and provide any additional information needed." },
          { "title": "Review your recovery milestones", "description": "Take a moment to acknowledge the steps you've taken toward stability." }
        ]
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
      model: "gemini-3-flash-preview",
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
      res.json({
        "skills": ["Communication", "Organization", "Problem Solving", "Adaptability"],
        "experience": "Experienced professional with a background in providing high-quality service and operational support.",
        "temporaryOpportunities": ["Service Associate", "Administrative Support", "Logistics Coordinator"],
        "growthOpportunities": ["Professional Development Programs", "Management Training", "Specialized Certification Pathways"]
      });
    }

  } catch (error) {
    console.error("Document Insights Error:", error);
    res.status(500).json({ error: "Failed to generate document insights" });
  }
});

export default app;
