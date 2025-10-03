'use client';

import { LoginForm } from "@/components/auth/LoginForm";
import Image from "next/image";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function Home() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-background to-muted">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center space-y-4">
          <Image
            src="/logo.png"
            alt="Crypto Wallet Logo"
            width={80}
            height={80}
            className="rounded-lg w-auto h-auto"
            priority
          />
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight">
              Crypto Wallet Admin
            </h1>
            <p className="mt-2 text-muted-foreground">
              Acesse o painel administrativo
            </p>
          </div>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
