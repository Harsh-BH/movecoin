"use client";

import { WalletSelector } from "@/components/wallet/WalletSelector";
import { motion } from "framer-motion";
import Image from "next/image";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const { connected, connecting } = useWallet();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isClient, setIsClient] = useState(false);
  
  // Set isClient to true once component mounts
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Improved redirect logic with stable state management
  useEffect(() => {
    // Don't redirect if we're still connecting or already redirecting
    if (connecting || isRedirecting) return;
    
    // Only redirect once when connection is confirmed
    if (connected && !isRedirecting) {
      setIsRedirecting(true);
      // Redirect directly to dashboard/overview instead of dashboard
      router.push("/dashboard/overview");
    }
  }, [connected, connecting, router, isRedirecting]);
  
  return (
    <main className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-background to-secondary/20">
      {/* Animated background elements - only render on client */}
      {isClient && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-primary/10 w-64 h-64"
              initial={{ 
                x: `${Math.random() * 100 - 50}%`, 
                y: `${Math.random() * 100 - 50}%`,
                scale: Math.random() * 0.5 + 0.5,
                opacity: 0.1 
              }}
              animate={{ 
                x: `${Math.random() * 100 - 50}%`, 
                y: `${Math.random() * 100 - 50}%`,
                opacity: [0.1, 0.2, 0.1] 
              }}
              transition={{ 
                duration: 15 + Math.random() * 10, 
                repeat: Infinity,
                repeatType: "reverse"
              }}
            />
          ))}
        </div>
      )}
      
      <motion.div
        className="flex flex-col items-center justify-center gap-12 p-6 text-center z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Logo */}
        <motion.div
          className="w-24 h-24 relative"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
        >
          <Image
            src="/logo.svg"
            alt="MoveCoin Logo"
            width={96}
            height={96}
            className="object-contain"
            priority
          />
        </motion.div>

        {/* Title */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            MoveCoin
          </h1>
          <p className="text-lg text-muted-foreground max-w-md">
            Connect your wallet to access the future of decentralized finance
          </p>
        </motion.div>

        {/* Wallet connect button */}
        <motion.div
          className="w-full max-w-xs"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="backdrop-blur-sm bg-card/80 p-4 rounded-xl shadow-lg border border-border/50">
            <WalletSelector />
          </div>
        </motion.div>

        {/* Footer text */}
        <motion.p 
          className="text-sm text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.8 }}
        >
          Powered by Aptos Blockchain
        </motion.p>
      </motion.div>
    </main>
  );
}