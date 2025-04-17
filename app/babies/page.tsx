'use client';

import { useEffect, useState } from 'react';
import supabase from '@/lib/supabaseClient';
import Link from 'next/link';
// import { useRouter } from 'next/navigation';

const API_BASE = 'https://what-today-words-backend-production.up.railway.app';
const defaultAvatarUrl = 'https://i.postimg.cc/nLdmZ5Q8/S-1927579622.jpg';

type Baby = {
  id: number;
  name: string;
  photoUrl?: string;
};

export default function BabyDashboard() {
  const [babies, setBabies] = useState<Baby[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [newBabyName, setNewBabyName] = useState('');
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [adding, setAdding] = useState(false);
//   const router = useRouter();

const [editingId, setEditingId] = useState<number | null>(null);
const [editedName, setEditedName] = useState('');
const [editedPhotoUrl, setEditedPhotoUrl] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.id) {
        setUserId(user.id);
        fetch(`${API_BASE}/api/babies?userId=${user.id}`)
          .then((res) => res.json())
          .then((data: { id: number; name: string; photo_url?: string }[]) => {
            const normalized: Baby[] = data.map((b) => ({
              id: b.id,
              name: b.name,
              photoUrl: b.photo_url ?? undefined,
            }));
            setBabies(normalized); // ✅ babies are typed as Baby[]
          })
          .finally(() => setLoading(false));
      }
    });
  }, []);

  const handleSelect = (baby: Baby) => {
    localStorage.setItem('babyId', baby.id.toString());
    localStorage.setItem('babyName', baby.name);
    if (baby.photoUrl) localStorage.setItem('babyPhoto', baby.photoUrl);
  
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
      body: JSON.stringify({ name: newBabyName.trim(), userId, photoUrl: newPhotoUrl || null }),
    });

    const data = await res.json();
    if (res.ok) {
      setBabies((prev) => [...prev, { id: data.id, name: newBabyName.trim(), photoUrl: newPhotoUrl }]);
      setNewBabyName('');
      setNewPhotoUrl('');
      setAdding(false);
    }
  };

  const handleEditSave = async (babyId: number) => {
    const res = await fetch(`${API_BASE}/api/baby/${babyId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editedName, photoUrl: editedPhotoUrl }),
    });
  
    if (res.ok) {
      setBabies((prev) =>
        prev.map((b) =>
          b.id === babyId ? { ...b, name: editedName, photoUrl: editedPhotoUrl } : b
        )
      );
      setEditingId(null);
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
              className="flex flex-col gap-2 border p-3 rounded-xl hover:bg-emerald-100 transition"
            >
              {editingId === baby.id ? (
                <>
                  <div className="flex gap-2 items-center">
                    <input
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      className="w-1/2 px-2 py-1 border rounded"
                      placeholder="Name"
                    />
                    <input
                      value={editedPhotoUrl}
                      onChange={(e) => setEditedPhotoUrl(e.target.value)}
                      className="w-1/2 px-2 py-1 border rounded"
                      placeholder="Photo URL"
                    />
                  </div>
                  <div className="flex gap-2 mt-1">
                    <button
                      onClick={() => handleEditSave(baby.id)}
                      className="text-sm text-white bg-emerald-500 px-3 py-1 rounded-xl hover:bg-emerald-600"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="text-sm text-gray-600 hover:underline"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <img
                      src={baby.photoUrl || defaultAvatarUrl}
                      alt={baby.name}
                      className="w-10 h-10 rounded-full object-cover border-2 border-emerald-200"
                    />
                    <span className="text-lg font-semibold text-gray-800">{baby.name}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSelect(baby)}
                      className="text-sm text-white bg-emerald-500 px-3 py-1 rounded-xl hover:bg-emerald-600"
                    >
                      Select
                    </button>
                    <button
                      onClick={() => {
                        setEditingId(baby.id);
                        setEditedName(baby.name);
                        setEditedPhotoUrl(baby.photoUrl ?? '');
                      }}
                      className="text-sm text-gray-600 hover:underline"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              )}
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
              <input
                value={newPhotoUrl}
                onChange={(e) => setNewPhotoUrl(e.target.value)}
                placeholder="Photo URL (optional)"
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
                    setNewPhotoUrl('');
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
