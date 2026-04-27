import { useAuth } from "@clerk/expo";
import { setAuthTokenGetter } from "@workspace/api-client-react";
import { BlurView } from "expo-blur";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { Redirect, Tabs } from "expo-router";
import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";
import { SymbolView } from "expo-symbols";
import { Feather } from "@expo/vector-icons";
import React, { useEffect } from "react";
import { Platform, StyleSheet, View, useColorScheme } from "react-native";

import { useColors } from "@/hooks/useColors";

function NativeTabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <Icon sf={{ default: "bubble.left", selected: "bubble.left.fill" }} />
        <Label>Chat</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="history">
        <Icon sf={{ default: "book", selected: "book.fill" }} />
        <Label>Notebooks</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

function ClassicTabLayout() {
  const colors = useColors();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const isIOS = Platform.OS === "ios";
  const isWeb = Platform.OS === "web";

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.secondary,
        tabBarInactiveTintColor: colors.mutedForeground,
        headerShown: false,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: isIOS ? "transparent" : colors.background,
          borderTopWidth: isWeb ? 1 : StyleSheet.hairlineWidth,
          borderTopColor: colors.border,
          elevation: 0,
          ...(isWeb ? { height: 84 } : {}),
        },
        tabBarBackground: () =>
          isIOS ? (
            <BlurView
              intensity={90}
              tint={isDark ? "dark" : "extraLight"}
              style={StyleSheet.absoluteFill}
            />
          ) : isWeb ? (
            <View
              style={[StyleSheet.absoluteFill, { backgroundColor: colors.background }]}
            />
          ) : null,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Chat",
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="bubble.left" tintColor={color} size={22} />
            ) : (
              <Feather name="message-circle" size={22} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "Notebooks",
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="book" tintColor={color} size={22} />
            ) : (
              <Feather name="book-open" size={22} color={color} />
            ),
        }}
      />
    </Tabs>
  );
}

export default function TabLayout() {
  const { isSignedIn, isLoaded, getToken } = useAuth();

  useEffect(() => {
    setAuthTokenGetter(() => getToken());
  }, [getToken]);

  if (!isLoaded) return null;

  if (!isSignedIn) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  if (isLiquidGlassAvailable()) {
    return <NativeTabLayout />;
  }
  return <ClassicTabLayout />;
}
