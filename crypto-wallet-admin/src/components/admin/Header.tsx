'use client';

import { useTheme } from 'next-themes';
import { ConnectButton } from '@/components/blockchain/ConnectButton';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import {
  Sun,
  Moon,
  Bell,
  User,
  LogOut,
  Settings,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export function Header() {
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href="/admin/dashboard" className="flex items-center space-x-2">
          <Image src="/logo.png" alt="Notus" width={32} height={32} />
          <span className="font-bold">Notus Admin</span>
        </Link>

        <div className="flex flex-1 items-center justify-end space-x-4">
          <ConnectButton />

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Alternar tema</span>
          </Button>

          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
              3
            </span>
            <span className="sr-only">Notificações</span>
          </Button>

          <div className="relative">
            <Button variant="ghost" size="sm" className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span className="hidden sm:inline-block">{user?.name}</span>
            </Button>
          </div>

          <Button variant="ghost" size="sm" onClick={logout}>
            <LogOut className="h-5 w-5" />
            <span className="sr-only">Sair</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
