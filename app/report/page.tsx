"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import supabase from "@/lib/supabaseClient";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE!;

type WordEntry = {
  id: number;
  word: string;
  date: string;
  category?: string;
};

export default function ReportPage() {
  const [words, setWords] = useState<WordEntry[]>([]);
  const [babyId, setBabyId] = useState<number | null>(null);
  const [babyName, setBabyName] = useState<string>("");
  const [userId, setUserId] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<string>('all');
  const [savedId, setSavedId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newCategory, setNewCategory] = useState<string>('');

  const filteredWords = words.filter((w) =>
    filter === 'all' ? true : w.category === filter
  );

  useEffect(() => {
    const storedId = localStorage.getItem("babyId");
    const storedName = localStorage.getItem("babyName");
    if (storedId && storedName) {
      setBabyId(Number(storedId));
      setBabyName(storedName);
    }

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.id) setUserId(user.id);
    });
  }, []);

  useEffect(() => {
    if (!babyId || !userId) return;
    setIsLoading(true);
    fetch(`${API_BASE}/api/words/${babyId}?userId=${userId}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("Fetched words:", data); // 👈 ADD THIS
        setWords(Array.isArray(data) ? data : []);
        setIsLoading(false);
      });
  }, [babyId, userId]);

  const handleDelete = async (id: number) => {
    if (!userId) return;
  
    await fetch(`${API_BASE}/api/words/${id}?userId=${userId}`, {
      method: "DELETE",
    });
  
    setWords((prev) => prev.filter((w) => w.id !== id));
  };

  const handleCategoryUpdate = async (id: number) => {
    await fetch(`${API_BASE}/api/words/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category: newCategory })
    });

    setWords((prev) =>
      prev.map((w) => (w.id === id ? { ...w, category: newCategory } : w))
    );
    setEditingId(null);
    setNewCategory('');
    setSavedId(id);
    setTimeout(() => setSavedId(null), 1500);
  };

  const categoryBadge = (category?: string, id?: number) => {
    const categoryMap: { [key: string]: { label: string; emoji: string; color: string } } = {
      family: { label: 'ครอบครัว', emoji: '👨‍👩‍👧', color: 'bg-pink-100 text-pink-800' },
      animal: { label: 'สัตว์', emoji: '🐶', color: 'bg-purple-100 text-purple-800' },
      food:   { label: 'อาหาร', emoji: '🍎', color: 'bg-red-100 text-red-800' },
      object: { label: 'สิ่งของ', emoji: '📦', color: 'bg-yellow-100 text-yellow-800' },
      emotion:{ label: 'อารมณ์', emoji: '😊', color: 'bg-blue-100 text-blue-800' },
      action: { label: 'การกระทำ', emoji: '🏃', color: 'bg-green-100 text-green-800' },
      other:  { label: 'อื่น ๆ', emoji: '🔍', color: 'bg-gray-200 text-gray-700' },
    };

    const fallback = { label: category || '', emoji: '🏷️', color: 'bg-emerald-100 text-emerald-800' };
    const { emoji, label, color } = categoryMap[category || ''] || fallback;

    return (
      <motion.span
        layout
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className={`inline-block text-xs px-2 py-1 rounded-full ml-2 ${color}`}
      >
        {emoji} {label}
        {id !== undefined && (
          <button
            onClick={() => {
              setEditingId(id);
              setNewCategory(category || '');
            }}
            className="ml-1 text-gray-500 hover:text-gray-700 text-xs"
          >✏️</button>
        )}
      </motion.span>
    );
  };

  return (
    <main className="min-h-screen bg-mint-100 text-gray-800 p-6 font-sans">
      <div className="max-w-xl mx-auto flex flex-col justify-between m-6">
        <h1 className="text-2xl font-bold mb-4 text-emerald-600">
          📝 คำศัพท์ทั้งหมดที่ {babyName} พูดได้
        </h1>
      </div>

      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-xl p-6">
        <div className="mb-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border rounded-xl text-sm"
          >
            <option value="all">🔍 ประเภทคำทั้งหมด</option>
            <option value="family">👨‍👩‍👧 ครอบครัว</option>
            <option value="animal">🐶 สัตว์</option>
            <option value="food">🍎 อาหาร</option>
            <option value="object">📦 สิ่งของ</option>
            <option value="emotion">😊 อารมณ์</option>
            <option value="action">🏃 การกระทำ</option>
            <option value="other">🔍 อื่น ๆ</option>
          </select>
        </div>

        {isLoading ? (
          <div className="flex flex-col justify-center items-center py-10 mb-10">
            <motion.div
              className="w-10 h-10 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            />
            <p className="text-md font-medium animate-pulse m-6">
              กำลังโหลดคำศัพท์...
            </p>
          </div>
        ) : words.length === 0 ? (
          <p className="text-gray-500">ยังไม่มีคำศัพท์ที่บันทึกไว้</p>
        ) : (
          <AnimatePresence>
            <ul className="space-y-4">
              {filteredWords.map((word) => (
                <motion.li
                  key={word.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="flex justify-between items-center border border-emerald-300 bg-emerald-50 p-4 rounded-xl hover:shadow-md transition bg-gradient-to-tr from-emerald-50 to-emerald-100"
                >
                  <div>
                    <p className="font-medium text-lg text-emerald-800">
                      {word.word}
                      {editingId === word.id ? (
                        <>
                          <select
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                            className="ml-2 text-sm border rounded px-2 py-1"
                          >
                            <option value="">-- เลือกประเภทคำ --</option>
                            <option value="family">👨‍👩‍👧 ครอบครัว</option>
                            <option value="animal">🐶 สัตว์</option>
                            <option value="food">🍎 อาหาร</option>
                            <option value="object">📦 สิ่งของ</option>
                            <option value="emotion">😊 อารมณ์</option>
                            <option value="action">🏃 การกระทำ</option>
                            <option value="other">🔍 อื่น ๆ</option>
                          </select>
                          <button
                            onClick={() => handleCategoryUpdate(word.id)}
                            className="ml-2 text-sm text-blue-600 hover:underline"
                          >
                            Save
                          </button>
                        </>
                      ) : (
                        categoryBadge(word.category, word.id)
                      )}
                      {savedId === word.id && (
                        <motion.span
                          className="ml-2 text-green-600 text-xs"
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          transition={{ duration: 0.4 }}
                        >
                          ✅ Saved
                        </motion.span>
                      )}
                    </p>
                    <p className="text-sm text-gray-500">{word.date}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(word.id)}
                    className="text-sm text-red-600 bg-red-100 rounded-2xl px-2 py-2 hover:text-red-800 font-semibold"
                  >
                    ✖ ลบ
                  </button>
                </motion.li>
              ))}
            </ul>
          </AnimatePresence>
        )}
      </div>
    </main>
  );
}