'use client';
import { useState, useEffect } from 'react';
import Header from '@/components/header';
import MapContainer from '@/components/map-container';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';

export default function DriverPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isNearbySearch, setIsNearbySearch] = useState(false);
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [isUserLoading, user, router]);

  if (isUserLoading || !user) {
    // Return a loading indicator or null while we wait for auth state
    // and the redirect to happen. This prevents rendering the main page content.
    return <div>Loading...</div>;
  }

  const handleSearchSubmit = (newSearchTerm: string) => {
    setSearchTerm(newSearchTerm);
    setIsNearbySearch(false);
  };

  const handleNearbyClick = () => {
    // Set a flag to indicate nearby search, and clear the term
    setIsNearbySearch(true);
    setSearchTerm('');
  };

  return (
    <div className="flex flex-col h-screen">
      <Header
        onSearchSubmit={handleSearchSubmit}
        onNearbyClick={handleNearbyClick}
        showSearch={true}
      />
      <main className="relative flex-1">
        <MapContainer
          searchTerm={searchTerm}
          isNearbySearch={isNearbySearch}
          onSearchHandled={() => setIsNearbySearch(false)}
        />
      </main>
    </div>
  );
}
