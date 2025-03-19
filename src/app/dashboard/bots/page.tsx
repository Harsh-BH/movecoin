"use client";

import React, { useState } from 'react';
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
import { useRouter } from 'next/navigation';
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
import { isBotImplemented } from "@/lib/bot-registry"; // Import the registry helper

// Bot Card Component
const BotCard: React.FC<{ bot: Bot }> = ({ bot }) => {
    const router = useRouter();
  
    const handleConnectBot = () => {
      // Check if bot is implemented before navigating
      if (isBotImplemented(bot.id)) {
        // Navigate to the bot's dedicated page
        router.push(`/dashboard/bots/${bot.id}`);
      } else {
        // Could show a notification that the bot is coming soon
        alert("This bot is coming soon!");
      }
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
          <Button 
            className="w-full" 
            onClick={handleConnectBot}
            variant={isBotImplemented(bot.id) ? "default" : "secondary"}
          >
            {isBotImplemented(bot.id) ? "Connect with Bot" : "Coming Soon"}
          </Button>
        </CardFooter>
      </Card>
    );
  };

// Rest of the BotMarketplace component remains the same

const BotMarketplace: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");

  // Filter bots based on search and category
  const filteredBots = BOTS.filter(bot => {
    const matchesSearch = bot.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         bot.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bot.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === "All Categories" || bot.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Popular bots (sorted by users)
  const popularBots = [...BOTS].sort((a, b) => b.users - a.users).slice(0, 6);
  
  // Featured bots
  const featuredBots = BOTS.filter(bot => bot.featured);
  
  // New arrivals
  const newArrivals = BOTS.filter(bot => bot.new);

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Telegram AI Bot Marketplace</h1>
          <p className="text-muted-foreground mt-1">
            Discover and connect with powerful AI bots for your Telegram experience
          </p>
        </div>
        <Button variant="outline">Submit Your Bot</Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Search bots by name, description, or tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <Select
          value={selectedCategory}
          onValueChange={setSelectedCategory}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="all" className="mb-8">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Bots</TabsTrigger>
          <TabsTrigger value="featured">Featured</TabsTrigger>
          <TabsTrigger value="popular">Most Popular</TabsTrigger>
          <TabsTrigger value="new">New Arrivals</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBots.length > 0 ? (
              filteredBots.map((bot) => (
                <BotCard key={bot.id} bot={bot} />
              ))
            ) : (
              <div className="col-span-full text-center py-10">
                <p className="text-lg text-muted-foreground">No bots found matching your search criteria.</p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="featured" className="mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredBots.filter(bot => {
              const matchesSearch = bot.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                  bot.description.toLowerCase().includes(searchTerm.toLowerCase());
              const matchesCategory = selectedCategory === "All Categories" || bot.category === selectedCategory;
              return matchesSearch && matchesCategory;
            }).map((bot) => (
              <BotCard key={bot.id} bot={bot} />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="popular" className="mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularBots.filter(bot => {
              const matchesSearch = bot.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                  bot.description.toLowerCase().includes(searchTerm.toLowerCase());
              const matchesCategory = selectedCategory === "All Categories" || bot.category === selectedCategory;
              return matchesSearch && matchesCategory;
            }).map((bot) => (
              <BotCard key={bot.id} bot={bot} />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="new" className="mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {newArrivals.filter(bot => {
              const matchesSearch = bot.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                  bot.description.toLowerCase().includes(searchTerm.toLowerCase());
              const matchesCategory = selectedCategory === "All Categories" || bot.category === selectedCategory;
              return matchesSearch && matchesCategory;
            }).map((bot) => (
              <BotCard key={bot.id} bot={bot} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BotMarketplace;