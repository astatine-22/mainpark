'use client';
import { useState } from 'react';
import Header from '@/components/header';
import MapContainer from '@/components/map-container';

export default function DriverPage() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <>
      <Header
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        showSearch={true}
      />
      <div className="h-screen w-full">
        <MapContainer searchTerm={searchTerm} onSearchTermChange={setSearchTerm}/>
      </div>
    </>
  );
}
