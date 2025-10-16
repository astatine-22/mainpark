'use client';
import { useState } from 'react';
import Header from '@/components/header';
import MapContainer from '@/components/map-container';

export default function DriverPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchTrigger, setSearchTrigger] = useState(0);

  const handleSearchSubmit = () => {
    setSearchTrigger(prev => prev + 1);
  };

  return (
    <>
      <Header
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        onSearchSubmit={handleSearchSubmit}
        showSearch={true}
      />
      <div className="h-[calc(100vh-4rem)] w-full">
        <MapContainer searchTerm={searchTerm} searchTrigger={searchTrigger} />
      </div>
    </>
  );
}
