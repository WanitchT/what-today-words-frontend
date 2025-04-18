"use client";

import { useEffect, useState } from "react";
import supabase from "@/lib/supabaseClient";
import { motion } from "framer-motion";
// import Link from "next/link";
// import { useRouter } from 'next/navigation';
import { Baby, Check } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE!;
const defaultAvatarUrl = '/images/baby-42-128.png';

type Baby = {
  id: number;
  name: string;
  photoUrl?: string;
};

export default function BabyDashboard() {
  const [babies, setBabies] = useState<Baby[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [newBabyName, setNewBabyName] = useState("");
  const [newPhotoUrl, setNewPhotoUrl] = useState("");
  const [adding, setAdding] = useState(false);
  //   const router = useRouter();

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editedName, setEditedName] = useState("");
  const [editedPhotoUrl, setEditedPhotoUrl] = useState("");

  const [currentBabyId, setCurrentBabyId] = useState<number | null>(null);

  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string>("");

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

  useEffect(() => {
    const storedId = localStorage.getItem("babyId");
    if (storedId) {
      setCurrentBabyId(Number(storedId));
    }
  }, []);

  const handleSelect = (baby: Baby) => {
    localStorage.setItem("babyId", baby.id.toString());
    localStorage.setItem("babyName", baby.name);
    if (baby.photoUrl) localStorage.setItem("babyPhoto", baby.photoUrl);

    // Force a short delay to let storage sync, then hard reload
    setTimeout(() => {
      window.location.href = "/";
    }, 100); // ← give browser time to flush
  };

  const handleAddBaby = async () => {
    if (!newBabyName.trim() || !userId) return;

    const res = await fetch(`${API_BASE}/api/baby`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newBabyName.trim(),
        userId,
        photoUrl: newPhotoUrl || null,
      }),
    });

    const data = await res.json();
    if (res.ok) {
      setBabies((prev) => [
        ...prev,
        { id: data.id, name: newBabyName.trim(), photoUrl: newPhotoUrl },
      ]);
      setNewBabyName("");
      setNewPhotoUrl("");
      setAdding(false);
    }
  };

  const handleEditSave = async (babyId: number) => {
    const res = await fetch(`${API_BASE}/api/baby/${babyId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editedName, photoUrl: editedPhotoUrl }),
    });

    if (res.ok) {
      setBabies((prev) =>
        prev.map((b) =>
          b.id === babyId
            ? { ...b, name: editedName, photoUrl: editedPhotoUrl }
            : b
        )
      );
      setEditingId(null);
    }
  };

  return (
    <main className="min-h-screen bg-emerald-50 p-3">
      {/* <div className="max-w-xl mx-auto flex flex-col justify-between m-6">
        <h1 className="text-2xl font-bold mb-4 text-emerald-600">
        👶 รายชื่อลูก
        </h1>
      </div> */}

      <div className="max-w-xl flex flex-row justify-start my-6 mx-4 h-12">
        <Baby className="text-teal-400 h-12 mr-2" size={48} />
        <h1 className="text-xl font-bold mb-4 text-gray-600 flex items-center justify-center h-12">
          <span>รายชื่อลูก</span>
        </h1>
      </div>

      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-xl p-2 space-y-4">
        {/* <h1 className="text-2xl font-bold text-emerald-600">👶 My Babies</h1> */}

        {loading ? (
          <div className="flex flex-col justify-center items-center py-10 mb-10">
          <motion.div
            className="w-10 h-10 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          />
          <p className="text-md font-medium text-gray-600 animate-pulse m-6">
            กำลังโหลดรายชื่อเด็ก...
          </p>
        </div>
        ) : babies.length === 0 ? (
          <p className="text-gray-500">
            No babies found. Please add one below.
          </p>
        ) : (
          <ul className="space-y-2">
            {babies.map((baby) => (
              //   <li
              //     key={baby.id}
              //     className="flex flex-col gap-2 border p-3 rounded-xl hover:bg-emerald-100 transition"
              //   >
              <li
                key={baby.id}
                className={`flex flex-col gap-2 border p-3 rounded-xl hover:bg-emerald-100 transition ${
                  currentBabyId === baby.id
                    ? "bg-emerald-50 border-emerald-200 shadow-md bg-gradient-to-tr from-emerald-50 to-emerald-200"
                    : "hover:bg-gray-100"
                }`}
              >
                {editingId === baby.id ? (
                  <>
                    <div className="space-y-2">
                      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                        <input
                          value={editedName}
                          onChange={(e) => setEditedName(e.target.value)}
                          className="flex-1 px-4 py-2 border rounded-xl focus:outline-none focus:ring focus:ring-emerald-300 text-gray-800"
                          placeholder="Name"
                        />
                        <input
                          value={editedPhotoUrl}
                          onChange={(e) => setEditedPhotoUrl(e.target.value)}
                          className="flex-1 px-4 py-2 border rounded-xl focus:outline-none focus:ring focus:ring-emerald-300 text-gray-800"
                          placeholder="Photo URL"
                        />
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleEditSave(baby.id)}
                          className="bg-emerald-500 text-white px-4 py-2 rounded-xl hover:bg-emerald-600"
                        >
                          บันทึก
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="text-sm text-gray-600 hover:underline"
                        >
                          ยกเลิก
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <img
                        src={baby.photoUrl || defaultAvatarUrl}
                        alt={baby.name}
                        className="w-14 h-14 rounded-full object-cover border-2 border-emerald-200"
                      />
                      <span className="text-lg font-semibold text-gray-800">
                        {baby.name}
                      </span>
                      {currentBabyId === baby.id && (
                        <div className="ml-2 text-xs text-green-600 font-medium flex flex-row items-center">
                          <Check/> <span>ใช้งานอยู่</span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSelect(baby)}
                        className="text-sm text-white bg-emerald-500 px-3 py-1 rounded-xl hover:bg-emerald-400"
                      >
                        เลือก
                      </button>
                      <button
                        onClick={() => {
                          setEditingId(baby.id);
                          setEditedName(baby.name);
                          setEditedPhotoUrl(baby.photoUrl ?? "");
                        }}
                        className="text-sm text-gray-600 bg-gray-200 px-3 py-1 rounded-xl hover:bg-gray-100 hover:shadow-2xl hover:transition hover:duration-200"
                      >
                        แก้ไข
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
              ➕ เพิ่มรายชื่อลูก
            </button>
          ) : (
            <div className="space-y-2">
              <input
                value={newBabyName}
                onChange={(e) => setNewBabyName(e.target.value)}
                placeholder="ระบุชื่อเด็ก"
                className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring text-gray-600 focus:ring-emerald-300"
              />
              <input
                value={newPhotoUrl}
                onChange={(e) => {
                  setNewPhotoUrl(e.target.value);
                  setPhotoPreviewUrl(e.target.value);
                }}
                placeholder="ระบุ URL รูปภาพ (ไม่บังคับ)"
                className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring text-gray-600 focus:ring-emerald-300"
              />
              {photoPreviewUrl && (
                <div className="pt-2">
                  <img
                    src={photoPreviewUrl}
                    alt="Preview"
                    onError={(e) => (e.currentTarget.src = defaultAvatarUrl)}
                    className="w-16 h-16 rounded-full object-cover border border-emerald-300 shadow-sm"
                  />
                </div>
              )}
              <div className="flex gap-2">
                <button
                  onClick={handleAddBaby}
                  className="bg-emerald-500 text-white px-4 py-2 rounded-xl hover:bg-emerald-600"
                >
                  สร้าง
                </button>
                <button
                  onClick={() => {
                    setAdding(false);
                    setNewBabyName("");
                    setNewPhotoUrl("");
                  }}
                  className="text-sm text-gray-600 hover:underline"
                >
                  ยกเลิก
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </main>
  );
}
