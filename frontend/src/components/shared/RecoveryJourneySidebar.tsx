import React from 'react';
import { Check, Circle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
  id: number;
  label: string;
  icon?: React.ReactNode;
}

interface RecoveryJourneySidebarProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (stepId: number) => void;
  className?: string;
  isFinished?: boolean;
}

export function RecoveryJourneySidebar({ steps, currentStep, onStepClick, className, isFinished }: RecoveryJourneySidebarProps) {
  const completedSteps = isFinished ? steps.length : Math.max(0, currentStep - 1);
  const progressPercent = Math.round((completedSteps / steps.length) * 100);

  return (
    <aside className={cn("w-full h-full bg-white border-r border-slate-100 flex flex-col p-6 space-y-8 overflow-y-auto", className)}>
      <div className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Recovery Journey</h2>
          <p className="text-xs text-slate-400 font-semibold italic">
            {isFinished ? "Journey Complete." : "\"One step at a time.\""}
          </p>
        </div>

        {/* Progress Display */}
        <div className="space-y-2 pt-3 border-t border-slate-50">
          <div className="flex justify-between items-center text-xs font-bold text-slate-500 uppercase tracking-wide">
            <span>{completedSteps} of {steps.length} Steps Complete</span>
            <span className="text-blue-600 font-extrabold">{progressPercent}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden shadow-inner p-[1px]">
            <div 
              className="bg-blue-600 h-full rounded-full transition-all duration-700 ease-out shadow-sm" 
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      <nav className="flex-1">
        <div className="space-y-0 relative">
          {/* Connector Line */}
          <div className="absolute left-[13px] top-2 bottom-2 w-0.5 bg-slate-100" />
          
          {steps.map((step, index) => {
            const isCompleted = isFinished || currentStep > step.id;
            const isCurrent = !isFinished && currentStep === step.id;
            const isUpcoming = !isFinished && currentStep < step.id;

            return (
              <button
                key={step.id}
                onClick={() => onStepClick?.(step.id)}
                disabled={isUpcoming}
                className={cn(
                  "relative z-10 flex items-start gap-4 w-full py-4.5 text-left transition-all group",
                  isUpcoming ? "opacity-40 cursor-not-allowed" : "cursor-pointer hover:bg-slate-50/50 rounded-xl px-2 -ml-2"
                )}
              >
                <div className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center shrink-0 border-2 transition-all duration-300",
                  isCompleted ? "bg-emerald-500 border-emerald-500 text-white" :
                  isCurrent ? "bg-white border-blue-600 text-blue-600 shadow-sm" :
                  "bg-white border-slate-200 text-slate-300"
                )}>
                  {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : 
                   isCurrent ? <div className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" /> :
                   <div className="w-2 h-2 rounded-full bg-slate-300" />}
                </div>

                <div className="pt-0.5 space-y-0.5">
                  <p className={cn(
                    "text-sm font-bold transition-colors",
                    isCompleted ? "text-emerald-600" :
                    isCurrent ? "text-blue-600" :
                    "text-slate-400"
                  )}>
                    {step.label}
                  </p>
                  {isCurrent && (
                    <p className="text-[9px] font-bold text-blue-400 uppercase tracking-widest animate-pulse">
                      In Progress
                    </p>
                  )}
                </div>

                {isCurrent && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.6)]" />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      <div className="pt-6 border-t border-slate-50 space-y-4">
        <div className="bg-blue-50/50 rounded-2xl p-4 flex gap-3 border border-blue-100/50 shadow-sm shadow-blue-50">
          <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
          <p className="text-[10px] text-blue-700 leading-relaxed font-medium">
            LifeLine is an AI caseworker designed to help you navigate crisis. Your progress is saved locally for this session.
          </p>
        </div>
      </div>
    </aside>
  );
}
