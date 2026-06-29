import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { useStats } from "@/context/StatsContext";
import { TodayBar } from "@/components/TodayBar";
import { StreakBadge } from "@/components/StreakBadge";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

export default function TodayScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { stats } = useStats();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const [blockingStatus, setBlockingStatus] = useState({
    blockingEnabled: false,
    instagramBlocked: true,
    youtubeBlocked: true,
    instagramLimit: 10,
    youtubeLimit: 10,
    unlockedUntil: null as string | null
  });
  const [leetcodeStatus, setLeetcodeStatus] = useState({
    solvedToday: 0,
    unlockedApps: false,
    verifiedAt: null as string | null
  });

  const loadLocalData = async () => {
    try {
      const bStr = await AsyncStorage.getItem("scrollio_local_blocking");
      const lStr = await AsyncStorage.getItem("scrollio_local_leetcode");

      let b = bStr ? JSON.parse(bStr) : { blockingEnabled: false, instagramBlocked: true, youtubeBlocked: true, instagramLimit: 10, youtubeLimit: 10, unlockedUntil: null };
      let l = lStr ? JSON.parse(lStr) : { solvedToday: 0, unlockedApps: false, verifiedAt: null };

      const todayStr = new Date().toISOString().split("T")[0];

      if (l.verifiedAt && l.verifiedAt.split("T")[0] !== todayStr) {
        l = { solvedToday: 0, unlockedApps: false, verifiedAt: null };
        b = { ...b, unlockedUntil: null };
        await Promise.all([
          AsyncStorage.setItem("scrollio_local_leetcode", JSON.stringify(l)),
          AsyncStorage.setItem("scrollio_local_blocking", JSON.stringify(b))
        ]);
      }

      setBlockingStatus(b);
      setLeetcodeStatus(l);
    } catch {}
  };

  useEffect(() => {
    loadLocalData();
    const interval = setInterval(loadLocalData, 3000);
    return () => clearInterval(interval);
  }, []);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await loadLocalData();
    setRefreshing(false);
  };

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  if (!user) return null;

  const isCurrentlyTracking = stats.currentForegroundApp !== null;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: topPad + 8,
            paddingBottom: Platform.OS === "web" ? 120 : insets.bottom + 80,
          },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.green}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Date header */}
        <View style={styles.dateRow}>
          <Text style={[styles.dateText, { color: colors.mutedForeground }]}>
            {today}
          </Text>
          {user.currentStreak > 0 && (
            <StreakBadge streak={user.currentStreak} size="sm" label="streak" />
          )}
        </View>

        {/* Greeting */}
        <Text style={[styles.greeting, { color: colors.foreground }]}>
          Hey, {user.displayName.split(" ")[0]}
        </Text>
        <Text style={[styles.subgreeting, { color: colors.mutedForeground }]}>
          {stats.reelsSeen === 0
            ? "No reels yet today — keep it up"
            : `${stats.reelsSeen} reels tracked today`}
        </Text>

        {/* Today stats bar */}
        <TodayBar />

        {/* Live protection status — always on, no button required */}
        <View
          style={[
            styles.protectRow,
            {
              backgroundColor: isCurrentlyTracking ? colors.greenLight : colors.card,
              borderColor: isCurrentlyTracking ? colors.green : colors.border,
              borderRadius: colors.radius,
            },
          ]}
        >
          <View
            style={[
              styles.protectDot,
              { backgroundColor: isCurrentlyTracking ? colors.green : colors.mutedForeground },
            ]}
          />
          <Text style={[styles.protectText, { color: colors.foreground }]}>
            {isCurrentlyTracking
              ? `Tracking ${stats.currentForegroundApp === "instagram" ? "Instagram" : "YouTube"} now`
              : "Protection active — open Instagram or YouTube to track"}
          </Text>
        </View>

        {/* LeetCode status */}
        {leetcodeStatus && (
          <View
            style={[
              styles.leetRow,
              {
                backgroundColor: leetcodeStatus.unlockedApps
                  ? colors.greenLight
                  : colors.yellowLight,
                borderColor: leetcodeStatus.unlockedApps
                  ? colors.green
                  : colors.yellowDark,
                borderRadius: colors.radius,
              },
            ]}
          >
            <View style={styles.leetLeft}>
              <View
                style={[
                  styles.leetDot,
                  {
                    backgroundColor: leetcodeStatus.unlockedApps
                      ? colors.green
                      : colors.yellowDark,
                  },
                ]}
              />
              <Text style={[styles.leetText, { color: colors.foreground }]}>
                {leetcodeStatus.unlockedApps
                  ? "Apps unlocked via LeetCode"
                  : `${leetcodeStatus.solvedToday}/2 problems solved`}
              </Text>
            </View>
            {!leetcodeStatus.unlockedApps && (
              <TouchableOpacity
                onPress={() => router.push("/(tabs)/unlock")}
                activeOpacity={0.8}
              >
                <Text style={[styles.leetAction, { color: colors.greenDark }]}>
                  Unlock →
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Instructions note */}
        <View
          style={[
            styles.note,
            { backgroundColor: colors.yellowLight, borderColor: colors.yellowDark, borderRadius: colors.radius },
          ]}
        >
          <Text style={[styles.noteText, { color: colors.foreground }]}>
            Tracking and blocking run automatically in the background. Just open Instagram or
            YouTube — there's nothing to start manually.
          </Text>
        </View>

        {/* Local stats */}
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
          TODAY'S STATS
        </Text>
        <View style={styles.syncRow}>
          <View
            style={[
              styles.syncCard,
              { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius },
            ]}
          >
            <Text style={[styles.syncValue, { color: colors.foreground }]}>
              {stats.instagramReels}
            </Text>
            <Text style={[styles.syncLabel, { color: colors.mutedForeground }]}>
              INSTAGRAM REELS
            </Text>
          </View>
          <View
            style={[
              styles.syncCard,
              { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius },
            ]}
          >
            <Text style={[styles.syncValue, { color: colors.foreground }]}>
              {stats.youtubeShorts}
            </Text>
            <Text style={[styles.syncLabel, { color: colors.mutedForeground }]}>
              YOUTUBE SHORTS
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    gap: 12,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dateText: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
  },
  greeting: {
    fontFamily: "Inter_700Bold",
    fontSize: 26,
    lineHeight: 32,
  },
  subgreeting: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    marginTop: -4,
  },
  sectionTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 10,
    letterSpacing: 0.8,
    marginTop: 4,
  },
  protectRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    padding: 12,
  },
  protectDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  protectText: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    flex: 1,
  },
  leetRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    padding: 10,
  },
  leetLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  leetDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  leetText: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    flex: 1,
  },
  leetAction: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
  },
  note: {
    borderWidth: 1,
    padding: 12,
  },
  noteText: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    lineHeight: 18,
  },
  syncRow: {
    flexDirection: "row",
    gap: 10,
  },
  syncCard: {
    flex: 1,
    borderWidth: 1,
    padding: 12,
    alignItems: "center",
  },
  syncValue: {
    fontFamily: "Inter_700Bold",
    fontSize: 20,
  },
  syncLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 9,
    letterSpacing: 0.5,
    marginTop: 2,
  },
});
