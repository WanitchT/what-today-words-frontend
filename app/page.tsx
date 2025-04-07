"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from 'next/link';

const API_BASE = "https://what-today-words-backend-production.up.railway.app"; // ⛳ Replace with your deployed backend URL

export default function Home() {
  const [babyName, setBabyName] = useState<string>("");
  const [babyId, setBabyId] = useState<number | null>(null);
  const [word, setWord] = useState<string>("");
  const getToday = () => new Date().toISOString().split("T")[0];
  const [date, setDate] = useState<string>(getToday());
  const [submitted, setSubmitted] = useState<boolean>(false);

  const babyPhotoUrl =
    "https://scontent.fbkk28-1.fna.fbcdn.net/v/t39.30808-6/440373487_3904904916406980_326842818157947790_n.jpg?stp=cp6_dst-jpg_tt6&_nc_cat=108&ccb=1-7&_nc_sid=a5f93a&_nc_ohc=OiFCDSin1nkQ7kNvwGPnQ_1&_nc_oc=AdnSiI3vn6A1Q4-ywvrhByT-lGyOxASyw9BQLDWGcG-QzpGQdWdTrqCpW0D6qDh_qfo&_nc_zt=23&_nc_ht=scontent.fbkk28-1.fna&_nc_gid=qfODAZJcrjQ5Rww7mPAMBg&oh=00_AfFuvrSNTdVzJajxflE4aMBxNA41SzSFiCr6rtKAC6y8bA&oe=67F92B2C";

  useEffect(() => {
    const storedId = localStorage.getItem("babyId");
    const storedName = localStorage.getItem("babyName");
    if (storedId && storedName) {
      setBabyId(Number(storedId));
      setBabyName(storedName);
    }
  }, []);

  const handleNameSubmit = async () => {
    const res = await fetch(`${API_BASE}/api/baby`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: babyName }),
    });
    const data = await res.json();
    setBabyId(data.id);
    localStorage.setItem("babyId", data.id.toString());
    localStorage.setItem("babyName", babyName);
  };

  const handleWordSubmit = async () => {
    if (!word || !date || !babyId) return;
    await fetch(`${API_BASE}/api/words`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ word, date, babyId }),
    });
    setWord("");
    setDate("");
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="max-w-xl mx-auto bg-white rounded-2xl shadow-xl p-6"
    >
      <main className="min-h-screen bg-mint-100 p-6 font-anuphan text-gray-800">
        <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-xl p-6">
          <div className="flex items-center gap-4 mb-4">
            <img
              src={babyPhotoUrl}
              alt="Baby"
              className="w-16 h-16 rounded-full object-cover border-2 border-emerald-300 shadow"
            />
            <h1 className="text-2xl font-bold text-emerald-600 font-anuphan">
              วันนี้ {babyName || "your baby"} พูดอะไร?
            </h1>
          </div>

          {!babyId ? (
            <div className="space-y-4">
              <p className="text-gray-600">
                Enter your baby name to get started:
              </p>
              <input
                value={babyName}
                onChange={(e) => setBabyName(e.target.value)}
                placeholder="Baby's name"
                className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring focus:ring-emerald-300"
              />
              <button
                onClick={handleNameSubmit}
                className="bg-emerald-500 text-white px-4 py-2 rounded-xl hover:bg-emerald-600 transition"
              >
                Save Name
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-emerald-700">
                Welcome, {babyName}! 👋
              </h2>
              <p>Add a new word your baby said today:</p>
              <input
                value={word}
                onChange={(e) => setWord(e.target.value)}
                placeholder="Word"
                className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring focus:ring-emerald-300"
              />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring focus:ring-emerald-300"
              />
              <button
                onClick={handleWordSubmit}
                className="bg-emerald-500 text-white px-4 py-2 rounded-xl hover:bg-emerald-600 transition"
              >
                Add Word
              </button>
              <AnimatePresence>
                {submitted && (
                  <motion.p
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className="text-green-600 font-medium"
                  >
                    ✅ Word added!
                  </motion.p>
                )}
              </AnimatePresence>
              
              <Link href="/report" className="text-emerald-500 hover:underline">
  📄 View Report
</Link>
            </div>
          )}
        </div>
      </main>
    </motion.div>
  );
}
