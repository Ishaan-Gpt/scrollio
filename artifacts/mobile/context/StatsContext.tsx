import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { Platform, NativeModules } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { ScrollioModule } = NativeModules;
const isAndroid = Platform.OS === "android";

export const NativeScrollio = {
  isAccessibilityServiceEnabled: async (): Promise<boolean> => {
    if (isAndroid && ScrollioModule?.isAccessibilityServiceEnabled) {
      try {
        return await ScrollioModule.isAccessibilityServiceEnabled();
      } catch {
        return false;
      }
    }
    return false;
  },
  isOverlayPermissionGranted: async (): Promise<boolean> => {
    if (isAndroid && ScrollioModule?.isOverlayPermissionGranted) {
      try {
        return await ScrollioModule.isOverlayPermissionGranted();
      } catch {
        return false;
      }
    }
    return false;
  },
  openAccessibilitySettings: () => {
    if (isAndroid && ScrollioModule?.openAccessibilitySettings) {
      ScrollioModule.openAccessibilitySettings();
    }
  },
  openOverlaySettings: () => {
    if (isAndroid && ScrollioModule?.openOverlaySettings) {
      ScrollioModule.openOverlaySettings();
    }
  },
  setLimit: (app: "instagram" | "youtube", limit: number) => {
    if (isAndroid && ScrollioModule?.setLimit) {
      ScrollioModule.setLimit(app, limit);
    }
  },
  setBlockingEnabled: (enabled: boolean) => {
    if (isAndroid && ScrollioModule?.setBlockingEnabled) {
      ScrollioModule.setBlockingEnabled(enabled);
    }
  },
  setUnlockedUntil: (timestamp: number) => {
    if (isAndroid && ScrollioModule?.setUnlockedUntil) {
      ScrollioModule.setUnlockedUntil(timestamp);
    }
  },
  getStats: async (): Promise<{
    instagramReels: number;
    youtubeShorts: number;
    instagramSeconds: number;
    youtubeSeconds: number;
    currentForegroundApp: string;
  } | null> => {
    if (isAndroid && ScrollioModule?.getStats) {
      try {
        return await ScrollioModule.getStats();
      } catch {
        return null;
      }
    }
    return null;
  },
  getBlockingStatus: async (): Promise<{ blockingEnabled: boolean; instagramLimit: number; youtubeLimit: number; unlockedUntil: number } | null> => {
    if (isAndroid && ScrollioModule?.getBlockingStatus) {
      try {
        return await ScrollioModule.getBlockingStatus();
      } catch {
        return null;
      }
    }
    return null;
  },
  resetStats: () => {
    if (isAndroid && ScrollioModule?.resetStats) {
      ScrollioModule.resetStats();
    }
  }
};

interface AppStats {
  instagramReels: number;
  youtubeShorts: number;
  reelsSeen: number;
  minutesWatched: number;
  currentForegroundApp: "instagram" | "youtube" | null;
  lastSynced: string | null;
}

interface StatsContextValue {
  stats: AppStats;
  resetToday: () => void;
}

const StatsContext = createContext<StatsContextValue | null>(null);

const STATS_KEY = "scrollio_daily_stats";

function todayStr() {
  return new Date().toISOString().split("T")[0]!;
}

const defaultStats: AppStats = {
  instagramReels: 0,
  youtubeShorts: 0,
  reelsSeen: 0,
  minutesWatched: 0,
  currentForegroundApp: null,
  lastSynced: null,
};

function foregroundAppFromPackage(pkg: string): "instagram" | "youtube" | null {
  if (pkg === "com.instagram.android") return "instagram";
  if (pkg === "com.google.android.youtube") return "youtube";
  return null;
}

export function StatsProvider({ children }: { children: React.ReactNode }) {
  const [stats, setStats] = useState<AppStats>(defaultStats);

  const saveStats = useCallback(async (newStats: AppStats) => {
    try {
      await AsyncStorage.setItem(
        `${STATS_KEY}_${todayStr()}`,
        JSON.stringify(newStats)
      );
    } catch {
      // ignore
    }
  }, []);

  const pullFromNative = useCallback(async () => {
    const stored = await AsyncStorage.getItem(`${STATS_KEY}_${todayStr()}`);
    const baseline = stored ? JSON.parse(stored) : defaultStats;

    if (!isAndroid) {
      setStats(baseline);
      return;
    }

    const nativeStats = await NativeScrollio.getStats();
    if (!nativeStats) {
      setStats(baseline);
      return;
    }

    const updated: AppStats = {
      ...baseline,
      instagramReels: nativeStats.instagramReels,
      youtubeShorts: nativeStats.youtubeShorts,
      reelsSeen: nativeStats.instagramReels + nativeStats.youtubeShorts,
      minutesWatched: Math.floor((nativeStats.instagramSeconds + nativeStats.youtubeSeconds) / 60),
      currentForegroundApp: foregroundAppFromPackage(nativeStats.currentForegroundApp),
      lastSynced: new Date().toISOString(),
    };
    setStats(updated);
    saveStats(updated);
  }, [saveStats]);

  // Load today's stats immediately, then poll the native counters every second
  // so the UI reflects auto-tracked activity with no user action required.
  useEffect(() => {
    pullFromNative();
    const interval = setInterval(pullFromNative, 1000);
    return () => clearInterval(interval);
  }, [pullFromNative]);

  const resetToday = useCallback(() => {
    NativeScrollio.resetStats();
    setStats(defaultStats);
    AsyncStorage.removeItem(`${STATS_KEY}_${todayStr()}`).catch(() => {});
  }, []);

  return (
    <StatsContext.Provider value={{ stats, resetToday }}>
      {children}
    </StatsContext.Provider>
  );
}

export function useStats() {
  const ctx = useContext(StatsContext);
  if (!ctx) throw new Error("useStats must be used within StatsProvider");
  return ctx;
}
