import React from "react";
import "./SnakeGame.css"; // Importamos estilos específicos de Food

const Food = ({ position }) =>
    position ? (
        <div
            className="food"
            style={{
                top: `${position.y * 20}px`,
                left: `${position.x * 20}px`,
            }}
        />
    ) : null;

export default Food;
