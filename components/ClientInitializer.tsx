'use client';

import { useEffect } from 'react';
import { useThemeStore } from '@/stores/themeStore';
import { useAuthStore } from '@/stores/authStore';

export function ClientInitializer() {
  const initializeTheme = useThemeStore((state) => state.initializeTheme);
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    initializeTheme();
    initialize();
  }, [initializeTheme, initialize]);

  return null;
}
