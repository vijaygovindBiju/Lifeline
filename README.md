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
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui
- **Icons**: Lucide React
- **Animations**: Framer Motion / Tailwind Animate

### Backend
- **Server**: Node.js / Express
- **Intelligence**: Google Gemini API (gemini-3-flash)
- **Environment**: TypeScript, dotenv, CORS

---

## 🚦 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- A Google Gemini API Key ([Get one here](https://ai.google.dev/))

### 2. Backend Setup
```bash
cd backend
npm install
# Create a .env file and add your key:
# PORT=5000
# GEMINI_API_KEY=your_key_here
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
# Create a .env.local file and add your key:
# NEXT_PUBLIC_GEMINI_API_KEY=your_key_here
npm run dev
```

The application will be available at `http://localhost:3000`.

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
