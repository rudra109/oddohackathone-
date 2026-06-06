"use client";

import React, { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import Sidebar from './Sidebar';
import Header from './Header';
import { usePathname, useRouter } from 'next/navigation';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { user, setUser, searchVal, setSearchVal } = useAppContext();
  const pathname = usePathname();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const screen = pathname === '/' ? 'dashboard' : pathname.replace('/', '');
  const isAuthPage = pathname === '/login' || pathname === '/signup';

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && !user && !isAuthPage) {
      router.push('/login');
    }
  }, [user, isAuthPage, router, isMounted]);

  // Close sidebar on route change
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  if (!isMounted) return null;

  if (isAuthPage) {
    return <div className="h-screen w-screen">{children}</div>;
  }

  if (!user) return null;

  return (
    <div className="flex bg-[#11131b] text-[#e1e2ed] select-none h-screen w-screen overflow-hidden font-sans">
      <Sidebar 
        currentScreen={screen as any} 
        setScreen={() => {}} 
        user={user}
        onLogout={() => {
          setUser(null);
          localStorage.removeItem('erp_user');
          router.push('/login');
        }}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />
      <div className="flex-grow flex flex-col min-w-0 h-full overflow-hidden">
        <Header 
          title={
            screen === 'dashboard' ? 'Executive Dashboard' :
            screen === 'vendors' ? 'Vendor Management' :
            screen === 'rfqs' ? 'RFQs Workspace' :
            screen === 'quotations' ? 'Quotation Comparison' :
            screen === 'approvals' ? 'Inbox Approvals' :
            screen.toUpperCase()
          }
          searchPlaceholder={`Search within ${screen.replace('-', ' ')}...`}
          searchVal={searchVal}
          onSearchChange={setSearchVal}
          user={user}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />
        <div className="flex-1 overflow-hidden bg-[#11131b]">
          {children}
        </div>
      </div>
    </div>
  );
}
