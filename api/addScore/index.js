const sql = require("mssql");

module.exports = async function (context, req) {
    const playerName = req.body.playerName;
    const score = req.body.score;

    if (playerName && score) {
        try {
            // Usar la connection string desde la variable de entorno
            const pool = await sql.connect(process.env.SQL_CONNECTION);

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
            context.log.error('SQL error', err);
            context.res = {
                status: 500,
                body: { error: `Internal Server Error: ${err.message}` },
            };
        }
    } else {
        context.res = {
            status: 400,
            body: { error: "Please pass playerName and score in the request body" },
        };
    }
};
