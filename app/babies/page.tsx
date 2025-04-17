'use client';

import { useEffect, useState } from 'react';
import supabase from '@/lib/supabaseClient';
import Link from 'next/link';
// import { useRouter } from 'next/navigation';

const API_BASE = 'https://what-today-words-backend-production.up.railway.app';

type Baby = {
  id: number;
  name: string;
};

export default function BabyDashboard() {
  const [babies, setBabies] = useState<Baby[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [newBabyName, setNewBabyName] = useState('');
  const [adding, setAdding] = useState(false);
//   const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.id) {
        setUserId(user.id);
        fetch(`${API_BASE}/api/babies?userId=${user.id}`)
          .then((res) => res.json())
          .then(setBabies)
          .finally(() => setLoading(false));
      }
    });
  }, []);

  const handleSelect = (baby: Baby) => {
    // Update localStorage first
    localStorage.setItem('babyId', baby.id.toString());
    localStorage.setItem('babyName', baby.name);
  
    // Force a short delay to let storage sync, then hard reload
    setTimeout(() => {
      window.location.href = '/';
    }, 100); // ← give browser time to flush
  };

  const handleAddBaby = async () => {
    if (!newBabyName.trim() || !userId) return;

    const res = await fetch(`${API_BASE}/api/baby`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newBabyName.trim(), userId }),
    });

    const data = await res.json();
    if (res.ok) {
      setBabies((prev) => [...prev, { id: data.id, name: newBabyName.trim() }]);
      setNewBabyName('');
      setAdding(false);
    }
  };

  return (
    <main className="min-h-screen bg-emerald-50 p-6">
      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-xl p-6 space-y-4">
        <h1 className="text-2xl font-bold text-emerald-600">👶 My Babies</h1>

        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : babies.length === 0 ? (
          <p className="text-gray-500">No babies found. Please add one below.</p>
        ) : (
          <ul className="space-y-2">
            {babies.map((baby) => (
              <li
                key={baby.id}
                className="flex justify-between items-center border p-3 rounded-xl hover:bg-emerald-50 transition"
              >
                <span className="text-lg font-medium">{baby.name}</span>
                <button
                  onClick={() => handleSelect(baby)}
                  className="text-sm text-white bg-emerald-500 px-4 py-1 rounded-xl hover:bg-emerald-600"
                >
                  Select
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="pt-4">
          {!adding ? (
            <button
              onClick={() => setAdding(true)}
              className="text-sm text-emerald-700 bg-emerald-100 px-4 py-2 rounded-xl hover:bg-emerald-200"
            >
              ➕ Add New Baby
            </button>
          ) : (
            <div className="space-y-2">
              <input
                value={newBabyName}
                onChange={(e) => setNewBabyName(e.target.value)}
                placeholder="New baby name"
                className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring focus:ring-emerald-300"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleAddBaby}
                  className="bg-emerald-500 text-white px-4 py-2 rounded-xl hover:bg-emerald-600"
                >
                  Create
                </button>
                <button
                  onClick={() => {
                    setAdding(false);
                    setNewBabyName('');
                  }}
                  className="text-sm text-gray-600 hover:underline"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        <Link
          href="/"
          className="inline-block mt-4 text-center text-sm text-gray-500 hover:underline"
        >
          ← Back to Home
        </Link>
      </div>
    </main>
  );
}