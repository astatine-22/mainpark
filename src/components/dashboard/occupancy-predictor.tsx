'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { predictParkingOccupancy } from '@/ai/flows/predict-parking-occupancy';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import type { ParkingLot } from '@/lib/types';

const formSchema = z.object({
  parkingLotId: z.string().min(1, 'Please select a parking lot.'),
  date: z.date({ required_error: 'A date is required.' }),
  time: z.string().min(1, 'A time is required.'),
});

type PredictionResult = {
  predictedOccupancy: number;
  reason: string;
};

interface OccupancyPredictorProps {
    parkingLots: ParkingLot[];
}

export default function OccupancyPredictor({ parkingLots }: OccupancyPredictorProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      parkingLotId: '',
      date: new Date(),
      time: format(new Date(), 'HH:mm'),
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    setResult(null);

    const [hours, minutes] = values.time.split(':');
    const dateTime = new Date(values.date);
    dateTime.setHours(parseInt(hours), parseInt(minutes));

    try {
      const prediction = await predictParkingOccupancy({
        parkingLotId: values.parkingLotId,
        dateTime: dateTime.toISOString(),
      });
      setResult(prediction);
    } catch (error) {
      console.error('Prediction failed:', error);
      // You could show a toast message here
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="parkingLotId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Parking Lot</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={parkingLots.length === 0}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={parkingLots.length > 0 ? "Select a parking lot" : "No parking lots found"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {parkingLots.map((lot) => (
                      <SelectItem key={lot.id} value={lot.id}>
                        {lot.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={'outline'}
                          className={cn(
                            'pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value ? (
                            format(field.value, 'PPP')
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Time</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button type="submit" disabled={loading || parkingLots.length === 0} className="w-full">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Predict Occupancy
          </Button>
        </form>
      </Form>

      {result && (
        <Card className="mt-4 bg-secondary/50">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <p className="font-semibold">Predicted Occupancy</p>
                  <p className="font-bold text-primary">
                    {result.predictedOccupancy.toFixed(0)}%
                  </p>
                </div>
                <Progress value={result.predictedOccupancy} />
              </div>
              <div>
                <p className="text-sm font-semibold mb-1">Reasoning:</p>
                <p className="text-sm text-muted-foreground">
                  {result.reason}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
