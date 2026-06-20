import React from 'react';
import { Phone, Clock, Navigation } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Resource } from '@/types';
import { cn } from '@/lib/utils';

interface ResourceCardProps {
  resource: Resource;
  isPriority?: boolean;
}

export function ResourceCard({ resource, isPriority }: ResourceCardProps) {
  return (
    <Card className={cn(
      "h-full flex flex-col justify-between transition-all duration-300 hover:shadow-md border border-slate-100 p-3.5 space-y-3",
      isPriority && "border-amber-200 bg-amber-50/20 ring-1 ring-amber-100 shadow-sm shadow-amber-50"
    )}>
      <div className="space-y-2">
        <div className="flex justify-between items-start gap-1">
          <Badge variant={isPriority ? "warning" : "secondary"} className="uppercase text-[8px] font-extrabold tracking-wider px-1.5 py-0.5">
            {resource.category || resource.type || "Support"}
          </Badge>
          <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-md flex items-center gap-1 shrink-0">
            <Navigation className="w-2.5 h-2.5 text-blue-500" /> {resource.distance}
          </span>
        </div>
        <div>
          <h3 className="text-[14px] font-bold text-slate-800 leading-tight line-clamp-1">{resource.name}</h3>
        </div>
        <p className="text-[11px] text-slate-500 leading-snug line-clamp-2">{resource.description}</p>
        
        <div className="flex items-center gap-4 text-[11px] pt-1.5 border-t border-slate-50">
          {resource.phone && (
            <div className="flex items-center gap-1 text-slate-600">
              <Phone className="w-3 h-3 text-blue-500" />
              <span className="font-medium text-slate-700">{resource.phone}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Clock className={cn("w-3 h-3", resource.openNow ? "text-emerald-500" : "text-amber-500")} />
            <span className={cn("font-semibold text-[10px]", resource.openNow ? "text-emerald-600" : "text-amber-600")}>
              {resource.openNow ? "Open" : "Closed"}
            </span>
          </div>
        </div>
      </div>
      
      <div className="flex gap-1.5 w-full pt-2 border-t border-slate-50 mt-auto">
        <Button variant="outline" size="sm" className="flex-1 text-[10px] h-7.5 px-1 font-bold hover:bg-slate-50">
          Details
        </Button>
        {resource.phone ? (
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 text-[10px] h-7.5 px-1 font-bold border-blue-100 text-blue-600 hover:bg-blue-50"
            onClick={() => { window.location.href = `tel:${resource.phone}`; }}
          >
            Call
          </Button>
        ) : (
          <Button variant="outline" size="sm" className="flex-1 text-[10px] h-7.5 px-1 font-bold opacity-45 cursor-not-allowed" disabled>
            Call
          </Button>
        )}
        <Button 
          size="sm" 
          className="flex-1 text-[10px] h-7.5 px-1 font-bold bg-blue-600 hover:bg-blue-700 text-white"
          onClick={() => { window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(resource.name + ' ' + resource.address)}`, '_blank', 'noopener,noreferrer'); }}
        >
          Directions
        </Button>
      </div>
    </Card>
  );
}
