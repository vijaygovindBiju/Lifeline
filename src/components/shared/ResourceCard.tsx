import React from 'react';
import { MapPin, Phone, Clock, Navigation, ExternalLink } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
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
      "h-full transition-all duration-300 hover:shadow-md",
      isPriority && "border-amber-200 bg-amber-50/30 ring-1 ring-amber-100"
    )}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <Badge variant={isPriority ? "warning" : "secondary"} className="mb-2">
            {resource.type.toUpperCase()}
          </Badge>
          <span className="text-xs font-medium text-gray-500 flex items-center gap-1">
            <Navigation className="w-3 h-3" /> {resource.distance}
          </span>
        </div>
        <CardTitle className="text-lg text-blue-900">{resource.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pb-4">
        <p className="text-sm text-gray-600 line-clamp-2">{resource.description}</p>
        
        <div className="space-y-2">
          <div className="flex items-start gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <span>{resource.address}</span>
          </div>
          {resource.phone && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="w-4 h-4 text-blue-500 shrink-0" />
              <span>{resource.phone}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm">
            <Clock className={cn("w-4 h-4 shrink-0", resource.openNow ? "text-emerald-500" : "text-gray-400")} />
            <span className={resource.openNow ? "text-emerald-600 font-medium" : "text-gray-500"}>
              {resource.openNow ? "Open Now" : "Closed"}
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-0 flex gap-2">
        <Button variant="outline" size="sm" className="flex-1 text-xs">
          View Details
        </Button>
        <Button size="sm" className="flex-1 text-xs bg-blue-600 hover:bg-blue-700">
          Get Directions
        </Button>
      </CardFooter>
    </Card>
  );
}
