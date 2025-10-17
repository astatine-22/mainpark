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
import { cn } from '@/lib/utils';

interface ParkingFinderProps {
  searchTerm: string;
  isNearbySearch: boolean;
  onSearchHandled: () => void;
}

function ParkingFinder({
  searchTerm,
  isNearbySearch,
  onSearchHandled,
}: ParkingFinderProps) {
  const [parkingLots, setParkingLots] = useState<ParkingLot[]>([]);
  const [selectedLot, setSelectedLot] = useState<ParkingLot | null>(null);
  const [isBookingSheetOpen, setIsBookingSheetOpen] = useState(false);
  const [userPosition, setUserPosition] = useState<{
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
  const placesServiceRef = useRef<google.maps.places.PlacesService | null>(null);

  const performSearch = (
    location: google.maps.LatLng,
    searchRadius: number
  ) => {
    if (!placesServiceRef.current) return;
    setLoading(true);
    setStatusMessage('Searching for parking...');

    const request: google.maps.places.PlaceSearchRequest = {
      location,
      radius: searchRadius,
      keyword: 'pay parking',
    };

    placesServiceRef.current.nearbySearch(request, (results, status) => {
      setLoading(false);
      if (status === google.maps.places.PlacesServiceStatus.OK && results) {
        const lots: ParkingLot[] = results
          .map((place) => {
            if (
              !place.geometry?.location ||
              !place.name ||
              !place.vicinity ||
              !place.place_id
            )
              return null;
            return {
              id: place.place_id,
              name: place.name,
              address: place.vicinity,
              position: {
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng(),
              },
              rating: place.rating || 4.0,
              totalSpots: Math.floor(Math.random() * 100) + 50,
              availableSpots: Math.floor(Math.random() * 50),
              pricePerHour: Math.floor(Math.random() * 50) + 50,
              image: {
                url:
                  place.photos && place.photos.length > 0
                    ? place.photos[0].getUrl({ maxWidth: 400, maxHeight: 300 })
                    : `https://picsum.photos/seed/${place.place_id}/400/300`,
                hint: 'parking garage',
              },
            };
          })
          .filter((lot): lot is ParkingLot => lot !== null);
        setParkingLots(lots);
        if (lots.length === 0) {
          setStatusMessage('No parking found in this area.');
        }
      } else {
        setParkingLots([]);
        setStatusMessage('No parking found in this area.');
        console.error(`Places service failed due to: ${status}`);
      }
    });
  };

  useEffect(() => {
    if (!map) return;
    if (!geocoderRef.current) geocoderRef.current = new google.maps.Geocoder();
    if (!placesServiceRef.current)
      placesServiceRef.current = new google.maps.places.PlacesService(map);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newPosition = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserPosition(newPosition);
        setMapCenter(newPosition);
        performSearch(new google.maps.LatLng(newPosition), 5000);
      },
      (err) => {
        console.warn(
          'Could not get user location. Falling back to default. Error:',
          err.message || 'Unknown reason'
        );
        const defaultPosition = { lat: 28.6139, lng: 77.209 }; // Delhi center
        setUserPosition(null);
        setMapCenter(defaultPosition);
        setStatusMessage('Could not get your location. Showing results for Delhi.');
        setCurrentSearchTerm('Delhi');
        performSearch(new google.maps.LatLng(defaultPosition), 5000);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  }, [map]);

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

  useEffect(() => {
    if (searchTerm.trim() !== '' && geocoderRef.current) {
      setCurrentSearchTerm(searchTerm);
      geocoderRef.current.geocode({ address: searchTerm }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const location = results[0].geometry.location;
          setMapCenter({ lat: location.lat(), lng: location.lng() });
          performSearch(location, 5000); // 5km search radius
        } else {
          console.error(
            `Geocode was not successful for the following reason: ${status}`
          );
          setStatusMessage(`Could not find location: ${searchTerm}`);
        }
      });
    }
  }, [searchTerm]);

  useEffect(() => {
    if (isNearbySearch) {
      if (userPosition) {
        setCurrentSearchTerm('your location');
        setMapCenter(userPosition);
        performSearch(new google.maps.LatLng(userPosition), 5000);
      } else {
        setStatusMessage(
          'Could not get your location. Please allow location access.'
        );
      }
      onSearchHandled(); // Reset the trigger
    }
  }, [isNearbySearch, userPosition, onSearchHandled]);

  useEffect(() => {
    if (map && mapCenter) {
      map.panTo(mapCenter);
    }
  }, [map, mapCenter]);

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
                      userPosition={userPosition}
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

    