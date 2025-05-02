/**
 * 標籤頁面佈局設定
 *
 * 本文件設定了應用程式的底部標籤導航，包括:
 * - 四個主要標籤（主頁、錄音庫、探索、設定）
 * - 標籤欄視覺樣式與動效
 * - 針對不同平台(iOS/Android)的顯示優化
 * - 活躍標籤的視覺反饋
 */

import { Tabs } from "expo-router";
import React from "react";
import { Platform, View, StyleSheet } from "react-native";
import { BlurView } from "expo-blur";

import { HapticTab } from "@/components/HapticTab";
import { IconSymbol } from "@/components/ui/IconSymbol";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#3A7BFF",
        tabBarInactiveTintColor: "#94A3B8",
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: {
          position: "absolute",
          height: Platform.OS === "ios" ? 88 : 70,
          borderTopWidth: 0,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 5,
          backgroundColor: Platform.OS === "ios" ? "transparent" : "rgba(255, 255, 255, 0.95)",
        },
        tabBarItemStyle: {
          paddingVertical: 6,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
          marginTop: 4,
          marginBottom: Platform.OS === "ios" ? 10 : 0,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "主頁",
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIconContainer : null}>
              <IconSymbol size={24} name={focused ? "house.fill" : "house"} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="recordings"
        options={{
          title: "錄音庫",
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIconContainer : null}>
              <IconSymbol size={24} name={focused ? "mic.fill" : "mic"} color={color} />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: "設定",
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIconContainer : null}>
              <IconSymbol size={24} name={focused ? "gearshape.fill" : "gearshape"} color={color} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  activeIconContainer: {
    backgroundColor: "rgba(58, 123, 255, 0.15)",
    borderRadius: 12,
    padding: 6,
  },
});
