'use client';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Users, Car, BarChart } from 'lucide-react';
import type { Booking, ParkingLot } from '@/lib/types';
import { useMemo } from 'react';

interface StatsCardsProps {
  bookings: Booking[];
  parkingLots: ParkingLot[];
}

export default function StatsCards({ bookings, parkingLots }: StatsCardsProps) {
  const stats = useMemo(() => {
    const totalRevenue = bookings
      .filter((b) => b.status === 'completed')
      .reduce((sum, b) => sum + b.pricePaid, 0);

    const totalBookings = bookings.length;

    const totalSpots = parkingLots.reduce((sum, p) => sum + p.totalSpots, 0);
    const availableSpots = parkingLots.reduce(
      (sum, p) => sum + p.availableSpots,
      0
    );
    const liveOccupancy =
      totalSpots > 0 ? ((totalSpots - availableSpots) / totalSpots) * 100 : 0;

    const hourCounts: { [hour: number]: number } = {};
    bookings.forEach((b) => {
      const startHour = new Date(b.startTime).getHours();
      hourCounts[startHour] = (hourCounts[startHour] || 0) + 1;
    });

    let peakStart = -1;
    let peakEnd = -1;
    let maxBookings = 0;
    
    // Find the 3-hour window with the most bookings
    for (let i = 0; i < 24; i++) {
        const windowBookings = (hourCounts[i] || 0) + (hourCounts[(i+1)%24] || 0) + (hourCounts[(i+2)%24] || 0);
        if (windowBookings > maxBookings) {
            maxBookings = windowBookings;
            peakStart = i;
            peakEnd = (i + 2);
        }
    }

    const formatHour = (hour: number) => {
        const h = hour % 24;
        const ampm = h >= 12 ? 'PM' : 'AM';
        const displayHour = h % 12 === 0 ? 12 : h % 12;
        return `${displayHour} ${ampm}`;
    }

    const peakHoursText = peakStart !== -1 ? `${formatHour(peakStart)} - ${formatHour(peakEnd + 1)}` : 'N/A';

    return {
      totalRevenue,
      totalBookings,
      liveOccupancy,
      peakHoursText,
    };
  }, [bookings, parkingLots]);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <span className="text-muted-foreground">Rs</span>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            Rs {stats.totalRevenue.toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground">From completed bookings</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">+{stats.totalBookings}</div>
          <p className="text-xs text-muted-foreground">Across all your lots</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Live Occupancy</CardTitle>
          <Car className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.liveOccupancy.toFixed(0)}%</div>
          <p className="text-xs text-muted-foreground">Across all locations</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Peak Hours</CardTitle>
          <BarChart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.peakHoursText}</div>
          <p className="text-xs text-muted-foreground">Most active period</p>
        </CardContent>
      </Card>
    </div>
  );
}
