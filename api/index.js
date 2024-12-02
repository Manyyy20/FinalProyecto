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

    if (!playerName || !score) {
        return res.status(400).send("playerName and score are required");
    }

    try {
        // Conectar a la base de datos
        await sql.connect(dbConfig);

        // Insertar el puntaje en la base de datos
        const result = await sql.query`INSERT INTO Scores (PlayerName, Score) VALUES (${playerName}, ${score})`;

        res.status(200).send("Score added successfully");
    } catch (error) {
        console.error("Error adding score:", error);
        res.status(500).send("Error adding score");
    }
});

// Iniciar el servidor
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});