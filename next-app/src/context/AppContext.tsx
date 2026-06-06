"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { RFQ, RFQStatus, Vendor, Quotation, Approval, AppActivity, ScreenType } from '../types';
import { INITIAL_VENDORS, INITIAL_RFQS, INITIAL_QUOTATIONS, INITIAL_APPROVALS, INITIAL_ACTIVITIES } from '../data';
import { useRouter } from 'next/navigation';

interface AppContextType {
  user: { name: string; role: string; avatar: string } | null;
  setUser: (user: any) => void;
  vendors: Vendor[];
  setVendors: React.Dispatch<React.SetStateAction<Vendor[]>>;
  rfqs: RFQ[];
  setRfqs: React.Dispatch<React.SetStateAction<RFQ[]>>;
  quotations: Quotation[];
  setQuotations: React.Dispatch<React.SetStateAction<Quotation[]>>;
  approvals: Approval[];
  setApprovals: React.Dispatch<React.SetStateAction<Approval[]>>;
  activities: AppActivity[];
  setActivities: React.Dispatch<React.SetStateAction<AppActivity[]>>;
  searchVal: string;
  setSearchVal: (val: string) => void;
  handleLaunchRFQ: (newRfq: RFQ) => void;
  handleSubmitMockQuote: (rfqId: string, unitPrice: number, deliveryDays: number, warranty: string) => void;
  handleAwardRFQ: (rfqId: string, quotationId: string) => void;
  handleApproveSuccessLog: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ name: string; role: string; avatar: string } | null>(null);
  const [searchVal, setSearchVal] = useState('');
  const [vendors, setVendors] = useState<Vendor[]>(INITIAL_VENDORS);
  const [rfqs, setRfqs] = useState<RFQ[]>(INITIAL_RFQS);
  const [quotations, setQuotations] = useState<Quotation[]>(INITIAL_QUOTATIONS);
  const [approvals, setApprovals] = useState<Approval[]>(INITIAL_APPROVALS);
  const [activities, setActivities] = useState<AppActivity[]>(INITIAL_ACTIVITIES);
  
  const router = useRouter();

  useEffect(() => {
    const savedUser = localStorage.getItem('erp_user');
    if (savedUser) {
      try { setUser(JSON.parse(savedUser)); } catch (e) {}
    }
  }, []);

  const handleLaunchRFQ = (newRfq: RFQ) => {
    setRfqs((prev) => [newRfq, ...prev]);
    const newActivity: AppActivity = {
      id: 'ACT-' + Math.floor(Math.random() * 9000),
      type: 'RFQ',
      title: 'RFQ Published',
      time: 'JUST NOW',
      description: `RFQ #${newRfq.id} for "${newRfq.title}" successfully dispatched to ${newRfq.selectedVendors.length} partners.`
    };
    setActivities((prev) => [newActivity, ...prev]);
    router.push('/rfqs');
  };

  const handleSubmitMockQuote = (rfqId: string, unitPrice: number, deliveryDays: number, warranty: string) => {
    setRfqs((prev) => prev.map(r => r.id === rfqId ? { ...r, status: RFQStatus.Submitted, totalQuote: unitPrice * 100 } : r));
    const newQuote1: Quotation = {
      id: 'Q-MOCK-1', rfqId, vendorId: 'V1', vendorName: 'Starlight Systems', unitPrice, totalQuote: unitPrice * 100, deliveryDays, paymentTerms: 'Net 30', shippingMethod: 'Sea Freight', rating: 4.4, isBestPrice: true, warrantyPeriod: warranty, isoCertified: true, customsClearance: false
    };
    setQuotations((prev) => [newQuote1, ...prev]);
  };

  const handleAwardRFQ = (rfqId: string, quotationId: string) => {
    const matchedQuote = quotations.find(q => q.id === quotationId);
    if (!matchedQuote) return;
    setRfqs((prev) => prev.map(r => r.id === rfqId ? { ...r, status: RFQStatus.Awarded, totalQuote: matchedQuote.totalQuote } : r));
    router.push('/approvals');
  };

  const handleApproveSuccessLog = () => {
    const activity: AppActivity = {
      id: 'ACT-OK-' + Math.floor(Math.random() * 9000), type: 'PO', title: 'Approval Released', time: 'JUST NOW', description: 'Manager approved pending asset requisition.'
    };
    setActivities((prev) => [activity, ...prev]);
  };

  return (
    <AppContext.Provider value={{
      user, setUser, vendors, setVendors, rfqs, setRfqs, quotations, setQuotations,
      approvals, setApprovals, activities, setActivities, searchVal, setSearchVal,
      handleLaunchRFQ, handleSubmitMockQuote, handleAwardRFQ, handleApproveSuccessLog
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) throw new Error('useAppContext must be used within an AppProvider');
  return context;
}
