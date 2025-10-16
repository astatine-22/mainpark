'use client';

import { useState, useEffect, useRef } from 'react';
import { APIProvider, useMap } from '@vis.gl/react-google-maps';
import ParkingMap from '@/components/parking-map';
import ParkingListItem from '@/components/parking-list-item';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { ParkingLot } from '@/lib/types';
import { BookingSheet } from './booking-sheet';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Search } from 'lucide-react';
import { Skeleton } from './ui/skeleton';

function ParkingFinder() {
  const [parkingLots, setParkingLots] = useState<ParkingLot[]>([]);
  const [selectedLot, setSelectedLot] = useState<ParkingLot | null>(null);
  const [isBookingSheetOpen, setIsBookingSheetOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [userPosition, setUserPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(true);

  const map = useMap();
  const placesServiceRef = useRef<google.maps.places.PlacesService | null>(null);

  useEffect(() => {
    if (map && !placesServiceRef.current) {
      placesServiceRef.current = new google.maps.places.PlacesService(map);
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
          if (map) {
            map.panTo(newPosition);
          }
        },
        (error) => {
          console.error("Error getting user location:", error);
          // Fallback to default location if user denies permission or there's an error
          if (!userPosition) {
             setUserPosition({ lat: 28.6139, lng: 77.2090 });
          }
        },
        {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
        }
      );
    } else {
       // Fallback for older browsers
       if (!userPosition) {
        setUserPosition({ lat: 28.6139, lng: 77.2090 });
       }
    }

    return () => {
        if(watchId) {
            navigator.geolocation.clearWatch(watchId);
        }
    }
  }, [map, userPosition]);

  useEffect(() => {
    if (!placesServiceRef.current || !userPosition) return;

    const placesService = placesServiceRef.current;
    const request: google.maps.places.PlaceSearchRequest = {
      location: userPosition,
      radius: 5000, // 5km radius
      type: 'parking',
      keyword: 'pay parking'
    };

    setLoading(true);
    placesService.nearbySearch(request, (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && results) {
        const fetchedLots: ParkingLot[] = results.map((place, index) => ({
          id: place.place_id || `p${index}`,
          name: place.name || 'Unknown Parking',
          address: place.vicinity || 'Address not available',
          position: {
            lat: place.geometry?.location?.lat() || 0,
            lng: place.geometry?.location?.lng() || 0,
          },
          rating: place.rating || 4.0,
          totalSpots: Math.floor(Math.random() * 150) + 50, // Mock data
          availableSpots: Math.floor(Math.random() * 50), // Mock data
          pricePerHour: Math.floor(Math.random() * 80) + 40, // Mock data
          image: {
            url: place.photos?.[0]?.getUrl() || `https://picsum.photos/seed/parking${index}/400/300`,
            hint: 'parking garage',
          },
        }));
        setParkingLots(fetchedLots);
      } else {
        console.error('Places API search failed:', status);
      }
      setLoading(false);
    });
  }, [userPosition]);

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

  const filteredLots = parkingLots.filter(
    (lot) =>
      lot.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lot.address.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
      <div className="h-[calc(100vh-4rem)] w-full flex flex-col md:flex-row">
        <div className="md:w-2/3 w-full h-1/2 md:h-full">
          <ParkingMap
            parkingLots={filteredLots}
            onSelectLot={handleSelectLot}
            onOpenBooking={handleOpenBooking}
            selectedLot={selectedLot}
            userPosition={userPosition}
          />
        </div>
        <aside className="md:w-1/3 w-full h-1/2 md:h-full">
           <Card className="flex flex-col h-full rounded-none md:rounded-l-none border-t md:border-t-0 md:border-l">
            <CardHeader>
                <CardTitle>Nearby Parking</CardTitle>
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Search parking by name or address..." 
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </CardHeader>
            <CardContent className="flex-grow overflow-hidden">
                <ScrollArea className="h-full pr-4">
                  <div className="space-y-4">
                    {loading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex gap-4 p-3">
                          <Skeleton className="h-24 w-24" />
                          <div className="flex-grow space-y-2">
                            <Skeleton className="h-5 w-3/4" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-8 w-1/2" />
                          </div>
                        </div>
                      ))
                    ) : filteredLots.length > 0 ? (
                      filteredLots.map((lot) => (
                        <ParkingListItem
                          key={lot.id}
                          lot={lot}
                          onSelect={() => handleSelectLot(lot)}
                          onBook={() => handleOpenBooking(lot)}
                          isSelected={selectedLot?.id === lot.id}
                        />
                      ))
                    ) : (
                      <p className="text-muted-foreground text-center py-8">No paid parking lots found nearby.</p>
                    )}
                  </div>
                </ScrollArea>
            </CardContent>
            </Card>
        </aside>
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


export default function MapContainer() {
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
    <APIProvider apiKey={apiKey} libraries={['places']}>
      <ParkingFinder />
    </APIProvider>
  )
}
