import { crearDetectorSacudida, esSacudida, integrarInclinacion } from "@/sensors/logic";

describe("lógica de sensores (funciones puras)", () => {
  it("detecta una sacudida solo sobre el umbral", () => {
    expect(esSacudida({ x: 0, y: 0, z: 1 })).toBe(false); // reposo ≈ 1 g
    expect(esSacudida({ x: 2, y: 1, z: 1 })).toBe(true);
  });

  it("aplica enfriamiento entre sacudidas", () => {
    const detectar = crearDetectorSacudida(1.8, 1000);
    const fuerte = { x: 3, y: 0, z: 0 };
    expect(detectar(fuerte, 0)).toBe(true);
    expect(detectar(fuerte, 500)).toBe(false);
    expect(detectar(fuerte, 1500)).toBe(true);
  });

  it("limita la inclinación a ±15° y decae hacia 0", () => {
    expect(integrarInclinacion(0, 100, 1)).toBe(15);
    expect(integrarInclinacion(0, -100, 1)).toBe(-15);
    expect(Math.abs(integrarInclinacion(10, 0, 0.05))).toBeLessThan(10);
  });
});
