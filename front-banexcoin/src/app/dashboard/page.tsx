'use client';

import BalanceCard from '../components/dashboard/BalanceCard';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
      {/* Balance Cards */}
      <BalanceCard />
    </div>
  );
} 