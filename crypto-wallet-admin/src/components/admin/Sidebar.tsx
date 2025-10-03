'use client';

import {
  BarChart3,
  Wallet,
  Coins,
  Shield,
  Settings,
  Users,
  MessageSquare,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navigation = [
  {
    name: 'Dashboard',
    href: '/admin/dashboard',
    icon: BarChart3,
  },
  {
    name: 'Carteiras',
    href: '/admin/carteiras',
    icon: Wallet,
  },
  {
    name: 'Tokens',
    href: '/admin/tokens',
    icon: Coins,
  },
  {
    name: 'Usuários',
    href: '/admin/usuarios',
    icon: Users,
  },
  {
    name: 'WhatsApp',
    href: '/admin/whatsapp',
    icon: MessageSquare,
  },
  {
    name: 'Segurança',
    href: '/admin/seguranca',
    icon: Shield,
  },
  {
    name: 'Configurações',
    href: '/admin/configuracoes',
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r bg-card">
      <nav className="flex h-full flex-col">
        <div className="space-y-1 p-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}
