'use client';
import api, { Community as APICommunity } from '@/lib/api/index';
import { useEffect, useState, useCallback } from 'react';
import AddCommunityModal from '@/components/ui/AddCommunityModal';
import CommunityDetailsModal from '@/components/ui/CommunityDetailsModal';
import EditCommunityModal from '@/components/ui/EditCommunityModal';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ConfirmModal from '@/components/ui/ConfirmModal';

interface Community {
  _id: string;
  name: string;
  lga: string;
  dateVisited?: string;
  fieldOfficer?: string;
  fieldOfficers?: Array<{ _id: string; firstName: string; lastName: string; email: string }>;
  population?: string;
  totalTests?: string;
  totalPopulation?: number;
  totalTestsConducted?: number;
  visitationDates?: string[];
}

export default function CommunityPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [communities, setCommunities] = useState<Community[]>([]);
  const [filteredData, setFilteredData] = useState<Community[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [communityToDelete, setCommunityToDelete] = useState<Community | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch communities from API
  const fetchCommunities = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getCommunities();
      if (res?.success && res.data) {
        const communityData = (res.data as { communities: APICommunity[] })?.communities || [];
        const mappedCommunities: Community[] = communityData.map((c) => ({
          _id: c._id,
          name: c.name,
          lga: c.lga,
          dateVisited: c.dateVisited || '-',
          fieldOfficers: c.fieldOfficers,
          fieldOfficer: c.fieldOfficers?.map(fo => `${fo.firstName} ${fo.lastName}`).join(', ') || '-',
          totalPopulation: c.totalPopulation,
          totalTestsConducted: c.totalTestsConducted,
        }));
        setCommunities(mappedCommunities);
        setFilteredData(mappedCommunities);
      } else {
        setError(res?.error || 'Failed to fetch communities');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch communities';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCommunities();
  }, [fetchCommunities]);

  // Auto-dismiss success message
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setFilteredData(communities);
      return;
    }
    const filtered = communities.filter(
      (community) =>
        community.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        community.lga.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (community.fieldOfficer || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredData(filtered);
  };

  // Handle Enter key for search
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleAddCommunity = async (data: { community: string; lga: string; fieldOfficers: string[] }) => {
    setActionLoading(true);
    setError(null);
    try {
      const payload = {
        name: data.community,
        lga: data.lga,
        fieldOfficers: data.fieldOfficers,
      };
      const res = await api.createCommunity(payload);
      if (res?.success && res.data) {
        setSuccessMessage('Community added successfully!');
        setIsModalOpen(false);
        fetchCommunities(); // Refresh the list
      } else {
        setError(res?.error || 'Failed to add community');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add community';
      setError(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditCommunity = async (id: string, updatedData: Partial<Community>) => {
    setActionLoading(true);
    setError(null);
    try {
      const res = await api.updateCommunity(id, updatedData);
      if (res?.success && res.data) {
        setSuccessMessage('Community updated successfully!');
        setIsEditModalOpen(false);
        setSelectedCommunity(null);
        fetchCommunities(); // Refresh the list
      } else {
        setError(res?.error || 'Failed to update community');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update community';
      setError(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteCommunity = async () => {
    if (!communityToDelete) return;
    
    setActionLoading(true);
    setError(null);
    try {
      const res = await api.deleteCommunity(communityToDelete._id);
      if (res?.success) {
        setSuccessMessage('Community deleted successfully!');
        setCommunities((prev) => prev.filter((c) => c._id !== communityToDelete._id));
        setFilteredData((prev) => prev.filter((c) => c._id !== communityToDelete._id));
      } else {
        setError(res?.error || 'Failed to delete community');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete community';
      setError(errorMessage);
    } finally {
      setActionLoading(false);
      setIsDeleteModalOpen(false);
      setCommunityToDelete(null);
    }
  };

  const confirmDelete = (community: Community) => {
    setCommunityToDelete(community);
    setIsDeleteModalOpen(true);
  };

  const handleExport = () => {
    // Export communities as CSV
    const headers = ['Name', 'LGA', 'Date Visited', 'Field Officer', 'Population', 'Total Tests'];
    const rows = communities.map(c => [
      c.name,
      c.lga,
      c.dateVisited || '',
      c.fieldOfficer || '',
      c.totalPopulation?.toString() || '',
      c.totalTestsConducted?.toString() || ''
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `communities-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="space-y-4 sm:space-y-6">
      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {successMessage}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
          <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Header */}
      <div 
        className="h-12 sm:h-[50px] rounded-lg border-2 border-[#fff9e6] flex items-center px-4 sm:px-5"
        style={{
          backgroundImage: 'linear-gradient(172.45deg, rgba(255, 249, 230, 1) 3.64%, rgba(232, 241, 255, 1) 100.8%)',
        }}
      >
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
                onKeyDown={handleKeyDown}
                className="flex-1 border-0 outline-none bg-transparent placeholder:text-[#d9d9d9] text-sm"
              />
            </div>
          </div>

          {/* Search Button */}
          <button
            onClick={handleSearch}
            disabled={loading}
            className="bg-[#2c7be5] text-white rounded-[10px] h-10 sm:h-12 px-6 font-medium text-sm sm:text-base hover:bg-blue-600 active:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-poppins"
          >
            Search
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 sm:gap-4">
          <button 
            onClick={handleExport}
            disabled={communities.length === 0}
            className="bg-white border border-[#d9d9d9] text-[#637381] rounded-[10px] h-10 sm:h-12 px-6 font-medium text-sm sm:text-base hover:bg-gray-50 active:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-poppins"
          >
            Export
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            disabled={actionLoading}
            className="bg-[#2c7be5] text-white rounded-[10px] h-10 sm:h-12 px-4 sm:px-6 font-medium text-xs sm:text-base whitespace-nowrap hover:bg-blue-600 active:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-poppins flex items-center gap-2"
          >
            {actionLoading && <LoadingSpinner />}
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

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title="Delete Community"
        message={`Are you sure you want to delete "${communityToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        onConfirm={handleDeleteCommunity}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setCommunityToDelete(null);
        }}
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
            fieldOfficers: selectedCommunity.fieldOfficer ? [selectedCommunity.fieldOfficer] : [],
          }}
          onSave={(updatedData) => {
            handleEditCommunity(selectedCommunity._id, {
              name: updatedData.name,
              lga: updatedData.lga,
              fieldOfficer: updatedData.fieldOfficers?.[0] || selectedCommunity.fieldOfficer
            });
          }}
        />
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-12 gap-4">
          <LoadingSpinner />
          <p className="text-[#637381] text-sm font-poppins">Loading communities...</p>
        </div>
      )}

      {/* Table Container with Horizontal Scroll on Mobile */}
      {!loading && (
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
                  <th className="text-center px-4 sm:px-6 py-3 sm:py-4 font-semibold text-xs sm:text-sm text-[#637381] font-poppins w-36">
                    Action
                  </th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody>
                {filteredData.map((community, index) => (
                  <tr
                    key={community._id}
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
                      {community.dateVisited || '-'}
                    </td>
                    <td className="text-left px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-[#637381] font-poppins">
                      {community.fieldOfficer || '-'}
                    </td>
                    <td className="text-center px-4 sm:px-6 py-3 sm:py-4">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => {
                            setSelectedCommunity(community);
                            setIsDetailsModalOpen(true);
                          }}
                          className="text-[#f4a100] font-semibold text-xs sm:text-sm hover:underline active:opacity-70 transition-all font-poppins"
                        >
                          View
                        </button>
                        <button
                          onClick={() => {
                            setSelectedCommunity(community);
                            setIsEditModalOpen(true);
                          }}
                          className="text-[#00c897] font-semibold text-xs sm:text-sm hover:underline active:opacity-70 transition-all font-poppins"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => confirmDelete(community)}
                          className="text-red-500 font-semibold text-xs sm:text-sm hover:underline active:opacity-70 transition-all font-poppins"
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
            <div className="flex flex-col items-center justify-center py-12 sm:py-16 gap-2">
              <svg className="w-12 h-12 text-[#d9d9d9]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="text-[#637381] text-sm sm:text-base font-poppins">No communities found</p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="mt-2 text-[#2c7be5] text-sm font-medium hover:underline font-poppins"
              >
                Add your first community
              </button>
            </div>
          )}
        </div>
      )}
    </main>
  );
}