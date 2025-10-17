'use client';

import { useState, useEffect, useRef } from 'react';
import { APIProvider, useMap } from '@vis.gl/react-google-maps';
import ParkingMap from '@/components/parking-map';
import ParkingListItem from '@/components/parking-list-item';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { ParkingLot } from '@/lib/types';
import { BookingSheet } from './booking-sheet';
import { Card, CardContent } from './ui/card';
import { Skeleton } from './ui/skeleton';
import { Button } from '@/components/ui/button';
import { ChevronUp } from 'lucide-react';
import { cn, getDistance } from '@/lib/utils';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';

interface ParkingFinderProps {
  searchTerm: string;
  isNearbySearch: boolean;
  onSearchHandled: () => void;
}

const SEARCH_RADIUS_KM = 5; // 5km radius for search

function ParkingFinder({
  searchTerm,
  isNearbySearch,
  onSearchHandled,
}: ParkingFinderProps) {
  const { firestore } = useFirebase();
  const [parkingLots, setParkingLots] = useState<ParkingLot[]>([]);
  const [selectedLot, setSelectedLot] = useState<ParkingLot | null>(null);
  const [isBookingSheetOpen, setIsBookingSheetOpen] = useState(false);
  const [userPosition, setUserPosition] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [searchPosition, setSearchPosition] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState(
    'Finding nearby parking...'
  );
  const [currentSearchTerm, setCurrentSearchTerm] = useState('your location');
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [isListExpanded, setIsListExpanded] = useState(false);

  const map = useMap();
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);
  
  const parkingLotsQuery = useMemoFirebase(() => {
    return collection(firestore, 'parking_lots');
  }, [firestore]);

  const { data: parkingLotsFromFS, isLoading: isLoadingLots, error: lotsError } = useCollection<ParkingLot>(parkingLotsQuery);

  // Effect for initialization and initial search
  useEffect(() => {
    if (!map) return;
    if (!geocoderRef.current) geocoderRef.current = new google.maps.Geocoder();

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newPosition = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserPosition(newPosition);
        if (!searchPosition) {
          // Only set search position if it's the initial load
          setSearchPosition(newPosition);
          setMapCenter(newPosition);
          setCurrentSearchTerm('your location');
        }
      },
      (err) => {
        console.warn(
          'Could not get user location. Falling back to default. Error:',
          err.message || 'Unknown reason'
        );
        const defaultPosition = { lat: 20.5937, lng: 78.9629 }; // India center
        setUserPosition(null);
        if (!searchPosition) {
          setSearchPosition(defaultPosition);
          setMapCenter(defaultPosition);
          setStatusMessage('Could not get your location. Showing results for India.');
          setCurrentSearchTerm('India');
        }
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  }, [map, searchPosition]);

  // Effect to watch for live location updates for the blue dot
  useEffect(() => {
    const watchId = navigator.geolocation.watchPosition((position) => {
      setUserPosition({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });
    });

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  // Effect for handling manual text search
  useEffect(() => {
    if (searchTerm.trim() !== '' && geocoderRef.current) {
      setLoading(true);
      setCurrentSearchTerm(searchTerm);
      setStatusMessage(`Searching for parking near ${searchTerm}...`);
      geocoderRef.current.geocode({ address: searchTerm }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const location = results[0].geometry.location;
          const newPosition = { lat: location.lat(), lng: location.lng() };
          setSearchPosition(newPosition);
          setMapCenter(newPosition);
        } else {
          console.error(
            `Geocode was not successful for the following reason: ${status}`
          );
          setLoading(false);
          setStatusMessage(`Could not find location: ${searchTerm}`);
        }
      });
    }
  }, [searchTerm]);

  // Effect for handling "Nearby" button click
  useEffect(() => {
    if (isNearbySearch) {
      if (userPosition) {
        setLoading(true);
        setCurrentSearchTerm('your location');
        setStatusMessage('Finding nearby parking...');
        setSearchPosition(userPosition);
        setMapCenter(userPosition);
      } else {
        setStatusMessage(
          'Could not get your location. Please allow location access.'
        );
      }
      onSearchHandled(); // Reset the trigger
    }
  }, [isNearbySearch, userPosition, onSearchHandled]);

  // Effect to pan the map
  useEffect(() => {
    if (map && mapCenter) {
      map.panTo(mapCenter);
      map.setZoom(14);
    }
  }, [map, mapCenter]);

  // Effect to filter parking lots from Firestore
  useEffect(() => {
    setLoading(isLoadingLots);
    if (isLoadingLots || !searchPosition || !parkingLotsFromFS) {
      return;
    }

    const filteredAndSortedLots = parkingLotsFromFS
      .map(lot => {
        const lotPosition = { lat: lot.latitude, lng: lot.longitude };
        const distance = getDistance(searchPosition, lotPosition);
        return { ...lot, distance, position: lotPosition };
      })
      .filter(lot => lot.distance <= SEARCH_RADIUS_KM)
      .sort((a, b) => a.distance - b.distance);

    setParkingLots(filteredAndSortedLots);
    
    if (filteredAndSortedLots.length === 0) {
      setStatusMessage(`No parking lots found within ${SEARCH_RADIUS_KM}km.`);
    }

    setLoading(false);

  }, [searchPosition, parkingLotsFromFS, isLoadingLots]);


  const handleSelectLot = (lot: ParkingLot) => {
    setSelectedLot(lot);
    if (map && lot.position) {
      map.panTo(lot.position);
      map.setZoom(15);
    }
  };

  const handleOpenBooking = (lot: ParkingLot) => {
    setSelectedLot(lot);
    setIsBookingSheetOpen(true);
  };

  return (
    <div className="relative w-full h-full">
      <div className="absolute inset-0">
        <ParkingMap
          parkingLots={parkingLots}
          onSelectLot={handleSelectLot}
          onOpenBooking={handleOpenBooking}
          selectedLot={selectedLot}
          userPosition={userPosition}
          center={mapCenter}
        />
      </div>

      <div
        className={cn(
          'absolute bottom-0 left-0 right-0 z-10 p-4 transition-all duration-500 ease-in-out',
          isListExpanded ? 'h-4/5' : 'h-2/5'
        )}
      >
        <div className="h-full w-full bg-background/80 backdrop-blur-sm rounded-t-lg shadow-2xl flex flex-col">
          <div className="flex-shrink-0 text-center py-2" onClick={() => setIsListExpanded(!isListExpanded)}>
             <Button variant="ghost" size="icon" className="cursor-pointer">
              <ChevronUp className={cn('transition-transform duration-300', isListExpanded && 'rotate-180')} />
            </Button>
          </div>
          <ScrollArea className="flex-grow">
            <div className="space-y-4 px-4 pb-4">
              <h2 className="text-2xl font-bold tracking-tight font-headline">
                {loading
                  ? 'Finding parking...'
                  : `Parking Found Near ${currentSearchTerm}`}
              </h2>
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-52 w-full bg-muted-foreground/20" />
                  ))}
                </div>
              ) : parkingLots.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {parkingLots.map((lot) => (
                    <ParkingListItem
                      key={lot.id}
                      lot={lot}
                      onSelect={() => handleSelectLot(lot)}
                      onBook={() => handleOpenBooking(lot)}
                      isSelected={selectedLot?.id === lot.id}
                    />
                  ))}
                </div>
              ) : (
                <Card className="w-full col-span-full bg-transparent border-none shadow-none">
                  <CardContent className="flex items-center justify-center h-full">
                    <p className="py-8 text-center text-muted-foreground">
                      {statusMessage}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
      {selectedLot && (
        <BookingSheet
          lot={selectedLot}
          isOpen={isBookingSheetOpen}
          onOpenChange={setIsBookingSheetOpen}
        />
      )}
    </div>
  );
}

interface MapContainerProps {
  searchTerm: string;
  isNearbySearch: boolean;
  onSearchHandled: () => void;
}

export default function MapContainer({
  searchTerm,
  isNearbySearch,
  onSearchHandled,
}: MapContainerProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return (
      <div className="container py-10 text-center">
        <p className="text-destructive">
          Google Maps API Key is missing. Please set
          NEXT_PUBLIC_GOOGLE_MAPS_API_KEY environment variable.
        </p>
      </div>
    );
  }

  return (
    <APIProvider apiKey={apiKey} libraries={['places', 'geocoding']}>
      <ParkingFinder
        searchTerm={searchTerm}
        isNearbySearch={isNearbySearch}
        onSearchHandled={onSearchHandled}
      />
    </APIProvider>
  );
}

    