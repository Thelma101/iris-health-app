'use client';

interface User {
  id: string;
  name: string;
  role: 'Field Officer' | 'Admin';
  lastLogin: string;
  status: 'Active' | 'Inactive';
}

interface UserManagementTableProps {
  users: User[];
  onEdit?: (userId: string) => void;
  onToggleStatus?: (userId: string, currentStatus: 'Active' | 'Inactive') => void;
  onDelete?: (userId: string) => void;
}

export default function UserManagementTable({ users, onEdit, onToggleStatus, onDelete }: Readonly<UserManagementTableProps>) {
  const defaultUsers: User[] = [
    { id: '1', name: 'Tee George', role: 'Admin', lastLogin: '09/01/2026 2:15 PM', status: 'Active' },
    { id: '2', name: 'Green Lunar', role: 'Field Officer', lastLogin: '09/01/2026 11:45 AM', status: 'Active' },
    { id: '3', name: 'Sam Mark', role: 'Admin', lastLogin: '23/09/2025 6:30 PM', status: 'Active' },
    { id: '4', name: 'Jane Doe', role: 'Field Officer', lastLogin: '23/09/2025 6:30 PM', status: 'Inactive' },
  ];

  const data = users || defaultUsers;

  return (
    <div className="bg-white border border-[#d9d9d9] rounded-[10px] overflow-x-auto">
      {/* Desktop Table */}
      <div className="hidden sm:block">
        {/* Header */}
        <div className="bg-[#f4f5f7] border-b border-[#e5e7eb] grid grid-cols-5 gap-8 h-[33px] items-center px-4 py-[6px]">
          <span className="text-[14px] font-semibold text-[#637381] font-poppins">Name</span>
          <span className="text-[14px] font-semibold text-[#637381] font-poppins">Role</span>
          <span className="text-[14px] font-semibold text-[#637381] font-poppins">Last Login</span>
          <span className="text-[14px] font-semibold text-[#637381] font-poppins">Status</span>
          <span className="text-[14px] font-semibold text-[#637381] font-poppins text-center">Actions</span>
        </div>

        {/* Body */}
        <div className="divide-y divide-[#e5e7eb]">
          {data.map((user) => (
            <div key={user.id} className="bg-white grid grid-cols-5 gap-8 h-[33px] items-center px-4 py-[6px] hover:bg-[#f9f9f9] transition-colors">
              <span className="text-[14px] text-[#637381] font-poppins truncate">{user.name}</span>
              <span className="text-[14px] text-[#637381] font-poppins truncate">{user.role}</span>
              <span className="text-[14px] text-[#637381] font-poppins truncate">{user.lastLogin}</span>
              <span className="text-[14px] font-poppins text-[#637381] truncate">
                {user.status}
              </span>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => onEdit?.(user.id)}
                  className="text-[14px] text-[#f4a100] font-poppins hover:underline transition-colors cursor-pointer font-medium"
                >
                  Edit
                </button>
                <button
                  onClick={() => onToggleStatus?.(user.id, user.status)}
                  className={`text-[14px] font-poppins hover:underline transition-colors cursor-pointer font-medium ${
                    user.status === 'Active' ? 'text-[#d64545]' : 'text-[#00c897]'
                  }`}
                >
                  {user.status === 'Active' ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Card View - Matches Figma Design */}
      <div className="sm:hidden flex flex-col gap-5">
        {data.map((user) => (
          <div key={user.id} className="border border-[#d9d9d9] rounded-[8px] overflow-hidden">
            {/* Name */}
            <div className="bg-[#f4f5f7] px-2.5 py-2 border-b border-[#d9d9d9]">
              <p className="font-semibold text-[#637381] text-[14px] font-poppins">Name</p>
            </div>
            <div className="px-2.5 py-1.5 border-b border-[#d9d9d9] bg-white">
              <p className="text-[#637381] text-[14px] font-poppins">{user.name}</p>
            </div>

            {/* Role */}
            <div className="bg-[#f4f5f7] px-2.5 py-2 border-b border-[#d9d9d9]">
              <p className="font-semibold text-[#637381] text-[14px] font-poppins">Role</p>
            </div>
            <div className="px-2.5 py-1.5 border-b border-[#d9d9d9] bg-white">
              <p className="text-[#637381] text-[14px] font-poppins">{user.role}</p>
            </div>

            {/* Last Login */}
            <div className="bg-[#f4f5f7] px-2.5 py-2 border-b border-[#d9d9d9]">
              <p className="font-semibold text-[#637381] text-[14px] font-poppins">Last Login</p>
            </div>
            <div className="px-2.5 py-1.5 border-b border-[#d9d9d9] bg-white">
              <p className="text-[#637381] text-[14px] font-poppins">{user.lastLogin}</p>
            </div>

            {/* Status */}
            <div className="bg-[#f4f5f7] px-2.5 py-2 border-b border-[#d9d9d9]">
              <p className="font-semibold text-[#637381] text-[14px] font-poppins">Status</p>
            </div>
            <div className="px-2.5 py-1.5 border-b border-[#d9d9d9] bg-white">
              <p className="text-[#637381] text-[14px] font-poppins">{user.status}</p>
            </div>

            {/* Actions */}
            <div className="bg-[#f4f5f7] px-2.5 py-2 border-b border-[#d9d9d9]">
              <p className="font-semibold text-[#637381] text-[14px] font-poppins">Actions</p>
            </div>
            <div className="px-2.5 py-1.5 bg-white flex gap-3 flex-wrap">
              <button
                onClick={() => onEdit?.(user.id)}
                className="text-[14px] text-[#f4a100] font-poppins hover:underline transition-colors cursor-pointer font-medium"
              >
                Edit
              </button>
              <button
                onClick={() => onToggleStatus?.(user.id, user.status)}
                className={`text-[14px] font-poppins hover:underline transition-colors cursor-pointer font-medium ${
                  user.status === 'Active' ? 'text-[#d64545]' : 'text-[#00c897]'
                }`}
              >
                {user.status === 'Active' ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
