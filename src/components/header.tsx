import Link from 'next/link';
import { Car, Search, LocateFixed } from 'lucide-react';
import { MainNav } from './main-nav';
import { UserNav } from './user-nav';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';


interface HeaderProps {
  searchTerm?: string;
  onSearchTermChange?: (term: string) => void;
  onSearchSubmit?: () => void;
  onNearbyClick?: () => void;
  showSearch?: boolean;
}

export default function Header({ searchTerm, onSearchTermChange, onSearchSubmit, onNearbyClick, showSearch }: HeaderProps) {
  
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      onSearchSubmit?.();
    }
  };

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
              <div className="relative w-full max-w-md flex items-center gap-2">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                      placeholder="Search any city or locality..." 
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => onSearchTermChange?.(e.target.value)}
                      onKeyDown={handleKeyDown}
                  />
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="icon" onClick={onNearbyClick} className="flex-shrink-0">
                          <LocateFixed className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Find parking near me</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
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
