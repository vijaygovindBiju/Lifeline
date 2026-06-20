import React, { useEffect, useState } from 'react';
import { ResourceCard } from './ResourceCard';
import { UrgentNeedCard } from './UrgentNeedCard';
import { ArrowRight, Loader2, MapPinOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Resource } from '@/types';

interface ImmediateSupportProps {
  onNext: () => void;
  onBack: () => void;
  location: string;
  identifiedNeeds: string[];
}

interface ApiResponseResource {
  name: string;
  category: string;
  address: string;
  distance: string;
  description: string;
  lat: number;
  lng: number;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

export function ImmediateSupport({ onNext, onBack, location, identifiedNeeds }: ImmediateSupportProps) {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [fallbackMessage, setFallbackMessage] = useState<string | null>(null);

  useEffect(() => {
    async function fetchResources() {
      if (!location) {
        setResources([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      setFallbackMessage(null);
      try {
        const response = await fetch(`${API_BASE_URL}/api/resources`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ location, identifiedNeeds }),
        });
        if (!response.ok) {
          throw new Error('Failed to fetch local resources');
        }
        const data = await response.json();
        setFallbackMessage(data.fallbackMessage || null);
        const apiResources = data.resources || [];
        
        const mapped: Resource[] = apiResources.map((r: ApiResponseResource, idx: number) => {
          const categoryLower = r.category.toLowerCase();
          let type: 'food' | 'housing' | 'employment' | 'legal' = 'food';
          if (categoryLower.includes('shelter') || categoryLower.includes('housing')) {
            type = 'housing';
          } else if (categoryLower.includes('employment') || categoryLower.includes('job') || categoryLower.includes('work')) {
            type = 'employment';
          } else if (categoryLower.includes('legal') || categoryLower.includes('advocacy') || categoryLower.includes('law')) {
            type = 'legal';
          } else if (categoryLower.includes('clinic') || categoryLower.includes('medical') || categoryLower.includes('doctor') || categoryLower.includes('hospital')) {
            type = 'legal';
          }

          let priority: 'low' | 'medium' | 'high' = 'medium';
          const hasFoodNeed = identifiedNeeds.some(n => n.toLowerCase().includes('food') || n.toLowerCase().includes('hunger') || n.toLowerCase().includes('nutrition'));
          const hasHousingNeed = identifiedNeeds.some(n => n.toLowerCase().includes('housing') || n.toLowerCase().includes('shelter') || n.toLowerCase().includes('rent'));
          const hasEmploymentNeed = identifiedNeeds.some(n => n.toLowerCase().includes('employment') || n.toLowerCase().includes('job') || n.toLowerCase().includes('work') || n.toLowerCase().includes('career'));
          const hasMedicalNeed = identifiedNeeds.some(n => n.toLowerCase().includes('medical') || n.toLowerCase().includes('health') || n.toLowerCase().includes('clinic') || n.toLowerCase().includes('doctor') || n.toLowerCase().includes('hospital'));
          
          if (r.category === 'Food Assistance' && hasFoodNeed) {
            priority = 'high';
          } else if (r.category === 'Housing' && hasHousingNeed) {
            priority = 'high';
          } else if (r.category === 'Employment' && hasEmploymentNeed) {
            priority = 'high';
          } else if (r.category === 'Medical' && hasMedicalNeed) {
            priority = 'high';
          }

          return {
            id: `res-api-${idx}`,
            name: r.name,
            type,
            distance: r.distance,
            address: r.address,
            openNow: true,
            statusText: 'Open Now',
            description: r.description,
            priority,
            category: r.category
          };
        });
        setResources(mapped);
      } catch (err: any) {
        console.error(err);
        setError('Unable to load nearby resources. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    fetchResources();
  }, [location, identifiedNeeds]);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="space-y-2">
        <h2 className="text-4xl font-extrabold text-blue-900 tracking-tight">Immediate Support</h2>
        <p className="text-xl text-slate-500 font-medium italic">"Let's address your most urgent needs first."</p>
      </div>

      <UrgentNeedCard />

      {fallbackMessage && (
        <div className="bg-amber-50 border-2 border-amber-100 text-amber-800 p-5 rounded-[2rem] text-sm font-semibold shadow-sm animate-in slide-in-from-top-2 duration-300">
          ⚠️ {fallbackMessage}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          <p className="text-slate-500 font-medium">Searching for nearby resources in {location}...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-100 rounded-3xl p-8 text-center space-y-2">
          <p className="text-red-700 font-bold">{error}</p>
          <p className="text-xs text-red-500">We could not contact the resource lookup service. Please check your network connection.</p>
        </div>
      ) : resources.length === 0 ? (
        <div className="bg-slate-100 border border-slate-200 rounded-3xl p-10 text-center space-y-4 flex flex-col items-center max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">
            <MapPinOff className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <p className="text-slate-700 font-bold text-lg">No nearby resources found</p>
            <p className="text-sm text-slate-500">
              We couldn't locate any food, shelter, clinic, or employment services within 10 km of your specified location: <strong className="text-slate-700">{location}</strong>.
            </p>
          </div>
          <p className="text-xs text-blue-600 font-semibold bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100">
            Locate nearby food assistance services manually or dial local emergency directories.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} isPriority={resource.priority === 'high'} />
          ))}
        </div>
      )}

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
