'use client';

import React, { useState } from 'react';
import { SidebarTrigger } from '../ui/sidebar';
import { Separator } from '../ui/separator';
import { Breadcrumbs } from '../breadcrumbs';
import SearchInput from '../search-input';
import { UserNav } from './user-nav';
import ThemeToggle from './ThemeToggle/theme-toggle';
import { Button } from '../ui/button';
import { MessageSquare } from 'lucide-react';
import { ChatSidebar } from '@/components/chatsidebar/chatsidebar';

export default function Header() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <>
      <header className='flex h-16 shrink-0 items-center justify-between gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12'>
        <div className='flex items-center gap-2 px-4'>
          <SidebarTrigger className='-ml-1' />
          <Separator orientation='vertical' className='mr-2 h-4' />
          <Breadcrumbs />
        </div>

        <div className='flex items-center gap-2 px-4'>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsChatOpen(true)}
            className="text-muted-foreground hover:text-foreground"
            title="Chat Assistant"
          >
            <MessageSquare className="h-5 w-5" />
            <span className="sr-only">Open chat</span>
          </Button>
          <div className='hidden md:flex'>
            <SearchInput />
          </div>
          <UserNav />
          <ThemeToggle />
        </div>
      </header>
      
      <ChatSidebar
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />
    </>
  );
}