import express, { Request, Response } from 'express';
import cors from 'cors';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const GEMINI_MODEL = process.env.GEMINI_MODEL;

if (!GEMINI_MODEL) {
  throw new Error("FATAL: GEMINI_MODEL environment variable is missing.");
}

console.log("Gemini Model:", GEMINI_MODEL);

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
      model: GEMINI_MODEL,
      generationConfig: { responseMimeType: "application/json" }
    });

    try {
      console.log("[GEMINI CALL] /api/assess");
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
      model: GEMINI_MODEL,
      generationConfig: { responseMimeType: "application/json" }
    });

    try {
      console.log("[GEMINI CALL] /api/programs");
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
* CRITICAL: Do not reference any specific organization, address, food bank, benefit program, or assistance program (such as SNAP, Supplemental Nutrition Assistance Program, Unemployment Insurance Benefits, or Emergency Rental Assistance) unless it has been explicitly provided in the situation.
* If real verified resources are not available in the user's location, you must say: "Locate nearby food assistance services." instead of inventing a resource.
* Generate action-oriented, location-agnostic recommendations when verified local resources/programs are unknown.

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
      model: GEMINI_MODEL,
      generationConfig: { responseMimeType: "application/json" }
    });

    try {
      console.log("[GEMINI CALL] /api/recovery-plan");
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
      model: GEMINI_MODEL,
      generationConfig: { responseMimeType: "application/json" }
    });

    try {
      console.log("[GEMINI CALL] /api/document-insights");
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

// Helper functions for /api/resources
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

async function geocode(location: string): Promise<{ lat: number; lon: number } | null> {
  const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(location)}&limit=1`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.error(`Geocoding failed for ${location}: ${res.statusText}`);
      return null;
    }
    const data = await res.json() as any;
    if (data && data.features && data.features.length > 0) {
      const coords = data.features[0].geometry.coordinates;
      return {
        lat: coords[1], // Latitude
        lon: coords[0]  // Longitude
      };
    }
  } catch (err) {
    console.error(`Geocoding error for ${location}:`, err);
  }
  return null;
}

async function fetchOverpassResources(lat: number, lon: number): Promise<any[]> {
  const radius = 10000; // 10 km
  const query = `[out:json][timeout:25];
(
  node(around:${radius}, ${lat}, ${lon})[amenity~"food_bank|soup_kitchen|shelter|clinic|doctors|hospital|job_centre|charity"];
  node(around:${radius}, ${lat}, ${lon})[social_facility~"food_bank|soup_kitchen|shelter|homeless_shelter|employment_service|social_support|housing_assistance"];
  node(around:${radius}, ${lat}, ${lon})[office~"employment|ngo"];
  way(around:${radius}, ${lat}, ${lon})[amenity~"food_bank|soup_kitchen|shelter|clinic|doctors|hospital|job_centre|charity"];
  way(around:${radius}, ${lat}, ${lon})[social_facility~"food_bank|soup_kitchen|shelter|homeless_shelter|employment_service|social_support|housing_assistance"];
  way(around:${radius}, ${lat}, ${lon})[office~"employment|ngo"];
);
out center;`;

  const servers = [
    'https://z.overpass-api.de/api/interpreter',
    'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
    'https://overpass.osm.ch/api/interpreter'
  ];

  for (const url of servers) {
    try {
      console.log(`Trying Overpass server: ${url}`);
      const res = await fetch(url, {
        method: 'POST',
        body: 'data=' + encodeURIComponent(query),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'LifeLine-Crisis-Recovery-Platform/1.0 (contact@example.com)'
        },
        signal: AbortSignal.timeout(10000)
      });
      if (res.ok) {
        const data = await res.json() as any;
        if (data && data.elements && data.elements.length > 0) {
          console.log(`Successfully fetched ${data.elements.length} elements from ${url}`);
          return data.elements;
        } else {
          console.warn(`Server ${url} returned 0 elements, trying next...`);
        }
      } else {
        console.warn(`Server ${url} failed with status: ${res.status}`);
      }
    } catch (err: any) {
      console.warn(`Error connecting to ${url}: ${err.message}`);
    }
  }

  return [];
}

interface SupportResource {
  name: string;
  category: string;
  address: string;
  distance: string;
  description: string;
  lat: number;
  lng: number;
}

function getResourceCategory(tags: any): 'Food Assistance' | 'Housing' | 'Medical' | 'Employment' | null {
  const amenity = (tags.amenity || '').toLowerCase();
  const socialFacility = (tags.social_facility || '').toLowerCase();
  const office = (tags.office || '').toLowerCase();
  const name = (tags.name || '').toLowerCase();
  const description = (tags.description || '').toLowerCase();
  const tagsStr = JSON.stringify(tags).toLowerCase();

  // 1. Food Assistance: community kitchen, food bank, charity, soup kitchen, social service office, NGO food support
  if (
    name.includes('community kitchen') || description.includes('community kitchen') || tagsStr.includes('community_kitchen') ||
    amenity === 'food_bank' || socialFacility === 'food_bank' || name.includes('food bank') || description.includes('food bank') ||
    amenity === 'charity' || name.includes('charity') || description.includes('charity') ||
    amenity === 'soup_kitchen' || socialFacility === 'soup_kitchen' || name.includes('soup kitchen') || description.includes('soup kitchen') ||
    name.includes('social service office') || description.includes('social service office') || tagsStr.includes('social_service_office') ||
    name.includes('ngo food support') || description.includes('ngo food support') || tagsStr.includes('ngo_food_support') ||
    // general food indicators from tags as fallback
    tags.food === 'yes' || name.includes('kitchen') || name.includes('pantry') || tagsStr.includes('food_distribution') ||
    (office === 'ngo' && (name.includes('food') || description.includes('food')))
  ) {
    return 'Food Assistance';
  }

  // 2. Housing: shelter, homeless shelter, housing assistance
  if (
    amenity === 'shelter' || socialFacility === 'shelter' || name.includes('shelter') || description.includes('shelter') ||
    socialFacility === 'homeless_shelter' || name.includes('homeless shelter') || description.includes('homeless shelter') ||
    socialFacility === 'housing_assistance' || name.includes('housing assistance') || description.includes('housing assistance') ||
    tags.social_facility_for === 'homeless' || tags.shelter === 'yes'
  ) {
    return 'Housing';
  }

  // 3. Medical: hospital, clinic, health center
  if (
    amenity === 'hospital' || name.includes('hospital') || description.includes('hospital') ||
    amenity === 'clinic' || tags.healthcare === 'clinic' || name.includes('clinic') || description.includes('clinic') ||
    name.includes('health center') || name.includes('health centre') || description.includes('health center') || description.includes('health centre') ||
    tags.healthcare === 'hospital' || tags.healthcare === 'health_center' || tags.healthcare === 'centre' || tags.medical === 'yes' || amenity === 'doctors'
  ) {
    return 'Medical';
  }

  // 4. Employment: employment office, job center, career center
  if (
    name.includes('employment office') || description.includes('employment office') || tagsStr.includes('employment_office') ||
    amenity === 'job_centre' || name.includes('job center') || name.includes('job centre') || description.includes('job center') || description.includes('job centre') ||
    name.includes('career center') || name.includes('career centre') || description.includes('career center') || description.includes('career centre') ||
    office === 'employment' || socialFacility === 'employment_service'
  ) {
    return 'Employment';
  }

  return null;
}

function mapOverpassElement(el: any, userLat: number, userLon: number, category: string): SupportResource | null {
  const tags = el.tags || {};
  const lat = el.lat || (el.center && el.center.lat);
  const lon = el.lon || (el.center && el.center.lon);
  if (!lat || !lon) return null;

  const distKm = getDistance(userLat, userLon, lat, lon);
  const distanceStr = distKm < 1 
    ? `${Math.round(distKm * 1000)} m away` 
    : `${distKm.toFixed(1)} km away`;

  const name = tags.name || tags.operator || `${category} (Name Unknown)`;
  const description = tags.description || tags.note || tags.comment || `${category} providing support in this area.`;

  let address = '';
  if (tags['addr:housenumber'] && tags['addr:street']) {
    address = `${tags['addr:housenumber']} ${tags['addr:street']}`;
  } else if (tags['addr:street']) {
    address = tags['addr:street'];
  } else {
    address = tags['addr:full'] || tags['addr:suburb'] || tags['addr:city'] || 'Address details unavailable';
  }

  return {
    name,
    category,
    address,
    distance: distanceStr,
    description,
    lat,
    lng: lon
  };
}

app.post('/api/resources', async (req: Request, res: Response) => {
  try {
    const { location, identifiedNeeds } = req.body;
    if (!location) {
      return res.status(400).json({ error: "Location is required" });
    }

    console.log(`Searching resources for location: ${location}, needs: ${identifiedNeeds}`);
    const coords = await geocode(location);
    if (!coords) {
      return res.json({ resources: [] });
    }

    const elements = await fetchOverpassResources(coords.lat, coords.lon);
    
    // Determine user's target categories from identifiedNeeds
    const userCategories: ('Food Assistance' | 'Housing' | 'Medical' | 'Employment')[] = [];
    const needsLower: string[] = ((identifiedNeeds as string[]) || []).map((n: string) => n.toLowerCase());
    for (const need of needsLower) {
      if (need.includes('food') || need.includes('hunger') || need.includes('nutrition') || need.includes('assistance')) {
        if (need.includes('food') || need.includes('hunger') || need.includes('nutrition')) {
          if (!userCategories.includes('Food Assistance')) userCategories.push('Food Assistance');
        }
      }
      if (need.includes('housing') || need.includes('shelter') || need.includes('rent') || need.includes('homeless')) {
        if (!userCategories.includes('Housing')) userCategories.push('Housing');
      }
      if (need.includes('medical') || need.includes('health') || need.includes('clinic') || need.includes('doctor') || need.includes('hospital')) {
        if (!userCategories.includes('Medical')) userCategories.push('Medical');
      }
      if (need.includes('employment') || need.includes('job') || need.includes('work') || need.includes('career')) {
        if (!userCategories.includes('Employment')) userCategories.push('Employment');
      }
    }

    // Determine primary need
    const primaryNeed = userCategories[0] || null;

    const resources: SupportResource[] = [];
    for (const el of elements) {
      const tags = el.tags || {};
      const category = getResourceCategory(tags);
      if (!category) continue;

      const item = mapOverpassElement(el, coords.lat, coords.lon, category);
      if (item) {
        resources.push(item);
      }
    }

    const hasFoodResources = resources.some(r => r.category === 'Food Assistance');
    
    // Do not return hospitals (Medical resources) when primary need is food assistance unless no food resources are found
    let filteredResources = resources;
    if (primaryNeed === 'Food Assistance' && hasFoodResources) {
      filteredResources = resources.filter(r => r.category !== 'Medical');
    }

    // Rank results by relevance to primary need, then other user needs, then distance
    filteredResources.sort((a, b) => {
      // 1. Primary need match
      const aIsPrimary = a.category === primaryNeed;
      const bIsPrimary = b.category === primaryNeed;
      if (aIsPrimary && !bIsPrimary) return -1;
      if (!aIsPrimary && bIsPrimary) return 1;

      // 2. Matches other user needs
      const aInNeeds = userCategories.includes(a.category as any);
      const bInNeeds = userCategories.includes(b.category as any);
      if (aInNeeds && !bInNeeds) return -1;
      if (!aInNeeds && bInNeeds) return 1;

      // 3. Distance sorting (correct for m and km away)
      const distA = a.distance.includes('m away') && !a.distance.includes('km')
        ? parseFloat(a.distance) / 1000
        : parseFloat(a.distance);
      const distB = b.distance.includes('m away') && !b.distance.includes('km')
        ? parseFloat(b.distance) / 1000
        : parseFloat(b.distance);
      return distA - distB;
    });

    // Fallback message condition
    const fallbackActive = primaryNeed === 'Food Assistance' && !hasFoodResources && resources.length > 0;
    const fallbackMessage = fallbackActive 
      ? "No food assistance resources were found nearby. Showing other support services." 
      : null;

    res.json({ 
      resources: filteredResources.slice(0, 15),
      fallbackActive,
      fallbackMessage
    });
  } catch (error) {
    console.error("Resources API error:", error);
    res.status(500).json({ error: "Failed to fetch nearby resources" });
  }
});

export default app;
