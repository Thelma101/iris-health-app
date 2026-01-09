'use client';

import React, { useState } from 'react';
import UserManagementTable from '@/components/user-management/UserManagementTable';
import AddUserModal from '@/components/user-management/AddUserModal';
import EditUserModal from '@/components/user-management/EditUserModal';

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
  const [users, setUsers] = useState<User[]>([
    { id: '1', name: 'Sam Mark', email: 'sam@medtrack.com', role: 'Admin', password: 'hashed_password_1', lastLogin: '2 Jan, 10:30 AM', status: 'Active' },
    { id: '2', name: 'Jane Doe', email: 'jane@medtrack.com', role: 'Field Officer', password: 'hashed_password_2', lastLogin: '1 Jan, 2:15 PM', status: 'Inactive' },
  ]);

  const handleEdit = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setSelectedUser(user);
      setShowEditModal(true);
    }
  };

  const handleToggleStatus = (userId: string, currentStatus: 'Active' | 'Inactive') => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, status: currentStatus === 'Active' ? 'Inactive' : 'Active' }
        : user
    ));
  };

  const handleAddNewUser = () => {
    setShowAddModal(true);
  };

  const handleAddUser = (userData: { name: string; email: string; role: string; password: string }) => {
    const newUser: User = {
      id: Date.now().toString(),
      name: userData.name,
      email: userData.email,
      role: userData.role as 'Field Officer' | 'Admin',
      password: userData.password,
      lastLogin: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
      status: 'Active'
    };
    setUsers([...users, newUser]);
    setShowAddModal(false);
  };

  const handleUpdateUser = (userData: User) => {
    setUsers(users.map(user => 
      user.id === userData.id ? userData : user
    ));
    setShowEditModal(false);
  };

  const handleDeleteUser = (userId: string) => {
    setUsers(users.filter(user => user.id !== userId));
  };

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
        <UserManagementTable users={users} onEdit={handleEdit} onToggleStatus={handleToggleStatus} onDelete={handleDeleteUser} />
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