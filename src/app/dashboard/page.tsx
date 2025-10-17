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
import StatsCards from '@/components/dashboard/stats-cards';
import OccupancyChart from '@/components/dashboard/occupancy-chart';
import RecentBookings from '@/components/dashboard/recent-bookings';
import OccupancyPredictor from '@/components/dashboard/occupancy-predictor';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import type { Booking, ParkingLot } from '@/lib/types';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function DashboardPage() {
  const { firestore } = useFirebase();
  const { user, isUserLoading } = useUser();
  const router = useRouter();

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
  
  if (isUserLoading || isLoadingLots || isLoadingBookings) {
    return (
       <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-16 w-16 animate-spin" />
      </div>
    )
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

  return (
    <>
      <Header showSearch={false} onSearchSubmit={() => {}} onNearbyClick={() => {}}/>
      <div className="container mx-auto py-10">
        <div className="space-y-4">
          <h2 className="text-3xl font-bold tracking-tight font-headline">
            Manager Dashboard
          </h2>
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="predictor">AI Predictor</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="space-y-4">
              <StatsCards parkingLots={parkingLots || []} bookings={bookings || []} />
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
    </>
  );
}
