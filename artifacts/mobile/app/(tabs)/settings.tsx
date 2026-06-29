import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Platform,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useStats, NativeScrollio } from "@/context/StatsContext";
import { useEffect } from "react";

const isAndroid = Platform.OS === "android";

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { resetToday } = useStats();

  const [blockingStatus, setBlockingStatus] = useState({
    blockingEnabled: false,
    instagramBlocked: true,
    youtubeBlocked: true,
    instagramLimit: 10,
    youtubeLimit: 10,
    unlockedUntil: null as string | null
  });

  const loadSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem("scrollio_local_blocking");
      let current = stored ? JSON.parse(stored) : {
        blockingEnabled: false,
        instagramBlocked: true,
        youtubeBlocked: true,
        instagramLimit: 10,
        youtubeLimit: 10,
        unlockedUntil: null
      };

      if (current.instagramLimit === undefined) current.instagramLimit = 10;
      if (current.youtubeLimit === undefined) current.youtubeLimit = 10;

      if (isAndroid) {
        const nativeStatus = await NativeScrollio.getBlockingStatus();
        if (nativeStatus) {
          current = {
            ...current,
            blockingEnabled: nativeStatus.blockingEnabled,
            instagramLimit: nativeStatus.instagramLimit,
            youtubeLimit: nativeStatus.youtubeLimit,
            unlockedUntil: nativeStatus.unlockedUntil > 0 ? new Date(nativeStatus.unlockedUntil).toISOString() : null
          };
        }
      }

      setBlockingStatus(current);
    } catch {}
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const saveSettings = async (updated: typeof blockingStatus) => {
    setBlockingStatus(updated);
    await AsyncStorage.setItem("scrollio_local_blocking", JSON.stringify(updated));
    if (isAndroid) {
      NativeScrollio.setBlockingEnabled(updated.blockingEnabled);
      NativeScrollio.setLimit("instagram", updated.instagramLimit);
      NativeScrollio.setLimit("youtube", updated.youtubeLimit);
      if (updated.unlockedUntil) {
        NativeScrollio.setUnlockedUntil(new Date(updated.unlockedUntil).getTime());
      } else {
        NativeScrollio.setUnlockedUntil(0);
      }
    }
  };

  const toggleBlocking = async (enabled: boolean) => {
    if (!user) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const updated = {
      ...blockingStatus,
      blockingEnabled: enabled
    };
    await saveSettings(updated);
  };

  const toggleInstagram = async (blocked: boolean) => {
    if (!user) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const updated = {
      ...blockingStatus,
      instagramBlocked: blocked
    };
    await saveSettings(updated);
  };

  const toggleYoutube = async (blocked: boolean) => {
    if (!user) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const updated = {
      ...blockingStatus,
      youtubeBlocked: blocked
    };
    await saveSettings(updated);
  };

  const handleUpdateLimit = async (app: "instagram" | "youtube", change: number) => {
    if (!user) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const updated = {
      ...blockingStatus,
      instagramLimit: app === "instagram" ? Math.max(1, blockingStatus.instagramLimit + change) : blockingStatus.instagramLimit,
      youtubeLimit: app === "youtube" ? Math.max(1, blockingStatus.youtubeLimit + change) : blockingStatus.youtubeLimit,
    };
    await saveSettings(updated);
  };

  const handleResetStats = () => {
    Alert.alert(
      "Reset Today's Stats",
      "This will clear today's local tracking data. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: () => {
            resetToday();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
      ]
    );
  };

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
      >
        <Text style={[styles.title, { color: colors.foreground }]}>
          Settings
        </Text>

        {/* Blocking section */}
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
          APP BLOCKING
        </Text>
        <View
          style={[
            styles.section,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderRadius: colors.radius,
            },
          ]}
        >
          <SettingRow
            label="Enable Blocking"
            sublabel="Block apps until 2 LeetCode problems solved"
            value={blockingStatus?.blockingEnabled ?? false}
            onToggle={toggleBlocking}
            colors={colors}
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <SettingRow
            label="Block Instagram"
            sublabel="Reels tracking + daily block"
            value={blockingStatus?.instagramBlocked ?? true}
            onToggle={toggleInstagram}
            colors={colors}
            disabled={!blockingStatus?.blockingEnabled}
          />
          {blockingStatus.blockingEnabled && blockingStatus.instagramBlocked && (
            <>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <View style={settingStyles.limitRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.actionLabel, { color: colors.foreground }]}>Instagram Reels Limit</Text>
                  <Text style={[settingStyles.sublabel, { color: colors.mutedForeground }]}>Max reels before block</Text>
                </View>
                <View style={settingStyles.limitControls}>
                  <TouchableOpacity onPress={() => handleUpdateLimit("instagram", -5)} style={[settingStyles.limitBtn, { backgroundColor: colors.border }]}>
                    <Text style={{ color: colors.foreground, fontWeight: "bold" }}>-5</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleUpdateLimit("instagram", -1)} style={[settingStyles.limitBtn, { backgroundColor: colors.border }]}>
                    <Text style={{ color: colors.foreground, fontWeight: "bold" }}>-</Text>
                  </TouchableOpacity>
                  <Text style={[settingStyles.limitText, { color: colors.foreground }]}>{blockingStatus.instagramLimit}</Text>
                  <TouchableOpacity onPress={() => handleUpdateLimit("instagram", 1)} style={[settingStyles.limitBtn, { backgroundColor: colors.border }]}>
                    <Text style={{ color: colors.foreground, fontWeight: "bold" }}>+</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleUpdateLimit("instagram", 5)} style={[settingStyles.limitBtn, { backgroundColor: colors.border }]}>
                    <Text style={{ color: colors.foreground, fontWeight: "bold" }}>+5</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <SettingRow
            label="Block YouTube"
            sublabel="Shorts tracking + daily block"
            value={blockingStatus?.youtubeBlocked ?? true}
            onToggle={toggleYoutube}
            colors={colors}
            disabled={!blockingStatus?.blockingEnabled}
          />
          {blockingStatus.blockingEnabled && blockingStatus.youtubeBlocked && (
            <>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <View style={settingStyles.limitRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.actionLabel, { color: colors.foreground }]}>YouTube Shorts Limit</Text>
                  <Text style={[settingStyles.sublabel, { color: colors.mutedForeground }]}>Max shorts before block</Text>
                </View>
                <View style={settingStyles.limitControls}>
                  <TouchableOpacity onPress={() => handleUpdateLimit("youtube", -5)} style={[settingStyles.limitBtn, { backgroundColor: colors.border }]}>
                    <Text style={{ color: colors.foreground, fontWeight: "bold" }}>-5</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleUpdateLimit("youtube", -1)} style={[settingStyles.limitBtn, { backgroundColor: colors.border }]}>
                    <Text style={{ color: colors.foreground, fontWeight: "bold" }}>-</Text>
                  </TouchableOpacity>
                  <Text style={[settingStyles.limitText, { color: colors.foreground }]}>{blockingStatus.youtubeLimit}</Text>
                  <TouchableOpacity onPress={() => handleUpdateLimit("youtube", 1)} style={[settingStyles.limitBtn, { backgroundColor: colors.border }]}>
                    <Text style={{ color: colors.foreground, fontWeight: "bold" }}>+</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleUpdateLimit("youtube", 5)} style={[settingStyles.limitBtn, { backgroundColor: colors.border }]}>
                    <Text style={{ color: colors.foreground, fontWeight: "bold" }}>+5</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}
        </View>

        {/* Stats section */}
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
          DATA
        </Text>
        <View
          style={[
            styles.section,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderRadius: colors.radius,
            },
          ]}
        >
          <TouchableOpacity
            style={styles.actionRow}
            onPress={handleResetStats}
            activeOpacity={0.8}
          >
            <View>
              <Text style={[styles.actionLabel, { color: colors.destructive }]}>
                Reset Today's Stats
              </Text>
              <Text style={[styles.actionSublabel, { color: colors.mutedForeground }]}>
                Clears local tracking for today
              </Text>
            </View>
            <View style={[styles.arrowIcon, { borderColor: colors.destructive }]}>
              <View style={[styles.arrowLine, { backgroundColor: colors.destructive }]} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Profile summary */}
        {user && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
              PROFILE
            </Text>
            <View
              style={[
                styles.section,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  borderRadius: colors.radius,
                },
              ]}
            >
              <View style={styles.userRow}>
                <View
                  style={[
                    styles.avatar,
                    { backgroundColor: colors.green, borderRadius: 8 },
                  ]}
                >
                  <Text style={[styles.avatarText, { color: colors.primaryForeground }]}>
                    {user.displayName.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.userInfo}>
                  <Text style={[styles.userName, { color: colors.foreground }]}>
                    {user.displayName}
                  </Text>
                  <Text style={[styles.userHandle, { color: colors.mutedForeground }]}>
                    @{user.username}
                  </Text>
                </View>
              </View>
            </View>
          </>
        )}

        {/* About */}
        <View
          style={[
            styles.aboutCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderRadius: colors.radius,
            },
          ]}
        >
          <Text style={[styles.aboutTitle, { color: colors.foreground }]}>
            scroll.io
          </Text>
          <Text style={[styles.aboutSub, { color: colors.mutedForeground }]}>
            v1.0.0 — Digital wellness tracker
          </Text>
          <Text style={[styles.aboutText, { color: colors.mutedForeground }]}>
            Track reels, block distractions, earn your screen time through LeetCode.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

function SettingRow({
  label,
  sublabel,
  value,
  onToggle,
  colors,
  disabled = false,
}: {
  label: string;
  sublabel: string;
  value: boolean;
  onToggle: (v: boolean) => void;
  colors: ReturnType<typeof import("@/hooks/useColors").useColors>;
  disabled?: boolean;
}) {
  return (
    <View style={[settingStyles.row, { opacity: disabled ? 0.5 : 1 }]}>
      <View style={settingStyles.info}>
        <Text style={[settingStyles.label, { color: colors.foreground }]}>{label}</Text>
        <Text style={[settingStyles.sublabel, { color: colors.mutedForeground }]}>
          {sublabel}
        </Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        disabled={disabled}
        trackColor={{ false: colors.muted, true: colors.green }}
        thumbColor={colors.background}
      />
    </View>
  );
}

const settingStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 12,
  },
  info: { flex: 1 },
  label: { fontFamily: "Inter_500Medium", fontSize: 14 },
  sublabel: { fontFamily: "Inter_400Regular", fontSize: 11, marginTop: 2 },
  limitRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  limitControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  limitBtn: {
    width: 32,
    height: 32,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  limitText: {
    fontFamily: "Inter_700Bold",
    fontSize: 14,
    width: 24,
    textAlign: "center",
  },
});

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: 16, gap: 12 },
  title: { fontFamily: "Inter_700Bold", fontSize: 24 },
  sectionTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 10,
    letterSpacing: 0.8,
    marginTop: 4,
  },
  section: { borderWidth: 1, overflow: "hidden" },
  divider: { height: 1 },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
  },
  actionLabel: { fontFamily: "Inter_500Medium", fontSize: 14 },
  actionSublabel: { fontFamily: "Inter_400Regular", fontSize: 11, marginTop: 2 },
  arrowIcon: {
    width: 20,
    height: 20,
    borderWidth: 1.5,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  arrowLine: { width: 8, height: 1.5, borderRadius: 1 },
  noteCard: { borderWidth: 1, padding: 14, gap: 6 },
  noteTitle: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
  noteText: { fontFamily: "Inter_400Regular", fontSize: 12, lineHeight: 18 },
  userRow: { flexDirection: "row", alignItems: "center", padding: 14, gap: 12 },
  avatar: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  avatarText: { fontFamily: "Inter_700Bold", fontSize: 18 },
  userInfo: { flex: 1 },
  userName: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  userHandle: { fontFamily: "Inter_400Regular", fontSize: 12 },
  aboutCard: { borderWidth: 1, padding: 14, gap: 4, alignItems: "center" },
  aboutTitle: { fontFamily: "Inter_700Bold", fontSize: 18 },
  aboutSub: { fontFamily: "Inter_400Regular", fontSize: 11 },
  aboutText: { fontFamily: "Inter_400Regular", fontSize: 12, textAlign: "center", marginTop: 4 },
});
