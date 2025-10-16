'use client';

import { useState, useEffect, useRef } from 'react';
import { APIProvider, useMap } from '@vis.gl/react-google-maps';
import ParkingMap from '@/components/parking-map';
import ParkingListItem from '@/components/parking-list-item';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { ParkingLot } from '@/lib/types';
import { BookingSheet } from './booking-sheet';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Skeleton } from './ui/skeleton';

interface ParkingFinderProps {
  searchTerm: string;
  searchTrigger: number;
}

function ParkingFinder({ searchTerm, searchTrigger }: ParkingFinderProps) {
  const [parkingLots, setParkingLots] = useState<ParkingLot[]>([]);
  const [selectedLot, setSelectedLot] = useState<ParkingLot | null>(null);
  const [isBookingSheetOpen, setIsBookingSheetOpen] = useState(false);
  const [userPosition, setUserPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [searchPosition, setSearchPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(true);

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
          if (!searchPosition) { // Only set search position if not already set by manual search
            setSearchPosition(newPosition);
          }
        },
        (error) => {
          console.error("Error getting user location:", error);
          setLoading(false);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
      setLoading(false);
    }
    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [searchPosition]);

  useEffect(() => {
    if (searchTrigger > 0 && searchTerm.trim() !== '' && geocoderRef.current) {
      setLoading(true);
      geocoderRef.current.geocode({ address: searchTerm }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const location = results[0].geometry.location;
          const newPos = { lat: location.lat(), lng: location.lng() };
          setSearchPosition(newPos);
        } else {
          console.error(`Geocode was not successful for the following reason: ${status}`);
          setLoading(false);
        }
      });
    }
  }, [searchTrigger, searchTerm]);
  
  useEffect(() => {
    if (map && searchPosition) {
        map.panTo(searchPosition);
        map.setZoom(14);
    }
  }, [map, searchPosition]);

  useEffect(() => {
    if (!placesServiceRef.current || !searchPosition) return;

    const placesService = placesServiceRef.current;
    const request: google.maps.places.PlaceSearchRequest = {
      location: searchPosition,
      radius: 5000,
      type: 'parking',
      keyword: 'pay parking'
    };

    setLoading(true);
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
      } else {
        console.error('Places API search failed:', status);
        setParkingLots([]);
      }
      setLoading(false);
    });
  }, [searchPosition]);

  const handleSelectLot = (lot: ParkingLot) => {
    setSelectedLot(lot);
    if(map) {
      map.panTo(lot.position);
    }
  };

  const handleOpenBooking = (lot: ParkingLot) => {
    setSelectedLot(lot);
    setIsBookingSheetOpen(true);
  };

  return (
    <div className="flex h-full w-full flex-col">
        <div className="h-full w-full relative">
          <ParkingMap
            parkingLots={parkingLots}
            onSelectLot={handleSelectLot}
            onOpenBooking={handleOpenBooking}
            selectedLot={selectedLot}
            userPosition={userPosition}
            searchPosition={searchPosition}
          />
        <div className="absolute bottom-0 left-0 right-0 h-[40vh] w-full bg-transparent pointer-events-none">
          <div className="h-full w-full overflow-x-auto p-4 flex gap-4 pointer-events-auto">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex-shrink-0 w-80">
                  <Skeleton className="h-full w-full" />
                </div>
              ))
            ) : parkingLots.length > 0 ? (
              parkingLots.map((lot) => (
                <div key={lot.id} className="w-80 h-full flex-shrink-0">
                  <ParkingListItem
                    lot={lot}
                    onSelect={() => handleSelectLot(lot)}
                    onBook={() => handleOpenBooking(lot)}
                    isSelected={selectedLot?.id === lot.id}
                  />
                </div>
              ))
            ) : (
              <Card className="w-full">
                <CardContent className="flex items-center justify-center h-full">
                  <p className="py-8 text-center text-muted-foreground">{searchPosition ? 'No paid parking lots found nearby.' : 'Getting your location to find nearby parking...'}</p>
                </CardContent>
              </Card>
            )}
          </div>
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
  searchTrigger: number;
}

export default function MapContainer({ searchTerm, searchTrigger }: MapContainerProps) {
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
      <ParkingFinder searchTerm={searchTerm} searchTrigger={searchTrigger} />
    </APIProvider>
  )
}
