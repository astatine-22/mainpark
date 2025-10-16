'use client';

import { useState, useEffect } from 'react';
import { APIProvider } from '@vis.gl/react-google-maps';
import ParkingMap from '@/components/parking-map';
import ParkingListItem from '@/components/parking-list-item';
import { ScrollArea } from '@/components/ui/scroll-area';
import { mockParkingLots } from '@/lib/mock-data';
import type { ParkingLot } from '@/lib/types';
import { BookingSheet } from './booking-sheet';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Search } from 'lucide-react';

export default function MapContainer() {
  const [parkingLots, setParkingLots] = useState<ParkingLot[]>(mockParkingLots);
  const [selectedLot, setSelectedLot] = useState<ParkingLot | null>(null);
  const [isBookingSheetOpen, setIsBookingSheetOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [userPosition, setUserPosition] = useState<{ lat: number; lng: number } | null>(null);

  // Simulate real-time availability updates
  useEffect(() => {
    const interval = setInterval(() => {
      setParkingLots((prevLots) =>
        prevLots.map((lot) => {
          const change = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
          let newAvailable = lot.availableSpots + change;
          if (newAvailable < 0) newAvailable = 0;
          if (newAvailable > lot.totalSpots) newAvailable = lot.totalSpots;
          return { ...lot, availableSpots: newAvailable };
        })
      );
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);
  
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserPosition({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting user location:", error);
        }
      );
    }
  }, []);

  const handleSelectLot = (lot: ParkingLot) => {
    setSelectedLot(lot);
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
    <APIProvider apiKey={apiKey}>
      <div className="container mx-auto grid h-[calc(100vh-4rem)] max-w-7xl grid-cols-1 md:grid-cols-3 md:gap-6 py-4">
        <div className="relative h-[60vh] md:h-full md:col-span-2 rounded-lg overflow-hidden border shadow-md">
          <ParkingMap
            parkingLots={filteredLots}
            onSelectLot={handleSelectLot}
            onOpenBooking={handleOpenBooking}
            selectedLot={selectedLot}
            userPosition={userPosition}
          />
        </div>
        <Card className="flex flex-col mt-4 md:mt-0 h-[calc(40vh-4rem-1rem)] md:h-full">
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
                {filteredLots.map((lot) => (
                  <ParkingListItem
                    key={lot.id}
                    lot={lot}
                    onSelect={() => handleSelectLot(lot)}
                    onBook={() => handleOpenBooking(lot)}
                    isSelected={selectedLot?.id === lot.id}
                  />
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
      {selectedLot && (
        <BookingSheet
          lot={selectedLot}
          isOpen={isBookingSheetOpen}
          onOpenChange={setIsBookingSheetOpen}
        />
      )}
    </APIProvider>
  );
}
