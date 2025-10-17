export type ParkingLot = {
  id: string;
  name: string;
  address: string;
  position: {
    lat: number;
    lng: number;
  };
  rating: number;
  totalSpots: number;
  availableSpots: number;
  pricePerHour: number;
  image: {
    url: string;
    hint: string;
  };
};

export type Booking = {
  id: string;
  parkingLot: Pick<ParkingLot, 'name' | 'address'>;
  user: {
    name: string;
    avatarUrl: string;
  };
  startTime: Date;
  endTime: Date;
  amount: number;
  status: 'active' | 'completed' | 'cancelled';
};

export type UserProfile = {
  uid: string;
  email: string;
  name: string;
  userType: 'driver' | 'owner';
};
