import type { ParkingLot, Booking } from './types';

export const mockParkingLots: ParkingLot[] = [
  {
    id: 'p1',
    name: 'Central Plaza Parking',
    address: '123 Main St, Connaught Place, Delhi',
    position: { lat: 28.6324, lng: 77.2187 },
    rating: 4.7,
    totalSpots: 150,
    availableSpots: 23,
    pricePerHour: 60,
    image: {
      url: 'https://picsum.photos/seed/parking1/400/300',
      hint: 'parking garage',
    },
  },
  {
    id: 'p2',
    name: 'Select Citywalk Mall Parking',
    address: 'A-3, Saket District Centre, Delhi',
    position: { lat: 28.5284, lng: 77.2191 },
    rating: 4.5,
    totalSpots: 500,
    availableSpots: 120,
    pricePerHour: 80,
    image: {
      url: 'https://picsum.photos/seed/parking2/400/300',
      hint: 'outdoor parking',
    },
  },
  {
    id: 'p3',
    name: 'Metropolis Tower Parking',
    address: 'Cyber City, Gurgaon',
    position: { lat: 28.4947, lng: 77.0886 },
    rating: 4.2,
    totalSpots: 200,
    availableSpots: 8,
    pricePerHour: 70,
    image: {
      url: 'https://picsum.photos/seed/parking3/400/300',
      hint: 'underground parking',
    },
  },
  {
    id: 'p4',
    name: 'Khan Market Street Parking',
    address: 'Khan Market, Delhi',
    position: { lat: 28.6002, lng: 77.2274 },
    rating: 3.8,
    totalSpots: 50,
    availableSpots: 1,
    pricePerHour: 40,
    image: {
      url: 'https://picsum.photos/seed/parking4/400/300',
      hint: 'street parking',
    },
  },
  {
    id: 'p5',
    name: 'Airport T3 Parking',
    address: 'IGI Airport, New Delhi',
    position: { lat: 28.5562, lng: 77.1000 },
    rating: 4.4,
    totalSpots: 1000,
    availableSpots: 350,
    pricePerHour: 120,
    image: {
      url: 'https://picsum.photos/seed/parking5/400/300',
      hint: 'airport parking',
    },
  },
];


export const mockBookings: Booking[] = [
    {
        id: 'b1',
        parkingLot: { name: 'Central Plaza Parking', address: '123 Main St, Connaught Place' },
        user: { name: 'Raj Sharma', avatarUrl: 'https://picsum.photos/seed/avatar1/40/40' },
        startTime: new Date(new Date().setHours(new Date().getHours() - 2)),
        endTime: new Date(new Date().setHours(new Date().getHours() - 1)),
        amount: 60,
        status: 'completed',
    },
    {
        id: 'b2',
        parkingLot: { name: 'Select Citywalk Mall Parking', address: 'A-3, Saket District Centre' },
        user: { name: 'Priya Singh', avatarUrl: 'https://picsum.photos/seed/avatar2/40/40' },
        startTime: new Date(),
        endTime: new Date(new Date().setHours(new Date().getHours() + 3)),
        amount: 240,
        status: 'active',
    },
    {
        id: 'b3',
        parkingLot: { name: 'Metropolis Tower Parking', address: 'Cyber City, Gurgaon' },
        user: { name: 'Ankit Patel', avatarUrl: 'https://picsum.photos/seed/avatar3/40/40' },
        startTime: new Date(new Date().setDate(new Date().getDate() - 1)),
        endTime: new Date(new Date().setDate(new Date().getDate() - 1)),
        amount: 140,
        status: 'completed',
    },
    {
        id: 'b4',
        parkingLot: { name: 'Airport T3 Parking', address: 'IGI Airport, New Delhi' },
        user: { name: 'Sunita Mehta', avatarUrl: 'https://picsum.photos/seed/avatar4/40/40' },
        startTime: new Date(new Date().setDate(new Date().getDate() + 1)),
        endTime: new Date(new Date().setDate(new Date().getDate() + 1)),
        amount: 480,
        status: 'active',
    },
];
