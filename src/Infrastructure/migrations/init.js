import Sqlite3 from '../Sqlite3.js';

const DB_PATH = process.env.DB_PATH;
if (!DB_PATH) {
    console.error('Error: DB_PATH environment variable is not defined.');
    process.exit(1);
}

console.log(`Starting database migration for path: ${DB_PATH}`);
const db = new Sqlite3(DB_PATH);

try {
    await db.connect();
    await db.run(`
        CREATE TABLE IF NOT EXISTS secrets (
            id TEXT PRIMARY KEY,
            encrypted_content TEXT NOT NULL,
            iv TEXT NOT NULL,
            auth_tag TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
    console.log('Database schema initialized successfully.');
} catch (err) {
    console.error('Migration failed:', err.message || err);
    process.exit(1);
} finally {
    try {
        await db.close();
        console.log('Database connection closed.');
    } catch (err) {
        console.error('Error closing database:', err.message || err);
    }
}
