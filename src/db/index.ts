import * as SQLite from "expo-sqlite";

/** Subconjunto de expo-sqlite que usan los repositorios (facilita las pruebas). */
export type Db = Pick<SQLite.SQLiteDatabase, "runAsync" | "getAllAsync" | "getFirstAsync" | "execAsync">;

const MIGRATIONS: string[] = [
  `CREATE TABLE lectura (
    id TEXT PRIMARY KEY,
    titulo TEXT NOT NULL,
    autores TEXT NOT NULL,
    portada_url TEXT,
    anio INTEGER,
    estado TEXT NOT NULL DEFAULT 'quiero' CHECK (estado IN ('quiero','leyendo','leido')),
    calificacion INTEGER CHECK (calificacion BETWEEN 1 AND 5),
    nota TEXT,
    remote_id TEXT,
    updated_at TEXT,
    deleted INTEGER DEFAULT 0,
    pending INTEGER DEFAULT 0
  );
  CREATE INDEX idx_lectura_estado ON lectura(estado);
  CREATE TABLE meta (clave TEXT PRIMARY KEY, valor TEXT NOT NULL);`,
];

/** Aplica las migraciones pendientes usando PRAGMA user_version. */
export async function migrate(db: SQLite.SQLiteDatabase): Promise<void> {
  const row = await db.getFirstAsync<{ user_version: number }>("PRAGMA user_version");
  const actual = row?.user_version ?? 0;
  for (let v = actual; v < MIGRATIONS.length; v++) {
    await db.withExclusiveTransactionAsync(async (tx) => {
      await tx.execAsync(MIGRATIONS[v]);
      await tx.execAsync(`PRAGMA user_version = ${v + 1}`);
    });
  }
}

let opening: Promise<SQLite.SQLiteDatabase> | null = null;

export function getDb(): Promise<SQLite.SQLiteDatabase> {
  opening ??= (async () => {
    const db = await SQLite.openDatabaseAsync("libros.db");
    await db.execAsync("PRAGMA journal_mode = WAL");
    await migrate(db);
    return db;
  })();
  return opening;
}
