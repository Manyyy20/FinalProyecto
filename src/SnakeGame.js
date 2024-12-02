import React, { useState, useEffect, useCallback } from "react";
import Snake from "./Snake";
import Food from "./Food";
import "./SnakeGame.css";

const gridSize = 20;

// Genera una nueva posición para la comida
const generateFoodPosition = (snake, gridSize) => {
    const isPositionOccupied = (position) => {
        return snake.some(segment => segment.x === position.x && segment.y === position.y);
    };

    let newFood;
    do {
        newFood = {
            x: Math.floor(Math.random() * gridSize),
            y: Math.floor(Math.random() * gridSize),
        };
    } while (isPositionOccupied(newFood));

    return newFood;
};

const SnakeGame = ({ playerName }) => {
    const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
    const [food, setFood] = useState(generateFoodPosition([{ x: 10, y: 10 }], gridSize));
    const [direction, setDirection] = useState({ x: 1, y: 0 });
    const [score, setScore] = useState(0);
    const [isGameOver, setIsGameOver] = useState(false);

    // Función para guardar el puntaje
    const saveScore = useCallback(async () => {
        try {
            const response = await fetch("/api/addscore", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ playerName, score }),
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.status} ${response.statusText}`);
            }
            const data = await response.json();
            console.log("Score saved successfully:", data);
        } catch (error) {
            console.error("Error saving score:", error);
        }
    }, [playerName, score]);

    // Maneja las teclas para cambiar la dirección de la serpiente
    useEffect(() => {
        const handleKeyDown = (e) => {
            switch (e.key) {
                case "ArrowUp":
                    if (direction.y !== 1) setDirection({ x: 0, y: -1 });
                    break;
                case "ArrowDown":
                    if (direction.y !== -1) setDirection({ x: 0, y: 1 });
                    break;
                case "ArrowLeft":
                    if (direction.x !== 1) setDirection({ x: -1, y: 0 });
                    break;
                case "ArrowRight":
                    if (direction.x !== -1) setDirection({ x: 1, y: 0 });
                    break;
                default:
                    break;
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [direction]);

    // Guarda el puntaje cuando el juego termina
    useEffect(() => {
        if (isGameOver) {
            saveScore();
        }
    }, [isGameOver, saveScore]);

    // Lógica principal del juego
    useEffect(() => {
        const interval = setInterval(() => {
            setSnake((prevSnake) => {
                const newHead = {
                    x: prevSnake[0].x + direction.x,
                    y: prevSnake[0].y + direction.y,
                };

                // Verifica si el juego termina
                if (
                    newHead.x < 0 ||
                    newHead.y < 0 ||
                    newHead.x >= gridSize ||
                    newHead.y >= gridSize ||
                    prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)
                ) {
                    setIsGameOver(true);
                    clearInterval(interval);
                    return prevSnake;
                }

                const newSnake = [newHead, ...prevSnake];

                // Verifica si la serpiente comió la comida
                if (newHead.x === food.x && newHead.y === food.y) {
                    setScore((prevScore) => prevScore + 10);
                    setFood(generateFoodPosition(newSnake, gridSize));
                } else {
                    newSnake.pop();
                }

                return newSnake;
            });
        }, 200);

        return () => clearInterval(interval);
    }, [direction, food]);

    // Reinicia el juego
    const handleRestart = () => {
        setSnake([{ x: 10, y: 10 }]);
        setFood(generateFoodPosition([{ x: 10, y: 10 }], gridSize));
        setDirection({ x: 1, y: 0 });
        setScore(0);
        setIsGameOver(false);
    };

    return (
        <div className="game-container">
            <h1>Snake Game</h1>
            <p>Score: {score}</p>
            {isGameOver && (
                <div>
                    <h2>Game Over!</h2>
                    <button onClick={handleRestart}>Restart</button>
                </div>
            )}
            <div className="grid">
                <Snake segments={snake} />
                <Food position={food} />
            </div>
        </div>
    );
};

export default SnakeGame;
