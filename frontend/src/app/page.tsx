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
  SendHorizontal,
  CheckCircle2,
  MapPin
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
    rootCause: "",
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

  const [recoverySteps, setRecoverySteps] = useState<any[]>([]);

  const toggleRecoveryStep = (stepId: string) => {
    setRecoverySteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, completed: !step.completed } : step
    ));
  };
  
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

  const progressPercentage = (() => {
    if (currentStep <= 1) return 0;
    if (currentStep === 2) return 25;
    if (currentStep === 3) return 50;
    if (currentStep === 4) return 70;
    if (currentStep === 5) {
      if (recoverySteps.length === 0) return 85;
      const completedCount = recoverySteps.filter(s => s.completed).length;
      return Math.round(85 + (completedCount / recoverySteps.length) * 10);
    }
    if (isFinished) return 100;
    if (currentStep === 6) {
      if (recoverySteps.length === 0) return 95;
      const completedCount = recoverySteps.filter(s => s.completed).length;
      return Math.round(95 + (completedCount / recoverySteps.length) * 5);
    }
    return 100;
  })();

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

          // Formatted checklist items state
          const formattedSteps: any[] = [];
          if (data.today) {
            data.today.forEach((s: any, i: number) => {
              formattedSteps.push({ ...s, id: `today-${i}`, timeframe: 'today', completed: false });
            });
          }
          if (data.thisWeek) {
            data.thisWeek.forEach((s: any, i: number) => {
              formattedSteps.push({ ...s, id: `week-${i}`, timeframe: 'week', completed: false });
            });
          }
          if (data.thisMonth) {
            data.thisMonth.forEach((s: any, i: number) => {
              formattedSteps.push({ ...s, id: `month-${i}`, timeframe: 'month', completed: false });
            });
          }
          setRecoverySteps(formattedSteps);
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
    <div className="max-w-4xl mx-auto space-y-6 pt-2 pb-10 animate-in fade-in duration-700">
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-blue-900 tracking-tighter leading-none">
          LifeLine AI
        </h1>
        <div className="space-y-2 max-w-2xl mx-auto">
          <p className="text-lg md:text-xl text-blue-600 font-bold italic">
            "From crisis to clarity, one decision at a time."
          </p>
          <div className="space-y-1">
            <p className="text-gray-600 text-base leading-relaxed">
              Need help right now? Start by telling us what's happening. We'll guide you through your next steps.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto space-y-5 bg-white p-6 md:p-8 rounded-[2rem] shadow-[0_15px_40px_rgba(37,99,235,0.1)] border border-blue-50/50 relative overflow-hidden transition-all duration-500">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 via-blue-600 to-blue-400" />
        
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-xs font-bold text-blue-900/40 uppercase tracking-widest ml-1">Tell us what happened in your own words</p>
            <div className="relative group">
              <Textarea 
                placeholder="e.g., I lost my job and haven't eaten today..." 
                className="min-h-[130px] text-base p-4 rounded-[1.5rem] border-2 border-slate-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all bg-slate-50/30 resize-none shadow-inner"
                value={initialInput}
                onChange={(e) => setInitialInput(e.target.value)}
              />
              <p className="text-[10px] text-slate-400 mt-1.5 ml-2 italic">
                You can share as much or as little as you're comfortable with.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-[10px] font-semibold text-slate-400 ml-1">Or select a starting point:</p>
            <div className="flex flex-wrap gap-1.5">
              {["I lost my job.", "I haven't eaten today.", "I'm worried about paying my bills."].map((prompt) => (
                <button 
                  key={prompt}
                  onClick={() => setInitialInput(prompt)}
                  className="text-xs font-semibold py-2 px-4 rounded-full bg-white text-slate-600 border border-slate-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 hover:shadow-sm transition-all duration-200"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={startJourney}
              disabled={!initialInput}
              className="w-full h-12 text-base font-extrabold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-[1.25rem] shadow-lg shadow-blue-200 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl active:scale-[0.98] disabled:opacity-50"
            >
              Help Me Find My Next Step <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <p className="text-[10px] text-gray-400 text-center px-4">
              We provide guidance and next steps. Official eligibility should always be confirmed through trusted sources.
            </p>
          </div>
        </div>
      </div>

      {/* How LifeLine Helps Section */}
      <div id="how-it-works" className="pt-8 space-y-6">
        <div className="text-center">
          <h3 className="text-xl font-extrabold text-slate-800 tracking-tight">How LifeLine Helps</h3>
          <div className="w-12 h-1 bg-blue-600 mx-auto mt-2 rounded-full" />
        </div>
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 relative">
          <div className="w-full md:w-[32%] bg-white p-5 rounded-[1.5rem] border border-blue-50 shadow-sm space-y-3 text-center transition-all duration-300 hover:shadow-md hover:border-blue-100 hover:-translate-y-0.5 group">
            <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center mx-auto transition-transform group-hover:scale-110">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-slate-800 text-base">Immediate Support</h4>
              <p className="text-xs text-slate-500 leading-relaxed">Food assistance and urgent resources when you need them most.</p>
            </div>
          </div>

          <div className="md:hidden">
            <ChevronDown className="w-4 h-4 text-blue-200 animate-bounce" />
          </div>

          <div className="w-full md:w-[32%] bg-white p-5 rounded-[1.5rem] border border-blue-50 shadow-sm space-y-3 text-center transition-all duration-300 hover:shadow-md hover:border-blue-100 hover:-translate-y-0.5 group">
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mx-auto transition-transform group-hover:scale-110">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-slate-800 text-base">Stability Planning</h4>
              <p className="text-xs text-slate-500 leading-relaxed">Programs and guidance tailored to your specific situation.</p>
            </div>
          </div>

          <div className="md:hidden">
            <ChevronDown className="w-4 h-4 text-blue-200 animate-bounce" />
          </div>

          <div className="w-full md:w-[32%] bg-white p-5 rounded-[1.5rem] border border-blue-50 shadow-sm space-y-3 text-center transition-all duration-300 hover:shadow-md hover:border-blue-100 hover:-translate-y-0.5 group">
            <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mx-auto transition-transform group-hover:scale-110">
              <Activity className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-slate-800 text-base">Recovery Planning</h4>
              <p className="text-xs text-slate-500 leading-relaxed">Clear next steps to help you move forward with confidence.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Screen 2: Crisis Assessment
  const renderAssessment = () => {
    const questions = dynamicQuestions;
    const situation = (caseState.currentSituation || initialInput || "").toLowerCase();
    const riskLevel = (aiReasoning?.riskLevel || caseState.riskLevel || "").toLowerCase();
    const isHighRisk = riskLevel === 'high';
    const hasSevereKeywords = situation.includes("suicide") || 
                              situation.includes("harm") || 
                              situation.includes("abuse") || 
                              situation.includes("violence") || 
                              situation.includes("medical") || 
                              situation.includes("danger") ||
                              situation.includes("hurt");
    const showEmergencyNotice = isHighRisk || hasSevereKeywords;
    const isComplete = showTransitionCTA && !isTyping;

    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in slide-in-from-right-8 duration-700">
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white rounded-[1.5rem] shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-slate-100 h-[480px] flex flex-col overflow-hidden relative">
            <div className="p-4 border-b border-slate-50 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-200">
                  <Bot className="text-white w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-800">LifeLine Assistant</h4>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Active Support</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-5 space-y-1.5 scroll-smooth">
              <ChatBubble role="user" content={initialInput} />
              {chatHistory.map((msg, i) => (
                <ChatBubble key={i} role={msg.role as any} content={msg.content} />
              ))}
              {isTyping && (
                <div className="flex justify-start mb-4 animate-in fade-in duration-300">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="px-4 py-3 bg-slate-50 border border-slate-100 rounded-[1.25rem] rounded-bl-none flex gap-1 shadow-sm">
                      <div className="w-1 h-1 bg-slate-300 rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <div className="w-1 h-1 bg-slate-300 rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <div className="w-1 h-1 bg-slate-300 rounded-full animate-bounce" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-50 bg-slate-50/50 space-y-3">
              {dynamicQuestions.length > 0 && !isTyping && (
                <div className="flex flex-wrap gap-1.5 justify-center animate-in fade-in slide-in-from-bottom-2 duration-500">
                  {dynamicQuestions.map((choice) => (
                    <button
                      key={choice}
                      onClick={() => handleAssessmentAnswer(choice)}
                      className="px-4 py-1.5 rounded-full bg-white text-blue-600 border border-blue-100 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all text-xs font-bold shadow-sm"
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
                  className="w-full h-11 pl-4 pr-12 rounded-xl border-2 border-slate-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all bg-white shadow-sm text-xs font-medium placeholder:text-slate-400 disabled:bg-slate-50"
                />
                <Button
                  size="icon"
                  disabled={!chatInput.trim() || isTyping}
                  onClick={() => handleAssessmentAnswer(chatInput)}
                  className="absolute right-1.5 top-1.5 h-8 w-8 rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-100 transition-all active:scale-95 disabled:bg-slate-200 disabled:shadow-none"
                >
                  <SendHorizontal className="w-4 h-4" />
                </Button>
              </div>
              {isTyping && (
                <p className="text-[9px] text-center text-blue-600 font-bold animate-pulse uppercase tracking-widest">
                  Please wait while your caseworker reviews your situation...
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-4">
          <Card className="rounded-[1.5rem] border-blue-100 bg-white p-4 space-y-3.5 shadow-sm relative overflow-hidden">
            {/* Top section: Header & Status Badge */}
            <div className="flex items-center justify-between border-b border-slate-50 pb-2">
              <div className="flex items-center gap-1.5 text-blue-900 font-bold text-[10px] uppercase tracking-widest">
                <Activity className={cn("w-3.5 h-3.5 text-blue-600", isTyping && "animate-pulse")} />
                {isTyping ? "AI Caseworker Reviewing" : "Assessment Summary"}
              </div>
              <Badge className={cn(
                "font-bold text-[9px] px-2 py-0.5 border-none rounded-full uppercase tracking-wider",
                isComplete ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" : "bg-blue-100 text-blue-700 hover:bg-blue-100"
              )}>
                {isComplete ? "Complete" : "In Progress"}
              </Badge>
            </div>

            {/* Body: Summary Info */}
            {isTyping ? (
              <div className="space-y-2 py-2">
                {reasoningSteps.map((step) => (
                  <div key={step.id} className="flex items-center gap-2 transition-all duration-300">
                    <div className={cn(
                      "w-1.5 h-1.5 rounded-full transition-all duration-500",
                      step.status === 'completed' ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" :
                      step.status === 'active' ? "bg-amber-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.5)]" : "bg-slate-200"
                    )} />
                    <span className={cn(
                      "text-[10px] font-bold tracking-tight transition-colors duration-300",
                      step.status === 'completed' ? "text-emerald-600" :
                      step.status === 'active' ? "text-amber-600" : "text-slate-400"
                    )}>
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            ) : aiReasoning ? (
              <div className="space-y-3.5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-0.5">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Primary Concern</p>
                    <p className="text-xs font-bold text-blue-900 capitalize leading-tight">{aiReasoning.primaryConcern || "Under assessment"}</p>
                    {caseState.rootCause && (
                      <p className="text-[10px] text-slate-500 font-medium mt-1">
                        Caused by: <span className="font-semibold text-slate-700">{caseState.rootCause}</span>
                      </p>
                    )}
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Risk Level</p>
                    <Badge className={cn(
                      "font-bold px-2 py-0.5 rounded-full text-[8px] border-none shadow-none uppercase tracking-wider",
                      aiReasoning.riskLevel === 'high' ? "bg-red-100 text-red-600" :
                      aiReasoning.riskLevel === 'medium' ? "bg-amber-100 text-amber-600" : "bg-emerald-100 text-emerald-600"
                    )}>
                      {aiReasoning.riskLevel} Risk
                    </Badge>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Needs</p>
                  <div className="flex flex-wrap gap-1">
                    {aiReasoning.identifiedNeeds.map((need: string, i: number) => (
                      <Badge key={i} variant="outline" className="text-[8px] py-0 px-1.5 font-bold bg-white border-slate-200 text-slate-500 rounded-md">
                        {need}
                      </Badge>
                    ))}
                  </div>
                </div>

                {caseState.assessmentData && Object.values(caseState.assessmentData).some(v => !!v) && (
                  <div className="space-y-1.5 pt-2 border-t border-slate-100">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Verified Facts</p>
                    <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
                      {Object.entries(caseState.assessmentData).map(([key, value]) => value ? (
                        <div key={key} className="flex items-center gap-1 truncate">
                          <div className="w-1 h-1 rounded-full bg-emerald-500 shrink-0" />
                          <span className="text-[8px] font-bold text-slate-500 capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                          <span className="text-[8px] font-medium text-blue-900 truncate">{value as string}</span>
                        </div>
                      ) : null)}
                    </div>
                  </div>
                )}

                {/* Why LifeLine Recommended This */}
                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Why LifeLine Recommended This</p>
                  <div className="space-y-1">
                    {(() => {
                      const list = [];
                      if (aiReasoning?.whyRecommended && aiReasoning.whyRecommended.length > 0) {
                        list.push(...aiReasoning.whyRecommended);
                      } else {
                        const situation = (caseState.currentSituation || initialInput || "").toLowerCase();
                        if (situation.includes("eat") || situation.includes("food") || situation.includes("hunger")) {
                          list.push("Immediate food insecurity detected");
                          list.push("User reported not eating today");
                          list.push("No nearby food resources found");
                          list.push("Alternative support services identified");
                        } else {
                          list.push("Crisis assessment initiated");
                          list.push("Analyzing immediate safety and security needs");
                        }
                        if (!caseState.assessmentData?.employment || caseState.assessmentData.employment.toLowerCase() === 'unknown' || caseState.assessmentData.employment === '') {
                          list.push("Employment status not yet verified");
                        } else {
                          list.push("Employment loss confirmed");
                        }
                      }
                      return list.slice(0, 4);
                    })().map((item: string, i: number) => (
                      <div key={i} className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="text-[9px] font-semibold text-slate-600 leading-tight">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-[10px] text-slate-400 font-medium italic py-2">Waiting for situation assessment details...</p>
            )}

            {/* Status Indicator & Continuation Button */}
            <div className="pt-2 border-t border-slate-100">
              {isComplete ? (
                <div className="space-y-2">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Assessment Status</p>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>Assessment Complete</span>
                  </div>
                  <Button 
                    onClick={() => {
                      nextStep();
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white h-9 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 group mt-1"
                  >
                    Show Nearby Resources
                    <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                  </Button>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Assessment Status</p>
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    <span>In Progress (Step {assessmentStep + 1} of 3)</span>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {showEmergencyNotice && (
            <div className="bg-amber-50 border border-amber-100 rounded-[1.5rem] p-4 space-y-2 shadow-sm shadow-amber-100/50">
              <div className="flex items-center gap-1.5 text-amber-700 font-bold text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                Emergency Notice
              </div>
              <p className="text-[10px] text-amber-800/80 leading-relaxed">
                If you are in immediate physical danger or have a medical emergency, please call **911** or your local emergency services immediately.
              </p>
            </div>
          )}
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
          <RecoveryChecklist timeframe="today" title="Today" steps={recoverySteps} onToggleStep={toggleRecoveryStep} />
          <RecoveryChecklist timeframe="week" title="This Week" steps={recoverySteps} onToggleStep={toggleRecoveryStep} />
          <RecoveryChecklist timeframe="month" title="This Month" steps={recoverySteps} onToggleStep={toggleRecoveryStep} />
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
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 max-w-4xl mx-auto pb-10">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-blue-900 flex items-center gap-2.5">
          <Sparkles className="w-6 h-6 text-blue-500" />
          Career Recovery Insights
        </h2>
        <p className="text-gray-500 text-sm font-medium">We analyzed your documents and identified the strongest paths forward.</p>
      </div>

      {docInsights ? (
        <div className="space-y-6">
          {/* SECTION 1 — INSIGHTS SUMMARY */}
          <div className="bg-white rounded-[2rem] border border-slate-100 p-6 md:p-8 shadow-sm space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Key Skills */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Key Skills</h4>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {(docInsights.skills || []).map((skill: string, idx: number) => (
                    <Badge key={idx} variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100 text-[10px] px-2.5 py-0.5 font-bold">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Relevant Experience */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Relevant Experience</h4>
                <p className="text-xs text-slate-600 leading-relaxed font-semibold bg-slate-50 border border-slate-100 p-3 rounded-xl italic mt-1">
                  "{docInsights.experience || "No experience summary available."}"
                </p>
              </div>

              {/* Strength Areas */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Strength Areas</h4>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {(docInsights.strengthAreas || ["Mobile Architecture", "State Management", "Firebase Integration"]).map((area: string, idx: number) => (
                    <Badge key={idx} variant="outline" className="text-[10px] px-2.5 py-0.5 font-bold text-slate-600 border-slate-200 bg-white">
                      {area}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2 — WHY THESE OPPORTUNITIES MATCH YOU */}
          <div className="bg-white rounded-[2rem] border border-slate-100 p-6 md:p-8 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-blue-900 uppercase tracking-wider">
              Why LifeLine Recommends These Opportunities
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(docInsights.recommendationReasons || [
                "Strong Flutter development experience",
                "Mobile application background",
                "Firebase integration skills",
                "Suitable for immediate freelance work",
                "High alignment with long-term technical career paths"
              ]).map((reason: string, idx: number) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 bg-emerald-50/40 border border-emerald-100/50 p-3 rounded-xl">
                  <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="font-bold text-slate-800 leading-tight">{reason}</span>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 3 — IMMEDIATE OPPORTUNITIES */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-base font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                Earn Income Now
              </h3>
              <Badge className="bg-blue-100 text-blue-700 font-bold text-[9px] px-2 py-0.5 uppercase border-none rounded-full tracking-wider">
                Immediate Actions
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(docInsights.temporaryOpportunities || []).map((opp: any, idx: number) => {
                const isFlutter = opp.title.toLowerCase().includes("flutter") || opp.title.toLowerCase().includes("mobile");
                const income = isFlutter ? "$$$" : "$$";
                return (
                  <Card key={idx} className="border-l-4 border-l-blue-500 bg-white hover:shadow-md transition-all rounded-2xl overflow-hidden border-slate-100 shadow-sm">
                    <CardContent className="p-5 space-y-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <h4 className="font-extrabold text-slate-800 text-[15px] leading-snug">{opp.title}</h4>
                        </div>
                        <Badge className="bg-blue-100 text-blue-700 border-none font-bold text-[10px] shrink-0 px-2 py-0.5">
                          {opp.matchScore}% Match
                        </Badge>
                      </div>

                      <div className="space-y-2 pt-2 border-t border-slate-50">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Why Matched</p>
                        <div className="grid grid-cols-1 gap-1">
                          {(opp.matchPoints || []).map((pt: string, i: number) => (
                            <div key={i} className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                              <span>{pt}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-50">
                        <div className="space-y-0.5">
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Income Potential</p>
                          <p className="text-xs font-bold text-blue-900 flex items-center gap-0.5">
                            <span className="text-blue-600 tracking-wider font-extrabold">{income}</span>
                          </p>
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Start Time</p>
                          <p className="text-xs font-bold text-emerald-600">Immediate</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* SECTION 4 — LONG-TERM GROWTH PATH */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-base font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Career Growth Path
              </h3>
              <Badge className="bg-emerald-100 text-emerald-700 font-bold text-[9px] px-2 py-0.5 uppercase border-none rounded-full tracking-wider">
                Future Development
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(docInsights.growthOpportunities || []).map((opp: any, idx: number) => {
                return (
                  <Card key={idx} className="border-l-4 border-l-emerald-500 bg-white hover:shadow-md transition-all rounded-2xl overflow-hidden border-slate-100 shadow-sm">
                    <CardContent className="p-5 space-y-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <h4 className="font-extrabold text-slate-800 text-[15px] leading-snug">{opp.title}</h4>
                        </div>
                        <Badge className="bg-emerald-100 text-emerald-700 border-none font-bold text-[10px] shrink-0 px-2 py-0.5">
                          {opp.matchScore}% Match
                        </Badge>
                      </div>

                      <div className="space-y-2 pt-2 border-t border-slate-50">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Why Matched</p>
                        <div className="grid grid-cols-1 gap-1">
                          {(opp.matchPoints || []).map((pt: string, i: number) => (
                            <div key={i} className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                              <span>{pt}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-50">
                        <div className="space-y-0.5">
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Estimated Growth</p>
                          <p className="text-xs font-bold text-blue-900">High</p>
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Time Horizon</p>
                          <p className="text-xs font-bold text-slate-600">6–24 Months</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-100 p-3.5 rounded-xl text-center">
            <p className="text-[11px] text-blue-700 font-medium leading-relaxed">
              "These suggestions are based on the information you shared and are intended to support—not replace—your own judgment."
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center py-10 bg-white rounded-[1.5rem] border-2 border-dashed border-slate-200">
           <p className="text-slate-400 font-medium text-sm">Please upload a document on the previous screen to see insights.</p>
           <Button variant="ghost" onClick={prevStep} className="mt-2 text-blue-600 font-bold text-sm">Go Back</Button>
        </div>
      )}

      {!isFinished && <StepNavigation onBack={prevStep} isLast nextLabel="Finish" />}
    </div>
  );

  const downloadRecoveryPlan = () => {
    const location = caseState.assessmentData?.location || "Local Area";
    const content = `LIFELINE AI RECOVERY PLAN SUMMARY
Location: ${location}
Status: Recovery Roadmap Complete
Date: ${new Date().toLocaleDateString()}

RECOVERY PLAN CHECKLIST:
${recoverySteps.map(step => `[${step.completed ? 'X' : ' '}] ${step.title} (${step.timeframe}) - ${step.description}`).join('\n')}

RECOMMENDED SUPPORT SERVICES:
- Food Assistance Centers
- Housing Stability Services
- Employment & Career Guidance

Next Recommended Actions:
1. Contact local support centers identified in the session.
2. Follow up on program matching applications.
3. Update and refine resume documents for job matching.

Thank you for using LifeLine AI. We wish you strength in your recovery journey.
`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `LifeLine_Recovery_Plan_${location.replace(/\s+/g, '_')}.txt`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderCompletionScreen = () => {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-700 pt-4 pb-16">
        {/* Banner Card */}
        <Card className="rounded-[2rem] border-none bg-gradient-to-br from-emerald-600 to-teal-800 text-white p-6 shadow-lg shadow-emerald-100 relative overflow-hidden">
          <div className="relative flex items-center gap-6">
            <div className="w-14 h-14 bg-white text-emerald-600 rounded-full flex items-center justify-center shadow-md shrink-0">
              <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
            </div>
            <div className="space-y-1">
              <h2 className="text-2xl font-extrabold tracking-tight">Recovery Complete</h2>
              <p className="text-emerald-100 text-sm font-medium">
                You have successfully completed all caseworker assessment and roadmap preparation steps.
              </p>
            </div>
          </div>
        </Card>

        {/* Summary Card */}
        <Card className="rounded-[2rem] border border-slate-100 shadow-sm p-6 bg-white space-y-4">
          <h3 className="font-extrabold text-base text-slate-800 uppercase tracking-wider">Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div className="flex items-center gap-2.5 text-slate-700 font-bold text-sm bg-slate-50 p-3 rounded-xl border border-slate-100">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              <span>Resources identified</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-700 font-bold text-sm bg-slate-50 p-3 rounded-xl border border-slate-100">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              <span>Action plan created</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-700 font-bold text-sm bg-slate-50 p-3 rounded-xl border border-slate-100">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              <span>Programs matched</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-700 font-bold text-sm bg-slate-50 p-3 rounded-xl border border-slate-100">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              <span>Opportunities generated</span>
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-100">
          <Button 
            onClick={downloadRecoveryPlan}
            className="bg-slate-900 hover:bg-slate-800 text-white h-12 rounded-xl font-bold text-sm shadow-md"
          >
            Download Recovery Plan
          </Button>
          <Button 
            onClick={() => {
              setIsFinished(false);
              setCurrentStep(1);
              setInitialInput("");
              setAssessmentStep(0);
              setAssessmentAnswers({});
              setRecoverySteps([]);
              setError(null);
              setChatHistory([]);
              setCaseState({
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
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white h-12 rounded-xl font-bold text-sm shadow-md"
          >
            Start New Session
          </Button>
          <Button 
            variant="outline"
            onClick={() => {
              const content = `LIFELINE SAVED RESOURCES\nLocation: ${caseState.assessmentData?.location || "Local Area"}\n\n` + 
                recoverySteps.map((s, i) => `${i+1}. ${s.title}: ${s.description}`).join("\n\n");
              const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.setAttribute("href", url);
              link.setAttribute("download", `LifeLine_Saved_Resources.txt`);
              link.style.visibility = 'hidden';
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            className="border-2 hover:bg-slate-50 text-slate-700 h-12 rounded-xl font-bold text-sm"
          >
            Save Resource List
          </Button>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (isFinished) {
      return renderCompletionScreen();
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
        
        <div className="flex-1 overflow-y-auto bg-slate-50/30">
          <div className="max-w-7xl mx-auto px-6 py-6">
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
