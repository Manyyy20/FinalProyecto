import React, { useState } from 'react';
import SnakeGame from './SnakeGame';
import PlayerNameForm from './PlayerNameForm';
import './App.css';

function App() {
  const [playerName, setPlayerName] = useState('');
  const [isGameStarted, setIsGameStarted] = useState(false);

  const startGame = () => {
    setIsGameStarted(true);
  };

  return (
    <div className="App">
      {!isGameStarted ? (
        <PlayerNameForm setPlayerName={setPlayerName} startGame={startGame} />
      ) : (
        <SnakeGame playerName={playerName} />
      )}
    </div>
  );
}

export default App;
