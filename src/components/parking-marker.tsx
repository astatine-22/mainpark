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
  let colorClass, statusText;

  if (lot.availableSpots === 0) {
    colorClass = 'bg-red-500 border-red-700';
    statusText = 'Full';
  } else if (occupancy <= 0.1 || lot.availableSpots < 10) {
    colorClass = 'bg-yellow-400 border-yellow-600';
    statusText = 'Few Spots';
  } else {
    colorClass = 'bg-green-500 border-green-700';
    statusText = 'Available';
  }

  return (
    <>
      <AdvancedMarker
        ref={markerRef}
        position={lot.position}
        onClick={onClick}
        title={lot.name}
      >
        <div className="relative cursor-pointer transition-transform duration-200 ease-in-out hover:scale-110">
          <div
            className={cn(
              'flex items-center justify-center rounded-full border-2 shadow-lg',
              isSelected ? 'scale-110' : 'scale-100',
              colorClass
            )}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-background/80 m-0.5">
                <div className="text-center leading-tight">
                    <p className="font-bold text-sm text-foreground">{lot.availableSpots}</p>
                    <p className="text-xs text-muted-foreground -mt-1">spots</p>
                </div>
            </div>
          </div>
          <div className="absolute -top-2 -right-5 transform -translate-y-1/2">
             <Badge variant="secondary" className="pl-1 pr-2 shadow-md">
                <Star className="h-3 w-3 mr-1 text-yellow-500 fill-yellow-400" /> {lot.rating}
             </Badge>
          </div>
        </div>
      </AdvancedMarker>
      {isSelected && (
        <InfoWindow anchor={marker} onCloseClick={onClick} >
            <div className="w-64 p-1 font-body">
                <h3 className="font-headline font-bold text-lg mb-1">{lot.name}</h3>
                <p className="text-sm text-muted-foreground">{lot.address}</p>
                <div className="flex items-center justify-between my-2">
                    <Badge variant={
                        lot.availableSpots === 0 ? "destructive" :
                        (lot.availableSpots < 10 ? "secondary" : "default")
                    }>
                        {statusText}
                    </Badge>
                    <div className="font-semibold text-lg">
                        Rs {lot.pricePerHour}<span className="text-sm text-muted-foreground">/hr</span>
                    </div>
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
