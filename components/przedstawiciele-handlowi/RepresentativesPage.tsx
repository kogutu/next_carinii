'use client';

import { useState } from 'react';
import { RepresentativeList } from './RepresentativeList';

interface User {
  id: number;
  name: string;
  phone: string;
  email: string;
  img: string;
  woj: string[];
  powiaty: string[];
}

interface PostalCode {
  code: string;
  city: string;
  powiat: string;
  woj: string;
}

interface Props {
  users: User[];
  postalCodes: PostalCode[];
}

export function RepresentativesPage({ users, postalCodes }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);

  const handleSearchChange = (query: string) => {

    setSearchQuery(query);
    console.log(query)
    if (query.match(/^\d{2}-\d{3}$/)) {
      const foundPostal = postalCodes.find(
        (p) => p.code.toLowerCase() === query.toLowerCase()
      );
      if (foundPostal) {

        setSelectedRegions([foundPostal.powiat]);
      }
    } else {
      setSelectedRegions([]);
    }
  };

  const handleLocationDetect = async () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          setSelectedRegions(['mazowieckie']);
          console.log('Location detected:', position.coords);
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Nie udało się pobrać lokalizacji. Spróbuj ręcznie.');
        }
      );
    } else {
      alert('Geolokalizacja nie jest dostępna w Twojej przeglądarce.');
    }
  };

  return (
    <div className="w-full">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-hert mb-4">
            PRZEDSTAWICIELE HANDLOWI
          </h1>
          <p className="text-gray-500 max-w-2xl">
            Firma HERT posiada przedstawicieli handlowych na terenie całej Polski.
            Możesz skorzystać z ich doradztwa oraz zdobytego doświadczenia. Wyszukaj
            swojego przedstawiciela handlowego w okolicy lub znajdź go na liście.
          </p>
        </div>
      </div>

      <div className="bg-gray-50 py-8">
        <RepresentativeList
          users={users}
          searchQuery={searchQuery}
          selectedRegions={selectedRegions}
          onSearchChange={handleSearchChange}
          onLocationDetect={handleLocationDetect}
        />
      </div>
    </div>
  );
}