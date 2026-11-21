import { alExpirarSesion, ApiError, apiBaseUrl, request } from "@/api/client";
import { okSchema } from "@/api/schemas";
import * as tokens from "@/api/tokens";

jest.mock("@/api/tokens");
const mock = jest.mocked(tokens);

const json = (status: number, body: unknown) =>
  Promise.resolve(new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } }));

const URL_ORIGINAL = process.env.EXPO_PUBLIC_API_URL;
afterEach(() => {
  process.env.EXPO_PUBLIC_API_URL = URL_ORIGINAL;
  jest.resetAllMocks();
});

describe("configuración del cliente", () => {
  it("quita la barra final y exige que exista la URL", () => {
    process.env.EXPO_PUBLIC_API_URL = "https://api.example.test///";
    expect(apiBaseUrl()).toBe("https://api.example.test");
    process.env.EXPO_PUBLIC_API_URL = "";
    expect(() => apiBaseUrl()).toThrow(ApiError);
  });

  it("sin sesión guardada responde 401 sin llamar a la red", async () => {
    mock.leerTokens.mockResolvedValue(null);
    globalThis.fetch = jest.fn();
    await expect(request("/api/lectura", okSchema)).rejects.toMatchObject({ status: 401 });
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("errores sin mensaje usan un texto genérico", async () => {
    mock.leerTokens.mockResolvedValue({ token: "t", refreshToken: "r" });
    globalThis.fetch = jest.fn().mockImplementation(() => json(500, { error: 123 }));
    await expect(request("/api/lectura", okSchema)).rejects.toMatchObject({
      status: 500,
      message: "Error inesperado del servidor.",
    });
  });

  it("avisa a la app cuando la sesión expira", async () => {
    const alExpirar = jest.fn();
    alExpirarSesion(alExpirar);
    mock.leerTokens.mockResolvedValueOnce({ token: "t", refreshToken: "r" }).mockResolvedValueOnce(null);
    globalThis.fetch = jest.fn().mockImplementation(() => json(401, { error: "No autenticado" }));
    await expect(request("/api/lectura", okSchema)).rejects.toMatchObject({ status: 401 });
    expect(alExpirar).toHaveBeenCalledTimes(1);
    alExpirarSesion(null);
  });
});
