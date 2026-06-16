import React from 'react';
import { supportResources } from '@/data/resources';
import { ResourceCard } from './ResourceCard';
import { UrgentNeedCard } from './UrgentNeedCard';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImmediateSupportProps {
  onNext: () => void;
  onBack: () => void;
}

export function ImmediateSupport({ onNext, onBack }: ImmediateSupportProps) {
  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="space-y-2">
        <h2 className="text-4xl font-extrabold text-blue-900 tracking-tight">Immediate Support</h2>
        <p className="text-xl text-slate-500 font-medium italic">"Let's address your most urgent needs first."</p>
      </div>

      <UrgentNeedCard />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {supportResources.map((resource) => (
          <ResourceCard key={resource.id} resource={resource} isPriority={resource.priority === 'high'} />
        ))}
      </div>

      <div className="pt-8 flex flex-col items-center gap-6">
        <p className="text-slate-500 font-medium text-center max-w-lg">
          Once your immediate needs are addressed, we can begin building your long-term stability plan together.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
          <Button 
            variant="ghost"
            onClick={onBack}
            className="text-slate-400 hover:text-blue-600 font-bold order-2 sm:order-1"
          >
            Back to Assessment
          </Button>
          <Button 
            onClick={onNext}
            className="h-16 px-10 text-xl font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-lg shadow-blue-100 transition-all hover:-translate-y-1 flex items-center gap-3 order-1 sm:order-2 w-full sm:w-auto"
          >
            Continue to Stability Planning <ArrowRight className="w-6 h-6" />
          </Button>
        </div>
      </div>
    </div>
  );
}
