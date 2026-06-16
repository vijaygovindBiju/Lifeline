import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
  id: number;
  label: string;
}

interface ProgressTrackerProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (stepId: number) => void;
  className?: string;
}

export function ProgressTracker({ steps, currentStep, onStepClick, className }: ProgressTrackerProps) {
  return (
    <div className={cn("w-full py-4", className)}>
      <div className="flex items-center justify-between relative">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -translate-y-1/2 z-0" />
        
        {steps.map((step) => {
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;
          
          return (
            <button 
              key={step.id} 
              onClick={() => onStepClick?.(step.id)}
              disabled={!onStepClick}
              className={cn(
                "relative z-10 flex flex-col items-center group",
                !onStepClick && "cursor-default"
              )}
            >
              <div 
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200",
                  isCompleted ? "bg-emerald-500 text-white" : 
                  isCurrent ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500",
                  onStepClick && "group-hover:ring-4 group-hover:ring-blue-100"
                )}
              >
                {isCompleted ? <Check className="w-4 h-4" /> : step.id}
              </div>
              <span className={cn(
                "absolute top-10 text-[10px] md:text-xs font-medium whitespace-nowrap transition-colors",
                isCurrent ? "text-blue-600" : "text-gray-500",
                onStepClick && "group-hover:text-blue-500"
              )}>
                {step.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
