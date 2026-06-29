import React from "react";
import { renderHook, act } from "@testing-library/react-native";
import { AuthProvider, useAuth } from "../context/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

describe("AuthContext Integration", () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  );

  it("loads default local user if no user is stored in AsyncStorage", async () => {
    const { result } = await renderHook(() => useAuth(), { wrapper });

    // Wait for useEffect initialization
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.user).toBeTruthy();
    expect(result.current.user?.username).toBe("solo_user");
  });

  it("loads stored user from AsyncStorage if available", async () => {
    const customUser = {
      id: 2,
      username: "test_user",
      displayName: "Test User",
      createdAt: new Date().toISOString(),
      totalReelsSeen: 10,
      totalMinutesWatched: 5,
      currentStreak: 2,
      bestStreak: 2,
      totalDaysBlocked: 0,
    };
    await AsyncStorage.setItem("scrollio_user", JSON.stringify(customUser));

    const { result } = await renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.user).toEqual(customUser);
  });

  it("handles updateUser and resetProfile correctly", async () => {
    const { result } = await renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    const updatedUser = {
      ...result.current.user!,
      displayName: "Updated Name",
    };

    await act(async () => {
      result.current.updateUser(updatedUser);
    });

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    expect(result.current.user?.displayName).toBe("Updated Name");

    await act(async () => {
      await result.current.resetProfile();
    });

    expect(result.current.user?.username).toBe("solo_user");
    expect(result.current.user?.displayName).toBe("Solo User");
  });
});
