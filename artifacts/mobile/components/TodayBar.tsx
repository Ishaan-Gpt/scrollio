import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useColors } from "@/hooks/useColors";
import { useStats } from "@/context/StatsContext";

export function TodayBar() {
  const colors = useColors();
  const { stats } = useStats();

  const hoursWatched = Math.floor(stats.minutesWatched / 60);
  const minsWatched = stats.minutesWatched % 60;
  const timeStr =
    hoursWatched > 0
      ? `${hoursWatched}h ${minsWatched}m`
      : `${minsWatched}m`;

  return (
    <View
      style={[
        styles.bar,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderRadius: colors.radius,
        },
      ]}
    >
      <View style={styles.item}>
        <Text style={[styles.value, { color: colors.foreground }]}>
          {stats.reelsSeen}
        </Text>
        <Text style={[styles.label, { color: colors.mutedForeground }]}>
          REELS
        </Text>
      </View>
      <View style={[styles.divider, { backgroundColor: colors.border }]} />
      <View style={styles.item}>
        <Text style={[styles.value, { color: colors.foreground }]}>
          {stats.instagramReels}
        </Text>
        <Text style={[styles.label, { color: colors.mutedForeground }]}>
          IG
        </Text>
      </View>
      <View style={[styles.divider, { backgroundColor: colors.border }]} />
      <View style={styles.item}>
        <Text style={[styles.value, { color: colors.foreground }]}>
          {stats.youtubeShorts}
        </Text>
        <Text style={[styles.label, { color: colors.mutedForeground }]}>
          YT
        </Text>
      </View>
      <View style={[styles.divider, { backgroundColor: colors.border }]} />
      <View style={styles.item}>
        <Text style={[styles.value, { color: colors.foreground }]}>
          {timeStr}
        </Text>
        <Text style={[styles.label, { color: colors.mutedForeground }]}>
          TIME
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    borderWidth: 1,
    overflow: "hidden",
  },
  item: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
  },
  divider: {
    width: 1,
  },
  value: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
  },
  label: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 9,
    letterSpacing: 0.5,
    marginTop: 1,
  },
});
