"use client";

import React from 'react';
import { BarChart3, TrendingUp, PieChart, Download } from 'lucide-react';
import { toast } from 'sonner';

export default function ReportsView() {
  const handleExport = () => {
    toast.success("Exporting report data to CSV...");
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 max-w-7xl mx-auto w-full selection:bg-zinc-805 selection:text-white pb-16">
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">Analytics & Reports</h2>
          <p className="text-xs text-zinc-400 mt-1.5 max-w-2xl font-medium leading-relaxed">
            Gain insights into your procurement spend, vendor performance, and RFQ efficiency.
          </p>
        </div>
        <button onClick={handleExport} className="px-4 py-2 bg-white text-black hover:bg-zinc-200 font-semibold text-xs rounded-lg transition-colors flex items-center gap-2 cursor-pointer">
          <Download className="w-4 h-4" /> Export Data
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="glass rounded-xl p-5 border border-zinc-800/50">
          <p className="text-[10px] uppercase font-mono font-bold text-zinc-400">Total Spend (YTD)</p>
          <p className="text-2xl font-bold text-white mt-2">$2.4M</p>
          <p className="text-[10px] text-emerald-400 mt-2 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> +12% from last year</p>
        </div>
        <div className="glass rounded-xl p-5 border border-zinc-800/50">
          <p className="text-[10px] uppercase font-mono font-bold text-zinc-400">Active Vendors</p>
          <p className="text-2xl font-bold text-white mt-2">124</p>
          <p className="text-[10px] text-zinc-500 mt-2">Across 12 categories</p>
        </div>
        <div className="glass rounded-xl p-5 border border-zinc-800/50">
          <p className="text-[10px] uppercase font-mono font-bold text-zinc-400">Avg RFQ Cycle Time</p>
          <p className="text-2xl font-bold text-white mt-2">4.2 Days</p>
          <p className="text-[10px] text-emerald-400 mt-2">-1.5 days improvement</p>
        </div>
        <div className="glass rounded-xl p-5 border border-zinc-800/50">
          <p className="text-[10px] uppercase font-mono font-bold text-zinc-400">Cost Savings</p>
          <p className="text-2xl font-bold text-emerald-400 mt-2">$180K</p>
          <p className="text-[10px] text-zinc-500 mt-2">Via AI vendor matching</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass rounded-xl p-6 border border-zinc-800/50 h-80 flex flex-col justify-center items-center">
          <BarChart3 className="w-16 h-16 text-zinc-700 mb-4" />
          <p className="text-sm font-semibold text-zinc-400">Spend by Category Chart</p>
          <p className="text-xs text-zinc-600 mt-1">Data visualization rendered here</p>
        </div>
        <div className="glass rounded-xl p-6 border border-zinc-800/50 h-80 flex flex-col justify-center items-center">
          <PieChart className="w-16 h-16 text-zinc-700 mb-4" />
          <p className="text-sm font-semibold text-zinc-400">Vendor Compliance Ratio</p>
          <p className="text-xs text-zinc-600 mt-1">Data visualization rendered here</p>
        </div>
      </div>
    </div>
  );
}
