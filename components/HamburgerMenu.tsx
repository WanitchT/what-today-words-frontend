"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import supabase from "@/lib/supabaseClient"; // ✅ Supabase client
import { Baby, BookA, House, ChartLine, LogOut } from "lucide-react";

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
        className="fixed top-4 left-4 z-50 p-2 bg-white rounded-full shadow-md"
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
          <div className="flex justify-between items-center mb-4 h-12">
            <h2 className="text-lg font-bold text-emerald-600">Menu</h2>
            <button onClick={() => setIsOpen(false)}>
              <X className="w-6 h-6 text-gray-700" />
            </button>
          </div>
          <div className="w-full h-[calc(100%-3rem)] flex flex-col justify-between items-center mb-6">
            <ul className="space-y-4 w-full">
              <li className="flex items-center w-full">
                <Link
                  href="/"
                  onClick={() => setIsOpen(false)}
                  className="text-lg text-emerald-700 w-full flex items-center border-b-1 border-emerald-100 py-2"
                >
                  <House className="text-red-300 mr-2 text-2xl" />{" "}
                  <span>หน้าแรก</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/report"
                  onClick={() => setIsOpen(false)}
                  className="text-lg text-emerald-700 w-full flex items-center border-b-1 border-emerald-100 py-2"
                >
                  <BookA className="text-orange-300 mr-2 text-2xl" />{" "}
                  <span>คำศัพท์ทั้งหมด</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/babies"
                  onClick={() => setIsOpen(false)}
                  className="text-lg text-emerald-700 w-full flex items-center border-b-1 border-emerald-100 py-2"
                >
                  <Baby className="text-emerald-300 mr-2 text-2xl" />{" "}
                  <span>รายชื่อลูก</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="text-lg text-emerald-700 w-full flex items-center border-b-1 border-emerald-100 py-2"
                >
                  <ChartLine className="text-blue-300 mr-2 text-2xl" />{" "}
                  <span>dashboard</span>
                </Link>
              </li>
            </ul>
            <ul className="w-full">
              <li>
                <button
                  onClick={handleClearData}
                  className="text-lg text-red-700 w-full flex items-center my-8 px-4 py-2 rounded-xl bg-red-50"
                >
                  <LogOut className="text-red-600 mr-2 text-2xl" />{" "}
                  <span>Log Out</span>
                </button>
              </li>
            </ul>
          </div>
        </motion.div>
      )}
    </>
  );
}
