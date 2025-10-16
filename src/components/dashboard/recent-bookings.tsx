import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { mockBookings } from '@/lib/mock-data';

export default function RecentBookings() {
  return (
    <div className="space-y-6">
      {mockBookings.slice(0,5).map((booking) => (
        <div key={booking.id} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarImage src={booking.user.avatarUrl} alt="Avatar" />
            <AvatarFallback>{booking.user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{booking.user.name}</p>
            <p className="text-sm text-muted-foreground">{booking.parkingLot.name}</p>
          </div>
          <div className="ml-auto font-medium text-right">
            <p>₹{booking.amount}</p>
            <Badge variant={booking.status === 'active' ? 'default' : 'secondary'} className="mt-1">
                {booking.status}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  );
}
