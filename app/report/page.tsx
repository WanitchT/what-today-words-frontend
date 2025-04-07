"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";


const API_BASE = "https://what-today-words-backend-production.up.railway.app"; // 🌐 Replace with your backend URL

type WordEntry = {
  id: number;
  word: string;
  date: string;
};

export default function ReportPage() {
  const [words, setWords] = useState<WordEntry[]>([]);
  const [babyId, setBabyId] = useState<number | null>(null);
  const [babyName, setBabyName] = useState<string>("");


const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const storedId = localStorage.getItem("babyId");
    const storedName = localStorage.getItem("babyName");
    if (storedId && storedName) {
      setBabyId(Number(storedId));
      setBabyName(storedName);
    }
  }, []);

  useEffect(() => {
    if (!babyId) return;
    setIsLoading(true);
    fetch(`${API_BASE}/api/words/${babyId}`)
      .then((res) => res.json())
      .then((data) => {
        setWords(data);
        setIsLoading(false);
      });
  }, [babyId]);

  const handleDelete = async (id: number) => {
    await fetch(`${API_BASE}/api/words/${id}`, {
      method: "DELETE",
    });
    setWords((prev) => prev.filter((w) => w.id !== id));
  };

  return (
    <main className="min-h-screen bg-mint-100 text-gray-800 p-6 font-sans">
      <div className="max-w-xl mx-auto flex flex-col justify-between m-6">
        <h1 className="text-2xl font-bold mb-4 text-emerald-600">
          📝 คำศัพท์ทั้งหมดที่ {babyName} พูดได้
        </h1>
        <Link
          href="/"
          className="text-gray-500 text-center hover:underline inline-block px-4 py-2 rounded-xl bg-gray-100 mb-4"
        >
          ← กลับหน้าแรก
        </Link>
      </div>

      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-xl p-6">
        {/* <h1 className="text-2xl font-bold mb-4 text-emerald-600">
          📝 คำศัพท์ทั้งหมดที่ {babyName} พูดได้
        </h1> */}

{isLoading ? (
  <div className="flex justify-center items-center py-10">
    <motion.div
      className="w-10 h-10 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"
      initial={{ rotate: 0 }}
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
    />
  </div>
) : words.length === 0 ? (
          <p className="text-gray-500">ยังไม่มีคำศัพท์ที่บันทึกไว้</p>
        ) : (
          <AnimatePresence>
            <ul className="space-y-4">
              {words.map((word) => (
                <motion.li
                  key={word.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="flex justify-between items-center bg-emerald-50 p-4 rounded-xl shadow-sm hover:shadow-md transition"
                >
                  <div>
                    <p className="font-medium text-lg text-emerald-800">
                      {word.word}
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
