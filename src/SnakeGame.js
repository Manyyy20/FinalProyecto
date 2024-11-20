import React, { useState, useEffect, useRef, useCallback } from "react";
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

    return (
        <div className="game-area">
            <Snake segments={snake} />
            <Food position={food} />
            <div className="score-area">
                <p>Score: {score}</p>
                {isGameOver && <p className="game-over">Game Over</p>}
            </div>
        </div>
    );
};

export default SnakeGame; // Exportación por defecto
