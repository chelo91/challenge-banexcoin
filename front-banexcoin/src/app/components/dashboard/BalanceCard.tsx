'use client';

import { useEffect, useState } from 'react';
import { getToken } from '../../utils/auth';
import { getApiUrl } from '@/config';

interface BalanceData {
    totalBalance: string;
    pendingBalance: string;
}

export default function BalanceCard() {
    const [balance, setBalance] = useState<BalanceData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchBalance = async () => {
            try {
                const token = getToken();
                if (!token) {
                    throw new Error('No se encontró el token de autenticación');
                }

                const response = await fetch(getApiUrl('balance'), {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error('Error al obtener el balance');
                }

                const data = await response.json();
                setBalance(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Error al obtener el balance');
            } finally {
                setLoading(false);
            }
        };

        fetchBalance();
    }, []);

    if (loading) {
        return (
            <div className="rounded-lg bg-white p-6 shadow">
                <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-lg bg-white p-6 shadow">
                <div className="text-red-600">
                    Error: {error}
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-lg bg-white p-6 shadow">
                <h3 className="text-lg font-medium text-gray-900">Balance Total</h3>
                <p className="mt-2 text-3xl font-bold text-indigo-600">
                    ${balance?.totalBalance || '0.00'}
                </p>
                <p className="mt-1 text-sm text-gray-500">Disponible</p>
            </div>
            <div className="rounded-lg bg-white p-6 shadow">
                <h3 className="text-lg font-medium text-gray-900">Balance Pendiente</h3>
                <p className="mt-2 text-3xl font-bold text-indigo-600">
                    ${balance?.pendingBalance || '0.00'}
                </p>
                <p className="mt-1 text-sm text-gray-500">En proceso</p>
            </div>
        </div>
    );
} 