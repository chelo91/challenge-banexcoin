'use client';

import { logout } from '../utils/auth';

export default function LogoutButton() {
  return (
    <button
      onClick={logout}
      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500"
    >
      Cerrar sesión
    </button>
  );
} 