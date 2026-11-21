import * as SecureStore from "expo-secure-store";
import { borrarSesion, guardarEmail, guardarTokens, leerEmail, leerTokens } from "@/api/tokens";
import { abrirLibro, libroDeParams, paramsDeLibro } from "@/navigation";

jest.mock("expo-secure-store", () => {
  const almacen = new Map<string, string>();
  return {
    getItemAsync: jest.fn(async (k: string) => almacen.get(k) ?? null),
    setItemAsync: jest.fn(async (k: string, v: string) => void almacen.set(k, v)),
    deleteItemAsync: jest.fn(async (k: string) => void almacen.delete(k)),
  };
});

const libro = { id: "OL1W", titulo: "Dune", autores: ["Frank Herbert"], portada_url: null, anio: 1965 };

describe("navegación: parámetros del detalle", () => {
  it("ida y vuelta conserva el libro", () => {
    expect(libroDeParams(paramsDeLibro(libro))).toEqual(libro);
  });

  it("tolera parámetros incompletos o manipulados", () => {
    expect(libroDeParams({ id: ["OL2W"], autores: "{no-json", anio: "abc" })).toEqual({
      id: "OL2W",
      titulo: "Libro",
      autores: [],
      portada_url: null,
      anio: null,
    });
    expect(libroDeParams({ id: "x", autores: '[1, "Ana"]' }).autores).toEqual(["Ana"]);
  });

  it("abrirLibro usa push o replace", () => {
    const router = { push: jest.fn(), replace: jest.fn() };
    abrirLibro(router, libro);
    abrirLibro(router, libro, true);
    expect(router.push).toHaveBeenCalledTimes(1);
    expect(router.replace).toHaveBeenCalledTimes(1);
  });
});

describe("tokens en expo-secure-store", () => {
  it("guarda, lee y borra la sesión", async () => {
    expect(await leerTokens()).toBeNull();
    await guardarTokens({ token: "t", refreshToken: "r" });
    await guardarEmail("a@b.c");
    expect(await leerTokens()).toEqual({ token: "t", refreshToken: "r" });
    expect(await leerEmail()).toBe("a@b.c");
    await borrarSesion();
    expect(await leerTokens()).toBeNull();
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledTimes(3);
  });
});
