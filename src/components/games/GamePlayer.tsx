"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CryptoRunner } from "@/components/games/implementations/CryptoRunner";
import { TokenTetris } from "@/components/games/implementations/TokenTetris";
import { Button } from "@/components/ui/button";
import { GameType } from "@/constants/game-constant";
import { X } from "lucide-react";

interface GamePlayerProps {
  game: GameType;
  isOpen: boolean;
  onClose: () => void;
}

export function GamePlayer({ game, isOpen, onClose }: GamePlayerProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[90vw] w-[800px] h-[80vh] max-h-[800px]">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>{game.title}</DialogTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden rounded-lg border bg-background">
          {game.id === "1" && <CryptoRunner game={game} />}
          {game.id === "4" && <TokenTetris game={game} />}
          {game.id !== "1" && game.id !== "4" && (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <h3 className="text-lg font-medium">Coming Soon</h3>
                <p className="text-muted-foreground">
                  This game is under development and will be available soon!
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}