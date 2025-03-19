import React from 'react';
import { motion } from 'framer-motion';
import { Coins, ExternalLink } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface Coin {
  type: string;
  balance: string;
}

interface CoinBalancesProps {
  coins: Coin[];
}

const CoinBalances: React.FC<CoinBalancesProps> = ({ coins }) => {
  // Format coin type to be more readable
  const formatCoinType = (type: string) => {
    if (!type) return 'Unknown';
    
    // Extract just the coin name from the full type string
    const parts = type.split('::');
    if (parts.length >= 3) {
      return parts[2]; // Usually the coin name is the last part
    }
    return type;
  };

  // Format large numbers with commas and decimal places
  const formatAmount = (balance: string, type: string) => {
    const num = parseInt(balance, 10);
    if (isNaN(num)) return '0';
    
    // For APT and other tokens, divide by 100000000 (8 decimals)
    const symbol = formatCoinType(type);
    const decimals = 8; // Standard for Aptos coins
    
    const formatted = (num / Math.pow(10, decimals)).toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 4
    });
    
    return formatted;
  };

  // Get an appropriate icon/emoji for a coin type
  const getCoinEmoji = (type: string) => {
    const symbol = formatCoinType(type).toLowerCase();
    
    if (symbol === 'apt') return '💎';
    if (symbol.includes('usdc')) return '💵';
    if (symbol.includes('usdt')) return '💲';
    if (symbol.includes('btc')) return '₿';
    if (symbol.includes('eth')) return '⟠';
    if (symbol.includes('sol')) return '◎';
    if (symbol.includes('dai')) return '◈';
    if (symbol.includes('moon')) return '🌙';
    if (symbol.includes('star')) return '⭐';
    if (symbol.includes('move')) return '🚀';
    
    // Default for unknown coins
    return '🪙';
  };

  // Get background color class based on coin type
  const getCoinColorClass = (type: string) => {
    const symbol = formatCoinType(type).toLowerCase();
    
    if (symbol === 'apt') return 'bg-blue-500/10 border-blue-600/20';
    if (symbol.includes('usdc')) return 'bg-green-500/10 border-green-600/20';
    if (symbol.includes('usdt')) return 'bg-green-500/10 border-green-600/20';
    if (symbol.includes('btc')) return 'bg-amber-500/10 border-amber-600/20';
    if (symbol.includes('eth')) return 'bg-purple-500/10 border-purple-600/20';
    if (symbol.includes('sol')) return 'bg-indigo-500/10 border-indigo-600/20';
    if (symbol.includes('move')) return 'bg-red-500/10 border-red-600/20';
    
    // Default for unknown coins
    return 'bg-gray-500/10 border-gray-600/20';
  };

  // Get USD value for known coins
  const getUsdValue = (balance: string, type: string) => {
    const symbol = formatCoinType(type).toLowerCase();
    const amount = parseFloat(formatAmount(balance, type));
    
    // Mock price data (in a real app, these would come from an API)
    if (symbol === 'apt') return (amount * 3.25).toFixed(2);
    if (symbol.includes('usdc')) return amount.toFixed(2);
    if (symbol.includes('usdt')) return amount.toFixed(2);
    if (symbol.includes('btc')) return (amount * 67500).toFixed(2);
    if (symbol.includes('eth')) return (amount * 3600).toFixed(2);
    if (symbol.includes('sol')) return (amount * 140).toFixed(2);
    
    return null;
  };
  
  // Order coins: APT first, then by balance value
  const orderedCoins = [...(coins || [])].sort((a, b) => {
    // APT goes first
    if (formatCoinType(a.type).toLowerCase() === 'apt') return -1;
    if (formatCoinType(b.type).toLowerCase() === 'apt') return 1;
    
    // Then sort by balance (high to low)
    const aValue = parseInt(a.balance, 10);
    const bValue = parseInt(b.balance, 10);
    return bValue - aValue;
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-bold">Coin Balances</CardTitle>
        <div className="text-xs text-muted-foreground">
          Showing {orderedCoins?.length || 0} tokens
        </div>
      </CardHeader>
      <CardContent>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full space-y-4"
        >
          {orderedCoins && orderedCoins.length > 0 ? (
            orderedCoins.map((coin, index) => {
              const symbol = formatCoinType(coin.type);
              const amount = formatAmount(coin.balance, coin.type);
              const usdValue = getUsdValue(coin.balance, coin.type);
              const emoji = getCoinEmoji(coin.type);
              const colorClass = getCoinColorClass(coin.type);
              
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 rounded-lg ${colorClass} border flex justify-between items-center`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center text-xl">
                      {emoji}
                    </div>
                    <div>
                      <div className="flex items-center">
                        <h3 className="font-medium text-lg">{symbol}</h3>
                        {symbol.toLowerCase() === 'apt' && (
                          <span className="ml-2 px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-xs">
                            Native
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground font-mono truncate max-w-[180px] md:max-w-[300px]">
                        {coin.type}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-semibold text-lg">{amount}</p>
                    {usdValue && (
                      <p className="text-xs text-muted-foreground">
                        ≈ ${usdValue} USD
                      </p>
                    )}
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-10">
              <Coins className="h-12 w-12 text-muted-foreground/40 mb-3" />
              <h3 className="text-xl font-medium mb-1">No Coins Found</h3>
              <p className="text-muted-foreground text-sm text-center max-w-xs">
                This account doesn't have any coins yet. You can get APT tokens from an exchange or faucet.
              </p>
            </div>
          )}
        </motion.div>
      </CardContent>
    </Card>
  );
};

export default CoinBalances;