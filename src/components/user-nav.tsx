'use client';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useFirebase, useUser, useDoc, useMemoFirebase } from '@/firebase';
import type { UserProfile } from '@/lib/types';
import { doc } from 'firebase/firestore';
import Link from 'next/link';
import { LogIn, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';


export function UserNav() {
  const { auth, firestore } = useFirebase();
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  const userDocRef = useMemoFirebase(() => {
      if (!user) return null;
      return doc(firestore, `users/${user.uid}`);
  }, [firestore, user]);
  
  const { data: userProfile } = useDoc<UserProfile>(userDocRef);


  const handleLogout = async () => {
    await auth.signOut();
    router.push('/login');
  };

  if (isUserLoading) {
    return <Button variant="outline" disabled>Loading...</Button>
  }

  if (!user || !userProfile) {
    return (
       <Link href="/login" passHref>
        <Button variant="outline">
          <LogIn className="mr-2" />
          Login
        </Button>
      </Link>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-9 w-9">
             <AvatarImage 
              src={`https://api.dicebear.com/8.x/lorelei/svg?seed=${user.uid}`} 
              alt="User avatar" 
            />
            <AvatarFallback>{userProfile.name.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{userProfile.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {userProfile.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {userProfile.userType === 'owner' && (
            <Link href="/dashboard">
              <DropdownMenuItem>
                Dashboard
              </DropdownMenuItem>
            </Link>
          )}
           <Link href="/">
              <DropdownMenuItem>
                Find Parking
              </DropdownMenuItem>
            </Link>
          <DropdownMenuItem disabled>
            Settings
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
