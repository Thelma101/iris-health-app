'use client';

import { useState, useEffect, useCallback } from 'react';
import { fieldAgentApi } from '@/lib/api/field-agent';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import SearchIcon from '@/components/icons/SearchIcon';

interface Community {
  _id: string;
  name: string;
  lga: string;
  totalPopulation?: number;
  totalVisits?: number;
  totalTestsConducted?: number;
  lastVisit?: string;
  dateVisited?: string;
  fieldOfficer?: string;
}

interface CommunityDetails {
  _id: string;
  name: string;
  lga: string;
  population: string;
  fieldOfficers: string[];
  totalTests: number;
  visitationDates: string[];
  patients?: number;
}

export default function FieldAgentCommunityPage() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCommunity, setSelectedCommunity] = useState<CommunityDetails | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');

  const fetchCommunities = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const res = await fieldAgentApi.getMyCommunities() as any;
      const data = res.data?.data?.communities || res.data?.communities || [];
      
      const mappedCommunities: Community[] = data.map((c: any) => ({
        _id: c._id || c.id,
        name: c.name,
        lga: c.lga || 'N/A',
        totalPopulation: c.totalPopulation || c.population || 0,
        totalVisits: c.totalTestsConducted || c.totalVisits || 0,
        totalTestsConducted: c.totalTestsConducted || 0,
        lastVisit: c.dateVisited || c.updatedAt,
        dateVisited: c.dateVisited ? new Date(c.dateVisited).toLocaleDateString() : '-',
        fieldOfficer: c.fieldOfficer || '-',
      }));
      
      setCommunities(mappedCommunities);
    } catch (err: any) {
      console.error('Error fetching communities:', err);
      setError('Failed to load communities');
      
      // Demo data
      setCommunities([
        { _id: '1', name: 'Baiyeku Ikorodu', lga: 'Ikorodu', totalPopulation: 15000, totalVisits: 679, dateVisited: '12/05/2024', fieldOfficer: 'John Doe' },
        { _id: '2', name: 'Agric Ikorodu', lga: 'Ikorodu', totalPopulation: 12000, totalVisits: 542, dateVisited: '10/05/2024', fieldOfficer: 'Jane Smith' },
        { _id: '3', name: 'Ijede', lga: 'Ikorodu', totalPopulation: 18000, totalVisits: 823, dateVisited: '08/05/2024', fieldOfficer: 'Mike Johnson' },
        { _id: '4', name: 'Igbogbo', lga: 'Ikorodu', totalPopulation: 9500, totalVisits: 412, dateVisited: '05/05/2024', fieldOfficer: 'Sarah Williams' },
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

  const handleViewDetails = (community: Community) => {
    setSelectedCommunity({
      _id: community._id,
      name: community.name,
      lga: community.lga,
      population: (community.totalPopulation || 0).toLocaleString(),
      fieldOfficers: community.fieldOfficer ? [community.fieldOfficer] : [],
      totalTests: community.totalVisits || 0,
      visitationDates: community.lastVisit ? [community.lastVisit] : [],
      patients: community.totalPopulation || 0,
    });
    setIsDetailsModalOpen(true);
  };

  const handleExport = () => {
    const headers = ['Community', 'LGA', 'Population', 'Total Tests', 'Last Visit'];
    const csvData = filteredCommunities.map(c => [
      c.name,
      c.lga,
      c.totalPopulation || 0,
      c.totalVisits || 0,
      c.dateVisited || '-'
    ]);
    
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `communities-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#d9d9d9] rounded-tl-[20px] rounded-bl-[20px] overflow-hidden min-h-screen">
      <div className="p-4 sm:p-6 flex flex-col gap-4 sm:gap-6">
        {/* Page Title */}
        <div 
          className="h-12 sm:h-[50px] rounded-lg border-2 border-[#fff9e6] flex items-center px-4"
          style={{ 
            backgroundImage: 'linear-gradient(172.45deg, rgba(255, 249, 230, 1) 3.64%, rgba(232, 241, 255, 1) 100.8%)' 
          }}
        >
          <h1 className="font-poppins font-semibold text-base sm:text-xl text-[#212b36] uppercase">
            Community
          </h1>
        </div>

        {/* Search and Action Bar */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Search Section */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            {/* Search Input */}
            <div className="bg-white border border-[#d9d9d9] rounded-[10px] h-10 sm:h-12 overflow-hidden flex items-center px-4">
              <div className="flex gap-3 items-center w-full sm:w-[301px]">
                <SearchIcon className="w-5 h-5 text-[#d9d9d9]" />
                <input
                  type="text"
                  placeholder="Search communities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 border-0 outline-none bg-transparent placeholder:text-[#d9d9d9] text-sm"
                />
              </div>
            </div>

            {/* Search Button */}
            <button
              className="bg-[#2c7be5] text-white rounded-[10px] h-10 sm:h-12 px-6 font-medium text-sm sm:text-base hover:bg-blue-600 active:bg-blue-700 transition-colors font-poppins"
            >
              Search
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 sm:gap-4">
            {/* View Toggle */}
            <div className="flex border border-[#d9d9d9] rounded-[10px] overflow-hidden">
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-2 ${viewMode === 'table' ? 'bg-[#2c7be5] text-white' : 'bg-white text-[#637381]'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-[#2c7be5] text-white' : 'bg-white text-[#637381]'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
            </div>
            <button 
              onClick={handleExport}
              disabled={communities.length === 0}
              className="bg-white border border-[#d9d9d9] text-[#637381] rounded-[10px] h-10 sm:h-12 px-4 sm:px-6 font-medium text-sm sm:text-base hover:bg-gray-50 active:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-poppins"
            >
              Export
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-yellow-700 text-sm flex items-center justify-between">
            <span>{error} - Showing demo data</span>
            <button onClick={() => setError(null)} className="ml-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Table View */}
        {viewMode === 'table' && (
          <div className="bg-white rounded-lg border border-[#f4f5f7] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="bg-[#f4f5f7] border-b border-[#f4f5f7]">
                    <th className="text-left px-4 sm:px-6 py-3 sm:py-4 font-semibold text-xs sm:text-sm text-[#637381] font-poppins">
                      Community
                    </th>
                    <th className="text-left px-4 sm:px-6 py-3 sm:py-4 font-semibold text-xs sm:text-sm text-[#637381] font-poppins">
                      LGA
                    </th>
                    <th className="text-left px-4 sm:px-6 py-3 sm:py-4 font-semibold text-xs sm:text-sm text-[#637381] font-poppins">
                      Population
                    </th>
                    <th className="text-left px-4 sm:px-6 py-3 sm:py-4 font-semibold text-xs sm:text-sm text-[#637381] font-poppins">
                      Total Tests
                    </th>
                    <th className="text-left px-4 sm:px-6 py-3 sm:py-4 font-semibold text-xs sm:text-sm text-[#637381] font-poppins">
                      Last Visit
                    </th>
                    <th className="text-center px-4 sm:px-6 py-3 sm:py-4 font-semibold text-xs sm:text-sm text-[#637381] font-poppins">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCommunities.map((community, index) => (
                    <tr
                      key={community._id}
                      className={`border-b border-[#f4f5f7] hover:bg-gray-50 transition-colors ${
                        index === filteredCommunities.length - 1 ? 'border-0' : ''
                      }`}
                    >
                      <td className="text-left px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-[#212b36] font-poppins font-medium">
                        {community.name}
                      </td>
                      <td className="text-left px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-[#637381] font-poppins">
                        {community.lga}
                      </td>
                      <td className="text-left px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-[#637381] font-poppins">
                        {community.totalPopulation?.toLocaleString() || '-'}
                      </td>
                      <td className="text-left px-4 sm:px-6 py-3 sm:py-4">
                        <span className="text-xs sm:text-sm text-[#2c7be5] font-medium font-poppins">
                          {community.totalVisits?.toLocaleString() || 0}
                        </span>
                      </td>
                      <td className="text-left px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-[#637381] font-poppins">
                        {community.dateVisited || '-'}
                      </td>
                      <td className="text-center px-4 sm:px-6 py-3 sm:py-4">
                        <button
                          onClick={() => handleViewDetails(community)}
                          className="text-[#f4a100] font-semibold text-xs sm:text-sm hover:underline active:opacity-70 transition-all font-poppins"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Empty State */}
            {filteredCommunities.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 sm:py-16 gap-2">
                <svg className="w-12 h-12 text-[#d9d9d9]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <p className="text-[#637381] text-sm sm:text-base font-poppins">No communities found</p>
              </div>
            )}
          </div>
        )}

        {/* Grid View */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCommunities.map((community) => (
              <div
                key={community._id}
                className="bg-[#f4f5f7] rounded-lg p-4 flex flex-col gap-3 hover:shadow-md transition-shadow"
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
                  <span className="text-[#637381]">Total Tests</span>
                  <span className="font-medium text-[#2c7be5]">
                    {community.totalVisits?.toLocaleString() || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#637381]">Last Visit</span>
                  <span className="font-medium text-[#212b36]">
                    {community.dateVisited || '-'}
                  </span>
                </div>
                <button
                  onClick={() => handleViewDetails(community)}
                  className="mt-2 w-full h-9 bg-[#2c7be5] text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors font-poppins"
                >
                  View Details
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Empty State for Grid */}
        {viewMode === 'grid' && filteredCommunities.length === 0 && (
          <div className="text-center py-8 text-[#637381]">
            No communities found
          </div>
        )}
      </div>

      {/* Community Details Modal */}
      {isDetailsModalOpen && selectedCommunity && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 sm:pt-20 px-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/20"
            onClick={() => setIsDetailsModalOpen(false)}
          />

          {/* Modal */}
          <div className="relative bg-white rounded-[10px] border border-[#d9d9d9] w-full max-w-[466px] max-h-[90vh] overflow-hidden shadow-lg">
            {/* Header */}
            <div className="h-12 bg-white border-b border-[#d9d9d9] flex items-center justify-between px-4 sm:px-[22px]">
              <p className="font-poppins font-medium text-lg sm:text-xl text-[#212b36]">
                {selectedCommunity.name}
              </p>
              <button
                onClick={() => setIsDetailsModalOpen(false)}
                className="text-[#637381] hover:text-[#212b36]"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Map Section */}
            <div className="h-[120px] sm:h-[152px] mx-4 sm:mx-[21px] mt-4 sm:mt-[23px] bg-gray-200 rounded overflow-hidden">
              <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center">
                <svg className="w-12 h-12 text-[#d9d9d9]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>

            {/* Details Section */}
            <div className="px-4 sm:px-[21px] py-4 sm:py-6 flex flex-col gap-5 sm:gap-7 overflow-y-auto max-h-[calc(90vh-200px)]">
              {/* Population */}
              <div className="border-b border-[#d9d9d9] pb-2">
                <p className="font-poppins font-semibold text-sm sm:text-base text-[#212b36]">
                  Population
                </p>
                <p className="font-poppins text-sm text-[#212b36] mt-2">
                  {selectedCommunity.population}
                </p>
              </div>

              {/* LGA */}
              <div className="border-b border-[#d9d9d9] pb-2">
                <p className="font-poppins font-semibold text-sm sm:text-base text-[#212b36]">
                  LGA
                </p>
                <p className="font-poppins text-sm text-[#212b36] mt-2">
                  {selectedCommunity.lga}
                </p>
              </div>

              {/* Field Officers */}
              <div className="border-b border-[#d9d9d9] pb-2">
                <p className="font-poppins font-semibold text-sm sm:text-base text-[#212b36]">
                  Field Officers
                </p>
                <p className="font-poppins text-sm text-[#212b36] mt-2">
                  {selectedCommunity.fieldOfficers.length > 0 
                    ? selectedCommunity.fieldOfficers.join(', ') 
                    : '-'}
                </p>
              </div>

              {/* Total Tests Conducted */}
              <div className="border-b border-[#d9d9d9] pb-2">
                <p className="font-poppins font-semibold text-sm sm:text-base text-[#212b36]">
                  Total Tests Conducted
                </p>
                <p className="font-poppins text-sm text-[#2c7be5] font-medium mt-2">
                  {selectedCommunity.totalTests.toLocaleString()}
                </p>
              </div>

              {/* Visitation Summary */}
              <div className="pb-2">
                <p className="font-poppins font-semibold text-sm sm:text-base text-[#212b36]">
                  Visitation Summary
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedCommunity.visitationDates.length > 0 ? (
                    selectedCommunity.visitationDates.map((date, index) => (
                      <span
                        key={index}
                        className="text-xs bg-[#e8f1ff] text-[#2c7be5] px-2 py-1 rounded"
                      >
                        {new Date(date).toLocaleDateString()}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-[#637381]">No visitation records</span>
                  )}
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="border-t border-[#d9d9d9] px-4 sm:px-[21px] py-4 flex justify-end">
              <button
                onClick={() => setIsDetailsModalOpen(false)}
                className="h-10 px-6 bg-[#2c7be5] text-white rounded-[10px] font-medium text-sm hover:bg-blue-600 transition-colors font-poppins"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
