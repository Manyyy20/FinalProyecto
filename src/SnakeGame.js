import React, { useState, useEffect, useRef, useCallback } from "react";

// Función para generar la posición de la comida
const generateFoodPosition = (snake) => {
    let newFood;
    do {
        newFood = {
            x: Math.floor(Math.random() * 20),
            y: Math.floor(Math.random() * 20),
        };
    } while (snake.some((segment) => segment.x === newFood.x && segment.y === newFood.y));
    return newFood;
};

const SnakeGame = () => {
    const [state, setState] = useState({
        snake: [{ x: 10, y: 10 }],
        food: generateFoodPosition([{ x: 10, y: 10 }]),
        direction: { x: 0, y: 0 },
        score: 0,
        isGameOver: false,
    });

    const gameAreaRef = useRef(null);

    const handleKeyDown = useCallback((e) => {
        const directionMap = {
            ArrowUp: { x: 0, y: -1 },
            ArrowDown: { x: 0, y: 1 },
            ArrowLeft: { x: -1, y: 0 },
            ArrowRight: { x: 1, y: 0 },
        };

        const newDirection = directionMap[e.key];
        if (newDirection && (newDirection.x !== -state.direction.x || newDirection.y !== -state.direction.y)) {
            setState((prevState) => ({ ...prevState, direction: newDirection }));
        }
    }, [state.direction]);

    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [handleKeyDown]);

    // Rest of the game logic...

    return (
        <div ref={gameAreaRef}>
            {/* Render game area */}
        </div>
    );
};

export default SnakeGame;