import { db } from "./sqliteDatabase";

const CATALOG_TABLE = "offline_catalog_items";
const CATALOGS = new Set(["groups", "teachers"]);
const WRITE_BATCH_SIZE = 100;

let schemaReady;

export const ensureCatalogStorage = () => {
    if (!schemaReady) {
        schemaReady = db
            .executeAsync(
                `CREATE TABLE IF NOT EXISTS ${CATALOG_TABLE} (
                    catalog TEXT NOT NULL,
                    item_key TEXT NOT NULL,
                    position INTEGER NOT NULL,
                    display_name TEXT NOT NULL,
                    search_name TEXT NOT NULL,
                    payload TEXT NOT NULL,
                    PRIMARY KEY (catalog, item_key)
                )`,
            )
            .then(() =>
                db.executeAsync(
                    `CREATE INDEX IF NOT EXISTS offline_catalog_search_idx
                    ON ${CATALOG_TABLE} (catalog, search_name, position)`,
                ),
            )
            .catch((error) => {
                schemaReady = null;
                throw error;
            });
    }
    return schemaReady;
};

export const getCatalogItemKey = (catalog, item) => {
    if (catalog === "teachers") {
        return (
            item?.id ??
            item?.idTeacher ??
            item?.teacherId ??
            item?.teacherID ??
            item?.кодПреподавателя ??
            item?.код ??
            item?.name ??
            item?.title ??
            item?.fio ??
            item?.ФИО
        );
    }
    return item?.id ?? item?.name ?? item?.title;
};

const getDisplayName = (catalog, item) =>
    String(
        catalog === "teachers"
            ? item?.name ?? item?.title ?? item?.fio ?? item?.ФИО ?? item?.teacher ?? ""
            : item?.name ?? item?.title ?? "",
    );

export const replaceCatalogInTransaction = async (transaction, catalog, items) => {
    if (!CATALOGS.has(catalog)) throw new Error(`Unknown catalog: ${catalog}`);

    await transaction.executeAsync(
        `DELETE FROM ${CATALOG_TABLE} WHERE catalog = ?`,
        [catalog],
    );

    const seen = new Set();
    for (let start = 0; start < items.length; start += WRITE_BATCH_SIZE) {
        const batch = [];
        const end = Math.min(start + WRITE_BATCH_SIZE, items.length);
        for (let index = start; index < end; index += 1) {
            const item = items[index];
            const rawKey = getCatalogItemKey(catalog, item);
            if (rawKey === undefined || rawKey === null) continue;

            const itemKey = String(rawKey);
            if (seen.has(itemKey)) continue;
            seen.add(itemKey);

            const displayName = getDisplayName(catalog, item);
            batch.push({
                itemKey,
                position: index,
                displayName,
                searchName: displayName.toLocaleLowerCase("ru-RU"),
                payload: JSON.stringify(item),
            });
        }

        if (batch.length) {
            const placeholders = batch.map(() => "(?, ?, ?, ?, ?, ?)").join(", ");
            const parameters = batch.flatMap((entry) => [
                catalog,
                entry.itemKey,
                entry.position,
                entry.displayName,
                entry.searchName,
                entry.payload,
            ]);

            await transaction.executeAsync(
                `INSERT OR REPLACE INTO ${CATALOG_TABLE}
                    (catalog, item_key, position, display_name, search_name, payload)
                VALUES ${placeholders}`,
                parameters,
            );
        }

        if (end < items.length) {
            await new Promise((resolve) => setTimeout(resolve, 0));
        }
    }
};

export const saveCatalog = async (catalog, items) => {
    await ensureCatalogStorage();
    await db.transaction((transaction) =>
        replaceCatalogInTransaction(transaction, catalog, items),
    );
};

export const getCatalogPage = async ({
    catalog,
    query = "",
    offset = 0,
    limit = 40,
    favoriteItems = [],
    excludedKey = null,
}) => {
    await ensureCatalogStorage();
    if (!CATALOGS.has(catalog)) throw new Error(`Unknown catalog: ${catalog}`);

    const conditions = ["catalog = ?"];
    const parameters = [catalog];
    const normalizedQuery = query.trim().toLocaleLowerCase("ru-RU");

    if (normalizedQuery) {
        conditions.push("instr(search_name, ?) > 0");
        parameters.push(normalizedQuery);
    }
    if (excludedKey !== null && excludedKey !== undefined) {
        conditions.push("item_key != ?");
        parameters.push(String(excludedKey));
    }

    const favoriteKeys = [...new Set(
        favoriteItems
            .map((item) => getCatalogItemKey(catalog, item))
            .filter((key) => key !== undefined && key !== null)
            .map(String),
    )];
    const priorityOrder = favoriteKeys.length
        ? `CASE WHEN item_key IN (${favoriteKeys.map(() => "?").join(", ")}) THEN 0 ELSE 1 END, position`
        : "position";
    parameters.push(...favoriteKeys, limit + 1, offset);

    const result = await db.executeAsync(
        `SELECT payload FROM ${CATALOG_TABLE}
         WHERE ${conditions.join(" AND ")}
         ORDER BY ${priorityOrder}
         LIMIT ? OFFSET ?`,
        parameters,
    );
    const rows = result.rows?._array || [];

    return {
        items: rows.slice(0, limit).map((row) => JSON.parse(row.payload)),
        hasMore: rows.length > limit,
    };
};
