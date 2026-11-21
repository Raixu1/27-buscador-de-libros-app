import { validarBusqueda, validarCalificacion } from "@/services/validacion";

describe("reglas de validación", () => {
  it("la búsqueda requiere mínimo 3 caracteres", () => {
    expect(validarBusqueda("ab")).not.toBeNull();
    expect(validarBusqueda("  ab  ")).not.toBeNull();
    expect(validarBusqueda("abc")).toBeNull();
  });

  it("la calificación 1–5 solo aplica si el estado es «leido»", () => {
    expect(validarCalificacion("quiero", 4)).not.toBeNull();
    expect(validarCalificacion("leyendo", 3)).not.toBeNull();
    expect(validarCalificacion("leido", 5)).toBeNull();
    expect(validarCalificacion("leido", 0)).not.toBeNull();
    expect(validarCalificacion("leido", 6)).not.toBeNull();
    expect(validarCalificacion("quiero", null)).toBeNull();
  });
});
