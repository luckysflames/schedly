import { open } from "react-native-quick-sqlite";

export const db = open({ name: "schedly_storage.db" });

db.execute(
    "CREATE TABLE IF NOT EXISTS kv_store (key TEXT PRIMARY KEY, value TEXT)",
);
