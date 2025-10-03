'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ConnectWallet } from '@/components/ConnectWallet';

const routes = [
  {
    name: 'Dashboard',
    href: '/dashboard',
  },
  {
    name: 'Carteira',
    href: '/wallet',
  },
  {
    name: 'Notificações',
    href: '/notifications',
  },
  {
    name: 'Configurações',
    href: '/settings',
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="border-b">
        <div className="flex h-16 items-center px-4">
          <div className="flex items-center space-x-4">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  pathname === route.href
                    ? 'text-foreground'
                    : 'text-muted-foreground'
                }`}
              >
                {route.name}
              </Link>
            ))}
          </div>
          <div className="ml-auto w-[280px]">
            <ConnectWallet />
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="container mx-auto py-6">
        {children}
      </main>
    </div>
  );
}