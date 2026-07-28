'use client';

import { useAuthStore } from '@/store/auth-store';
import { useRouter } from 'next/navigation';
import { LogOut, User, LayoutDashboard, Map, Settings, Network } from 'lucide-react';
import Link from 'next/link';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, clearAuth } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    clearAuth();
    router.push('/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Network Map', href: '/gis', icon: Map },
    { name: 'Assets', href: '/assets', icon: Network },
    { name: 'Homepasses', href: '/homepasses', icon: Network },
    { name: 'Customers', href: '/customers', icon: User },
    { name: 'Work Orders', href: '/work-orders', icon: Settings },
    { name: 'Monitoring', href: '/monitoring', icon: Settings },
    { name: 'AI Assistant', href: '/ai', icon: Settings },
    { name: 'System Settings', href: '/system/settings', icon: Settings },
    { name: 'System Health', href: '/system/health', icon: Settings },
    { name: 'Audit Log', href: '/system/audit-log', icon: Settings },
    { name: 'Backup', href: '/system/backup', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md dark:bg-gray-800">
        <div className="flex h-16 items-center justify-center border-b px-4 dark:border-gray-700">
          <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400">FAMS</h1>
        </div>
        
        <nav className="mt-6 space-y-1 px-2">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="group flex items-center rounded-md px-2 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
            >
              <item.icon
                className="mr-3 h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300"
                aria-hidden="true"
              />
              {item.name}
            </Link>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b bg-white px-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center text-gray-800 dark:text-gray-200">
            {/* Breadcrumb / Title placeholder */}
            <span className="font-semibold">Overview</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
              <User className="h-4 w-4" />
              <span>{user?.full_name || user?.username}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 rounded-md px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-gray-700"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
