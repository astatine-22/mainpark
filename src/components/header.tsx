import Link from 'next/link';
import { Car } from 'lucide-react';
import { MainNav } from './main-nav';
import { UserNav } from './user-nav';

export default function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-sm">
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        <Link href="/" className="flex items-center space-x-2">
          <Car className="h-6 w-6 text-primary" />
          <span className="font-headline text-xl font-bold text-primary">
            ParkSmart
          </span>
        </Link>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <MainNav />
          <UserNav />
        </div>
      </div>
    </header>
  );
}
