'use client';

import { AdvancedMarker, InfoWindow, useAdvancedMarkerRef } from '@vis.gl/react-google-maps';
import { Star, Zap, Navigation } from 'lucide-react';
import type { ParkingLot } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface ParkingMarkerProps {
  lot: ParkingLot;
  onClick: () => void;
  onBook: () => void;
  isSelected: boolean;
}

export default function ParkingMarker({ lot, onClick, onBook, isSelected }: ParkingMarkerProps) {
  const [markerRef, marker] = useAdvancedMarkerRef();

  const occupancy = lot.availableSpots / lot.totalSpots;
  let colorClass, markerBgClass;

  if (lot.availableSpots === 0) {
    colorClass = 'border-status-red';
    markerBgClass = 'bg-status-red';
  } else if (occupancy <= 0.2) {
    colorClass = 'border-status-orange';
    markerBgClass = 'bg-status-orange';
  } else {
    colorClass = 'border-status-green';
    markerBgClass = 'bg-status-green';
  }

  return (
    <>
      <AdvancedMarker
        ref={markerRef}
        position={lot.position}
        onClick={onClick}
        title={lot.name}
      >
        <div className="relative cursor-pointer transition-transform duration-200 ease-in-out hover:scale-110" style={{ transform: isSelected ? 'scale(1.15)' : 'scale(1)' }}>
          <div
            className={cn(
              'flex items-center justify-center rounded-full border-[3px] shadow-md',
              colorClass
            )}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-background m-0.5">
                <p className="font-bold text-sm text-foreground">{lot.availableSpots}</p>
            </div>
          </div>
          <div className="absolute -top-1.5 -right-3.5 transform -translate-y-1/2">
             <Badge variant="secondary" className="pl-1 pr-1.5 shadow-sm text-xs">
                <Star className="h-2.5 w-2.5 mr-0.5 text-yellow-500 fill-yellow-400" /> {lot.rating}
             </Badge>
          </div>
        </div>
      </AdvancedMarker>
      {isSelected && (
        <InfoWindow anchor={marker} onCloseClick={onClick} >
            <div className="w-64 p-1">
                <h3 className="font-bold text-lg mb-1">{lot.name}</h3>
                <p className="text-sm text-muted-foreground">{lot.address}</p>
                <div className="flex items-center justify-between my-2">
                    <p className="font-semibold text-lg">
                        Rs {lot.pricePerHour}<span className="text-sm text-muted-foreground">/hr</span>
                    </p>
                </div>
                <div className="flex justify-between gap-2 mt-3">
                    <Button size="sm" variant="outline" className="w-full" onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${lot.position.lat},${lot.position.lng}`, '_blank')}>
                        <Navigation className="mr-2"/>
                        Navigate
                    </Button>
                    <Button size="sm" className="w-full" onClick={onBook}>
                        <Zap className="mr-2"/>
                        Book Now
                    </Button>
                </div>
            </div>
        </InfoWindow>
      )}
    </>
  );
}
