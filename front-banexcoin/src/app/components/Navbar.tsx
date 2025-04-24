'use client';

import { BellIcon } from '@heroicons/react/24/outline';
import LogoutButton from './LogoutButton';

export default function Navbar() {
  return (
    <div className="h-16 border-b border-gray-200 bg-white">
      <div className="flex h-full items-center justify-between px-4">
        <div className="flex-1"></div>
        <div className="flex items-center space-x-4">
          <button
            type="button"
            className="rounded-full bg-white p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <span className="sr-only">Ver notificaciones</span>
            <BellIcon className="h-6 w-6" aria-hidden="true" />
          </button>
          <LogoutButton />
        </div>
      </div>
    </div>
  );
} 