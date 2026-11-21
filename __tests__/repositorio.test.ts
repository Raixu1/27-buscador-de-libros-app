import type { Db } from "@/db";
import { aLectura, crearLecturaRepository } from "@/repositories/lecturaRepository";
import type { Lectura } from "@/types";

/** Db falsa: registra el SQL y los parámetros, y devuelve lo que se le programe. */
function dbFalsa(filas: unknown[] = [], primera: unknown = null) {
  const llamadas: { sql: string; params: unknown }[] = [];
  const db: Db = {
    runAsync: jest.fn(async (sql: string, params: unknown) => {
      llamadas.push({ sql, params });
      return { lastInsertRowId: 0, changes: 1 };
    }),
    getAllAsync: jest.fn(async (sql: string, params: unknown) => {
      llamadas.push({ sql, params });
      return filas;
    }),
    getFirstAsync: jest.fn(async (sql: string, params: unknown) => {
      llamadas.push({ sql, params });
      return primera;
    }),
    execAsync: jest.fn(async (sql: string) => {
      llamadas.push({ sql, params: [] });
    }),
  };
  return { db, llamadas };
}

const fila: Parameters<typeof aLectura>[0] = {
  id: "OL1W",
  titulo: "Dune",
  autores: '["Frank Herbert"]',
  portada_url: null,
  anio: 1965,
  estado: "leido",
  calificacion: 5,
  nota: null,
  remote_id: "OL1W",
  updated_at: "2026-01-01T00:00:00.000Z",
  deleted: 0,
  pending: 1,
};

describe("lecturaRepository: lectura", () => {
  it("convierte la fila de SQLite a tipos de la app", () => {
    expect(aLectura(fila)).toMatchObject({ autores: ["Frank Herbert"], deleted: false, pending: true });
    expect(aLectura({ ...fila, autores: "no-json", updated_at: null }).autores).toEqual([]);
  });

  it("listar usa SQL parametrizado (el texto nunca va dentro del SQL)", async () => {
    const { db, llamadas } = dbFalsa([fila]);
    const r = await crearLecturaRepository(db).listar({ estado: "leido", texto: "x' OR 1=1 --" });
    expect(r).toHaveLength(1);
    expect(llamadas[0]?.sql).toContain("estado = ? AND (titulo LIKE ? OR autores LIKE ?)");
    expect(llamadas[0]?.sql).not.toContain("OR 1=1");
    expect(llamadas[0]?.params).toEqual(["leido", "%x' OR 1=1 --%", "%x' OR 1=1 --%"]);
  });

  it("listar sin filtros solo excluye los borrados", async () => {
    const { db, llamadas } = dbFalsa([]);
    await crearLecturaRepository(db).listar();
    expect(llamadas[0]?.sql).toContain("WHERE deleted = 0 ORDER BY");
  });

  it("obtener devuelve null si no existe", async () => {
    expect(await crearLecturaRepository(dbFalsa([], null).db).obtener("x")).toBeNull();
    expect(await crearLecturaRepository(dbFalsa([], fila).db).obtener("OL1W")).toMatchObject({ id: "OL1W" });
  });
});

describe("lecturaRepository: escritura y metadatos", () => {
  const item: Lectura = { ...aLectura(fila), remote_id: null };

  it("guardar serializa autores y banderas", async () => {
    const { db, llamadas } = dbFalsa();
    await crearLecturaRepository(db).guardar(item);
    expect(llamadas[0]?.params).toEqual([
      "OL1W",
      "Dune",
      '["Frank Herbert"]',
      null,
      1965,
      "leido",
      5,
      null,
      "OL1W",
      "2026-01-01T00:00:00.000Z",
      0,
      1,
    ]);
  });

  it("pendientes, marcarSincronizado, contar, meta y vaciar", async () => {
    const { db, llamadas } = dbFalsa([fila], { n: 3, valor: "v" });
    const repo = crearLecturaRepository(db);
    expect(await repo.pendientes()).toHaveLength(1);
    await repo.marcarSincronizado("OL1W", "t");
    expect(await repo.contarLeidosDelAnio(2026)).toBe(3);
    expect(await repo.getMeta("since")).toBe("v");
    await repo.setMeta("since", "t2");
    await repo.vaciar();
    expect(llamadas.map((l) => l.params)).toContainEqual(["2026"]);
    expect(llamadas.at(-1)?.sql).toContain("DELETE FROM lectura");
  });

  it("contar y getMeta toleran ausencia de filas", async () => {
    const repo = crearLecturaRepository(dbFalsa([], null).db);
    expect(await repo.contarLeidosDelAnio(2026)).toBe(0);
    expect(await repo.getMeta("since")).toBeNull();
  });
});
