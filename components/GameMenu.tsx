import React from 'react';
import { Car, GameMap } from '../types';

interface GameMenuProps {
  cars: Car[];
  maps: GameMap[];
  selectedCar: Car;
  selectedMap: GameMap;
  onSelectCar: (car: Car) => void;
  onSelectMap: (map: GameMap) => void;
  onStart: () => void;
}

const GameMenu: React.FC<GameMenuProps> = ({
  cars,
  maps,
  selectedCar,
  selectedMap,
  onSelectCar,
  onSelectMap,
  onStart
}) => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-slate-900/90 backdrop-blur border border-pink-500/30 rounded-2xl p-8 shadow-[0_0_50px_rgba(236,72,153,0.2)]">
        <h1 className="text-5xl font-neon text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 font-black text-center mb-12 animate-pulse">
          NEON DRIFT INFINITY
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
          {/* Car Selection */}
          <div>
            <h3 className="text-xl font-bold text-pink-400 mb-6 flex items-center gap-2">
              <span className="w-2 h-8 bg-pink-500 rounded-full"></span>
              SELECT VEHICLE
            </h3>
            <div className="space-y-4">
              {cars.map(car => (
                <button
                  key={car.id}
                  onClick={() => onSelectCar(car)}
                  className={`w-full p-4 rounded-xl border flex items-center justify-between transition-all group
                    ${selectedCar.id === car.id 
                      ? 'bg-pink-500/10 border-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.3)]' 
                      : 'bg-slate-800/50 border-slate-700 hover:border-pink-500/50'
                    }
                  `}
                >
                  <div className="flex items-center gap-4">
                     <div 
                        className="w-12 h-8 rounded shadow-lg"
                        style={{ backgroundColor: car.color, boxShadow: `0 0 10px ${car.glowColor}` }}
                     ></div>
                     <div className="text-left">
                       <div className="font-bold text-white group-hover:text-pink-300 transition-colors">{car.name}</div>
                       <div className="text-xs text-slate-400">Handling: {Math.round(car.handling * 10)}/10</div>
                     </div>
                  </div>
                  {selectedCar.id === car.id && (
                    <div className="w-3 h-3 bg-pink-500 rounded-full animate-ping"></div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Map Selection */}
          <div>
            <h3 className="text-xl font-bold text-cyan-400 mb-6 flex items-center gap-2">
              <span className="w-2 h-8 bg-cyan-500 rounded-full"></span>
              SELECT SECTOR
            </h3>
            <div className="space-y-4">
              {maps.map(map => (
                <button
                  key={map.id}
                  onClick={() => onSelectMap(map)}
                  className={`w-full p-4 rounded-xl border flex items-center justify-between transition-all group
                    ${selectedMap.id === map.id 
                      ? 'bg-cyan-500/10 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.3)]' 
                      : 'bg-slate-800/50 border-slate-700 hover:border-cyan-500/50'
                    }
                  `}
                >
                  <div className="text-left">
                    <div className="font-bold text-white group-hover:text-cyan-300 transition-colors">{map.name}</div>
                    <div className="text-xs text-slate-400">Difficulty: {map.difficulty}x</div>
                  </div>
                  <div 
                    className="w-8 h-8 rounded border-2"
                    style={{ borderColor: map.gridColor, backgroundColor: `${map.roadColor}40` }}
                  ></div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <button 
          onClick={onStart}
          className="w-full py-6 bg-gradient-to-r from-pink-600 to-purple-600 rounded-xl font-neon text-2xl font-bold tracking-[0.2em] hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-xl shadow-purple-900/50 hover:shadow-purple-500/40"
        >
          INITIATE RUN
        </button>
      </div>
    </div>
  );
};

export default GameMenu;
