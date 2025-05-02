import { Stack } from "expo-router";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { useEffect, useState } from "react";
import { useLocalSearchParams, usePathname, useRouter } from "expo-router";

export default function AnalysisLayout() {
  const pathname = usePathname();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [isDetailsPage, setIsDetailsPage] = useState(false);

  useEffect(() => {
    // 檢查當前頁面是否為 [id] 頁面
    setIsDetailsPage(pathname.includes("/recording/analysis/") && !!id);
  }, [pathname, id]);

  const handleRefreshAnalysis = () => {
    // 重新分析，這裡需要透過 [id].tsx 元件中的處理邏輯來實現
    // 可以透過全局狀態管理或事件系統來實現跨元件通信
    const event = new CustomEvent("refreshAnalysis", { detail: { id } });
    document.dispatchEvent(event);
  };

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: true, // 顯示系統標題欄
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: "#F8F9FA",
          },
        }}
      />

      {isDetailsPage && (
        <View style={styles.toolbar}>
          <TouchableOpacity style={styles.toolbarButton} onPress={handleRefreshAnalysis}>
            <Ionicons name="refresh-outline" size={24} color="#3A7BFF" />
            <ThemedText style={styles.toolbarButtonText}>重新分析</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity style={styles.toolbarButton}>
            <Ionicons name="save-outline" size={24} color="#3A7BFF" />
            <ThemedText style={styles.toolbarButtonText}>匯出報告</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity style={styles.toolbarButton}>
            <Ionicons name="share-social-outline" size={24} color="#3A7BFF" />
            <ThemedText style={styles.toolbarButtonText}>分享</ThemedText>
          </TouchableOpacity>
        </View>
      )}
    </>
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
