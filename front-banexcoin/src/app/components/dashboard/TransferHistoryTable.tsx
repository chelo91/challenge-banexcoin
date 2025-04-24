'use client';

import { useEffect, useState } from 'react';
import { getToken } from '@/app/utils/auth';
import { getApiUrl } from '@/config';

enum TransactionType {
    USER_TO_USER = 0,
    REFERRAL_COMMISSION = 1,
    PLATFORM_FEE = 2,
    MANUAL_ADJUSTMENT = 3
}

enum TransactionStatus {
    PENDING = 0,
    APPROVED = 1,
    CANCELLED = 2
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface Account {
  id: string;
  currency: string;
  status: number;
  user: User;
}

interface Transaction {
  id: string;
  amount: string;
  currency: string;
  transactionFee: string;
  type: TransactionType;
  status: TransactionStatus;
  createdAt: string;
  updatedAt: string;
  accountOrigin: Account | null;
  accountDestination: Account | null;
}

export default function TransferHistoryTable() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const token = getToken();
        if (!token) {
          throw new Error('No se encontró el token de autenticación');
        }

        const response = await fetch(getApiUrl('transactions'), {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Error al obtener las transacciones');
        }

        const data = await response.json();
        setTransactions(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al obtener las transacciones');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const getStatusColor = (status: TransactionStatus) => {
    switch (status) {
      case TransactionStatus.APPROVED:
        return 'text-green-800 bg-green-100';
      case TransactionStatus.PENDING:
        return 'text-yellow-800 bg-yellow-100';
      case TransactionStatus.CANCELLED:
        return 'text-red-800 bg-red-100';
      default:
        return 'text-gray-800 bg-gray-100';
    }
  };

  const getStatusText = (status: TransactionStatus) => {
    switch (status) {
      case TransactionStatus.APPROVED:
        return 'Aprobado';
      case TransactionStatus.PENDING:
        return 'Pendiente';
      case TransactionStatus.CANCELLED:
        return 'Cancelado';
      default:
        return 'Desconocido';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getTypeText = (type: TransactionType) => {
    switch (type) {
      case TransactionType.USER_TO_USER:
        return 'Transferencia';
      case TransactionType.REFERRAL_COMMISSION:
        return 'Referido';
      case TransactionType.PLATFORM_FEE:
        return 'Plataforma';
      case TransactionType.MANUAL_ADJUSTMENT:
        return 'Manual';
      default:
        return 'Desconocido';
    }
  };

  const getTypeCode = (type: TransactionType) => {
    switch (type) {
      case TransactionType.USER_TO_USER:
        return 'Transferencia entre usuarios';
      case TransactionType.REFERRAL_COMMISSION:
        return 'Comisión por referido';
      case TransactionType.PLATFORM_FEE:
        return 'Comisión de plataforma';
      case TransactionType.MANUAL_ADJUSTMENT:
        return 'Ajuste manual';
      default:
        return 'Desconocido';
    }
  };

  const getContactInfo = (transaction: Transaction) => {
    if (transaction.type === TransactionType.MANUAL_ADJUSTMENT) {
      return transaction.accountDestination?.user.email || 'N/A';
    }
    return transaction.accountDestination?.user.email || transaction.accountOrigin?.user.email || 'N/A';
  };

  if (loading) {
    return (
      <div className="rounded-lg bg-white p-6 shadow">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-white p-6 shadow">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Descripción
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Usuario
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Monto
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Comisión
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {transactions
              .filter(transaction => transaction.type !== TransactionType.PLATFORM_FEE)
              .map((transaction) => (
              <tr key={transaction.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(transaction.createdAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {getTypeText(transaction.type)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {getTypeCode(transaction.type)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {getContactInfo(transaction)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ${transaction.amount}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {transaction.transactionFee === "0.00" ? "-" : `$${transaction.transactionFee}`}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(transaction.status)}`}>
                    {getStatusText(transaction.status)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 