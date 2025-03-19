"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { GameType } from "@/constants/game-constant";
import { Coins } from "lucide-react";

interface TokenTetrisProps {
  game: GameType;
}

export function TokenTetris({ game }: TokenTetrisProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [tokens, setTokens] = useState(0);
  const [level, setLevel] = useState(1);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Constants for the game
  const BLOCK_SIZE = 30;
  const BOARD_WIDTH = 10;
  const BOARD_HEIGHT = 20;
  
  // Tetromino shapes with crypto symbols/colors
  const TETROMINOES = [
    // I - Bitcoin (orange)
    {
      shape: [
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
      ],
      color: '#f7931a' // Bitcoin orange
    },
    // J - Ethereum (blue-purple)
    {
      shape: [
        [2, 0, 0],
        [2, 2, 2],
        [0, 0, 0]
      ],
      color: '#627eea' // Ethereum blue
    },
    // L - Solana (purple)
    {
      shape: [
        [0, 0, 3],
        [3, 3, 3],
        [0, 0, 0]
      ],
      color: '#9945ff' // Solana purple
    },
    // O - USDC (blue)
    {
      shape: [
        [4, 4],
        [4, 4]
      ],
      color: '#2775ca' // USDC blue
    },
    // S - Polygon (purple)
    {
      shape: [
        [0, 5, 5],
        [5, 5, 0],
        [0, 0, 0]
      ],
      color: '#8247e5' // Polygon purple
    },
    // T - Cardano (blue)
    {
      shape: [
        [0, 6, 0],
        [6, 6, 6],
        [0, 0, 0]
      ],
      color: '#0033ad' // Cardano blue
    },
    // Z - Dogecoin (yellow)
    {
      shape: [
        [7, 7, 0],
        [0, 7, 7],
        [0, 0, 0]
      ],
      color: '#c2a633' // Dogecoin yellow
    }
  ];

  useEffect(() => {
    if (!canvasRef.current || !isPlaying || isPaused) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size based on block size and board dimensions
    canvas.width = BLOCK_SIZE * BOARD_WIDTH;
    canvas.height = BLOCK_SIZE * BOARD_HEIGHT;

    // Game variables
    let board = Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(0));
    let requestId: number;
    let dropCounter = 0;
    let dropInterval = 1000 - (level * 50); // Speed increases with level
    let lastTime = 0;
    let tokenDropCounter = 0; // Counter for dropping tokens
    
    // Current piece
    let currentPiece = {
      position: { x: 0, y: 0 },
      tetromino: TETROMINOES[Math.floor(Math.random() * TETROMINOES.length)],
    };
    
    // Reset piece to top
    const resetPiece = () => {
      currentPiece.tetromino = TETROMINOES[Math.floor(Math.random() * TETROMINOES.length)];
      currentPiece.position = { 
        x: Math.floor(BOARD_WIDTH / 2) - Math.floor(currentPiece.tetromino.shape[0].length / 2),
        y: 0 
      };

      // Game over check - if piece collides immediately
      if (checkCollision()) {
        cancelAnimationFrame(requestId);
        setIsGameOver(true);
        setIsPlaying(false);
      }
    };

    // Initialize first piece
    resetPiece();

    // Check for collision
    const checkCollision = () => {
      const shape = currentPiece.tetromino.shape;
      for (let y = 0; y < shape.length; y++) {
        for (let x = 0; x < shape[y].length; x++) {
          if (shape[y][x] !== 0) {
            const boardX = x + currentPiece.position.x;
            const boardY = y + currentPiece.position.y;
            
            // Check boundaries
            if (
              boardX < 0 || 
              boardX >= BOARD_WIDTH || 
              boardY >= BOARD_HEIGHT ||
              // Check collision with other pieces
              (boardY >= 0 && board[boardY][boardX] !== 0)
            ) {
              return true;
            }
          }
        }
      }
      return false;
    };

    // Merge piece onto board
    const mergePiece = () => {
      const shape = currentPiece.tetromino.shape;
      for (let y = 0; y < shape.length; y++) {
        for (let x = 0; x < shape[y].length; x++) {
          if (shape[y][x] !== 0) {
            const boardY = y + currentPiece.position.y;
            const boardX = x + currentPiece.position.x;
            if (boardY >= 0) {
              board[boardY][boardX] = shape[y][x];
            }
          }
        }
      }
    };

    // Check and clear completed lines
    const clearLines = () => {
      let linesCleared = 0;

      for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
        if (board[y].every(value => value !== 0)) {
          // Clear the line
          board.splice(y, 1);
          board.unshift(Array(BOARD_WIDTH).fill(0));
          linesCleared++;
          y++; // Check same row again after shifting
        }
      }

      if (linesCleared > 0) {
        // Update score based on lines cleared (with bonus for multiple lines)
        const linePoints = [0, 40, 100, 300, 1200];
        setScore(prevScore => prevScore + linePoints[linesCleared] * level);
        
        // Add tokens for cleared lines
        if (linesCleared >= 2) {
          setTokens(prevTokens => prevTokens + linesCleared - 1);
        }
        
        // Increase level every 10 lines
        tokenDropCounter += linesCleared;
        if (tokenDropCounter >= 10) {
          tokenDropCounter = 0;
          setLevel(prevLevel => prevLevel + 1);
        }
      }
    };

    // Move piece
    const movePiece = (direction: { x: number; y: number }) => {
      currentPiece.position.x += direction.x;
      currentPiece.position.y += direction.y;
      
      // If collision, revert move
      if (checkCollision()) {
        currentPiece.position.x -= direction.x;
        currentPiece.position.y -= direction.y;
        
        // If trying to move down and collision, lock piece
        if (direction.y > 0) {
          mergePiece();
          clearLines();
          resetPiece();
        }
        
        return false;
      }
      return true;
    };

    // Rotate piece
    const rotatePiece = () => {
      const oldShape = currentPiece.tetromino.shape;
      const rotated = Array(oldShape.length).fill(null).map(() => Array(oldShape[0].length).fill(0));
      
      // Transpose matrix
      for (let y = 0; y < oldShape.length; y++) {
        for (let x = 0; x < oldShape[y].length; x++) {
          rotated[x][oldShape.length - 1 - y] = oldShape[y][x];
        }
      }
      
      // Save old shape
      const oldTetromino = currentPiece.tetromino;
      currentPiece.tetromino = {
        ...oldTetromino,
        shape: rotated
      };
      
      // If collision, revert rotation
      if (checkCollision()) {
        currentPiece.tetromino = oldTetromino;
      }
    };

    // Draw game board
    const draw = () => {
      // Clear canvas
      ctx.fillStyle = '#f8fafc'; // Light background
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw grid lines
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 0.5;
      
      for (let x = 0; x <= BOARD_WIDTH; x++) {
        ctx.beginPath();
        ctx.moveTo(x * BLOCK_SIZE, 0);
        ctx.lineTo(x * BLOCK_SIZE, canvas.height);
        ctx.stroke();
      }
      
      for (let y = 0; y <= BOARD_HEIGHT; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * BLOCK_SIZE);
        ctx.lineTo(canvas.width, y * BLOCK_SIZE);
        ctx.stroke();
      }
      
      // Draw board
      for (let y = 0; y < BOARD_HEIGHT; y++) {
        for (let x = 0; x < BOARD_WIDTH; x++) {
          if (board[y][x] !== 0) {
            const colorIndex = board[y][x] - 1;
            ctx.fillStyle = TETROMINOES[colorIndex].color;
            ctx.fillRect(
              x * BLOCK_SIZE, 
              y * BLOCK_SIZE, 
              BLOCK_SIZE, 
              BLOCK_SIZE
            );
            
            // Draw block border
            ctx.strokeStyle = '#0f172a';
            ctx.lineWidth = 1;
            ctx.strokeRect(
              x * BLOCK_SIZE, 
              y * BLOCK_SIZE, 
              BLOCK_SIZE, 
              BLOCK_SIZE
            );
          }
        }
      }
      
      // Draw current piece
      const shape = currentPiece.tetromino.shape;
      for (let y = 0; y < shape.length; y++) {
        for (let x = 0; x < shape[y].length; x++) {
          if (shape[y][x] !== 0) {
            const boardX = x + currentPiece.position.x;
            const boardY = y + currentPiece.position.y;
            
            if (boardY >= 0) {
              ctx.fillStyle = currentPiece.tetromino.color;
              ctx.fillRect(
                boardX * BLOCK_SIZE, 
                boardY * BLOCK_SIZE, 
                BLOCK_SIZE, 
                BLOCK_SIZE
              );
              
              // Draw block border
              ctx.strokeStyle = '#0f172a';
              ctx.lineWidth = 1;
              ctx.strokeRect(
                boardX * BLOCK_SIZE, 
                boardY * BLOCK_SIZE, 
                BLOCK_SIZE, 
                BLOCK_SIZE
              );
              
              // Draw crypto symbol (simplified)
              ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
              ctx.beginPath();
              ctx.arc(
                boardX * BLOCK_SIZE + BLOCK_SIZE / 2,
                boardY * BLOCK_SIZE + BLOCK_SIZE / 2,
                BLOCK_SIZE / 4,
                0,
                Math.PI * 2
              );
              ctx.fill();
            }
          }
        }
      }
    };

    // Game loop
    const update = (time = 0) => {
      const deltaTime = time - lastTime;
      lastTime = time;

      dropCounter += deltaTime;
      if (dropCounter > dropInterval) {
        movePiece({ x: 0, y: 1 });
        dropCounter = 0;
      }

      draw();
      requestId = requestAnimationFrame(update);
    };

    // Keyboard controls
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        movePiece({ x: -1, y: 0 });
      } else if (e.key === 'ArrowRight') {
        movePiece({ x: 1, y: 0 });
      } else if (e.key === 'ArrowDown') {
        movePiece({ x: 0, y: 1 });
      } else if (e.key === 'ArrowUp') {
        rotatePiece();
      } else if (e.key === ' ') { // Hard drop
        while (movePiece({ x: 0, y: 1 })) {
          // Keep moving down until collision
        }
      } else if (e.key === 'p') {
        setIsPaused(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    // Touch controls (simplified)
    let touchStartX = 0;
    let touchStartY = 0;
    
    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      if (!touchStartX || !touchStartY) return;
      
      const touchEndX = e.touches[0].clientX;
      const touchEndY = e.touches[0].clientY;
      
      const diffX = touchStartX - touchEndX;
      const diffY = touchStartY - touchEndY;
      
      // Horizontal swipe
      if (Math.abs(diffX) > Math.abs(diffY)) {
        if (diffX > 10) {
          movePiece({ x: -1, y: 0 }); // Left
        } else if (diffX < -10) {
          movePiece({ x: 1, y: 0 }); // Right
        }
      } 
      // Vertical swipe
      else {
        if (diffY > 10) {
          rotatePiece(); // Up - rotate
        } else if (diffY < -10) {
          movePiece({ x: 0, y: 1 }); // Down
        }
      }
      
      touchStartX = touchEndX;
      touchStartY = touchEndY;
    };
    
    const handleTouchEnd = () => {
      touchStartX = 0;
      touchStartY = 0;
    };
    
    const handleDoubleTap = () => {
      while (movePiece({ x: 0, y: 1 })) {
        // Hard drop
      }
    };
    
    canvas.addEventListener('touchstart', handleTouchStart);
    canvas.addEventListener('touchmove', handleTouchMove);
    canvas.addEventListener('touchend', handleTouchEnd);
    canvas.addEventListener('dblclick', handleDoubleTap);

    // Start game loop
    requestId = requestAnimationFrame(update);

    // Cleanup
    return () => {
      cancelAnimationFrame(requestId);
      window.removeEventListener('keydown', handleKeyDown);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
      canvas.removeEventListener('dblclick', handleDoubleTap);
    };
  }, [isPlaying, isPaused, level]);

  const startGame = () => {
    setScore(0);
    setTokens(0);
    setLevel(1);
    setIsGameOver(false);
    setIsPlaying(true);
    setIsPaused(false);
  };

  const togglePause = () => {
    setIsPaused(prev => !prev);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 flex justify-between items-center bg-muted/30">
        <div className="flex items-center gap-4">
          <div className="text-lg font-bold">Score: {score}</div>
          <div className="text-lg">Level: {level}</div>
        </div>
        <div className="flex items-center text-lg font-bold">
          <Coins className="h-5 w-5 mr-2 text-yellow-500" />
          {tokens}
        </div>
      </div>
      
      <div className="flex-1 relative">
        {(!isPlaying || isPaused) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 z-10">
            {isGameOver ? (
              <>
                <h2 className="text-2xl font-bold mb-2">Game Over!</h2>
                <p className="text-lg mb-4">Final Score: {score}</p>
                <p className="text-lg mb-6">Tokens Collected: {tokens}</p>
              </>
            ) : isPaused ? (
              <>
                <h2 className="text-2xl font-bold mb-6">Game Paused</h2>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold mb-6">Token Tetris</h2>
                <p className="text-center mb-4 max-w-md">
                  Stack crypto blocks and clear lines to earn tokens!
                </p>
              </>
            )}
            <Button onClick={isGameOver || !isPlaying ? startGame : togglePause} size="lg">
              {isGameOver ? "Play Again" : isPaused ? "Resume" : "Start Game"}
            </Button>
          </div>
        )}
        <div className="flex justify-center items-center h-full bg-slate-50">
          <canvas 
            ref={canvasRef}
            className="border border-slate-300 shadow-md"
          />
        </div>
      </div>
      
      <div className="p-4 text-center text-sm text-muted-foreground">
        <p>Controls: Arrow keys to move, Up to rotate, Space for hard drop</p>
        <p className="mt-1">Mobile: Swipe left/right/down, tap to rotate, double tap for hard drop</p>
      </div>
    </div>
  );
}