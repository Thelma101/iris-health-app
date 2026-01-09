'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import AddCommunityModal from '@/components/ui/AddCommunityModal';
import CommunityDetailsModal from '@/components/ui/CommunityDetailsModal';
import EditCommunityModal from '@/components/ui/EditCommunityModal';

interface Community {
  id: number;
  name: string;
  lga: string;
  dateVisited: string;
  fieldOfficer: string;
  population?: string;
  totalTests?: string;
  visitationDates?: string[];
}

const communityData: Community[] = [
  { id: 1, name: 'Ketu', lga: 'Kosofe', dateVisited: '23/09/2025', fieldOfficer: 'Opeyemi Braka', population: '12,000', totalTests: '1,200', visitationDates: ['23/09/2025', '15/08/2025'] },
  { id: 2, name: 'Igbogbo', lga: 'Ikorodu', dateVisited: '01/08/2024', fieldOfficer: 'Michael Tokunbo', population: '23,000', totalTests: '2,000', visitationDates: ['20/02/2025', '09/12/2024'] },
];

export default function CommunityPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [communities, setCommunities] = useState<Community[]>(communityData);
  const [filteredData, setFilteredData] = useState(communityData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleSearch = () => {
    const filtered = communities.filter(
      (community) =>
        community.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        community.lga.toLowerCase().includes(searchTerm.toLowerCase()) ||
        community.fieldOfficer.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredData(filtered);
  };

  const handleAddCommunity = (data: { community: string; lga: string; fieldOfficers: string[] }) => {
    const newCommunity: Omit<Community, 'id'> = {
      name: data.community,
      lga: data.lga,
      dateVisited: new Date().toLocaleDateString('en-GB'),
      fieldOfficer: data.fieldOfficers[0] || '',
      visitationDates: [new Date().toLocaleDateString('en-GB')],
    };
    const community: Community = {
      ...newCommunity,
      id: communities.length + 1
    };
    const updated = [...communities, community];
    setCommunities(updated);
    setFilteredData(updated);
  };

  const handleEditCommunity = (id: number, updatedData: Partial<Community>) => {
    const updated = communities.map(c => c.id === id ? { ...c, ...updatedData } : c);
    setCommunities(updated);
    setFilteredData(updated);
  };

  const handleDeleteCommunity = (id: number) => {
    const updated = communities.filter(c => c.id !== id);
    setCommunities(updated);
    setFilteredData(updated);
  };

  return (
    <main className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="h-12 sm:h-[50px] rounded-lg bg-gradient-to-r from-[#fff9e6] to-[#e8f1ff] border-2 border-[#fff9e6] flex items-center px-4 sm:px-5">
        <span className="text-base sm:text-xl font-semibold text-[#212b36] uppercase font-poppins">Community</span>
      </div>

      {/* Search and Action Bar */}
      <div className="flex flex-col gap-4 sm:gap-6 lg:gap-0 lg:flex-row lg:items-center lg:justify-between">
        {/* Search Section */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-[33px]">
          {/* Search Input */}
          <div className="bg-white border border-[#d9d9d9] rounded-[10px] h-10 sm:h-12 overflow-hidden flex items-center px-4 sm:px-[19px]">
            <div className="flex gap-3 items-center w-full sm:w-[301px]">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[#d9d9d9]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search here"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 border-0 outline-none bg-transparent placeholder:text-[#d9d9d9] text-sm"
              />
            </div>
          </div>

          {/* Search Button */}
          <button
            onClick={handleSearch}
            className="bg-[#2c7be5] text-white rounded-[10px] h-10 sm:h-12 px-6 font-medium text-sm sm:text-base hover:bg-blue-600 transition-colors font-poppins"
          >
            Search
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 sm:gap-[62px]">
          <button className="bg-white border border-[#d9d9d9] text-[#637381] rounded-[10px] h-10 sm:h-12 px-6 font-medium text-sm sm:text-base hover:bg-gray-50 transition-colors font-poppins">
            Export
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#2c7be5] text-white rounded-[10px] h-10 sm:h-12 px-4 sm:px-6 font-medium text-xs sm:text-base whitespace-nowrap hover:bg-blue-600 transition-colors font-poppins"
          >
            Add New Community
          </button>
        </div>
      </div>

      {/* Add Community Modal */}
      <AddCommunityModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddCommunity}
      />

      {/* Community Details Modal */}
      {selectedCommunity && (
        <CommunityDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          community={selectedCommunity}
        />
      )}

      {/* Edit Community Modal */}
      {selectedCommunity && (
        <EditCommunityModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          community={{
            name: selectedCommunity.name,
            lga: selectedCommunity.lga,
            fieldOfficers: [selectedCommunity.fieldOfficer],
          }}
          onSave={(updatedData) => {
            handleEditCommunity(selectedCommunity.id, {
              name: updatedData.name,
              lga: updatedData.lga,
              fieldOfficer: updatedData.fieldOfficers?.[0] || selectedCommunity.fieldOfficer
            });
          }}
        />
      )}

      {/* Table Container with Horizontal Scroll on Mobile */}
      <div className="bg-white rounded-lg border border-[#f4f5f7] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            {/* Table Header */}
            <thead>
              <tr className="bg-[#f4f5f7] border-b border-[#f4f5f7]">
                <th className="text-left px-4 sm:px-6 py-3 sm:py-4 font-semibold text-xs sm:text-sm text-[#637381] font-poppins w-[211px]">
                  Communities
                </th>
                <th className="text-left px-4 sm:px-6 py-3 sm:py-4 font-semibold text-xs sm:text-sm text-[#637381] font-poppins w-[143px]">
                  LGA
                </th>
                <th className="text-left px-4 sm:px-6 py-3 sm:py-4 font-semibold text-xs sm:text-sm text-[#637381] font-poppins w-[116px]">
                  Date Visited
                </th>
                <th className="text-left px-4 sm:px-6 py-3 sm:py-4 font-semibold text-xs sm:text-sm text-[#637381] font-poppins w-[188px]">
                  Field Officer Assigned
                </th>
                <th className="text-center px-4 sm:px-6 py-3 sm:py-4 font-semibold text-xs sm:text-sm text-[#637381] font-poppins w-[144px]">
                  Action
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody>
              {filteredData.map((community, index) => (
                <tr
                  key={community.id}
                  className={`border-b border-[#f4f5f7] hover:bg-gray-50 transition-colors ${
                    index === filteredData.length - 1 ? 'border-0' : ''
                  }`}
                >
                  <td className="text-left px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-[#637381] font-poppins">
                    {community.name}
                  </td>
                  <td className="text-left px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-[#637381] font-poppins">
                    {community.lga}
                  </td>
                  <td className="text-left px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-[#637381] font-poppins">
                    {community.dateVisited}
                  </td>
                  <td className="text-left px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-[#637381] font-poppins">
                    {community.fieldOfficer}
                  </td>
                  <td className="text-center px-4 sm:px-6 py-3 sm:py-4">
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() => {
                          setSelectedCommunity(community);
                          setIsDetailsModalOpen(true);
                        }}
                        className="text-[#f4a100] font-semibold text-xs sm:text-sm hover:underline transition-all font-poppins"
                      >
                        View
                      </button>
                      <button
                        onClick={() => {
                          setSelectedCommunity(community);
                          setIsEditModalOpen(true);
                        }}
                        className="text-[#00c897] font-semibold text-xs sm:text-sm hover:underline transition-all font-poppins"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteCommunity(community.id)}
                        className="text-red-500 font-semibold text-xs sm:text-sm hover:underline transition-all font-poppins"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredData.length === 0 && (
          <div className="flex items-center justify-center py-12 sm:py-16">
            <p className="text-[#637381] text-sm sm:text-base font-poppins">No communities found</p>
          </div>
        )}
      </div>
    </main>
  );
}