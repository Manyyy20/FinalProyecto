const sql = require("mssql");

module.exports = async function (context, req) {
    const dbConfig = {
        user: process.env.DB_USER || "sqladmin",
        password: process.env.DB_PASSWORD || "Password22",
        server: process.env.DB_SERVER || "snakegamesqlserver.database.windows.net",
        database: process.env.DB_DATABASE || "snakeGameDatabase",
        options: {
            encrypt: true,
        },
    };

    const { playerName, score } = req.body;

    if (!playerName || !score) {
        context.res = {
            status: 400,
            body: "playerName and score are required",
        };
        return;
    }

    try {
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input("playerName", sql.NVarChar, playerName)
            .input("score", sql.Int, score)
            .query("INSERT INTO Scores (PlayerName, Score) VALUES (@playerName, @score)");

        context.res = {
            status: 200,
            body: "Score added successfully",
        };
    } catch (err) {
        console.error(err);
        context.res = {
            status: 500,
            body: "Error saving score",
        };
    }
};
