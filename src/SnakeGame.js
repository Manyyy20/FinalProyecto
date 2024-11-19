// src/SnakeGame.js
import React, { useState, useEffect, useRef } from 'react';

const SnakeGame = () => {
    const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
    const [food, setFood] = useState({ x: 15, y: 15 });
    const [direction, setDirection] = useState({ x: 0, y: 0 });
    const [score, setScore] = useState(0);

    const gameAreaRef = useRef(null);

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
        const moveSnake = () => {
            const newSnake = [...snake];
            const head = { x: newSnake[0].x + direction.x, y: newSnake[0].y + direction.y };

            newSnake.unshift(head);
            if (head.x === food.x && head.y === food.y) {
                setScore(score + 1);
                setFood({ x: Math.floor(Math.random() * 20), y: Math.floor(Math.random() * 20) });
            } else {
                newSnake.pop();
            }

            setSnake(newSnake);
        };

        const interval = setInterval(moveSnake, 200);
        return () => clearInterval(interval);
    }, [snake, direction, food, score]);

    return (
        <div ref={gameAreaRef} style={{ width: 400, height: 400, background: "lightgray", position: "relative" }}>
            {snake.map((segment, index) => (
                <div
                    key={index}
                    style={{
                        position: "absolute",
                        width: 20,
                        height: 20,
                        background: "green",
                        left: segment.x * 20,
                        top: segment.y * 20,
                    }}
                />
            ))}
            <div
                style={{
                    position: "absolute",
                    width: 20,
                    height: 20,
                    background: "red",
                    left: food.x * 20,
                    top: food.y * 20,
                }}
            />
            <div>Score: {score}</div>
        </div>
    );
};

export default SnakeGame;
