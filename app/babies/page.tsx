'use client';

import { useEffect, useState } from 'react';
import supabase from '@/lib/supabaseClient';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const API_BASE = 'https://what-today-words-backend-production.up.railway.app';

type Baby = {
  id: number;
  name: string;
};

export default function BabyDashboard() {
  const [babies, setBabies] = useState<Baby[]>([]);
//   const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.id) {
        // setUserId(user.id);
        fetch(`${API_BASE}/api/babies?userId=${user.id}`)
          .then((res) => res.json())
          .then(setBabies)
          .finally(() => setLoading(false));
      }
    });
  }, []);

  const handleSelect = (baby: Baby) => {
    localStorage.setItem('babyId', baby.id.toString());
    localStorage.setItem('babyName', baby.name);
    router.push('/');
  };

  return (
    <main className="min-h-screen bg-emerald-50 p-6">
      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-xl p-6 space-y-4">
        <h1 className="text-2xl font-bold text-emerald-600">👶 My Babies</h1>

        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : babies.length === 0 ? (
          <p className="text-gray-500">No babies found. Please create one on the home page.</p>
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