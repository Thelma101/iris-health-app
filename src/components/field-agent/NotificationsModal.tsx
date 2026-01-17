'use client';

import React from 'react';

interface Notification {
  id: string;
  message: string;
  date: string;
  isRead: boolean;
}

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
}

const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  notifications,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#f5f5f5] backdrop-blur-[10px] opacity-80"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="absolute top-20 right-8 w-[466px] max-h-[600px] bg-white rounded-[10px] shadow-lg overflow-hidden">
        {/* Header */}
        <div className="h-12 bg-white border-b border-[#d9d9d9] flex items-center justify-between px-[22px]">
          <p className="font-poppins font-medium text-xl text-[#212b36]">
            Notifications
          </p>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M18 6L6 18M6 6L18 18"
                stroke="#212B36"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* Notifications List */}
        <div className="p-[22px] max-h-[500px] overflow-y-auto">
          <div className="flex flex-col gap-[14px]">
            {notifications.length === 0 ? (
              <p className="text-[#637381] text-sm text-center py-4">
                No notifications
              </p>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="flex items-center gap-[10px]"
                >
                  {/* Read indicator dot */}
                  <div
                    className={`w-[10px] h-[10px] rounded-full ${
                      notification.isRead ? 'bg-[#d9d9d9]' : 'bg-[#2c7be5]'
                    }`}
                  />
                  <div className="flex flex-col flex-1">
                    <p className="font-poppins text-sm text-[#212b36]">
                      {notification.message}
                    </p>
                    <p className="font-poppins text-xs text-[#637381]">
                      {notification.date}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsModal;
