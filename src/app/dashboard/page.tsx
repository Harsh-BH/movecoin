"use client";

import { useEffect } from "react";
import { redirect } from "next/navigation";
import { useWallet } from "@aptos-labs/wallet-adapter-react";

export default function Dashboard() {
  const { connected } = useWallet();
  
  useEffect(() => {
    // Client-side redirect to overview
    if (connected) {
      redirect('/dashboard/overview');
    }
  }, [connected]);
  
  // This should never render; it's just a redirect
  return null;
}