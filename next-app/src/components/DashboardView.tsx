"use client"
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Calendar, Download, Wallet, Clock, Megaphone, Truck, Star, Plus, UserPlus, Users, ArrowUpRight, ChevronRight, Activity, ArrowRight } from 'lucide-react';
import { ScreenType, AppActivity } from '../types';
import { PROFILE_IMAGES } from '../data';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface DashboardViewProps {
  setScreen: (screen: ScreenType) => void;
  activities: AppActivity[];
  onCreateRFQTrigger: () => void;
  onAddVendorTrigger: () => void;
}

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

export default function DashboardView({ setScreen, activities, onCreateRFQTrigger, onAddVendorTrigger }: DashboardViewProps) {
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

  const handleExportPDF = () => {
    toast.success('Generating Dashboard PDF Report...');
    const doc = new jsPDF();
    
    doc.setFontSize(22);
    doc.text("VendorBridge - Executive Dashboard Summary", 14, 22);
    
    doc.setFontSize(11);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 32);
    doc.text("Procurement insight metrics, active contracts, and recent operations queue.", 14, 40);
    
    // KPI Data Table
    autoTable(doc, {
      startY: 50,
      head: [['Metric', 'Value', 'Status']],
      body: [
        ['Total Spend', '$4.2M', '↑ +12% vs last month'],
        ['Pending Approvals', '14', 'High Priority / Requires action'],
        ['Active RFQs', '8', '67% participation'],
        ['Purchase Orders', '42', 'Active fulfillment'],
      ],
      theme: 'grid',
      headStyles: { fillColor: [15, 15, 15] },
    });
    
    // Recent Activities Table
    const finalY = (doc as any).lastAutoTable.finalY || 50;
    doc.setFontSize(16);
    doc.text("Recent Activity Log", 14, finalY + 15);
    
    const activityRows = activities.map(act => [
      act.time,
      act.type,
      act.title,
      act.description
    ]);
    
    autoTable(doc, {
      startY: finalY + 22,
      head: [['Time', 'Type', 'Activity', 'Details']],
      body: activityRows,
      theme: 'grid',
      headStyles: { fillColor: [15, 15, 15] },
    });
    
    doc.save(`Dashboard_Report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const barData = [
    { month: 'JAN', value: '$420K', height: '40%' },
    { month: 'FEB', value: '$680K', height: '65%' },
    { month: 'MAR', value: '$520K', height: '55%' },
    { month: 'APR', value: '$890K', height: '85%' },
    { month: 'MAY', value: '$740K', height: '75%' },
    { month: 'JUN', value: '$950K', height: '95%' }
  ];

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-6 p-6 overflow-y-auto max-w-[1440px] mx-auto w-full selection:bg-zinc-805 selection:text-white pb-12"
    >
      {/* Header section with context buttons */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">Executive Dashboard</h2>
          <p className="text-xs text-zinc-400 mt-1 font-medium">Real-time procurement insights, vendor metrics, and operations queue</p>
        </div>
        <div className="flex gap-2">
          <button className="px-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 hover:bg-zinc-800 transition-all cursor-pointer flex items-center gap-2 text-xs font-semibold select-none">
            <Calendar className="w-3.5 h-3.5 text-zinc-400" />
            <span>Last 30 Days</span>
          </button>
          <button 
            onClick={handleExportPDF}
            className="px-3.5 py-2 bg-white hover:bg-zinc-200 rounded-lg text-black font-semibold transition-transform hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-2 text-xs select-none shadow"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export PDF</span>
          </button>
        </div>
      </motion.div>

      {/* Primary KPI Metrics Row */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 Spend */}
        <div className="glass p-5 rounded-xl flex flex-col relative overflow-hidden group hover:bg-zinc-900/50 hover:border-zinc-700 transition-all cursor-default">
          <div className="flex justify-between items-start mb-3">
            <div className="p-2 bg-white/5 rounded-lg border border-white/5 group-hover:scale-110 transition-transform">
              <Wallet className="w-4 h-4 text-zinc-300" />
            </div>
            <span className="text-emerald-400 text-xs font-semibold flex items-center gap-1">
              <span className="text-[10px] font-sans">↑</span> +12%
            </span>
          </div>
          <p className="text-xs text-zinc-400 font-medium uppercase tracking-wider font-mono opacity-80 group-hover:text-zinc-300 transition-colors">Total Spend</p>
          <h3 className="text-2xl font-bold text-white mt-1 leading-none tracking-tight">$4.2M</h3>
        </div>

        {/* KPI 2 Pending items */}
        <div className="glass p-5 rounded-xl flex flex-col relative overflow-hidden group hover:bg-zinc-900/50 hover:border-zinc-700 transition-all cursor-default">
          <div className="flex justify-between items-start mb-3">
            <div className="p-2 bg-white/5 rounded-lg border border-white/5 group-hover:scale-110 transition-transform">
              <Clock className="w-4 h-4 text-zinc-300" />
            </div>
            <span className="text-zinc-400 text-[10px] font-semibold bg-zinc-800 px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">High Priority</span>
          </div>
          <p className="text-xs text-zinc-400 font-medium uppercase tracking-wider font-mono opacity-80 group-hover:text-zinc-300 transition-colors">Pending Approvals</p>
          <h3 className="text-2xl font-bold text-white mt-1 leading-none tracking-tight">14</h3>
        </div>

        {/* KPI 3 RFQs active */}
        <div className="glass p-5 rounded-xl flex flex-col relative overflow-hidden group hover:bg-zinc-900/50 hover:border-zinc-700 transition-all cursor-default">
          <div className="flex justify-between items-start mb-3">
            <div className="p-2 bg-white/5 rounded-lg border border-white/5 group-hover:scale-110 transition-transform">
              <Megaphone className="w-4 h-4 text-zinc-300" />
            </div>
            <span className="text-emerald-400 text-[10px] bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-semibold font-mono uppercase tracking-wider">Active</span>
          </div>
          <p className="text-xs text-zinc-400 font-medium uppercase tracking-wider font-mono opacity-80 group-hover:text-zinc-300 transition-colors">Active RFQs</p>
          <h3 className="text-2xl font-bold text-white mt-1 leading-none tracking-tight">8</h3>
        </div>

        {/* KPI 4 POs */}
        <div className="glass p-5 rounded-xl flex flex-col relative overflow-hidden group hover:bg-zinc-900/50 hover:border-zinc-700 transition-all cursor-default">
          <div className="flex justify-between items-start mb-3">
            <div className="p-2 bg-white/5 rounded-lg border border-white/5 group-hover:scale-110 transition-transform">
              <Truck className="w-4 h-4 text-zinc-300" />
            </div>
            <span className="text-zinc-400 text-[10px] font-semibold bg-zinc-800 px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">This Month</span>
          </div>
          <p className="text-xs text-zinc-400 font-medium uppercase tracking-wider font-mono opacity-80 group-hover:text-zinc-300 transition-colors">Purchase Orders</p>
          <h3 className="text-2xl font-bold text-white mt-1 leading-none tracking-tight">42</h3>
        </div>
      </motion.div>

      {/* Main Secondary Dashboard Grid (Bento columns) */}
      <motion.div variants={itemVariants} className="grid grid-cols-12 gap-5 items-stretch">

        {/* Monthly Spend Bar Chart */}
        <div className="col-span-12 lg:col-span-8 glass rounded-xl p-5 flex flex-col gap-4 min-h-[380px] relative hover:border-zinc-700 transition-colors">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-semibold text-white tracking-tight">Monthly Spend Analysis</h4>
            <div className="flex gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-[10px] font-semibold text-zinc-400">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-100"></span>
                <span>Operations</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-[10px] font-semibold text-zinc-400">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-500"></span>
                <span>Logistics</span>
              </span>
            </div>
          </div>

          {/* Bar chart canvas */}
          <div className="flex-1 flex items-end justify-between gap-3 sm:gap-6 pt-10 px-2 select-text pb-2">
            {barData.map((data, index) => (
              <div
                key={data.month}
                className="w-full h-full flex flex-col items-center justify-end relative group cursor-pointer"
                onMouseEnter={() => setHoveredBar(index)}
                onMouseLeave={() => setHoveredBar(null)}
              >
                {/* Simulated Tooltip */}
                <div
                  className={`absolute -top-12 left-1/2 -translate-x-1/2 bg-zinc-900 px-2 py-1.5 rounded text-[10px] font-bold text-white font-mono border border-zinc-800 transition-opacity duration-150 shadow-lg z-20 ${hoveredBar === index ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                    }`}
                >
                  {data.value}
                </div>

                {/* Background Track bar */}
                <div className="w-full bg-zinc-950 rounded-t h-full absolute inset-0 opacity-10 pointer-events-none"></div>

                {/* Visual Bar Accent */}
                <div
                  style={{ height: data.height }}
                  className={`w-full bg-white/10 group-hover:bg-white rounded-t-lg transition-all duration-300 relative z-10 ${hoveredBar === index ? 'shadow-[0_0_12px_rgba(255,255,255,0.15)] bg-white -translate-y-1' : ''
                    }`}
                >
                  {/* Internal nested stack for the logistics split to match design detail */}
                  <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-zinc-650 group-hover:bg-zinc-500 rounded-t-sm transition-colors duration-200"></div>
                </div>

                {/* X-Axis label */}
                <span className="text-[10px] font-bold tracking-wider font-mono text-zinc-500 opacity-80 mt-3 relative z-10 group-hover:text-zinc-300 transition-colors">
                  {data.month}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Vendor Performance Circular Gauge */}
        <div className="col-span-12 lg:col-span-4 glass rounded-xl p-5 flex flex-col gap-4 hover:border-zinc-700 transition-colors">
          <h4 className="text-sm font-semibold text-white tracking-tight">Top Vendor KPI</h4>

          <div className="flex-1 flex flex-col justify-center items-center py-4 group">
            {/* SVG Ring Graphic */}
            <div className="w-40 h-40 rounded-full flex items-center justify-center relative group-hover:scale-105 transition-transform duration-500">
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                {/* Secondary Gray Track circle */}
                <circle className="text-zinc-800" cx="50%" cy="50%" fill="none" r="38%" stroke="currentColor" strokeWidth="8"></circle>
                {/* Highlight Green Circle overlay */}
                <motion.circle
                  initial={{ strokeDashoffset: 239 }}
                  animate={{ strokeDashoffset: 15 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="text-[#4edea3]"
                  cx="50%"
                  cy="50%"
                  fill="none"
                  r="38%"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeDasharray="239"
                ></motion.circle>
              </svg>
              <div className="text-center z-10">
                <span className="text-3xl font-black text-white font-mono leading-none">94%</span>
                <p className="text-[9px] text-zinc-400 font-semibold uppercase tracking-wider font-mono mt-1">On-time Delivery</p>
              </div>
            </div>

            {/* Vendor rating lists */}
            <div className="w-full space-y-3.5 mt-6 border-t border-zinc-800 pt-4">
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-450 font-medium">Quality Rating</span>
                <div className="flex gap-0.5 text-zinc-300">
                  {[...Array(4)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-white text-white" />
                  ))}
                  <Star className="w-3.5 h-3.5 text-zinc-700" />
                </div>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-450 font-medium">Avg. Response Time</span>
                <span className="text-white font-bold font-mono">2.4 Hours</span>
              </div>
            </div>
          </div>
        </div>

      </motion.div>

      {/* Row 3 - Timeline Log and Dynamic Bento Actions */}
      <motion.div variants={itemVariants} className="grid grid-cols-12 gap-5 items-stretch">

        {/* Recent Activity Timeline card */}
        <div className="col-span-12 lg:col-span-5 glass rounded-xl p-5 flex flex-col gap-4 hover:border-zinc-700 transition-colors">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-semibold text-white tracking-tight">Recent Activity</h4>
            <button
              onClick={() => setScreen('rfqs')}
              className="text-zinc-300 font-bold text-xs hover:text-white flex items-center gap-0.5 cursor-pointer hover:translate-x-1 transition-transform"
            >
              <span>View All</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {/* Activity items list */}
          <div className="flex-1 space-y-4 pt-1 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[1px] before:bg-zinc-800">
            {activities.slice(0, 4).map((activity, index) => (
              <motion.div 
                key={activity.id + index} 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="flex gap-4 relative group"
              >
                <div className="w-6 h-6 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white z-10 text-[9px] font-bold flex-shrink-0 group-hover:scale-110 group-hover:bg-zinc-800 transition-all">
                  {activity.type === 'RFQ' ? '➕' : activity.type === 'Quote' ? '✉️' : '✓'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <p className="text-xs font-semibold text-zinc-200 leading-none group-hover:text-white transition-colors">{activity.title}</p>
                    <span className="text-[9px] font-bold font-mono text-zinc-550 uppercase">{activity.time}</span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed truncate-2-lines select-text">
                    {activity.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Quick Actions & Spotlight */}
        <div className="col-span-12 lg:col-span-7 flex flex-col gap-5 justify-between">

          {/* Quick Actions grids */}
          <div className="glass rounded-xl p-5">
            <h4 className="text-sm font-semibold text-white tracking-tight mb-4">Quick Actions</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

              {/* Action 1 Create RFQ */}
              <button
                onClick={onCreateRFQTrigger}
                className="flex flex-col items-center justify-center text-center gap-3 p-4 bg-zinc-950/40 hover:bg-zinc-900/50 border border-zinc-800 rounded-xl hover:border-zinc-700/80 transition-all group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-white/5 border border-white/5 flex items-center justify-center group-hover:scale-105 transition-transform text-white">
                  <Plus className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-zinc-305 group-hover:text-white transition-colors">Create RFQ</span>
              </button>

              {/* Action 2 Add Vendor */}
              <button
                onClick={onAddVendorTrigger}
                className="flex flex-col items-center justify-center text-center gap-3 p-4 bg-zinc-950/40 hover:bg-zinc-900/50 border border-zinc-800 rounded-xl hover:border-zinc-700/80 transition-all group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-white/5 border border-white/5  flex items-center justify-center group-hover:scale-105 transition-transform text-white">
                  <UserPlus className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-zinc-305 group-hover:text-white transition-colors">Add Vendor</span>
              </button>

              {/* Action 3 Invite Manager */}
              <button
                onClick={() => {
                  if (typeof navigator !== 'undefined' && navigator.clipboard) {
                    navigator.clipboard.writeText("https://vendorbridge.com/invite/manager-signup-token-2026");
                    toast.success("Invite link copied to clipboard! Send to team managers.");
                  } else {
                    toast.info("Invite link: https://vendorbridge.com/invite/manager-signup-token-2026");
                  }
                }}
                className="flex flex-col items-center justify-center text-center gap-3 p-4 bg-zinc-950/40 hover:bg-zinc-900/50 border border-zinc-800 rounded-xl hover:border-zinc-700/80 transition-all group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-white/5 border border-white/5  flex items-center justify-center group-hover:scale-105 transition-transform text-white">
                  <Users className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-zinc-305 group-hover:text-white transition-colors">Invite Manager</span>
              </button>

            </div>
          </div>

          {/* Visual Highlight card */}
          <div className="glass overflow-hidden rounded-xl p-6 relative min-h-[150px] flex flex-col justify-center border border-zinc-805 hover:border-zinc-700 transition-colors group">
            {/* Visual Logistics Background graphic pattern */}
            <div className="absolute inset-0 overflow-hidden">
              <img
                src={PROFILE_IMAGES.bentoAbstract}
                className="absolute right-0 top-0 h-full w-1/2 object-cover opacity-15 mix-blend-overlay pointer-events-none select-none group-hover:scale-105 group-hover:opacity-25 transition-all duration-700"
                alt="compliance dashboard overlay"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-900/90 to-transparent"></div>
            </div>

            <div className="relative z-10 max-w-[65%]">
              <h4 className="text-sm font-bold text-white tracking-tight group-hover:translate-x-1 transition-transform">Annual Vendor Review</h4>
              <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed bg-none">
                Check the compliance and security status for 24 platinum-tier vendors before the corporate Q3 audit.
              </p>
              <button
                onClick={() => setScreen('vendors')}
                className="mt-4 px-4 py-1.5 bg-white text-black hover:bg-zinc-200 rounded-lg font-bold text-xs transition-transform hover:scale-105 active:scale-95 cursor-pointer select-none shadow"
              >
                Start Review
              </button>
            </div>
          </div>

        </div>

      </motion.div>

    </motion.div>
  );
}