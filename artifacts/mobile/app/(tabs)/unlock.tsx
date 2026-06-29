import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  Alert,
  Animated,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect } from "react";
import { NativeScrollio } from "@/context/StatsContext";

const isAndroid = Platform.OS === "android";

const fetchLeetcodeSolves = async (leetcodeUsername: string) => {
  const response = await fetch("https://leetcode.com/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": "Mozilla/5.0",
    },
    body: JSON.stringify({
      query: `
        query getUserProfile($username: String!) {
          recentSubmissionList(username: $username, limit: 15) {
            title
            timestamp
            statusDisplay
          }
        }
      `,
      variables: { username: leetcodeUsername },
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to connect to LeetCode");
  }

  const result = await response.json();
  if (result.errors) {
    throw new Error(result.errors[0]?.message || "LeetCode query error");
  }

  const data = result.data;
  if (!data || !data.recentSubmissionList) {
    throw new Error("User not found or has no submissions");
  }

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const startOfTodayUnix = Math.floor(startOfToday.getTime() / 1000);

  const accepted = data.recentSubmissionList.filter(
    (sub: any) => sub.statusDisplay === "Accepted" && parseInt(sub.timestamp) >= startOfTodayUnix
  );

  const uniqueSolved = new Set(accepted.map((sub: any) => sub.title));
  return uniqueSolved.size;
};

export default function UnlockScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, updateUser } = useAuth();
  const [username, setUsername] = useState(user?.leetcodeUsername ?? "");
  const [checking, setChecking] = useState(false);
  const successScale = useState(new Animated.Value(0))[0];

  const [leetcodeStatus, setLeetcodeStatus] = useState({ solvedToday: 0, unlockedApps: false, verifiedAt: null as string | null });
  const [blockingStatus, setBlockingStatus] = useState({ blockingEnabled: false, instagramBlocked: true, youtubeBlocked: true, unlockedUntil: null as string | null });

  const loadStatuses = async () => {
    try {
      const bStr = await AsyncStorage.getItem("scrollio_local_blocking");
      const lStr = await AsyncStorage.getItem("scrollio_local_leetcode");

      let b = bStr ? JSON.parse(bStr) : { blockingEnabled: false, instagramBlocked: true, youtubeBlocked: true, unlockedUntil: null };
      let l = lStr ? JSON.parse(lStr) : { solvedToday: 0, unlockedApps: false, verifiedAt: null };

      const todayStr = new Date().toISOString().split("T")[0];

      if (l.verifiedAt && l.verifiedAt.split("T")[0] !== todayStr) {
        l = { solvedToday: 0, unlockedApps: false, verifiedAt: null };
        b = { ...b, unlockedUntil: null };
        await Promise.all([
          AsyncStorage.setItem("scrollio_local_leetcode", JSON.stringify(l)),
          AsyncStorage.setItem("scrollio_local_blocking", JSON.stringify(b))
        ]);
        if (isAndroid) {
          NativeScrollio.setUnlockedUntil(0);
        }
      }

      if (isAndroid) {
        const nativeStatus = await NativeScrollio.getBlockingStatus();
        if (nativeStatus) {
          b = {
            ...b,
            blockingEnabled: nativeStatus.blockingEnabled,
            unlockedUntil: nativeStatus.unlockedUntil > 0 ? new Date(nativeStatus.unlockedUntil).toISOString() : null
          };
        }
      }

      setBlockingStatus(b);
      setLeetcodeStatus(l);
      if (l.unlockedApps || b.unlockedUntil != null) {
        successScale.setValue(1);
      }
    } catch {}
  };

  useEffect(() => {
    loadStatuses();
  }, []);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const handleVerify = async () => {
    if (!username.trim()) {
      Alert.alert("Error", "Enter your LeetCode username");
      return;
    }
    setChecking(true);
    try {
      if (user) {
        updateUser({ ...user, leetcodeUsername: username.trim() });
      }

      const solvedToday = await fetchLeetcodeSolves(username.trim());
      const unlocked = solvedToday >= 2;
      
      const newLStatus = {
        solvedToday,
        unlockedApps: unlocked,
        verifiedAt: new Date().toISOString()
      };

      const newBStatus = {
        ...blockingStatus,
        unlockedUntil: unlocked ? new Date().toISOString() : null
      };

      await Promise.all([
        AsyncStorage.setItem("scrollio_local_leetcode", JSON.stringify(newLStatus)),
        AsyncStorage.setItem("scrollio_local_blocking", JSON.stringify(newBStatus))
      ]);

      if (unlocked && isAndroid) {
        const midnight = new Date();
        midnight.setHours(23, 59, 59, 999);
        NativeScrollio.setUnlockedUntil(midnight.getTime());
      } else if (isAndroid) {
        NativeScrollio.setUnlockedUntil(0);
      }

      setLeetcodeStatus(newLStatus);
      setBlockingStatus(newBStatus);

      if (unlocked) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Animated.spring(successScale, {
          toValue: 1,
          useNativeDriver: true,
          tension: 60,
          friction: 6,
        }).start();
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        Alert.alert(
          "Not yet!",
          `Solve ${2 - solvedToday} more problems today.`
        );
      }
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Failed to verify. Check connection and try again.");
    } finally {
      setChecking(false);
    }
  };

  const isUnlocked = leetcodeStatus.unlockedApps || blockingStatus.unlockedUntil != null;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: topPad + 8,
            paddingBottom: Platform.OS === "web" ? 120 : insets.bottom + 80,
          },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.title, { color: colors.foreground }]}>
          Unlock Apps
        </Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Prove you solved 2 LeetCode problems today to unlock Instagram & YouTube
        </Text>

        {/* Status card */}
        <View
          style={[
            styles.statusCard,
            {
              backgroundColor: isUnlocked ? colors.greenLight : colors.yellowLight,
              borderColor: isUnlocked ? colors.green : colors.yellowDark,
              borderRadius: colors.radius,
            },
          ]}
        >
          <View style={styles.statusTop}>
            {/* Checkmark or X icon */}
            <View
              style={[
                styles.statusIcon,
                {
                  backgroundColor: isUnlocked ? colors.green : colors.muted,
                  borderRadius: (styles.statusIcon as any).width / 2,
                },
              ]}
            >
              {isUnlocked ? (
                <>
                  <View style={[styles.checkL, { backgroundColor: colors.primaryForeground }]} />
                  <View style={[styles.checkR, { backgroundColor: colors.primaryForeground }]} />
                </>
              ) : (
                <View style={[styles.statusDash, { backgroundColor: colors.mutedForeground }]} />
              )}
            </View>
            <Text style={[styles.statusTitle, { color: colors.foreground }]}>
              {isUnlocked ? "Apps Unlocked!" : "Apps Locked"}
            </Text>
          </View>
          <View style={styles.progressRow}>
            <View
              style={[
                styles.progressBar,
                {
                  backgroundColor: colors.border,
                  borderRadius: 4,
                },
              ]}
            >
              <View
                style={[
                  styles.progressFill,
                  {
                    backgroundColor: colors.green,
                    borderRadius: 4,
                    width: `${Math.min(100, ((leetcodeStatus?.solvedToday ?? 0) / 2) * 100)}%`,
                  },
                ]}
              />
            </View>
            <Text style={[styles.progressLabel, { color: colors.foreground }]}>
              {leetcodeStatus?.solvedToday ?? 0}/2
            </Text>
          </View>
          {isUnlocked && (
            <Text style={[styles.unlockedMsg, { color: colors.greenDark }]}>
              Unlocked until midnight. Great work!
            </Text>
          )}
        </View>

        {/* Username input */}
        <Text style={[styles.label, { color: colors.mutedForeground }]}>
          LEETCODE USERNAME
        </Text>
        <View
          style={[
            styles.inputRow,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderRadius: colors.radius,
            },
          ]}
        >
          {/* Code icon */}
          <View style={styles.inputIcon}>
            <View style={[styles.codeBracket, { borderColor: colors.green }]} />
            <View style={[styles.codeLine, { backgroundColor: colors.green }]} />
          </View>
          <TextInput
            style={[
              styles.input,
              {
                color: colors.foreground,
                fontFamily: "Inter_400Regular",
              },
            ]}
            value={username}
            onChangeText={setUsername}
            placeholder="your-leetcode-username"
            placeholderTextColor={colors.mutedForeground}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <TouchableOpacity
          style={[
            styles.verifyBtn,
            {
              backgroundColor: isUnlocked ? colors.muted : colors.green,
              borderRadius: colors.radius,
              opacity: checking ? 0.7 : 1,
            },
          ]}
          onPress={handleVerify}
          disabled={checking || isUnlocked}
          activeOpacity={0.85}
        >
          <Text
            style={[
              styles.verifyBtnText,
              {
                color: isUnlocked ? colors.mutedForeground : colors.primaryForeground,
              },
            ]}
          >
            {checking
              ? "Checking LeetCode..."
              : isUnlocked
                ? "Already Unlocked"
                : "Verify & Unlock"}
          </Text>
        </TouchableOpacity>

        {/* How it works */}
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
          HOW IT WORKS
        </Text>
        {[
          "We check your LeetCode recent submissions via the public GraphQL API",
          "Solves from the last 24 hours count toward today's requirement",
          "2 accepted submissions = apps unlocked until midnight",
          "The check is live — no manual input needed, just your username",
        ].map((step, i) => (
          <View key={i} style={styles.stepRow}>
            <View
              style={[
                styles.stepNum,
                {
                  backgroundColor: colors.green,
                  borderRadius: colors.radius - 4,
                },
              ]}
            >
              <Text style={[styles.stepNumText, { color: colors.primaryForeground }]}>
                {i + 1}
              </Text>
            </View>
            <Text style={[styles.stepText, { color: colors.foreground }]}>
              {step}
            </Text>
          </View>
        ))}

        {/* Blocking controls */}
        {blockingStatus && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
              BLOCKING STATUS
            </Text>
            <View
              style={[
                styles.blockingCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  borderRadius: colors.radius,
                },
              ]}
            >
              <View style={styles.blockingRow}>
                <View
                  style={[
                    styles.igIcon,
                    { borderColor: colors.green },
                  ]}
                />
                <Text style={[styles.blockingLabel, { color: colors.foreground }]}>
                  Instagram
                </Text>
                <View
                  style={[
                    styles.blockPill,
                    {
                      backgroundColor: blockingStatus.instagramBlocked
                        ? colors.green
                        : colors.muted,
                      borderRadius: 12,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.blockPillText,
                      {
                        color: blockingStatus.instagramBlocked
                          ? colors.primaryForeground
                          : colors.mutedForeground,
                      },
                    ]}
                  >
                    {blockingStatus.instagramBlocked ? "Blocked" : "Open"}
                  </Text>
                </View>
              </View>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <View style={styles.blockingRow}>
                <View
                  style={[
                    styles.ytIcon,
                    { backgroundColor: colors.green, borderRadius: 4 },
                  ]}
                />
                <Text style={[styles.blockingLabel, { color: colors.foreground }]}>
                  YouTube
                </Text>
                <View
                  style={[
                    styles.blockPill,
                    {
                      backgroundColor: blockingStatus.youtubeBlocked
                        ? colors.green
                        : colors.muted,
                      borderRadius: 12,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.blockPillText,
                      {
                        color: blockingStatus.youtubeBlocked
                          ? colors.primaryForeground
                          : colors.mutedForeground,
                      },
                    ]}
                  >
                    {blockingStatus.youtubeBlocked ? "Blocked" : "Open"}
                  </Text>
                </View>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: 16, gap: 12 },
  title: { fontFamily: "Inter_700Bold", fontSize: 24 },
  subtitle: { fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 19 },
  statusCard: { borderWidth: 1.5, padding: 14, gap: 10 },
  statusTop: { flexDirection: "row", alignItems: "center", gap: 10 },
  statusIcon: { width: 28, height: 28, alignItems: "center", justifyContent: "center" },
  checkL: {
    position: "absolute",
    width: 7,
    height: 2.5,
    borderRadius: 1.5,
    transform: [{ rotate: "45deg" }, { translateX: -3 }, { translateY: 2 }],
  },
  checkR: {
    position: "absolute",
    width: 12,
    height: 2.5,
    borderRadius: 1.5,
    transform: [{ rotate: "-45deg" }, { translateX: 3 }, { translateY: -1 }],
  },
  statusDash: { width: 12, height: 2.5, borderRadius: 1.5 },
  statusTitle: { fontFamily: "Inter_700Bold", fontSize: 17 },
  progressRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  progressBar: { flex: 1, height: 8, overflow: "hidden" },
  progressFill: { height: "100%" },
  progressLabel: { fontFamily: "Inter_700Bold", fontSize: 14 },
  unlockedMsg: { fontFamily: "Inter_500Medium", fontSize: 12 },
  label: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 10,
    letterSpacing: 0.6,
    marginTop: 4,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    paddingHorizontal: 12,
    gap: 10,
  },
  inputIcon: {
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  codeBracket: {
    width: 12,
    height: 14,
    borderWidth: 1.5,
    borderRadius: 2,
    borderRightWidth: 0,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },
  codeLine: { width: 6, height: 2, borderRadius: 1, position: "absolute", right: 0 },
  input: { flex: 1, paddingVertical: 12, fontSize: 14 },
  verifyBtn: { paddingVertical: 15, alignItems: "center" },
  verifyBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 15 },
  sectionTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 10,
    letterSpacing: 0.8,
    marginTop: 4,
  },
  stepRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  stepNum: { width: 22, height: 22, alignItems: "center", justifyContent: "center" },
  stepNumText: { fontFamily: "Inter_700Bold", fontSize: 11 },
  stepText: { fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 19, flex: 1 },
  blockingCard: { borderWidth: 1, overflow: "hidden" },
  blockingRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    gap: 10,
  },
  igIcon: { width: 22, height: 22, borderWidth: 2, borderRadius: 6 },
  ytIcon: { width: 22, height: 16 },
  blockingLabel: { fontFamily: "Inter_500Medium", fontSize: 14, flex: 1 },
  blockPill: { paddingHorizontal: 10, paddingVertical: 4 },
  blockPillText: { fontFamily: "Inter_600SemiBold", fontSize: 11 },
  divider: { height: 1 },
});
