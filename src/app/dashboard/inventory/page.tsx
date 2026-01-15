'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api/index';

interface InventoryItem {
  _id: string;
  itemName: string;
  category: string;
  quantityAvailable: number;
  unit: string;
  lowStockThreshold: number;
  communityId: string;
}

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api.getInventory().then((res) => {
      if (res.success && Array.isArray(res.data)) {
        setInventory(res.data);
      } else {
        setError(res.error || 'Failed to fetch inventory');
      }
      setLoading(false);
    });
  }, []);

  return (
    <main className="space-y-4 sm:space-y-6">
      <h1 className="text-xl font-bold">Inventory</h1>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-500">{error}</div>}
      <table className="w-full border mt-4">
        <thead>
          <tr>
            <th>Item Name</th>
            <th>Category</th>
            <th>Quantity</th>
            <th>Unit</th>
            <th>Community</th>
          </tr>
        </thead>
        <tbody>
          {inventory.map((item) => (
            <tr key={item._id}>
              <td>{item.itemName}</td>
              <td>{item.category}</td>
              <td>{item.quantityAvailable}</td>
              <td>{item.unit}</td>
              <td>{item.communityId}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
