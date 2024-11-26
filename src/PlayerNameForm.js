import React, { useState } from "react";

const PlayerNameForm = ({ setPlayerName, startGame }) => {
    const [name, setName] = useState("");

    const handleSubmit = () => {
        if (name.trim() !== "") {
            setPlayerName(name.trim());
            startGame();
        } else {
            alert("Please enter your name to start the game!");
        }
    };

    return (
        <div className="player-name-input">
            <input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
            />
            <button onClick={handleSubmit}>Start Game</button>
        </div>
    );
};

export default PlayerNameForm;
