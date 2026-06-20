# LifeLine AI 🆘✨

**Empowering crisis recovery with compassionate, human-centered AI guidance.**

LifeLine AI is a specialized AI caseworker platform designed to help individuals navigate sudden life changes—such as job loss or food insecurity—with clarity, dignity, and practical next steps. Built for the **USAII Global AI Hackathon**, this MVP demonstrates how large language models (LLMs) can move beyond simple chat and act as structured guides through the most difficult moments of a person's life.

---

## 🚀 The Vision: From Crisis to Clarity

Most government and non-profit benefit systems are overwhelming during a crisis. LifeLine AI bridges that gap by:
1. **Prioritizing Survival**: Identifying immediate needs like food and shelter before discussing long-term programs.
2. **Empathetic Assessment**: Using Google Gemini to provide a caseworker-like experience that validates the user's struggle.
3. **Actionable Planning**: Breaking down complex recovery into manageable "Today," "This Week," and "This Month" tasks.

---

## ✨ Key Features

- **Compassionate Crisis Assessment**: A live AI chat that listens to the user's situation and asks intelligent follow-up questions.
- **Immediate Support Matcher**: Real-time matching with local resources (food pantries, outreach centers) based on urgent needs.
- **Dynamic Program Guidance**: Matches users with specific benefits (SNAP, Unemployment, Rental Assistance) with "Strong Match" or "Possible Match" labels.
- **Personalized Recovery Plan**: A structured checklist of practical steps to rebuild stability.
- **Intelligent Document Insights**: Analyzes uploaded resumes to extract skills and identify immediate income opportunities and growth pathways.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **State/UI**: React 19, shadcn/ui, Tailwind CSS 4
- **Intelligence**: Google Generative AI SDK (Direct integration)
- **Icons**: Lucide React
- **Animations**: tw-animate-css

### Backend
- **Server**: Node.js / Express
- **Language**: TypeScript 6
- **Intelligence**: Google Gemini API (`gemini-2.5-flash`)
- **Environment**: dotenv, CORS

---

## 🚦 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- A Google Gemini API Key ([Get one here](https://ai.google.dev/))

### 2. Environment Setup
Copy the example environment file and add your API key:
```bash
cp .env.example .env
# Also copy to frontend and backend if running separately:
cp .env frontend/.env.local
cp .env backend/.env
```

### 3. Unified Setup (Recommended)
You can set up and run the entire project from the root directory:
```bash
# Install all dependencies (root, frontend, backend)
npm run install-all

# Start both frontend and backend in development mode
npm run dev
```

### 4. Manual Setup
If you prefer to run them separately:
**Backend:**
```bash
cd backend
npm install
npm run dev
```
**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

The application will be available at `http://localhost:3000`.

---

## 📂 Project Structure

```text
├── backend/            # Express server & Gemini integration
│   └── src/            # API routes and AI logic
├── frontend/           # Next.js application
│   └── src/
│       ├── app/        # Pages and layouts
│       ├── components/ # UI and shared components
│       └── data/       # Mock data and resource mappings
├── scripts/            # Validation and utility scripts
└── .env.example        # Template for environment variables
```

---

## 🧪 Automation & Validation

We include scripts to ensure the system is functioning correctly:
- `node scripts/check_models.js`: Verifies your Gemini API key and model access.
- `python scripts/final_validation.py`: Runs an end-to-end simulation of the AI assessment and API endpoints.

---

## 🛡️ Trust & Responsibility

LifeLine AI is designed to support, not replace, human judgment. The system includes:
- **Guided Support Badges**: Clear indicators that the AI is an assistant.
- **Emergency Escalation**: Immediate notices for users in physical danger.
- **Empowerment-First UI**: Focused on giving users the tools they need to make their own decisions.

---

## 🏆 Hackathon Context

This project was developed for the **USAII Global AI Hackathon** to showcase the potential of human-centered AI in social services and crisis management.

---

**LifeLine AI: One decision at a time.**
