'use client';

import { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { ParkingLot } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { CalendarIcon, Clock, Zap, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

interface BookingSheetProps {
  lot: ParkingLot;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const PEAK_HOUR_START = 18; // 6 PM
const PEAK_HOUR_END = 21; // 9 PM
const PEAK_HOUR_MULTIPLIER = 1.5;

export function BookingSheet({ lot, isOpen, onOpenChange }: BookingSheetProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState(format(new Date(), 'HH:mm'));
  const [hours, setHours] = useState('1');
  const [totalPrice, setTotalPrice] = useState(lot.hourlyRate);
  const [isPeak, setIsPeak] = useState(false);
  
  const { toast } = useToast();

  useEffect(() => {
    if (date && time) {
      const [startHours] = time.split(':').map(Number);
      
      const isPeakTime = startHours >= PEAK_HOUR_START && startHours < PEAK_HOUR_END;
      setIsPeak(isPeakTime);

      const basePrice = lot.hourlyRate * parseInt(hours, 10);
      const finalPrice = isPeakTime ? basePrice * PEAK_HOUR_MULTIPLIER : basePrice;
      
      setTotalPrice(finalPrice);
    }
  }, [date, time, hours, lot.hourlyRate]);


  const handleBooking = () => {
    toast({
      title: 'Booking Confirmed! 🎉',
      description: `Your spot at ${lot.name} is reserved. A QR code has been sent to you.`,
    });
    onOpenChange(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle className="font-headline text-2xl">Book a Spot</SheetTitle>
          <SheetDescription>
            Reserve your parking at <span className="font-semibold text-primary">{lot.name}</span>.
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-6 py-6">
           <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2"><CalendarIcon className="w-4 h-4 text-muted-foreground"/> Select Date</h4>
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-md border"
                  disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
                />
              </div>
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2"><Clock className="w-4 h-4 text-muted-foreground"/> Start Time</h4>
                <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
                <h4 className="font-medium flex items-center gap-2 pt-4"><Clock className="w-4 h-4 text-muted-foreground"/> Select Duration</h4>
                <Select onValueChange={setHours} defaultValue={hours}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    {[...Array(8)].map((_, i) => (
                      <SelectItem key={i + 1} value={`${i + 1}`}>
                        {i + 1} hour{i > 0 ? 's' : ''}
                      </SelectItem>
                    ))}
                    <SelectItem value="24">All Day</SelectItem>
                  </SelectContent>
                </Select>
            </div>
           </div>
        </div>
        <SheetFooter>
            <div className="w-full space-y-4">
                <div className="flex justify-between items-center text-lg font-semibold">
                    <span>Total Price:</span>
                     <div className="flex items-center gap-2">
                        {isPeak && (
                            <Badge variant="destructive" className="flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3"/>
                                Peak Price
                            </Badge>
                        )}
                        <span>Rs {totalPrice.toFixed(2)}</span>
                    </div>
                </div>
                <Button type="submit" size="lg" className="w-full" onClick={handleBooking}>
                    <Zap className="mr-2"/> Book Now & Pay
                </Button>
            </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
