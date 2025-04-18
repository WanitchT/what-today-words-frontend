"use client";

"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import supabase from "@/lib/supabaseClient"; // ✅ Supabase client

export default function HamburgerMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.id) {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
    });
  }, []);

  const handleClearData = async () => {
    localStorage.removeItem("babyId");
    localStorage.removeItem("babyName");
    localStorage.removeItem("babyPhoto");

    await supabase.auth.signOut();

    // Redirect to home (optional)
    window.location.href = "/";
  };

  if (!isLoggedIn) return null;

  return (
    <>
      <motion.button
        className="fixed top-4 left-4 z-50 p-2 bg-white rounded-full shadow"
        onClick={() => setIsOpen(true)}
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.1 }}
      >
        <Menu className="w-6 h-6 text-emerald-700" />
      </motion.button>

      {isOpen && (
        <motion.div
          initial={{ x: -300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -300, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed top-0 left-0 w-full h-full bg-white z-50 p-6"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-emerald-600">Menu</h2>
            <button onClick={() => setIsOpen(false)}>
              <X className="w-6 h-6 text-gray-700" />
            </button>
          </div>
          <ul className="space-y-4">
            <li>
              <Link
                href="/"
                onClick={() => setIsOpen(false)}
                className="text-lg text-emerald-700"
              >
                🏠 หน้าแรก
              </Link>
            </li>
            <li>
              <Link
                href="/report"
                onClick={() => setIsOpen(false)}
                className="text-lg text-emerald-700"
              >
                📋 คำศัพท์ทั้งหมด
              </Link>
            </li>
            <li>
              <Link
                href="/babies"
                onClick={() => setIsOpen(false)}
                className="text-lg text-emerald-700"
              >
                🧒 รายชื่อเด็ก
              </Link>
            </li>
            <li>
              <Link
                href="/dashboard"
                onClick={() => setIsOpen(false)}
                className="text-lg text-emerald-700"
              >
                📊 ดูสถิติ
              </Link>
            </li>
            <li>
              <button
                onClick={handleClearData}
                className="text-lg text-red-600 hover:text-red-600 cursor-pointer"
              >
                🚪 Log Out
              </button>
            </li>
          </ul>
        </motion.div>
      )}
    </>
  );
}
