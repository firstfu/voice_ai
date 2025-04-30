import { Stack } from "expo-router";

export default function AnalysisLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true, // 顯示系統標題欄
        headerShadowVisible: false,
        headerStyle: {
          backgroundColor: "#F8F9FA",
        },
      }}
    />
  );
}
