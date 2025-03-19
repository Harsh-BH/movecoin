"use client";

import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { redirect, useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface WalletAuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
}

const WalletAuthContext = createContext<WalletAuthContextType>({
  isAuthenticated: false,
  isLoading: true
});

export function WalletAuthProvider({ children }: { children: ReactNode }) {
  const { connected, connecting } = useWallet();
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Only update loading state when connection state is determined
    if (!connecting) {
      setIsLoading(false);
    }
  }, [connecting]);

  return (
    <WalletAuthContext.Provider value={{ 
      isAuthenticated: !!connected, 
      isLoading 
    }}>
      {children}
    </WalletAuthContext.Provider>
  );
}

export function useWalletAuth() {
  return useContext(WalletAuthContext);
}

export function WalletAuthGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useWalletAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, isLoading, router]);
  
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return null;
  }
  
  return <>{children}</>;
}