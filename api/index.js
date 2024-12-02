const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const sql = require("mssql");

const app = express();
const port = process.env.PORT || 3000;

// Configurar CORS
app.use(cors());

// Middleware
app.use(bodyParser.json());
//test
// Configuración de la base de datos
const dbConfig = {
    user: process.env.DB_USER || "sqladmin",
    password: process.env.DB_PASSWORD || "Password22",
    server: process.env.DB_SERVER || "snakegamesqlserver.database.windows.net",
    database: process.env.DB_DATABASE || "snakeGameDatabase",
    options: {
        encrypt: true,
    },
};

// Endpoint para agregar puntaje
app.post("/api/addScore", async (req, res) => {
    const { playerName, score } = req.body;

    if (!playerName || !score) {
        return res.status(400).send("playerName and score are required");
    }

    try {
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input("playerName", sql.NVarChar, playerName)
            .input("score", sql.Int, score)
            .query("INSERT INTO Scores (PlayerName, Score) VALUES (@playerName, @score)");

        res.status(200).send("Score added successfully");
    } catch (err) {
        console.error(err);
        res.status(500).send("Error saving score");
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
