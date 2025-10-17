'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useFirebase, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';

export function MainNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const pathname = usePathname();
  const { firestore, user } = useFirebase();

  const userDocRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, `users/${user.uid}`);
  }, [firestore, user]);

  const { data: userProfile } = useDoc<UserProfile>(userDocRef);

  const allRoutes = [
    {
      href: '/',
      label: 'Find Parking',
      active: pathname === '/',
      allowedRoles: ['driver', 'owner'],
    },
    {
      href: '/dashboard',
      label: 'Manager Dashboard',
      active: pathname === '/dashboard',
      allowedRoles: ['owner'],
    },
  ];

  const routes = allRoutes.filter(route => 
    userProfile ? route.allowedRoles.includes(userProfile.userType) : route.href === '/'
  );

  return (
    <nav
      className={cn('hidden md:flex items-center space-x-4 lg:space-x-6', className)}
      {...props}
    >
      {routes.map((route) => (
        <Link
          key={route.href}
          href={route.href}
          className={cn(
            'text-sm font-medium transition-colors hover:text-primary',
            route.active
              ? 'text-primary dark:text-white'
              : 'text-muted-foreground'
          )}
        >
          {route.label}
        </Link>
      ))}
    </nav>
  );
}
