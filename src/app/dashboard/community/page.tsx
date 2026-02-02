'use client';
import api, { Community as APICommunity } from '@/lib/api/index';
import { useEffect, useState, useCallback } from 'react';
import AddCommunityModal from '@/components/admin/AddCommunityModal';
import CommunityDetailsModal from '@/components/admin/CommunityDetailsModal';
import EditCommunityModal from '@/components/admin/EditCommunityModal';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ConfirmModal from '@/components/ui/ConfirmModal';
import SuccessModal from '@/components/admin/SuccessModal';
import ErrorModal from '@/components/ui/ErrorModal';

// Field officer can be either a full object (from GET) or just an ID (for PUT/POST)
type FieldOfficerRef = string | { _id: string; firstName: string; lastName: string; email: string };

interface Community {
  _id: string;
  name: string;
  lga: string;
  dateVisited?: string;
  fieldOfficer?: string;
  fieldOfficers?: FieldOfficerRef[];
  population?: string;
  totalTests?: string;
  totalPopulation?: number;
  totalTestsConducted?: number;
  visitationDates?: string[];
}

// Helper function to format date
const formatDate = (dateString: string | undefined): string => {
  if (!dateString || dateString === '-') return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch {
    return '-';
  }
};

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
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successModalMessage, setSuccessModalMessage] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorModalMessage, setErrorModalMessage] = useState('');

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
          dateVisited: formatDate(c.dateVisited),
          fieldOfficers: c.fieldOfficers,
          fieldOfficer: c.fieldOfficers && c.fieldOfficers.length > 0
            ? c.fieldOfficers
              .map(fo => {
                // Handle both object format and string ID format
                if (typeof fo === 'object' && fo && fo.firstName && fo.lastName) {
                  return `${fo.firstName} ${fo.lastName}`;
                }
                return null;
              })
              .filter(Boolean)
              .join(', ') || '-'
            : '-',
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

  // Reactive search with debouncing - filter when search term changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!searchTerm.trim()) {
        setFilteredData(communities);
        return;
      }
      const query = searchTerm.toLowerCase();
      const filtered = communities.filter(
        (community) =>
          community.name.toLowerCase().includes(query) ||
          community.lga.toLowerCase().includes(query) ||
          (community.fieldOfficer || '').toLowerCase().includes(query)
      );
      setFilteredData(filtered);
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [searchTerm, communities]);

  const handleSearch = () => {
    // Search is already reactive via useEffect above
    // This function is for explicit search button clicks
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
        fieldOfficers: data.fieldOfficers, // Now contains ObjectIds from the modal
      };
      const res = await api.createCommunity(payload);
      if (res?.success && res.data) {
        // Use backend message or fallback
        const backendMessage = (res.data as { message?: string })?.message || 'Community created successfully';
        setSuccessModalMessage(backendMessage);
        setShowSuccessModal(true);
        setIsModalOpen(false);
        fetchCommunities(); // Refresh the list
      } else {
        // Show error modal with detailed message
        const errorMsg = res?.error || 'Failed to add community. Please check if all fields are correctly filled.';
        setErrorModalMessage(errorMsg);
        setShowErrorModal(true);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add community. Server may be unavailable.';
      setErrorModalMessage(errorMessage);
      setShowErrorModal(true);
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
        // Use backend message or fallback
        const backendMessage = (res.data as { message?: string })?.message || 'Community updated successfully';
        setSuccessModalMessage(backendMessage);
        setShowSuccessModal(true);
        setIsEditModalOpen(false);
        setSelectedCommunity(null);
        fetchCommunities(); // Refresh the list
      } else {
        setErrorModalMessage(res?.error || 'Failed to update community');
        setShowErrorModal(true);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update community';
      setErrorModalMessage(errorMessage);
      setShowErrorModal(true);
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
        // Use backend message or fallback
        const backendMessage = (res.data as { message?: string })?.message || 'Community deleted successfully';
        setSuccessModalMessage(backendMessage);
        setShowSuccessModal(true);
        setCommunities((prev) => prev.filter((c) => c._id !== communityToDelete._id));
        setFilteredData((prev) => prev.filter((c) => c._id !== communityToDelete._id));
      } else {
        setErrorModalMessage(res?.error || 'Failed to delete community');
        setShowErrorModal(true);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete community';
      setErrorModalMessage(errorMessage);
      setShowErrorModal(true);
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

          {/* Search Button - Hidden on mobile */}
          <button
            onClick={handleSearch}
            disabled={loading}
            className="hidden sm:block bg-[#2c7be5] text-white rounded-[10px] h-10 sm:h-12 px-6 font-medium text-sm sm:text-base hover:bg-blue-600 active:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-poppins"
          >
            Search
          </button>
        </div>

        <div className="flex justify-between sm:justify-end gap-3 sm:gap-4 lg:gap-6 w-full sm:w-auto">
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
            _id: selectedCommunity._id,
            name: selectedCommunity.name,
            lga: selectedCommunity.lga,
            fieldOfficers: selectedCommunity.fieldOfficers || [],
          }}
          onSave={async (updatedData) => {
            await handleEditCommunity(selectedCommunity._id, {
              name: updatedData.name,
              lga: updatedData.lga,
              fieldOfficers: updatedData.fieldOfficers || []
            });
          }}
        />
      )}

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Success"
        message={successModalMessage}
      />

      {/* Error Modal */}
      <ErrorModal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title="Error"
        message={errorModalMessage}
      />

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-12 gap-4">
          <LoadingSpinner />
          <p className="text-[#637381] text-sm font-poppins">Loading communities...</p>
        </div>
      )}

      {/* Table Container with Independent Scrolling - Desktop */}
      {!loading && (
        <>
          {/* Desktop Table View */}
          <div className="hidden sm:block bg-white rounded-lg border border-[#f4f5f7] overflow-hidden">
            <div className="overflow-x-auto max-h-[calc(100vh-320px)] overflow-y-auto">
              <table className="w-full min-w-[900px]">
                {/* Table Header */}
                <thead className="sticky top-0 z-10">
                  <tr className="bg-[#f4f5f7] border-b border-[#f4f5f7]">
                    <th className="text-left px-4 sm:px-6 py-3 sm:py-4 font-semibold text-xs sm:text-sm text-[#637381] font-poppins w-[211px] bg-[#f4f5f7]">
                      Communities
                    </th>
                    <th className="text-left px-4 sm:px-6 py-3 sm:py-4 font-semibold text-xs sm:text-sm text-[#637381] font-poppins w-[143px] bg-[#f4f5f7]">
                      LGA
                    </th>
                    <th className="text-left px-4 sm:px-6 py-3 sm:py-4 font-semibold text-xs sm:text-sm text-[#637381] font-poppins w-[116px] bg-[#f4f5f7]">
                      Date Visited
                    </th>
                    <th className="text-left px-4 sm:px-6 py-3 sm:py-4 font-semibold text-xs sm:text-sm text-[#637381] font-poppins w-[188px] bg-[#f4f5f7]">
                      Field Officer Assigned
                    </th>
                    <th className="text-center px-4 sm:px-6 py-3 sm:py-4 font-semibold text-xs sm:text-sm text-[#637381] font-poppins w-36 bg-[#f4f5f7]">
                      Action
                    </th>
                  </tr>
                </thead>

                {/* Table Body */}
                <tbody>
                  {filteredData.map((community, index) => (
                    <tr
                      key={community._id}
                      className={`border-b border-[#f4f5f7] hover:bg-gray-50 transition-colors ${index === filteredData.length - 1 ? 'border-0' : ''
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

            {/* Empty State - Desktop */}
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

          {/* Mobile Card View - Matches Figma Design */}
          <div className="sm:hidden flex flex-col gap-4">
            {filteredData.length > 0 ? (
              filteredData.map((community) => (
                <div key={community._id} className="border border-[#d9d9d9] rounded-[8px] overflow-hidden bg-white">
                  {/* Communities */}
                  <div className="bg-[#f4f5f7] px-2.5 py-2 border-b border-[#d9d9d9]">
                    <p className="font-semibold text-[#637381] text-[14px] font-poppins">Communities</p>
                  </div>
                  <div className="px-2.5 py-1.5 border-b border-[#d9d9d9] bg-white">
                    <p className="text-[#637381] text-[14px] font-poppins">{community.name}</p>
                  </div>

                  {/* LGA */}
                  <div className="bg-[#f4f5f7] px-2.5 py-2 border-b border-[#d9d9d9]">
                    <p className="font-semibold text-[#637381] text-[14px] font-poppins">LGA</p>
                  </div>
                  <div className="px-2.5 py-1.5 border-b border-[#d9d9d9] bg-white">
                    <p className="text-[#637381] text-[14px] font-poppins">{community.lga}</p>
                  </div>

                  {/* Date Visited */}
                  <div className="bg-[#f4f5f7] px-2.5 py-2 border-b border-[#d9d9d9]">
                    <p className="font-semibold text-[#637381] text-[14px] font-poppins">Date Visited</p>
                  </div>
                  <div className="px-2.5 py-1.5 border-b border-[#d9d9d9] bg-white">
                    <p className="text-[#637381] text-[14px] font-poppins">{community.dateVisited || '-'}</p>
                  </div>

                  {/* Field Officer */}
                  <div className="bg-[#f4f5f7] px-2.5 py-2 border-b border-[#d9d9d9]">
                    <p className="font-semibold text-[#637381] text-[14px] font-poppins">Field Officer</p>
                  </div>
                  <div className="px-2.5 py-1.5 border-b border-[#d9d9d9] bg-white">
                    <p className="text-[#637381] text-[14px] font-poppins">{community.fieldOfficer || '-'}</p>
                  </div>

                  {/* Action */}
                  <div className="bg-[#f4f5f7] px-2.5 py-2 border-b border-[#d9d9d9]">
                    <p className="font-semibold text-[#637381] text-[14px] font-poppins">Action</p>
                  </div>
                  <div className="px-2.5 py-1.5 bg-white flex gap-4">
                    <button
                      onClick={() => {
                        setSelectedCommunity(community);
                        setIsDetailsModalOpen(true);
                      }}
                      className="text-[14px] text-[#f4a100] font-poppins hover:underline transition-colors cursor-pointer font-medium"
                    >
                      View
                    </button>
                    <button
                      onClick={() => {
                        setSelectedCommunity(community);
                        setIsEditModalOpen(true);
                      }}
                      className="text-[14px] text-[#00c897] font-poppins hover:underline transition-colors cursor-pointer font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => confirmDelete(community)}
                      className="text-[14px] text-red-500 font-poppins hover:underline transition-colors cursor-pointer font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 gap-4 border border-[#d9d9d9] rounded-[8px] bg-white">
                <svg className="w-[34px] h-[34px] text-[#637381]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <p className="text-[#637381] text-[14px] font-poppins text-center">Add community</p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="text-[#2c7be5] text-sm font-medium hover:underline font-poppins"
                >
                  Add your first community
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </main>
  );
}