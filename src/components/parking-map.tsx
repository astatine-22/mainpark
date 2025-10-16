'use client';

import { Map, AdvancedMarker } from '@vis.gl/react-google-maps';
import type { ParkingLot } from '@/lib/types';
import ParkingMarker from './parking-marker';

interface ParkingMapProps {
  parkingLots: ParkingLot[];
  onSelectLot: (lot: ParkingLot) => void;
  onOpenBooking: (lot: ParkingLot) => void;
  selectedLot: ParkingLot | null;
  userPosition: { lat: number; lng: number } | null;
  center: { lat: number; lng: number } | null;
  onIdle: () => void;
}

export default function ParkingMap({ parkingLots, onSelectLot, onOpenBooking, selectedLot, userPosition, center, onIdle }: ParkingMapProps) {
  
  const defaultCenter = { lat: 20.5937, lng: 78.9629 }; // Center of India
  const mapCenter = center || userPosition || defaultCenter;

  return (
    <div className="w-full h-full">
        <Map
            center={mapCenter}
            zoom={userPosition || center ? 14 : 5}
            gestureHandling={'greedy'}
            disableDefaultUI={false}
            mapId="parksmart-map"
            className="w-full h-full"
            onIdle={onIdle}
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
            {userPosition && (
                <AdvancedMarker position={userPosition} title={'You are here'}>
                    <div className='w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-md'></div>
                </AdvancedMarker>
            )}
        </Map>
    </div>
  );
}
