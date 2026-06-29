import { useColorScheme } from "react-native";
import { useColors } from "../hooks/useColors";
import colors from "../constants/colors";

jest.mock("react-native", () => ({
  useColorScheme: jest.fn(),
}));

describe("useColors Hook", () => {
  it("should return light palette when scheme is light", () => {
    (useColorScheme as jest.Mock).mockReturnValue("light");
    const res = useColors();
    expect(res.background).toBe(colors.light.background);
    expect(res.radius).toBe(colors.radius);
  });

  it("should fall back to light palette when scheme is dark but dark colors do not exist", () => {
    (useColorScheme as jest.Mock).mockReturnValue("dark");
    const res = useColors();
    expect(res.background).toBe(colors.light.background);
    expect(res.green).toBe(colors.light.green);
  });
});
