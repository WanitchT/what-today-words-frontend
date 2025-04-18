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

import { Baby, BookA, CalendarDays, ChartLine, MessageCircle, CaseLower, CaseUpper, Tag, TrendingUp, TrendingDown} from "lucide-react";

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
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  type CategoryStat = { category: string; count: number };
  const [topCategories, setTopCategories] = useState<CategoryStat[]>([]);

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);


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

    let url = `${API_BASE}/api/stats?babyId=${babyId}&userId=${userId}`;
    if (startDate) url += `&start=${startDate}`;
    if (endDate) url += `&end=${endDate}`;
    if (selectedCategory) url += `&category=${selectedCategory}`;

    fetch(url)
      .then((res) => res.json())
      .then((stats: WordStat[]) => {
        const sorted = stats.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        setData(sorted);
      });

    // Fetch aggregate stats (custom endpoint or logic)
    fetch(`${API_BASE}/api/stats/summary?babyId=${babyId}&userId=${userId}`)
      .then((res) => res.json())
      .then((s) => {
        setStats(s);
        setTopCategories(s.topCategories);
      });
  }, [babyId, userId, startDate, endDate, selectedCategory]);

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
          label="New words Today"
          value={stats.today.toString()}
          trend={
            stats.today > stats.yesterday ? "up" :
            stats.today < stats.yesterday ? "down" :
            null
          }
        />

        <StatCard
          icon={<CalendarDays />}
          label="This Week"
          value={stats.thisWeek.toString()}
          trend={
            stats.thisWeek > stats.lastWeek ? "up" :
            stats.thisWeek < stats.lastWeek ? "down" :
            null
          }
        />
        <StatCard 
          icon={<CaseUpper />}
          label="All-Time" 
          value={stats.total.toString()} 
        />
        <StatCard 
          icon={<Tag />}
          label="Top Category" 
          value={stats.topCategory} 
        />
      </div>

      <div className="flex gap-4 mb-6 items-end">
        <div>
          <label className="block text-sm text-gray-600 mb-1">จากวันที่</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border px-3 py-2 text-gray-600 rounded-xl"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">ถึงวันที่</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border px-3 py-2 text-gray-600 rounded-xl"
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

      {data.length === 0 ? (
        <p className="text-gray-500">ยังไม่มีข้อมูล dashboard</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bar Chart Section */}
          <div className="bg-white p-4 rounded-xl shadow">
            <h2 className="text-lg font-semibold text-emerald-600 mb-2">📅 Words Per Day</h2>
            
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
                  radius={[4, 4, 0, 0]}
                  isAnimationActive={true}
                  animationDuration={500}
                  activeBar={{ fill: "#10B981", stroke: "#047857", strokeWidth: 2 }}
                />
              </BarChart>
            </ResponsiveContainer>
              </motion.div>
          </div>

          {/* Pie Chart Section */}
          <div className="bg-white p-4 rounded-xl shadow">
            <h2 className="text-lg font-semibold text-emerald-600 mb-2">🏷️ Top 3 Categories</h2>
            <motion.div
  whileHover={{ scale: 1.02 }}
  transition={{ type: 'spring', stiffness: 300 }}
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
    <div className="bg-white p-4 rounded-2xl shadow-md flex flex-col items-start">
      {/* <div className="text-xl mb-1"></div> */}
      <div className="text-xs text-gray-500 flex flex-row justify-center items-center gap-2">{icon} {label} {trend && <span className={`text-base ${trendColor}`}>{arrow}</span>}</div>
      <div className="text-4xl font-semibold text-emerald-600 flex items-center gap-1">
        {value}
        
      </div>
    </div>
  );
}
