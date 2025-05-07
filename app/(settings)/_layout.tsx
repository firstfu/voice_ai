/**
 * 設定頁面導航佈局
 *
 * 這個文件為設定相關頁面提供統一的 Stack 導航佈局。
 */

import { Stack } from "expo-router";

export default function SettingsLayout() {
  return (
    <Stack>
      <Stack.Screen name="about" options={{ headerShown: false }} />
      <Stack.Screen name="audio-settings" options={{ headerShown: false }} />
      <Stack.Screen name="dev-tools" options={{ headerShown: false }} />
      <Stack.Screen name="help" options={{ headerShown: false }} />
      <Stack.Screen name="legal" options={{ headerShown: false }} />
    </Stack>
  );
}
