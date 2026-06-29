import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface User {
  id: number;
  username: string;
  displayName: string;
  bio?: string | null;
  leetcodeUsername?: string | null;
  createdAt: string;
  totalReelsSeen: number;
  totalMinutesWatched: number;
  currentStreak: number;
  bestStreak: number;
  totalDaysBlocked: number;
}

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  updateUser: (user: User) => void;
  resetProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const USER_KEY = "scrollio_user";

const defaultLocalUser: User = {
  id: 1,
  username: "solo_user",
  displayName: "Solo User",
  bio: "Focusing on my digital health.",
  leetcodeUsername: "",
  createdAt: new Date().toISOString(),
  totalReelsSeen: 0,
  totalMinutesWatched: 0,
  currentStreak: 0,
  bestStreak: 0,
  totalDaysBlocked: 0,
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const storedUser = await AsyncStorage.getItem(USER_KEY);
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        } else {
          await AsyncStorage.setItem(USER_KEY, JSON.stringify(defaultLocalUser));
          setUser(defaultLocalUser);
        }
      } catch {
        setUser(defaultLocalUser);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const updateUser = useCallback((newUser: User) => {
    setUser(newUser);
    AsyncStorage.setItem(USER_KEY, JSON.stringify(newUser)).catch(() => {});
  }, []);

  const resetProfile = useCallback(async () => {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(defaultLocalUser));
    setUser(defaultLocalUser);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, updateUser, resetProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
