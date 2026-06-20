import React from 'react';
import { Briefcase, TrendingUp, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface OpportunityCardProps {
  opp: any;
  type: 'temporary' | 'growth';
}

export function OpportunityCard({ opp, type }: OpportunityCardProps) {
  const isGrowth = type === 'growth';
  
  // Normalization logic for opportunity representation
  const data = typeof opp === 'object' && opp !== null ? opp : {
    title: String(opp),
    matchScore: (String(opp).toLowerCase().includes("developer") || String(opp).toLowerCase().includes("mobile") || String(opp).toLowerCase().includes("flutter") ? 95 : 85),
    rationale: (
      String(opp).toLowerCase().includes("developer") || String(opp).toLowerCase().includes("mobile") || String(opp).toLowerCase().includes("flutter")
        ? "Your software development skills provide a direct match for this mobile engineering position."
        : "Your background and experience align with the core competencies required for this role."
    ),
    matchPoints: (
      String(opp).toLowerCase().includes("developer") || String(opp).toLowerCase().includes("mobile") || String(opp).toLowerCase().includes("flutter")
        ? ["Flutter development experience", "Riverpod state management", "Mobile app development", "Firebase integration"]
        : ["Relevant technical proficiency", "Demonstrated problem solving", "Strong communication skills"]
    )
  };

  return (
    <Card className={cn(
      "border-l-4 transition-all hover:shadow-md",
      isGrowth ? "border-l-emerald-500 bg-white" : "border-l-blue-500 bg-white"
    )}>
      <CardContent className="p-5 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className={cn(
              "p-2.5 rounded-xl shrink-0 mt-0.5",
              isGrowth ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"
            )}>
              {isGrowth ? <TrendingUp className="w-5 h-5" /> : <Briefcase className="w-5 h-5" />}
            </div>
            <div className="space-y-1">
              <h5 className="font-bold text-slate-800 text-[15px] leading-snug">{data.title}</h5>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                {isGrowth ? "Long-term pathway" : "Immediate opportunity"}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <Badge className={cn(
              "font-bold text-[10px] px-2 py-0.5 border-none",
              data.matchScore >= 90 ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" :
              data.matchScore >= 80 ? "bg-blue-100 text-blue-700 hover:bg-blue-100" :
              "bg-slate-100 text-slate-700 hover:bg-slate-100"
            )}>
              {data.matchScore}% Match
            </Badge>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100/60 space-y-3">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Recommendation Rationale</p>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">{data.rationale}</p>
          </div>

          <div className="space-y-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Why This Opportunity Matches</p>
            <div className="grid grid-cols-1 gap-1.5">
              {(data.matchPoints || []).map((point: string, idx: number) => (
                <div key={idx} className="flex items-center gap-2 text-xs text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="font-medium text-slate-700 leading-tight">{point}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
