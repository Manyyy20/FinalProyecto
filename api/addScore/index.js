const cors = require("cors");
const express = require("express");
const bodyParser = require("body-parser");
const sql = require("mssql");

const app = express();

// Configurar CORS
const corsOptions = {
    origin: "https://polite-field-0707b590f.5.azurestaticapps.net",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
};

app.use(cors(corsOptions));
app.use(bodyParser.json());

// Configuración de la base de datos usando la variable de entorno generada por Azure
const dbConfig = {
    connectionString: process.env.CONNECTION_STRING, // Automáticamente asignado por Azure Static Web Apps
    options: {
        encrypt: true,
    },
};

app.post("/api/addScore", async (req, res) => {
    const { playerName, score } = req.body;

    if (!playerName || !score) {
        return res.status(400).send("playerName and score are required");
    }

    try {
        const pool = await sql.connect(dbConfig);
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

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
