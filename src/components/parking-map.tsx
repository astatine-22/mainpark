'use client';

import { Map } from '@vis.gl/react-google-maps';
import type { ParkingLot } from '@/lib/types';
import ParkingMarker from './parking-marker';

interface ParkingMapProps {
  parkingLots: ParkingLot[];
  onSelectLot: (lot: ParkingLot) => void;
  onOpenBooking: (lot: ParkingLot) => void;
  selectedLot: ParkingLot | null;
}

export default function ParkingMap({ parkingLots, onSelectLot, onOpenBooking, selectedLot }: ParkingMapProps) {
  
  const defaultCenter = { lat: 28.6139, lng: 77.2090 }; // New Delhi

  return (
    <Map
      defaultCenter={defaultCenter}
      defaultZoom={12}
      gestureHandling={'greedy'}
      disableDefaultUI={true}
      mapId="parksmart-map"
      className="w-full h-full"
    >
      {parkingLots.map((lot) => (
        <ParkingMarker 
            key={lot.id} 
            lot={lot}
            onClick={() => onSelectLot(lot)}
            onBook={() => onOpenBooking(lot)}
            isSelected={selectedLot?.id === lot.id}
        />
      ))}
    </Map>
  );
}
