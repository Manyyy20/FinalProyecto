const sql = require("mssql");

module.exports = async function (context, req) {
    const { playerName, score } = req.body;

    if (!playerName || !score) {
        context.res = {
            status: 400,
            body: "playerName and score are required",
        };
        return;
    }

    const dbConfig = {
        user: process.env.DB_USER || "sqladmin",
        password: process.env.DB_PASSWORD || "Password22",
        server: process.env.DB_SERVER || "snakegamesqlserver.database.windows.net",
        database: process.env.DB_DATABASE || "snakeGameDatabase",
        options: {
            encrypt: true, // Importante para Azure SQL
        },
    };

    try {
        // Conectar a la base de datos
        const pool = await sql.connect(dbConfig);

        // Insertar el puntaje en la base de datos
        await pool
            .request()
            .input("PlayerName", sql.NVarChar, playerName)
            .input("Score", sql.Int, score)
            .query("INSERT INTO Scores (PlayerName, Score, Timestamp) VALUES (@PlayerName, @Score, GETDATE())");

        context.res = {
            status: 200,
            body: "Score added successfully",
        };
    } catch (error) {
        console.error("Error adding score:", error);
        context.res = {
            status: 500,
            body: `Error adding score: ${error.message}`,
        };
    }
};
