"use client";

import React from 'react';
import { BarChart3, TrendingUp, PieChart, Download } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const spendData = [
  { name: 'Jan', spend: 4000 },
  { name: 'Feb', spend: 3000 },
  { name: 'Mar', spend: 5000 },
  { name: 'Apr', spend: 2780 },
  { name: 'May', spend: 1890 },
  { name: 'Jun', spend: 2390 },
];

const categoryData = [
  { name: 'Hardware', value: 400 },
  { name: 'Software', value: 300 },
  { name: 'Services', value: 300 },
  { name: 'Office', value: 200 },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants: any = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
};

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function ReportsView() {
  const handleExport = () => {
    toast.success("Generating Analytics PDF Report...");
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.text("VendorBridge - Analytics Report", 14, 22);
    
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 32);
    
    // Spend Summary
    doc.setFontSize(16);
    doc.text("Monthly Spend Summary", 14, 45);
    
    autoTable(doc, {
      startY: 50,
      head: [['Month', 'Spend Amount']],
      body: spendData.map(d => [d.name, `$${d.spend.toLocaleString()}`]),
      theme: 'grid',
      headStyles: { fillColor: [15, 15, 15] },
    });
    
    // Category Breakdown
    const finalY = (doc as any).lastAutoTable.finalY || 50;
    doc.setFontSize(16);
    doc.text("Spend by Category", 14, finalY + 15);
    
    autoTable(doc, {
      startY: finalY + 20,
      head: [['Category', 'Amount allocated']],
      body: categoryData.map(c => [c.name, `$${(c.value * 10).toLocaleString()}`]),
      theme: 'grid',
      headStyles: { fillColor: [15, 15, 15] },
    });
    
    doc.save(`Analytics_Report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex-1 overflow-y-auto p-6 max-w-7xl mx-auto w-full selection:bg-zinc-805 selection:text-white pb-16"
    >
      <motion.div variants={itemVariants} className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">Analytics & Reports</h2>
          <p className="text-xs text-zinc-400 mt-1.5 max-w-2xl font-medium leading-relaxed">
            Gain insights into your procurement spend, vendor performance, and RFQ efficiency.
          </p>
        </div>
        <button onClick={handleExport} className="px-4 py-2 bg-white text-black hover:bg-zinc-200 font-semibold text-xs rounded-lg transition-transform hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer">
          <Download className="w-4 h-4" /> Export Data
        </button>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="glass rounded-xl p-5 border border-zinc-800/50 hover:border-zinc-700 hover:bg-zinc-900/50 transition-colors cursor-default">
          <p className="text-[10px] uppercase font-mono font-bold text-zinc-400">Total Spend (YTD)</p>
          <p className="text-2xl font-bold text-white mt-2">$2.4M</p>
          <p className="text-[10px] text-emerald-400 mt-2 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> +12% from last year</p>
        </div>
        <div className="glass rounded-xl p-5 border border-zinc-800/50 hover:border-zinc-700 hover:bg-zinc-900/50 transition-colors cursor-default">
          <p className="text-[10px] uppercase font-mono font-bold text-zinc-400">Active Vendors</p>
          <p className="text-2xl font-bold text-white mt-2">124</p>
          <p className="text-[10px] text-zinc-500 mt-2">Across 12 categories</p>
        </div>
        <div className="glass rounded-xl p-5 border border-zinc-800/50 hover:border-zinc-700 hover:bg-zinc-900/50 transition-colors cursor-default">
          <p className="text-[10px] uppercase font-mono font-bold text-zinc-400">Avg RFQ Cycle Time</p>
          <p className="text-2xl font-bold text-white mt-2">4.2 Days</p>
          <p className="text-[10px] text-emerald-400 mt-2">-1.5 days improvement</p>
        </div>
        <div className="glass rounded-xl p-5 border border-zinc-800/50 hover:border-zinc-700 hover:bg-zinc-900/50 transition-colors cursor-default">
          <p className="text-[10px] uppercase font-mono font-bold text-zinc-400">Cost Savings</p>
          <p className="text-2xl font-bold text-emerald-400 mt-2">$180K</p>
          <p className="text-[10px] text-zinc-500 mt-2">Via AI vendor matching</p>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass rounded-xl p-6 border border-zinc-800/50 h-80 flex flex-col">
          <p className="text-sm font-semibold text-white mb-6">Monthly Spend Trend</p>
          <div className="flex-1 w-full min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%" minHeight={200}>
              <AreaChart data={spendData}>
                <defs>
                  <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="name" stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val/1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px', fontSize: '12px', color: '#fff' }}
                  itemStyle={{ color: '#10b981' }}
                />
                <Area type="monotone" dataKey="spend" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorSpend)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="glass rounded-xl p-6 border border-zinc-800/50 h-80 flex flex-col">
          <p className="text-sm font-semibold text-white mb-6">Spend by Category</p>
          <div className="flex-1 w-full min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%" minHeight={200}>
              <BarChart data={categoryData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false} />
                <XAxis type="number" stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} width={60} />
                <Tooltip 
                  cursor={{ fill: '#27272a', opacity: 0.4 }}
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px', fontSize: '12px', color: '#fff' }}
                />
                <Bar dataKey="value" fill="#a1a1aa" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
