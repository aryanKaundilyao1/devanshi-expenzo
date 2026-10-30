import React, { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import { ErrorBoundary } from '@/features/misc/ErrorBoundary';
import { useUIStore } from '@/store/useUIStore';
import { useSupabaseAuth } from '@/features/auth/hooks/useSupabaseAuth';

export function App() {
  const { theme } = useUIStore();
  useSupabaseAuth(); // Listen to active Supabase authentication session

  useEffect(() => {
    // Initial theme sync on root document
    if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  );
}

export default App;

