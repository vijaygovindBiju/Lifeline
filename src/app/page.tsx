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
import { AlertCircle, ArrowRight, Sparkles, FileUp, Send, ShieldCheck, Activity, HeartHandshake, ChevronDown } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const steps = [
  { id: 1, label: 'Welcome' },
  { id: 2, label: 'Assessment' },
  { id: 3, label: 'Support' },
  { id: 4, label: 'Programs' },
  { id: 5, label: 'Recovery' },
  { id: 6, label: 'Insights' },
];

export default function LifeLineApp() {
  const [currentStep, setCurrentStep] = useState(1);
  const [initialInput, setInitialInput] = useState("");
  const [assessmentStep, setAssessmentStep] = useState(0);
  const [assessmentAnswers, setAssessmentAnswers] = useState<Record<string, string>>({});
  const [chatHistory, setChatHistory] = useState([
    { role: 'assistant', content: "I'm sorry you're going through this. Before anything else, let's address your immediate needs." }
  ]);

  const [isFinished, setIsFinished] = useState(false);

  const nextStep = () => {
    if (currentStep === 6) {
      setIsFinished(true);
    } else {
      setCurrentStep(prev => Math.min(prev + 1, 6));
    }
  };
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const handleAssessmentAnswer = (answer: string) => {
    const questions = [
      "Have you eaten today?",
      "Do you have a safe place to stay tonight?",
      "Do you have any dependents?"
    ];
    
    const currentQuestion = questions[assessmentStep];
    setAssessmentAnswers(prev => ({ ...prev, [currentQuestion]: answer }));
    
    setChatHistory(prev => [
      ...prev,
      { role: 'user', content: answer },
      { 
        role: 'assistant', 
        content: assessmentStep < 2 
          ? `Got it. ${questions[assessmentStep + 1]}` 
          : "Thank you for sharing that. I've identified some immediate resources and programs that can help."
      }
    ]);

    if (assessmentStep < 2) {
      setAssessmentStep(prev => prev + 1);
    } else {
      setTimeout(nextStep, 1500);
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
              onClick={nextStep}
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-right-4 duration-500">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 h-[500px] flex flex-col">
            <div className="p-4 border-b border-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-sm font-semibold text-slate-400">AI Caseworker</span>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <ChatBubble role="user" content={initialInput} />
              {chatHistory.map((msg, i) => (
                <ChatBubble key={i} role={msg.role as any} content={msg.content} />
              ))}
            </div>

            <div className="p-6 border-t border-slate-50 bg-slate-50/50">
              {assessmentStep < 3 && assessmentAnswers[questions[assessmentStep]] === undefined && (
                <div className="flex gap-4 justify-center">
                  <Button 
                    onClick={() => handleAssessmentAnswer("Yes")}
                    className="flex-1 h-12 bg-white text-blue-600 border-2 border-blue-100 hover:bg-blue-50 rounded-xl"
                  >
                    Yes
                  </Button>
                  <Button 
                    onClick={() => handleAssessmentAnswer("No")}
                    className="flex-1 h-12 bg-white text-red-600 border-2 border-red-100 hover:bg-red-50 rounded-xl"
                  >
                    No
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="rounded-3xl border-none shadow-lg shadow-blue-100/20 bg-gradient-to-br from-blue-600 to-blue-700 text-white overflow-hidden">
            <CardContent className="p-6 space-y-4">
              <h3 className="font-bold text-xl">Urgency Assessment</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-medium opacity-80">
                  <span>Step {assessmentStep + 1} of 3</span>
                  <span>{Math.round(((assessmentStep + 1) / 3) * 100)}%</span>
                </div>
                <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-white transition-all duration-500" 
                    style={{ width: `${((assessmentStep + 1) / 3) * 100}%` }}
                  />
                </div>
              </div>
              <p className="text-sm opacity-90 leading-relaxed">
                We're checking for immediate risks to ensure you get the right support right away.
              </p>
            </CardContent>
          </Card>

          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800 font-medium">
              If you are in immediate physical danger, please call emergency services (911) immediately.
            </p>
          </div>
        </div>
      </div>
    );
  };

  // Screen 3: Immediate Support
  const renderSupport = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-blue-900">Immediate Support</h2>
        <p className="text-gray-500">Let's address your most urgent needs first.</p>
      </div>

      <Alert variant="destructive" className="bg-red-50 border-red-100 text-red-900 rounded-2xl py-4">
        <AlertCircle className="h-5 w-5 text-red-600" />
        <AlertTitle className="font-bold">Urgent Action Recommended</AlertTitle>
        <AlertDescription className="text-red-700">
          Based on your assessment, we recommend visiting a food pantry today.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockResources.map((resource) => (
          <ResourceCard key={resource.id} resource={resource} isPriority={resource.priority === 'high'} />
        ))}
      </div>

      <StepNavigation onNext={nextStep} onBack={prevStep} />
    </div>
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
      <div className="text-center space-y-3 mb-12">
        <h2 className="text-4xl font-extrabold text-blue-900">Your Recovery Plan</h2>
        <p className="text-lg text-blue-600 font-medium italic">"One step at a time. You've got this."</p>
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
             <p className="text-xs text-blue-700 font-medium">
              "Recommendations are generated from uploaded information and should be independently reviewed."
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

      <StepNavigation onBack={prevStep} isLast nextLabel="Finish" />
    </div>
  );

  const renderContent = () => {
    if (isFinished) {
      return (
        <div className="max-w-2xl mx-auto py-20 text-center space-y-6 animate-in zoom-in-95 duration-500">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8">
            <Sparkles className="w-10 h-10" />
          </div>
          <h2 className="text-4xl font-extrabold text-blue-900">You're on the right path.</h2>
          <p className="text-xl text-gray-600 leading-relaxed">
            We've saved your recovery plan and document insights. Take it one step at a time, and don't hesitate to reach out if you need more help.
          </p>
          <div className="pt-8">
            <Button 
              onClick={() => {
                setIsFinished(false);
                setCurrentStep(1);
                setInitialInput("");
                setAssessmentStep(0);
              }}
              className="bg-blue-600 hover:bg-blue-700 px-8 py-6 rounded-2xl font-bold"
            >
              Back to Start
            </Button>
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

  return (
    <AppLayout>
      {currentStep > 1 && (
        <div className="mb-12 max-w-3xl mx-auto">
          <ProgressTracker 
            steps={steps} 
            currentStep={currentStep} 
            onStepClick={(id) => setCurrentStep(id)}
          />
        </div>
      )}
      
      <div className="min-h-[600px]">
        {renderContent()}
      </div>
    </AppLayout>
  );
}
