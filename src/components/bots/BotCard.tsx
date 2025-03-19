"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { StarIcon, Users } from "lucide-react";
import { BOTS, CATEGORIES, Bot } from "@/constants/bot-constant";

// Bot Card Component
const BotCard: React.FC<{ bot: Bot }> = ({ bot }) => {
  const router = useRouter();

  const handleConnectBot = () => {
    // Navigate to the bot's dedicated page
    router.push(`/dashboard/bots/${bot.id}`);
  };

  return (
    <Card className="overflow-hidden">
      <div className="relative h-40 bg-muted">
        <img 
          src={bot.image || "/placeholder.png"} 
          alt={bot.name} 
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/placeholder.png";
          }} 
        />
        {bot.featured && (
          <Badge variant="default" className="absolute top-2 right-2 bg-primary">
            Featured
          </Badge>
        )}
        {bot.new && (
          <Badge variant="outline" className="absolute top-2 right-2 bg-green-500 text-white border-0">
            New
          </Badge>
        )}
      </div>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle>{bot.name}</CardTitle>
          <Badge variant="outline" className="ml-2">
            {bot.category}
          </Badge>
        </div>
        <CardDescription>{bot.username}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="line-clamp-3 text-sm text-muted-foreground">{bot.description}</p>
        <div className="flex flex-wrap gap-1 mt-3">
          {bot.tags.map(tag => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-3">
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center">
            <StarIcon className="h-4 w-4 fill-yellow-400 stroke-yellow-400 mr-1" />
            <span className="text-sm">{bot.rating.toFixed(1)}</span>
          </div>
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-1" />
            <span className="text-sm">{bot.users.toLocaleString()} users</span>
          </div>
        </div>
        <Button className="w-full" onClick={handleConnectBot}>
          Connect with Bot
        </Button>
      </CardFooter>
    </Card>
  );
};

// Rest of the BotMarketplace component remains unchanged