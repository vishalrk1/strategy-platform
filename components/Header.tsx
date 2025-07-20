'use client';

import React from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';

export default function Header() {
  const { user, logout, isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <nav className="flex items-center justify-between p-4 bg-sidebar shadow-sm rounded-xl">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold">
            Pro AlgoMaps
          </h1>
        </div>
        <div className="animate-pulse">
          <div className="w-20 h-8 bg-gray-200 dark:bg-gray-600 rounded"></div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="flex items-center justify-between p-4 bg-sidebar shadow-sm rounded-xl">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold cursor-pointer">
          <Link href="/">Pro AlgoMaps</Link>
        </h1>
      </div>
      <div className="flex items-center gap-4">
        {isAuthenticated ? (
          <>
            <span className="text-xs text-muted-foreground">
              {user?.name || user?.email}
            </span>
            <Button
              variant="outline"
              onClick={logout}
            >
              Logout
            </Button>
          </>
        ) : (          <>
            <Link href="/login">
              <Button variant="outline">
                Login
              </Button>
            </Link>
            <Link href="/register">
              <Button>Register</Button>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
