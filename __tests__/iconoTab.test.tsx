import { render } from "@testing-library/react-native";
import { PlatformColor } from "react-native";
import { iconoTab } from "@/components/IconoTab";

jest.mock("@expo/vector-icons/Ionicons", () => {
  const { Text } = jest.requireActual("react-native");
  return function IoniconsFalso(props: { name: string; color: unknown }) {
    return <Text testID="icono" {...props} />;
  };
});

describe("icono de la barra de pestañas", () => {
  it("pasa el color tal cual (en Android puede ser un objeto, no texto)", async () => {
    const colorNativo = PlatformColor("?attr/colorPrimary");
    const Icono = iconoTab("search", "search-outline");
    const { getByTestId } = await render(<Icono color={colorNativo} focused={false} size={24} />);
    expect(getByTestId("icono").props.color).toBe(colorNativo);
  });

  it("usa el icono relleno cuando la pestaña está activa", async () => {
    const Icono = iconoTab("search", "search-outline");
    const { getByTestId } = await render(<Icono color="#000" focused size={24} />);
    expect(getByTestId("icono").props.name).toBe("search");
  });
});
