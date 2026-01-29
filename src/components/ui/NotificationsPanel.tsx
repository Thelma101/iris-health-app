'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { fieldAgentApi } from '@/lib/api/field-agent';

type Item = {
  readonly id: string;
  readonly text: string;
  readonly date: string;
  readonly unread: boolean;
};

export default function NotificationsPanel({ onClose }: { readonly onClose?: () => void }) {
  const [notifications, setNotifications] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  // Mark a notification as read when clicked
  const handleNotificationClick = (id: string) => {
    setNotifications(prev => 
      prev.map(item => 
        item.id === id ? { ...item, unread: false } : item
      )
    );
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        // Fetch recent visitations for the field agent
        const visitationsRes = await fieldAgentApi.getMyVisitations() as any;
        const items: Item[] = [];

        const visitations = visitationsRes.data?.visitations || visitationsRes.data?.data?.visitations || [];
        visitations.slice(0, 8).forEach((v: any, index: number) => {
          const patientName = v.patientId?.firstName
            ? `${v.patientId.firstName} ${v.patientId.lastName || ''}`.trim()
            : 'a patient';
          const communityName = v.communityId?.name || 'Unknown community';
          const date = v.createdAt ? new Date(v.createdAt) : new Date();

          items.push({
            id: `v${v._id || index}`,
            text: `Visitation recorded for ${patientName} in ${communityName}`,
            date: date.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
              hour12: true
            }).replace(',', ' at'),
            unread: index < 2,
          });
        });

        setNotifications(items.length > 0 ? items : [{
          id: 'empty',
          text: 'No recent activity',
          date: new Date().toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          }).replace(',', ' at'),
          unread: false,
        }]);
      } catch (error) {
        console.error('Error fetching notifications:', error);
        setNotifications([{
          id: 'error',
          text: 'Unable to load notifications',
          date: new Date().toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          }).replace(',', ' at'),
          unread: false,
        }]);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  return (
    <section className="w-full max-w-[466px] bg-white rounded-[10px] border border-zinc-300 overflow-hidden shadow-lg">
      {/* Header */}
      <div className="h-12 w-full bg-white border-b border-[#d9d9d9] flex items-center justify-between px-4 sm:px-6">
        <h2 className="text-gray-800 text-lg sm:text-xl font-medium font-poppins">Notifications</h2>
        <button aria-label="Close" onClick={onClose} className="size-6 grid place-items-center cursor-pointer hover:bg-gray-100 rounded-md transition-colors">
          <Image src="/icons/cancel-01.svg" width={24} height={24} alt="Close" />
        </button>
      </div>

      {/* Notifications List */}
      <div className="max-h-96 overflow-y-auto p-4 sm:p-6">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {notifications.map((it) => (
              <button 
                key={it.id} 
                onClick={() => handleNotificationClick(it.id)}
                className="flex items-start gap-2.5 w-full text-left hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors cursor-pointer"
              >
                {/* Indicator dot */}
                <div className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 transition-colors ${it.unread ? 'bg-[#2C7BE5]' : 'bg-zinc-300'}`} />

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-gray-800 text-xs sm:text-sm font-normal font-poppins leading-snug">{it.text}</p>
                  <p className="text-gray-500 text-xs font-normal font-poppins mt-1">{it.date}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
