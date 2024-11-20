const SnakeGame = () => {
    const gridSize = 20;
    const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
    const [food, setFood] = useState(generateFoodPosition([{ x: 10, y: 10 }], gridSize));
    const [direction, setDirection] = useState({ x: 1, y: 0 }); // Dirección inicial válida
    const [score, setScore] = useState(0);
    const [isGameOver, setIsGameOver] = useState(false);
    const [isGameStarted, setIsGameStarted] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setSnake((prevSnake) => {
                const newHead = {
                    x: (prevSnake[0].x + direction.x + gridSize) % gridSize,
                    y: (prevSnake[0].y + direction.y + gridSize) % gridSize,
                };

                // Ignorar colisiones antes de que el juego comience
                if (!isGameStarted) {
                    setIsGameStarted(true);
                    return [newHead];
                }

                // Detectar colisión con el cuerpo
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
    }, [direction, food, isGameStarted, isGameOver]);

    return (
        <div ref={gameAreaRef} className="game-area">
            <Snake segments={snake} />
            <Food position={food} />
            <div className="score-area">
                <p>Score: {score}</p>
                {isGameOver && <p className="game-over">Game Over</p>}
            </div>
        </div>
    );
};
