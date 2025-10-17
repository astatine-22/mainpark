export type ParkingLot = {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  googlePlaceId: string;
  googleRating: number;
  totalSpots: number;
  availableSpots: number;
  hourlyRate: number;
  dailyRate?: number;
  photoUrls: string[];
  managerId: string;
};

// This type uses Firestore's Timestamp format for dates
// It will be converted to JS Date objects when fetched.
export type Booking = {
  id: string;
  parkingLotId: string;
  userId: string;
  startTime: any; // Firestore Timestamp
  endTime: any; // Firestore Timestamp
  pricePaid: number;
  status: 'active' | 'completed' | 'cancelled';
};


export type UserProfile = {
  uid: string;
  email: string;
  name: string;
  userType: 'driver' | 'owner';
};

    
