"use client";

import { useAppContext } from "@/context/AppContext";
import CreateRFQView from "@/components/CreateRFQView";
import { useRouter } from "next/navigation";

export default function CreateRfqPage() {
  const { handleLaunchRFQ, vendors } = useAppContext();
  const router = useRouter();

  return (
    <CreateRFQView 
      onLaunchRFQ={handleLaunchRFQ}
      onCancel={() => router.push('/rfqs')}
      vendors={vendors}
    />
  );
}
