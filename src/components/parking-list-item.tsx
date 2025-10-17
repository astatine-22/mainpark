import Image from 'next/image';
import { Star, Navigation, Zap } from 'lucide-react';
import type { ParkingLot } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ParkingListItemProps {
  lot: ParkingLot;
  onSelect: () => void;
  onBook: () => void;
  isSelected: boolean;
}

export default function ParkingListItem({ lot, onSelect, onBook, isSelected }: ParkingListItemProps) {
  const occupancy = lot.availableSpots / lot.totalSpots;
  let statusColor, statusText;

  if (lot.availableSpots === 0) {
    statusColor = 'text-status-red';
    statusText = "Full";
  } else if (occupancy <= 0.2) {
    statusColor = 'text-status-orange';
    statusText = "Few Spots";
  } else {
    statusColor = 'text-status-green';
    statusText = "Available";
  }

  const imageUrl = lot.photoUrls && lot.photoUrls.length > 0 ? lot.photoUrls[0] : 'https://picsum.photos/seed/parking-fallback/400/300';

  return (
    <Card
      onClick={onSelect}
      className={cn(
        'cursor-pointer transition-all duration-300 hover:shadow-lg h-full flex flex-col',
        isSelected ? 'ring-2 ring-primary shadow-xl bg-card' : 'ring-0 bg-background'
      )}
    >
      <div className="relative h-28 w-full flex-shrink-0">
        <Image
          src={imageUrl}
          alt={lot.name}
          fill
          className="rounded-t-lg object-cover"
          data-ai-hint={'parking garage'}
        />
         <div className="absolute top-2 right-2 flex items-center bg-background/80 backdrop-blur-sm rounded-full px-2 py-0.5 text-xs font-semibold">
            <Star className="w-3 h-3 mr-1 text-yellow-500 fill-yellow-400" />
            {lot.googleRating}
        </div>
        {lot.distance !== undefined && (
          <div className="absolute bottom-2 left-2 bg-background/80 backdrop-blur-sm rounded-full px-2 py-0.5 text-xs font-semibold">
            {lot.distance.toFixed(1)} km away
          </div>
        )}
      </div>
      <CardContent className="p-3 flex-grow flex flex-col justify-between">
        <div>
          <h3 className="font-semibold text-base leading-tight truncate">{lot.name}</h3>
          <p className="text-xs text-muted-foreground truncate">{lot.address}</p>
        </div>
        <div className="space-y-2 mt-2">
            <div className="flex items-center justify-between">
                <p className={cn("text-sm font-semibold", statusColor)}>{statusText}</p>
                <p className="text-base font-semibold">Rs {lot.hourlyRate}<span className="text-sm font-normal text-muted-foreground">/hr</span></p>
            </div>
            <Button size="sm" className="w-full" onClick={(e) => { e.stopPropagation(); onBook(); }}>
                <Zap className="mr-2"/> Book Now
            </Button>
        </div>
      </CardContent>
    </Card>
  );
}

    