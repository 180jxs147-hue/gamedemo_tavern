import React from 'react';
import { Game } from './pages/Game';
import { MainMenu } from './pages/MainMenu';
import { useGameStore } from './store/gameStore';

function App() {
  const { gameState } = useGameStore();

  return (
    <div className="w-screen h-screen bg-[#161211] text-[#e6b36e] overflow-hidden">
      {gameState === 'menu' ? <MainMenu /> : <Game />}
    </div>
  );
}

export default App;
