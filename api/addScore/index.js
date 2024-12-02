const cors = require("cors");
const express = require("express");
const bodyParser = require("body-parser");
const sql = require("mssql");

const app = express();

// Configurar CORS
const corsOptions = {
    origin: "https://polite-field-0707b590f.5.azurestaticapps.net", // Cambia esta URL a la de tu Static Web App
    methods: ["GET", "POST"], // Métodos permitidos
    allowedHeaders: ["Content-Type"], // Encabezados permitidos
};

app.use(cors(corsOptions));
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

    // Validar los datos de entrada
    if (!playerName || typeof playerName !== "string" || !score || typeof score !== "number") {
        return res.status(400).send("Invalid input. 'playerName' must be a string and 'score' must be a number.");
    }

    try {
        // Conectar a la base de datos
        const pool = await sql.connect(dbConfig);

        // Ejecutar la consulta
        const result = await pool.request()
            .input("playerName", sql.NVarChar, playerName)
            .input("score", sql.Int, score)
            .query("INSERT INTO Scores (PlayerName, Score) VALUES (@playerName, @score)");

        console.log("Result from database:", result);
        res.status(200).send("Score added successfully");
    } catch (error) {
        // Capturar errores específicos
        if (error.code === "ETIMEOUT") {
            console.error("Database connection timed out:", error);
            res.status(500).send("Database connection timed out");
        } else if (error.code === "ELOGIN") {
            console.error("Invalid database credentials:", error);
            res.status(500).send("Invalid database credentials");
        } else {
            console.error("Error adding score:", error);
            res.status(500).send("An unexpected error occurred while adding the score");
        }
    }
});

// Iniciar el servidor
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
