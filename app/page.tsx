"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import supabase from "@/lib/supabaseClient";

const API_BASE = "https://what-today-words-backend-production.up.railway.app";

export default function Home() {
  const [babyName, setBabyName] = useState<string>("");
  const [babyId, setBabyId] = useState<number | null>(null);
  const [word, setWord] = useState<string>("");
  const [date, setDate] = useState<string>(getToday());
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [manualId, setManualId] = useState<number | null>(null);
  const [category, setCategory] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isBooting, setIsBooting] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [babyPhotoUrl, setBabyPhotoUrl] = useState<string>("https://i.postimg.cc/nLdmZ5Q8/S-1927579622.jpg");

  // const babyPhotoUrl = "https://i.postimg.cc/nLdmZ5Q8/S-1927579622.jpg";

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.id) setUserId(user.id);
    });
  }, []);

  useEffect(() => {
    const fetchUserAndBaby = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          setUserEmail(user.email ?? null);
          setUserId(user.id ?? null);

          const storedId = localStorage.getItem("babyId");
          const storedName = localStorage.getItem("babyName");
          const storedPhoto = localStorage.getItem("babyPhoto");

          if (storedId && storedName) {
            setBabyId(Number(storedId));
            setBabyName(storedName);
            if (storedPhoto) setBabyPhotoUrl(storedPhoto);
            return;
          }

          const res = await fetch(`${API_BASE}/api/babies?userId=${user.id}`);
          const babies = await res.json();

          if (Array.isArray(babies) && babies.length > 0) {
            setBabyId(babies[0].id);
            setBabyName(babies[0].name);
            localStorage.setItem("babyId", babies[0].id.toString());
            localStorage.setItem("babyName", babies[0].name);
            if (babies[0].photo_url) {
              setBabyPhotoUrl(babies[0].photo_url);
              localStorage.setItem("babyPhoto", babies[0].photo_url);
            }
          }
        }
      } catch (err) {
        console.error("Error booting app:", err);
      } finally {
        setIsBooting(false);
      }
    };

    fetchUserAndBaby();
  }, []);

  useEffect(() => {
    if (babyId && babyName) {
      localStorage.setItem("babyId", babyId.toString());
      localStorage.setItem("babyName", babyName);
    }
  }, [babyId, babyName]);

  const handleWordSubmit = async () => {
    if (!word || !date || !babyId || !userId) return;

    await fetch(`${API_BASE}/api/words`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ word, date, babyId, category, userId }),
    });

    setWord("");
    setDate(getToday());
    setSubmitted(true);
    setCategory("");
    setTimeout(() => setSubmitted(false), 2000);
  };

  const handleUseExistingId = async () => {
    if (!manualId || !userId) return;
    const res = await fetch(
      `${API_BASE}/api/baby/${manualId}?userId=${userId}`
    );
    if (!res.ok) {
      alert("Baby ID not found or unauthorized!");
      return;
    }
    const data = await res.json();
    setBabyId(data.id);
    setBabyName(data.name);
  };

  const handleCreateBaby = async () => {
    if (!babyName || !userId) return;
    const res = await fetch(`${API_BASE}/api/baby`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: babyName, userId }),
    });
    const data = await res.json();
    setBabyId(data.id);
  };

  const handleClearData = async () => {
    setIsLoggingOut(true);
    localStorage.removeItem("babyId");
    localStorage.removeItem("babyName");
    await supabase.auth.signOut();
    setBabyId(null);
    setBabyName("");
    setUserEmail(null);
    setUserId(null);
    setIsLoggingOut(false);
  };

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({ provider: "google" });
  };

  if (isBooting || isLoggingOut) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-emerald-50 text-gray-800">
        <motion.div
          className="w-10 h-10 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin"
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-emerald-50 p-6 font-anuphan text-gray-800">
      <div className="max-w-xl mx-auto flex items-center gap-4 m-6">
        <img
          src={babyPhotoUrl}
          alt="Baby"
          className="w-20 h-20 rounded-full object-cover border-2 border-emerald-300 shadow"
        />
        <h1 className="text-3xl font-bold text-emerald-600 font-mitr">
          วันนี้ {babyName || "..."} พูดอะไร?
        </h1>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-xl mx-auto bg-white rounded-2xl shadow-xl p-6"
      >
        {!userEmail ? (
          <div className="text-center space-y-4">
            <p className="text-gray-600">กรุณาเข้าสู่ระบบเพื่อเริ่มต้น</p>
            <button
              onClick={handleLogin}
              className="bg-emerald-500 text-white px-6 py-2 rounded-xl hover:bg-emerald-600"
            >
              🔐 Sign in with Google
            </button>
          </div>
        ) : !babyId ? (
          <div className="space-y-4">
            <p className="text-gray-600">
              เริ่มต้นด้วยการตั้งชื่อลูกหรือนำเข้า ID เดิม
            </p>
            <input
              value={babyName}
              onChange={(e) => setBabyName(e.target.value)}
              placeholder="ชื่อลูกของคุณ"
              className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring focus:ring-emerald-300"
            />
            <button
              onClick={handleCreateBaby}
              className="bg-emerald-500 text-white px-4 py-2 rounded-xl hover:bg-emerald-600"
            >
              ➕ สร้างโปรไฟล์ลูกใหม่
            </button>
            <hr />
            <p className="text-gray-600">หากมี Baby ID เดิม:</p>
            <input
              type="number"
              onChange={(e) => setManualId(Number(e.target.value))}
              placeholder="ID ของลูก"
              className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring focus:ring-emerald-300"
            />
            <button
              onClick={handleUseExistingId}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-300 transition"
            >
              ใช้ ID เดิมของลูก
            </button>
          </div>
        ) : (
          <div className="space-y-4 flex flex-col">
            <p>เพิ่มคำศัพท์ใหม่ๆที่ลูกพูดได้:</p>
            <input
              value={word}
              onChange={(e) => setWord(e.target.value)}
              placeholder="เพิ่มคำศัพท์"
              className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring focus:ring-emerald-300"
            />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring focus:ring-emerald-300"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring focus:ring-emerald-300"
            >
              <option value="">🗂️ เลือกประเภทคำ</option>
              <option value="family">👨‍👩‍👧 ครอบครัว</option>
              <option value="animal">🐶 สัตว์</option>
              <option value="food">🍎 อาหาร</option>
              <option value="object">📦 สิ่งของ</option>
              <option value="emotion">😊 อารมณ์</option>
              <option value="action">🏃 การกระทำ</option>
              <option value="other">🔍 อื่น ๆ</option>
            </select>
            <button
              onClick={handleWordSubmit}
              className="bg-teal-400 text-white px-4 py-2 rounded-xl hover:bg-emerald-600 transition"
            >
              เพิ่มคำศัพท์
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
          </div>
        )}
      </motion.div>

      {userEmail && babyId && (
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex justify-between flex-col max-w-xl mx-auto p-2 mt-6 space-y-2">
            <Link
              href={`/report?userId=${userId}`}
              className="text-gray-800 text-center hover:underline inline-block px-4 py-2  bg-orange-300 rounded-xl shadow-xl"
            >
              ดูคำศัพท์ทั้งหมด
            </Link>
            <Link
              href="/babies"
              className="text-center text-sm text-emerald-600 hover:underline"
            >
              🧒 Switch Baby Profile
            </Link>
            <button
              onClick={handleClearData}
              className="mt-8 text-sm text-gray-800 hover:underline bg-gray-300 px-4 py-2 rounded-xl transition duration-200 ease-in-out"
            >
              Log Out
            </button>
          </div>
        </motion.div>
      )}
    </main>
  );
}

function getToday(): string {
  return new Date().toISOString().split("T")[0];
}
