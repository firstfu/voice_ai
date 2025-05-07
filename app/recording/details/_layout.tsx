/**
 * 錄音詳情頁面佈局
 *
 * 本佈局用於錄音詳情頁面，設定導航結構和標題欄行為
 * 因為詳情頁面有自定義標題欄，所以這裡禁用系統標題欄
 */

import { Stack } from "expo-router";
import { StyleSheet } from "react-native";

export default function RecordingDetailsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // 禁用系統標題欄，避免與自定義標題欄重複
        headerShadowVisible: false,
        headerStyle: {
          backgroundColor: "#F8F9FA",
        },
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
