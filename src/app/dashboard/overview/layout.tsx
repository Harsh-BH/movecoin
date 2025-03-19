"use client"

import React, { useEffect, useState } from 'react';
import { fetchAccountDetails } from '@/lib/aptosApi';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { Network } from "@aptos-labs/ts-sdk";
import { Button } from '@/components/ui/button';
import { 
  Copy, CheckCircle, Database, Key, 
  ExternalLink, Clock, CreditCard, Shield, 
  FileCode, Wallet, HelpCircle, RefreshCw,
  ArrowUpRight, AlertCircle, ChevronRight,
  X, Send, Info, Download, Upload, 
  MoreHorizontal, ZapIcon, Filter
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import PageContainer from '@/components/layout/page-container';
import { WalletAuthGuard } from '@/lib/wallet-auth';
import axios from 'axios';
import ActivityFeed from './activity';
import CoinBalances from './CoinBalances';
import NetworkSelector from './NetworkSelector';

interface Resource {
  type: string;
  data: any;
}

interface Module {
  name: string;
  abi: any;
}

function formatTimestamp(timestamp: number | string): string {
  if (!timestamp) return 'N/A';
  const date = new Date(Number(timestamp) * 1000);
  return date.toLocaleString();
}

function formatDataSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / 1048576).toFixed(2)} MB`;
}

const AccountDetailsPage = () => {
  const { account, connected, network: walletNetwork } = useWallet();
  const [accountData, setAccountData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedResource, setExpandedResource] = useState<string | null>(null);
  const [expandedModule, setExpandedModule] = useState<string | null>(null);

  // Use the network from the connected wallet, with a safe fallback
  const network = walletNetwork?.name?.toLowerCase() === Network.MAINNET.toLowerCase() ? 'mainnet' : 
                 walletNetwork?.name?.toLowerCase() === Network.TESTNET.toLowerCase() ? 'testnet' :
                 walletNetwork?.name?.toLowerCase() === Network.DEVNET.toLowerCase() ? 'devnet' :
                 walletNetwork?.name ? walletNetwork.name.toLowerCase() : 'testnet'; // Default to testnet if unknown
                 
  // Log current network selection for debugging
  useEffect(() => {
    console.log('Wallet network:', walletNetwork);
    console.log('Using network:', network);
  }, [walletNetwork, network]);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const toggleResource = (resourceType: string) => {
    if (expandedResource === resourceType) {
      setExpandedResource(null);
    } else {
      setExpandedResource(resourceType);
    }
  };

  const toggleModule = (moduleName: string) => {
    if (expandedModule === moduleName) {
      setExpandedModule(null);
    } else {
      setExpandedModule(moduleName);
    }
  };

  const refreshAccountData = async () => {
    if (!account?.address) return;
    setIsLoading(true);
    try {
      const data = await fetchAccountDetails(account.address.toString(), network);
      setAccountData(data);
    } catch (error) {
      console.error('Error fetching account data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (connected && account?.address) {
      refreshAccountData();
    }
  }, [connected, account, network]);

  const truncateString = (str: string, maxLength: number = 20) => {
    if (!str) return '';
    if (str.length <= maxLength) return str;
    return `${str.substring(0, 8)}...${str.substring(str.length - 8)}`;
  };

  return (
    <WalletAuthGuard>
      <PageContainer>
        <motion.div
          className="flex flex-col space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Account Details</h1>
              <p className="text-muted-foreground mt-1">View comprehensive information about your Aptos account</p>
            </div>

            <div className="mt-4 md:mt-0 flex gap-2">
              {/* Network Selector Integration */}
              <NetworkSelector 
                selectedNetwork={network}
                onNetworkChange={(newNetwork) => {
                  // In a real implementation, you would handle network changes here
                  console.log("Network changed to:", newNetwork);
                }}
              />
              
              <Button 
                onClick={refreshAccountData}
                variant="outline"
                className="flex gap-2 items-center"
                disabled={isLoading || !connected}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              
                <a 
                href={`https://explorer.aptoslabs.com/account/${account?.address}?network=${network === 'mainnet' ? 'mainnet' : network}`}
                target="_blank"
                rel="noopener noreferrer"
                >
                <Button variant="outline" className="flex gap-2 items-center">
                  <ExternalLink className="h-4 w-4" />
                  View in Explorer
                </Button>
                </a>
            </div>
          </div>

          {/* Account Overview Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-card/60 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
                <CardTitle>Account Overview</CardTitle>
                <div className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-md">
                  {network.toUpperCase()}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Address Section */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Wallet className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm font-medium text-muted-foreground">ADDRESS</p>
                    </div>
                    <div className="flex items-center justify-between bg-muted/50 p-3 rounded-md">
                      <p className="font-mono text-sm break-all">
                        {account?.address ? account.address.toString() : "Not connected"}
                      </p>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => copyToClipboard(account?.address?.toString() || "", 'address')}
                        disabled={!account?.address}
                        className="h-8 w-8 p-0 rounded-full"
                      >
                        {copiedField === 'address' ? 
                          <CheckCircle className="h-4 w-4 text-green-500" /> : 
                          <Copy className="h-4 w-4" />
                        }
                      </Button>
                    </div>
                  </div>

                  {/* Account Stats */}
                  {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-24 rounded-md bg-muted/60 animate-pulse"></div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <StatsCard 
                        title="Sequence Number" 
                        value={accountData?.sequence_number || "0"} 
                        icon={<Clock className="h-4 w-4" />}
                        description="Transaction count"
                        color="blue"
                      />
                      <StatsCard 
                        title="Resources" 
                        value={accountData?.resources?.length || "0"} 
                        icon={<Database className="h-4 w-4" />}
                        description="Account resources"
                        color="purple"
                      />
                      <StatsCard 
                        title="Modules" 
                        value={accountData?.modules?.length || "0"} 
                        icon={<FileCode className="h-4 w-4" />}
                        description="Deployed modules"
                        color="amber"
                      />
                      <StatsCard 
                        title="Coin Types" 
                        value={accountData?.coins?.length || "0"} 
                        icon={<CreditCard className="h-4 w-4" />}
                        description="Token balances"
                        color="green"
                      />
                    </div>
                  )}

                  {/* Authentication Key */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Key className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm font-medium text-muted-foreground">AUTHENTICATION KEY</p>
                    </div>
                    <div className="flex items-center justify-between bg-muted/50 p-3 rounded-md">
                      <p className="font-mono text-sm break-all">
                        {accountData?.authentication_key ? 
                          truncateString(accountData.authentication_key, 24) : 
                          "Not available"
                        }
                      </p>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => copyToClipboard(accountData?.authentication_key || "", 'auth_key')}
                        disabled={!accountData?.authentication_key}
                        className="h-8 w-8 p-0 rounded-full"
                      >
                        {copiedField === 'auth_key' ? 
                          <CheckCircle className="h-4 w-4 text-green-500" /> : 
                          <Copy className="h-4 w-4" />
                        }
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Detailed Information Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Tabs defaultValue="resources" className="w-full">
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="resources">Resources</TabsTrigger>
                <TabsTrigger value="modules">Modules</TabsTrigger>
                <TabsTrigger value="coins">Coins</TabsTrigger>
              </TabsList>
              
              <TabsContent value="resources" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Database className="h-5 w-5" />
                      Account Resources
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="space-y-2">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className="h-12 rounded-md bg-muted/60 animate-pulse"></div>
                        ))}
                      </div>
                    ) : accountData?.resources?.length ? (
                      <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                        {accountData.resources.map((resource: Resource, index: number) => (
                          <div key={index} className="border rounded-md">
                            <Button
                              variant="ghost"
                              className="w-full flex justify-between items-center p-3 h-auto"
                              onClick={() => toggleResource(resource.type)}
                            >
                              <span className="font-mono text-sm text-left truncate">
                                {resource.type}
                              </span>
                              <span className={`transform transition-transform ${
                                expandedResource === resource.type ? 'rotate-180' : ''
                              }`}>
                                ▼
                              </span>
                            </Button>
                            
                            {expandedResource === resource.type && (
                              <div className="p-3 border-t bg-muted/30">
                                <pre className="text-xs overflow-x-auto whitespace-pre-wrap max-h-60 overflow-y-auto">
                                  {JSON.stringify(resource.data, null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Database className="mx-auto h-10 w-10 text-muted-foreground/60" />
                        <p className="mt-2 text-muted-foreground">No resources found for this account</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="modules" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileCode className="h-5 w-5" />
                      Account Modules
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="space-y-2">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="h-12 rounded-md bg-muted/60 animate-pulse"></div>
                        ))}
                      </div>
                    ) : accountData?.modules?.length ? (
                      <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                        {accountData.modules.map((module: Module, index: number) => (
                          <div key={index} className="border rounded-md">
                            <Button
                              variant="ghost"
                              className="w-full flex justify-between items-center p-3 h-auto"
                              onClick={() => toggleModule(module.name)}
                            >
                              <span className="font-mono text-sm text-left truncate">
                                {module.name}
                              </span>
                              <span className={`transform transition-transform ${
                                expandedModule === module.name ? 'rotate-180' : ''
                              }`}>
                                ▼
                              </span>
                            </Button>
                            
                            {expandedModule === module.name && (
                              <div className="p-3 border-t bg-muted/30">
                                <pre className="text-xs overflow-x-auto whitespace-pre-wrap max-h-60 overflow-y-auto">
                                  {JSON.stringify(module.abi, null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <FileCode className="mx-auto h-10 w-10 text-muted-foreground/60" />
                        <p className="mt-2 text-muted-foreground">No modules deployed by this account</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="coins" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Coin Balances
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="space-y-2">
                        {[...Array(4)].map((_, i) => (
                          <div key={i} className="h-16 rounded-md bg-muted/60 animate-pulse"></div>
                        ))}
                      </div>
                    ) : accountData?.coins?.length ? (
                      <div className="space-y-3">
                        {/* Replace with your CoinBalances component */}
                        <CoinBalances coins={accountData.coins} />
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <CreditCard className="mx-auto h-10 w-10 text-muted-foreground/60" />
                        <p className="mt-2 text-muted-foreground">No coins found in this account</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
          
          {/* Activity Feed Section */}
          {account?.address && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-4"
            >
              <ActivityFeed 
                address={account.address.toString()}
                network={network} 
              />
            </motion.div>
          )}
        </motion.div>
      </PageContainer>
    </WalletAuthGuard>
  );
};

// Stats Card Component
const StatsCard = ({ 
  title, 
  value, 
  icon, 
  description, 
  color = 'blue' 
}: { 
  title: string, 
  value: string | number, 
  icon: React.ReactNode, 
  description: string,
  color: 'blue' | 'green' | 'purple' | 'amber' 
}) => {
  let colorClasses = '';
  
  switch (color) {
    case 'blue':
      colorClasses = 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
      break;
    case 'green':
      colorClasses = 'bg-green-500/10 text-green-600 dark:text-green-400';
      break;
    case 'purple':
      colorClasses = 'bg-purple-500/10 text-purple-600 dark:text-purple-400';
      break;
    case 'amber':
      colorClasses = 'bg-amber-500/10 text-amber-600 dark:text-amber-400';
      break;
  }
  
  return (
    <div className="flex flex-col p-4 space-y-2 bg-card rounded-lg border shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <div className={`rounded-full p-1.5 ${colorClasses}`}>
          {icon}
        </div>
      </div>
      <div className="flex flex-col">
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </div>
    </div>
  );
};

export default AccountDetailsPage;