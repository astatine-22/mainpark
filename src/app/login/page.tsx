'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Car, Building } from 'lucide-react';

const userRoles = [
  {
    name: 'Driver',
    description: 'Find, book, and pay for parking instantly.',
    icon: Car,
    type: 'driver',
  },
  {
    name: 'Parking Lot Owner',
    description: 'Manage your listings and view analytics.',
    icon: Building,
    type: 'owner',
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
        <h1 className="text-5xl font-bold font-headline text-primary mb-2">
          Welcome to ParkSmart
        </h1>
        <p className="text-xl text-muted-foreground">
          Please select your role to continue
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl w-full">
        {userRoles.map((role) => (
          <Card
            key={role.name}
            onClick={() => handleRoleSelect(role.type)}
            className="group cursor-pointer transition-all duration-300 ease-in-out hover:shadow-2xl hover:ring-2 hover:ring-primary hover:scale-105 overflow-hidden text-center bg-card border-2 border-transparent"
          >
            <CardHeader className="p-0">
               <div className="bg-secondary/50 p-10">
                 <div className="mx-auto w-28 h-28 rounded-full bg-background flex items-center justify-center border-4 border-secondary group-hover:bg-primary/10 group-hover:border-primary/20 transition-colors">
                    <role.icon className="w-14 h-14 text-primary" />
                 </div>
               </div>
            </CardHeader>
            <CardContent className="p-6">
                <CardTitle className="text-2xl font-headline font-semibold">{role.name}</CardTitle>
                <CardDescription className="mt-2 text-base">{role.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
