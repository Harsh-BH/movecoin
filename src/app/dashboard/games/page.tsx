"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LayoutGrid, List } from "lucide-react";
import { GameCard } from "@/components/games/GameCard";
import { games } from "@/constants/game-constant";

export default function GamesMarketplace() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [category, setCategory] = useState<string>("all");

  const filteredGames = category === "all" 
    ? games 
    : games.filter(game => game.category === category);

  const categories = ["all", ...new Set(games.map(game => game.category))];

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Games Marketplace</h1>
          <p className="text-muted-foreground mt-2">
            Play games, earn rewards, and track your crypto investments
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant={viewMode === "grid" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("grid")}
          >
            <LayoutGrid className="h-4 w-4 mr-2" />
            Grid
          </Button>
          <Button 
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4 mr-2" />
            List
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Categories</CardTitle>
          </CardHeader>
          <CardContent className="space-x-2">
            {categories.map((cat) => (
              <Badge 
                key={cat}
                className="cursor-pointer"
                variant={category === cat ? "default" : "outline"}
                onClick={() => setCategory(cat)}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </Badge>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className={`${
        viewMode === "grid" 
          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" 
          : "space-y-4"
      }`}>
        {filteredGames.map((game) => (
          <GameCard 
            key={game.id} 
            game={game} 
            viewMode={viewMode}
          />
        ))}
      </div>
    </div>
  );
}