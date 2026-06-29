import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  AppState,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { NativeScrollio } from "@/context/StatsContext";

const isAndroid = Platform.OS === "android";

interface PermissionState {
  accessibility: boolean;
  overlay: boolean;
  checked: boolean;
}

async function checkPermissions(): Promise<PermissionState> {
  const [accessibility, overlay] = await Promise.all([
    NativeScrollio.isAccessibilityServiceEnabled(),
    NativeScrollio.isOverlayPermissionGranted(),
  ]);
  return { accessibility, overlay, checked: true };
}

export function PermissionGate({ children }: { children: React.ReactNode }) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [state, setState] = useState<PermissionState>({
    accessibility: false,
    overlay: false,
    checked: false,
  });
  const appState = useRef(AppState.currentState);

  const refresh = useCallback(async () => {
    if (!isAndroid) {
      setState({ accessibility: true, overlay: true, checked: true });
      return;
    }
    setState(await checkPermissions());
  }, []);

  useEffect(() => {
    refresh();
    const sub = AppState.addEventListener("change", (next) => {
      if (appState.current.match(/inactive|background/) && next === "active") {
        refresh();
      }
      appState.current = next;
    });
    return () => sub.remove();
  }, [refresh]);

  if (!state.checked) {
    return <View style={[styles.root, { backgroundColor: colors.background }]} />;
  }

  const allGranted = state.accessibility && state.overlay;
  if (allGranted) {
    return <>{children}</>;
  }

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: topPad + 24, paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: colors.foreground }]}>
          scroll.io needs two permissions
        </Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Both are required for auto-tracking and blocking to work. Nothing in this app
          functions until they're granted — there's no manual fallback.
        </Text>

        <PermissionRow
          colors={colors}
          granted={state.accessibility}
          title="Accessibility Service"
          description="Lets scroll.io detect when you're scrolling Reels or Shorts, automatically — no button to press."
          onPress={() => NativeScrollio.openAccessibilitySettings()}
        />

        <PermissionRow
          colors={colors}
          granted={state.overlay}
          title="Display over other apps"
          description="Lets scroll.io show the un-dismissable block screen directly on top of Instagram/YouTube once you hit your limit."
          onPress={() => NativeScrollio.openOverlaySettings()}
        />

        <Text style={[styles.hint, { color: colors.mutedForeground }]}>
          After granting a permission in Settings, come back here — this screen rechecks automatically.
        </Text>

        <TouchableOpacity
          style={[styles.recheckBtn, { borderColor: colors.border, borderRadius: colors.radius }]}
          onPress={refresh}
          activeOpacity={0.8}
        >
          <Text style={[styles.recheckText, { color: colors.foreground }]}>Recheck now</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function PermissionRow({
  colors,
  granted,
  title,
  description,
  onPress,
}: {
  colors: ReturnType<typeof useColors>;
  granted: boolean;
  title: string;
  description: string;
  onPress: () => void;
}) {
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: granted ? colors.green : colors.border,
          borderRadius: colors.radius,
        },
      ]}
    >
      <View style={styles.cardHeader}>
        <View
          style={[
            styles.statusDot,
            { backgroundColor: granted ? colors.green : colors.muted },
          ]}
        />
        <Text style={[styles.cardTitle, { color: colors.foreground }]}>{title}</Text>
        <Text style={[styles.cardStatus, { color: granted ? colors.green : colors.mutedForeground }]}>
          {granted ? "Granted" : "Required"}
        </Text>
      </View>
      <Text style={[styles.cardDesc, { color: colors.mutedForeground }]}>{description}</Text>
      {!granted && (
        <TouchableOpacity
          style={[styles.grantBtn, { backgroundColor: colors.green, borderRadius: colors.radius }]}
          onPress={onPress}
          activeOpacity={0.85}
        >
          <Text style={[styles.grantText, { color: colors.primaryForeground }]}>
            Open Settings
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: 20, gap: 14 },
  title: { fontFamily: "Inter_700Bold", fontSize: 24 },
  subtitle: { fontFamily: "Inter_400Regular", fontSize: 14, lineHeight: 20 },
  card: { borderWidth: 1.5, padding: 16, gap: 8 },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  cardTitle: { fontFamily: "Inter_600SemiBold", fontSize: 15, flex: 1 },
  cardStatus: { fontFamily: "Inter_600SemiBold", fontSize: 11 },
  cardDesc: { fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 19 },
  grantBtn: { paddingVertical: 12, alignItems: "center", marginTop: 4 },
  grantText: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  hint: { fontFamily: "Inter_400Regular", fontSize: 12, lineHeight: 17, textAlign: "center" },
  recheckBtn: { borderWidth: 1, paddingVertical: 13, alignItems: "center" },
  recheckText: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
});
