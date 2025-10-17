'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Suspense, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Car, Building, ArrowLeft, Loader2 } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import { useToast } from '@/hooks/use-toast';
import { useFirebase, useUser } from '@/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import type { UserProfile } from '@/lib/types';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  getAdditionalUserInfo
} from 'firebase/auth';

function CredentialsForm() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { auth, firestore } = useFirebase();
  const { user, isUserLoading } = useUser();

  const userType = searchParams.get('type') || 'driver';
  const flow = searchParams.get('flow') || 'login';

  const isLogin = flow === 'login';
  const isOwner = userType === 'owner';

  useEffect(() => {
    if (!isUserLoading && user) {
      toast({
        title: 'Login Successful!',
        description: 'Redirecting...',
      });
      // The user's profile might not be created instantly in Firestore,
      // so we redirect based on the URL param as a fallback. A more robust
      // solution might involve waiting for the Firestore document.
      router.push(isOwner ? '/dashboard' : '/');
    }
  }, [user, isUserLoading, router, isOwner, toast]);

  const title = isLogin
    ? `${isOwner ? 'Owner' : 'Driver'} Login`
    : `Create ${isOwner ? 'an Owner' : 'a Driver'} Account`;

  const description = isLogin
    ? `Welcome back! Please enter your credentials to access your ${
        isOwner ? 'dashboard' : 'account'
      }.`
    : `Join ParkSmart! Fill out the form below to get started.`;

  const formSchema = z.object({
    name: isLogin
      ? z.string().optional()
      : z.string().min(2, 'Name must be at least 2 characters.'),
    email: z.string().email('Please enter a valid email address.'),
    password: z.string().min(8, 'Password must be at least 8 characters.'),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (isLogin) {
      try {
        await signInWithEmailAndPassword(auth, values.email, values.password);
        // The useEffect will handle redirection upon successful login.
      } catch (error: any) {
        console.error('Login Error:', error);
        let description = 'Could not log in. Please try again.';
        if (
          error.code === 'auth/invalid-credential' ||
          error.code === 'auth/user-not-found' ||
          error.code === 'auth/wrong-password'
        ) {
          description =
            'Invalid credentials. Please check your email and password.';
        } else if (error.code === 'auth/too-many-requests') {
          description =
            'Access temporarily disabled due to too many failed login attempts. Please try again later.';
        }
        toast({
          variant: 'destructive',
          title: 'Login Failed',
          description,
        });
      }
    } else {
      try {
        const tempUserCredential = await createUserWithEmailAndPassword(
          auth,
          values.email,
          values.password
        );
        const user = tempUserCredential.user;

        if (user && values.name) {
          const userDocRef = doc(firestore, 'users', user.uid);
          const newUserProfile: UserProfile = {
            uid: user.uid,
            email: values.email,
            name: values.name,
            userType: isOwner ? 'owner' : 'driver',
          };
          setDocumentNonBlocking(userDocRef, newUserProfile, { merge: true });

          toast({
            title: 'Account Created!',
            description: 'You can now log in with your new account.',
          });
          await signOut(auth);
          router.push(`/auth/credentials?type=${userType}&flow=login`);
        }
      } catch (error: any) {
        console.error('Signup Error:', error);
        let description = 'Could not create account. Please try again.';
        if (error.code === 'auth/email-already-in-use') {
          description = 'An account with this email address already exists.';
        } else if (error.code === 'auth/too-many-requests') {
          description =
            'Account creation is temporarily disabled due to too many attempts. Please try again later.';
        } else {
          description = error.message || description;
        }

        toast({
          variant: 'destructive',
          title: 'Uh oh! Something went wrong.',
          description: description,
        });
      }
    }
  }

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      const additionalUserInfo = getAdditionalUserInfo(result);

      if (additionalUserInfo?.isNewUser) {
        const userDocRef = doc(firestore, "users", user.uid);
        const newUserProfile: UserProfile = {
          uid: user.uid,
          email: user.email!,
          name: user.displayName!,
          userType: isOwner ? "owner" : "driver",
        };
        // Use setDoc here to ensure the profile is created before redirect
        await setDoc(userDocRef, newUserProfile);
      }
      // The useEffect hook will handle the redirect for both new and existing users.
    } catch (error: any) {
      // If the user closes the popup, do nothing. This is not a "real" error.
      if (error.code === 'auth/popup-closed-by-user') {
        return;
      }
      
      console.error("Google Sign-In Error:", error);
       toast({
        variant: "destructive",
        title: "Google Sign-In Failed",
        description: error.message || "Could not sign in with Google. Please try again."
      });
    }
  };


  return (
    <div className="flex items-center justify-center min-h-screen bg-secondary">
      <Card className="w-full max-w-md m-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardHeader className="text-center">
              {isOwner ? (
                <Building className="mx-auto h-12 w-12 text-muted-foreground" />
              ) : (
                <Car className="mx-auto h-12 w-12 text-muted-foreground" />
              )}
              <CardTitle className="text-2xl font-bold font-headline mt-4">
                {title}
              </CardTitle>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isLogin && (
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="user@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting || isUserLoading}
              >
                {(isSubmitting || isUserLoading) && (
                  <Loader2 className="animate-spin" />
                )}
                {isLogin ? 'Log In' : 'Create Account'}
              </Button>
               <div className="relative w-full">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>
              <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} type="button">
                <FcGoogle className="mr-2 h-5 w-5" />
                Google
              </Button>
              <div className="text-center text-sm">
                {isLogin ? "Don't have an account?" : 'Already have an account?'}
                <Link
                  href={`/auth/credentials?type=${userType}&flow=${
                    isLogin ? 'signup' : 'login'
                  }`}
                  className="underline ml-1"
                >
                  {isLogin ? 'Sign Up' : 'Log In'}
                </Link>
              </div>
            </CardFooter>
          </form>
        </Form>
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
  );
}
