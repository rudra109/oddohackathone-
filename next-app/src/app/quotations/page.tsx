"use client";

import { useAppContext } from "@/context/AppContext";
import QuotationComparisonView from "@/components/QuotationComparisonView";
import { useRouter } from "next/navigation";

export default function QuotationsPage() {
  const { rfqs, quotations, handleAwardRFQ } = useAppContext();
  const router = useRouter();

  const activeRfq = rfqs.find(r => r.id === 'RFQ-2024-089') || rfqs[0];
  const activeQuotes = quotations.filter(q => q.rfqId === activeRfq.id);

  return (
    <QuotationComparisonView 
      rfq={activeRfq}
      quotations={activeQuotes}
      onAwardRFQ={handleAwardRFQ}
      onBack={() => router.push('/rfqs')}
    />
  );
}
