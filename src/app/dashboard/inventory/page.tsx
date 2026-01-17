'use client';
import { useEffect, useState, useCallback } from 'react';
import api from '@/lib/api/index';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface InventoryItem {
  _id: string;
  itemName: string;
  category: string;
  quantityAvailable: number;
  unit: string;
  lowStockThreshold: number;
  communityId: string;
}

// Fallback data when API is unavailable
const fallbackInventory: InventoryItem[] = [
  { _id: '1', itemName: 'HIV Test Kit', category: 'Test Kits', quantityAvailable: 150, unit: 'units', lowStockThreshold: 50, communityId: 'Ikeja' },
  { _id: '2', itemName: 'Malaria RDT', category: 'Test Kits', quantityAvailable: 30, unit: 'units', lowStockThreshold: 40, communityId: 'Lekki' },
  { _id: '3', itemName: 'Blood Glucose Strips', category: 'Test Kits', quantityAvailable: 200, unit: 'strips', lowStockThreshold: 100, communityId: 'Victoria Island' },
  { _id: '4', itemName: 'Paracetamol 500mg', category: 'Medication', quantityAvailable: 500, unit: 'tablets', lowStockThreshold: 200, communityId: 'Ikeja' },
  { _id: '5', itemName: 'Syringes 5ml', category: 'Supplies', quantityAvailable: 80, unit: 'units', lowStockThreshold: 100, communityId: 'Surulere' },
];

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const fetchInventory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getInventory();
      if (res.success && res.data) {
        const items = Array.isArray(res.data) ? res.data : (res.data as any)?.inventory || [];
        setInventory(items.length > 0 ? items : fallbackInventory);
      } else {
        setInventory(fallbackInventory);
      }
    } catch {
      setInventory(fallbackInventory);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const handleExport = () => {
    const headers = ['Item Name', 'Category', 'Quantity', 'Unit', 'Community', 'Status'];
    const csv = [
      headers.join(','),
      ...filteredInventory.map((item) =>
        [item.itemName, item.category, item.quantityAvailable, item.unit, item.communityId, item.quantityAvailable <= item.lowStockThreshold ? 'Low Stock' : 'In Stock'].join(',')
      ),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const categories = ['all', ...Array.from(new Set(inventory.map(i => i.category)))];

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.communityId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const lowStockCount = inventory.filter(i => i.quantityAvailable <= i.lowStockThreshold).length;

  return (
    <main className="space-y-6 w-full">
      {/* Header */}
      <div
        className="rounded-bl-[20px] rounded-tl-[20px] bg-white border-2 border-[#fff9e6] border-solid overflow-hidden h-[50px] flex items-center px-[26px] w-full"
        style={{
          backgroundImage: 'linear-gradient(172.45deg, rgba(255, 249, 230, 1) 3.64%, rgba(232, 241, 255, 1) 100.8%)',
        }}
      >
        <h1 className="text-[20px] font-semibold uppercase text-[#212b36] font-poppins">Inventory Management</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 px-6">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-[#637381] text-sm">Total Items</p>
          <p className="text-2xl font-semibold text-[#212b36]">{inventory.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-[#637381] text-sm">Categories</p>
          <p className="text-2xl font-semibold text-[#212b36]">{categories.length - 1}</p>
        </div>
        <div className={`rounded-xl p-4 shadow-sm border ${lowStockCount > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
          <p className={`text-sm ${lowStockCount > 0 ? 'text-red-600' : 'text-green-600'}`}>Low Stock Items</p>
          <p className={`text-2xl font-semibold ${lowStockCount > 0 ? 'text-red-700' : 'text-green-700'}`}>{lowStockCount}</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between px-6">
        <div className="flex gap-3 flex-wrap">
          <input
            type="text"
            placeholder="Search inventory..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2c7be5] w-64"
          />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2c7be5]"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat === 'all' ? 'All Categories' : cat}</option>
            ))}
          </select>
        </div>
        <button
          onClick={handleExport}
          className="bg-[#2c7be5] text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-[#1e5aa8] transition-colors"
        >
          Export CSV
        </button>
      </div>

      {/* Table */}
      <div className="px-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-500">{error}</div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#637381]">Item Name</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#637381]">Category</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#637381]">Quantity</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#637381]">Unit</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#637381]">Community</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#637381]">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-[#637381]">No inventory items found</td>
                  </tr>
                ) : (
                  filteredInventory.map((item) => (
                    <tr key={item._id} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="py-3 px-4 text-sm text-[#212b36] font-medium">{item.itemName}</td>
                      <td className="py-3 px-4 text-sm text-[#637381]">{item.category}</td>
                      <td className="py-3 px-4 text-sm text-[#212b36]">{item.quantityAvailable}</td>
                      <td className="py-3 px-4 text-sm text-[#637381]">{item.unit}</td>
                      <td className="py-3 px-4 text-sm text-[#637381]">{item.communityId}</td>
                      <td className="py-3 px-4">
                        {item.quantityAvailable <= item.lowStockThreshold ? (
                          <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700 font-medium">Low Stock</span>
                        ) : (
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700 font-medium">In Stock</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
