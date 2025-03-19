'use client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  useSidebar
} from '@/components/ui/sidebar';
import { navItems } from '@/constants/data';
import {
  BadgeCheck,
  Bell,
  ChevronRight,
  ChevronsUpDown,
  CreditCard,
  GalleryVerticalEnd,
  LogOut,
  Wallet,
  Copy,
  ExternalLink
} from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as React from 'react';
import { Icons } from '../icons';
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

export const company = {
  name: 'MoveCoin',
  logo: GalleryVerticalEnd,
  plan: 'Blockchain'
};

export default function AppSidebar() {
  // Wallet integration
  const { account, wallet, connected, disconnect } = useWallet();
  const { toast } = useToast();
  const pathname = usePathname();
  const { state, isMobile } = useSidebar();
  
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

  return (
    <Sidebar collapsible='icon'>
      <SidebarHeader>
        <div className='text-sidebar-accent-foreground flex gap-2 py-2'>
          <div className='bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg'>
            <company.logo className='size-4' />
          </div>
          <div className='grid flex-1 text-left text-sm leading-tight'>
            <span className='truncate font-semibold'>{company.name}</span>
            <span className='truncate text-xs'>{company.plan}</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className='overflow-x-hidden'>
        <SidebarGroup>
          <SidebarGroupLabel>Overview</SidebarGroupLabel>
          <SidebarMenu>
            {navItems.map((item) => {
              const Icon = item.icon ? Icons[item.icon] : Icons.logo;
              return item?.items && item?.items?.length > 0 ? (
                <Collapsible
                  key={item.title}
                  asChild
                  defaultOpen={item.isActive}
                  className='group/collapsible'
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        tooltip={item.title}
                        isActive={pathname === item.url}
                      >
                        {item.icon && <Icon />}
                        <span>{item.title}</span>
                        <ChevronRight className='ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items?.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton
                              asChild
                              isActive={pathname === subItem.url}
                            >
                              <Link href={subItem.url}>
                                <span>{subItem.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              ) : (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    isActive={pathname === item.url}
                  >
                    <Link href={item.url}>
                      <Icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size='lg'
                  className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
                >
                  <Avatar className='h-8 w-8 rounded-lg'>
                    <AvatarImage src={wallet?.icon || ''} alt={wallet?.name || ''} />
                    <AvatarFallback className='rounded-lg bg-primary text-primary-foreground'>
                      <Wallet className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className='grid flex-1 text-left text-sm leading-tight'>
                    <span className='truncate font-semibold'>
                      {connected ? wallet?.name || 'Connected' : 'Not Connected'}
                    </span>
                    <span className='truncate text-xs'>
                      {connected && account?.address 
                        ? shortenAddress(account.address.toString()) 
                        : 'Connect wallet'}
                    </span>
                  </div>
                  <ChevronsUpDown className='ml-auto size-4' />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className='w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg'
                side='bottom'
                align='end'
                sideOffset={4}
              >
                <DropdownMenuLabel className='p-0 font-normal'>
                  <div className='flex items-center gap-2 px-1 py-1.5 text-left text-sm'>
                    <Avatar className='h-8 w-8 rounded-lg'>
                      <AvatarImage src={wallet?.icon || ''} alt={wallet?.name || ''} />
                      <AvatarFallback className='rounded-lg bg-primary text-primary-foreground'>
                        <Wallet className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className='grid flex-1 text-left text-sm leading-tight'>
                      <span className='truncate font-semibold'>
                        {wallet?.name || 'Wallet'}
                      </span>
                      {connected && account?.address && (
                        <span className='truncate text-xs'>
                          {shortenAddress(account.address.toString())}
                        </span>
                      )}
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                {connected && account?.address && (
                  <>
                    <DropdownMenuGroup>
                      <DropdownMenuItem onClick={copyAddressToClipboard}>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Address
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <a 
                          href={`https://explorer.aptoslabs.com/account/${account.address.toString()}`}
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="flex items-center"
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View on Explorer
                        </a>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <BadgeCheck className="h-4 w-4 mr-2" />
                        Account
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => disconnect()}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Disconnect Wallet
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}