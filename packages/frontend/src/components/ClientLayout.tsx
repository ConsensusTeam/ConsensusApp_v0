'use client';

import Navigation from '@/components/Navigation';
import { AuthProvider } from '@/contexts/AuthContext';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <Navigation />
      <main className="min-h-screen bg-gray-50">
        {children}
      </main>
    </AuthProvider>
  );
} 