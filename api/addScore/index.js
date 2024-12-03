require('dotenv').config(); // Cargar variables del archivo .env
const sql = require("mssql");
console.log(process.env.DB_SERVER);

module.exports = async function (context, req) {
    context.log("Request received.");

    // Obtener datos del cuerpo de la solicitud
    const playerName = req.body?.playerName;
    const score = req.body?.score;
    //test
    // Validar datos de entrada
    if (!playerName || typeof playerName !== 'string') {
        context.log.warn("Invalid or missing playerName");
        context.res = {
            status: 400,
            body: {
                error: "Invalid playerName",
                details: "playerName must be a non-empty string."
            },
        };
        return;
    }

    if (typeof score !== 'number') {
        context.log.warn("Invalid or missing score");
        context.res = {
            status: 400,
            body: {
                error: "Invalid score",
                details: "score must be a valid number."
            },
        };
        return;
    }
    //hola
    try {
        // Conexión a la base de datos usando configuración detallada
        context.log("Connecting to the database...");
        const pool = await sql.connect({
            server: process.env.DB_SERVER, // Dirección del servidor
            user: process.env.DB_USER, // Usuario
            password: process.env.DB_PASSWORD, // Contraseña
            database: process.env.DB_DATABASE, // Base de datos
            options: {
                encrypt: true, // Usar TLS
                trustServerCertificate: false // Mejora de seguridad
            }
        });

        context.log("Database connection established.");

        // Ejecutar consulta SQL
        context.log("Executing database query...");
        const result = await pool
            .request()
            .input("playerName", sql.VarChar, playerName)
            .input("score", sql.Int, score)
            .query("INSERT INTO Scores (PlayerName, Score) VALUES (@playerName, @score)");

        context.log("Query executed successfully. Data inserted.");

        // Respuesta exitosa
        context.res = {
            status: 200,
            body: { message: "Score saved successfully", result },
        };

    } catch (err) {
        // Manejo detallado de errores
        if (err.code === 'ESOCKET') {
            context.log.error("Connection error. Check database server or network settings.", err);
        } else {
            context.log.error("Unexpected SQL error occurred:", err);
        }

        // Responder con error
        context.res = {
            status: 500,
            body: {
                error: "Internal Server Error",
                details: err.message,
                stack: process.env.NODE_ENV === 'development' ? err.stack : undefined, // Mostrar stack solo en desarrollo
            },
        };
    } finally {
        context.log("Function execution completed.");
    }
};
