import * as client from "@/api/client";
import * as api from "@/api/endpoints";
import { cambiosSchema, okSchema, sesionSchema } from "@/api/schemas";

jest.mock("@/api/client", () => ({ request: jest.fn(async () => ({})) }));
const request = jest.mocked(client.request);

beforeEach(() => request.mockClear());

const ultima = () => request.mock.calls.at(-1);

describe("endpoints: rutas, método y contrato", () => {
  it("auth es pública y valida la sesión", async () => {
    await api.login("a@b.c", "x");
    expect(ultima()).toEqual([
      "/api/auth/login",
      sesionSchema,
      expect.objectContaining({ method: "POST", auth: false }),
    ]);
    await api.registro("a@b.c", "12345678");
    expect(ultima()?.[0]).toBe("/api/auth/registro");
  });

  it("escapa los parámetros de búsqueda", async () => {
    await api.buscarLibros("a&b c", 2);
    expect(ultima()?.[0]).toBe("/api/libros/buscar?q=a%26b%20c&pagina=2");
    await api.libroPorIsbn("978 0");
    expect(ultima()?.[0]).toBe("/api/libros/isbn/978%200");
    await api.sinopsis("OL1W");
    expect(ultima()?.[0]).toBe("/api/libros/detalle/OL1W");
  });

  it("sincronización: since opcional, PUT y DELETE", async () => {
    await api.listarLecturaRemota(null);
    expect(ultima()).toEqual(["/api/lectura", cambiosSchema]);
    await api.listarLecturaRemota("2026-01-01T00:00:00.000Z");
    expect(ultima()?.[0]).toBe("/api/lectura?since=2026-01-01T00%3A00%3A00.000Z");
    const cuerpo = {
      titulo: "D",
      autores: [],
      portada_url: null,
      anio: null,
      estado: "quiero" as const,
      calificacion: null,
      nota: null,
    };
    await api.guardarLecturaRemota("OL1W", cuerpo);
    expect(ultima()?.[2]).toEqual({ method: "PUT", body: cuerpo });
    await api.borrarLecturaRemota("OL1W");
    expect(ultima()).toEqual(["/api/lectura/OL1W", okSchema, { method: "DELETE" }]);
  });
});
