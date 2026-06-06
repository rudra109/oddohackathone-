"use client";

import { useAppContext } from "@/context/AppContext";
import MyRFQsView from "@/components/MyRFQsView";
import { useRouter } from "next/navigation";

export default function RFQsPage() {
  const { rfqs, vendors, handleSubmitMockQuote } = useAppContext();
  const router = useRouter();

  return (
    <MyRFQsView 
      rfqs={rfqs} 
      vendors={vendors}
      onOpenComparison={(rfq) => router.push('/quotations')}
      onSubmitMockQuote={handleSubmitMockQuote}
    />
  );
}
