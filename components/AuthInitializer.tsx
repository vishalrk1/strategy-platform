'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';

export default function AuthInitializer() {
  const { initialize } = useAuthStore();

  useEffect(() => {
    // Initialize auth state when the app loads
    initialize();
  }, [initialize]);

  return null; // This component doesn't render anything
}
