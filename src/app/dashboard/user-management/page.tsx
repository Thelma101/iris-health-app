'use client';

import React, { useState, useEffect, useCallback } from 'react';
import UserManagementTable from '@/components/admin/user-management/UserManagementTable';
import AddUserModal from '@/components/admin/user-management/AddUserModal';
import EditUserModal from '@/components/admin/user-management/EditUserModal';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import api from '@/lib/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'Field Officer' | 'Admin';
  password: string;
  lastLogin: string;
  status: 'Active' | 'Inactive';
}

export default function UserManagementPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch users from API
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getUsers() as any;
      
      // Check for authentication errors
      if (!res.success && res.error) {
        if (res.error.includes('login') || res.error.includes('Session expired') || res.error.includes('Authentication')) {
          setError(res.error);
          setUsers([]);
          return;
        }
      }
      
      // Handle the nested response structure from the backend
      const backendData = res.data?.data || res.data;
      const fieldAgents = backendData?.fieldAgents || backendData || [];
      
      if (res.success && Array.isArray(fieldAgents)) {
        const mappedUsers: User[] = fieldAgents.map((u: any) => ({
          id: u._id || u.id,
          name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.name || 'Unknown',
          email: u.email,
          role: (u.role === 'Admin' ? 'Admin' : 'Field Officer') as 'Admin' | 'Field Officer',
          password: '',
          lastLogin: u.lastLogin 
            ? new Date(u.lastLogin).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
            : 'Never',
          status: u.status || 'Active',
        }));
        setUsers(mappedUsers);
        setFilteredUsers(mappedUsers);
      } else {
        setUsers([]);
        setFilteredUsers([]);
      }
    } catch (err: unknown) {
      setError('Failed to fetch users from server');
      setUsers([]);
      setFilteredUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Auto-dismiss messages
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Reactive search with debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!searchTerm.trim()) {
        setFilteredUsers(users);
        return;
      }
      const query = searchTerm.toLowerCase();
      const filtered = users.filter(
        (user) =>
          user.name.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query) ||
          user.role.toLowerCase().includes(query)
      );
      setFilteredUsers(filtered);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, users]);

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setFilteredUsers(users);
      return;
    }
    const filtered = users.filter(
      (user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleExport = () => {
    const headers = ['Name', 'Email', 'Role', 'Last Login', 'Status'];
    const rows = filteredUsers.map(u => [
      u.name,
      u.email,
      u.role,
      u.lastLogin,
      u.status
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleEdit = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setSelectedUser(user);
      setShowEditModal(true);
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: 'Active' | 'Inactive') => {
    setActionLoading(true);
    setError(null);
    try {
      const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
      const user = users.find(u => u.id === userId);
      
      const res = await api.updateUser(userId, { status: newStatus, role: user?.role });
      
      if (res.success) {
        setSuccessMessage(`User status updated to ${newStatus}`);
        await fetchUsers();
      } else {
        setError(res.error || 'Failed to update status');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddNewUser = () => {
    setShowAddModal(true);
  };

  const handleAddUser = async (userData: { name: string; email: string; role: string; password: string }) => {
    setActionLoading(true);
    setError(null);
    try {
      const nameParts = userData.name.trim().split(' ');
      const payload = {
        firstName: nameParts[0],
        lastName: nameParts.slice(1).join(' ') || '',
        email: userData.email,
        password: userData.password,
        role: userData.role,
      };
      
      const res = await api.createUser(payload);
      
      if (res.success) {
        setSuccessMessage(`${userData.role} added successfully!`);
        await fetchUsers();
      } else {
        setError(res.error || 'Failed to add user');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to add user');
    } finally {
      setActionLoading(false);
      setShowAddModal(false);
    }
  };

  const handleUpdateUser = async (userData: User) => {
    setActionLoading(true);
    setError(null);
    try {
      const nameParts = userData.name.trim().split(' ');
      const payload = {
        firstName: nameParts[0],
        lastName: nameParts.slice(1).join(' ') || '',
        email: userData.email,
        status: userData.status,
        role: userData.role,
      };
      
      const res = await api.updateUser(userData.id, payload);
      
      if (res.success) {
        setSuccessMessage('User updated successfully!');
        await fetchUsers();
      } else {
        setError(res.error || 'Failed to update user');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update user');
    } finally {
      setActionLoading(false);
      setShowEditModal(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    setActionLoading(true);
    setError(null);
    try {
      const user = users.find(u => u.id === userId);
      const res = await api.deleteUser(userId, user?.role);
      
      if (res.success) {
        setSuccessMessage('User deleted successfully!');
        await fetchUsers();
      } else {
        setError(res.error || 'Failed to delete user');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete user');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-93px)] bg-white rounded-tl-[20px] rounded-bl-[20px] border border-[#d9d9d9] border-r-0 p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Success Message */}
      {successMessage && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in">
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

      {/* Loading Overlay */}
      {actionLoading && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-40">
          <LoadingSpinner />
        </div>
      )}

      {/* Header */}
      <div
        className="h-12 sm:h-[50px] rounded-lg border-2 border-[#fff9e6] flex items-center px-4 sm:px-5"
        style={{
          backgroundImage: 'linear-gradient(172.45deg, rgba(255, 249, 230, 1) 3.64%, rgba(232, 241, 255, 1) 100.8%)',
        }}
      >
        <span className="text-base sm:text-xl font-semibold text-[#212b36] uppercase font-poppins">User Management</span>
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
            disabled={users.length === 0}
            className="bg-white border border-[#d9d9d9] text-[#637381] rounded-[10px] h-10 sm:h-12 px-6 font-medium text-sm sm:text-base hover:bg-gray-50 active:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-poppins"
          >
            Export
          </button>
          <button
            onClick={handleAddNewUser}
            disabled={actionLoading}
            className="bg-[#2c7be5] text-white rounded-[10px] h-10 sm:h-12 px-4 sm:px-6 font-medium text-xs sm:text-base whitespace-nowrap hover:bg-blue-600 active:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-poppins flex items-center gap-2"
          >
            {actionLoading && <LoadingSpinner />}
            Add New User
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-12 gap-4">
          <LoadingSpinner />
          <p className="text-[#637381] text-sm font-poppins">Loading users...</p>
        </div>
      )}

      {/* Users Table */}
      {!loading && (
        <UserManagementTable 
          users={filteredUsers} 
          onEdit={handleEdit} 
          onToggleStatus={handleToggleStatus} 
          onDelete={handleDeleteUser} 
        />
      )}

      {/* Modals */}
      <AddUserModal 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)} 
        onAdd={handleAddUser}
      />
      
      <EditUserModal 
        isOpen={showEditModal} 
        onClose={() => setShowEditModal(false)} 
        user={selectedUser || undefined}
        onUpdate={handleUpdateUser}
      />
    </main>
  );
}