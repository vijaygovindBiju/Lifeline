import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { RecoveryStep } from '@/types';
import { cn } from '@/lib/utils';
import { Calendar, Clock, Target } from 'lucide-react';

interface RecoveryChecklistProps {
  steps: RecoveryStep[];
  timeframe: 'today' | 'week' | 'month';
  title: string;
  onToggleStep: (stepId: string) => void;
}

export function RecoveryChecklist({ steps, timeframe, title, onToggleStep }: RecoveryChecklistProps) {
  const filteredSteps = steps.filter(step => step.timeframe === timeframe);
  
  const iconMap = {
    today: <Clock className="w-5 h-5 text-amber-500" />,
    week: <Calendar className="w-5 h-5 text-blue-500" />,
    month: <Target className="w-5 h-5 text-emerald-500" />
  };

  const bgMap = {
    today: "border-amber-100 bg-amber-50/10",
    week: "border-blue-100 bg-blue-50/10",
    month: "border-emerald-100 bg-emerald-50/10"
  };

  return (
    <Card className={cn("h-[250px] flex flex-col overflow-hidden border-2 rounded-3xl shadow-sm", bgMap[timeframe])}>
      <CardHeader className="pb-2.5 border-b bg-white/70 py-3 shrink-0">
        <div className="flex items-center gap-3">
          {iconMap[timeframe]}
          <CardTitle className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            {title}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-0">
        <div className="divide-y divide-slate-100 bg-white/50">
          {filteredSteps.length === 0 ? (
            <p className="p-6 text-xs text-slate-400 font-medium italic text-center">No action items defined.</p>
          ) : (
            filteredSteps.map((step) => (
              <div 
                key={step.id} 
                className={cn(
                  "p-4.5 flex items-start gap-4 transition-all border-l-4 border-l-transparent",
                  step.completed ? "bg-emerald-50/30 hover:bg-emerald-50/40 border-l-emerald-500" : "hover:bg-white/60"
                )}
              >
                <Checkbox 
                  id={step.id} 
                  checked={step.completed}
                  onCheckedChange={() => onToggleStep(step.id)}
                  className={cn(
                    "mt-0.5 w-5 h-5 rounded-full border-2 transition-all",
                    step.completed ? "bg-emerald-500 border-emerald-500 text-white" :
                    timeframe === 'today' ? "border-amber-300 hover:border-amber-400" :
                    timeframe === 'week' ? "border-blue-300 hover:border-blue-400" :
                    "border-emerald-300 hover:border-emerald-400"
                  )}
                />
                <div className="grid gap-1 leading-tight flex-1">
                  <label
                    htmlFor={step.id}
                    className={cn(
                      "text-sm font-bold text-slate-700 cursor-pointer transition-all",
                      step.completed && "line-through text-slate-400 opacity-60"
                    )}
                  >
                    {step.title}
                  </label>
                  <p className={cn(
                    "text-xs text-slate-500 leading-relaxed font-medium transition-all",
                    step.completed && "opacity-50"
                  )}>
                    {step.description}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
