"use client";

import { useAppContext } from "@/context/AppContext";
import VendorsView from "@/components/VendorsView";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function VendorsPage() {
  const { vendors, setVendors } = useAppContext();
  const [addVendorModalOpen, setAddVendorModalOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("add") === "true") {
        setAddVendorModalOpen(true);
      }
    }
  }, []);

  return (
    <VendorsView 
      vendors={vendors} 
      setVendors={setVendors}
      onOpenVendorQuotes={(vId) => {
        router.push('/quotations');
      }}
      addVendorModalOpen={addVendorModalOpen}
      setAddVendorModalOpen={setAddVendorModalOpen}
    />
  );
}
