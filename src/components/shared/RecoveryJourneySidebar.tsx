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
  return (
    <aside className={cn("w-full h-full bg-white border-r border-slate-100 flex flex-col p-6 space-y-8 overflow-y-auto", className)}>
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">Recovery Journey</h2>
        <p className="text-sm text-slate-400 font-medium italic">
          {isFinished ? "Journey Complete." : "\"One step at a time.\""}
        </p>
      </div>

      <nav className="flex-1">
        <div className="space-y-0 relative">
          {/* Connector Line */}
          <div className="absolute left-[17px] top-2 bottom-2 w-0.5 bg-slate-100" />
          
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
                  "relative z-10 flex items-start gap-4 w-full py-4 text-left transition-all group",
                  isUpcoming ? "opacity-40 cursor-not-allowed" : "cursor-pointer hover:bg-slate-50/50 rounded-xl px-2 -ml-2"
                )}
              >
                <div className={cn(
                  "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border-2 transition-all duration-300",
                  isCompleted ? "bg-emerald-500 border-emerald-500 text-white" :
                  isCurrent ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200" :
                  "bg-white border-slate-100 text-slate-300"
                )}>
                  {isCompleted ? <Check className="w-5 h-5" /> : 
                   isCurrent ? <Circle className="w-2.5 h-2.5 fill-current" /> :
                   <span className="text-xs font-bold">{step.id}</span>}
                </div>

                <div className="pt-1.5 space-y-0.5">
                  <p className={cn(
                    "text-sm font-bold transition-colors",
                    isCompleted ? "text-emerald-600" :
                    isCurrent ? "text-blue-600" :
                    "text-slate-400"
                  )}>
                    {step.label}
                  </p>
                  {isCurrent && (
                    <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest animate-pulse">
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
        <div className="bg-blue-50/50 rounded-2xl p-4 flex gap-3">
          <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
          <p className="text-[10px] text-blue-700 leading-relaxed font-medium">
            LifeLine is an AI caseworker designed to help you navigate crisis. Your progress is saved locally for this session.
          </p>
        </div>
      </div>
    </aside>
  );
}
