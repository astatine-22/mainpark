'use client';
import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMap } from '@vis.gl/react-google-maps';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useFirebase } from '@/firebase';
import { addDoc, collection } from 'firebase/firestore';

const formSchema = z.object({
  name: z.string().min(3, 'Lot name must be at least 3 characters.'),
  address: z.string().min(10, 'Please enter a full address.'),
  totalSpots: z.coerce
    .number()
    .int()
    .positive('Total spots must be a positive number.'),
  hourlyRate: z.coerce
    .number()
    .positive('Hourly rate must be a positive number.'),
});

interface AddLotFormProps {
  managerId?: string;
  onSuccess: () => void;
}

export default function AddLotForm({ managerId, onSuccess }: AddLotFormProps) {
  const { toast } = useToast();
  const { firestore } = useFirebase();
  const [loading, setLoading] = useState(false);

  const map = useMap();
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);

  useEffect(() => {
    if (map && !geocoderRef.current) {
      geocoderRef.current = new google.maps.Geocoder();
    }
  }, [map]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      address: '',
      totalSpots: 100,
      hourlyRate: 50,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!managerId) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No manager ID found. Please log in again.',
      });
      return;
    }
    if (!geocoderRef.current) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Geocoding service is not ready.',
      });
      return;
    }

    setLoading(true);

    try {
      geocoderRef.current.geocode(
        { address: values.address },
        async (results, status) => {
          if (status === 'OK' && results && results[0]) {
            const location = results[0].geometry.location;
            const newLotData = {
              name: values.name,
              address: values.address,
              totalSpots: values.totalSpots,
              hourlyRate: values.hourlyRate,
              latitude: location.lat(),
              longitude: location.lng(),
              googlePlaceId: results[0].place_id,
              googleRating: Math.round((Math.random() * (4.8 - 3.5) + 3.5) * 10) / 10,
              availableSpots: values.totalSpots, // Initially all spots are available
              managerId: managerId,
              photoUrls: [
                `https://picsum.photos/seed/${results[0].place_id}/400/300`,
              ],
            };

            await addDoc(collection(firestore, 'parking_lots'), newLotData);

            toast({
              title: 'Success!',
              description: `Parking lot "${values.name}" has been added.`,
            });
            onSuccess();
          } else {
            toast({
              variant: 'destructive',
              title: 'Geocoding Failed',
              description:
                'Could not find location for the address. Please check the address and try again.',
            });
          }
          setLoading(false);
        }
      );
    } catch (error) {
      console.error('Error adding document: ', error);
      toast({
        variant: 'destructive',
        title: 'Submission Error',
        description: 'Failed to add the parking lot to the database.',
      });
      setLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Lot Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Downtown Secure Park" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Address</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., 123 Main St, New Delhi, India"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="totalSpots"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total Spots</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="hourlyRate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hourly Rate (Rs)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button type="submit" disabled={loading} className="w-full mt-4">
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Add Parking Lot
        </Button>
      </form>
    </Form>
  );
}
