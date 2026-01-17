'use client';

import React, { useState } from 'react';
import FieldAgentSidebar from '@/components/field-agent/Sidebar';
import FieldAgentHeader from '@/components/field-agent/Header';
import CreateTestTypeModal from '@/components/field-agent/CreateTestTypeModal';
import EditTestTypeModal from '@/components/field-agent/EditTestTypeModal';
import TestTypeListModal from '@/components/field-agent/TestTypeListModal';
import ConfirmModal from '@/components/ui/ConfirmModal';

interface TestType {
  id: string;
  name: string;
  results: string[];
}

// Default test types with common expected results
const DEFAULT_TEST_TYPES: TestType[] = [
  {
    id: '1',
    name: 'HIV',
    results: ['Positive', 'Negative', 'Reactive', 'Non-Reactive', 'Indeterminate'],
  },
  {
    id: '2',
    name: 'Malaria',
    results: ['Positive', 'Negative', 'P. falciparum', 'P. vivax', 'Mixed'],
  },
  {
    id: '3',
    name: 'Hepatitis B',
    results: ['Positive', 'Negative', 'Reactive', 'Non-Reactive', 'Immune'],
  },
  {
    id: '4',
    name: 'TB',
    results: ['Positive', 'Negative', 'Smear Positive', 'Smear Negative', 'Culture Positive'],
  },
  {
    id: '5',
    name: 'Cholera',
    results: ['Positive', 'Negative', 'Confirmed', 'Suspected'],
  },
  {
    id: '6',
    name: 'Blood Pressure',
    results: ['Normal', 'High', 'Low', 'Stage 1 Hypertension', 'Stage 2 Hypertension', 'Hypertensive Crisis'],
  },
  {
    id: '7',
    name: 'Blood Sugar',
    results: ['Normal', 'Pre-diabetic', 'Diabetic', 'Low (Hypoglycemia)', 'High (Hyperglycemia)'],
  },
];

export default function TestTypesPage() {
  const [testTypes, setTestTypes] = useState<TestType[]>(DEFAULT_TEST_TYPES);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isListModalOpen, setIsListModalOpen] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTestType, setSelectedTestType] = useState<TestType | null>(null);
  const [testTypeToDelete, setTestTypeToDelete] = useState<string | null>(null);

  const handleCreateTestType = (data: { name: string; results: string[] }) => {
    const newTestType: TestType = {
      id: Date.now().toString(),
      name: data.name,
      results: data.results,
    };
    setTestTypes([...testTypes, newTestType]);
    setIsCreateModalOpen(false);
    setIsListModalOpen(true);
  };

  const handleEditTestType = (testType: TestType) => {
    setSelectedTestType(testType);
    setIsListModalOpen(false);
    setIsEditModalOpen(true);
  };

  const handleUpdateTestType = (updatedTestType: TestType) => {
    setTestTypes(
      testTypes.map((tt) =>
        tt.id === updatedTestType.id ? updatedTestType : tt
      )
    );
    setIsEditModalOpen(false);
    setIsListModalOpen(true);
  };

  const handleDeleteClick = (testTypeId: string) => {
    setTestTypeToDelete(testTypeId);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (testTypeToDelete) {
      setTestTypes(testTypes.filter((tt) => tt.id !== testTypeToDelete));
      setTestTypeToDelete(null);
      setIsDeleteModalOpen(false);
    }
  };

  const handleOpenCreateModal = () => {
    setIsListModalOpen(false);
    setIsCreateModalOpen(true);
  };

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#f4f5f7]">
      <FieldAgentSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-[270px]">
        <FieldAgentHeader onMenuClick={() => setIsSidebarOpen(true)} />
        
        <main className="flex-1 overflow-y-auto p-6">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-poppins font-semibold text-2xl text-[#212b36]">
                Manage Test Types
              </h1>
              <p className="font-poppins text-sm text-[#637381] mt-1">
                View, create, and edit test types and their expected results
              </p>
            </div>
            <button
              onClick={handleOpenCreateModal}
              className="flex items-center gap-2 px-4 py-2 bg-[#2c7be5] rounded-[10px] text-white font-poppins font-medium text-sm hover:bg-blue-600 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 5V19M5 12H19" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Add Test Type
            </button>
          </div>

          {/* Test Types Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {testTypes.map((testType) => (
              <div
                key={testType.id}
                className="bg-white rounded-[10px] border border-[#d9d9d9] overflow-hidden shadow-sm"
              >
                {/* Header */}
                <div className="h-12 bg-[#2c7be5] flex items-center justify-between px-4">
                  <span className="font-poppins font-medium text-base text-white">
                    {testType.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditTestType(testType)}
                      className="p-1 hover:bg-white/20 rounded"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M18.5 2.50001C18.8978 2.10219 19.4374 1.87869 20 1.87869C20.5626 1.87869 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.4374 22.1213 4.00001C22.1213 4.56262 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteClick(testType.id)}
                      className="p-1 hover:bg-white/20 rounded"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 6H5H21" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Body */}
                <div className="p-4">
                  <p className="font-poppins font-medium text-xs text-[#637381] mb-2">
                    Expected Results:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {testType.results.slice(0, 4).map((result, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-[#ecf4ff] rounded-full font-poppins text-xs text-[#2c7be5]"
                      >
                        {result}
                      </span>
                    ))}
                    {testType.results.length > 4 && (
                      <span className="px-2 py-1 bg-[#f4f5f7] rounded-full font-poppins text-xs text-[#637381]">
                        +{testType.results.length - 4} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      {/* Modals */}
      <CreateTestTypeModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setIsListModalOpen(true);
        }}
        onSubmit={handleCreateTestType}
      />

      <EditTestTypeModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setIsListModalOpen(true);
        }}
        testType={selectedTestType}
        onSubmit={handleUpdateTestType}
      />

      <TestTypeListModal
        isOpen={isListModalOpen}
        onClose={() => setIsListModalOpen(false)}
        testTypes={testTypes}
        onEdit={handleEditTestType}
        onDelete={handleDeleteClick}
        onCreateNew={handleOpenCreateModal}
      />

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setTestTypeToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Test Type"
        message="Are you sure you want to delete this test type? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
}
