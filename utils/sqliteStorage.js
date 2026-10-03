import { db } from "./sqliteDatabase";
import { ensureCatalogStorage, replaceCatalogInTransaction } from "./catalogStorage";

const STORE_KEY = "schedly-schedule-storage";
const CATALOG_MIGRATION_KEY = "__offline_catalogs_v1__";

const migrateLegacyCatalogs = async (name, value) => {
    if (name !== STORE_KEY || !value) return value;

    try {
        const migration = await db.executeAsync(
            "SELECT value FROM kv_store WHERE key = ?",
            [CATALOG_MIGRATION_KEY],
        );
        if (migration.rows?._array?.[0]?.value === "1") return value;

        const persisted = JSON.parse(value);
        const persistedState = persisted?.state;
        if (!persistedState || typeof persistedState !== "object") return value;

        const groups = Array.isArray(persistedState.groups) ? persistedState.groups : [];
        const teachers = Array.isArray(persistedState.teachers) ? persistedState.teachers : [];
        const compactState = { ...persistedState };
        delete compactState.groups;
        delete compactState.teachers;
        const compactValue = JSON.stringify({ ...persisted, state: compactState });

        await ensureCatalogStorage();
        await db.transaction(async (transaction) => {
            await replaceCatalogInTransaction(transaction, "groups", groups);
            await replaceCatalogInTransaction(transaction, "teachers", teachers);
            await transaction.executeAsync(
                "UPDATE kv_store SET value = ? WHERE key = ?",
                [compactValue, name],
            );
            await transaction.executeAsync(
                "INSERT OR REPLACE INTO kv_store (key, value) VALUES (?, ?)",
                [CATALOG_MIGRATION_KEY, "1"],
            );
        });

        return compactValue;
    } catch (error) {
        console.error("Offline catalog migration error:", error);
        return value;
    }
};

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

    getItem: async (name) => {
        try {
            const result = await db.executeAsync(
                "SELECT value FROM kv_store WHERE key = ?",
                [name],
            );
            const value = result.rows?._array?.[0]?.value ?? null;
            return migrateLegacyCatalogs(name, value);
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
