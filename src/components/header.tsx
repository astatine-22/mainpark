import Link from 'next/link';
import { Car, Search } from 'lucide-react';
import { MainNav } from './main-nav';
import { UserNav } from './user-nav';
import { Input } from './ui/input';

interface HeaderProps {
  searchTerm?: string;
  onSearchTermChange?: (term: string) => void;
  showSearch?: boolean;
}

export default function Header({ searchTerm, onSearchTermChange, showSearch }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-sm">
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        <Link href="/" className="flex items-center space-x-2">
          <Car className="h-6 w-6 text-primary" />
          <span className="font-headline text-xl font-bold text-primary">
            ParkSmart
          </span>
        </Link>
        <div className="flex flex-1 items-center justify-center px-4 lg:px-8">
            {showSearch && (
              <div className="relative w-full max-w-md">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                      placeholder="Search parking by name or address..." 
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => onSearchTermChange?.(e.target.value)}
                  />
              </div>
            )}
        </div>
        <div className="flex items-center justify-end space-x-4">
          <MainNav />
          <UserNav />
        </div>
      </div>
    </header>
  );
}
