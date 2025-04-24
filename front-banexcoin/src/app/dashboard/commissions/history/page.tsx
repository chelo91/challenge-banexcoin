'use client';

import CommissionHistoryTable from "@/app/components/dashboard/CommissionHistoryTable";

export default function CommissionHistoryPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Historial de Comisiones</h1>
      <CommissionHistoryTable />
    </div>
  );
} 