"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { BOTS } from '@/constants/bot-constant';
import { getBotImplementation, isBotImplemented } from '@/lib/bot-registry';
import { ArrowLeft, Bot as BotIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { trackBotUsage } from '@/lib/bot-utils';

const BotPage = () => {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const botId = params?.botId as string;
  
  // Find the bot data from our constants
  const botData = BOTS.find(bot => bot.id === botId);
  
  useEffect(() => {
    // Simulated loading delay
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, [botId]);

  useEffect(() => {
    // Track usage when bot is viewed
    if (botData) {
      trackBotUsage(botId, 'view');
    }
  }, [botId, botData]);
  
  // Redirect if bot not found or not implemented
  useEffect(() => {
    if (!loading) {
      if (!botData) {
        router.push('/dashboard/bots');
      } else if (!isBotImplemented(botId)) {
        // Show coming soon page or redirect
        // For now, we'll redirect back to marketplace
        router.push('/dashboard/bots');
      }
    }
  }, [botData, botId, loading, router]);
  
  if (loading) {
    return <BotLoadingSkeleton />;
  }
  
  if (!botData || !isBotImplemented(botId)) {
    return <BotNotFound />;
  }
  
  // Get the bot implementation
  const botImplementation = getBotImplementation(botId);
  if (!botImplementation) {
    return <BotNotImplemented />;
  }
  
  // Get the component to render
  const BotComponent = botImplementation.component;
  
  return (
    <div className="container max-w-7xl mx-auto">
      <Button 
        variant="ghost" 
        className="mb-4 flex items-center gap-2"
        onClick={() => router.push('/dashboard/bots')}
      >
        <ArrowLeft size={16} />
        Back to Marketplace
      </Button>
      
      <Suspense fallback={<BotLoadingSkeleton />}>
        <BotComponent bot={botData} />
      </Suspense>
    </div>
  );
};

// Loading skeleton for the bot interface
const BotLoadingSkeleton = () => (
  <div className="container max-w-7xl mx-auto space-y-6 p-4">
    <div className="flex items-center gap-4">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
    </div>
    
    <Skeleton className="h-[300px] w-full rounded-lg" />
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Skeleton className="h-[200px] rounded-lg" />
      <Skeleton className="h-[200px] rounded-lg" />
    </div>
  </div>
);

// Component for when a bot is not found
const BotNotFound = () => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    <div className="bg-muted rounded-full p-6 mb-6">
      <BotIcon size={48} />
    </div>
    <h2 className="text-2xl font-bold mb-2">Bot Not Found</h2>
    <p className="text-muted-foreground max-w-md mb-6">
      We couldn't find the bot you're looking for. It may have been removed or is not available.
    </p>
    <Button onClick={() => window.history.back()}>
      Go Back
    </Button>
  </div>
);

// Fallback component for bots that aren't implemented yet
const BotNotImplemented = () => (
  <div className="container max-w-7xl mx-auto flex flex-col items-center justify-center py-12 text-center">
    <div className="bg-muted rounded-full p-6 mb-6">
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
        <line x1="7" y1="2" x2="7" y2="22" />
        <line x1="17" y1="2" x2="17" y2="22" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <line x1="2" y1="7" x2="7" y2="7" />
        <line x1="2" y1="17" x2="7" y2="17" />
        <line x1="17" y1="17" x2="22" y2="17" />
        <line x1="17" y1="7" x2="22" y2="7" />
      </svg>
    </div>
    <h2 className="text-2xl font-bold mb-2">Coming Soon</h2>
    <p className="text-muted-foreground max-w-md mb-6">
      This bot interface is currently under development and will be available soon.
    </p>
    <Button onClick={() => window.history.back()}>
      Go Back
    </Button>
  </div>
);

export default BotPage;