const sql = require("mssql");

module.exports = async function (context, req) {
    const dbConfig = {
        user: process.env.DB_USER || "sqladmin",
        password: process.env.DB_PASSWORD || "Password22",
        server: process.env.DB_SERVER || "snakegamesqlserver.database.windows.net",
        database: process.env.DB_DATABASE || "snakeGameDatabase",
        options: {
            encrypt: true, // Requiere que el tráfico esté encriptado
        },
    };

    // Extraer datos del cuerpo de la solicitud
    const { playerName, score } = req.body;

    // Validar datos
    if (!playerName || !score) {
        context.res = {
            status: 400,
            body: "playerName and score are required",
        };
        return;
    }

    try {
        // Conexión a la base de datos
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input("playerName", sql.NVarChar, playerName)
            .input("score", sql.Int, score)
            .query("INSERT INTO Scores (PlayerName, Score) VALUES (@playerName, @score)");

        // Respuesta exitosa
        context.res = {
            status: 200,
            body: "Score added successfully",
        };
    } catch (err) {
        console.error("Database error:", err);

        // Error en el servidor
        context.res = {
            status: 500,
            body: "Error saving score",
        };
    }
};
