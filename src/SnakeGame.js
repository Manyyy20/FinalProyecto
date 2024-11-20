import React, { useState, useEffect, useRef } from "react";

const SnakeGame = () => {
    const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
    const [food, setFood] = useState(generateFoodPosition([{ x: 10, y: 10 }]));
    const [direction, setDirection] = useState({ x: 0, y: 0 });
    const [score, setScore] = useState(0);
    const [isGameOver, setIsGameOver] = useState(false);

    const gameAreaRef = useRef(null);

    // Genera una posición válida para la comida
    function generateFoodPosition(currentSnake) {
        let newFood;
        do {
            newFood = { x: Math.floor(Math.random() * 20), y: Math.floor(Math.random() * 20) };
        } while (currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
        return newFood;
    }

    // Maneja la dirección del movimiento
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

    // Lógica de movimiento de la serpiente y colisiones
    useEffect(() => {
        const moveSnake = () => {
            const newSnake = [...snake];
            const head = { x: newSnake[0].x + direction.x, y: newSnake[0].y + direction.y };

            // Verificar colisión con paredes
            if (head.x < 0 || head.x >= 20 || head.y < 0 || head.y >= 20) {
                setIsGameOver(true);
                return;
            }

            // Verificar colisión consigo misma
            if (newSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
                setIsGameOver(true);
                return;
            }

            // Añadir nueva cabeza
            newSnake.unshift(head);

            // Verificar si come comida
            if (head.x === food.x && head.y === food.y) {
                setScore(prevScore => prevScore + 1);
                setFood(generateFoodPosition(newSnake));
            } else {
                // Eliminar la cola si no come
                newSnake.pop();
            }

            setSnake(newSnake);
        };

        if (!isGameOver) {
            const interval = setInterval(moveSnake, 200);
            return () => clearInterval(interval);
        }
    }, [snake, direction, food, isGameOver]);

    return (
        <div>
            {isGameOver ? (
                <div style={{ textAlign: "center" }}>
                    <h1>Game Over</h1>
                    <p>Your score: {score}</p>
                    <button onClick={() => window.location.reload()}>Restart</button>
                </div>
            ) : (
                <div>
                    <h2>Score: {score}</h2>
                    <div
                        ref={gameAreaRef}
                        style={{
                            width: 400,
                            height: 400,
                            background: "lightgray",
                            position: "relative",
                            margin: "auto",
                        }}
                    >
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
                    </div>
                </div>
            )}
        </div>
    );
};

export default SnakeGame;
