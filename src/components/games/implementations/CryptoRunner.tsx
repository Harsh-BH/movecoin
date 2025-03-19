"use client";

import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { GameType } from "@/constants/game-constant";
import { Coins as CoinsIcon } from "lucide-react";

interface CryptoRunnerProps {
  game: GameType;
  onScoreUpdate?: (score: number) => void;
  onGameEnd?: () => void;
}

export function CryptoRunner({ game, onScoreUpdate, onGameEnd }: CryptoRunnerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Use refs to track values inside the game loop without causing re-renders
  const scoreRef = useRef(0);
  const coinsRef = useRef(0);

  // Game logic
  useEffect(() => {
    if (!canvasRef.current || !isPlaying) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Reset refs to match state
    scoreRef.current = score;
    coinsRef.current = coins;

    // Game variables
    let animationFrameId: number;
    let gameSpeed = 6;
    const gravity = 0.5;

    // Canvas dimensions
    const setCanvasSize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);

    // Player
    const player = {
      x: 50,
      y: canvas.height - 150,
      width: 40,
      height: 50,
      velocity: 0,
      jumping: false,
      draw() {
        ctx.fillStyle = '#4c1d95';
        ctx.fillRect(this.x, this.y, this.width, this.height);
      },
      update() {
        // Apply gravity
        this.velocity += gravity;
        this.y += this.velocity;

        // Floor collision
        if (this.y + this.height > canvas.height - 50) {
          this.y = canvas.height - this.height - 50;
          this.velocity = 0;
          this.jumping = false;
        }
      },
      jump() {
        if (!this.jumping) {
          this.velocity = -12;
          this.jumping = true;
        }
      }
    };

    // Obstacles
    const obstacles: Array<{ x: number, y: number, width: number, height: number, isCoin: boolean }> = [];
    const obstacleProps = {
      minWidth: 20,
      maxWidth: 60,
      minHeight: 40,
      maxHeight: 100,
      minGap: 300,
      maxGap: 600
    };

    let lastObstacleX = canvas.width;
    let frameCount = 0;

    const addObstacle = () => {
      const width = Math.random() * (obstacleProps.maxWidth - obstacleProps.minWidth) + obstacleProps.minWidth;
      const height = Math.random() * (obstacleProps.maxHeight - obstacleProps.minHeight) + obstacleProps.minHeight;
      const isCoin = Math.random() > 0.7; // 30% chance of spawning a coin

      obstacles.push({
        x: lastObstacleX + Math.random() * (obstacleProps.maxGap - obstacleProps.minGap) + obstacleProps.minGap,
        y: isCoin ? canvas.height - 120 - height : canvas.height - height - 50, // Position coins a bit higher
        width,
        height,
        isCoin
      });

      lastObstacleX = obstacles[obstacles.length - 1].x;
    };

    // Add initial obstacles
    for (let i = 0; i < 5; i++) {
      addObstacle();
    }

    // Update score without causing re-renders
    const updateGameScore = () => {
      scoreRef.current += 1;
      
      // Update React state (and parent) less frequently to avoid perf issues
      if (scoreRef.current % 10 === 0) {
        setScore(scoreRef.current);
        if (onScoreUpdate) {
          onScoreUpdate(scoreRef.current);
        }
      }
    };

    // Update coin count
    const collectCoin = () => {
      coinsRef.current += 1;
      setCoins(coinsRef.current);
    };

    // Game loop
    const gameLoop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw background
      ctx.fillStyle = '#dbeafe';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw ground
      ctx.fillStyle = '#e5e7eb';
      ctx.fillRect(0, canvas.height - 50, canvas.width, 50);

      // Update and draw player
      player.update();
      player.draw();

      // Update and draw obstacles
      for (let i = 0; i < obstacles.length; i++) {
        const obstacle = obstacles[i];
        obstacle.x -= gameSpeed;

        // Draw obstacle or coin
        if (obstacle.isCoin) {
          // Draw coin
          ctx.fillStyle = '#fbbf24';
          ctx.beginPath();
          ctx.arc(obstacle.x + obstacle.width / 2, obstacle.y + obstacle.height / 2, 15, 0, Math.PI * 2);
          ctx.fill();
          
          // Coin border
          ctx.strokeStyle = '#d97706';
          ctx.lineWidth = 2;
          ctx.stroke();
          
          // Coin shine effect
          ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
          ctx.beginPath();
          ctx.arc(
            obstacle.x + obstacle.width / 2 - 5,
            obstacle.y + obstacle.height / 2 - 5,
            5,
            0,
            Math.PI * 2
          );
          ctx.fill();
        } else {
          // Draw obstacle
          ctx.fillStyle = '#ef4444';
          ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
          
          // Obstacle pattern
          ctx.fillStyle = '#b91c1c';
          ctx.fillRect(obstacle.x + 5, obstacle.y + 5, obstacle.width - 10, obstacle.height - 10);
        }

        // Collision detection
        if (
          player.x < obstacle.x + obstacle.width &&
          player.x + player.width > obstacle.x &&
          player.y < obstacle.y + obstacle.height &&
          player.y + player.height > obstacle.y
        ) {
          if (obstacle.isCoin) {
            // Collect coin
            collectCoin();
            obstacles.splice(i, 1);
            i--;
          } else {
            // Game over on obstacle collision
            cancelAnimationFrame(animationFrameId);
            
            // Draw crash effect
            ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Update state after a short delay to show the crash
            setTimeout(() => {
              setIsGameOver(true);
              setIsPlaying(false);
              // Update final score in parent
              if (onScoreUpdate) onScoreUpdate(scoreRef.current);
              // Notify parent component about game end
              if (onGameEnd) onGameEnd();
            }, 100);
            
            return;
          }
        }

        // Remove obstacles that are off screen
        if (obstacle.x + obstacle.width < 0) {
          obstacles.splice(i, 1);
          i--;
        }
      }

      // Add new obstacle when needed
      if (obstacles.length < 5) {
        addObstacle();
      }

      // Update score
      frameCount++;
      if (frameCount % 5 === 0) {
        updateGameScore();
      }

      // Increase game speed over time
      if (frameCount % 500 === 0) {
        gameSpeed += 0.5;
      }
      
      // Draw score and coins in game too
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText(`Score: ${scoreRef.current}`, 10, 25);
      ctx.fillText(`Coins: ${coinsRef.current}`, canvas.width - 100, 25);

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    // Keyboard controls
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.key === 'ArrowUp') {
        player.jump();
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    // Touch controls
    const handleTap = () => {
      player.jump();
    };
    
    canvas.addEventListener('click', handleTap);
    canvas.addEventListener('touchstart', handleTap);

    // Start game loop
    animationFrameId = requestAnimationFrame(gameLoop);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', setCanvasSize);
      canvas.removeEventListener('click', handleTap);
      canvas.removeEventListener('touchstart', handleTap);
    };
  }, [isPlaying, onScoreUpdate, onGameEnd]); // Removed score from dependencies

  const startGame = () => {
    setScore(0);
    setCoins(0);
    scoreRef.current = 0; // Reset ref too
    coinsRef.current = 0; // Reset ref too
    setIsGameOver(false);
    setIsPlaying(true);
  };

  return (
  
    <div className="flex flex-col h-full">
      <div className="p-4 flex justify-between items-center bg-muted/30">
        <div className="text-lg font-bold">Score: {score}</div>
        <div className="flex items-center text-lg font-bold">
          <CoinsIcon className="h-5 w-5 mr-2 text-yellow-500" />
          {coins}
        </div>
      </div>
      
      <div className="flex-1 relative">
        {!isPlaying && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 z-10">
            {isGameOver ? (
              <>
                <h2 className="text-2xl font-bold mb-2">Game Over!</h2>
                <p className="text-lg mb-4">Final Score: {score}</p>
                <p className="text-lg mb-6">Coins Collected: {coins}</p>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold mb-6">Crypto Runner</h2>
                <p className="text-center mb-4 max-w-md">
                  Jump over obstacles and collect coins! Press Space or tap to jump.
                </p>
              </>
            )}
            <Button onClick={startGame} size="lg">
              {isGameOver ? "Play Again" : "Start Game"}
            </Button>
          </div>
        )}
        <canvas 
          ref={canvasRef}
          className="w-full h-full bg-sky-100"
        ></canvas>
      </div>
      
      <div className="p-4 text-center text-sm text-muted-foreground">
        Press Space or tap to jump
      </div>
    </div>
    
  );
}