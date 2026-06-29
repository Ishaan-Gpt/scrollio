import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useColors } from "@/hooks/useColors";
import { StatCard } from "./StatCard";
import { StreakBadge } from "./StreakBadge";

interface ProfileCardProps {
  displayName: string;
  username: string;
  bio?: string | null;
  totalReelsSeen: number;
  totalMinutesWatched: number;
  currentStreak: number;
  bestStreak: number;
  totalDaysBlocked: number;
  rank?: number;
  compact?: boolean;
}

export function ProfileCard({
  displayName,
  username,
  bio,
  totalReelsSeen,
  totalMinutesWatched,
  currentStreak,
  bestStreak,
  totalDaysBlocked,
  rank,
  compact = false,
}: ProfileCardProps) {
  const colors = useColors();

  const hoursWatched = Math.floor(totalMinutesWatched / 60);
  const minsWatched = totalMinutesWatched % 60;
  const watchedStr =
    hoursWatched > 0 ? `${hoursWatched}h ${minsWatched}m` : `${minsWatched}m`;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderRadius: colors.radius,
        },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        {/* Avatar */}
        <View
          style={[
            styles.avatar,
            {
              backgroundColor: colors.green,
              borderRadius: colors.radius,
            },
          ]}
        >
          <Text style={[styles.avatarText, { color: colors.primaryForeground }]}>
            {displayName.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.headerInfo}>
          <View style={styles.nameRow}>
            <Text
              style={[
                styles.displayName,
                { color: colors.foreground },
              ]}
              numberOfLines={1}
            >
              {displayName}
            </Text>
            {rank != null && rank <= 100 && (
              <View
                style={[
                  styles.rankBadge,
                  { backgroundColor: colors.yellow, borderColor: colors.yellowDark },
                ]}
              >
                <Text style={[styles.rankText, { color: colors.foreground }]}>
                  #{rank}
                </Text>
              </View>
            )}
          </View>
          <Text style={[styles.username, { color: colors.mutedForeground }]}>
            @{username}
          </Text>
          {bio ? (
            <Text
              style={[styles.bio, { color: colors.foreground }]}
              numberOfLines={2}
            >
              {bio}
            </Text>
          ) : null}
        </View>
      </View>

      {/* Stats grid */}
      <View style={styles.statsGrid}>
        <StatCard
          label="Reels Seen"
          value={totalReelsSeen}
          accent="default"
          compact
        />
        <StatCard
          label="Time Watched"
          value={watchedStr}
          accent="default"
          compact
        />
        <StatCard
          label="Days Blocked"
          value={totalDaysBlocked}
          accent="green"
          compact
        />
      </View>

      {/* Streak */}
      <View style={styles.streakRow}>
        <StreakBadge streak={currentStreak} label="current streak" size="md" />
        <View style={[styles.bestStreak, { backgroundColor: colors.greenLight, borderColor: colors.green, borderRadius: colors.radius }]}>
          <Text style={[styles.bestStreakNum, { color: colors.foreground }]}>{bestStreak}</Text>
          <Text style={[styles.bestStreakLabel, { color: colors.mutedForeground }]}>BEST</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    padding: 14,
    gap: 12,
  },
  header: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  avatar: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontFamily: "Inter_700Bold",
    fontSize: 22,
  },
  headerInfo: {
    flex: 1,
    gap: 2,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  displayName: {
    fontFamily: "Inter_700Bold",
    fontSize: 17,
    flex: 1,
  },
  rankBadge: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  rankText: {
    fontFamily: "Inter_700Bold",
    fontSize: 11,
  },
  username: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
  },
  bio: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    marginTop: 2,
  },
  statsGrid: {
    flexDirection: "row",
    gap: 8,
  },
  streakRow: {
    flexDirection: "row",
    gap: 8,
  },
  bestStreak: {
    flex: 1,
    borderWidth: 1,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  bestStreakNum: {
    fontFamily: "Inter_700Bold",
    fontSize: 24,
  },
  bestStreakLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 10,
    letterSpacing: 0.5,
  },
});
