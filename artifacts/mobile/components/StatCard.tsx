import React from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { useColors } from "@/hooks/useColors";

interface StatCardProps {
  label: string;
  value: string | number;
  sublabel?: string;
  accent?: "green" | "yellow" | "default";
  compact?: boolean;
}

export function StatCard({
  label,
  value,
  sublabel,
  accent = "default",
  compact = false,
}: StatCardProps) {
  const colors = useColors();

  const bg =
    accent === "green"
      ? colors.greenLight
      : accent === "yellow"
        ? colors.yellowLight
        : colors.card;

  const borderColor =
    accent === "green"
      ? colors.green
      : accent === "yellow"
        ? colors.yellowDark
        : colors.border;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: bg,
          borderColor,
          borderRadius: colors.radius,
          paddingVertical: compact ? 8 : 12,
          paddingHorizontal: compact ? 10 : 14,
        },
      ]}
    >
      <Text
        style={[
          styles.value,
          {
            color: colors.foreground,
            fontSize: compact ? 22 : 28,
          },
        ]}
      >
        {value}
      </Text>
      <Text
        style={[
          styles.label,
          {
            color: colors.mutedForeground,
            fontSize: compact ? 9 : 10,
          },
        ]}
      >
        {label.toUpperCase()}
      </Text>
      {sublabel ? (
        <Text style={[styles.sublabel, { color: colors.mutedForeground }]}>
          {sublabel}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    flex: 1,
  },
  value: {
    fontFamily: "Inter_700Bold",
    lineHeight: 32,
  },
  label: {
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.6,
    marginTop: 2,
  },
  sublabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 9,
    marginTop: 1,
  },
});
