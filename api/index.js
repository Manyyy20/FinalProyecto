const cors = require("cors");
const express = require("express");
const bodyParser = require("body-parser");
const sql = require("mssql");

const app = express();

// Configurar CORS
app.use(cors());
app.use(bodyParser.json());

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

// Ruta para manejar la solicitud
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

// Exportar como una función de Azure
module.exports = async function (context, req) {
    const expressApp = app;
    expressApp(req, context.res);
};
