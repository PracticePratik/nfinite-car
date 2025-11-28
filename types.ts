export enum AppMode {
  MENU = 'MENU',
  GAME = 'GAME',
  EDITOR = 'EDITOR'
}

export interface Car {
  id: string;
  name: string;
  color: string;
  glowColor: string;
  speed: number;
  handling: number; // Higher is tighter turning
  width: number;
  height: number;
}

export interface GameMap {
  id: string;
  name: string;
  gridColor: string;
  roadColor: string;
  obstacleColor: string;
  difficulty: number; // Multiplier for speed increase
}

export interface GameState {
  score: number;
  coins: number;
  isGameOver: boolean;
  isPaused: boolean;
}
