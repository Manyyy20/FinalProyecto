import React from "react";
import "./SnakeGame.css"; // Importamos estilos específicos de Snake

const Snake = ({ segments }) => (
    <>
        {segments.map((segment, index) => (
            <div
                key={index}
                className="snake-segment"
                style={{
                    top: `${segment.y * 20}px`,
                    left: `${segment.x * 20}px`,
                }}
            />
        ))}
    </>
);

export default Snake;
