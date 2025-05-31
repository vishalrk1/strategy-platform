'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

interface AuthRedirectProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export default function AuthRedirect({ 
  children, 
  redirectTo = '/dashboard' 
}: AuthRedirectProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading, initialize } = useAuthStore();
  useEffect(() => {
    const init = async () => {
      await initialize();
    };
    init();
  }, [initialize]);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, router, redirectTo]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <>{children}</>;
  }

  // Return null while redirecting
  return null;
}
