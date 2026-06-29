import { BlurView } from "expo-blur";
import { Tabs } from "expo-router";
import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import { useColors } from "@/hooks/useColors";

export default function TabLayout() {
  const colors = useColors();
  const isIOS = Platform.OS === "ios";
  const isWeb = Platform.OS === "web";

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.green,
        tabBarInactiveTintColor: colors.mutedForeground,
        headerShown: false,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: isIOS ? "transparent" : colors.background,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          elevation: 0,
          height: isWeb ? 84 : 56,
        },
        tabBarBackground: () =>
          isIOS ? (
            <BlurView
              intensity={90}
              tint="light"
              style={StyleSheet.absoluteFill}
            />
          ) : (
            <View
              style={[
                StyleSheet.absoluteFill,
                { backgroundColor: colors.background },
              ]}
            />
          ),
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontFamily: "Inter_600SemiBold",
          fontSize: 9,
          letterSpacing: 0.4,
          marginBottom: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Today",
          tabBarIcon: ({ color, focused }) => (
            <View style={[tabIconStyles.wrap, focused && { backgroundColor: colors.greenLight, borderRadius: 8 }]}>
              {/* Sun icon */}
              <View style={[tabIconStyles.sun, { borderColor: color }]}>
                <View style={[tabIconStyles.sunCenter, { backgroundColor: color }]} />
              </View>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <View style={[tabIconStyles.wrap, focused && { backgroundColor: colors.greenLight, borderRadius: 8 }]}>
              {/* Person icon */}
              <View style={[tabIconStyles.personHead, { borderColor: color, backgroundColor: "transparent", borderWidth: 2 }]} />
              <View style={[tabIconStyles.personBody, { borderColor: color, borderWidth: 2 }]} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="unlock"
        options={{
          title: "Unlock",
          tabBarIcon: ({ color, focused }) => (
            <View style={[tabIconStyles.wrap, focused && { backgroundColor: colors.yellowLight, borderRadius: 8 }]}>
              {/* Key icon */}
              <View style={[tabIconStyles.keyRing, { borderColor: color, borderWidth: 2 }]} />
              <View style={[tabIconStyles.keyShaft, { backgroundColor: color }]} />
              <View style={[tabIconStyles.keyTooth, { backgroundColor: color }]} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, focused }) => (
            <View style={[tabIconStyles.wrap, focused && { backgroundColor: colors.greenLight, borderRadius: 8 }]}>
              {/* Gear icon */}
              <View style={[tabIconStyles.gearOuter, { borderColor: color, borderWidth: 2 }]}>
                <View style={[tabIconStyles.gearInner, { borderColor: color, borderWidth: 1.5 }]} />
              </View>
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const tabIconStyles = StyleSheet.create({
  wrap: {
    width: 30,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  sun: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  sunCenter: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  personHead: {
    width: 10,
    height: 10,
    borderRadius: 5,
    position: "absolute",
    top: 0,
  },
  personBody: {
    width: 16,
    height: 8,
    borderRadius: 8,
    position: "absolute",
    bottom: 0,
  },
  podium: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 2,
  },
  bar: {
    width: 5,
    borderRadius: 2,
  },
  keyRing: {
    width: 10,
    height: 10,
    borderRadius: 5,
    position: "absolute",
    left: 2,
    top: 4,
  },
  keyShaft: {
    width: 12,
    height: 3,
    borderRadius: 1.5,
    position: "absolute",
    right: 2,
    top: 9,
  },
  keyTooth: {
    width: 3,
    height: 5,
    borderRadius: 1,
    position: "absolute",
    right: 4,
    top: 12,
  },
  gearOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  gearInner: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
});
