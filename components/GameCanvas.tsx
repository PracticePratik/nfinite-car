import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Car, GameMap, GameState } from '../types';

interface GameCanvasProps {
  selectedCar: Car;
  selectedMap: GameMap;
  onGameOver: (score: number) => void;
  onCoinCollect: () => void;
  isPaused: boolean;
}

// Physics constants
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const ROAD_WIDTH = 400;
const FRICTION = 0.92;
const ACCELERATION = 0.5;

const GameCanvas: React.FC<GameCanvasProps> = ({ 
  selectedCar, 
  selectedMap, 
  onGameOver, 
  onCoinCollect,
  isPaused 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Fixed: Initialize useRef with 0 to satisfy TypeScript "Expected 1 arguments" error
  const requestRef = useRef<number>(0);
  
  // Game state refs (mutable for performance in loop)
  const gameState = useRef({
    carX: CANVAS_WIDTH / 2,
    carY: CANVAS_HEIGHT - 100,
    carVelocityX: 0,
    speed: 0,
    score: 0,
    distance: 0,
    obstacles: [] as { x: number, y: number, width: number, height: number, type: 'block' | 'coin' }[],
    keys: { left: false, right: false, up: false, down: false },
    gameActive: true
  });

  // Handle Input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') gameState.current.keys.left = true;
      if (e.key === 'ArrowRight' || e.key === 'd') gameState.current.keys.right = true;
      if (e.key === 'ArrowUp' || e.key === 'w') gameState.current.keys.up = true;
      if (e.key === 'ArrowDown' || e.key === 's') gameState.current.keys.down = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') gameState.current.keys.left = false;
      if (e.key === 'ArrowRight' || e.key === 'd') gameState.current.keys.right = false;
      if (e.key === 'ArrowUp' || e.key === 'w') gameState.current.keys.up = false;
      if (e.key === 'ArrowDown' || e.key === 's') gameState.current.keys.down = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const spawnObstacle = useCallback(() => {
    const type = Math.random() > 0.8 ? 'coin' : 'block';
    const width = type === 'coin' ? 30 : 60;
    const height = type === 'coin' ? 30 : 40;
    
    // Spawn within road boundaries
    const roadLeft = (CANVAS_WIDTH - ROAD_WIDTH) / 2;
    const x = roadLeft + Math.random() * (ROAD_WIDTH - width);
    
    gameState.current.obstacles.push({
      x,
      y: -100,
      width,
      height,
      type
    });
  }, []);

  const update = useCallback(() => {
    if (isPaused || !gameState.current.gameActive) return;

    const state = gameState.current;
    
    // 1. Car Physics
    // Acceleration based on "up" key (simulating gas pedal)
    // In this vertical scroller, "speed" is the world moving down.
    // Car moves X based on steering.
    
    // Base speed increases slowly over distance
    const baseSpeed = 5 * selectedMap.difficulty + (state.distance * 0.0005);
    state.speed = baseSpeed;

    // Steering Physics (Inertia)
    if (state.keys.left) {
      state.carVelocityX -= selectedCar.handling * 0.1;
    }
    if (state.keys.right) {
      state.carVelocityX += selectedCar.handling * 0.1;
    }

    // Apply Friction to lateral movement
    state.carVelocityX *= FRICTION;
    
    // Update Car Position
    state.carX += state.carVelocityX;

    // Boundary Checks (Bounce off walls with energy loss)
    const roadLeft = (CANVAS_WIDTH - ROAD_WIDTH) / 2;
    const roadRight = roadLeft + ROAD_WIDTH;

    if (state.carX < roadLeft) {
      state.carX = roadLeft;
      state.carVelocityX = -state.carVelocityX * 0.5;
    }
    if (state.carX + selectedCar.width > roadRight) {
      state.carX = roadRight - selectedCar.width;
      state.carVelocityX = -state.carVelocityX * 0.5;
    }

    // 2. Obstacle Logic
    // Spawn logic
    if (Math.random() < 0.02 + (state.distance * 0.000005)) {
      spawnObstacle();
    }

    // Move obstacles
    for (let i = state.obstacles.length - 1; i >= 0; i--) {
      const obs = state.obstacles[i];
      obs.y += state.speed;

      // Collision Detection (AABB)
      const buffer = 5; // Hitbox buffer
      if (
        state.carX < obs.x + obs.width - buffer &&
        state.carX + selectedCar.width > obs.x + buffer &&
        state.carY < obs.y + obs.height - buffer &&
        state.carY + selectedCar.height > obs.y + buffer
      ) {
        if (obs.type === 'coin') {
          // Collect Coin
          state.score += 50;
          onCoinCollect();
          state.obstacles.splice(i, 1);
        } else {
          // Crash
          state.gameActive = false;
          onGameOver(state.score);
        }
      } else if (obs.y > CANVAS_HEIGHT) {
        // Remove off-screen
        state.obstacles.splice(i, 1);
        if (obs.type === 'block') state.score += 1;
      }
    }

    // 3. Update Global State
    state.distance += state.speed;

  }, [isPaused, selectedCar, selectedMap, onGameOver, onCoinCollect, spawnObstacle]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const state = gameState.current;

    // Clear Screen
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw Background Grid (Perspective Effect)
    ctx.save();
    ctx.strokeStyle = selectedMap.gridColor;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.3;
    
    // Moving Vertical Lines
    const roadLeft = (CANVAS_WIDTH - ROAD_WIDTH) / 2;
    const roadRight = roadLeft + ROAD_WIDTH;
    
    // Road Borders
    ctx.beginPath();
    ctx.moveTo(roadLeft, 0);
    ctx.lineTo(roadLeft, CANVAS_HEIGHT);
    ctx.moveTo(roadRight, 0);
    ctx.lineTo(roadRight, CANVAS_HEIGHT);
    ctx.lineWidth = 4;
    ctx.strokeStyle = selectedMap.roadColor;
    ctx.shadowBlur = 15;
    ctx.shadowColor = selectedMap.roadColor;
    ctx.stroke();
    
    // Moving Horizontal Lines (to create speed illusion)
    const gridSize = 40;
    const offset = state.distance % gridSize;
    
    ctx.shadowBlur = 0;
    ctx.lineWidth = 1;
    ctx.strokeStyle = selectedMap.gridColor;
    
    for (let y = offset; y < CANVAS_HEIGHT; y += gridSize) {
      ctx.beginPath();
      // Only draw grid within road or full screen? Let's do full screen perspective
      // To keep it simple 2D top down, we just draw lines.
      // To make it look "fast", we can make the side lines slant, but strict 2D is requested
      // for "infinite" simplicity. Let's stick to vertical scroller.
      ctx.moveTo(0, y);
      ctx.lineTo(CANVAS_WIDTH, y);
      ctx.stroke();
    }
    ctx.restore();

    // Draw Obstacles
    state.obstacles.forEach(obs => {
      ctx.save();
      if (obs.type === 'coin') {
        ctx.fillStyle = '#fbbf24';
        ctx.shadowColor = '#fbbf24';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(obs.x + obs.width/2, obs.y + obs.height/2, obs.width/2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('$', obs.x + obs.width/2, obs.y + obs.height/2);
      } else {
        ctx.fillStyle = selectedMap.obstacleColor;
        ctx.shadowColor = selectedMap.obstacleColor;
        ctx.shadowBlur = 10;
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
        
        // Block Detail
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(obs.x + 4, obs.y + 4, obs.width - 8, obs.height - 8);
      }
      ctx.restore();
    });

    // Draw Car
    ctx.save();
    ctx.translate(state.carX + selectedCar.width / 2, state.carY + selectedCar.height / 2);
    // Tilt car visually when turning
    const tilt = state.carVelocityX * 0.05;
    ctx.rotate(tilt);
    
    // Car Body
    ctx.shadowColor = selectedCar.glowColor;
    ctx.shadowBlur = 20;
    ctx.fillStyle = selectedCar.color;
    // Simple Sports Car Shape
    ctx.beginPath();
    // Main chassis
    ctx.rect(-selectedCar.width/2, -selectedCar.height/2, selectedCar.width, selectedCar.height);
    ctx.fill();
    
    // Windshield
    ctx.fillStyle = '#000';
    ctx.shadowBlur = 0;
    ctx.fillRect(-selectedCar.width/2 + 4, -selectedCar.height/4, selectedCar.width - 8, 10);
    
    // Rear Lights (Trails)
    ctx.fillStyle = '#ef4444';
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 15;
    ctx.fillRect(-selectedCar.width/2 + 2, selectedCar.height/2 - 4, 8, 4);
    ctx.fillRect(selectedCar.width/2 - 10, selectedCar.height/2 - 4, 8, 4);

    ctx.restore();

    // UI Overlay on Canvas (Score)
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 24px Orbitron';
    ctx.textAlign = 'left';
    ctx.fillText(`SCORE: ${Math.floor(state.score)}`, 20, 40);

  }, [selectedCar, selectedMap]);

  // Main Loop
  useEffect(() => {
    const loop = (time: number) => {
      update();
      draw();
      requestRef.current = requestAnimationFrame(loop);
    };
    requestRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(requestRef.current!);
  }, [update, draw]);

  return (
    <div className="relative border-4 border-blue-500 rounded-lg overflow-hidden shadow-[0_0_20px_rgba(59,130,246,0.5)]">
       <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="block bg-slate-900"
      />
      {/* Mobile Controls Overlay */}
      <div className="absolute bottom-4 left-4 right-4 flex justify-between md:hidden pointer-events-none">
          <div className="pointer-events-auto bg-white/10 backdrop-blur p-4 rounded-full active:bg-white/30 transition" onTouchStart={() => {gameState.current.keys.left = true}} onTouchEnd={() => {gameState.current.keys.left = false}}>◀</div>
          <div className="pointer-events-auto bg-white/10 backdrop-blur p-4 rounded-full active:bg-white/30 transition" onTouchStart={() => {gameState.current.keys.right = true}} onTouchEnd={() => {gameState.current.keys.right = false}}>▶</div>
      </div>
    </div>
  );
};

export default GameCanvas;