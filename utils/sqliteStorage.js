import { open } from "react-native-quick-sqlite";

// Открываем базу данных
const db = open({ name: "finik_storage.db" });

// Создаем таблицу для хранения данных Zustand, если её ещё нет
db.execute(
    "CREATE TABLE IF NOT EXISTS kv_store (key TEXT PRIMARY KEY, value TEXT)",
);

export const sqliteZustandStorage = {
    setItem: (name, value) => {
        try {
            db.execute(
                "INSERT OR REPLACE INTO kv_store (key, value) VALUES (?, ?)",
                [name, value],
            );
        } catch (e) {
            console.error("SQLite setItem error:", e);
        }
    },

    getItem: (name) => {
        try {
            const result = db.execute(
                "SELECT value FROM kv_store WHERE key = ?",
                [name],
            );
            if (result.rows && result.rows.length > 0) {
                return result.rows.item(0).value;
            }
            return null;
        } catch (e) {
            console.error("SQLite getItem error:", e);
            return null;
        }
    },

    removeItem: (name) => {
        try {
            db.execute("DELETE FROM kv_store WHERE key = ?", [name]);
        } catch (e) {
            console.error("SQLite removeItem error:", e);
        }
    },
};
