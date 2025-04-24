'use client';

import TransferHistoryTable from "../../../components/dashboard/TransferHistoryTable";

export default function TransferHistoryPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Historial de Transferencias</h1>
      <TransferHistoryTable />
    </div>
  );
} 