"use client";

import { useAppContext } from "@/context/AppContext";
import DashboardView from "@/components/DashboardView";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { activities } = useAppContext();
  const router = useRouter();

  return (
    <DashboardView 
      setScreen={(scr) => router.push(`/${scr === 'dashboard' ? '' : scr}`)} 
      activities={activities}
      onCreateRFQTrigger={() => router.push('/create-rfq')}
      onAddVendorTrigger={() => router.push('/vendors?add=true')}
    />
  );
}
