// SnakeGame.js
import React, { useState, useEffect, useRef, useCallback } from "react";
import Snake from "./Snake";
import Food from "./Food";

// Función para generar la posición de la comida
const generateFoodPosition = (snake, gridSize = 20) => {
    const grid = Array(gridSize)
        .fill(null)
        .flatMap((_, x) => Array(gridSize).fill(null).map((_, y) => ({ x, y })));

    const freeCells = grid.filter(
        (cell) => !snake.some((segment) => segment.x === cell.x && segment.y === cell.y)
    );

    if (freeCells.length === 0) {
        return null; // No hay espacio para colocar comida
    }

    return freeCells[Math.floor(Math.random() * freeCells.length)];
};

const SnakeGame = () => {
    const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
    const [food, setFood] = useState(generateFoodPosition([{ x: 10, y: 10 }]));
    const [direction, setDirection] = useState({ x: 0, y: 0 });
    const [score, setScore] = useState(0);
    const [isGameOver, setIsGameOver] = useState(false);
    const gameAreaRef = useRef(null);

    const handleKeyDown = useCallback((e) => {
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
    }, [direction]);

    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [handleKeyDown]);

    useEffect(() => {
        if (isGameOver) return;

        const interval = setInterval(() => {
            setSnake((prevSnake) => {
                const newHead = {
                    x: (prevSnake[0].x + direction.x + 20) % 20,
                    y: (prevSnake[0].y + direction.y + 20) % 20,
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
                    setFood(generateFoodPosition(newSnake));
                } else {
                    newSnake.pop();
                }

                return newSnake;
            });
        }, 200);

        return () => clearInterval(interval);
    }, [direction, food, isGameOver]);

    return (
        <div ref={gameAreaRef} style={{ width: "400px", height: "400px", position: "relative" }}>
            <Snake segments={snake} />
            <Food position={food} />
            <div>Score: {score}</div>
            {isGameOver && <div>Game Over</div>}
        </div>
    );
};

export default SnakeGame;

// Snake.js
import React from "react";

const Snake = ({ segments }) => {
    return (
        <>
            {segments.map((segment, index) => (
                <div
                    key={index}
                    style={{
                        position: "absolute",
                        width: "20px",
                        height: "20px",
                        backgroundColor: "green",
                        top: `${segment.y * 20}px`,
                        left: `${segment.x * 20}px`,
                    }}
                />
            ))}
        </>
    );
};

export default Snake;

// Food.js
import React from "react";

const Food = ({ position }) => {
    return position ? (
        <div
            style={{
                position: "absolute",
                width: "20px",
                height: "20px",
                backgroundColor: "red",
                top: `${position.y * 20}px`,
                left: `${position.x * 20}px`,
            }}
        />
    ) : null;
};

export default Food;
