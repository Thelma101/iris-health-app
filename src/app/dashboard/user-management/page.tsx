'use client';

import React, { useState } from 'react';
import UserManagementTable from '@/components/user-management/UserManagementTable';
import AddUserModal from '@/components/user-management/AddUserModal';
import EditUserModal from '@/components/user-management/EditUserModal';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  password: string;
  lastLogin: string;
  status: 'Active' | 'Inactive';
}

export default function UserManagementPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const handleEdit = (userId: string) => {
    // Find user in table and open edit modal
    const user = SAMPLE_USERS.find(u => u.id === userId);
    if (user) {
      setSelectedUser(user);
      setShowEditModal(true);
    }
  };

  const handleToggleStatus = (userId: string, currentStatus: 'Active' | 'Inactive') => {
    // Connect to user status update service
  };

  const handleAddNewUser = () => {
    setShowAddModal(true);
  };

  const handleAddUser = (userData: { name: string; email: string; role: string; password: string }) => {
    // Connect to user creation service
    setShowAddModal(false);
  };

  const handleUpdateUser = (userData: User) => {
    // Connect to user update service
    setShowEditModal(false);
  };

  // SAMPLE DATA: For demonstration only. Passwords should be hashed and stored securely in production.
  const SAMPLE_USERS: User[] = [
    { id: '1', name: 'Sam Mark', email: 'Sam@gmail.com', role: 'Admin', password: 'Mattew2025', lastLogin: '2 Jan, 10:30 AM', status: 'Active' },
    { id: '2', name: 'Jane Doe', email: 'jane@gmail.com', role: 'Field Officer', password: 'password123', lastLogin: '1 Jan, 2:15 PM', status: 'Active' },
    { id: '3', name: 'John Smith', email: 'john@gmail.com', role: 'Admin', password: 'secure123', lastLogin: '31 Dec, 5:45 PM', status: 'Inactive' },
    { id: '4', name: 'Mary Johnson', email: 'mary@gmail.com', role: 'Field Officer', password: 'pass456', lastLogin: '1 Jan, 11:00 AM', status: 'Active' },
    { id: '5', name: 'Robert Brown', email: 'robert@gmail.com', role: 'Admin', password: 'brown789', lastLogin: '30 Dec, 8:20 PM', status: 'Active' },
    { id: '6', name: 'Sarah Wilson', email: 'sarah@gmail.com', role: 'Field Officer', password: 'wilson456', lastLogin: '2 Jan, 9:30 AM', status: 'Active' },
    { id: '7', name: 'Michael Davis', email: 'michael@gmail.com', role: 'Admin', password: 'davis123', lastLogin: '1 Jan, 4:10 PM', status: 'Inactive' },
    { id: '8', name: 'Emily Martinez', email: 'emily@gmail.com', role: 'Field Officer', password: 'emily789', lastLogin: '2 Jan, 3:50 PM', status: 'Active' },
    { id: '9', name: 'David Garcia', email: 'david@gmail.com', role: 'Admin', password: 'garcia456', lastLogin: '31 Dec, 12:00 PM', status: 'Active' },
    { id: '10', name: 'Jennifer Lee', email: 'jennifer@gmail.com', role: 'Field Officer', password: 'lee123', lastLogin: '2 Jan, 1:20 PM', status: 'Active' },
    { id: '11', name: 'Christopher White', email: 'chris@gmail.com', role: 'Admin', password: 'white789', lastLogin: '30 Dec, 6:30 PM', status: 'Inactive' },
    { id: '12', name: 'Lisa Anderson', email: 'lisa@gmail.com', role: 'Field Officer', password: 'anderson123', lastLogin: '1 Jan, 10:45 AM', status: 'Active' },
    { id: '13', name: 'James Taylor', email: 'james@gmail.com', role: 'Admin', password: 'taylor456', lastLogin: '2 Jan, 2:30 PM', status: 'Active' },
    { id: '14', name: 'Patricia Thomas', email: 'patricia@gmail.com', role: 'Field Officer', password: 'thomas789', lastLogin: '1 Jan, 3:15 PM', status: 'Active' },
  ];

  return (
    <main className="space-y-6 w-full">
      {/* Header */}
      <div
        className="rounded-bl-[20px] rounded-tl-[20px] bg-white border-2 border-[#fff9e6] border-solid overflow-hidden h-[50px] flex items-center px-[26px] w-full"
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
            className="bg-[#2c7be5] text-white px-6 h-[48px] rounded-[10px] flex items-center justify-center text-[16px] font-medium font-inter hover:bg-[#1e5aa8] transition-colors"
          >
            Add New User
          </button>
        </div>

        {/* Users Table */}
        <UserManagementTable onEdit={handleEdit} onToggleStatus={handleToggleStatus} />
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
