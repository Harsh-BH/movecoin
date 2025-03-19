"use client"
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowUpRight, Clock, AlertCircle, CheckIcon, ChevronRight,
  X, ExternalLink, RefreshCcw, Send, Info, Download, Upload, 
  MoreHorizontal, ZapIcon, Filter
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Skeleton}  from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Transaction {
  version: string;
  hash: string;
  state_change_hash: string;
  event_root_hash: string;
  state_checkpoint_hash: string | null;
  gas_used: string;
  success: boolean;
  vm_status: string;
  accumulator_root_hash: string;
  timestamp: string;
  changes: any[];
  sender: string;
  sequence_number: string;
  max_gas_amount: string;
  gas_unit_price: string;
  expiration_timestamp_secs: string;
  payload: {
    function: string;
    type_arguments: string[];
    arguments: string[];
    type: string;
  };
  events: any[];
}

interface ActivityFeedProps {
  address: string;
  network: string;
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ address, network }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pageSize, setPageSize] = useState(10);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!address) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const baseUrl = network === 'mainnet'
          ? 'https://fullnode.mainnet.aptoslabs.com/v1'
          : network === 'testnet'
            ? 'https://fullnode.testnet.aptoslabs.com/v1'
            : 'https://fullnode.devnet.aptoslabs.com/v1';
        
        const response = await axios.get(
          `${baseUrl}/accounts/${address}/transactions`, 
          {
            params: {
              limit: pageSize
            },
            headers: {
              'Accept': 'application/json'
            }
          }
        );
        
        setTransactions(response.data);
      } catch (err) {
        console.error('Error fetching transactions:', err);
        setError('Failed to load transaction history');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [address, network, pageSize]);

  const getTransactionTypeInfo = (tx: Transaction) => {
    // Extract function name from the full function path
    const functionPath = tx.payload?.function || '';
    const parts = functionPath.split('::');
    const functionName = parts.length > 2 ? parts[2] : functionPath;
    
    // Determine type based on function name or other properties
    let type = 'transaction';
    let icon = <MoreHorizontal className="h-4 w-4" />;
    let label = 'Transaction';
    
    if (functionName.toLowerCase().includes('transfer')) {
      type = 'transfer';
      icon = <Send className="h-4 w-4" />;
      label = 'Transfer';
    } else if (functionName.toLowerCase().includes('mint')) {
      type = 'mint';
      icon = <Download className="h-4 w-4" />;
      label = 'Mint';
    } else if (functionName.toLowerCase().includes('burn')) {
      type = 'burn';
      icon = <Upload className="h-4 w-4" />;
      label = 'Burn';
    } else if (functionName.toLowerCase().includes('stake')) {
      type = 'stake';
      icon = <RefreshCcw className="h-4 w-4" />;
      label = 'Stake';
    } else if (functionName.toLowerCase().includes('swap')) {
      type = 'swap';
      icon = <ArrowUpRight className="h-4 w-4 rotate-45" />;
      label = 'Swap';
    } else if (functionName.toLowerCase().includes('claim')) {
      type = 'claim';
      icon = <Download className="h-4 w-4" />;
      label = 'Claim';
    } else if (functionName.toLowerCase().includes('vote')) {
      type = 'governance';
      icon = <ZapIcon className="h-4 w-4" />;
      label = 'Vote';
    }
    
    return { type, icon, label, functionName };
  };

  const truncateAddress = (addr: string) => {
    if (!addr) return '';
    if (addr.startsWith('0x') && addr.length > 12) {
      return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    }
    return addr;
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(parseInt(timestamp) * 1000);
    return date.toLocaleString();
  };

  const getStatusStyles = (success: boolean) => {
    if (success) {
      return { icon: <CheckIcon className="h-4 w-4" />, color: 'text-green-400', bg: 'bg-green-900/20' };
    }
    return { icon: <AlertCircle className="h-4 w-4" />, color: 'text-red-400', bg: 'bg-red-900/20' };
  };

  const filteredTransactions = transactions.filter(tx => {
    if (filter === 'all') return true;
    
    const txType = getTransactionTypeInfo(tx).type;
    return filter === txType;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-xl border border-gray-700 overflow-hidden bg-gray-800"
    >
      <div className="p-5 border-b border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">Transaction History</h2>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 gap-1 border-gray-700 bg-gray-800 text-gray-300"
                >
                  <Filter className="h-3.5 w-3.5" />
                  {filter === 'all' ? 'All Types' : filter.charAt(0).toUpperCase() + filter.slice(1)}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-gray-900 text-gray-300 border-gray-700">
                <DropdownMenuItem onClick={() => setFilter('all')}>
                  All Types
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('transfer')}>
                  Transfers
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('mint')}>
                  Mints
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('swap')}>
                  Swaps
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('stake')}>
                  Stakes
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 border-gray-700 bg-gray-800 text-gray-300"
              onClick={() => setPageSize(prev => prev + 10)}
            >
              Load More
            </Button>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-900/20 border border-red-800 text-red-400 rounded-lg p-3 mb-4">
            {error}
          </div>
        )}
      </div>
      
      {loading && !transactions.length ? (
        // Loading skeletons
        <div className="divide-y divide-gray-700">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-4 flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full bg-gray-700" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-1/3 bg-gray-700" />
                <Skeleton className="h-3 w-1/2 bg-gray-700" />
              </div>
              <Skeleton className="h-6 w-16 bg-gray-700" />
            </div>
          ))}
        </div>
      ) : (
        <>
          {filteredTransactions.length > 0 ? (
            <div className="divide-y divide-gray-700">
              {filteredTransactions.map((tx) => {
                const { icon, label } = getTransactionTypeInfo(tx);
                const status = getStatusStyles(tx.success);
                
                return (
                  <motion.div
                    key={tx.hash}
                    className="p-4 hover:bg-gray-700/30 transition-colors cursor-pointer flex justify-between items-center"
                    onClick={() => setSelectedTx(tx)}
                    whileHover={{ x: 4 }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-full bg-gray-700">
                        {icon}
                      </div>
                      <div>
                        <div className="flex items-center">
                          <p className="font-medium text-gray-200">{label}</p>
                          <div className={`ml-2 px-2 py-0.5 rounded-full text-xs ${status.bg} ${status.color} flex items-center space-x-1`}>
                            {status.icon}
                            <span>{tx.success ? 'Success' : 'Failed'}</span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-400">
                          {formatTimestamp(tx.timestamp)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <p className="text-sm text-gray-400 mr-2">
                        {truncateAddress(tx.hash)}
                      </p>
                      <ChevronRight className="h-4 w-4 text-gray-500" />
                    </div>
                  </motion.div>
                );
              })}
              
              {loading && transactions.length > 0 && (
                <div className="p-4 flex justify-center">
                  <div className="flex items-center gap-2">
                    <div className="animate-spin h-4 w-4 border-2 border-gray-500 rounded-full border-t-transparent"></div>
                    <span className="text-gray-400 text-sm">Loading more...</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center">
              <Info className="mx-auto h-8 w-8 text-gray-500 mb-2" />
              <p className="text-gray-400">No transactions found for this address</p>
            </div>
          )}
        </>
      )}
      
      {filteredTransactions.length > 0 && !loading && (
        <div className="p-4 border-t border-gray-700 text-center">
          <Button 
            variant="outline" 
            onClick={() => setPageSize(prev => prev + 10)} 
            className="text-blue-400 border-blue-900/50 hover:bg-blue-900/20"
          >
            Load More Transactions
          </Button>
        </div>
      )}
      
      {/* Transaction Details Dialog */}
      <Dialog open={!!selectedTx} onOpenChange={() => setSelectedTx(null)}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center">
              <span>Transaction Details</span>
              <button 
                onClick={() => setSelectedTx(null)}
                className="p-1 rounded-full hover:bg-gray-800"
              >
                <X className="h-4 w-4" />
              </button>
            </DialogTitle>
          </DialogHeader>
          
          {selectedTx && (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="bg-gray-800 border-b border-gray-700 mb-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="events">Events</TabsTrigger>
                <TabsTrigger value="changes">Changes</TabsTrigger>
                <TabsTrigger value="payload">Payload</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="p-2 rounded-full bg-gray-800">
                    {getTransactionTypeInfo(selectedTx).icon}
                  </div>
                  <div>
                    <h3 className="font-medium text-lg text-white">
                      {getTransactionTypeInfo(selectedTx).label}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {formatTimestamp(selectedTx.timestamp)}
                    </p>
                  </div>
                  <div className="ml-auto">
                    {getStatusStyles(selectedTx.success).icon}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between py-2 border-b border-gray-800">
                    <span className="text-gray-400">Status</span>
                    <span className={selectedTx.success ? 'text-green-400' : 'text-red-400'}>
                      {selectedTx.success ? 'Success' : 'Failed'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between py-2 border-b border-gray-800">
                    <span className="text-gray-400">Version</span>
                    <span>{selectedTx.version}</span>
                  </div>
                  
                  <div className="flex flex-col py-2 border-b border-gray-800 gap-1">
                    <span className="text-gray-400">Transaction Hash</span>
                    <span className="text-xs font-mono bg-gray-800 p-2 rounded">{selectedTx.hash}</span>
                  </div>
                  
                  <div className="flex justify-between py-2 border-b border-gray-800">
                    <span className="text-gray-400">Sender</span>
                    <div className="flex items-center">
                      <span className="font-mono text-sm">{truncateAddress(selectedTx.sender)}</span>
                      <a 
                        href={`https://explorer.aptoslabs.com/account/${selectedTx.sender}?network=${network}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-1 text-blue-400 hover:text-blue-300"
                        onClick={e => e.stopPropagation()}
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex justify-between py-2 border-b border-gray-800">
                    <span className="text-gray-400">Sequence Number</span>
                    <span>{selectedTx.sequence_number}</span>
                  </div>
                  
                  <div className="flex justify-between py-2 border-b border-gray-800">
                    <span className="text-gray-400">Gas Used</span>
                    <span>{parseInt(selectedTx.gas_used).toLocaleString()} units</span>
                  </div>
                  
                  <div className="flex justify-between py-2 border-b border-gray-800">
                    <span className="text-gray-400">Gas Unit Price</span>
                    <span>{parseInt(selectedTx.gas_unit_price).toLocaleString()} units</span>
                  </div>
                  
                  <div className="flex justify-between py-2 border-b border-gray-800">
                    <span className="text-gray-400">Max Gas Amount</span>
                    <span>{parseInt(selectedTx.max_gas_amount).toLocaleString()} units</span>
                  </div>
                  
                  <div className="flex justify-between py-2 border-b border-gray-800">
                    <span className="text-gray-400">VM Status</span>
                    <span className="font-mono text-xs">{selectedTx.vm_status}</span>
                  </div>
                </div>
                
                <div className="flex justify-center pt-2">
                  <a 
                    href={`https://explorer.aptoslabs.com/txn/${selectedTx.hash}?network=${network}`}
                    target="_blank"
                    rel="noopener noreferrer" 
                    className="flex items-center text-blue-400 hover:text-blue-300 transition-colors"
                    onClick={e => e.stopPropagation()}
                  >
                    <span>View on Explorer</span>
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </div>
              </TabsContent>
              
              <TabsContent value="events" className="space-y-4">
                {selectedTx.events && selectedTx.events.length > 0 ? (
                  <div className="space-y-4">
                    {selectedTx.events.map((event, index) => (
                      <div key={index} className="bg-gray-800 rounded-lg p-3 border border-gray-700">
                        <div className="text-sm font-medium text-gray-300 mb-2">Event {index + 1}</div>
                        <pre className="text-xs overflow-auto p-2 bg-gray-900 rounded max-h-40">
                          {JSON.stringify(event, null, 2)}
                        </pre>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-400">No events for this transaction</div>
                )}
              </TabsContent>
              
              <TabsContent value="changes" className="space-y-4">
                {selectedTx.changes && selectedTx.changes.length > 0 ? (
                  <div className="space-y-4">
                    {selectedTx.changes.map((change, index) => (
                      <div key={index} className="bg-gray-800 rounded-lg p-3 border border-gray-700">
                        <div className="text-sm font-medium text-gray-300 mb-2">State Change {index + 1}</div>
                        <pre className="text-xs overflow-auto p-2 bg-gray-900 rounded max-h-40">
                          {JSON.stringify(change, null, 2)}
                        </pre>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-400">No state changes for this transaction</div>
                )}
              </TabsContent>
              
              <TabsContent value="payload" className="space-y-4">
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <div className="mb-2">
                    <span className="text-gray-400">Function:</span>
                    <span className="ml-2 font-mono text-sm">{selectedTx.payload.function}</span>
                  </div>
                  
                  <div className="mb-2">
                    <span className="text-gray-400">Type:</span>
                    <span className="ml-2">{selectedTx.payload.type}</span>
                  </div>
                  
                  <div>
                    <div className="text-gray-400 mb-1">Type Arguments:</div>
                    {selectedTx.payload.type_arguments.length > 0 ? (
                      <ul className="list-disc list-inside pl-2">
                        {selectedTx.payload.type_arguments.map((arg, i) => (
                          <li key={i} className="font-mono text-xs">{arg}</li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-gray-500 text-sm">None</span>
                    )}
                  </div>
                  
                  <div className="mt-4">
                    <div className="text-gray-400 mb-1">Arguments:</div>
                    {selectedTx.payload.arguments.length > 0 ? (
                      <pre className="text-xs overflow-auto p-2 bg-gray-900 rounded max-h-40">
                        {JSON.stringify(selectedTx.payload.arguments, null, 2)}
                      </pre>
                    ) : (
                      <span className="text-gray-500 text-sm">None</span>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default ActivityFeed;