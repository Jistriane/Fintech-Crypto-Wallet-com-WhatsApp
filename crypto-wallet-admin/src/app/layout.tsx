import '@/styles/globals.css';
import { Inter } from 'next/font/google';
import { Providers } from './providers';
import Layout from '@/components/layout/Layout';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Crypto Wallet - Gerenciador de Carteira com WhatsApp',
  description: 'Gerencie suas criptomoedas com segurança e facilidade',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <Layout>{children}</Layout>
        </Providers>
      </body>
    </html>
  );
}