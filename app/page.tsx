"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';

export default function Home() {
  const { isAuthenticated } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  
  // Simulate loading state for a brief moment to ensure auth state is hydrated
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-8">
      <h1 className="text-4xl font-bold mb-6">Welcome to Trade Platform</h1>
      <p className="text-xl text-muted-foreground mb-8 max-w-2xl text-center">
        Your one-stop solution for managing and tracking trades with a comprehensive dashboard.
      </p>
      
      {isAuthenticated ? (
        <div className="flex flex-col items-center gap-4">
          <Button 
            size="lg"
            asChild
          >
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
          <p className="text-sm text-muted-foreground mt-2">
            View and manage your trading activities
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4">          <Button 
            size="lg"
            asChild
          >
            <Link href="/login">Get Started</Link>
          </Button>
          <p className="text-sm text-muted-foreground mt-2">
            Login or create an account to begin
          </p>
        </div>
      )}
    </div>
  );
}
