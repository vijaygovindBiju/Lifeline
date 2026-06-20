import React from 'react';
import { ClipboardList, CheckCircle2, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Program } from '@/types';
import { cn } from '@/lib/utils';

interface ProgramCardProps {
  program: Program;
}

export function ProgramCard({ program }: ProgramCardProps) {
  const confidenceConfig = {
    high: { label: "Strong Match", color: "bg-emerald-100 text-emerald-700" },
    medium: { label: "Possible Match", color: "bg-amber-100 text-amber-700" },
    low: { label: "Worth Exploring", color: "bg-slate-100 text-slate-700" }
  };

  const { label, color } = confidenceConfig[program.confidence];

  return (
    <Card className="h-full flex flex-col border-emerald-100 hover:border-emerald-300 transition-colors shadow-sm p-4 justify-between space-y-3">
      <div className="space-y-2">
        <div className="flex justify-between items-start">
          <Badge className={cn("font-bold px-2 py-0.5 rounded-full border-none text-[9px]", color)}>
            {label}
          </Badge>
        </div>
        <div>
          <h3 className="text-[15px] text-blue-900 leading-tight font-extrabold tracking-tight">{program.name}</h3>
        </div>
        <div className="bg-blue-50/50 p-2.5 rounded-lg border border-blue-100">
          <p className="text-[11px] font-bold text-blue-800 flex items-start gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            Why it helps:
          </p>
          <p className="text-xs text-blue-700 mt-0.5">{program.recommendationReason}</p>
        </div>
        
        <div className="space-y-1">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
            <ClipboardList className="w-3.5 h-3.5" />
            Required Documents
          </p>
          <ul className="grid grid-cols-1 gap-1">
            {program.requirements.map((req, idx) => (
              <li key={idx} className="text-xs text-gray-600 flex items-center gap-1.5 leading-snug">
                <div className="w-1 h-1 rounded-full bg-emerald-400 shrink-0" />
                {req}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="mt-2.5">
        <Button className="w-full h-8 text-[11px] bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-1.5 font-bold">
          Learn More <ChevronRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    </Card>
  );
}
