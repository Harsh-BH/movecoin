import React from 'react';
import { motion } from 'framer-motion';
import { Check, ChevronDown, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';

const networks = [
  { 
    value: 'mainnet', 
    label: 'Mainnet', 
    description: 'Production network with real APT',
    color: 'bg-green-500'
  },
  { 
    value: 'testnet', 
    label: 'Testnet', 
    description: 'Test network with faucet tokens',
    color: 'bg-blue-500'
  },
  { 
    value: 'devnet', 
    label: 'Devnet', 
    description: 'Development network for testing',
    color: 'bg-purple-500'
  },
];

interface NetworkSelectorProps {
  selectedNetwork: string;
  onNetworkChange: (network: string) => void;
}

const NetworkSelector: React.FC<NetworkSelectorProps> = ({ 
  selectedNetwork, 
  onNetworkChange 
}) => {
  const currentNetwork = networks.find(n => n.value === selectedNetwork) || networks[0];
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="flex items-center gap-2 h-9 px-3 border-border"
        >
          <div className={cn(
            "w-2 h-2 rounded-full",
            currentNetwork.color
          )} />
          <span>{currentNetwork.label}</span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        {networks.map((network) => (
          <DropdownMenuItem
            key={network.value}
            className={cn(
              "flex items-center gap-2 cursor-pointer",
              selectedNetwork === network.value && "bg-accent"
            )}
            onClick={() => onNetworkChange(network.value)}
          >
            <div className="flex items-center gap-2 flex-1">
              <div className={cn(
                "w-2 h-2 rounded-full",
                network.color
              )} />
              <div>
                <p className="text-sm font-medium">{network.label}</p>
                <p className="text-xs text-muted-foreground">{network.description}</p>
              </div>
            </div>
            {selectedNetwork === network.value && (
              <Check className="h-4 w-4" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NetworkSelector;