import React from "react";
import { render } from "@testing-library/react-native";
import { StreakBadge } from "../components/StreakBadge";

// Mock the hook
jest.mock("../hooks/useColors", () => ({
  useColors: () => ({
    yellow: "#f7f09a",
    yellowDark: "#c8b800",
    foreground: "#1a2e1a",
    mutedForeground: "#4a6b4a",
    radius: 10,
  }),
}));

describe("StreakBadge Component", () => {
  it("renders the streak number correctly", async () => {
    const { getByText } = await render(<StreakBadge streak={5} />);
    expect(getByText("5")).toBeTruthy();
  });

  it("renders the default label in uppercase", async () => {
    const { getByText } = await render(<StreakBadge streak={3} />);
    expect(getByText("DAY STREAK")).toBeTruthy();
  });

  it("renders custom label in uppercase", async () => {
    const { getByText } = await render(<StreakBadge streak={10} label="super streak" />);
    expect(getByText("SUPER STREAK")).toBeTruthy();
  });
});
