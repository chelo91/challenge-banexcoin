'use client';

import ReferralsTable from "@/app/components/dashboard/ReferralsTable";

export default function ReferralsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Referidos</h1>
      <ReferralsTable />
    </div>
  );
} 