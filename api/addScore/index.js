const cors = require("cors");
const express = require("express");
const bodyParser = require("body-parser");
const sql = require("mssql");
require("dotenv").config(); // Carga las variables de entorno desde el archivo .env

const app = express();

// Configurar CORS
const corsOptions = {
    origin: "https://polite-field-0707b590f.5.azurestaticapps.net", // Cambia esta URL si es necesario
    methods: ["GET", "POST"], // Métodos permitidos
    allowedHeaders: ["Content-Type"], // Encabezados permitidos
};

app.use(cors(corsOptions));
app.use(bodyParser.json());

// Configuración de la base de datos usando la cadena de conexión
const dbConfig = {
    connectionString: process.env.DB_CONNECTION_STRING,
    options: {
        encrypt: true, // Habilita la encriptación
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
        const pool = await sql.connect(dbConfig);

        // Insertar el puntaje en la base de datos
        await pool.request()
            .input("PlayerName", sql.NVarChar, playerName)
            .input("Score", sql.Int, score)
            .query("INSERT INTO Scores (PlayerName, Score) VALUES (@PlayerName, @Score)");

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
