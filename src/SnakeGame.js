import React, { useState, useEffect, useCallback } from "react";
import Snake from "./Snake";
import Food from "./Food";
import "./SnakeGame.css";

const gridSize = 20;

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

    const saveScore = useCallback(async () => {
        try {
            const response = await fetch("https://snakegameappservice.azurewebsites.net/api/addScore", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ playerName, score }),
            });
            // Handle response if needed
        } catch (error) {
            console.error("Error saving score:", error);
        }
    }, [playerName, score]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            switch (e.key) {
                case "ArrowUp":
                    setDirection({ x: 0, y: -1 });
                    break;
                case "ArrowDown":
                    setDirection({ x: 0, y: 1 });
                    break;
                case "ArrowLeft":
                    setDirection({ x: -1, y: 0 });
                    break;
                case "ArrowRight":
                    setDirection({ x: 1, y: 0 });
                    break;
                default:
                    break;
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    useEffect(() => {
        if (isGameOver) {
            saveScore();
        }
    }, [isGameOver, saveScore]);

    useEffect(() => {
        const interval = setInterval(() => {
            setSnake((prevSnake) => {
                const newHead = {
                    x: prevSnake[0].x + direction.x,
                    y: prevSnake[0].y + direction.y,
                };

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
