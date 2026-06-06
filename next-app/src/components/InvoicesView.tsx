"use client";

import React from 'react';
import { Receipt, DollarSign, Search, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

export default function InvoicesView() {
  const handlePay = () => {
    toast.info("Initializing payment gateway...");
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 max-w-7xl mx-auto w-full selection:bg-zinc-805 selection:text-white pb-16">
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">Invoices</h2>
          <p className="text-xs text-zinc-400 mt-1.5 max-w-2xl font-medium leading-relaxed">
            Review and process vendor invoices. Integrate with accounting to mark them as paid.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="glass rounded-xl p-5 border border-zinc-800/50 flex flex-col justify-between">
          <p className="text-[10px] uppercase font-mono font-bold text-zinc-400">Total Unpaid</p>
          <p className="text-2xl font-bold text-white mt-2">$120,400</p>
        </div>
        <div className="glass rounded-xl p-5 border border-zinc-800/50 flex flex-col justify-between">
          <p className="text-[10px] uppercase font-mono font-bold text-zinc-400">Due This Week</p>
          <p className="text-2xl font-bold text-amber-400 mt-2">$45,000</p>
        </div>
        <div className="glass rounded-xl p-5 border border-zinc-800/50 flex flex-col justify-between">
          <p className="text-[10px] uppercase font-mono font-bold text-zinc-400">Paid (Last 30 Days)</p>
          <p className="text-2xl font-bold text-emerald-400 mt-2">$350,000</p>
        </div>
      </div>

      <div className="glass rounded-xl p-5 border border-zinc-800/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-zinc-800/50">
                <th className="font-mono text-[10px] uppercase font-bold text-zinc-400 py-3 px-3">Invoice #</th>
                <th className="font-mono text-[10px] uppercase font-bold text-zinc-400 py-3 px-3">Vendor</th>
                <th className="font-mono text-[10px] uppercase font-bold text-zinc-400 py-3 px-3">Amount</th>
                <th className="font-mono text-[10px] uppercase font-bold text-zinc-400 py-3 px-3">Status</th>
                <th className="font-mono text-[10px] uppercase font-bold text-zinc-400 py-3 px-3">Due Date</th>
                <th className="font-mono text-[10px] uppercase font-bold text-zinc-400 py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/20">
              {[1, 2].map((i) => (
                <tr key={i} className="group hover:bg-zinc-900/40 transition-colors">
                  <td className="py-4 px-3 text-xs font-semibold text-white">INV-100{i}</td>
                  <td className="py-4 px-3 text-xs text-zinc-300">Starlight Systems</td>
                  <td className="py-4 px-3 text-xs font-mono text-white">$45,000.00</td>
                  <td className="py-4 px-3">
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded text-[10px] font-bold uppercase tracking-wider font-mono">
                       Pending
                    </span>
                  </td>
                  <td className="py-4 px-3 text-xs text-zinc-400">Dec {i}, 2024</td>
                  <td className="py-4 px-3 text-right">
                    <button onClick={handlePay} className="px-3 py-1.5 bg-white text-black hover:bg-zinc-200 font-semibold text-xs rounded-lg transition-colors cursor-pointer">
                      Pay Now
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
