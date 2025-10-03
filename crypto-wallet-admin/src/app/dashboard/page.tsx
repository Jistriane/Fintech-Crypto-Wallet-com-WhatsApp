'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAccount } from 'wagmi';

export default function DashboardPage() {
  const { address, isConnected } = useAccount();
  const router = useRouter();

  useEffect(() => {
    if (!isConnected) {
      router.push('/');
    }
  }, [isConnected, router]);

  if (!address) {
    return null;
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-6">Dashboard</h1>
        <p className="text-muted-foreground mb-4">
          Connected address: {address}
        </p>
        {/* Add your dashboard content here */}
      </div>
    </main>
  );
}