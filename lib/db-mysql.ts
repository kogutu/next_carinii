import mysql from "mysql2/promise";

export const pool = mysql.createPool({
    host: "hd-026.stpl.net.pl",
    user: "jsk_nextjs",
    password: "fQMHSbHXaAtJ6rup9ACe",
    database: "jsk_nextjs",
    connectionLimit: 10,
    connectTimeout: 10000, // 10 sekund timeout

    charset: 'utf8mb4', // Full Unicode support including emojis
    timezone: 'local' // Optional: set timezone to local
});


type SqlResponse =
    | { success: true; type: "select"; rows: any[] }
    | { success: true; type: "insert"; insertId: number; affectedRows: number }
    | { success: true; type: string; affectedRows: number }
    | { success: false; error: string };
export async function testConnection(): Promise<{ success: boolean; message: string }> {
    try {
        // Pobierz połączenie z puli
        const connection = await pool.getConnection();

        // Wykonaj proste zapytanie testowe
        const [result] = await connection.query('SELECT 1 + 1 AS solution');

        console.log(result);
        // Zwolnij połączenie z powrotem do puli
        connection.release();

        return {
            success: true,
            message: 'Połączenie z bazą danych działa prawidłowo'
        };
    } catch (error: any) {
        return {
            success: false,
            message: `Błąd połączenia: ${error.message}`
        };
    }
}
export async function executeSQL(
    query: string,
    params: any[] = []
): Promise<SqlResponse> {

    try {
        if (!query || typeof query !== "string") {
            return { success: false, error: "Query is required" };
        }

        const command = query.trim().split(" ")[0].toUpperCase();

        const allowedCommands = ["SELECT", "INSERT", "UPDATE", "DELETE"];

        // console.log(await testConnection());
        if (!allowedCommands.includes(command)) {


            return { success: false, error: "Command not allowed" };
        }

        console.log(query, params);
        const [result] = await pool.execute(query, params);
        console.log(result);
        if (command === "SELECT") {
            return {
                success: true,
                type: "select",
                rows: result as any[],
            };
        }

        if (command === "INSERT") {
            const r = result as any;
            return {
                success: true,
                type: "insert",
                insertId: r.insertId,
                affectedRows: r.affectedRows,
            };
        }

        const r = result as any;

        return {
            success: true,
            type: command.toLowerCase(),
            affectedRows: r.affectedRows,
        };
    } catch (error: any) {
        return {
            success: false,
            error: error.message,
        };
    }
}