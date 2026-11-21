import { esIsbn10Valido, esIsbn13Valido, normalizarIsbn } from "@/services/isbn";

describe("validación de ISBN", () => {
  it("acepta ISBN-13 válidos, con o sin guiones", () => {
    expect(esIsbn13Valido("9780306406157")).toBe(true);
    expect(normalizarIsbn("978-0-306-40615-7")).toBe("9780306406157");
    expect(normalizarIsbn(" 978 0 306 40615 7 ")).toBe("9780306406157");
  });

  it("acepta ISBN-10 válidos, incluido el dígito X", () => {
    expect(esIsbn10Valido("0306406152")).toBe(true);
    expect(normalizarIsbn("0-306-40615-2")).toBe("0306406152");
    expect(normalizarIsbn("080442957x")).toBe("080442957X");
  });

  it("rechaza dígito de control incorrecto", () => {
    expect(normalizarIsbn("9780306406158")).toBeNull();
    expect(normalizarIsbn("0306406153")).toBeNull();
  });

  it("rechaza longitudes y caracteres inválidos", () => {
    for (const malo of ["", "123", "abcdefghij", "97803064061577", "978030640615X"]) {
      expect(normalizarIsbn(malo)).toBeNull();
    }
  });
});
