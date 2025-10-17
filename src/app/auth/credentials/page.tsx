'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Car, Building, ArrowLeft } from 'lucide-react';

function CredentialsForm() {
  const searchParams = useSearchParams();
  const userType = searchParams.get('type') || 'driver';
  const flow = searchParams.get('flow') || 'login';

  const isLogin = flow === 'login';
  const isOwner = userType === 'owner';

  const title = isLogin
    ? `${isOwner ? 'Owner' : 'Driver'} Login`
    : `Create ${isOwner ? 'an Owner' : 'a Driver'} Account`;
  
  const description = isLogin
    ? `Welcome back! Please enter your credentials to access your ${isOwner ? 'dashboard' : 'account'}.`
    : `Join ParkSmart! Fill out the form below to get started.`;

  return (
    <div className="flex items-center justify-center min-h-screen bg-secondary">
      <Card className="w-full max-w-md m-4">
        <CardHeader className="text-center">
          {isOwner ? (
             <Building className="mx-auto h-12 w-12 text-muted-foreground" />
          ) : (
             <Car className="mx-auto h-12 w-12 text-muted-foreground" />
          )}
          <CardTitle className="text-2xl font-bold font-headline mt-4">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isLogin && (
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" placeholder="John Doe" required />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="user@example.com" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" required />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button className="w-full">{isLogin ? 'Log In' : 'Create Account'}</Button>
          <div className="text-center text-sm">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <Link
              href={`/auth/credentials?type=${userType}&flow=${isLogin ? 'signup' : 'login'}`}
              className="underline ml-1"
            >
              {isLogin ? 'Sign Up' : 'Log In'}
            </Link>
          </div>
        </CardFooter>
      </Card>
      <Link href="/login" passHref>
          <Button variant="ghost" className="absolute top-4 left-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Role Selection
          </Button>
      </Link>
    </div>
  );
}

export default function CredentialsPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <CredentialsForm />
        </Suspense>
    )
}
