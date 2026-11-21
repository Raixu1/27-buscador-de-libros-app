import type { LecturaRemota } from "@/types";
import { ApiError } from "@/api/client";
import { agregarLibro, actualizarLibro, libroAleatorio, quitarLibro } from "@/services/listaService";
import { enviarPendientes, traerCambios, type RemotoApi } from "@/services/syncService";
import { crearRepoEnMemoria } from "./helpers/repoEnMemoria";

jest.mock("@/db", () => ({ getDb: jest.fn() }));
jest.mock("@/api/endpoints", () => ({}));

const libro = { id: "OL1W", titulo: "Dune", autores: ["Frank Herbert"], portada_url: null, anio: 1965 };
const quiero = { estado: "quiero" as const, calificacion: null, nota: null };

const remoto = (id: string, updated_at: string, extra: Partial<LecturaRemota> = {}): LecturaRemota => ({
  ...libro,
  id,
  estado: "leido",
  calificacion: 4,
  nota: null,
  created_at: updated_at,
  updated_at,
  deleted_at: null,
  ...extra,
});

function apiFalsa(items: LecturaRemota[] = []): RemotoApi & { guardar: jest.Mock; borrar: jest.Mock } {
  return {
    listar: jest.fn(async () => ({ items, servidor_ahora: "x" })),
    guardar: jest.fn(async (id: string) => remoto(id, "2026-11-20T10:00:00.000Z")),
    borrar: jest.fn(async () => ({ ok: true })),
  };
}

describe("lista local", () => {
  it("no permite duplicar un libro", async () => {
    const repo = crearRepoEnMemoria();
    await agregarLibro(repo, libro, quiero);
    await expect(agregarLibro(repo, libro, quiero)).rejects.toThrow("ya está en tu lista");
  });

  it("rechaza calificación si el estado no es «leido»", async () => {
    const repo = crearRepoEnMemoria();
    await expect(agregarLibro(repo, libro, { ...quiero, calificacion: 5 })).rejects.toThrow();
    await agregarLibro(repo, libro, quiero);
    await expect(actualizarLibro(repo, libro.id, { ...quiero, calificacion: 3 })).rejects.toThrow();
  });

  it("agrega con pending = 1 y permite volver a agregar tras quitar", async () => {
    const repo = crearRepoEnMemoria();
    const item = await agregarLibro(repo, libro, quiero);
    expect(item.pending).toBe(true);
    await quitarLibro(repo, libro.id);
    expect(await repo.listar()).toHaveLength(0);
    await expect(agregarLibro(repo, libro, quiero)).resolves.toBeTruthy();
  });

  it("elige un libro aleatorio o null si la lista está vacía", () => {
    expect(libroAleatorio([], () => 0.5)).toBeNull();
    expect(libroAleatorio(["a", "b", "c"], () => 0.99)).toBe("c");
  });
});

describe("sincronización", () => {
  it("envía los pendientes y los marca como sincronizados", async () => {
    const repo = crearRepoEnMemoria();
    await agregarLibro(repo, libro, quiero);
    const api = apiFalsa();
    expect(await enviarPendientes(repo, api)).toBe(1);
    expect(api.guardar).toHaveBeenCalledWith("OL1W", expect.objectContaining({ titulo: "Dune", estado: "quiero" }));
    expect((await repo.obtener("OL1W"))?.pending).toBe(false);
  });

  it("envía borrados lógicos y tolera 404", async () => {
    const repo = crearRepoEnMemoria();
    await agregarLibro(repo, libro, quiero);
    await quitarLibro(repo, libro.id);
    const api = apiFalsa();
    api.borrar.mockRejectedValueOnce(new ApiError(404, "No existe"));
    await enviarPendientes(repo, api);
    expect((await repo.obtener("OL1W"))?.pending).toBe(false);
  });

  it("trae cambios remotos y no pisa un cambio local pendiente", async () => {
    const repo = crearRepoEnMemoria();
    await agregarLibro(repo, libro, quiero); // pendiente local
    const api = apiFalsa([remoto("OL1W", "2026-11-20T09:00:00.000Z"), remoto("OL2W", "2026-11-20T09:30:00.000Z")]);
    expect(await traerCambios(repo, api)).toBe(1);
    expect((await repo.obtener("OL1W"))?.estado).toBe("quiero");
    expect((await repo.obtener("OL2W"))?.estado).toBe("leido");
    expect(await repo.getMeta("since")).toBe("2026-11-20T09:30:00.000Z");
  });

  it("aplica borrados remotos", async () => {
    const repo = crearRepoEnMemoria();
    const api = apiFalsa([remoto("OL3W", "2026-11-20T09:00:00.000Z", { deleted_at: "2026-11-20T09:00:00.000Z" })]);
    await traerCambios(repo, api);
    expect(await repo.listar()).toHaveLength(0);
    expect((await repo.obtener("OL3W"))?.deleted).toBe(true);
  });
});
