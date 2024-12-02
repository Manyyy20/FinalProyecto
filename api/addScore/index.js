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
            encrypt: true, // Important for Azure SQL
        },
    };

    try {
        context.log("Connecting to the database...");
        const pool = await sql.connect(dbConfig);
        context.log("Database connection successful");

        await pool
            .request()
            .input("PlayerName", sql.NVarChar, playerName)
            .input("Score", sql.Int, score)
            .query("INSERT INTO Scores (PlayerName, Score) VALUES (@PlayerName, @Score)");

        context.res = {
            status: 200,
            body: "Score added successfully",
        };
    } catch (error) {
        context.log("Error adding score:", error.message, error.stack);
        context.res = {
            status: 500,
            body: "Error adding score",
        };
    }
};
