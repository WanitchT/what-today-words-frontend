"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import supabase from "@/lib/supabaseClient";
import { BookA ,Pencil, X, CalendarArrowDown, CalendarArrowUp } from "lucide-react";

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

  const [sortAsc, setSortAsc] = useState<boolean>(true);

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
    fetch(`${API_BASE}/api/words/${babyId}?userId=${userId}&sortAsc=${sortAsc}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("Fetched words:", data); // 👈 ADD THIS
        setWords(Array.isArray(data) ? data : []);
        setIsLoading(false);
      });
  }, [babyId, userId, sortAsc]);

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
      family: { label: 'ครอบครัว', emoji: '👨‍👩‍👧', color: 'bg-pink-50 text-pink-400' },
      animal: { label: 'สัตว์', emoji: '🐶', color: 'bg-purple-50 text-purple-800' },
      food:   { label: 'อาหาร', emoji: '🍎', color: 'bg-red-50 text-red-800' },
      object: { label: 'สิ่งของ', emoji: '📦', color: 'bg-yellow-50 text-yellow-800' },
      emotion:{ label: 'อารมณ์', emoji: '😊', color: 'bg-blue-50 text-blue-800' },
      action: { label: 'การกระทำ', emoji: '🏃', color: 'bg-green-50 text-green-800' },
      other:  { label: 'อื่น ๆ', emoji: '🔍', color: 'bg-gray-100 text-gray-700' },
    };

    const fallback = { label: category || '', emoji: '🏷️', color: 'bg-emerald-100 text-emerald-800' };
    const { emoji, label, color } = categoryMap[category || ''] || fallback;

    return (
      <motion.span
        layout
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className={`inline-block text-xs px-2 py-1 rounded-full ml-4 ${color}`}
      >
        {emoji} {label}
        {id !== undefined && (
          <button
            onClick={() => {
              setEditingId(id);
              setNewCategory(category || '');
            }}
            className="ml-1 text-gray-500 hover:text-gray-700 text-xs"
          ><Pencil size={12}/></button>
        )}
      </motion.span>
    );
  };

  return (
    <main className="min-h-screen bg-emerald-50 text-gray-800 p-3">
      <div className="max-w-xl flex flex-row justify-start my-6 mx-4 h-12">
        <BookA className="text-orange-500 h-12 mr-2" size={48} />
        <h1 className="text-xl font-bold mb-4 text-gray-600 flex items-center justify-center h-12">
          <span>คำศัพท์ทั้งหมดที่ {babyName} พูดได้</span>
        </h1>
      </div>

      

      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-xl p-2">
        <div className="mb-4 flex flex-row items-center justify-between text-center">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-xl text-sm"
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

          <button
            onClick={() => setSortAsc((prev) => !prev)}
            className="text-xs ml-1 cursor-pointer flex flex-row items-center justify-center text-gray-500 hover:text-gray-800 bg-gray-50 rounded-xl px-2 py-2 font-normal hover:bg-gray-200 transition"
          >
            <span>เรียงตามวันที่ :</span> {sortAsc ? <CalendarArrowUp /> : <CalendarArrowDown />}
          </button>
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
            <div className="space-y-2">
              {filteredWords.map((word) => (
                <motion.li
                  key={word.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="flex justify-between items-center border border-gray-300 bg-white px-4 py-2 rounded-xl hover:shadow-md transition hover:bg-gray-50"
                >
                  <div>
                    <p className="font-medium text-lg text-emerald-600">
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
                    <p className="text-xs text-gray-400 mt-1">{word.date}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(word.id)}
                    className="text-xs text-red-400 bg-red-50 rounded-xl px-2 py-2 hover:text-red-800 hover:bg-red-200 font-semibold flex items-center justify-center flex-row"
                  >
                    <X size={16}/> ลบ
                  </button>
                </motion.li>
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>
    </main>
  );
}