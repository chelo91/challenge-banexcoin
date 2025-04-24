'use client';

import { useEffect, useState } from 'react';
import { getToken } from '@/app/utils/auth';
import { getApiUrl } from '@/config';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  accounts: {
    id: string;
  }[];
}

export default function TransferForm() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = getToken();
        if (!token) {
          throw new Error('No se encontró el token de autenticación');
        }

        const response = await fetch(getApiUrl('users'), {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }

        const data = await response.json();
        setUsers(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error fetching users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const token = getToken();
      if (!token) {
        throw new Error('No se encontró el token de autenticación');
      }

      if (!selectedUser || !amount) {
        throw new Error('Por favor seleccione un destinatario e ingrese un monto');
      }

      const selectedUserData = users.find(user => user.id === selectedUser);
      if (!selectedUserData || !selectedUserData.accounts.length) {
        throw new Error('El usuario seleccionado no tiene cuentas');
      }

      const accountDestinationId = selectedUserData.accounts[0].id;
      const numericAmount = parseFloat(amount);

      if (isNaN(numericAmount) || numericAmount <= 0) {
        throw new Error('Por favor ingrese un monto válido');
      }

      const response = await fetch(getApiUrl('transactions'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accountDestinationId,
          amount: numericAmount,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to process transfer');
      }

      setSuccess('Transferencia completada exitosamente');
      setAmount('');
      setSelectedUser('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar la transferencia');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-lg bg-white p-6 shadow">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-10 bg-gray-200 rounded w-full mb-4"></div>
          <div className="h-10 bg-gray-200 rounded w-full mb-4"></div>
          <div className="h-10 bg-gray-200 rounded w-1/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Nueva Transferencia</h2>
      
      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-4 bg-green-50 text-green-700 rounded-md">
          {success}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="recipient" className="block text-sm font-medium text-gray-700 mb-1">
            Destinatario
          </label>
          <select
            id="recipient"
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
            required
          >
            <option value="" className="text-gray-900">Seleccionar destinatario</option>
            {users.map((user) => (
              <option key={user.id} value={user.id} className="text-gray-900">
                {user.firstName} {user.lastName} ({user.email})
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
            Monto
          </label>
          <div className="relative rounded-md shadow-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <span className="text-gray-700 sm:text-sm">$</span>
            </div>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="block w-full rounded-md border border-gray-300 pl-7 pr-12 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
              placeholder="0.00"
              min="0.01"
              step="0.01"
              required
            />
          </div>
        </div>
        
        <div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-md bg-indigo-600 px-4 py-2 text-white font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {submitting ? 'Procesando...' : 'Enviar Transferencia'}
          </button>
        </div>
      </form>
    </div>
  );
} 