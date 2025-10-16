'use client';
import { useState } from 'react';
import Header from '@/components/header';
import MapContainer from '@/components/map-container';

export default function DriverPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isNearbySearch, setIsNearbySearch] = useState(false);

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
      <main className="flex-1 overflow-hidden">
        <MapContainer
          searchTerm={searchTerm}
          isNearbySearch={isNearbySearch}
          onSearchHandled={() => setIsNearbySearch(false)}
        />
      </main>
    </div>
  );
}
