"use client";

import React from 'react';
import { ShoppingCart, Download, Search, CheckCircle2, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function PurchaseOrdersView() {
  const handleDownload = (poNum: string, vendor: string, amount: string, date: string) => {
    toast.success(`Generating PDF for ${poNum}...`);
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.text("VendorBridge - Purchase Order", 14, 22);
    
    doc.setFontSize(12);
    doc.text(`PO Number: ${poNum}`, 14, 32);
    doc.text(`Vendor: ${vendor}`, 14, 40);
    doc.text(`Issue Date: ${date}`, 14, 48);
    doc.text(`Status: ISSUED`, 14, 56);
    
    // AutoTable
    autoTable(doc, {
      startY: 65,
      head: [['Item Description', 'Quantity', 'Unit Price', 'Total']],
      body: [
        ['Enterprise Software License', '1', amount, amount],
        ['Service & Maintenance', '1', '$0.00', '$0.00'],
      ],
      theme: 'grid',
      headStyles: { fillColor: [15, 15, 15] },
    });
    
    // Footer
    const finalY = (doc as any).lastAutoTable.finalY || 65;
    doc.setFontSize(14);
    doc.text(`Grand Total: ${amount}`, 14, finalY + 15);
    
    doc.save(`${poNum}.pdf`);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 max-w-7xl mx-auto w-full selection:bg-zinc-805 selection:text-white pb-16">
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">Purchase Orders</h2>
          <p className="text-xs text-zinc-400 mt-1.5 max-w-2xl font-medium leading-relaxed">
            Manage your active and completed purchase orders. Generate PDFs and track delivery statuses.
          </p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input 
            type="text" 
            placeholder="Search POs..."
            className="w-full md:w-64 bg-[#0d0d0f]/80 border border-zinc-800 px-8 py-2.5 text-xs text-white placeholder-zinc-700 rounded-lg outline-none focus:border-zinc-500"
          />
        </div>
      </div>

      <div className="glass rounded-xl p-5 border border-zinc-800/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-zinc-800/50">
                <th className="font-mono text-[10px] uppercase font-bold text-zinc-400 py-3 px-3">PO Number</th>
                <th className="font-mono text-[10px] uppercase font-bold text-zinc-400 py-3 px-3">Vendor</th>
                <th className="font-mono text-[10px] uppercase font-bold text-zinc-400 py-3 px-3">Total Amount</th>
                <th className="font-mono text-[10px] uppercase font-bold text-zinc-400 py-3 px-3">Status</th>
                <th className="font-mono text-[10px] uppercase font-bold text-zinc-400 py-3 px-3">Issue Date</th>
                <th className="font-mono text-[10px] uppercase font-bold text-zinc-400 py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/20">
              {[1, 2, 3].map((i) => (
                <tr key={i} className="group hover:bg-zinc-900/40 transition-colors">
                  <td className="py-4 px-3 text-xs font-semibold text-white">PO-2024-00{i}</td>
                  <td className="py-4 px-3 text-xs text-zinc-300">Starlight Systems</td>
                  <td className="py-4 px-3 text-xs font-mono text-white">$45,000.00</td>
                  <td className="py-4 px-3">
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded text-[10px] font-bold uppercase tracking-wider font-mono">
                      <CheckCircle2 className="w-3 h-3" /> Issued
                    </span>
                  </td>
                  <td className="py-4 px-3 text-xs text-zinc-400">Nov {10 + i}, 2024</td>
                  <td className="py-4 px-3 text-right">
                    <button onClick={() => handleDownload(`PO-2024-00${i}`, 'Starlight Systems', '$45,000.00', `Nov ${10 + i}, 2024`)} className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors cursor-pointer">
                      <Download className="w-4 h-4" />
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
