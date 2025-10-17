'use client';
import Header from '@/components/header';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import StatsCards from '@/components/dashboard/stats-cards';
import OccupancyChart from '@/components/dashboard/occupancy-chart';
import RecentBookings from '@/components/dashboard/recent-bookings';
import OccupancyPredictor from '@/components/dashboard/occupancy-predictor';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import type { Booking, ParkingLot } from '@/lib/types';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2, PlusCircle } from 'lucide-react';
import AddLotForm from '@/components/dashboard/add-lot-form';
import { APIProvider } from '@vis.gl/react-google-maps';


export default function DashboardPage() {
  const { firestore } = useFirebase();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const [isAddLotOpen, setIsAddLotOpen] = useState(false);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [isUserLoading, user, router]);

  const parkingLotsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(firestore, 'parking_lots'),
      where('managerId', '==', user.uid)
    );
  }, [firestore, user]);

  const {
    data: parkingLots,
    isLoading: isLoadingLots,
    error: lotsError,
  } = useCollection<ParkingLot>(parkingLotsQuery);

  const lotIds = useMemoFirebase(
    () => parkingLots?.map((lot) => lot.id) || [],
    [parkingLots]
  );

  const bookingsQuery = useMemoFirebase(() => {
    if (!lotIds || lotIds.length === 0) return null;
    return query(
      collection(firestore, 'bookings'),
      where('parkingLotId', 'in', lotIds)
    );
  }, [firestore, lotIds]);

  const {
    data: bookings,
    isLoading: isLoadingBookings,
    error: bookingsError,
  } = useCollection<Booking>(bookingsQuery);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (isUserLoading || isLoadingLots || isLoadingBookings) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-16 w-16 animate-spin" />
      </div>
    );
  }

  if (lotsError || bookingsError) {
    return (
      <div className="container py-10 text-center">
        <p className="text-destructive">
          Error loading dashboard data. Please try again later.
        </p>
      </div>
    );
  }

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
    <APIProvider apiKey={apiKey} libraries={['geocoding']}>
      <Header
        showSearch={false}
        onSearchSubmit={() => {}}
        onNearbyClick={() => {}}
      />
      <div className="container mx-auto py-10">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold tracking-tight font-headline">
              Manager Dashboard
            </h2>
            <Dialog open={isAddLotOpen} onOpenChange={setIsAddLotOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add New Lot
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add New Parking Lot</DialogTitle>
                  <DialogDescription>
                    Fill in the details below to add a new parking lot to your
                    portfolio.
                  </DialogDescription>
                </DialogHeader>
                <AddLotForm
                  managerId={user?.uid}
                  onSuccess={() => setIsAddLotOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </div>
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="predictor">AI Predictor</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="space-y-4">
              <StatsCards
                parkingLots={parkingLots || []}
                bookings={bookings || []}
              />
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                  <CardHeader>
                    <CardTitle>Recent Bookings</CardTitle>
                    <CardDescription>
                      A list of the most recent bookings.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <RecentBookings bookings={bookings || []} />
                  </CardContent>
                </Card>
                <Card className="col-span-4 md:col-span-3">
                  <CardHeader>
                    <CardTitle>AI Occupancy Predictor</CardTitle>
                    <CardDescription>
                      Predict future occupancy rates using AI.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <OccupancyPredictor parkingLots={parkingLots || []} />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            <TabsContent value="analytics" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Occupancy Analytics</CardTitle>
                  <CardDescription>
                    View occupancy trends over time to optimize your
                    operations.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                  <OccupancyChart bookings={bookings || []} />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="predictor" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>AI Occupancy Predictor</CardTitle>
                  <CardDescription>
                    Leverage AI to predict parking occupancy trends and inform
                    users of likely availability, helping them plan their trips
                    better.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <OccupancyPredictor parkingLots={parkingLots || []} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </APIProvider>
  );
}
