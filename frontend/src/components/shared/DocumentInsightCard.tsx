import React from 'react';
import { FileText, Sparkles, UserRound, BookOpen } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DocumentInsight } from '@/types';

interface DocumentInsightCardProps {
  insight: DocumentInsight;
}

export function DocumentInsightCard({ insight }: DocumentInsightCardProps) {
  return (
    <Card className="border-blue-100 shadow-sm overflow-hidden">
      <CardHeader className="bg-blue-600 text-white py-3 px-4">
        <div className="flex items-center gap-2">
          <FileText className="w-4.5 h-4.5" />
          <CardTitle className="text-base font-bold">{insight.fileName}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-4 bg-white">
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            Extracted Skills
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {insight.skills.map((skill, idx) => (
              <Badge key={idx} variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100 text-[10px] px-2 py-0.5 font-semibold">
                {skill}
              </Badge>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
            <UserRound className="w-3.5 h-3.5 text-blue-500" />
            Key Experience
          </h4>
          <p className="text-xs text-slate-700 leading-relaxed italic border-l-4 border-blue-200 pl-3 py-0.5">
            "{insight.experience}"
          </p>
        </div>

        <div className="space-y-2 pt-2 border-t border-slate-50">
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-blue-500" />
            Caseworker Alignment Summary
          </h4>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            Based on extracted credentials, the client is highly suited for technical roles. Recommendation strategy centers on leveraging verified mobile development skills to generate immediate cash flow via freelance or contract-based gigs, while preparing applications for senior-level permanent systems design and architectural tracks.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
