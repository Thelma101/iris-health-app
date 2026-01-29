'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import api from '@/lib/api';

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
        // Fetch recent visitations and patients to create notifications
        const [visitationsRes, patientsRes] = await Promise.all([
          api.getVisitations(),
          api.getPatients(),
        ]) as any[];

        const items: Item[] = [];

        // Create notifications from recent visitations
        const visitations = visitationsRes.data?.visitations || visitationsRes.data?.data?.visitations || [];
        visitations.slice(0, 5).forEach((v: any, index: number) => {
          const patientName = v.patientId?.firstName
            ? `${v.patientId.firstName} ${v.patientId.lastName || ''}`.trim()
            : 'a patient';
          const communityName = v.communityId?.name || 'Unknown community';
          const date = v.createdAt ? new Date(v.createdAt) : new Date();

          items.push({
            id: `v${v._id || index}`,
            text: `New visitation recorded for ${patientName} in ${communityName}`,
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

        // Create notifications from recent patients
        const patients = patientsRes.data?.patients || patientsRes.data?.data?.patients || [];
        patients.slice(0, 3).forEach((p: any, index: number) => {
          const date = p.createdAt ? new Date(p.createdAt) : new Date();

          items.push({
            id: `p${p._id || index}`,
            text: `New patient ${p.firstName} ${p.lastName || ''} registered in ${p.community?.name || 'Unknown community'}`,
            date: date.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
              hour12: true
            }).replace(',', ' at'),
            unread: false,
          });
        });

        // Sort by date (newest first)
        items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

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
    <section className="w-full max-w-[466px] bg-white rounded-[10px] border border-zinc-300 overflow-hidden shadow-lg m-0">
      {/* Header */}
      <div className="h-12 w-full bg-white border-b border-[#d9d9d9] flex items-center justify-between px-4 sm:px-6 m-0">
        <h2 className="text-gray-800 text-lg sm:text-xl font-medium font-poppins m-0">Notifications</h2>
        <button aria-label="Close" onClick={onClose} className="size-6 grid place-items-center cursor-pointer hover:bg-gray-100 rounded-md transition-colors m-0 p-0">
          <Image src="/icons/cancel-01.svg" width={24} height={24} alt="Close" />
        </button>
      </div>

      {/* Notifications List */}
      <div className="max-h-96 overflow-y-auto p-4 sm:p-6 m-0">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="flex flex-col gap-3 sm:gap-4 m-0">
            {notifications.map((it) => (
              <button 
                key={it.id} 
                onClick={() => handleNotificationClick(it.id)}
                className="flex items-start gap-2.5 m-0 w-full text-left hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors cursor-pointer"
              >
                {/* Indicator dot */}
                <div className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 m-0 transition-colors ${it.unread ? 'bg-[#2C7BE5]' : 'bg-zinc-300'}`} />

                {/* Content */}
                <div className="flex-1 min-w-0 m-0">
                  <p className="text-gray-800 text-xs sm:text-sm font-normal font-poppins leading-snug m-0">{it.text}</p>
                  <p className="text-gray-500 text-xs font-normal font-poppins mt-1 m-0">{it.date}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
