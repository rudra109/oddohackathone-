"use client";
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Search, Bell, HelpCircle, Shield, Globe, Menu } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { toast } from 'sonner';

interface HeaderProps {
  title: string;
  searchPlaceholder?: string;
  searchVal: string;
  onSearchChange: (val: string) => void;
  user: {
    name: string;
    role: string;
    avatar: string;
  };
  onToggleSidebar: () => void;
}

export default function Header({ title, searchPlaceholder = "Search vendors, POs, or RFQs...", searchVal, onSearchChange, user, onToggleSidebar }: HeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { activities, setActivities } = useAppContext();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="bg-[#09090b] border-b border-zinc-800 px-4 md:px-6 py-3 flex justify-between items-center w-full sticky top-0 z-30">
      {/* Title & Search bar */}
      <div className="flex items-center gap-3 md:gap-6 flex-1 max-w-xl">
        <button onClick={onToggleSidebar} className="md:hidden p-1.5 hover:bg-zinc-850 rounded-lg text-zinc-400">
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-sm font-bold text-white hidden sm:block truncate shrink-0">{title}</h1>
        <div className="relative flex-1 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-zinc-100 transition-colors" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchVal}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-4 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:ring-1 focus:ring-zinc-650 focus:border-zinc-650 outline-none transition-all duration-150"
          />
        </div>
      </div>

      {/* Action tray */}
      <div className="flex items-center gap-4 ml-4">
        {/* System Status Tracker */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border border-zinc-750 bg-zinc-900 text-xs">
          <div className="status-dot bg-emerald-500 text-emerald-500"></div>
          <span className="text-[10px] text-zinc-300 font-semibold font-mono uppercase tracking-wider">System Operational</span>
        </div>

        {/* Global indicator text */}
        <div className="hidden lg:flex items-center gap-2 text-xs text-zinc-400">
          <Globe className="w-3.5 h-3.5 text-zinc-400" />
          <span className="font-mono text-[11px] opacity-70">Global Ops Center</span>
        </div>

        {/* Badge Notifications Button */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="p-1.5 hover:bg-zinc-850 rounded-full transition-colors group cursor-pointer"
          >
            <Bell className="w-4 h-4 text-zinc-400 group-hover:scale-105 transition-transform" />
            {activities.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-zinc-100 rounded-full border border-zinc-950 animate-pulse"></span>
            )}
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl z-50 p-4">
              <div className="flex justify-between items-center pb-2 border-b border-zinc-800 mb-3">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Notifications ({activities.length})</h3>
                {activities.length > 0 && (
                  <button 
                    onClick={() => {
                      setActivities([]);
                      toast.success("All notifications cleared!");
                    }}
                    className="text-[10px] text-zinc-400 hover:text-white font-semibold cursor-pointer"
                  >
                    Clear All
                  </button>
                )}
              </div>
              <div className="max-h-60 overflow-y-auto space-y-3">
                {activities.length === 0 ? (
                  <p className="text-xs text-zinc-500 italic py-4 text-center">No new notifications</p>
                ) : (
                  activities.slice(0, 5).map((activity) => (
                    <div key={activity.id} className="text-xs border-b border-zinc-900 pb-2 last:border-b-0">
                      <div className="flex justify-between items-start">
                        <span className="font-semibold text-zinc-200">{activity.title}</span>
                        <span className="text-[9px] font-mono text-zinc-500 uppercase font-semibold">{activity.time}</span>
                      </div>
                      <p className="text-zinc-400 text-[11px] mt-1 leading-normal select-text">{activity.description}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Help Center */}
        <button className="p-1.5 hover:bg-zinc-850 rounded-full transition-colors group cursor-pointer">
          <HelpCircle className="w-4 h-4 text-zinc-400" />
        </button>

        {/* Vertical Separator */}
        <div className="h-6 w-[1px] bg-zinc-800"></div>

        {/* Action state role summary */}
        <div className="flex items-center gap-2">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold text-zinc-100">{user.name}</p>
            <p className="text-[9px] text-zinc-500 uppercase font-mono">{user.role}</p>
          </div>
          <div className="w-8 h-8 rounded-full border border-zinc-800 overflow-hidden flex items-center justify-center bg-zinc-800">
            <img src={user.avatar} className="w-full h-full object-cover" alt="User Profile" />
          </div>
        </div>
      </div>
    </header>
  );
}
