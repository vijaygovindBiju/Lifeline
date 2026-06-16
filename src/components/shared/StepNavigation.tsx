import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface StepNavigationProps {
  onNext?: () => void;
  onBack?: () => void;
  nextLabel?: string;
  backLabel?: string;
  isFirst?: boolean;
  isLast?: boolean;
  canNext?: boolean;
}

export function StepNavigation({
  onNext,
  onBack,
  nextLabel = "Continue",
  backLabel = "Back",
  isFirst = false,
  isLast = false,
  canNext = true,
}: StepNavigationProps) {
  return (
    <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
      {!isFirst ? (
        <Button 
          variant="ghost" 
          onClick={onBack}
          className="text-gray-500 hover:text-blue-600 flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" /> {backLabel}
        </Button>
      ) : <div />}

      {!isLast && (
        <Button 
          onClick={onNext}
          disabled={!canNext}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 flex items-center gap-2 shadow-md shadow-blue-200"
        >
          {nextLabel} <ChevronRight className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}
