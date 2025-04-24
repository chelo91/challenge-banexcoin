'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { HomeIcon, ArrowPathIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';

const navigation = [
  { 
    name: 'Dashboard', 
    href: '/dashboard', 
    icon: HomeIcon,
  },
  { 
    name: 'Transferencias', 
    href: '/dashboard/transfers', 
    icon: ArrowPathIcon,
    submenu: [
      { name: 'Historial de transferencias', href: '/dashboard/transfers/history' },
      { name: 'Nueva transferencia', href: '/dashboard/transfers/new' },
    ]
  },
  { 
    name: 'Comisiones', 
    href: '/dashboard/commissions', 
    icon: CurrencyDollarIcon,
    submenu: [
      { name: 'Historial de comisiones', href: '/dashboard/commissions/history' },
      { name: 'Referidos', href: '/dashboard/commissions/referrals' },
    ]
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleMainMenuClick = (item: typeof navigation[0]) => {
    if (item.submenu) {
      router.push(item.submenu[0].href);
    } else {
      router.push(item.href);
    }
  };

  return (
    <div className="flex h-full w-64 flex-col bg-gray-900">
      <div className="flex h-16 items-center justify-center border-b border-gray-800">
        <h1 className="text-xl font-bold text-white">BanexCoin</h1>
      </div>
      <nav className="flex-1 space-y-1 px-2 py-4">
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <div key={item.name}>
              <button
                onClick={() => handleMainMenuClick(item)}
                className={`group flex w-full items-center rounded-md px-2 py-2 text-sm font-medium ${
                  isActive
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <item.icon
                  className={`mr-3 h-6 w-6 flex-shrink-0 ${
                    isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'
                  }`}
                  aria-hidden="true"
                />
                {item.name}
              </button>
              {isActive && item.submenu && (
                <div className="ml-4 mt-1 space-y-1">
                  {item.submenu.map((subItem) => {
                    const isSubActive = pathname === subItem.href;
                    return (
                      <Link
                        key={subItem.name}
                        href={subItem.href}
                        className={`block rounded-md px-2 py-2 text-sm ${
                          isSubActive
                            ? 'bg-gray-700 text-white'
                            : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                        }`}
                      >
                        {subItem.name}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
} 