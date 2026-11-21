import { fireEvent, render, screen } from "@testing-library/react-native";
import { RefreshControl, Text } from "react-native";
import { ListaEstados, refresco } from "@/components/ListaEstados";

const vacio: { id: string }[] = [];
const base = {
  datos: vacio,
  keyExtractor: (i: { id: string }) => i.id,
  renderItem: ({ item }: { item: { id: string } }) => <Text>{`libro-${item.id}`}</Text>,
  tituloVacio: "Sin resultados",
};

describe("ListaEstados", () => {
  it("muestra el estado de carga", async () => {
    await render(<ListaEstados {...base} estado="cargando" />);
    expect(screen.getByText("Cargando…")).toBeTruthy();
  });

  it("muestra el estado vacío con sugerencias", async () => {
    await render(<ListaEstados {...base} estado="vacio" sugerencias={["Revisa la ortografía"]} />);
    expect(screen.getByText("Sin resultados")).toBeTruthy();
    expect(screen.getByText("• Revisa la ortografía")).toBeTruthy();
  });

  it("muestra el error con «Reintentar» que dispara la acción", async () => {
    const onReintentar = jest.fn();
    await render(
      <ListaEstados {...base} estado="error" mensajeError="El servicio falló" onReintentar={onReintentar} />,
    );
    expect(screen.getByText("El servicio falló")).toBeTruthy();
    await fireEvent.press(screen.getByLabelText("Reintentar"));
    expect(onReintentar).toHaveBeenCalledTimes(1);
  });

  it("usa un RefreshControl directo (en Android, un envoltorio propio deja la lista en blanco)", () => {
    expect(refresco(() => undefined, false)?.type).toBe(RefreshControl);
    expect(refresco(undefined, false)).toBeUndefined();
  });

  it("muestra los elementos cuando hay datos", async () => {
    await render(<ListaEstados {...base} estado="ok" datos={[{ id: "1" }, { id: "2" }]} />);
    expect(screen.getByText("libro-1")).toBeTruthy();
    expect(screen.getByText("libro-2")).toBeTruthy();
  });
});
