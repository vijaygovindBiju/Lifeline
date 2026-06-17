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
}

export function RecoveryChecklist({ steps, timeframe, title }: RecoveryChecklistProps) {
  const filteredSteps = steps.filter(step => step.timeframe === timeframe);
  
  const iconMap = {
    today: <Clock className="w-5 h-5 text-amber-500" />,
    week: <Calendar className="w-5 h-5 text-blue-500" />,
    month: <Target className="w-5 h-5 text-emerald-500" />
  };

  const bgMap = {
    today: "border-amber-100 bg-amber-50/20",
    week: "border-blue-100 bg-blue-50/20",
    month: "border-emerald-100 bg-emerald-50/20"
  };

  return (
    <Card className={cn("overflow-hidden border-2", bgMap[timeframe])}>
      <CardHeader className="pb-3 border-b bg-white/50">
        <div className="flex items-center gap-3">
          {iconMap[timeframe]}
          <CardTitle className="text-lg font-bold text-gray-800 uppercase tracking-wide">
            {title}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-gray-100 bg-white/30">
          {filteredSteps.map((step) => (
            <div key={step.id} className="p-4 flex items-start gap-4 transition-colors hover:bg-white/50">
              <Checkbox 
                id={step.id} 
                className={cn(
                  "mt-1 w-5 h-5 rounded-full border-2",
                  timeframe === 'today' ? "border-amber-400 data-[state=checked]:bg-amber-500" :
                  timeframe === 'week' ? "border-blue-400 data-[state=checked]:bg-blue-500" :
                  "border-emerald-400 data-[state=checked]:bg-emerald-500"
                )}
              />
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor={step.id}
                  className="text-base font-semibold text-blue-900 cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {step.title}
                </label>
                <p className="text-sm text-gray-600">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
