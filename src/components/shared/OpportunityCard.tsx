import React from 'react';
import { Briefcase, TrendingUp, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface OpportunityCardProps {
  title: string;
  type: 'temporary' | 'growth';
}

export function OpportunityCard({ title, type }: OpportunityCardProps) {
  const isGrowth = type === 'growth';
  
  return (
    <Card className={cn(
      "border-l-4 transition-all hover:translate-x-1",
      isGrowth ? "border-l-emerald-500 bg-emerald-50/10" : "border-l-blue-500 bg-blue-50/10"
    )}>
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn(
            "p-2 rounded-lg",
            isGrowth ? "bg-emerald-100 text-emerald-600" : "bg-blue-100 text-blue-600"
          )}>
            {isGrowth ? <TrendingUp className="w-5 h-5" /> : <Briefcase className="w-5 h-5" />}
          </div>
          <div>
            <h5 className="font-bold text-blue-900">{title}</h5>
            <p className="text-xs text-gray-500">
              {isGrowth ? "Long-term career path" : "Immediate income potential"}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-blue-600">
          <ArrowRight className="w-5 h-5" />
        </Button>
      </CardContent>
    </Card>
  );
}
