"use client";

import { useState, useEffect } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  BarChart3,
  Clock,
  Coins,
  GamepadIcon,
  Trophy,
  TrendingUp,
  Users,
  X,
  Check,
  AlertTriangle
} from "lucide-react";
import { GameType } from "@/constants/game-constant";
import { useToast } from "@/components/ui/use-toast";

// Import game implementations (to be created)
import { CryptoRunner } from "./implementations/CryptoRunner";
import { TokenTetris } from "./implementations/TokenTetris";

interface GameCardProps {
  game: GameType;
  viewMode: "grid" | "list";
}

export function GameCard({ game, viewMode }: GameCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(30 * 60); // 30 minutes in seconds
  const [gameScore, setGameScore] = useState(0);
  const [showRewardDialog, setShowRewardDialog] = useState(false);
  const [earnedTokens, setEarnedTokens] = useState(0);
  const { toast } = useToast();

  // Calculate play fee based on crypto investment (just an example calculation)
  const playFee = (game.userStats.cryptoInvested * 0.05).toFixed(4);

  // Handle timer countdown when game is active
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlaying && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          // If time is up, end the game
          if (prev <= 1) {
            setIsPlaying(false);
            toast({
              title: "Time's up!",
              description: "Your play session has expired.",
              variant: "destructive",
            });
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, timeRemaining, toast]);

  // Format time remaining as mm:ss
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Process payment and start game
  const handlePayment = () => {
    setProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setProcessing(false);
      setShowPaymentDialog(false);
      setTimeRemaining(30 * 60); // Reset timer to 30 minutes
      setIsPlaying(true);
      
      toast({
        title: "Payment Successful",
        description: `You've unlocked ${game.title} for 30 minutes!`,
        variant: "default",
      });
    }, 1500);
  };

  // Handle score update from game components
  const handleScoreUpdate = (score: number) => {
    setGameScore(score);
    
    // Check if score qualifies for rewards (>1000)
    if (score > 1000) {
      // Calculate tokens based on score
      const tokens = Math.floor(score / 500); // 2 tokens per 1000 points
      setEarnedTokens(tokens);
    }
  };

  // Handle game end
  const handleGameEnd = () => {
    setIsPlaying(false);
    
    // Show reward dialog if score > 1000
    if (gameScore > 1000) {
      setShowRewardDialog(true);
    }
  };
  
  // Claim rewards
  const claimRewards = () => {
    toast({
      title: "Rewards Claimed!",
      description: `${earnedTokens} tokens have been added to your wallet.`,
      variant: "success",
    });
    setShowRewardDialog(false);
    setGameScore(0);
    setEarnedTokens(0);
  };

  // Function to render the appropriate game component based on game ID
  const renderGame = () => {
    switch (game.id) {
      case "1": // Crypto Runner
        return <CryptoRunner 
          game={game} 
          onScoreUpdate={handleScoreUpdate} 
          onGameEnd={handleGameEnd}
        />;
      case "4": // Token Tetris
        return <TokenTetris 
          game={game}
          onScoreUpdate={handleScoreUpdate}
          onGameEnd={handleGameEnd}
        />;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <GamepadIcon className="h-16 w-16 text-muted mb-4" />
            <h3 className="text-2xl font-bold mb-2">Game Coming Soon</h3>
            <p className="text-muted-foreground mb-4">This game is currently in development.</p>
            <Button onClick={() => setIsPlaying(false)}>Return to Marketplace</Button>
          </div>
        );
    }
  };

  // If playing a game, show the game component
  if (isPlaying) {
    return (
      <div className="fixed inset-0 z-50 bg-background p-4 flex flex-col overflow-hidden">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">{game.title}</h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1 text-amber-500" />
              <span className="text-sm font-medium">Time: {formatTime(timeRemaining)}</span>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsPlaying(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
        <div className="flex-1 overflow-hidden">
          {renderGame()}
        </div>
      </div>
    );
  }

  return (
    <>
      <Card className={viewMode === "list" ? "flex overflow-hidden" : ""}>
        <div className={viewMode === "list" ? "w-1/3 relative" : "relative pt-[56.25%]"}>
          <div className={`${
            viewMode === "list" 
              ? "absolute inset-0" 
              : "absolute top-0 left-0 w-full h-full"
          } bg-gradient-to-br from-purple-500 to-indigo-700 flex items-center justify-center`}>
            <GamepadIcon className="h-16 w-16 text-white opacity-50" />
          </div>
          <Badge className="absolute top-2 right-2">{game.category}</Badge>
        </div>

        <div className={viewMode === "list" ? "w-2/3" : ""}>
          <CardHeader>
            <CardTitle>{game.title}</CardTitle>
            <CardDescription>{game.description}</CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Coins className="h-4 w-4" />
              <span>Investment: {game.userStats.cryptoInvested} {game.userStats.currency}</span>
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <Button onClick={() => setShowPaymentDialog(true)}>Play Now</Button>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Analytics
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                  <DialogTitle>{game.title} - User Analytics</DialogTitle>
                  <DialogDescription>
                    Your gameplay statistics and crypto investments
                  </DialogDescription>
                </DialogHeader>
                
                <Tabs defaultValue="stats" className="mt-4">
                  <TabsList className="grid grid-cols-2">
                    <TabsTrigger value="stats">Statistics</TabsTrigger>
                    <TabsTrigger value="investments">Investments</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="stats" className="space-y-4 mt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2 p-4 border rounded-lg">
                        <Trophy className="h-8 w-8 text-amber-500" />
                        <div>
                          <p className="text-sm font-medium">High Score</p>
                          <p className="text-2xl font-bold">{game.userStats.highScore.toLocaleString()}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 p-4 border rounded-lg">
                        <TrendingUp className="h-8 w-8 text-emerald-500" />
                        <div>
                          <p className="text-sm font-medium">Global Rank</p>
                          <p className="text-2xl font-bold">#{game.userStats.rank}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 p-4 border rounded-lg col-span-2">
                        <Users className="h-8 w-8 text-blue-500" />
                        <div>
                          <p className="text-sm font-medium">Time Played</p>
                          <p className="text-2xl font-bold">{game.userStats.timePlayed}</p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="investments" className="space-y-4 mt-4">
                    <div className="p-4 border rounded-lg">
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Total Investment</p>
                          <p className="text-2xl font-bold">{game.userStats.cryptoInvested} {game.userStats.currency}</p>
                        </div>
                        <Coins className="h-12 w-12 text-yellow-500" />
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Investment History</p>
                        <div className="text-sm text-muted-foreground">
                          <div className="flex justify-between py-1 border-b">
                            <span>Initial Purchase</span>
                            <span>{(game.userStats.cryptoInvested * 0.6).toFixed(3)} {game.userStats.currency}</span>
                          </div>
                          <div className="flex justify-between py-1 border-b">
                            <span>Game Credits</span>
                            <span>{(game.userStats.cryptoInvested * 0.25).toFixed(3)} {game.userStats.currency}</span>
                          </div>
                          <div className="flex justify-between py-1">
                            <span>Special Items</span>
                            <span>{(game.userStats.cryptoInvested * 0.15).toFixed(3)} {game.userStats.currency}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </DialogContent>
            </Dialog>
          </CardFooter>
        </div>
      </Card>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Unlock {game.title}</DialogTitle>
            <DialogDescription>
              Pay a small fee to play this game for 30 minutes
            </DialogDescription>
          </DialogHeader>
          
          <div className="p-4 border rounded-lg my-4">
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Play Fee</p>
                <p className="text-2xl font-bold">{playFee} {game.userStats.currency}</p>
              </div>
              <GamepadIcon className="h-10 w-10 text-primary" />
            </div>
            
            <div className="space-y-2">
              <p className="text-sm">Unlocks 30 minutes of gameplay</p>
              <p className="text-sm">Score 1000+ points to earn rewards!</p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>Cancel</Button>
            <Button onClick={handlePayment} disabled={processing}>
              {processing ? (
                <>
                  <span className="animate-pulse mr-2">Processing</span>
                  <span className="loading loading-spinner loading-xs"></span>
                </>
              ) : (
                <>Pay Now</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reward Dialog */}
      <AlertDialog open={showRewardDialog} onOpenChange={setShowRewardDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trophy className="h-6 w-6 text-yellow-500" />
              Congratulations!
            </AlertDialogTitle>
            <AlertDialogDescription>
              You scored {gameScore} points and earned {earnedTokens} tokens!
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4 flex flex-col items-center">
            <div className="flex items-center gap-2 mb-4">
              <Coins className="h-10 w-10 text-yellow-500" />
              <span className="text-3xl font-bold">{earnedTokens}</span>
            </div>
            <Progress value={Math.min((gameScore / 5000) * 100, 100)} className="w-full mb-2" />
            <span className="text-xs text-muted-foreground">Score more than 5000 to earn maximum rewards</span>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
            <AlertDialogAction onClick={claimRewards}>
              <Check className="mr-2 h-4 w-4" /> Claim Tokens
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}