"use client";

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
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
  X
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getGeminiResponse } from '@/lib/gemini';

const journeySteps = [
  { id: 1, label: 'Situation Shared' },
  { id: 2, label: 'Immediate Needs Assessed' },
  { id: 3, label: 'Support Resources' },
  { id: 4, label: 'Program Guidance' },
  { id: 5, label: 'Recovery Plan' },
  { id: 6, label: 'Document Insights' },
];

export default function LifeLineApp() {
  const [currentStep, setCurrentStep] = useState(1);
  const [initialInput, setInitialInput] = useState("");
  const [assessmentStep, setAssessmentStep] = useState(0);
  const [assessmentAnswers, setAssessmentAnswers] = useState<Record<string, string>>({});
  const [chatHistory, setChatHistory] = useState<{role: string, content: string}[]>([]);
  
  // AI Centralized State
  const [urgentNeeds, setUrgentNeeds] = useState<string[]>([]);
  const [dynamicQuestions, setDynamicQuestions] = useState<string[]>([]);

  const [isFinished, setIsFinished] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const progressPercentage = currentStep <= 1 ? 0 : 
                             currentStep === 2 ? 25 :
                             currentStep === 3 ? 50 :
                             currentStep === 4 ? 70 :
                             currentStep === 5 ? 85 : 100;

  const nextStep = () => {
    if (currentStep === 6) {
      setIsFinished(true);
    } else {
      setCurrentStep(prev => Math.min(prev + 1, 6));
    }
    setIsMobileSidebarOpen(false);
  };

  const startJourney = async () => {
    setCurrentStep(2);
    setIsTyping(true);
    
    try {
      const response = await fetch('http://localhost:5000/api/assess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ situation: initialInput }),
      });
      
      const data = await response.json();
      
      if (data.error) throw new Error(data.error);

      setChatHistory([{ role: 'assistant', content: data.response }]);
      setUrgentNeeds(data.urgentNeeds || []);
      setDynamicQuestions(data.nextQuestions || []);
    } catch (error) {
      console.error("Assessment Error:", error);
      // Fallback for demo safety
      const fallbackMsg = "I'm so sorry you're going through this. Please know that you're not alone. I'll ask a few quick questions to prioritize your immediate safety and needs.";
      setChatHistory([{ role: 'assistant', content: fallbackMsg }]);
    } finally {
      setIsTyping(false);
    }
  };

  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const handleAssessmentAnswer = async (answer: string) => {
    const questions = dynamicQuestions.length > 0 ? dynamicQuestions : [
      "Have you eaten today?",
      "Do you have a safe place to stay tonight?",
      "Do you have any dependents?"
    ];
    
    const currentQuestion = questions[assessmentStep];
    setAssessmentAnswers(prev => ({ ...prev, [currentQuestion]: answer }));
    
    setChatHistory(prev => [
      ...prev,
      { role: 'user', content: answer }
    ]);

    setIsTyping(true);

    // Determine fallback key based on the step and answer
    let fallbackKey = "generic";
    if (assessmentStep === 0) fallbackKey = answer === "Yes" ? "food_yes" : "food_no";
    else if (assessmentStep === 1) fallbackKey = answer === "Yes" ? "housing_yes" : "housing_no";
    else if (assessmentStep === 2) fallbackKey = answer === "Yes" ? "dependents_yes" : "dependents_no";
    
    const prompt = `The user answered "${answer}" to the question "${currentQuestion}". 
    ${assessmentStep < 2 
      ? `Briefly acknowledge and move to the next question: "${questions[assessmentStep + 1]}".` 
      : `Provide a final reassuring acknowledgement that you've gathered enough to find immediate help.`}
    Keep it conversational and brief (max 2 sentences).`;

    const aiResponse = await getGeminiResponse(prompt, fallbackKey);
    
    setIsTyping(false);
    setChatHistory(prev => [
      ...prev,
      { role: 'assistant', content: aiResponse }
    ]);

    if (assessmentStep < 2) {
      setAssessmentStep(prev => prev + 1);
    } else {
      setTimeout(nextStep, 2000);
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
    const questions = [
      "Have you eaten today?",
      "Do you have a safe place to stay tonight?",
      "Do you have any dependents?"
    ];

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
            
            <div className="flex-1 overflow-y-auto p-8 space-y-2 scroll-smooth">
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

            <div className="p-8 border-t border-slate-50 bg-slate-50/50">
              {assessmentStep < 3 && !isTyping && assessmentAnswers[questions[assessmentStep]] === undefined && (
                <div className="flex flex-col gap-4 animate-in slide-in-from-bottom-4 duration-500">
                  <p className="text-center text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Select your answer</p>
                  <div className="flex gap-4 max-w-sm mx-auto w-full">
                    <Button 
                      onClick={() => handleAssessmentAnswer("Yes")}
                      className="flex-1 h-14 bg-white text-blue-600 border-2 border-blue-100 hover:bg-blue-600 hover:text-white hover:border-blue-600 rounded-2xl shadow-sm transition-all text-lg font-bold"
                    >
                      Yes
                    </Button>
                    <Button 
                      onClick={() => handleAssessmentAnswer("No")}
                      className="flex-1 h-14 bg-white text-slate-600 border-2 border-slate-100 hover:bg-slate-800 hover:text-white hover:border-slate-800 rounded-2xl shadow-sm transition-all text-lg font-bold"
                    >
                      No
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
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
    <ImmediateSupport onNext={nextStep} onBack={prevStep} />
  );

  // Screen 4: Programs That May Help
  const renderPrograms = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-blue-900">Programs That May Help</h2>
        <p className="text-gray-500">Based on your situation, these programs offer the best chance of support.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockPrograms.map((program) => (
          <ProgramCard key={program.id} program={program} />
        ))}
      </div>

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <RecoveryChecklist timeframe="today" title="Today" steps={mockRecoveryPlan} />
        <RecoveryChecklist timeframe="week" title="This Week" steps={mockRecoveryPlan} />
        <RecoveryChecklist timeframe="month" title="This Month" steps={mockRecoveryPlan} />
      </div>

      <div className="bg-blue-600 rounded-3xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-blue-200">
        <div className="space-y-2 text-center md:text-left">
          <h3 className="text-2xl font-bold">Upload Documents for Better Insights</h3>
          <p className="opacity-90">Upload your resume or letters to unlock tailored job opportunities.</p>
        </div>
        <Button className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-6 rounded-2xl font-bold text-lg flex items-center gap-2">
          <FileUp className="w-6 h-6" /> Upload Now
        </Button>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <DocumentInsightCard insight={mockDocumentInsight} />
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
              {mockDocumentInsight.opportunities.temporary.map((opp, i) => (
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
              {mockDocumentInsight.opportunities.growth.map((opp, i) => (
                <OpportunityCard key={i} title={opp} type="growth" />
              ))}
            </div>
          </div>
        </div>
      </div>

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
          category="Job Loss Recovery"
          progress={progressPercentage}
        />
        <div className="px-8 mt-2 flex gap-2">
          <Badge variant="secondary" className="bg-blue-100/50 text-blue-600 border-none font-bold px-3 py-1 rounded-full">
            Guided Support
          </Badge>
        </div>
        
        <div className="flex-1 overflow-y-auto bg-slate-50/30">
          <div className="max-w-5xl mx-auto px-6 py-10">
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
