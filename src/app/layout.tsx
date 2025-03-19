
import Providers from '@/components/layout/providers';
import { Toaster } from '@/components/ui/sonner';
import type { Metadata } from 'next';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { Lato } from 'next/font/google';
import NextTopLoader from 'nextjs-toploader';
import './globals.css';
import { AutoConnectProvider } from '@/components/wallet/AutoConnectProvider';
import { ReactQueryClientProvider } from '@/components/wallet/ReactQueryClientProvider';
import { WalletProvider } from '@/components/wallet/WalletProvider';

export const metadata: Metadata = {
  title: 'Next Shadcn',
  description: 'Basic dashboard with Next.js and Shadcn'
};

const lato = Lato({
  subsets: ['latin'],
  weight: ['400', '700', '900'],
  display: 'swap'
});

export default async function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en' className={`${lato.className}`} suppressHydrationWarning>
      <body className={'overflow-hidden'}>
      <AutoConnectProvider>
            <ReactQueryClientProvider>
              <WalletProvider>
        <NextTopLoader showSpinner={false} />
        <NuqsAdapter>
          <Providers >
            <Toaster />
            {children}
          </Providers>
        </NuqsAdapter>
        </WalletProvider>
            </ReactQueryClientProvider>
          </AutoConnectProvider>
      </body>
    </html>
  );
}
