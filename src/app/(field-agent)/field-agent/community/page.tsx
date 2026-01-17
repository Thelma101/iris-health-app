'use client';

import { useState, useEffect, useCallback } from 'react';
import { fieldAgentApi } from '@/lib/api/field-agent';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import SearchIcon from '@/components/icons/SearchIcon';

interface Community {
  id: string;
  name: string;
  lga: string;
  totalPopulation?: number;
  totalVisits?: number;
  lastVisit?: string;
}

export default function FieldAgentCommunityPage() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchCommunities = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const res = await fieldAgentApi.getMyCommunities() as any;
      const data = res.data?.data?.communities || res.data?.communities || [];
      
      const mappedCommunities: Community[] = data.map((c: any) => ({
        id: c._id || c.id,
        name: c.name,
        lga: c.lga || 'N/A',
        totalPopulation: c.totalPopulation || 0,
        totalVisits: c.totalTestsConducted || c.totalVisits || 0,
        lastVisit: c.dateVisited || c.updatedAt,
      }));
      
      setCommunities(mappedCommunities);
    } catch (err: any) {
      console.error('Error fetching communities:', err);
      setError('Failed to load communities');
      
      // Demo data
      setCommunities([
        { id: '1', name: 'Baiyeku Ikorodu', lga: 'Ikorodu', totalPopulation: 15000, totalVisits: 679 },
        { id: '2', name: 'Agric Ikorodu', lga: 'Ikorodu', totalPopulation: 12000, totalVisits: 542 },
        { id: '3', name: 'Ijede', lga: 'Ikorodu', totalPopulation: 18000, totalVisits: 823 },
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCommunities();
  }, [fetchCommunities]);

  const filteredCommunities = communities.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.lga.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#d9d9d9] rounded-tl-[20px] rounded-bl-[20px] overflow-hidden">
      <div className="p-6 flex flex-col gap-6">
        {/* Page Title */}
        <div 
          className="h-[50px] rounded-lg border-2 border-[#fff9e6] flex items-center px-4"
          style={{ 
            backgroundImage: 'linear-gradient(172.45deg, rgba(255, 249, 230, 1) 3.64%, rgba(232, 241, 255, 1) 100.8%)' 
          }}
        >
          <h1 className="font-poppins font-semibold text-xl text-[#212b36] uppercase">
            Community
          </h1>
        </div>

        {/* Search Bar */}
        <div className="relative w-full max-w-md">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#637381]" />
          <input
            type="text"
            placeholder="Search communities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-4 border border-[#d9d9d9] rounded-lg font-poppins text-sm focus:outline-none focus:border-[#2c7be5]"
          />
        </div>

        {/* Communities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCommunities.map((community) => (
            <div
              key={community.id}
              className="bg-[#f4f5f7] rounded-lg p-4 flex flex-col gap-3 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-poppins font-medium text-[#212b36]">
                  {community.name}
                </h3>
                <span className="text-xs text-[#637381] bg-white px-2 py-1 rounded">
                  {community.lga}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#637381]">Population</span>
                <span className="font-medium text-[#212b36]">
                  {community.totalPopulation?.toLocaleString() || 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#637381]">Total Visits</span>
                <span className="font-medium text-[#2c7be5]">
                  {community.totalVisits?.toLocaleString() || 0}
                </span>
              </div>
            </div>
          ))}
        </div>

        {filteredCommunities.length === 0 && (
          <div className="text-center py-8 text-[#637381]">
            No communities found
          </div>
        )}

        {error && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-yellow-700 text-sm">
            {error} - Showing demo data
          </div>
        )}
      </div>
    </div>
  );
}
