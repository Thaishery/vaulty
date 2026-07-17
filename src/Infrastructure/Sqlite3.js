import sqlite3 from "sqlite3";
import fs from "fs";
import path from "path";

export default class Sqlite3 {
    #db;
    #dbPath;

    constructor(DB_PATH) {
        if (!fs.existsSync(path.dirname(DB_PATH))) {
            fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
        }
        this.#dbPath = DB_PATH;
    }

    connect() {
        return new Promise((resolve, reject) => {
            this.#db = new sqlite3.Database(this.#dbPath, (err) => {
                if (err) {
                    console.error('Error opening SQLite database:', err.message);
                    reject(err);
                } else {
                    console.log(`Connected to SQLite database at: ${this.#dbPath}`);
                    resolve();
                }
            });
        });
    }

    run(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.#db.run(sql, params, function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ lastID: this.lastID, changes: this.changes });
                }
            });
        });
    }

    get(sql, params = [], callback) {
        // return new Promise((resolve, reject) => {
            this.#db.get(sql, params, callback);
        // });
    }

    all(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.#db.all(sql, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    prepare(sql) {
        return this.#db.prepare(sql);
    }

    // prepare(sql, params = []) {
    //     console.log('prepared', sql, params)
    //     return new Promise((resolve, reject) => {
    //         this.#db.prepare(sql, params, (err, stmt) => {
    //             if (err) reject(err);
    //             else resolve(stmt);
    //         });
    //     });
    // }

    close() {
        return new Promise((resolve, reject) => {
            this.#db.close((err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    }
}
