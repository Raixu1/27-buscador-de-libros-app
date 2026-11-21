import * as endpoints from "@/api/endpoints";
import { getDb } from "@/db";
import { limpiarDatosLocales, repositorio, sincronizarAhora } from "@/services/listaService";
import { sincronizar, type RemotoApi } from "@/services/syncService";
import { validarEmail, validarPassword } from "@/services/validacion";
import { crearRepoEnMemoria } from "./helpers/repoEnMemoria";

const mockRepo = crearRepoEnMemoria();

jest.mock("@/db", () => ({ getDb: jest.fn(async () => ({})) }));
jest.mock("@/repositories/lecturaRepository", () => ({ crearLecturaRepository: () => mockRepo }));
jest.mock("@/api/endpoints", () => ({
  listarLecturaRemota: jest.fn(async () => ({ items: [], servidor_ahora: "t" })),
  guardarLecturaRemota: jest.fn(),
  borrarLecturaRemota: jest.fn(),
}));

describe("listaService", () => {
  it("repositorio abre la base una sola vez", async () => {
    expect(await repositorio()).toBe(mockRepo);
    await repositorio();
    expect(getDb).toHaveBeenCalledTimes(1);
  });

  it("sincronizarAhora devuelve el resultado, o null sin conexión", async () => {
    expect(await sincronizarAhora()).toEqual({ enviados: 0, recibidos: 0 });
    jest.mocked(endpoints.listarLecturaRemota).mockRejectedValueOnce(new Error("sin red"));
    expect(await sincronizarAhora()).toBeNull();
  });

  it("limpiarDatosLocales vacía la base local", async () => {
    await mockRepo.setMeta("since", "x");
    await limpiarDatosLocales();
    expect(await mockRepo.getMeta("since")).toBeNull();
  });
});

describe("syncService.sincronizar", () => {
  it("no ejecuta dos sincronizaciones a la vez", async () => {
    const api: RemotoApi = {
      listar: jest.fn(async () => ({ items: [], servidor_ahora: "t" })),
      guardar: jest.fn(),
      borrar: jest.fn(),
    };
    const [a, b] = [sincronizar(mockRepo, api), sincronizar(mockRepo, api)];
    expect(a).toBe(b);
    await a;
    expect(api.listar).toHaveBeenCalledTimes(1);
  });

  it("propaga errores distintos de 404 al borrar", async () => {
    const repo = crearRepoEnMemoria();
    await repo.guardar({
      id: "OL1W",
      titulo: "D",
      autores: [],
      portada_url: null,
      anio: null,
      estado: "quiero",
      calificacion: null,
      nota: null,
      remote_id: "OL1W",
      updated_at: "t",
      deleted: true,
      pending: true,
    });
    const api: RemotoApi = {
      listar: jest.fn(),
      guardar: jest.fn(),
      borrar: jest.fn().mockRejectedValue(new Error("500")),
    };
    await expect(sincronizar(repo, api)).rejects.toThrow("500");
  });
});

describe("validación de formulario", () => {
  it("correo y contraseña", () => {
    expect(validarEmail("a@b.co")).toBeNull();
    expect(validarEmail("no-es-correo")).not.toBeNull();
    expect(validarPassword("1234567")).not.toBeNull();
    expect(validarPassword("12345678")).toBeNull();
  });
});
