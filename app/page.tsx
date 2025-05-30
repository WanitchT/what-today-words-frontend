"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import supabase from "@/lib/supabaseClient";
import Image from "next/image";
// import { Menu, X } from "lucide-react";
import { Baby, BookA } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE!;

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
  // const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [babyPhotoUrl, setBabyPhotoUrl] = useState<string>("/images/baby-42-128.png");
  // const [isMenuOpen, setIsMenuOpen] = useState(false);

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

  // const handleClearData = async () => {
  //   setIsLoggingOut(true);
  //   localStorage.removeItem("babyId");
  //   localStorage.removeItem("babyName");
  //   await supabase.auth.signOut();
  //   setBabyId(null);
  //   setBabyName("");
  //   setUserEmail(null);
  //   setUserId(null);
  //   setIsLoggingOut(false);
  // };

  const handleLoginWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });
  };

  // if (isBooting || isLoggingOut) {
  if (isBooting) {
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
    <main className="min-h-screen bg-emerald-50 p-3 font-anuphan text-gray-800">
      
      <div className="max-w-xl mx-auto relative m-6">

        <div className="flex items-center gap-4 pl-2">
        <Image
          src={babyPhotoUrl || "/images/baby-42-128.png"} // fallback if needed
          alt="Baby"
          width={72}
          height={72}
          className="w-18 h-18 rounded-full object-cover border-2 border-emerald-300 shadow"
          priority
        />
          <h1 className="text-2xl font-bold bg-gradient-to-br from-[#03c8ae] from-55% to-[#076bed] text-transparent bg-clip-text">
            วันนี้ {babyName || "ลูก"} พูดอะไร?
          </h1>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-xl mx-auto bg-white rounded-2xl shadow-md p-6"
      >
        {!userEmail ? (
          <div className="text-center space-y-4">
            <p className="text-gray-600">กรุณาเข้าสู่ระบบเพื่อเริ่มใช้งาน</p>
            <button
              onClick={handleLoginWithGoogle}
              className="text-white  bg-[#4285F4] hover:bg-[#4285F4]/90 focus:ring-4 focus:outline-none focus:ring-[#4285F4]/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center justify-between mr-2 mb-2"
            >
              <svg className="mr-2 -ml-1 w-4 h-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path></svg> Sign in with Google
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
              <option value="vehicle">🚕 ยานพาหนะ</option>
              <option value="color">🟥 สี</option>
              <option value="personname">🙍🏼‍♂️ ชื่อคน</option>
              <option value="body">🤘 ร่างกาย</option>
              <option value="object">📦 สิ่งของ</option>
              <option value="emotion">😊 อารมณ์</option>
              <option value="action">🏃 การกระทำ</option>
              <option value="other">🔍 อื่น ๆ</option>
            </select>
            <button
              onClick={handleWordSubmit}
              className="bg-teal-400 bg-gradient-to-tr from-teal-300 to-green-400 text-teal-800 px-4 py-2 rounded-xl hover:bg-emerald-600 transition"
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
          <div className="flex justify-between flex-row max-w-xl mx-auto p-2 mt-6 space-y-2 space-x-4">
            <Link
              href={`/report?userId=${userId}`}
              className="text-md text-center w-full flex justify-center items-center bg-orange-300 text-orange-700 rounded-xl py-2 shadow-md h-14"
            >
              <BookA className="text-orange-700 mr-2 text-2xl" />{" "}
              <span>ดูคำศัพท์ทั้งหมด</span>
            </Link>
            <Link
              href="/babies"
              className="text-md text-center text-gray-700 w-full flex justify-center items-center bg-gray-300 rounded-xl py-2 shadow-md h-14"
            >
              <Baby className="text-gray-700 mr-2 text-2xl" />{" "}
              <span>รายชื่อลูก</span>
            </Link>
          </div>
        </motion.div>
      )}
    </main>
  );
}

function getToday(): string {
  return new Date().toISOString().split("T")[0];
}
