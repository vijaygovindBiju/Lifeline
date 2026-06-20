"use client";

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { cn } from '@/lib/utils';
import { ProgressTracker } from '@/components/shared/ProgressTracker';
import { StepNavigation } from '@/components/shared/StepNavigation';
import { ChatBubble } from '@/components/shared/ChatBubble';
import { ResourceCard } from '@/components/shared/ResourceCard';
import { ProgramCard } from '@/components/shared/ProgramCard';
import { RecoveryChecklist } from '@/components/shared/RecoveryChecklist';
import { DocumentInsightCard } from '@/components/shared/DocumentInsightCard';
import { OpportunityCard } from '@/components/shared/OpportunityCard';
import { mockResources, mockPrograms, mockRecoveryPlan, mockDocumentInsight } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RecoveryJourneySidebar } from '@/components/shared/RecoveryJourneySidebar';
import { SessionHeader } from '@/components/shared/SessionHeader';
import { ImmediateSupport } from '@/components/shared/ImmediateSupport';
import { 
  AlertCircle, 
  ArrowRight, 
  Sparkles, 
  FileUp, 
  Send, 
  ShieldCheck, 
  Activity, 
  HeartHandshake, 
  ChevronDown, 
  Bot,
  ChevronRight,
  Menu,
  X,
  SendHorizontal
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const journeySteps = [
  { id: 1, label: 'Situation Shared' },
  { id: 2, label: 'Immediate Needs Assessed' },
  { id: 3, label: 'Support Resources' },
  { id: 4, label: 'Program Guidance' },
  { id: 5, label: 'Recovery Plan' },
  { id: 6, label: 'Document Insights' },
];

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

export default function LifeLineApp() {
  const [currentStep, setCurrentStep] = useState(1);
  const [initialInput, setInitialInput] = useState("");
  const [assessmentStep, setAssessmentStep] = useState(0);
  const [assessmentAnswers, setAssessmentAnswers] = useState<Record<string, string>>({});
  const [chatHistory, setChatHistory] = useState<{role: string, content: string}[]>([]);
  const [caseState, setCaseState] = useState<any>({
    currentSituation: "",
    primaryConcern: "",
    riskLevel: "medium",
    identifiedNeeds: [],
    answeredQuestions: [],
    currentStep: 1,
    category: "Crisis Assessment",
    assessmentData: {
      employment: "",
      foodSecurity: "",
      housing: "",
      dependents: "",
      medical: "",
      location: "",
      transportation: ""
    }
  });
  
  // AI Centralized State
  const [urgentNeeds, setUrgentNeeds] = useState<string[]>([]);
  const [dynamicQuestions, setDynamicQuestions] = useState<string[]>([]);
  const [reasoningSteps, setReasoningSteps] = useState([
    { id: 1, label: "Understanding situation", status: "pending" },
    { id: 2, label: "Identifying immediate needs", status: "pending" },
    { id: 3, label: "Assessing risk level", status: "pending" },
    { id: 4, label: "Prioritizing resources", status: "pending" },
    { id: 5, label: "Preparing guidance", status: "pending" },
  ]);
  const [showTransitionCTA, setShowTransitionCTA] = useState(false);

  const [isFinished, setIsFinished] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoadingPrograms, setIsLoadingPrograms] = useState(false);
  const [isLoadingPlan, setIsLoadingPlan] = useState(false);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
  const [recommendedPrograms, setRecommendedPrograms] = useState<any[]>([]);
  const [recoveryPlan, setRecoveryPlan] = useState<any>({ today: [], thisWeek: [], thisMonth: [] });
  const [docInsights, setDocInsights] = useState<any>(null);
  const [aiReasoning, setAiReasoning] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState("");
  const chatScrollRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
    if (currentStep === 2 && !isTyping) {
      inputRef.current?.focus();
    }
  }, [chatHistory, isTyping, currentStep]);

  const progressPercentage = currentStep <= 1 ? 0 : 
                             currentStep === 2 ? 25 :
                             currentStep === 3 ? 50 :
                             currentStep === 4 ? 70 :
                             currentStep === 5 ? 85 : 100;

  const nextStep = async () => {
    if (currentStep === 6) {
      setIsFinished(true);
    } else {
      const nextS = currentStep + 1;
      
      // Step 4: Program Guidance Integration
      if (nextS === 4) {
        setIsLoadingPrograms(true);
        setError(null);
        try {
          const response = await fetch(`${API_BASE_URL}/api/programs`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ situation: caseState.currentSituation || initialInput, answers: assessmentAnswers }),
          });
          const data = await response.json();
          if (data.error) {
            setError(data.error);
          }
          setRecommendedPrograms(data.programs || []);
        } catch (error) {
          console.error("Programs API Error:", error);
          setError("LifeLine is temporarily unable to generate guidance. Your information has been saved. Please try again in a moment.");
        } finally {
          setIsLoadingPrograms(false);
        }
      }

      // Step 5: Recovery Plan Integration
      if (nextS === 5) {
        setIsLoadingPlan(true);
        setError(null);
        try {
          const response = await fetch(`${API_BASE_URL}/api/recovery-plan`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ situation: caseState.currentSituation || initialInput }),
          });
          const data = await response.json();
          if (data.error) {
            setError(data.error);
          }
          setRecoveryPlan(data);
        } catch (error) {
          console.error("Plan API Error:", error);
          setError("LifeLine is temporarily unable to generate guidance. Your information has been saved. Please try again in a moment.");
        } finally {
          setIsLoadingPlan(false);
        }
      }
      
      setCurrentStep(nextS);
    }
    setIsMobileSidebarOpen(false);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      if (text) {
        await uploadResumeText(text);
      }
    };
    reader.readAsText(file);
  };

  const uploadResumeText = async (text: string) => {
    setIsLoadingInsights(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/document-insights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText: text }),
      });
      const data = await response.json();
      if (data.error) {
        setError(data.error);
      }
      setDocInsights(data);
      // Transition to insights screen
      setCurrentStep(6);
    } catch (error) {
      console.error("Insights API Error:", error);
      setError("LifeLine is temporarily unable to generate guidance. Your information has been saved. Please try again in a moment.");
    } finally {
      setIsLoadingInsights(false);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const simulateReasoning = async () => {
    const steps = [
      "Understanding situation",
      "Identifying immediate needs",
      "Assessing risk level",
      "Prioritizing resources",
      "Preparing guidance"
    ];
    
    for (let i = 0; i < steps.length; i++) {
      setReasoningSteps(prev => prev.map((step, idx) => ({
        ...step,
        status: idx < i ? "completed" : idx === i ? "active" : "pending"
      })));
      await new Promise(resolve => setTimeout(resolve, 600));
    }
    setReasoningSteps(prev => prev.map(step => ({ ...step, status: "completed" })));
  };

  const startJourney = async () => {
    setCurrentStep(2);
    setIsTyping(true);
    setError(null);
    simulateReasoning();
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/assess`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userMessage: initialInput,
          history: [],
          caseState: { ...caseState, currentSituation: initialInput }
        }),
      });
      
      const data = await response.json();
      
      if (data.error) throw new Error(data.error);

      setAiReasoning(data.reasoning);
      if (data.updatedCaseState) {
        setCaseState((prev: any) => ({
          ...prev,
          ...data.updatedCaseState,
          category: data.updatedCaseState.category || prev.category || "Crisis Assessment",
          assessmentData: {
            ...prev.assessmentData,
            ...data.updatedCaseState.assessmentData
          }
        }));
      }
      
      const combinedMsg = `${data.acknowledgment || ''} ${data.response || ''}`.trim();
      setChatHistory([{ role: 'assistant', content: combinedMsg }]);
      
      if (data.nextQuestions && data.nextQuestions.length > 0) {
        setDynamicQuestions(data.nextQuestions);
      } else {
        setShowTransitionCTA(true);
      }
    } catch (error) {
      console.error("Assessment Error:", error);
      const fallbackMsg = "LifeLine is temporarily unable to generate guidance. Your information has been saved. Please try again in a moment.";
      setChatHistory([{ role: 'assistant', content: fallbackMsg }]);
    } finally {
      setIsTyping(false);
    }
  };

  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const handleAssessmentAnswer = async (answer: string) => {
    if (!answer.trim()) return;
    setChatInput("");
    setError(null);
    
    setChatHistory(prev => [
      ...prev,
      { role: 'user', content: answer }
    ]);
    setIsTyping(true);
    simulateReasoning();

    try {
      const response = await fetch(`${API_BASE_URL}/api/assess`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userMessage: answer,
          history: chatHistory.slice(-10),
          caseState: caseState
        }),
      });
      
      const data = await response.json();
      
      setIsTyping(false);
      setAiReasoning(data.reasoning);
      if (data.updatedCaseState) {
        setCaseState((prev: any) => ({
          ...prev,
          ...data.updatedCaseState,
          category: data.updatedCaseState.category || prev.category || "Crisis Assessment",
          assessmentData: {
            ...prev.assessmentData,
            ...data.updatedCaseState.assessmentData
          }
        }));
      }
      
      const combinedMsg = `${data.acknowledgment || ''} ${data.response || ''}`.trim();
      setChatHistory(prev => [
        ...prev,
        { role: 'assistant', content: combinedMsg }
      ]);

      if (data.nextQuestions && data.nextQuestions.length > 0) {
        setDynamicQuestions(data.nextQuestions);
      } else {
        setShowTransitionCTA(true);
      }
    } catch (error) {
      console.error("Assessment Answer Error:", error);
      setIsTyping(false);
      setChatHistory(prev => [
        ...prev,
        { role: 'assistant', content: "LifeLine is temporarily unable to generate guidance. Your information has been saved. Please try again in a moment." }
      ]);
    }
  };

  // Screen 1: Welcome
  const renderWelcome = () => (
    <div className="max-w-4xl mx-auto space-y-12 pt-2 pb-16 animate-in fade-in duration-700">
      <div className="text-center space-y-6">
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-blue-900 tracking-tighter leading-none">
          LifeLine AI
        </h1>
        <div className="space-y-4 max-w-2xl mx-auto">
          <p className="text-xl md:text-2xl text-blue-600 font-bold italic">
            "From crisis to clarity, one decision at a time."
          </p>
          <div className="space-y-2">
            <p className="text-gray-600 text-lg leading-relaxed">
              Need help right now? Start by telling us what's happening. We'll guide you through your next steps.
            </p>
            <p className="text-gray-400 text-sm max-w-md mx-auto">
              When life changes suddenly, you shouldn't have to navigate it alone.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto space-y-8 bg-white p-8 md:p-10 rounded-[3rem] shadow-[0_20px_50px_rgba(37,99,235,0.15)] border border-blue-50/50 relative overflow-hidden transition-all duration-500">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-400 via-blue-600 to-blue-400" />
        
        <div className="space-y-6">
          <div className="space-y-3">
            <p className="text-sm font-bold text-blue-900/40 uppercase tracking-widest ml-1">Tell us what happened in your own words</p>
            <div className="relative group">
              <Textarea 
                placeholder="e.g., I lost my job and haven't eaten today..." 
                className="min-h-[180px] text-lg p-6 rounded-[2rem] border-2 border-slate-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all bg-slate-50/30 resize-none shadow-inner"
                value={initialInput}
                onChange={(e) => setInitialInput(e.target.value)}
              />
              <p className="text-[10px] md:text-xs text-slate-400 mt-2 ml-4 italic">
                You can share as much or as little as you're comfortable with.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold text-slate-400 ml-1">Or select a starting point:</p>
            <div className="flex flex-wrap gap-2">
              {["I lost my job.", "I haven't eaten today.", "I'm worried about paying my bills."].map((prompt) => (
                <button 
                  key={prompt}
                  onClick={() => setInitialInput(prompt)}
                  className="text-sm font-medium py-3 px-6 rounded-full bg-white text-slate-600 border border-slate-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 hover:shadow-md hover:scale-[1.03] active:scale-[0.97] transition-all duration-200"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <Button 
              onClick={startJourney}
              disabled={!initialInput}
              className="w-full h-18 text-xl font-extrabold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-[1.5rem] shadow-xl shadow-blue-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl active:scale-[0.98] disabled:opacity-50"
            >
              Help Me Find My Next Step <ArrowRight className="ml-3 w-6 h-6" />
            </Button>
            <p className="text-[10px] text-gray-400 text-center px-8">
              We provide guidance and next steps. Official eligibility should always be confirmed through trusted sources.
            </p>
          </div>
        </div>
      </div>

      {/* How LifeLine Helps Section */}
      <div id="how-it-works" className="pt-16 space-y-10">
        <div className="text-center">
          <h3 className="text-2xl font-extrabold text-slate-800 tracking-tight">How LifeLine Helps</h3>
          <div className="w-16 h-1 bg-blue-600 mx-auto mt-3 rounded-full" />
        </div>
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0 relative">
          <div className="w-full md:w-[30%] bg-white p-8 rounded-[2.5rem] border border-blue-50 shadow-sm space-y-4 relative z-10 text-center transition-all duration-300 hover:shadow-xl hover:border-blue-100 hover:-translate-y-1 group">
            <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto transition-transform group-hover:scale-110">
              <HeartHandshake className="w-7 h-7" />
            </div>
            <div className="space-y-2">
              <h4 className="font-bold text-slate-800 text-lg">Immediate Support</h4>
              <p className="text-sm text-slate-500 leading-relaxed">Food assistance and urgent resources when you need them most.</p>
            </div>
          </div>

          <div className="md:hidden">
            <ChevronDown className="w-6 h-6 text-blue-200 animate-bounce" />
          </div>
          <div className="hidden md:block w-8 h-0.5 bg-gradient-to-r from-blue-100 to-blue-50" />

          <div className="w-full md:w-[30%] bg-white p-8 rounded-[2.5rem] border border-blue-50 shadow-sm space-y-4 relative z-10 text-center transition-all duration-300 hover:shadow-xl hover:border-blue-100 hover:-translate-y-1 group">
            <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto transition-transform group-hover:scale-110">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div className="space-y-2">
              <h4 className="font-bold text-slate-800 text-lg">Stability Planning</h4>
              <p className="text-sm text-slate-500 leading-relaxed">Programs and guidance tailored to your specific situation.</p>
            </div>
          </div>

          <div className="md:hidden">
            <ChevronDown className="w-6 h-6 text-blue-200 animate-bounce" />
          </div>
          <div className="hidden md:block w-8 h-0.5 bg-gradient-to-r from-blue-50 to-blue-100" />

          <div className="w-full md:w-[30%] bg-white p-8 rounded-[2.5rem] border border-blue-50 shadow-sm space-y-4 relative z-10 text-center transition-all duration-300 hover:shadow-xl hover:border-blue-100 hover:-translate-y-1 group">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto transition-transform group-hover:scale-110">
              <Activity className="w-7 h-7" />
            </div>
            <div className="space-y-2">
              <h4 className="font-bold text-slate-800 text-lg">Recovery Planning</h4>
              <p className="text-sm text-slate-500 leading-relaxed">Clear next steps to help you move forward with confidence.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Screen 2: Crisis Assessment
  const renderAssessment = () => {
    const questions = dynamicQuestions;

    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 animate-in fade-in slide-in-from-right-8 duration-700">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[2.5rem] shadow-[0_15px_40px_rgba(0,0,0,0.04)] border border-slate-100 h-[600px] flex flex-col overflow-hidden relative">
            <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
                  <Bot className="text-white w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">LifeLine Assistant</h4>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Support</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-8 space-y-2 scroll-smooth">
              <ChatBubble role="user" content={initialInput} />
              {chatHistory.map((msg, i) => (
                <ChatBubble key={i} role={msg.role as any} content={msg.content} />
              ))}
              {isTyping && (
                <div className="flex justify-start mb-6 animate-in fade-in duration-300">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-2xl bg-blue-600 flex items-center justify-center text-white">
                      <Bot className="w-5 h-5" />
                    </div>
                    <div className="px-5 py-4 bg-slate-50 border border-slate-100 rounded-[1.5rem] rounded-bl-none flex gap-1 shadow-sm">
                      <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-50 bg-slate-50/50 space-y-4">
              {dynamicQuestions.length > 0 && !isTyping && (
                <div className="flex flex-wrap gap-2 justify-center animate-in fade-in slide-in-from-bottom-2 duration-500">
                  {dynamicQuestions.map((choice) => (
                    <button
                      key={choice}
                      onClick={() => handleAssessmentAnswer(choice)}
                      className="px-6 py-2 rounded-full bg-white text-blue-600 border border-blue-100 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all text-sm font-bold shadow-sm"
                    >
                      {choice}
                    </button>
                  ))}
                </div>
              )}
              
              <div className="relative group">
                <input
                  ref={inputRef}
                  type="text"
                  placeholder={isTyping ? "LifeLine is preparing a response..." : "Type your response..."}
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !isTyping) {
                      handleAssessmentAnswer(chatInput);
                    }
                  }}
                  className="w-full h-14 pl-6 pr-14 rounded-2xl border-2 border-slate-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all bg-white shadow-sm text-[15px] font-medium placeholder:text-slate-400 disabled:bg-slate-50"
                />
                <Button
                  size="icon"
                  disabled={!chatInput.trim() || isTyping}
                  onClick={() => handleAssessmentAnswer(chatInput)}
                  className="absolute right-2 top-2 h-10 w-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-100 transition-all active:scale-95 disabled:bg-slate-200 disabled:shadow-none"
                >
                  <SendHorizontal className="w-5 h-5" />
                </Button>
              </div>
              {isTyping && (
                <p className="text-[10px] text-center text-blue-600 font-bold animate-pulse uppercase tracking-widest">
                  Please wait while your caseworker reviews your situation...
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {(isTyping || aiReasoning) && (
            <Card className="rounded-[2rem] border-blue-100 bg-blue-50/30 p-6 space-y-4 animate-in fade-in slide-in-from-right-4 duration-500 shadow-sm overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-slate-100 overflow-hidden">
                {isTyping && <div className="h-full bg-blue-600 animate-progress origin-left" />}
              </div>
              
              <div className="flex items-center gap-2 text-blue-900 font-bold text-[10px] uppercase tracking-widest">
                <Activity className={cn("w-3.5 h-3.5 text-blue-600", isTyping && "animate-pulse")} />
                {isTyping ? "AI Caseworker Reviewing Situation" : "Assessment Summary"}
              </div>

              {isTyping ? (
                <div className="space-y-3 pt-2">
                  {reasoningSteps.map((step) => (
                    <div key={step.id} className="flex items-center gap-3 transition-all duration-300">
                      <div className={cn(
                        "w-2 h-2 rounded-full transition-all duration-500",
                        step.status === 'completed' ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" :
                        step.status === 'active' ? "bg-amber-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.5)]" : "bg-slate-200"
                      )} />
                      <span className={cn(
                        "text-[11px] font-bold tracking-tight transition-colors duration-300",
                        step.status === 'completed' ? "text-emerald-600" :
                        step.status === 'active' ? "text-amber-600" : "text-slate-400"
                      )}>
                        {step.label}
                      </span>
                    </div>
                  ))}
                </div>
              ) : aiReasoning && (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Primary Concern</p>
                    <p className="text-sm font-bold text-blue-900 capitalize">{aiReasoning.primaryConcern}</p>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Risk Assessment</p>
                    <Badge className={cn(
                      "font-bold px-2.5 py-0.5 rounded-full text-[10px] border-none shadow-none uppercase tracking-wider",
                      aiReasoning.riskLevel === 'high' ? "bg-red-100 text-red-600" :
                      aiReasoning.riskLevel === 'medium' ? "bg-amber-100 text-amber-600" : "bg-emerald-100 text-emerald-600"
                    )}>
                      {aiReasoning.riskLevel} Risk
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Identified Needs</p>
                    <div className="flex flex-wrap gap-1.5">
                      {aiReasoning.identifiedNeeds.map((need: string, i: number) => (
                        <Badge key={i} variant="outline" className="text-[9px] py-0 px-2 font-bold bg-white border-slate-200 text-slate-500 rounded-md">
                          {need}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  {caseState.assessmentData && Object.values(caseState.assessmentData).some(v => !!v) && (
                    <div className="space-y-2 pt-2 border-t border-blue-100/50">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Verified Facts</p>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                        {Object.entries(caseState.assessmentData).map(([key, value]) => value ? (
                          <div key={key} className="flex items-center gap-1.5">
                            <div className="w-1 h-1 rounded-full bg-emerald-500" />
                            <span className="text-[9px] font-bold text-slate-500 capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                            <span className="text-[9px] font-medium text-blue-900 truncate">{value as string}</span>
                          </div>
                        ) : null)}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Card>
          )}

          {showTransitionCTA && !isTyping && (
            <Card className="rounded-[2rem] border-none bg-gradient-to-br from-blue-600 to-blue-800 p-8 text-white space-y-6 shadow-xl shadow-blue-200 animate-in zoom-in-95 duration-500">
              <div className="space-y-2">
                <h4 className="text-xl font-bold tracking-tight">Assessment Complete</h4>
                <p className="text-blue-100 text-sm leading-relaxed">
                  I have gathered enough information to identify relevant resources and programs for your situation.
                </p>
              </div>
              <Button 
                onClick={() => {
                  setShowTransitionCTA(false);
                  nextStep();
                }}
                className="w-full bg-white text-blue-700 hover:bg-blue-50 h-12 rounded-xl font-bold flex items-center justify-center gap-2 group"
              >
                Show Nearby Resources
                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Card>
          )}

          <Card className="rounded-[2.5rem] border-none shadow-2xl shadow-blue-200/40 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white overflow-hidden p-8 space-y-6">
            <div className="space-y-2">
              <h3 className="font-extrabold text-2xl tracking-tight">Urgency Assessment</h3>
              <p className="text-blue-100 text-sm leading-relaxed">
                We're checking for immediate risks to ensure you get the right support right away.
              </p>
            </div>
            
            <div className="space-y-4 pt-4">
              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-blue-200 uppercase tracking-widest">Progress</p>
                  <p className="text-3xl font-black">{Math.round(((assessmentStep + (isTyping ? 0.5 : 0)) / 3) * 100)}%</p>
                </div>
                <p className="text-sm font-bold text-blue-200">Step {assessmentStep + 1} of 3</p>
              </div>
              <div className="h-3 bg-white/20 rounded-full overflow-hidden p-1 shadow-inner">
                <div 
                  className="h-full bg-white rounded-full transition-all duration-700 ease-out shadow-[0_0_15px_rgba(255,255,255,0.5)]" 
                  style={{ width: `${((assessmentStep + (isTyping ? 0.5 : 0)) / 3) * 100}%` }}
                />
              </div>
            </div>

            <div className="pt-6 border-t border-white/10 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-white" />
                </div>
                <p className="text-xs font-medium text-blue-50">Private & Secure</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                  <Activity className="w-4 h-4 text-white" />
                </div>
                <p className="text-xs font-medium text-blue-50">Real-time matching</p>
              </div>
            </div>
          </Card>

          <div className="bg-amber-50 border border-amber-100 rounded-[2rem] p-6 space-y-3 shadow-sm shadow-amber-100/50">
            <div className="flex items-center gap-2 text-amber-700 font-bold text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              Emergency Notice
            </div>
            <p className="text-xs text-amber-800/80 leading-relaxed">
              If you are in immediate physical danger or have a medical emergency, please call **911** or your local emergency services immediately.
            </p>
          </div>
        </div>
      </div>
    );
  };

  // Screen 3: Immediate Support
  const renderSupport = () => (
    <ImmediateSupport 
      onNext={nextStep} 
      onBack={prevStep} 
      location={caseState.assessmentData?.location || ""}
      identifiedNeeds={caseState.identifiedNeeds || []}
    />
  );

  // Screen 4: Programs That May Help
  const renderPrograms = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-blue-900">Programs That May Help</h2>
        <p className="text-gray-500">Based on your situation, these programs offer the best chance of support.</p>
      </div>

      {isLoadingPrograms ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => (
            <div key={i} className="h-64 bg-white rounded-3xl animate-pulse border border-slate-100" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendedPrograms.map((program, idx) => (
            <ProgramCard key={idx} program={{
              id: `api-${idx}`,
              name: program.name,
              description: program.reason,
              recommendationReason: program.reason,
              requirements: program.documents,
              confidence: program.match.toLowerCase().includes('strong') ? 'high' : 
                          program.match.toLowerCase().includes('possible') ? 'medium' : 'low',
              link: '#'
            }} />
          ))}
        </div>
      )}

      <div className="bg-slate-100 p-4 rounded-xl text-center">
        <p className="text-xs text-slate-500 font-medium italic">
          "This guidance is informational and should be verified through official sources."
        </p>
      </div>

      <StepNavigation onNext={nextStep} onBack={prevStep} />
    </div>
  );

  // Screen 5: Recovery Plan
  const renderRecovery = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center space-y-4 mb-12">
        <h2 className="text-4xl font-extrabold text-blue-900 tracking-tight">Your Recovery Plan</h2>
        <div className="space-y-1">
          <p className="text-lg text-blue-600 font-medium italic">"One step at a time. You've got this."</p>
          <p className="text-sm text-slate-500 font-medium">"You don't have to solve everything today. Let's focus on the next right step."</p>
        </div>
      </div>

      {isLoadingPlan ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {[1,2,3].map(i => (
            <div key={i} className="h-96 bg-white rounded-3xl animate-pulse border border-slate-100" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <RecoveryChecklist timeframe="today" title="Today" steps={(recoveryPlan.today || []).map((s: any, i: number) => ({ ...s, id: `today-${i}`, timeframe: 'today', completed: false }))} />
          <RecoveryChecklist timeframe="week" title="This Week" steps={(recoveryPlan.thisWeek || []).map((s: any, i: number) => ({ ...s, id: `week-${i}`, timeframe: 'week', completed: false }))} />
          <RecoveryChecklist timeframe="month" title="This Month" steps={(recoveryPlan.thisMonth || []).map((s: any, i: number) => ({ ...s, id: `month-${i}`, timeframe: 'month', completed: false }))} />
        </div>
      )}

      <div className="bg-blue-600 rounded-3xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-blue-200">
        <div className="space-y-2 text-center md:text-left">
          <h3 className="text-2xl font-bold">Upload Documents for Better Insights</h3>
          {selectedFile ? (
            <p className="opacity-95 font-medium flex items-center gap-2">
              📄 Selected file: <span className="underline">{selectedFile.name}</span>
            </p>
          ) : (
            <p className="opacity-90">Upload your resume or letters to unlock tailored job opportunities.</p>
          )}
        </div>
        <div className="flex items-center gap-4">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept=".txt" 
            className="hidden" 
          />
          <Button 
            onClick={triggerFileSelect}
            disabled={isLoadingInsights}
            className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-6 rounded-2xl font-bold text-lg flex items-center gap-2"
          >
            {isLoadingInsights ? "Analyzing..." : <><FileUp className="w-6 h-6" /> Upload Now</>}
          </Button>
        </div>
      </div>

      <StepNavigation onNext={nextStep} onBack={prevStep} nextLabel="View Document Insights" />
    </div>
  );

  // Screen 6: Document Insights
  const renderInsights = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-blue-900 flex items-center gap-3">
          <Sparkles className="w-8 h-8 text-blue-500" />
          Document Insights
        </h2>
        <p className="text-gray-500">We've analyzed your documents to find the best paths forward.</p>
      </div>

      {docInsights ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <DocumentInsightCard insight={{
              id: 'api-doc',
              fileName: 'Extracted Resume Data',
              skills: docInsights.skills,
              experience: docInsights.experience,
              opportunities: {
                temporary: docInsights.temporaryOpportunities,
                growth: docInsights.growthOpportunities
              }
            }} />
            <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl">
               <p className="text-xs text-blue-700 font-medium leading-relaxed">
                "These suggestions are based on the information you shared and are intended to support—not replace—your own judgment."
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-blue-900 flex items-center gap-2">
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">Immediate</Badge>
                Temporary Opportunities
              </h3>
              <div className="grid gap-3">
                {docInsights.temporaryOpportunities.map((opp: any, i: number) => (
                  <OpportunityCard key={i} title={opp} type="temporary" />
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-bold text-blue-900 flex items-center gap-2">
                <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">Future</Badge>
                Growth Opportunities
              </h3>
              <div className="grid gap-3">
                {docInsights.growthOpportunities.map((opp: any, i: number) => (
                  <OpportunityCard key={i} title={opp} type="growth" />
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-[2rem] border-2 border-dashed border-slate-200">
           <p className="text-slate-400 font-medium">Please upload a document on the previous screen to see insights.</p>
           <Button variant="ghost" onClick={prevStep} className="mt-4 text-blue-600 font-bold">Go Back</Button>
        </div>
      )}

      {!isFinished && <StepNavigation onBack={prevStep} isLast nextLabel="Finish" />}
    </div>
  );

  const renderContent = () => {
    if (isFinished) {
      return (
        <div className="space-y-16 animate-in fade-in duration-1000">
          {renderInsights()}
          
          <div className="bg-white rounded-[3rem] p-10 md:p-16 text-center border border-blue-50 shadow-[0_30px_60px_rgba(37,99,235,0.06)] space-y-10 animate-in slide-in-from-bottom-12 duration-1000 delay-300">
            <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl shadow-emerald-100/50">
              <Sparkles className="w-12 h-12" />
            </div>
            <div className="space-y-4">
              <h2 className="text-5xl font-extrabold text-blue-900 tracking-tight leading-none">Recovery Journey Complete</h2>
              <div className="space-y-2">
                <p className="text-xl text-gray-600 leading-relaxed max-w-lg mx-auto italic font-medium">
                  "You've taken important steps toward rebuilding stability. Recovery happens one decision at a time."
                </p>
                <p className="text-blue-600 font-bold tracking-tight uppercase text-xs">
                  Remember: seeking support is a sign of strength.
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
              <Button 
                onClick={() => {
                  setIsFinished(false);
                  setCurrentStep(1);
                  setInitialInput("");
                  setAssessmentStep(0);
                  setAssessmentAnswers({});
                  setError(null);
                  setChatHistory([{ role: 'assistant', content: "I'm sorry you're going through this. Before anything else, let's address your immediate needs." }]);
                }}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 h-16 px-10 rounded-2xl font-bold text-lg shadow-lg shadow-blue-200 transition-all hover:-translate-y-1"
              >
                Start a New Recovery Journey
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  setIsFinished(false);
                  setCurrentStep(1);
                  setInitialInput("");
                  setAssessmentStep(0);
                  setAssessmentAnswers({});
                  setError(null);
                  setChatHistory([{ role: 'assistant', content: "I'm sorry you're going through this. Before anything else, let's address your immediate needs." }]);
                }}
                className="w-full sm:w-auto h-16 px-10 rounded-2xl font-bold text-lg border-2 hover:bg-slate-50 transition-all"
              >
                Return Home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    switch (currentStep) {
      case 1: return renderWelcome();
      case 2: return renderAssessment();
      case 3: return renderSupport();
      case 4: return renderPrograms();
      case 5: return renderRecovery();
      case 6: return renderInsights();
      default: return renderWelcome();
    }
  };

  if (currentStep === 1 && !isFinished) {
    return (
      <AppLayout>
        {renderWelcome()}
      </AppLayout>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden font-sans text-slate-900">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-80 h-screen sticky top-0 shrink-0">
        <RecoveryJourneySidebar 
          steps={journeySteps} 
          currentStep={currentStep} 
          onStepClick={(id) => setCurrentStep(id)}
          isFinished={isFinished}
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsMobileSidebarOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-80 bg-white animate-in slide-in-from-left duration-300">
            <div className="p-4 flex justify-end border-b border-slate-50">
              <Button variant="ghost" size="icon" onClick={() => setIsMobileSidebarOpen(false)}>
                <X className="w-6 h-6 text-slate-400" />
              </Button>
            </div>
            <RecoveryJourneySidebar 
              steps={journeySteps} 
              currentStep={currentStep} 
              onStepClick={(id) => {
                setCurrentStep(id);
                setIsMobileSidebarOpen(false);
              }}
              isFinished={isFinished}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header Toggle */}
        <div className="lg:hidden bg-white border-b border-slate-100 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
             <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Sparkles className="text-white w-5 h-5" />
            </div>
            <span className="font-bold text-lg tracking-tight text-slate-800">LifeLine AI</span>
          </div>
          <Button variant="outline" size="sm" onClick={() => setIsMobileSidebarOpen(true)} className="flex items-center gap-2">
            <Menu className="w-4 h-4" /> Journey
          </Button>
        </div>

        <SessionHeader 
          sessionTitle="Current Recovery Session"
          category={caseState.category || "Crisis Assessment"}
          progress={progressPercentage}
        />
        <div className="px-8 mt-2 flex gap-2">
          <Badge variant="secondary" className="bg-blue-100/50 text-blue-600 border-none font-bold px-3 py-1 rounded-full">
            Guided Support
          </Badge>
        </div>
        
        <div className="flex-1 overflow-y-auto bg-slate-50/30">
          <div className="max-w-5xl mx-auto px-6 py-10">
            {error && (
              <Alert variant="destructive" className="mb-6 rounded-2xl animate-in slide-in-from-top-4 duration-300">
                <AlertCircle className="h-4 h-4" />
                <AlertTitle>Notice</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {renderContent()}
          </div>
        </div>

        <footer className="bg-white border-t border-slate-100 py-6 px-8 text-center">
          <p className="text-slate-400 text-xs font-medium max-w-2xl mx-auto leading-relaxed">
            LifeLine AI exists to help people navigate difficult moments with clarity, dignity, and practical next steps.
          </p>
        </footer>
      </div>
    </div>
  );
}
