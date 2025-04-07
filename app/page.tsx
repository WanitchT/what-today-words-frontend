"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const API_BASE = "https://what-today-words-backend-production.up.railway.app"; // ⛳ Replace with your deployed backend URL

export default function Home() {
  const [babyName, setBabyName] = useState<string>("");
  const [babyId, setBabyId] = useState<number | null>(null);
  const [word, setWord] = useState<string>("");
  const [date, setDate] = useState<string>(getToday());
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [manualId, setManualId] = useState<number | null>(null);

  const babyPhotoUrl =
    "https://i.postimg.cc/nLdmZ5Q8/S-1927579622.jpg";

  useEffect(() => {
    const storedId = localStorage.getItem("babyId");
    const storedName = localStorage.getItem("babyName");
    if (storedId && storedName) {
      setBabyId(Number(storedId));
      setBabyName(storedName);
    }
  }, []);

  useEffect(() => {
    if (babyId && babyName) {
      localStorage.setItem("babyId", babyId.toString());
      localStorage.setItem("babyName", babyName);
    }
  }, [babyId, babyName]);

  // const handleNameSubmit = async () => {
  //   const res = await fetch(`${API_BASE}/api/baby`, {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify({ name: babyName }),
  //   });
  //   const data = await res.json();
  //   setBabyId(data.id);
  // };

  const handleWordSubmit = async () => {
    if (!word || !date || !babyId) return;
    await fetch(`${API_BASE}/api/words`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ word, date, babyId }),
    });
    setWord("");
    setDate(getToday());
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 2000);
  };

  const handleUseExistingId = async () => {
    if (!manualId) return;

    const res = await fetch(`${API_BASE}/api/baby/${manualId}`);
    if (!res.ok) {
      alert("Baby ID not found!");
      return;
    }

    const data = await res.json();
    setBabyId(data.id);
    setBabyName(data.name);
  };

  const handleClearData = () => {
    localStorage.removeItem("babyId");
    localStorage.removeItem("babyName");
    setBabyId(null);
    setBabyName("");
  };

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
        {/* <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-xl p-6"> */}

        {!babyId ? (
          <div className="space-y-4">
            {/* <hr className="my-4" /> */}

            <p className="text-gray-600">ป้อน ID ของลูก (ภัท ID: 1):</p>
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

            {/* <button
              onClick={handleClearData}
              className="mt-2 text-sm text-gray-500 hover:underline bg-red-100 px-4 py-2 rounded-xl transition duration-200 ease-in-out"
            >
              Log Out
            </button> */}
          </div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
      {!babyId ? (
        <div className="flex justify-between flex-col max-w-xl mx-auto mt-6 space-y-2">
        </div>
        ) : (
      <div className="flex justify-between flex-col max-w-xl mx-auto p-2 mt-6 space-y-2">
        <Link
          href="/report"
          className="text-gray-800 text-center hover:underline inline-block px-4 py-2  bg-orange-300 rounded-xl shadow-xl"
        >
          ดูคำศัพท์ทั้งหมด
        </Link>
        <button
          onClick={handleClearData}
          className="mt-8 text-sm text-gray-800 hover:underline bg-gray-300 px-4 py-2 rounded-xl transition duration-200 ease-in-out"
        >
          Log Out
        </button>
      </div>
      )}
      </motion.div>

    </main>
  );
}

function getToday(): string {
  return new Date().toISOString().split("T")[0];
}
