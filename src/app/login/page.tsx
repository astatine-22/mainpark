'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';
import { Car, Building } from 'lucide-react';

const userRoles = [
  {
    name: 'Driver',
    description: 'Find, book, and pay for parking instantly.',
    icon: Car,
    type: 'driver',
    imageId: 'driver-role',
  },
  {
    name: 'Parking Lot Owner',
    description: 'Manage your listings and view analytics.',
    icon: Building,
    type: 'owner',
    imageId: 'owner-role',
  },
];

export default function LoginPage() {
  const router = useRouter();

  const handleRoleSelect = (role: string) => {
    router.push(`/auth/credentials?type=${role}`);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold font-headline text-primary mb-2">
          Welcome to ParkSmart
        </h1>
        <p className="text-lg text-muted-foreground">
          Who are you logging in as?
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
        {userRoles.map((role) => {
          const image = PlaceHolderImages.find(img => img.id === role.imageId);
          return (
            <Card
              key={role.name}
              onClick={() => handleRoleSelect(role.type)}
              className="group cursor-pointer transition-all duration-300 ease-in-out hover:shadow-2xl hover:ring-2 hover:ring-primary hover:scale-105"
            >
              <CardContent className="relative p-0 flex flex-col items-center justify-center text-center">
                <div className="relative w-full h-80">
                   <Image
                    src={image?.imageUrl || `https://picsum.photos/seed/${role.imageId}/600/800`}
                    alt={role.name}
                    fill
                    className="rounded-t-lg object-cover"
                    data-ai-hint={image?.imageHint}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                </div>
                <div className="absolute bottom-0 p-6 text-white w-full">
                  <role.icon className="h-12 w-12 mx-auto mb-4 p-2 bg-white/20 rounded-full text-white" />
                  <h2 className="text-3xl font-headline font-bold">{role.name}</h2>
                  <p className="text-white/80 mt-1">{role.description}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
