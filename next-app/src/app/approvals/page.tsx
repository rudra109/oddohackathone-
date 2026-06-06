"use client";

import { useAppContext } from "@/context/AppContext";
import PendingApprovalsView from "@/components/PendingApprovalsView";

export default function ApprovalsPage() {
  const { approvals, setApprovals, handleApproveSuccessLog } = useAppContext();

  return (
    <PendingApprovalsView 
      approvals={approvals}
      setApprovals={setApprovals}
      onApproveSuccess={handleApproveSuccessLog}
    />
  );
}
