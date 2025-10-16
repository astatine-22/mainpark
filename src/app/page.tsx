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
    <>
      <Header
        onSearchSubmit={handleSearchSubmit}
        onNearbyClick={handleNearbyClick}
        showSearch={true}
      />
      <div className="h-[calc(100vh-4rem)] w-full">
        <MapContainer searchTerm={searchTerm} isNearbySearch={isNearbySearch} onSearchHandled={() => setIsNearbySearch(false)} />
      </div>
    </>
  );
}
