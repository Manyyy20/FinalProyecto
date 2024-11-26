import React, { useState, useEffect, useCallback } from "react";
import Snake from "./Snake";
import Food from "./Food";
import "./SnakeGame.css"; // Importar estilos CSS

const generateFoodPosition = (snake, gridSize = 20) => {
    const grid = Array(gridSize)
        .fill(null)
        .flatMap((_, x) => Array(gridSize).fill(null).map((_, y) => ({ x, y })));

    const freeCells = grid.filter(
        (cell) => !snake.some((segment) => segment.x === cell.x && segment.y === cell.y)
    );

    if (freeCells.length === 0) {
        return null; // No hay espacio disponible para generar comida
    }

    return freeCells[Math.floor(Math.random() * freeCells.length)];
};

const SnakeGame = () => {
    const gridSize = 20; // Tamaño de la cuadrícula
    const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
    const [food, setFood] = useState(generateFoodPosition([{ x: 10, y: 10 }], gridSize));
    const [direction, setDirection] = useState({ x: 1, y: 0 });
    const [score, setScore] = useState(0);
    const [isGameOver, setIsGameOver] = useState(false);
    const [playerName, setPlayerName] = useState(""); // Estado para el nombre del jugador

    // Guardar puntaje en la base de datos
    const saveScore = async () => {
        try {
            const response = await fetch("https://snakegameappservice.azurewebsites.net/api/addScore", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ playerName, score }),
            });

            if (response.ok) {
                console.log("Score saved successfully.");
            } else {
                console.error("Failed to save score.");
            }
        } catch (error) {
            console.error("Error saving score:", error);
        }
    };

    const handleKeyDown = useCallback(
        (e) => {
            const directionMap = {
                ArrowUp: { x: 0, y: -1 },
                ArrowDown: { x: 0, y: 1 },
                ArrowLeft: { x: -1, y: 0 },
                ArrowRight: { x: 1, y: 0 },
            };

            const newDirection = directionMap[e.key];
            if (newDirection && (newDirection.x !== -direction.x || newDirection.y !== -direction.y)) {
                setDirection(newDirection);
            }
        },
        [direction]
    );

    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [handleKeyDown]);

    useEffect(() => {
        if (isGameOver) {
            saveScore(); // Guardar puntaje al finalizar
            return;
        }

        const interval = setInterval(() => {
            setSnake((prevSnake) => {
                const newHead = {
                    x: (prevSnake[0].x + direction.x + gridSize) % gridSize,
                    y: (prevSnake[0].y + direction.y + gridSize) % gridSize,
                };

                const collision = prevSnake.some(
                    (segment) => segment.x === newHead.x && segment.y === newHead.y
                );

                if (collision) {
                    setIsGameOver(true);
                    clearInterval(interval);
                    return prevSnake;
                }

                const newSnake = [newHead, ...prevSnake];

                if (newHead.x === food.x && newHead.y === food.y) {
                    setScore((prevScore) => prevScore + 1);
                    setFood(generateFoodPosition(newSnake, gridSize));
                } else {
                    newSnake.pop();
                }

                return newSnake;
            });
        }, 200);

        return () => clearInterval(interval);
    }, [direction, food, isGameOver]);

    const handleStartGame = () => {
        if (!playerName.trim()) {
            alert("Please enter your name to start the game!");
            return;
        }
        setIsGameOver(false);
        setScore(0);
        setSnake([{ x: 10, y: 10 }]);
        setFood(generateFoodPosition([{ x: 10, y: 10 }], gridSize));
        setDirection({ x: 1, y: 0 });
    };

    return (
        <div className="game-area">
            {isGameOver && (
                <div className="game-over-screen">
                    <p>Game Over</p>
                    <button onClick={handleStartGame}>Restart</button>
                </div>
            )}
            {!playerName && !isGameOver && (
                <div className="player-name-input">
                    <input
                        type="text"
                        placeholder="Enter your name"
                        value={playerName}
                        onChange={(e) => setPlayerName(e.target.value)}
                    />
                    <button onClick={handleStartGame}>Start Game</button>
                </div>
            )}
            {playerName && !isGameOver && (
                <>
                    <Snake segments={snake} />
                    <Food position={food} />
                    <div className="score-area">
                        <p>Score: {score}</p>
                    </div>
                </>
            )}
        </div>
    );
};

export default SnakeGame;
