'use client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import type { Booking } from '@/lib/types';
import { useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';
import { useFirebase } from '@/firebase';

interface RecentBookingsProps {
  bookings: Booking[];
}

function BookingRow({ booking }: { booking: Booking }) {
  const { firestore } = useFirebase();

  const userDocRef = useMemoFirebase(() => {
    if (!booking.userId) return null;
    return doc(firestore, 'users', booking.userId);
  }, [firestore, booking.userId]);

  const { data: user, isLoading } = useDoc<UserProfile>(userDocRef);

  const getBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'completed':
        return 'secondary';
      case 'cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  };
  
  if (isLoading) {
      return (
          <div className="flex items-center animate-pulse">
             <div className="h-9 w-9 rounded-full bg-muted"></div>
             <div className="ml-4 space-y-2">
                <div className="h-4 w-24 rounded bg-muted"></div>
                <div className="h-3 w-32 rounded bg-muted"></div>
             </div>
             <div className="ml-auto text-right space-y-2">
                 <div className="h-4 w-16 rounded bg-muted"></div>
                 <div className="h-5 w-20 rounded-full bg-muted"></div>
             </div>
          </div>
      )
  }

  return (
    <div key={booking.id} className="flex items-center">
      <Avatar className="h-9 w-9">
        <AvatarImage
          src={`https://api.dicebear.com/8.x/lorelei/svg?seed=${booking.userId}`}
          alt="Avatar"
        />
        <AvatarFallback>{user?.name.charAt(0) || 'U'}</AvatarFallback>
      </Avatar>
      <div className="ml-4 space-y-1">
        <p className="text-sm font-medium leading-none">{user?.name || 'Unknown User'}</p>
        <p className="text-sm text-muted-foreground">
          {new Date(booking.startTime).toLocaleString()}
        </p>
      </div>
      <div className="ml-auto font-medium text-right">
        <p>Rs {booking.pricePaid}</p>
        <Badge
          variant={getBadgeVariant(booking.status)}
          className="mt-1 capitalize"
        >
          {booking.status}
        </Badge>
      </div>
    </div>
  );
}

export default function RecentBookings({ bookings }: RecentBookingsProps) {
  const sortedBookings = [...bookings].sort(
    (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
  );

  return (
    <div className="space-y-6">
      {sortedBookings.length > 0 ? (
        sortedBookings
          .slice(0, 5)
          .map((booking) => <BookingRow key={booking.id} booking={booking} />)
      ) : (
        <p className="text-sm text-muted-foreground text-center py-8">
          No bookings found yet.
        </p>
      )}
    </div>
  );
}
