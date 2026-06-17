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
    const { situation } = req.body;

    if (!situation) {
      return res.status(400).json({ error: "Situation is required" });
    }

    const prompt = `You are LifeLine AI, a compassionate caseworker. 
    Analyze the following user situation and provide an empathetic response, identify urgent needs, and suggest one or two follow-up questions.
    
    User Situation: "${situation}"
    
    Responsibilities:
    * Acknowledge the user's situation empathetically.
    * Identify urgent needs (e.g., food, shelter, safety).
    * Ask one or two follow-up questions to understand more.
    * Never provide legal advice.
    * Keep responses concise.
    
    Return ONLY valid JSON in the following format:
    {
      "response": "Your empathetic acknowledgement and brief message",
      "urgentNeeds": ["Need 1", "Need 2"],
      "nextQuestions": ["Question 1", "Question 2"]
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
      
      // Dynamic fallback based on input
      const isShort = situation.length < 10;
      const response = isShort 
        ? "Hello. I'm here to help. To provide the best guidance, could you tell me a bit more about your current situation?"
        : `I've noted that you're dealing with: "${situation}". I'm here to support you. Let's look at your immediate needs first.`;

      res.json({
        "response": response,
        "urgentNeeds": isShort ? ["General Support"] : ["Immediate Assessment"],
        "nextQuestions": ["Have you eaten today?", "Do you have a safe place to stay tonight?"]
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

    const prompt = `You are LifeLine AI, a compassionate caseworker. 
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

    const prompt = `You are LifeLine AI, a compassionate caseworker. 
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

    const prompt = `You are LifeLine AI, a compassionate caseworker. 
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
