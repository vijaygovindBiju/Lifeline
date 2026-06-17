import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Briefcase } from 'lucide-react';

interface SessionHeaderProps {
  sessionTitle: string;
  category: string;
  progress: number;
  className?: string;
}

export function SessionHeader({ sessionTitle, category, progress, className }: SessionHeaderProps) {
  return (
    <div className={cn("w-full bg-white border-b border-slate-100 p-6 md:p-8 space-y-6", className)}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">{sessionTitle}</h1>
          <div className="flex items-center gap-3 flex-wrap">
            <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200 py-1 px-3 flex items-center gap-2">
              <Briefcase className="w-3.5 h-3.5" />
              {category}
            </Badge>
            {progress === 100 && (
              <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200 py-1 px-3 font-bold">
                Recovery Complete
              </Badge>
            )}
            <span className="text-xs text-slate-400 font-medium tracking-wide">
              Your information helps us provide relevant guidance.
            </span>
          </div>
        </div>

        <div className="w-full md:w-64 space-y-2">
          <div className="flex justify-between items-end">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Recovery Progress</p>
            <p className="text-xl font-black text-blue-600">{progress === 100 ? "100% Complete" : `${progress}%`}</p>
          </div>
          <Progress value={progress} className="h-2.5 bg-slate-100" />
        </div>
      </div>
    </div>
  );
}
