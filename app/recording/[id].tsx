/**
 * 錄音詳情頁面路由重定向
 *
 * 此文件將用戶從舊路徑 /recording/[id] 重定向到新路徑 /recording/details/[id]
 */

import { useEffect } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { ThemedText } from "@/components/ThemedText";

export default function RecordingRedirect() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const recordingId = typeof id === "string" ? id : "1";

  useEffect(() => {
    // 立即重定向到新的詳情頁面路徑
    router.replace(`/recording/details/${recordingId}`);
  }, [recordingId]);

  // 顯示一個過渡加載畫面
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" color="#3A7BFF" />
      <ThemedText style={{ marginTop: 16 }}>正在加載錄音詳情...</ThemedText>
    </View>
  );
}
