"use client";

import { useAppContext } from "@/context/AppContext";
import VendorsView from "@/components/VendorsView";

export default function VendorsPage() {
  const { vendors, setVendors } = useAppContext();

  return (
    <VendorsView 
      vendors={vendors} 
      setVendors={setVendors}
      onOpenVendorQuotes={(vId) => {}}
      addVendorModalOpen={false}
      setAddVendorModalOpen={() => {}}
    />
  );
}
