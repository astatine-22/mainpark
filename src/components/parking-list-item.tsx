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
  let statusColor;

  if (lot.availableSpots === 0) {
    statusColor = 'bg-red-500';
  } else if (occupancy <= 0.1 || lot.availableSpots < 10) {
    statusColor = 'bg-yellow-400';
  } else {
    statusColor = 'bg-green-500';
  }

  return (
    <Card
      onClick={onSelect}
      className={cn(
        'cursor-pointer transition-all duration-200 hover:shadow-md h-full flex flex-col',
        isSelected ? 'ring-2 ring-primary shadow-lg' : 'ring-0'
      )}
    >
      <div className="relative h-40 w-full flex-shrink-0">
        <Image
          src={lot.image.url}
          alt={lot.name}
          fill
          className="rounded-t-md object-cover"
          data-ai-hint={lot.image.hint}
        />
         <div className="absolute top-2 right-2 flex items-center bg-background/80 rounded-full px-2 py-0.5 text-xs font-semibold">
            <Star className="w-3 h-3 mr-1 text-yellow-500 fill-yellow-400" />
            {lot.rating}
        </div>
      </div>
      <CardContent className="p-3 flex-grow flex flex-col justify-between">
        <div>
          <h3 className="font-headline font-semibold text-base leading-tight">{lot.name}</h3>
          <p className="text-xs text-muted-foreground truncate">{lot.address}</p>
        </div>
        <div className="space-y-2 mt-2">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className={cn('w-3 h-3 rounded-full', statusColor)}></div>
                    <p className="text-sm font-semibold">{lot.availableSpots} <span className="font-normal text-muted-foreground">/ {lot.totalSpots} spots</span></p>
                </div>
                <p className="text-base font-semibold">₹{lot.pricePerHour}<span className="text-sm font-normal text-muted-foreground">/hr</span></p>
            </div>
            <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1" onClick={(e) => { e.stopPropagation(); window.open(`https://www.google.com/maps/dir/?api=1&destination=${lot.position.lat},${lot.position.lng}`, '_blank'); }}>
                    <Navigation/>
                </Button>
                <Button size="sm" className="flex-1" onClick={(e) => { e.stopPropagation(); onBook(); }}>
                    <Zap className="mr-2"/> Book Now
                </Button>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
