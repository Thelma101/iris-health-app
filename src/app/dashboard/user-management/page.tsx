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
      console.log('API Response (full):', res);
      console.log('API Response data:', res.data);
      
      // Check for authentication errors
      if (!res.success && res.error) {
        if (res.error.includes('login') || res.error.includes('Session expired') || res.error.includes('Authentication')) {
          setError(res.error);
          setUsers([]);
          return;
        }
      }
      
      // Handle the nested response structure from the backend
      // Backend returns: { success, message, data: { fieldAgents: [...] } }
      // apiRequest wraps it: { success, data: { success, message, data: { fieldAgents } } }
      const backendData = res.data?.data || res.data;
      const fieldAgents = backendData?.fieldAgents || backendData || [];
      
      console.log('Extracted fieldAgents:', fieldAgents);
      
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
        console.log('Mapped users:', mappedUsers);
        setUsers(mappedUsers);
        
        if (mappedUsers.length === 0) {
          console.log('No users found in database');
        }
      } else {
        console.log('Response structure issue - fieldAgents:', fieldAgents, 'isArray:', Array.isArray(fieldAgents));
        setUsers([]);
      }
    } catch (err: unknown) {
      console.error('Error fetching users:', err);
      setError('Failed to fetch users from server');
      setUsers([]);
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
      console.log('Toggling status for user:', userId, 'role:', user?.role, 'to:', newStatus);
      
      const res = await api.updateUser(userId, { status: newStatus, role: user?.role });
      console.log('Toggle status response:', res);
      
      if (res.success) {
        setSuccessMessage(`User status updated to ${newStatus}`);
        await fetchUsers(); // Refresh from server
      } else {
        setError(res.error || 'Failed to update status');
      }
    } catch (err: any) {
      console.error('Error toggling status:', err);
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
        role: userData.role, // Pass the role to API
      };
      
      console.log('Creating user with payload:', payload);
      const res = await api.createUser(payload);
      console.log('Create user response:', res);
      
      if (res.success) {
        setSuccessMessage(`${userData.role} added successfully!`);
        await fetchUsers(); // Refresh the list
      } else {
        setError(res.error || 'Failed to add user');
      }
    } catch (err: any) {
      console.error('Error adding user:', err);
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
        role: userData.role, // Preserve the role on update
      };
      
      console.log('Updating user:', userData.id, 'with payload:', payload);
      const res = await api.updateUser(userData.id, payload);
      console.log('Update user response:', res);
      
      if (res.success) {
        setSuccessMessage('User updated successfully!');
        await fetchUsers();
      } else {
        setError(res.error || 'Failed to update user');
      }
    } catch (err: any) {
      console.error('Error updating user:', err);
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
      console.log('Deleting user:', userId, 'role:', user?.role);
      const res = await api.deleteUser(userId, user?.role);
      console.log('Delete user response:', res);
      
      if (res.success) {
        setSuccessMessage('User deleted successfully!');
        await fetchUsers();
      } else {
        setError(res.error || 'Failed to delete user');
      }
    } catch (err: any) {
      console.error('Error deleting user:', err);
      setError(err.message || 'Failed to delete user');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <main className="space-y-6 w-full">
      {/* Success Message */}
      {successMessage && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in">
          {successMessage}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in">
          {error}
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
        className="rounded-lg bg-white border-2 border-[#fff9e6] border-solid overflow-hidden px-[17px] py-4"
        style={{
          backgroundImage: 'linear-gradient(172.45deg, rgba(255, 249, 230, 1) 3.64%, rgba(232, 241, 255, 1) 100.8%)',
        }}
      >
        <h1 className="text-[20px] font-semibold uppercase text-[#212b36] font-poppins">User Management</h1>
      </div>

      {/* Content Area */}
      <div className="px-6 space-y-6">
        {/* Add New User Button */}
        <div className="flex justify-end">
          <button
            onClick={handleAddNewUser}
            disabled={actionLoading}
            className="bg-[#2c7be5] text-white px-6 h-[48px] rounded-[10px] flex items-center justify-center text-[16px] font-medium font-inter hover:bg-[#1e5aa8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add New User
          </button>
        </div>

        {/* Users Table */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : (
          <UserManagementTable 
            users={users} 
            onEdit={handleEdit} 
            onToggleStatus={handleToggleStatus} 
            onDelete={handleDeleteUser} 
          />
        )}
      </div>

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