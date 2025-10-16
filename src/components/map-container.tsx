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

interface ParkingFinderProps {
  searchTerm: string;
  isNearbySearch: boolean;
  onSearchHandled: () => void;
}

function ParkingFinder({ searchTerm, isNearbySearch, onSearchHandled }: ParkingFinderProps) {
  const [parkingLots, setParkingLots] = useState<ParkingLot[]>([]);
  const [selectedLot, setSelectedLot] = useState<ParkingLot | null>(null);
  const [isBookingSheetOpen, setIsBookingSheetOpen] = useState(false);
  const [userPosition, setUserPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [searchPosition, setSearchPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState('Enter a location or allow location access to find parking.');
  const [currentSearchTerm, setCurrentSearchTerm] = useState('your location');

  const map = useMap();
  const placesServiceRef = useRef<google.maps.places.PlacesService | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);

  useEffect(() => {
    if (map) {
      if (!placesServiceRef.current) {
        placesServiceRef.current = new google.maps.places.PlacesService(map);
      }
      if (!geocoderRef.current) {
        geocoderRef.current = new google.maps.Geocoder();
      }
    }
  }, [map]);

  // Effect for watching user's current location
  useEffect(() => {
    let watchId: number;
    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const newPosition = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserPosition(newPosition);
        },
        (error) => {
          console.error("Error getting user location:", error);
          if (!searchPosition) {
            setLoading(false);
            setStatusMessage('Could not get your location. Please allow location access or search for a location.');
          }
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
       if (!searchPosition) {
         setLoading(false);
         setStatusMessage('Geolocation is not supported by your browser.');
       }
    }
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
          setSearchPosition({ lat: location.lat(), lng: location.lng() });
        } else {
          console.error(`Geocode was not successful for the following reason: ${status}`);
          setLoading(false);
          setStatusMessage(`Could not find location: ${searchTerm}`);
        }
      });
    }
  }, [searchTerm]);

  // Effect for handling "Nearby" button click OR initial load
  useEffect(() => {
    // This runs on "Nearby" click or when userPosition is first available
    if (isNearbySearch || (userPosition && !searchPosition)) {
      if (userPosition) {
        setLoading(true);
        setCurrentSearchTerm('your location');
        setStatusMessage('Finding nearby parking...');
        setSearchPosition(userPosition);
      } else if (isNearbySearch) { // Only show this if user explicitly clicks "Nearby"
        setStatusMessage('Could not get your location. Please allow location access.');
      }
      if (isNearbySearch) {
        onSearchHandled(); // Reset the trigger if it was a click
      }
    }
  }, [isNearbySearch, userPosition, searchPosition, onSearchHandled]);
  
  // Effect to pan the map
  useEffect(() => {
    if (map && searchPosition) {
        map.panTo(searchPosition);
        map.setZoom(14);
    }
  }, [map, searchPosition]);

  // Effect to search for places
  useEffect(() => {
    if (!placesServiceRef.current || !searchPosition) return;

    setLoading(true);
    const placesService = placesServiceRef.current;
    const request: google.maps.places.PlaceSearchRequest = {
      location: searchPosition,
      radius: 1500,
      keyword: 'pay parking'
    };

    placesService.nearbySearch(request, (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && results) {
        const fetchedLots: ParkingLot[] = results
        .filter(place => place.geometry && place.geometry.location)
        .map((place, index) => ({
          id: place.place_id || `p${index}`,
          name: place.name || 'Unknown Parking',
          address: place.vicinity || 'Address not available',
          position: {
            lat: place.geometry!.location!.lat(),
            lng: place.geometry!.location!.lng(),
          },
          rating: place.rating || 4.0,
          totalSpots: Math.floor(Math.random() * 150) + 50,
          availableSpots: Math.floor(Math.random() * 50),
          pricePerHour: Math.floor(Math.random() * 80) + 40,
          image: {
            url: place.photos?.[0]?.getUrl() || `https://picsum.photos/seed/parking${index}/400/300`,
            hint: 'parking garage',
          },
        }));
        setParkingLots(fetchedLots);
        if (fetchedLots.length === 0) {
          setStatusMessage('No paid parking lots found nearby.');
        }
      } else {
        if (status !== 'OK') console.error('Places API search failed:', status);
        setParkingLots([]);
        setStatusMessage('No paid parking lots found nearby.');
      }
      setLoading(false);
    });
  }, [searchPosition]);

  const handleSelectLot = (lot: ParkingLot) => {
    setSelectedLot(lot);
    if(map) {
      map.panTo(lot.position);
      map.setZoom(15);
    }
  };

  const handleOpenBooking = (lot: ParkingLot) => {
    setSelectedLot(lot);
    setIsBookingSheetOpen(true);
  };

  return (
    <div className="h-full w-full grid grid-rows-[60%,40%]">
      <div className="w-full h-full">
        <ParkingMap
          parkingLots={parkingLots}
          onSelectLot={handleSelectLot}
          onOpenBooking={handleOpenBooking}
          selectedLot={selectedLot}
          userPosition={userPosition}
          searchPosition={searchPosition}
        />
      </div>
      <div className="w-full h-full overflow-y-auto">
        <ScrollArea className="h-full w-full">
          <div className="p-4">
            <h2 className="text-2xl font-bold tracking-tight font-headline mb-4">
              {loading ? 'Finding parking...' : `Parking Found Near ${currentSearchTerm}`}
            </h2>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-48 w-full" />
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
              <Card className="w-full col-span-full">
                <CardContent className="flex items-center justify-center h-full">
                  <p className="py-8 text-center text-muted-foreground">{statusMessage}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>
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

export default function MapContainer({ searchTerm, isNearbySearch, onSearchHandled }: MapContainerProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return (
      <div className="container py-10 text-center">
        <p className="text-destructive">
          Google Maps API Key is missing. Please set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY environment variable.
        </p>
      </div>
    );
  }

  return (
    <APIProvider apiKey={apiKey} libraries={['places', 'geocoding']}>
      <ParkingFinder searchTerm={searchTerm} isNearbySearch={isNearbySearch} onSearchHandled={onSearchHandled} />
    </APIProvider>
  )
}
