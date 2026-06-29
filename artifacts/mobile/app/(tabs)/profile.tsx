import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  RefreshControl,
  TextInput,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { ProfileCard } from "@/components/ProfileCard";
import { StatCard } from "@/components/StatCard";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect } from "react";

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, resetProfile, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName ?? "");
  const [bio, setBio] = useState(user?.bio ?? "");
  const [refreshing, setRefreshing] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  const loadHistory = async () => {
    try {
      const list = [];
      const today = new Date();
      for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateStr = date.toISOString().split("T")[0]!;

        const stored = await AsyncStorage.getItem(`scrollio_daily_stats_${dateStr}`);
        if (stored) {
          const parsed = JSON.parse(stored);
          list.push({
            date: dateStr,
            reelsSeen: parsed.reelsSeen ?? 0,
            instagramReels: parsed.instagramReels ?? 0,
            youtubeShorts: parsed.youtubeShorts ?? 0,
            minutesWatched: parsed.minutesWatched ?? 0,
            appsBlocked: parsed.reelsSeen > 0, 
          });
        } else {
          list.push({
            date: dateStr,
            reelsSeen: 0,
            instagramReels: 0,
            youtubeShorts: 0,
            minutesWatched: 0,
            appsBlocked: false,
          });
        }
      }
      setHistory(list);
    } catch {}
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHistory();
    setRefreshing(false);
  };

  const handleSave = async () => {
    if (!user) return;
    try {
      updateUser({
        ...user,
        displayName,
        bio,
      });
      setEditing(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      Alert.alert("Error", "Failed to update profile");
    }
  };

  const handleReset = () => {
    Alert.alert(
      "Reset Profile",
      "This clears your display name, bio, and LeetCode username. Tracking history is kept.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            await resetProfile();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
      ]
    );
  };

  if (!user) return null;

  const p = user;

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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.green}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.titleRow}>
          <Text style={[styles.screenTitle, { color: colors.foreground }]}>
            Profile
          </Text>
          <TouchableOpacity
            onPress={() => setEditing(!editing)}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.editBtn,
                {
                  backgroundColor: editing ? colors.green : colors.muted,
                  borderRadius: colors.radius,
                },
              ]}
            >
              <Text
                style={[
                  styles.editBtnText,
                  {
                    color: editing
                      ? colors.primaryForeground
                      : colors.foreground,
                  },
                ]}
              >
                {editing ? "Done" : "Edit"}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {editing ? (
          <View
            style={[
              styles.editCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                borderRadius: colors.radius,
              },
            ]}
          >
            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>
              DISPLAY NAME
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  color: colors.foreground,
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                  borderRadius: colors.radius - 2,
                  fontFamily: "Inter_400Regular",
                },
              ]}
              value={displayName}
              onChangeText={setDisplayName}
              placeholderTextColor={colors.mutedForeground}
            />
            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>
              BIO
            </Text>
            <TextInput
              style={[
                styles.input,
                styles.bioInput,
                {
                  color: colors.foreground,
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                  borderRadius: colors.radius - 2,
                  fontFamily: "Inter_400Regular",
                },
              ]}
              value={bio}
              onChangeText={setBio}
              multiline
              numberOfLines={3}
              placeholderTextColor={colors.mutedForeground}
              placeholder="Tell others about your scroll goals..."
            />
            <TouchableOpacity
              style={[
                styles.saveBtn,
                { backgroundColor: colors.green, borderRadius: colors.radius },
              ]}
              onPress={handleSave}
              activeOpacity={0.85}
            >
              <Text style={[styles.saveBtnText, { color: colors.primaryForeground }]}>
                Save Changes
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ProfileCard
            displayName={p.displayName}
            username={p.username}
            bio={p.bio}
            totalReelsSeen={p.totalReelsSeen ?? 0}
            totalMinutesWatched={p.totalMinutesWatched ?? 0}
            currentStreak={p.currentStreak ?? 0}
            bestStreak={p.bestStreak ?? 0}
            totalDaysBlocked={p.totalDaysBlocked ?? 0}
          />
        )}

        {/* History chart (last 7 days) */}
        {history && history.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
              LAST 7 DAYS
            </Text>
            <View
              style={[
                styles.historyCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  borderRadius: colors.radius,
                },
              ]}
            >
              <View style={styles.chartRow}>
                {history.slice(0, 7).reverse().map((day, i) => {
                  const maxReels = Math.max(...history.slice(0, 7).map((d) => d.reelsSeen), 1);
                  const h = Math.max(4, (day.reelsSeen / maxReels) * 60);
                  const isBlocked = day.appsBlocked;
                  return (
                    <View key={i} style={styles.chartBarWrap}>
                      <View
                        style={[
                          styles.chartBar,
                          {
                            height: h,
                            backgroundColor: isBlocked ? colors.green : colors.muted,
                            borderRadius: 3,
                          },
                        ]}
                      />
                      <Text style={[styles.chartLabel, { color: colors.mutedForeground }]}>
                        {new Date(day.date).toLocaleDateString("en", { weekday: "narrow" })}
                      </Text>
                    </View>
                  );
                })}
              </View>
              <View style={styles.legendRow}>
                <View style={[styles.legendDot, { backgroundColor: colors.green }]} />
                <Text style={[styles.legendText, { color: colors.mutedForeground }]}>
                  Blocked day
                </Text>
                <View style={[styles.legendDot, { backgroundColor: colors.muted }]} />
                <Text style={[styles.legendText, { color: colors.mutedForeground }]}>
                  Open day
                </Text>
              </View>
            </View>
          </>
        )}

        {/* Reset */}
        <TouchableOpacity
          style={[
            styles.logoutBtn,
            { borderColor: colors.border, borderRadius: colors.radius },
          ]}
          onPress={handleReset}
          activeOpacity={0.8}
        >
          <Text style={[styles.logoutText, { color: colors.destructive }]}>
            Reset Profile
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    padding: 24,
  },
  promptText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    textAlign: "center",
  },
  btn: { paddingVertical: 14, paddingHorizontal: 32 },
  btnText: { fontFamily: "Inter_600SemiBold", fontSize: 15 },
  content: { paddingHorizontal: 16, gap: 12 },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  screenTitle: { fontFamily: "Inter_700Bold", fontSize: 24 },
  editBtn: { paddingHorizontal: 14, paddingVertical: 6 },
  editBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
  editCard: { borderWidth: 1, padding: 14, gap: 8 },
  fieldLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 10,
    letterSpacing: 0.6,
    marginTop: 4,
  },
  input: {
    borderWidth: 1,
    padding: 10,
    fontSize: 14,
  },
  bioInput: { height: 72, textAlignVertical: "top" },
  saveBtn: { paddingVertical: 12, alignItems: "center", marginTop: 4 },
  saveBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  sectionTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 10,
    letterSpacing: 0.8,
    marginTop: 4,
  },
  historyCard: { borderWidth: 1, padding: 14 },
  chartRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 6,
    height: 72,
  },
  chartBarWrap: { flex: 1, alignItems: "center", justifyContent: "flex-end", gap: 4 },
  chartBar: { width: "100%" },
  chartLabel: { fontFamily: "Inter_400Regular", fontSize: 9 },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 10,
  },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontFamily: "Inter_400Regular", fontSize: 10, marginRight: 8 },
  logoutBtn: {
    borderWidth: 1,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  logoutText: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
});
