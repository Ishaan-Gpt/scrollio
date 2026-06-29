import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useColors } from "@/hooks/useColors";

interface StreakBadgeProps {
  streak: number;
  label?: string;
  size?: "sm" | "md" | "lg";
}

export function StreakBadge({ streak, label = "day streak", size = "md" }: StreakBadgeProps) {
  const colors = useColors();

  const fontSize = size === "lg" ? 36 : size === "md" ? 24 : 16;
  const labelSize = size === "lg" ? 11 : size === "md" ? 10 : 9;
  const pad = size === "lg" ? 16 : size === "md" ? 12 : 8;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.yellow,
          borderColor: colors.yellowDark,
          borderRadius: colors.radius,
          padding: pad,
        },
      ]}
    >
      <View style={styles.row}>
        {/* Custom flame icon */}
        <View style={[styles.flame, { marginRight: 4 }]}>
          <View style={[styles.flameOuter, { backgroundColor: colors.yellowDark }]} />
          <View style={[styles.flameInner, { backgroundColor: colors.yellow }]} />
        </View>
        <Text
          style={[
            styles.number,
            { color: colors.foreground, fontSize },
          ]}
        >
          {streak}
        </Text>
      </View>
      <Text
        style={[
          styles.label,
          { color: colors.mutedForeground, fontSize: labelSize },
        ]}
      >
        {label.toUpperCase()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    alignItems: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  flame: {
    width: 14,
    height: 18,
    position: "relative",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  flameOuter: {
    width: 12,
    height: 16,
    borderRadius: 6,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
    position: "absolute",
    bottom: 0,
  },
  flameInner: {
    width: 6,
    height: 8,
    borderRadius: 3,
    position: "absolute",
    bottom: 2,
  },
  number: {
    fontFamily: "Inter_700Bold",
    lineHeight: 40,
  },
  label: {
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.5,
    marginTop: 2,
  },
});
