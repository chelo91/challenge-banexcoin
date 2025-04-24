'use client';

import { useEffect, useState } from 'react';
import { getToken } from '@/app/utils/auth';
import { getApiUrl } from '@/config';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface ReferralData {
  id: string;
  referrerMe: {
    id: string;
    user: User;
  };
  referralsForMe: {
    id: string;
    user: User;
  }[];
}

export default function ReferralsTable() {
  const [referralData, setReferralData] = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReferrals = async () => {
      try {
        const token = getToken();
        if (!token) {
          throw new Error('No se encontró el token de autenticación');
        }

        const response = await fetch(`${getApiUrl('referrals')}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Error al obtener los referidos');
        }

        const data = await response.json();
        setReferralData(data[0]); // Taking first item since it's an array
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al obtener los referidos');
      } finally {
        setLoading(false);
      }
    };

    fetchReferrals();
  }, []);

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
    <div className="space-y-6">
      <div className="rounded-lg border bg-white shadow">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900">Usuario que te refirió</h3>
          <div className="mt-4">
            {referralData?.referrerMe ? (
              <div className="space-y-2">
                <p className="text-gray-700"><strong className="text-gray-900">Nombre:</strong> {referralData.referrerMe.user.firstName} {referralData.referrerMe.user.lastName}</p>
                <p className="text-gray-700"><strong className="text-gray-900">Email:</strong> {referralData.referrerMe.user.email}</p>
              </div>
            ) : (
              <p className="text-gray-500">No hay usuario referidor</p>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-white shadow">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900">Usuarios que has referido</h3>
          <div className="mt-4">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nombre
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {referralData?.referralsForMe.map((referral) => (
                    <tr key={referral.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {referral.user.firstName} {referral.user.lastName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {referral.user.email}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 