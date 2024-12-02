const cors = require("cors");
const express = require("express");
const bodyParser = require("body-parser");
const sql = require("mssql");

// Configuración de la conexión a la base de datos desde variables de entorno
const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    options: {
        encrypt: true, // Asegura que la conexión esté encriptada
    },
};

// Inicializar Express
const app = express();

// Configurar CORS
const corsOptions = {
    origin: "https://snakegameappservice.azurewebsites.net", // Cambia esta URL al dominio de tu App Service
    methods: ["GET", "POST"], // Métodos permitidos
    allowedHeaders: ["Content-Type"], // Encabezados permitidos
};

app.use(cors(corsOptions));
app.use(bodyParser.json());

// Ruta para manejar la solicitud
app.post("/api/addScore", async (req, res) => {
    const { playerName, score } = req.body;

    if (!playerName || !score) {
        console.error("Datos inválidos:", req.body);
        return res.status(400).send("playerName and score are required");
    }

    try {
        console.log("Intentando conectar a la base de datos...");
        const pool = await sql.connect(dbConfig);
        console.log("Conexión exitosa");

        const result = await pool
            .request()
            .input("PlayerName", sql.NVarChar, playerName)
            .input("Score", sql.Int, score)
            .query(
                "INSERT INTO Scores (PlayerName, Score, Timestamp) VALUES (@PlayerName, @Score, GETDATE())"
            );

        console.log("Resultado de la consulta:", result);
        res.status(200).send("Score added successfully");
    } catch (error) {
        console.error("Error al procesar la solicitud:", error);
        res.status(500).send(`Error adding score: ${error.message}`);
    }
});

// Iniciar el servidor
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
