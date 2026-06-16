import React from 'react';
import { FileText, Sparkles, UserRound, Briefcase } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DocumentInsight } from '@/types';

interface DocumentInsightCardProps {
  insight: DocumentInsight;
}

export function DocumentInsightCard({ insight }: DocumentInsightCardProps) {
  return (
    <Card className="border-blue-100 shadow-sm overflow-hidden">
      <CardHeader className="bg-blue-600 text-white py-4">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          <CardTitle className="text-lg">{insight.fileName}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-500" />
            Extracted Skills
          </h4>
          <div className="flex flex-wrap gap-2">
            {insight.skills.map((skill, idx) => (
              <Badge key={idx} variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100 px-3 py-1">
                {skill}
              </Badge>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
            <UserRound className="w-4 h-4 text-blue-500" />
            Key Experience
          </h4>
          <p className="text-gray-700 leading-relaxed italic border-l-4 border-blue-200 pl-4 py-1">
            "{insight.experience}"
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
