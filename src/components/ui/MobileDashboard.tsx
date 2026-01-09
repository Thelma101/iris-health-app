'use client';
import React from 'react';
import Image from 'next/image';
import StatCard from './StatCard';

interface MobileDashboardProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function MobileDashboard({ isOpen = false, onClose }: MobileDashboardProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <button
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close dashboard"
      />

      {/* Mobile Dashboard Drawer */}
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white rounded-tl-3xl rounded-bl-3xl overflow-y-auto">
        {/* Close Button */}
        <div className="flex justify-end p-4 border-b border-gray-200">
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close"
          >
            <Image src="/icons/cancel-01.svg" alt="Close" width={24} height={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Dashboard Header */}
          <div className="w-full h-[50px] rounded-lg bg-gradient-to-r from-[#fff9e6] to-[#e8f1ff] border-2 border-[#fff9e6] flex items-center px-5">
            <span className="text-lg font-semibold text-[#212b36] uppercase">Dashboard</span>
          </div>

          {/* Stat Cards */}
          <div className="space-y-5">
            <StatCard
              title="Communities"
              value={56}
              subtitle="30 communities Covered"
              progress={0.45}
              progressColour="bg-[#00c897]"
              cardBg="bg-[#dffbf5]"
              iconSrc="/icons/communities-icon.png"
            />

            <StatCard
              title="Field Agents"
              value={80}
              subtitle="30 Field agents available"
              progress={0.45}
              progressColour="bg-[#f4a100]"
              cardBg="bg-[#fff9e6]"
              iconSrc="/icons/field-agents-icon.png"
            />

            <StatCard
              title="Tests"
              value="10,000"
              subtitle="10,000 tests carried out as at 23/06/25 6:00PM"
              progress={0.45}
              progressColour="bg-[#d64545]"
              cardBg="bg-[#fbeaea]"
              iconSrc="/icons/tests-icon.png"
            />
          </div>

          {/* Recent Record */}
          <div className="space-y-4">
            <h3 className="text-sm font-normal text-gray-500">Recent record</h3>

            {/* Record Cards - Stacked for mobile */}
            <div className="space-y-4">
              {[
                { c: 'Tee George Community', t: 892, p: 'Malaria', n: 'Typhoid' },
                { c: 'Green Lunar District', t: 756, p: 'HIV/AIDS', n: 'Hepatitis B' },
                { c: 'Baiyeku Ikorodu', t: 679, p: 'HIV/AIDS', n: 'Hepatitis B' },
                { c: 'Balogun Agege', t: 678, p: 'HIV/AIDS', n: 'Hepatitis B' },
              ].map((record, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-100 px-4 py-2">
                    <p className="text-sm font-semibold text-gray-600">Communities</p>
                  </div>
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm text-gray-500">{record.c}</p>
                  </div>

                  <div className="bg-gray-100 px-4 py-2 border-t border-gray-100">
                    <p className="text-sm font-semibold text-gray-600">Total Test</p>
                  </div>
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm text-gray-500">{record.t}</p>
                  </div>

                  <div className="bg-gray-100 px-4 py-2 border-t border-gray-100">
                    <p className="text-sm font-semibold text-gray-600">Top Tests +ve</p>
                  </div>
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm text-gray-500">{record.p}</p>
                  </div>

                  <div className="bg-gray-100 px-4 py-2 border-t border-gray-100">
                    <p className="text-sm font-semibold text-gray-600">Top Tests -ve</p>
                  </div>
                  <div className="px-4 py-2">
                    <p className="text-sm text-gray-500">{record.n}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
