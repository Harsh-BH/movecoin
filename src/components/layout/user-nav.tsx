
'use client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { Copy, ExternalLink, LogOut, Wallet } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export function UserNav() {
  const { account, wallet, connected, disconnect } = useWallet();
  const { toast } = useToast();
  
  // Function to truncate wallet address for display
  const shortenAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };
  
  // Function to copy wallet address to clipboard
  const copyAddressToClipboard = () => {
    if (account?.address) {
      navigator.clipboard.writeText(account.address.toString());
      toast({
        title: "Address copied",
        description: "Wallet address copied to clipboard",
      });
    }
  };
  
  if (connected && account) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' className='relative h-8 w-8 rounded-full'>
            <Avatar className='h-8 w-8'>
              <AvatarImage
                src={wallet?.icon || ''}
                alt={wallet?.name || ''}
              />
              <AvatarFallback className="bg-primary text-primary-foreground">
                <Wallet className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className='w-56' align='end' forceMount>
          <DropdownMenuLabel className='font-normal'>
            <div className='flex flex-col space-y-1'>
              <p className='text-sm font-medium leading-none'>
                {wallet?.name || 'Connected Wallet'}
              </p>
              <p className='text-xs leading-none text-muted-foreground'>
                {shortenAddress(account.address.toString())}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={copyAddressToClipboard}>
              <Copy className="mr-2 h-4 w-4" />
              <span>Copy Address</span>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a 
                href={`https://explorer.aptoslabs.com/account/${account.address.toString()}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                <span>View on Explorer</span>
              </a>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => disconnect()}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Disconnect Wallet</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }
  
  // Show connect button if not connected
  return (
    <Button 
      variant="outline" 
      size="sm" 
      className="flex items-center gap-2"
      onClick={() => document.getElementById('connect-wallet-button')?.click()}
    >
      <Wallet className="h-4 w-4" />
      <span>Connect</span>
    </Button>
  );
}