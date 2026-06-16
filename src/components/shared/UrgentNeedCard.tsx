import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export function UrgentNeedCard() {
  return (
    <Card className="border-amber-200 bg-amber-50/50 rounded-[2rem] overflow-hidden shadow-sm">
      <CardContent className="p-6 md:p-8 flex gap-5">
        <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center shrink-0">
          <AlertCircle className="w-6 h-6 text-amber-600" />
        </div>
        <div className="space-y-1">
          <h3 className="text-xl font-bold text-amber-900">Food Security Needs Attention</h3>
          <p className="text-amber-800/80 leading-relaxed">
            "You mentioned that you haven't eaten today. Let's focus on getting immediate support first."
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
