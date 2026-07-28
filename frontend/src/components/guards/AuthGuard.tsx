'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '../../store/auth-store';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      const publicPaths = ['/login', '/forgot-password'];
      const isPublicPath = publicPaths.includes(pathname);

      if (!isAuthenticated && !isPublicPath) {
        router.push('/login');
      } else if (isAuthenticated && isPublicPath) {
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, pathname, router, mounted]);

  if (!mounted) {
    return null; // prevent hydration mismatch
  }

  return <>{children}</>;
}
