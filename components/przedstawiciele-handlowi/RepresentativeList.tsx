'use client';

import { useState, useMemo } from 'react';
import { Phone, Mail, MapPin, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Image from 'next/image';

interface User {
  id: number;
  name: string;
  phone: string;
  email: string;
  img: string;
  woj: string[];
  powiaty: string;
}

interface RepresentativeListProps {
  users: User[];
  searchQuery: string;
  selectedRegions: string[];
  onSearchChange: (query: string) => void;
  onLocationDetect: () => void;
}

export function RepresentativeList({
  users,
  searchQuery,
  selectedRegions,
  onSearchChange,
  onLocationDetect,
}: RepresentativeListProps) {
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);

  const filteredUsers = useMemo(() => {

    return users.filter((user) => {

      const query = searchQuery.toLowerCase();

      // Check if matches user name
      if (user.name.toLowerCase().includes(query)) {
        return true;
      }

      const powiaty: any = user.powiaty;

      const wynik: any[] = powiaty.filter((item: any) => {
        // Usuń "i" i zamień na małe litery dla porównania
        const itemDoPorownania: any = item.toLowerCase().replace(/i/g, '');
        return itemDoPorownania.startsWith(query);
      });

      if (wynik.length > 0) {
        return true;
      }



      // Check if matches any selected region
      if (selectedRegions.length > 0) {
        return selectedRegions.some((region) =>


          powiaty.some(
            (w: any) =>
              w.toLowerCase() === region.toLowerCase() ||
              user.powiaty.includes(region.toLowerCase())
          )
        );
      }

      return false;
    });
  }, [users, searchQuery, selectedRegions]);

  return (
    <div className="w-full min-h-screen" style={{ backgroundColor: '#f8f4f1' }}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search Section */}
        <div className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 mb-6">
            {/* Location Detection Button */}
            <Button
              onClick={onLocationDetect}
              className="w-full h-14 rounded-none text-white border-0 text-base font-semibold"
              style={{ backgroundColor: '#451b49' }}
            >
              <MapPin className="mr-2 h-5 w-5" />
              Ustal moją lokalizację
            </Button>

            {/* Search Input */}
            <div className="relative">
              <Input
                type="text"
                placeholder="Podaj miasto lub kod pocztowy"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                onFocus={() => setSuggestionsOpen(true)}
                className="h-14 px-4 text-base rounded-none border-2 border-gray-300"
              />
              {suggestionsOpen && searchQuery && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded shadow-lg max-h-48 overflow-y-auto z-10">
                  <div className="p-2 text-sm text-gray-600">
                    Sugestie dla: {searchQuery}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Representatives Grid */}
        <div>
          <h2 className="text-3xl font-bold mb-8" style={{ color: '#451b49' }}>
            Nasi przedstawiciele handlowi:
          </h2>

          {filteredUsers.length === 0 ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <p className="text-red-700 font-semibold">
                NIEPOPRAWNA MIEJSCOWOŚĆ LUB KOD POCZTOWY
              </p>
              <p className="text-red-600 mt-2">spróbuj jeszcze raz</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredUsers.map((user) => (
                <RepresentativeCard
                  key={user.phone}
                  user={user}
                  isExpanded={expandedIds.has(user.id)}
                  onToggleExpand={() => {
                    const newSet = new Set(expandedIds);
                    if (newSet.has(user.id)) {
                      newSet.delete(user.id);
                    } else {
                      newSet.add(user.id);
                    }
                    setExpandedIds(newSet);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface RepresentativeCardProps {
  user: User;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

function RepresentativeCard({ user, isExpanded, onToggleExpand }: RepresentativeCardProps) {

  const powiatyList: any = user.powiaty;
  //console.log(powiatyList);
  const displayCount = 3;
  const powiatyList_small = powiatyList.slice(0, displayCount).join(", ");
  const powiatyList_full = powiatyList.join(", ");

  const hasMore = powiatyList.length > displayCount;

  return (
    <div className="rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow" style={{ backgroundColor: '#f8f4f1' }}>
      {/* Large Image */}
      <div className="w-full relative aspect-square  overflow-hidden bg-gray-200">
        <Image
          src={user.img}
          fill
          alt={user.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Name */}
        <h3 className="text-xl font-bold mb-4" style={{ color: '#451b49' }}>
          {user.name}
        </h3>

        {/* Contact Info */}
        <div className="space-y-3 mb-6">
          <a
            href={`tel:${user.phone}`}
            className="flex items-center gap-3 text-sm font-medium"
            style={{ color: '#451b49' }}
          >
            <Phone className="w-5 h-5" />
            <span>{user.phone}</span>
          </a>
          <a
            href={`mailto:${user.email}`}
            className="flex items-center gap-3 text-sm font-medium break-all"
            style={{ color: '#451b49' }}
          >
            <Mail className="w-5 h-5" />
            <span>{user.email}</span>
          </a>
        </div>

        {/* Regions */}
        <div className="border-t pt-4" style={{ borderColor: '#e0dbd3' }}>
          <p className="font-semibold text-sm mb-3" style={{ color: '#451b49' }}>
            Obsługiwane powiaty:
          </p>

          <ul className="text-sm space-y-1 text-gray-700 mb-3">
            {isExpanded ? (
              <span>    {powiatyList_full}</span>

            ) : (
              <span>                {powiatyList_small}</span>
            )}
          </ul>

          {hasMore && (
            <button
              onClick={onToggleExpand}
              className="text-sm font-medium flex items-center gap-2 px-3 py-2 rounded hover:opacity-80 transition"
              style={{ color: '#451b49', backgroundColor: 'rgba(69, 27, 73, 0.1)' }}
            >
              {isExpanded ? 'schowaj' : 'zobacz więcej'}
              <ChevronDown className={`w-4 h-4 ${isExpanded ? 'rotate-180' : ''}`} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
