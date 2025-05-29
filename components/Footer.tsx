"use client";

import { Baby } from "lucide-react";

export default function Footer() {
  return (
    <>
      <footer className="bg-gray-50 text-sm text-center text-gray-500 py-6 border-t border-emerald-100">
        <div className="max-w-2xl mx-auto px-4">
          <p className="mb-3 flex flex-row items-center justify-center">
            <Baby className="mr-2 text-emerald-400" />
            <span>สร้างด้วยรักเพื่อบันทึกคำแรกของลูกน้อย</span>
          </p>
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} วันนี้ลูกพูดอะไร
          </p>
          <p className="text-xs my-3">
            <a
              href="https://phatabyte.tech"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-500 flex flex-row items-center justify-center"
            >
                {/* <Link className="mr-2 text-emerald-400" size={18} /> */}
                <span>todayword.PhataByte.tech</span>
            </a>
          </p>
        </div>
      </footer>
    </>
  );
}
