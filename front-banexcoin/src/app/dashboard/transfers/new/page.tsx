'use client';

import TransferForm from '../../../components/dashboard/TransferForm';

export default function NewTransferPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Nueva Transferencia</h1>
      <TransferForm />
    </div>
  );
} 