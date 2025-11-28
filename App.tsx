import React, { useState } from 'react';
import GameCanvas from './components/GameCanvas';
import GameMenu from './components/GameMenu';
import ImageEditor from './components/ImageEditor';
import { AppMode, Car, GameMap } from './types';

// Constants Data
const CARS: Car[] = [
  { id: 'c1', name: 'Cyber Stream', color: '#06b6d4', glowColor: '#22d3ee', speed: 8, handling: 6, width: 40, height: 70 },
  { id: 'c2', name: 'Crimson Fury', color: '#ef4444', glowColor: '#f87171', speed: 10, handling: 4, width: 42, height: 72 },
  { id: 'c3', name: 'Void Phantom', color: '#a855f7', glowColor: '#c084fc', speed: 9, handling: 8, width: 38, height: 68 },
  { id: 'c4', name: 'Lime Strike', color: '#84cc16', glowColor: '#a3e635', speed: 8.5, handling: 7, width: 40, height: 70 },
];

const MAPS: GameMap[] = [
  { id: 'm1', name: 'Neon Highway', gridColor: '#e879f9', roadColor: '#a21caf', obstacleColor: '#4c1d95', difficulty: 1 },
  { id: 'm2', name: 'Grid Zero', gridColor: '#22d3ee', roadColor: '#0e7490', obstacleColor: '#164e63', difficulty: 1.5 },
  { id: 'm3', name: 'Solar Flare', gridColor: '#facc15', roadColor: '#a16207', obstacleColor: '#7f1d1d', difficulty: 2 },
];

function App() {
  const [mode, setMode] = useState<AppMode>(AppMode.MENU);
  const [selectedCar, setSelectedCar] = useState<Car>(CARS[0]);
  const [selectedMap, setSelectedMap] = useState<GameMap>(MAPS[0]);
  const [lastScore, setLastScore] = useState<number>(0);
  const [totalCoins, setTotalCoins] = useState<number>(0);

  const handleGameOver = (score: number) => {
    setLastScore(score);
    // Simple delay before going back to menu
    setTimeout(() => {
        alert(`GAME OVER\nScore: ${Math.floor(score)}\nCoins Collected in session: ${totalCoins}`); // Simple feedback, could be better UI
        setMode(AppMode.MENU);
        setTotalCoins(0);
    }, 100);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0f172a] to-black text-white relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
         <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-purple-900/20 rounded-full blur-[100px]"></div>
         <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] bg-cyan-900/20 rounded-full blur-[100px]"></div>
      </div>

      {/* Navigation Bar */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6 border-b border-white/10 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-tr from-cyan-400 to-purple-500 rounded rotate-45"></div>
          <span className="text-xl font-neon font-bold tracking-widest">NANO BANANA</span>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => setMode(AppMode.MENU)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${mode === AppMode.MENU || mode === AppMode.GAME ? 'text-cyan-400 bg-cyan-950/50 border border-cyan-800' : 'text-slate-400 hover:text-white'}`}
          >
            NEON RACER
          </button>
          <button 
            onClick={() => setMode(AppMode.EDITOR)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${mode === AppMode.EDITOR ? 'text-pink-400 bg-pink-950/50 border border-pink-800' : 'text-slate-400 hover:text-white'}`}
          >
            IMAGE STUDIO
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="relative z-10 container mx-auto pt-8 pb-12">
        {mode === AppMode.EDITOR && (
          <ImageEditor />
        )}

        {mode === AppMode.MENU && (
          <GameMenu 
            cars={CARS}
            maps={MAPS}
            selectedCar={selectedCar}
            selectedMap={selectedMap}
            onSelectCar={setSelectedCar}
            onSelectMap={setSelectedMap}
            onStart={() => setMode(AppMode.GAME)}
          />
        )}

        {mode === AppMode.GAME && (
          <div className="flex flex-col items-center">
            <div className="mb-4 flex gap-8 font-neon text-lg text-cyan-300">
               <div>CAR: {selectedCar.name}</div>
               <div>SECTOR: {selectedMap.name}</div>
            </div>
            <GameCanvas 
              selectedCar={selectedCar}
              selectedMap={selectedMap}
              onGameOver={handleGameOver}
              onCoinCollect={() => setTotalCoins(prev => prev + 1)}
              isPaused={false}
            />
            <div className="mt-6 text-slate-500 text-sm">
              Controls: Arrow Keys or WASD to Move. Dodge Blocks. Collect Coins.
            </div>
            <button 
                onClick={() => setMode(AppMode.MENU)}
                className="mt-4 text-red-400 hover:text-red-300 underline"
            >
                Abort Run
            </button>
          </div>
        )}
      </main>

    </div>
  );
}

export default App;
