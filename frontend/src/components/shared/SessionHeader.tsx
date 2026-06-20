import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Briefcase } from 'lucide-react';

interface SessionHeaderProps {
  sessionTitle: string;
  category: string;
  progress?: number;
  className?: string;
}

export function SessionHeader({ sessionTitle, category, progress, className }: SessionHeaderProps) {
  return (
    <div className={cn("w-full bg-white border-b border-slate-100 py-4 px-6 md:px-8", className)}>
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">{sessionTitle}</h1>
          <div className="flex items-center gap-2.5 flex-wrap">
            <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200 py-0.5 px-2.5 flex items-center gap-1.5 text-xs">
              <Briefcase className="w-3.5 h-3.5" />
              {category}
            </Badge>
            <Badge variant="secondary" className="bg-blue-50/50 text-blue-600 border-none font-bold px-2 py-0.5 rounded-full text-xs">
              Guided Support
            </Badge>
            {progress === 100 && (
              <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200 py-0.5 px-2.5 text-xs font-bold">
                Recovery Complete
              </Badge>
            )}
            <span className="text-xs text-slate-400 font-medium tracking-wide">
              Your information helps us provide relevant guidance.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
