'use client';

import { JSX, useEffect, useState } from 'react';
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import supabase from '@/lib/supabaseClient';

import { CalendarDays, ChartLine, MessageCircle, CaseUpper, Tag, TrendingUp, TrendingDown} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE!;

type WordStat = {
  date: string;
  count: number;
};

type Stats = {
  today: number;
  yesterday: number;
  thisWeek: number;
  lastWeek: number;
  total: number;
  topCategory: string;
  topCategories: { category: string; count: number }[];
};



const COLORS = ['#34D399', '#60A5FA', '#FBBF24']; // emerald, blue, amber

export default function WordStatsDashboard() {
  const [data, setData] = useState<WordStat[]>([]);
  const [babyId, setBabyId] = useState<number | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  // const [startDate, setStartDate] = useState<string>('');
  // const [endDate, setEndDate] = useState<string>('');

  type CategoryStat = { category: string; count: number };
  const [topCategories, setTopCategories] = useState<CategoryStat[]>([]);

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);


  const defaultStats: Stats = {
    today: 0,
    yesterday: 0,
    thisWeek: 0,
    lastWeek: 0,
    total: 0,
    topCategory: "-",
    topCategories: [],
  };
  
  const [stats, setStats] = useState<Stats>(defaultStats);
  const [startDate, setStartDate] = useState<string>(get30DaysAgo());
  const [endDate, setEndDate] = useState<string>(getToday());

  useEffect(() => {
    const storedId = localStorage.getItem('babyId');
    if (storedId) setBabyId(Number(storedId));
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.id) setUserId(user.id);
    });
  }, []);

  useEffect(() => {
    if (!babyId || !userId) return;
    setIsLoading(true);
    let url = `${API_BASE}/api/stats?babyId=${babyId}&userId=${userId}`;
    if (startDate) url += `&start=${startDate}`;
    if (endDate) url += `&end=${endDate}`;
    if (selectedCategory) url += `&category=${selectedCategory}`;

    fetch(url)
      .then((res) => res.json())
      .then((stats: WordStat[]) => {
        const sorted = stats.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        setData(sorted);
        setIsLoading(false);
      });

    // Fetch aggregate stats (custom endpoint or logic)
    fetch(`${API_BASE}/api/stats/summary?babyId=${babyId}&userId=${userId}`)
      .then((res) => res.json())
      .then((s) => {
        setStats(s);
        setTopCategories(s.topCategories);
        setIsLoading(false);
      });
  }, [babyId, userId, startDate, endDate, selectedCategory]);


  function getToday(): string {
    return new Date().toISOString().split("T")[0];
  }
  
  function get30DaysAgo(): string {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split("T")[0];
  }

  

  return (
    <main className="min-h-screen p-3 bg-emerald-50">
      {/* <h1 className="text-2xl font-bold text-emerald-700 mb-4">📊 สถิติคำศัพท์รายวัน</h1> */}

      <div className="max-w-xl flex flex-row justify-start my-6 mx-4 h-12">
        <ChartLine className="text-teal-400 h-12 mr-2" size={48} />
        <h1 className="text-xl font-bold mb-4 text-gray-600 flex items-center justify-center h-12">
          <span>Dashboard</span>
        </h1>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard
          icon={<MessageCircle />}
          label="คำศัพท์วันนี้"
          value={stats.today}
          trend={
            stats.today > stats.yesterday ? "up" :
            stats.today < stats.yesterday ? "down" :
            null
          }
          isLoading={isLoading}
        />

        <StatCard
          icon={<CalendarDays />}
          label="คำศัพท์อาทิตย์นี้"
          value={stats.thisWeek}
          trend={
            stats.thisWeek > stats.lastWeek ? "up" :
            stats.thisWeek < stats.lastWeek ? "down" :
            null
          }
          isLoading={isLoading}
        />
        <StatCard 
          icon={<CaseUpper />}
          label="คำศัพท์ทั้งหมด" 
          value={stats.total} 
          isLoading={isLoading}
        />
        <StatCardForTopCategory 
          icon={<Tag />}
          label="หมวดหมู่ที่พูดบ่อยที่สุด" 
          value={stats.topCategory} 
        />
      </div>

      <div className="flex gap-4 mb-6 items-end">
        <div>
          <label className="block text-sm text-gray-600 mb-1 ">วันที่เริ่มต้น</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border px-3 py-2 text-gray-600 rounded-xl text-sm"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">วันที่สิ้นสุด</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border px-3 py-2 text-gray-600 rounded-xl text-sm"
          />
        </div>
        {selectedCategory && (
          <button
            onClick={() => setSelectedCategory(null)}
            className="mt-2 text-sm text-emerald-600 underline"
          >
            🔄 Reset category filter
          </button>
        )}
      </div>

      {isLoading ? (
          <div className="flex flex-col justify-center items-center py-10 mb-10">
            <motion.div
              className="w-10 h-10 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            />
            <p className="text-md font-medium animate-pulse m-6 text-gray-500">
              กำลังโหลดข้อมูล...
            </p>
          </div>
        ) : data.length === 0 ? (
        <p className="text-gray-500">ยังไม่มีข้อมูล dashboard</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bar Chart Section */}
          <div >

            <div className="max-w-xl flex flex-row justify-start my-2 mx-4 h-12">
              <CalendarDays className="text-teal-400 h-12 mr-2" size={26} />
              <h1 className="text-lg font-bold mb-2 text-gray-600 flex items-center justify-center h-12">
                <span>คำศัพท์/วัน</span>
              </h1>
            </div>
            
            {selectedCategory && (
              <p className="text-sm text-gray-600 mb-2">
                📊 Showing stats for category: <span className="font-medium">{selectedCategory}</span>
              </p>
            )}
            
            <motion.div
              key={selectedCategory || 'all-categories'}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-white p-2 rounded-xl shadow text-[9px]"
            >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" stroke="#4B5563" />
                <YAxis allowDecimals={false} stroke="#4B5563" />
                <Tooltip />
                <Bar
                  dataKey="count"
                  fill="#34D399"
                  radius={[10, 10, 0, 0]}
                  barSize={30}
                  isAnimationActive={true}
                  animationDuration={500}
                  activeBar={{ fill: "#10B981", stroke: "#047857", strokeWidth: 2 }}
                />
              </BarChart>
            </ResponsiveContainer>
              </motion.div>
          </div>

          {/* Pie Chart Section */}
          <div>
            <div className="max-w-xl flex flex-row justify-start my-2 mx-4 h-12">
              <Tag className="text-teal-400 h-12 mr-2" size={26} />
              <h1 className="text-lg font-bold mb-2 text-gray-600 flex items-center justify-center h-12">
                <span>Top 3 Categories</span>
              </h1>
            </div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="bg-white p-2 rounded-xl shadow"
            >
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                    data={topCategories}
                    dataKey="count"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fontSize={13}
                    label={({ category, count }) => `${category} (${count})`}
                    onClick={(data) => {
                      setSelectedCategory(data.category);
                    }}
                  >
                    {topCategories.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                        cursor="pointer"
                        stroke={entry.category === selectedCategory ? "#000" : "#fff"}
                        strokeWidth={entry.category === selectedCategory ? 3 : 1}
                      />
                    ))}
                  </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            </motion.div>
          </div>
        </div>
      )}
    </main>
  );
}

function StatCard({
  icon,
  label,
  value = 0,
  trend,
  isLoading = false,
}: {
  icon: string | JSX.Element;
  label: string;
  value: number;
  trend?: "up" | "down" | JSX.Element | null;
  isLoading?: boolean;
}) {
  const arrow =
    trend === "up" ? <TrendingUp className='text-green-600'/> : trend === "down" ? <TrendingDown className='text-amber-600'/> : "";

  const trendColor =
    trend === "up" ? "text-green-600" : trend === "down" ? "text-red-500" : "text-gray-400";

  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm flex flex-col items-start">
      {/* <div className="text-xl mb-1"></div> */}
      <div className="text-xs text-gray-500 flex flex-row justify-center text-center items-center gap-2">
        <span className="text-teal-400">{icon}</span> {label} 
        {/* {trend && <span className={`text-base ${trendColor}`}>{arrow}</span>} */}
      </div>

      {isLoading ? (
        <div className="m-6 font-bold flex items-center gap-2 bg-gradient-to-br from-[rgb(0,128,255)] to-[#04e89c] text-transparent bg-clip-text">
          <motion.div
            className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          />
        </div>
      ) : (
        <div className="text-5xl font-bold flex items-center gap-1 bg-gradient-to-br from-[rgb(0,128,255)] to-[#04e89c] text-transparent bg-clip-text">
          {value}
        </div>
      )}

      <div className="text-xs text-gray-500 flex flex-row justify-center items-center gap-2">
         {trend && 
          <div className='flex flex-row items-center gap-1'>
            <span>trending</span> 
            <span className={`text-base ${trendColor}`}>{arrow}</span></div>
          }
      </div>
    </div>
  );
}

function StatCardForTopCategory({
  icon,
  label,
  value,
  trend,
}: {
  icon: string | JSX.Element;
  label: string;
  value: string;
  trend?: "up" | "down" | JSX.Element | null;
}) {
  const arrow =
    trend === "up" ? <TrendingUp className='text-green-600'/> : trend === "down" ? <TrendingDown className='text-amber-600'/> : "";

  const trendColor =
    trend === "up" ? "text-green-600" : trend === "down" ? "text-red-500" : "text-gray-400";

  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm flex flex-col items-start">
      {/* <div className="text-xl mb-1"></div> */}
      <div className="text-xs text-gray-500 flex flex-row justify-center items-center gap-2">
      <span className="text-teal-400">{icon}</span> {label} {trend && <span className={`text-base ${trendColor}`}>{arrow}</span>}</div>

      {value === '-' ? (
        <div className="m-6 font-bold flex items-center gap-2 bg-gradient-to-br from-[rgb(0,128,255)] to-[#04e89c] text-transparent bg-clip-text">
          <motion.div
              className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            />
        </div>
      ) : ( 
        <div className="text-3xl font-semibold flex items-center gap-1 bg-gradient-to-br from-[rgb(0,128,255)] to-[#04e89c] text-transparent bg-clip-text">
          {value}
        </div>
      )}

{/* 
      <div className="text-3xl font-semibold flex items-center gap-1 bg-gradient-to-br from-[rgb(0,128,255)] to-[#04e89c] text-transparent bg-clip-text">
        {value}
        
      </div> */}
    </div>
  );
}
