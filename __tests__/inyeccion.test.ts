// Ataque 2 (respuesta de API) del lado de la app. Ver ia/INFORME-INYECCION.md.
import { request } from "@/api/client";
import { cambiosSchema, paginaLibrosSchema } from "@/api/schemas";
import * as tokens from "@/api/tokens";
import { traerCambios, type RemotoApi } from "@/services/syncService";
import { crearRepoEnMemoria } from "./helpers/repoEnMemoria";

jest.mock("@/api/tokens");

const json = (body: unknown) =>
  Promise.resolve(new Response(JSON.stringify(body), { status: 200, headers: { "Content-Type": "application/json" } }));

beforeEach(() => {
  jest.mocked(tokens.leerTokens).mockResolvedValue({ token: "t", refreshToken: "r" });
});

describe("ataque 2: respuesta manipulada de la API", () => {
  it("descarta campos no declarados y no contamina el prototipo", async () => {
    const malicioso = JSON.parse(
      '{"resultados":[{"id":"OL1W","titulo":"x","autores":[],"portada_url":null,"anio":null,"rol":"admin"}],' +
        '"total":1,"pagina":1,"hay_mas":false,"__proto__":{"admin":true},"token":"robado"}',
    );
    globalThis.fetch = jest.fn().mockImplementation(() => json(malicioso));
    const r = await request("/api/libros/buscar?q=x", paginaLibrosSchema);
    expect(r).not.toHaveProperty("token");
    expect(r.resultados[0]).not.toHaveProperty("rol");
    expect(Object.getPrototypeOf(r)).toBe(Object.prototype);
    const objetoNuevo: Record<string, unknown> = {};
    expect(objetoNuevo.admin).toBeUndefined();
  });

  it("rechaza tipos inesperados antes de usarlos (502)", async () => {
    globalThis.fetch = jest
      .fn()
      .mockImplementation(() => json({ resultados: "no-es-lista", total: 1, pagina: 1, hay_mas: false }));
    await expect(request("/api/libros/buscar?q=x", paginaLibrosSchema)).rejects.toMatchObject({ status: 502 });
  });

  it("un estado inválido en la sincronización no llega a SQLite", async () => {
    const repo = crearRepoEnMemoria();
    const sospechoso = {
      id: "OL1W",
      titulo: "x",
      autores: [],
      portada_url: null,
      anio: null,
      estado: "admin",
      calificacion: null,
      nota: null,
      created_at: "t",
      updated_at: "t",
      deleted_at: null,
    };
    expect(cambiosSchema.safeParse({ items: [sospechoso], servidor_ahora: "t" }).success).toBe(false);
    const api: RemotoApi = {
      listar: () => request("/api/lectura", cambiosSchema),
      guardar: jest.fn(),
      borrar: jest.fn(),
    };
    globalThis.fetch = jest.fn().mockImplementation(() => json({ items: [sospechoso], servidor_ahora: "t" }));
    await expect(traerCambios(repo, api)).rejects.toMatchObject({ status: 502 });
    expect(repo.filas.size).toBe(0);
  });
});
