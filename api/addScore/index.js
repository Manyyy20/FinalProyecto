const sql = require("mssql");

module.exports = async function (context, req) {
    const playerName = req.body.playerName;
    const score = req.body.score;

    if (playerName && score) {
        try {
            const pool = await sql.connect({
                user: process.env.DB_USER || "sqladmin",
                password: process.env.DB_PASSWORD || "Password22",
                server: process.env.DB_SERVER || "snakegamesqlserver.database.windows.net",
                database: process.env.DB_DATABASE || "snakeGameDatabase",
                options: {
                    encrypt: true, // Importante para Azure SQL
                },
            });

            const result = await pool
                .request()
                .input("playerName", sql.VarChar, playerName)
                .input("score", sql.Int, score)
                .query("INSERT INTO Scores (PlayerName, Score) VALUES (@playerName, @score)");

            context.res = {
                status: 200,
                body: { message: "Score saved successfully", result: result },
            };
        } catch (err) {
            context.res = {
                status: 500,
                body: { error: err.message },
            };
        }
    } else {
        context.res = {
            status: 400,
            body: { error: "Please pass playerName and score in the request body" },
        };
    }
};
