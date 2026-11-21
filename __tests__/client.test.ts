import { ApiError, request } from "@/api/client";
import * as tokens from "@/api/tokens";

jest.mock("@/api/tokens");
const mock = jest.mocked(tokens);

const json = (status: number, body: unknown) =>
  Promise.resolve(new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } }));

beforeEach(() => {
  jest.resetAllMocks();
  mock.leerTokens.mockResolvedValue({ token: "viejo", refreshToken: "refresh" });
});

describe("cliente HTTP", () => {
  it("renueva el token una sola vez y reintenta con el token nuevo", async () => {
    const fetchMock = jest
      .fn()
      .mockImplementationOnce(() => json(401, { error: "No autenticado" })) // petición original
      .mockImplementationOnce(() => json(200, { token: "nuevo", refreshToken: "refresh2", expiraEnSeg: 3600 })) // refresh
      .mockImplementationOnce(() => json(200, { ok: true })); // reintento
    globalThis.fetch = fetchMock;

    await expect(request("/api/lectura")).resolves.toEqual({ ok: true });

    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock.mock.calls[1][0]).toContain("/api/auth/refresh");
    expect(fetchMock.mock.calls[2][1].headers.Authorization).toBe("Bearer nuevo");
    expect(mock.guardarTokens).toHaveBeenCalledWith({ token: "nuevo", refreshToken: "refresh2" });
  });

  it("si la renovación falla, borra la sesión y vuelve al login", async () => {
    globalThis.fetch = jest
      .fn()
      .mockImplementationOnce(() => json(401, { error: "No autenticado" }))
      .mockImplementationOnce(() => json(401, { error: "Sesión inválida" }));
    await expect(request("/api/lectura")).rejects.toMatchObject({ status: 401 });
    expect(mock.borrarSesion).toHaveBeenCalled();
  });

  it("convierte fallos de red en ApiError(0)", async () => {
    globalThis.fetch = jest.fn().mockRejectedValue(new TypeError("Network request failed"));
    const error = (await request("/api/lectura").catch((e: unknown) => e)) as ApiError;
    expect(error).toBeInstanceOf(ApiError);
    expect(error.esRed).toBe(true);
  });

  it("no envía token en rutas públicas", async () => {
    const fetchMock = jest.fn().mockImplementation(() => json(200, { ok: true }));
    globalThis.fetch = fetchMock;
    await request("/api/auth/login", { method: "POST", body: { email: "a@b.c", password: "x" }, auth: false });
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBeUndefined();
  });
});
