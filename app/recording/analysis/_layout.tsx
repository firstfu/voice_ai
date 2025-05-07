/**
 * 錄音分析功能佈局文件
 *
 * 本文件定義了錄音分析功能的導航結構和UI佈局。
 * 使用Tabs導航將分析功能分為兩個主要部分：
 * 1. 分析頁面 - 顯示AI分析的結果，包括摘要、關鍵詞、主題分類等
 * 2. AI問答頁面 - 提供基於錄音內容的對話式AI問答功能
 *
 * 此佈局使用AnalysisProvider包裝，提供分析相關的上下文給所有子組件
 */

import { Tabs } from "expo-router";
import { StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AnalysisProvider } from "@/contexts/AnalysisContext";

export default function AnalysisLayout() {
  return (
    <AnalysisProvider>
      <Tabs
        screenOptions={{
          headerShown: true,
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: "#F8F9FA",
          },
          tabBarActiveTintColor: "#3A7BFF",
          tabBarInactiveTintColor: "#9CA3AF",
          tabBarStyle: {
            borderTopWidth: 1,
            borderTopColor: "#F0F2F5",
            backgroundColor: "white",
          },
          headerTitleStyle: {
            fontWeight: "600",
          },
          headerTitle: "AI 內容分析",
        }}
      >
        <Tabs.Screen
          name="[id]"
          options={{
            title: "分析",
            tabBarIcon: ({ color, size }) => <Ionicons name="analytics-outline" size={size} color={color} />,
          }}
        />

        <Tabs.Screen
          name="chat/[id]"
          options={{
            title: "AI問答",
            tabBarIcon: ({ color, size }) => <Ionicons name="chatbubble-ellipses-outline" size={size} color={color} />,
          }}
        />
      </Tabs>
    </AnalysisProvider>
  );
}

const styles = StyleSheet.create({
  toolbar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#F0F2F5",
  },
  toolbarButton: {
    alignItems: "center",
    paddingHorizontal: 12,
  },
  toolbarButtonText: {
    fontSize: 12,
    marginTop: 4,
    color: "#3A7BFF",
  },
});
