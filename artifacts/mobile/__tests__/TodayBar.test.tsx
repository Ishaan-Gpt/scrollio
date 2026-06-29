import React from "react";
import { render } from "@testing-library/react-native";
import { TodayBar } from "../components/TodayBar";

// Mock hooks
jest.mock("../hooks/useColors", () => ({
  useColors: () => ({
    card: "#eefae5",
    border: "#c8e8be",
    foreground: "#1a2e1a",
    mutedForeground: "#4a6b4a",
    radius: 10,
  }),
}));

const mockUseStats = jest.fn();
jest.mock("../context/StatsContext", () => ({
  useStats: () => mockUseStats(),
}));

describe("TodayBar Component", () => {
  it("renders reels, ig, yt and minutes correctly", async () => {
    mockUseStats.mockReturnValue({
      stats: {
        reelsSeen: 12,
        instagramReels: 8,
        youtubeShorts: 4,
        minutesWatched: 45,
      },
    });

    const { getByText } = await render(<TodayBar />);
    expect(getByText("12")).toBeTruthy();
    expect(getByText("8")).toBeTruthy();
    expect(getByText("4")).toBeTruthy();
    expect(getByText("45m")).toBeTruthy();
  });

  it("formats hours and minutes correctly when minutesWatched > 60", async () => {
    mockUseStats.mockReturnValue({
      stats: {
        reelsSeen: 30,
        instagramReels: 20,
        youtubeShorts: 10,
        minutesWatched: 135, // 2h 15m
      },
    });

    const { getByText } = await render(<TodayBar />);
    expect(getByText("2h 15m")).toBeTruthy();
  });
});
