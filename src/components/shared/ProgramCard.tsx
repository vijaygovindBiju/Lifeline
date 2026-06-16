import React from 'react';
import { ClipboardList, CheckCircle2, ChevronRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
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
    <Card className="h-full flex flex-col border-emerald-100 hover:border-emerald-300 transition-colors shadow-sm">
      <CardHeader>
        <div className="flex justify-between items-start mb-2">
          <Badge className={cn("font-bold px-3 py-1 rounded-full border-none", color)}>
            {label}
          </Badge>
        </div>
        <CardTitle className="text-xl text-blue-900 leading-tight font-extrabold tracking-tight">{program.name}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 space-y-4">
        <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100">
          <p className="text-sm font-medium text-blue-800 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
            Why it helps:
          </p>
          <p className="text-sm text-blue-700 mt-1">{program.recommendationReason}</p>
        </div>
        
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
            <ClipboardList className="w-3.5 h-3.5" />
            Required Documents
          </p>
          <ul className="grid grid-cols-1 gap-1.5">
            {program.requirements.map((req, idx) => (
              <li key={idx} className="text-sm text-gray-600 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                {req}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-2">
          Learn More <ChevronRight className="w-4 h-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
